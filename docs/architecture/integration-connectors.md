# Integration Connector Architecture

Per master-prompt §9: interfaces and extension points only, no provider implementation, in Sprint 1. Folders:

```
integrations/
  flight/contracts/flight-provider.ts               FlightProvider interface
  attraction-ticket/contracts/attraction-ticket-provider.ts   AttractionTicketProvider interface
  email/contracts/email-provider.ts                 EmailProvider interface + ConsoleEmailProvider (dev-only, real)
  ai/contracts/ai-import-provider.ts                AiImportProvider interface (parse/normalize stages only)
```

Every one of these is a TypeScript interface (plus, for email, one trivial console-logging implementation) — no HTTP calls, no SDKs, no environment variables. A real adapter (`ZaloOAEmailProvider`, `BaoGiaTranFlightProvider`, ...) is a later sprint's work, and it must satisfy the interface already defined here, not invent its own shape.

## How a connection surfaces once real

The Integration Registry module (`integration_providers`/`integration_connections`/`integration_webhook_endpoints`/`integration_sync_logs`) was deferred entirely in Sprint 1A.2 — no such tables exist in the current migration set (`docs/backend/sprint-1a2-reduction-report.md` §6). It returns, together with its own migration, when the first real integration is actually built:

1. A migration re-creates `integration_providers`/`integration_connections` (the old design in `docs/backend/sprint-1a-architecture-review.md` is the reference to restore from) and a row is added for the new provider's key.
2. An `integration_connections` row is created scoped to an organization/website, `secret_ref` pointing at wherever the real secret lives (Vercel env var name, or a secret manager key) — never the secret itself (`docs/security/secret-management.md`).
3. The module that needs the provider (e.g. `forms` needing `EmailProvider` to send a notification) is handed a concrete implementation via constructor injection — same pattern as `modules/organization/application/organization.service.ts` takes an `OrganizationRepository`.

Until then, a provider implementation (e.g. `ConsoleEmailProvider` below) is simply instantiated directly by whatever module needs it — no registry row required for Sprint 1B.

## Flight (master-prompt §9.1)

`FlightProvider`: `search`, `revalidate`, `createReservation`, `retrieveReservation`, `cancelReservation`, `getFareRules`. Future providers: Bảo Gia Trần, airline APIs, aggregators, GDS providers. No flight product tables exist yet (Sprint 2+, see `future-travel-domains.md`) — `vemaybay.minhviettravel.com` is currently a `PLANNED` website record with nothing behind it.

## Attraction tickets (master-prompt §9.2)

`AttractionTicketProvider`: `syncProducts`, `syncVariants`, `searchAvailability`, `revalidatePrice`, `createOrder`, `retrieveVoucher`, `cancelOrder`, `changeUsageDate`, `queryOrderStatus`. Future providers: EZ OneAPI, VinWonders, Sun World, TTC, NovaWorld. `ProviderIdMapping` records the internal-product ↔ provider-product/variant/location/order/voucher id correspondence a future `product_core` domain will persist.

## AI Import (master-prompt §9.3)

`AiImportProvider` only has `parse` and `normalize` — the full pipeline (source uploaded → job created → parsing → normalization → validation → draft generated → human review → approval → entity published) is documented here as a sequence, not built as `import_jobs`/`import_drafts` tables, per master-prompt §4.2/§28 explicitly excluding the AI Import Engine from Sprint 1.

## Email (built earlier than the others, on purpose)

`EmailProvider` already has a real, if trivial, implementation (`ConsoleEmailProvider`) because `modules/forms` (and, once it returns, `notifications`) needs *something* to call even in local development before Resend/Zoho credentials exist — this mirrors how `lib/actions/lead-action.ts` already logs server-side today when `LEADS_WEBHOOK_URL` is unset, rather than silently pretending to succeed.
