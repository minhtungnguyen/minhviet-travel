-- 0005_cms_navigation_forms_seo.sql
-- Uses WEBSITE_MAIN_ID = 00000000-0000-4000-8000-000000000003 from
-- 0002_organization.sql. Order matters: cms_pages before seo_metadata
-- (entity_id references it) before cms_page_versions (seo_metadata_id
-- references that).

insert into cms_block_definitions (key, name, status) values
  ('HERO', 'Hero', 'ACTIVE'),
  ('RICH_TEXT', 'Rich Text', 'ACTIVE'),
  ('IMAGE', 'Image', 'ACTIVE'),
  ('VIDEO', 'Video', 'ACTIVE'),
  ('GALLERY', 'Gallery', 'ACTIVE'),
  ('CARDS', 'Cards', 'ACTIVE'),
  ('PRODUCT_CARDS', 'Product Cards', 'ACTIVE'),
  ('DESTINATION_CARDS', 'Destination Cards', 'ACTIVE'),
  ('TIMELINE', 'Timeline', 'ACTIVE'),
  ('STATISTICS', 'Statistics', 'ACTIVE'),
  ('TESTIMONIALS', 'Testimonials', 'ACTIVE'),
  ('FAQ', 'FAQ', 'ACTIVE'),
  ('CTA', 'Call to Action', 'ACTIVE'),
  ('FORM', 'Form', 'ACTIVE'),
  ('LOGO_GRID', 'Logo Grid', 'ACTIVE'),
  ('CASE_STUDIES', 'Case Studies', 'ACTIVE'),
  ('RELATED_CONTENT', 'Related Content', 'ACTIVE'),
  ('SERVICE_SELECTOR', 'Service Selector', 'ACTIVE'),
  ('SEARCH_PLACEHOLDER', 'Search Placeholder', 'ACTIVE'),
  ('CUSTOM', 'Custom', 'ACTIVE')
on conflict (key) do update set name = excluded.name;

-- Example CMS page: homepage --------------------------------------------
insert into cms_pages (id, website_id, locale, page_type, slug) values
  ('00000000-0000-4000-8000-000000000100', '00000000-0000-4000-8000-000000000003', 'vi', 'HOME', 'home')
on conflict (id) do nothing;

insert into seo_metadata (id, website_id, locale, entity_type, entity_id, title, meta_description, slug, canonical_url) values
  ('00000000-0000-4000-8000-000000000130', '00000000-0000-4000-8000-000000000003', 'vi', 'cms_page',
   '00000000-0000-4000-8000-000000000100',
   'Minh Việt Travel — Du lịch doanh nghiệp & MICE',
   'Minh Việt Travel thiết kế hành trình doanh nghiệp, MICE và tour cao cấp.',
   '', 'https://minhviettravel.com/')
on conflict (id) do update set title = excluded.title;

insert into cms_page_versions (id, page_id, version_number, status, title, seo_metadata_id, is_current, published_at) values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000100', 1, 'PUBLISHED',
   'Trang chủ Minh Việt Travel', '00000000-0000-4000-8000-000000000130', true, now())
on conflict (id) do update set status = excluded.status;

insert into cms_sections (id, page_version_id, section_key, position) values
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000101', 'hero', 1)
on conflict (id) do nothing;

insert into cms_blocks (id, section_id, block_definition_id, position, config)
select '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000102', bd.id, 1,
  '{"headline": "Kiến tạo hành trình doanh nghiệp đẳng cấp"}'::jsonb
from cms_block_definitions bd where bd.key = 'HERO'
on conflict (id) do nothing;

-- Example navigation menu ------------------------------------------------
insert into navigation_menus (id, website_id, key, locale, status) values
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000003', 'HEADER', 'vi', 'ACTIVE')
on conflict (id) do nothing;

insert into navigation_items (id, menu_id, label, cms_page_id, position) values
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000110', 'Trang chủ', '00000000-0000-4000-8000-000000000100', 1)
on conflict (id) do nothing;
insert into navigation_items (id, menu_id, label, url, is_external, position) values
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000110', 'Giới thiệu', '/about', false, 2)
on conflict (id) do nothing;

-- Example form: contact ---------------------------------------------------
-- Sprint 1A.2: the form_definitions/form_versions/form_fields chain was
-- removed (docs/backend/sprint-1a2-reduction-report.md §4) — a form's
-- fields are defined in code (Zod + React), matching the existing
-- pattern in lib/cms/schema.ts. `forms` is now just a minimal catalog
-- row so form_submissions has something real to reference by form_id.
insert into forms (id, website_id, key, name, status) values
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000003', 'contact', 'Liên hệ tư vấn', 'ACTIVE')
on conflict (id) do nothing;
