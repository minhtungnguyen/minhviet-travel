# Future Travel Domains — What Sprint 2+ Builds On Top

Per hybrid scope decision (`sprint-1-implementation-plan.md` §1.3): CRM and Booking Request are Volume 00 P0 go-live blockers and are the first things Sprint 2 should build, reusing Sprint 1's Forms Foundation as their intake mechanism rather than each future domain inventing its own submission path.

Several rows below reuse a module that Sprint 1A.2 deferred entirely (`notifications`, the `integrations` registry) or a master-data table that was dropped from the Sprint 1B migration set (`supplier_types`, `units_of_measure`, `tax_categories`) or a CMS/SEO extra that was removed (`reusable_content_blocks`, `sitemap_entries`) — see `docs/backend/sprint-1a2-reduction-report.md`. Each returns via its own migration when the domain that needs it actually starts; it is not active schema today.

| Future domain | Reuses from Sprint 1 |
|---|---|
| **CRM** (Sprint 2) | `form_submissions` (source data — a lead is created from a submission), `departments`/`user_profiles` (assignment), `audit` (status-change history), `master_data.customer_types`; brings back `notifications` (new-lead alert) as part of its own migration |
| **Booking Request** (Sprint 2) | `form_submissions` (the request itself is a specialized submission type), CRM's lead (once it exists), `master_data.product_types` |
| **Product Core** (Tour/Hotel/Cruise/Attraction Ticket/Combo/Visa/Insurance/MICE/Event) | `master_data.product_types`/`destinations`, `media` (product images), `seo` (`seo_metadata.entity_type = 'tour'` etc. — the polymorphic design in `0012_seo.sql` was chosen exactly so this needs zero migration); brings back `units_of_measure`/`tax_categories` (deferred to Pricing, below) and re-evaluates whether `reusable_content_blocks` (removed) is actually needed once real product marketing pages exist |
| **Flight** | `organization.websites` (`vemaybay.minhviettravel.com`, already seeded as `PLANNED`), `integrations/flight/contracts/flight-provider.ts`, `access-control`, `audit`; brings back `notifications` |
| **Attraction Ticket** | `integrations/attraction-ticket/contracts/attraction-ticket-provider.ts`, Product Core, `media` |
| **Supplier** | Product Core; brings back a `supplier_types` master-data table and the `integrations` registry (a supplier's own API becomes a provider row) |
| **Pricing / Quotation** | Product Core, `currencies`; brings back `tax_categories`/`units_of_measure` |
| **Payment** | Booking; brings back the `integrations` registry with a `PAYMENT_GATEWAY` provider row |
| **Operation** | Booking, Supplier, `departments` |
| **Marketing** | `forms` (campaign forms), `cms` (landing pages), `seo`, future CRM (lead source attribution — `form_submissions.utm_*` columns already capture this) |
| **SEO Center** | Directly extends `seo_metadata`/`redirect_rules`/`slug_history` — no new tables anticipated, just an admin UI over what Sprint 1 already built (a DB-driven sitemap/robots layer, if ever justified, is a deliberate re-introduction of `sitemap_entries`/`robots_rules`, not a default) |
| **AI Content Factory** | `cms` (drafts land as `cms_page_versions` in `DRAFT` status), `integrations/ai/contracts/ai-import-provider.ts` |
| **AI Import Engine** | `integrations/ai/contracts/ai-import-provider.ts`, Product Core (drafts eventually publish into it), `audit` (import audit trail) |

Nothing in this table is implemented. It exists so a Sprint 2 planning pass doesn't have to re-derive which Sprint 1 foundation pieces are relevant to which future domain — master-prompt §36 principle 16: "Future modules must extend the platform rather than rewrite it."
