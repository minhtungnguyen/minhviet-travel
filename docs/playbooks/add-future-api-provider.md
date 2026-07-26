# Playbook: Add a Future API Provider (Flight / Attraction Ticket / Email / AI)

The Integration Registry module (`integration_providers`/`integration_connections`/`integration_webhook_endpoints`/`integration_sync_logs`) was deferred entirely in Sprint 1A.2 — no such tables exist in the current schema (`docs/backend/sprint-1a2-reduction-report.md` §6). This playbook covers both what's possible **today** (without the registry) and what changes **once it returns**.

## Today (no registry table exists)

1. Write a class implementing the relevant contract in `integrations/<domain>/contracts/`:
   - Flight → `FlightProvider` (`integrations/flight/contracts/flight-provider.ts`)
   - Attraction ticket → `AttractionTicketProvider` (`integrations/attraction-ticket/contracts/attraction-ticket-provider.ts`)
   - Email → `EmailProvider` (`integrations/email/contracts/email-provider.ts` — `ConsoleEmailProvider` is the only existing implementation, for local dev)
   - AI Import → `AiImportProvider` (`integrations/ai/contracts/ai-import-provider.ts`)
   Put the real implementation in a sibling `providers/` folder (e.g. `integrations/email/providers/resend-provider.ts`), never modify the contract file to fit one provider's quirks — if the contract doesn't fit, that's a sign the interface needs revisiting for every implementer, not a one-off workaround.
2. Store the real credential in an environment variable (Vercel env var / `.env.local`), never in a database column (`docs/security/secret-management.md`).
3. Inject the concrete provider directly into the consuming module's service via its constructor (same dependency-injection pattern as `OrganizationService(repository)`) — no registry lookup needed since there's no registry table yet.
4. If the provider needs to receive webhooks, add a route handler under `/api/v1/integrations/<provider>/webhook` directly (no `integration_webhook_endpoints` row to back it — verify the request signature/secret against the env var in code).

## Once the registry returns (first real, multi-connection integration)

When more than one live connection needs to be tracked/toggled/monitored through an admin UI rather than hardcoded per environment, re-introduce the registry with its own migration (the design in `docs/backend/sprint-1a-architecture-review.md` §1 is the reference to restore from — `integration_providers`, `integration_connections` with a `secret_ref` pointer column, `integration_webhook_endpoints`, `integration_sync_logs`), then:

1. Add a row to `integration_providers` for the provider's `key`.
2. Create an `integration_connections` row scoped to the organization/website that will use it, `secret_ref` pointing at the environment variable holding the real credential — never the credential itself.
3. Move the webhook route's verification to look up its secret via the matching `integration_webhook_endpoints` row instead of a hardcoded env var name.
4. Log every sync attempt to `integration_sync_logs` (`sync_type`, `status`, `records_processed`, `error_message`).

No schema change is needed for a new provider of an already-modeled category (flight, ticket, email, AI) — only a new contract-conforming class. A genuinely new category (e.g. a payment gateway) needs a new contract file under `integrations/<new-domain>/contracts/`, following the same shape as the four that already exist.
