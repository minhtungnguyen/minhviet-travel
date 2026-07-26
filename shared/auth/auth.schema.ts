import { z } from 'zod'

/**
 * Auth endpoints wrap Supabase Auth directly (no repository/domain
 * layer of their own — there's no local table to own) so their
 * validation schemas live alongside `shared/auth/session.ts` rather than
 * under `modules/`.
 */
export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
}).strict()

export const passwordUpdateSchema = z.object({
  newPassword: z.string().min(8).max(200),
}).strict()

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>
