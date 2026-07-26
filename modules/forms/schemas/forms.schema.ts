import { z } from 'zod'
import { generalStatusSchema, uuidSchema } from '@/shared/validation/common'

const PAYLOAD_MAX_BYTES = 20_000

export const formCreateSchema = z.object({
  websiteId: uuidSchema,
  key: z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'key must be lowercase, hyphen-separated'),
  name: z.string().min(1).max(200),
}).strict()

export const formUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: generalStatusSchema.optional(),
}).strict()

export const formSubmissionAdminUpdateSchema = z.object({
  status: z.enum(['NEW', 'VALIDATED', 'PROCESSED', 'REJECTED', 'SPAM']),
}).strict()

/**
 * Public submission payload. Deliberately excludes `status`,
 * `organizationId`, `websiteId`, `formId` — all resolved server-side
 * (spec §16: "Public users cannot ... insert organization IDs or
 * website IDs directly", "Website and form must be resolved
 * server-side"). `honeypot` is a hidden field real users never fill in;
 * a non-empty value is treated as spam (see modules/forms/application).
 */
export const publicFormSubmissionSchema = z.object({
  submissionType: z.string().min(1).max(50),
  fullName: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  email: z.string().email().max(200).optional(),
  sourceUrl: z.string().max(1000).optional(),
  sourcePageId: uuidSchema.optional(),
  referrer: z.string().max(1000).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  consentMarketing: z.boolean().default(false),
  consentPrivacy: z.boolean(),
  anonymousSessionId: z.string().max(200).optional(),
  idempotencyKey: z.string().max(200).optional(),
  payload: z
    .record(z.string(), z.unknown())
    .default({})
    .refine((v) => JSON.stringify(v).length <= PAYLOAD_MAX_BYTES, {
      message: `payload exceeds ${PAYLOAD_MAX_BYTES} bytes`,
    }),
  honeypot: z.string().max(500).optional(),
}).strict()

export type FormCreateInput = z.infer<typeof formCreateSchema>
export type FormUpdateInput = z.infer<typeof formUpdateSchema>
export type FormSubmissionAdminUpdateInput = z.infer<typeof formSubmissionAdminUpdateSchema>
export type PublicFormSubmissionInput = z.infer<typeof publicFormSubmissionSchema>
