/**
 * Every outbound-email call in the app goes through this interface, never
 * directly through a provider SDK — master-prompt §9 "Every integration
 * must go through an adapter. Do not call a third-party API directly
 * from a component [or service]." Zoho SMTP / Resend / SES adapters all
 * implement this later; `ConsoleEmailProvider` below is the only
 * implementation that exists in Sprint 1A, used by nothing yet but ready
 * for local development in Sprint 1B before a real provider is wired up.
 */
export type EmailMessage = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ providerMessageId: string }>
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<{ providerMessageId: string }> {
    console.log('[ConsoleEmailProvider] would send email:', message.to, message.subject)
    return { providerMessageId: `console-${Date.now()}` }
  }
}
