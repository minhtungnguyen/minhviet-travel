-- 0002_public_content_policies.sql
-- Purpose: RLS for tables the public website reads directly (master-prompt
-- §12: "Public website content must only expose: Published, Active,
-- Correct website, Correct locale, Non-deleted records"). Every table
-- below has RLS enabled and an explicit anon-safe SELECT policy; write
-- access always requires a specific permission key (master-prompt §8.3
-- convention), never just "authenticated".

-- websites ---------------------------------------------------------------
alter table websites enable row level security;

create policy "public_read_active_websites" on websites
  for select
  to anon, authenticated
  using (status = 'ACTIVE' and deleted_at is null);

create policy "staff_read_all_websites" on websites
  for select to authenticated
  using (auth_has_permission('settings.website.read') or id in (select auth_user_website_ids()));

create policy "staff_write_websites" on websites
  for all to authenticated
  using (auth_has_permission('settings.website.update'))
  with check (auth_has_permission('settings.website.update'));

-- cms_pages / cms_page_versions / cms_sections / cms_blocks --------------
alter table cms_pages enable row level security;
alter table cms_page_versions enable row level security;
alter table cms_sections enable row level security;
alter table cms_blocks enable row level security;

create policy "public_read_pages_with_published_version" on cms_pages
  for select to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from cms_page_versions v
      where v.page_id = cms_pages.id and v.is_current and v.status = 'PUBLISHED'
    )
  );

create policy "staff_read_all_pages" on cms_pages
  for select to authenticated
  using (auth_has_permission('cms.page.read'));

create policy "staff_write_pages" on cms_pages
  for all to authenticated
  using (auth_has_permission('cms.page.create') or auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.create') or auth_has_permission('cms.page.update'));

create policy "public_read_published_versions" on cms_page_versions
  for select to anon, authenticated
  using (is_current and status = 'PUBLISHED');

create policy "staff_read_all_versions" on cms_page_versions
  for select to authenticated
  using (auth_has_permission('cms.page.read'));

create policy "staff_write_versions" on cms_page_versions
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));

create policy "staff_publish_versions" on cms_page_versions
  for update to authenticated
  using (auth_has_permission('cms.page.publish'))
  with check (auth_has_permission('cms.page.publish'));

create policy "public_read_sections_of_published_versions" on cms_sections
  for select to anon, authenticated
  using (exists (
    select 1 from cms_page_versions v
    where v.id = cms_sections.page_version_id and v.is_current and v.status = 'PUBLISHED'
  ));

create policy "staff_write_sections" on cms_sections
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));

create policy "public_read_blocks_of_published_versions" on cms_blocks
  for select to anon, authenticated
  using (exists (
    select 1 from cms_sections s
    join cms_page_versions v on v.id = s.page_version_id
    where s.id = cms_blocks.section_id and v.is_current and v.status = 'PUBLISHED'
  ));

create policy "staff_write_blocks" on cms_blocks
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));

-- cms_block_definitions: the 20 block types — schema metadata, not
-- sensitive, needed by the public renderer to know how to interpret
-- cms_blocks.config -------------------------------------------------------
alter table cms_block_definitions enable row level security;

create policy "public_read_active_block_definitions" on cms_block_definitions
  for select to anon, authenticated using (status = 'ACTIVE');
create policy "staff_write_block_definitions" on cms_block_definitions
  for all to authenticated
  using (auth_has_permission('cms.template.manage'))
  with check (auth_has_permission('cms.template.manage'));

-- navigation ---------------------------------------------------------------
alter table navigation_menus enable row level security;
alter table navigation_items enable row level security;

create policy "public_read_active_menus" on navigation_menus
  for select to anon, authenticated
  using (status = 'ACTIVE');

create policy "staff_write_menus" on navigation_menus
  for all to authenticated
  using (auth_has_permission('cms.navigation.update'))
  with check (auth_has_permission('cms.navigation.update'));

create policy "public_read_active_items" on navigation_items
  for select to anon, authenticated
  using (status = 'ACTIVE');

create policy "staff_write_items" on navigation_items
  for all to authenticated
  using (auth_has_permission('cms.navigation.update'))
  with check (auth_has_permission('cms.navigation.update'));

-- faqs -----------------------------------------------------------------
alter table faq_categories enable row level security;
alter table faqs enable row level security;

create policy "public_read_active_faq_categories" on faq_categories
  for select to anon, authenticated using (status = 'ACTIVE');
create policy "staff_write_faq_categories" on faq_categories
  for all to authenticated
  using (auth_has_permission('cms.faq.update')) with check (auth_has_permission('cms.faq.update'));

create policy "public_read_active_faqs" on faqs
  for select to anon, authenticated using (status = 'ACTIVE');
create policy "staff_write_faqs" on faqs
  for all to authenticated
  using (auth_has_permission('cms.faq.update')) with check (auth_has_permission('cms.faq.update'));

-- announcements ----------------------------------------------------------
alter table announcements enable row level security;

create policy "public_read_live_announcements" on announcements
  for select to anon, authenticated
  using (status = 'ACTIVE' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
create policy "staff_write_announcements" on announcements
  for all to authenticated
  using (auth_has_permission('cms.announcement.update'))
  with check (auth_has_permission('cms.announcement.update'));

-- seo_metadata -------------------------------------------------------------
alter table seo_metadata enable row level security;

create policy "public_read_seo_metadata" on seo_metadata
  for select to anon, authenticated using (true);
create policy "staff_write_seo_metadata" on seo_metadata
  for all to authenticated
  using (auth_has_permission('seo.metadata.update'))
  with check (auth_has_permission('seo.metadata.update'));

-- destinations ---------------------------------------------------------
alter table destinations enable row level security;
alter table destination_translations enable row level security;

create policy "public_read_active_destinations" on destinations
  for select to anon, authenticated using (status = 'ACTIVE' and deleted_at is null);
create policy "staff_write_destinations" on destinations
  for all to authenticated
  using (auth_has_permission('master_data.destination.update'))
  with check (auth_has_permission('master_data.destination.update'));

create policy "public_read_destination_translations" on destination_translations
  for select to anon, authenticated
  using (exists (
    select 1 from destinations d where d.id = destination_translations.destination_id
    and d.status = 'ACTIVE' and d.deleted_at is null
  ));
create policy "staff_write_destination_translations" on destination_translations
  for all to authenticated
  using (auth_has_permission('master_data.destination.update'))
  with check (auth_has_permission('master_data.destination.update'));

-- forms: the catalog is public (needed to render a form); submissions
-- are not (see 0003_internal_tables_policies.sql for why) -----------------
alter table forms enable row level security;

create policy "public_read_active_forms" on forms
  for select to anon, authenticated using (status = 'ACTIVE');
create policy "staff_write_forms" on forms
  for all to authenticated
  using (auth_has_permission('forms.definition.manage'))
  with check (auth_has_permission('forms.definition.manage'));

-- media_assets: only the PUBLIC-visibility subset is anon-readable ------
alter table media_assets enable row level security;

create policy "public_read_public_media" on media_assets
  for select to anon, authenticated
  using (visibility = 'PUBLIC' and deleted_at is null);
create policy "staff_read_all_media" on media_assets
  for select to authenticated using (auth_has_permission('media.asset.read'));
create policy "staff_write_media" on media_assets
  for all to authenticated
  using (auth_has_permission('media.asset.upload'))
  with check (auth_has_permission('media.asset.upload'));
