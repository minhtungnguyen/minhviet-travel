'use server'

import { newsletterSchema } from '@/lib/cms/schema'

export type NewsletterActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string }

export async function subscribeNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { status: 'error', message: 'Email không hợp lệ, vui lòng kiểm tra lại.' }
  }

  const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn(
      '[subscribeNewsletterAction] NEWSLETTER_WEBHOOK_URL is not configured — subscription was only logged server-side.',
      parsed.data,
    )
    return { status: 'success', message: 'Cảm ơn bạn đã đăng ký nhận bản tin.' }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...parsed.data, subscribedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`Newsletter webhook responded with status ${response.status}`)
    }

    return { status: 'success', message: 'Cảm ơn bạn đã đăng ký nhận bản tin.' }
  } catch (error) {
    console.error('[subscribeNewsletterAction] failed to deliver subscription', error)
    return { status: 'error', message: 'Không thể đăng ký lúc này, vui lòng thử lại sau.' }
  }
}
