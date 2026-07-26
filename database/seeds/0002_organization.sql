-- 0002_organization.sql
-- Fixed UUID literals for the organization/brand/website anchors so
-- later seed files (0004, 0005) can reference the same rows without a
-- cross-file lookup mechanism. These are seed-only ids, never meant to
-- collide with anything gen_random_uuid() would produce in real usage.
--
-- ORG_ID     = 00000000-0000-4000-8000-000000000001
-- BRAND_ID   = 00000000-0000-4000-8000-000000000002
-- WEBSITE_MAIN_ID    = 00000000-0000-4000-8000-000000000003 (minhviettravel.com, ACTIVE)
-- WEBSITE_VEMAYBAY_ID = 00000000-0000-4000-8000-000000000004 (vemaybay.minhviettravel.com, PLANNED)

insert into organizations (
  id, legal_name, display_name, country_code, default_currency_code, default_language_code, default_timezone, status
) values (
  '00000000-0000-4000-8000-000000000001',
  'Công ty Cổ phần Du lịch Minh Việt',
  'Minh Việt Travel',
  'VN', 'VND', 'vi', 'Asia/Ho_Chi_Minh', 'ACTIVE'
)
on conflict (id) do update set display_name = excluded.display_name;

insert into brands (id, organization_id, name, slug, display_name, status) values (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'Minh Việt Travel', 'minh-viet-travel', 'Minh Việt Travel', 'ACTIVE'
)
on conflict (id) do update set display_name = excluded.display_name;

insert into websites (
  id, brand_id, domain, name, website_type, default_locale, default_currency_code, status
) values (
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000002',
  'minhviettravel.com', 'Minh Việt Travel', 'MAIN_SITE', 'vi', 'VND', 'ACTIVE'
)
on conflict (id) do update set status = excluded.status;

insert into websites (
  id, brand_id, domain, subdomain, name, website_type, default_locale, default_currency_code, status
) values (
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000002',
  'vemaybay.minhviettravel.com', 'vemaybay', 'Vé Máy Bay Minh Việt', 'SERVICE_APP', 'vi', 'VND', 'PLANNED'
)
on conflict (id) do update set status = excluded.status;

-- Offices, business units, departments -------------------------------------
insert into offices (id, organization_id, name, city, country_code, is_headquarters, status)
values ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'Trụ sở chính', 'Hà Nội', 'VN', true, 'ACTIVE')
on conflict (id) do update set name = excluded.name;

insert into business_units (id, organization_id, code, name, status) values
  ('00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000001', 'TOUR', 'Tour', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000001', 'MICE', 'MICE', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000001', 'FLIGHT', 'Flight', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000001', 'MARKETING', 'Marketing', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000001', 'OPERATION', 'Operation', 'ACTIVE')
on conflict (id) do update set name = excluded.name;

insert into departments (id, organization_id, business_unit_id, office_id, name, code, status) values
  ('00000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000010', 'Phòng Tour', 'DEPT_TOUR', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000010', 'Phòng MICE', 'DEPT_MICE', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000010', 'Phòng Marketing', 'DEPT_MARKETING', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000010', 'Phòng Vận hành', 'DEPT_OPERATION', 'ACTIVE')
on conflict (id) do update set name = excluded.name;
