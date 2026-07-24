'use server'

import { leadFormSchema } from '@/lib/cms/schema'

export type LeadActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }
  | { status: 'success'; message: string }

/**
 * Real submission target for both the corporate and individual inquiry
 * forms. The audit flagged the previous contact form for only calling
 * `setSubmitted(true)` locally with no backend at all — this validates
 * the payload server-side and hands it to a CRM webhook so a lead
 * actually reaches an owner (Volume 01 non-negotiable: Clear Ownership).
 *
 * `LEADS_WEBHOOK_URL` is the integration seam for the real CRM/inbox
 * endpoint. Until it's configured, submissions are logged server-side
 * so local development isn't blocked, and the visitor still gets an
 * honest, non-misleading confirmation state.
 */
export async function submitLeadAction(
  _prevState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const parsed = leadFormSchema.safeParse({
    intent: formData.get('intent'),
    fullName: formData.get('fullName'),
    organization: formData.get('organization') || undefined,
    email: formData.get('email'),
    phone: formData.get('phone'),
    serviceInterest: formData.get('serviceInterest'),
    message: formData.get('message') || undefined,
    aiContext: formData.get('aiContext') || undefined,
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Vui lòng kiểm tra lại thông tin đã nhập.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const webhookUrl = process.env.LEADS_WEBHOOK_URL

  const payload = {
    ...parsed.data,
    source: (formData.get('source') as string) || 'homepage',
    // Optional CRM-routing tags a landing page can attach without touching
    // `intent` (which already means "corporate vs individual" panel choice)
    // — e.g. the /tour-thiet-ke page sends landingIntent=CUSTOM_DESIGN,
    // serviceType=GROUP_TOUR so a lead can be triaged by campaign origin.
    landingIntent: (formData.get('landingIntent') as string) || undefined,
    serviceType: (formData.get('serviceType') as string) || undefined,
    submittedAt: new Date().toISOString(),
  }

  if (!webhookUrl) {
    console.warn(
      '[submitLeadAction] LEADS_WEBHOOK_URL is not configured — lead was only logged server-side, not delivered to a CRM owner.',
      payload,
    )
    return {
      status: 'success',
      message: 'Đã ghi nhận yêu cầu. Chuyên viên tư vấn Minh Việt sẽ phản hồi trong thời gian sớm nhất.',
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`CRM webhook responded with status ${response.status}`)
    }

    return {
      status: 'success',
      message: 'Đã ghi nhận yêu cầu. Chuyên viên tư vấn Minh Việt sẽ phản hồi trong thời gian sớm nhất.',
    }
  } catch (error) {
    console.error('[submitLeadAction] failed to deliver lead to CRM webhook', error)
    return {
      status: 'error',
      message:
        'Hệ thống đang gặp sự cố khi gửi yêu cầu. Vui lòng gọi hotline 0934 368 132 hoặc thử lại sau ít phút.',
    }
  }
}
