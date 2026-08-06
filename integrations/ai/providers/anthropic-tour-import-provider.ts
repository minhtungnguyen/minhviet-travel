import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'
import { getAnthropicEnv } from '@/shared/env'
import { AppError } from '@/shared/errors/app-error'
import type { AiImportProvider, NormalizedImportDraft } from '@/integrations/ai/contracts/ai-import-provider'
import { tourImportDraftDataSchema, type TourImportDraftData } from '@/modules/ai-import/schemas/ai-import.schema'

const DOCX_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const MODEL = 'claude-sonnet-4-5'

const TOUR_DRAFT_TOOL_NAME = 'record_tour_draft'
const TOUR_DRAFT_TOOL_SCHEMA = {
  name: TOUR_DRAFT_TOOL_NAME,
  description: 'Records the structured Tour draft extracted from a tour itinerary document.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'The tour name/title, in Vietnamese.' },
      country: { type: 'string', description: 'Destination country or region shown to travelers, e.g. "Nhật Bản".' },
      departureCity: { type: 'string', description: 'Departure city, e.g. "Hà Nội".' },
      body: { type: 'string', description: 'A short 1-3 sentence overview/summary of the tour, in Vietnamese.' },
      itinerary: {
        type: 'array',
        description: 'Day-by-day itinerary, in order.',
        items: {
          type: 'object',
          properties: {
            day: { type: 'integer' },
            title: { type: 'string', description: 'Short title for the day, e.g. "Hà Nội – Tokyo".' },
            description: { type: 'string', description: 'What happens that day.' },
          },
          required: ['day', 'title', 'description'],
        },
      },
      inclusions: { type: 'array', items: { type: 'string' }, description: 'What the price includes.' },
      exclusions: { type: 'array', items: { type: 'string' }, description: 'What the price excludes.' },
      cancellationNote: { type: 'string', description: 'Any tour-specific cancellation/refund note, if the document states one.' },
      suggestedCategoryName: { type: 'string', description: 'A best-guess category label for this tour, e.g. "Tour Châu Á".' },
    },
    required: [],
  },
}

/** Required for a draft to be Approve-able — checked after schema parsing, not part of the schema itself (a partially-extracted doc is still a valid, savable draft). */
function computeValidationErrors(data: TourImportDraftData): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = []
  if (!data.title) errors.push({ field: 'title', message: 'Không tìm thấy tên tour trong tài liệu — cần nhập thủ công.' })
  if (!data.itinerary || data.itinerary.length === 0) {
    errors.push({ field: 'itinerary', message: 'Không tìm thấy lịch trình theo ngày — cần nhập thủ công.' })
  }
  if (!data.body) errors.push({ field: 'body', message: 'Không tìm thấy mô tả tổng quan — nên bổ sung trước khi xuất bản.' })
  return errors
}

/**
 * MVP AI Import provider (Sprint 7 Phase 7 — confirmed scope: Word input,
 * Anthropic-only, Tour entity only). Implements the pipeline contract from
 * integrations/ai/contracts/ai-import-provider.ts: `parse()` extracts raw
 * text from a .docx via `mammoth` (no OCR/PDF/Excel — out of scope this
 * sprint), `normalize()` asks Claude to structure that text into a Tour
 * draft via forced tool-use (so the model must return the exact shape,
 * not free-form prose), then validates it against
 * `tourImportDraftDataSchema` before handing back to the caller.
 */
export class AnthropicTourImportProvider implements AiImportProvider {
  async parse(sourceFileUrl: string, mimeType: string): Promise<{ rawContent: Record<string, unknown> }> {
    if (!DOCX_MIME_TYPES.has(mimeType)) {
      throw AppError.validation(`Định dạng tệp không được hỗ trợ (${mimeType}) — AI Import hiện chỉ hỗ trợ tệp Word (.docx).`)
    }
    const response = await fetch(sourceFileUrl)
    if (!response.ok) throw new AppError('INTERNAL_ERROR', 'Không thể tải tệp nguồn để phân tích.')
    const arrayBuffer = await response.arrayBuffer()
    const { value: text } = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })
    if (!text.trim()) throw AppError.validation('Tài liệu không có nội dung văn bản để phân tích.')
    return { rawContent: { text } }
  }

  async normalize(rawContent: Record<string, unknown>, entityType: string): Promise<NormalizedImportDraft> {
    if (entityType !== 'tour') {
      throw AppError.validation(`AI Import chưa hỗ trợ loại nội dung "${entityType}".`)
    }
    const text = String(rawContent.text ?? '')
    const { ANTHROPIC_API_KEY } = getAnthropicEnv()
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      tools: [TOUR_DRAFT_TOOL_SCHEMA],
      tool_choice: { type: 'tool', name: TOUR_DRAFT_TOOL_NAME },
      messages: [
        {
          role: 'user',
          content: `Đây là nội dung trích xuất từ một tài liệu chương trình tour du lịch (tiếng Việt). Hãy trích xuất thông tin có thật trong tài liệu vào công cụ record_tour_draft — không bịa thêm thông tin không có trong tài liệu, để trống trường nào không tìm thấy.\n\n---\n${text}\n---`,
        },
      ],
    })

    const toolUse = message.content.find((block) => block.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new AppError('INTERNAL_ERROR', 'AI không trả về dữ liệu có cấu trúc — vui lòng thử lại.')
    }

    const parsed = tourImportDraftDataSchema.safeParse(toolUse.input)
    const data = parsed.success ? parsed.data : {}
    const schemaErrors = parsed.success
      ? []
      : parsed.error.issues.map((issue) => ({ field: issue.path.join('.') || '(root)', message: issue.message }))

    return {
      entityType: 'tour',
      data,
      validationErrors: [...schemaErrors, ...computeValidationErrors(data)],
    }
  }
}
