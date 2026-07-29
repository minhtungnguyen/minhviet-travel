-- 0005_attraction_provider_ref_public_read.sql
-- Purpose: fix a Phase 1 RLS over-restriction found during Phase 2 browser
-- verification. `attraction_provider_refs` was staff-only
-- (0004_attraction_ticket_policies.sql), but the public product detail
-- page needs to read a product's `provider_product_id` (via
-- AttractionCatalogService#listProductVariantOptions) to discover its
-- ticket-type options for an anonymous visitor — there is no staff
-- session on that page. This isn't a new sensitivity concession:
-- `provider_variant_id` values already ship to the browser as props (the
-- booking panel needs them to call the availability/checkout APIs), so
-- gating the read of the same ids server-side achieved nothing except
-- breaking the feature. Scoped to refs whose product/venue is ACTIVE,
-- mirroring every other public-read policy's "only published rows" shape.

create policy "public_read_attraction_provider_refs_for_published" on attraction_provider_refs
  for select to anon, authenticated
  using (
    (attraction_product_id is not null and exists (
      select 1 from attraction_products p where p.id = attraction_provider_refs.attraction_product_id
      and p.status = 'ACTIVE' and p.deleted_at is null
    ))
    or
    (attraction_venue_id is not null and exists (
      select 1 from attraction_venues v where v.id = attraction_provider_refs.attraction_venue_id
      and v.status = 'ACTIVE' and v.deleted_at is null
    ))
  );
