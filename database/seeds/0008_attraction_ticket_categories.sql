-- 0008_attraction_ticket_categories.sql
-- Purpose: (1) the attraction_ticket.category.write permission referenced
-- by database/policies/0006_attraction_ticket_categories_policies.sql,
-- upsert-safe same as 0006_attraction_ticket.sql; (2) the 6 category
-- taxonomy rows locked in docs/design/mv-ticket/01-design-direction.md
-- §5.2, seeded against the real website_id/product ids already in
-- 0007_attraction_ticket_demo.sql; (3) product-category assignments for
-- the 5 demo products that already exist, based on their actual seeded
-- content (not guessed).

insert into permissions (key, module, action, description) values
  ('attraction_ticket.category.write', 'attraction_ticket', 'update', 'Create/edit attraction ticket category taxonomy')
on conflict (key) do update set description = excluded.description;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.key in ('MANAGER', 'MARKETING') and p.key = 'attraction_ticket.category.write'
on conflict do nothing;

do $$
declare
  v_website_id uuid := '00000000-0000-4000-8000-000000000003';
  v_cat_water_park uuid;
  v_cat_cable_car uuid;
  v_cat_show uuid;
  v_cat_safari uuid;
  v_cat_indoor uuid;
  v_cat_family uuid;
begin
  insert into attraction_categories (website_id, slug, icon_key, sort_order) values
    (v_website_id, 'cong-vien-nuoc', 'waves', 1) returning id into v_cat_water_park;
  insert into attraction_category_translations (attraction_category_id, locale, name)
    values (v_cat_water_park, 'vi', 'Công viên nước');

  insert into attraction_categories (website_id, slug, icon_key, sort_order) values
    (v_website_id, 'cap-treo', 'cable-car', 2) returning id into v_cat_cable_car;
  insert into attraction_category_translations (attraction_category_id, locale, name)
    values (v_cat_cable_car, 'vi', 'Cáp treo');

  insert into attraction_categories (website_id, slug, icon_key, sort_order) values
    (v_website_id, 'show-dien', 'sparkles', 3) returning id into v_cat_show;
  insert into attraction_category_translations (attraction_category_id, locale, name)
    values (v_cat_show, 'vi', 'Show diễn');

  insert into attraction_categories (website_id, slug, icon_key, sort_order) values
    (v_website_id, 'safari-thu', 'paw-print', 4) returning id into v_cat_safari;
  insert into attraction_category_translations (attraction_category_id, locale, name)
    values (v_cat_safari, 'vi', 'Safari & Thú');

  insert into attraction_categories (website_id, slug, icon_key, sort_order) values
    (v_website_id, 'vui-choi-trong-nha', 'gamepad-2', 5) returning id into v_cat_indoor;
  insert into attraction_category_translations (attraction_category_id, locale, name)
    values (v_cat_indoor, 'vi', 'Vui chơi trong nhà');

  insert into attraction_categories (website_id, slug, icon_key, sort_order) values
    (v_website_id, 'gia-dinh-tre-em', 'users', 6) returning id into v_cat_family;
  insert into attraction_category_translations (attraction_category_id, locale, name)
    values (v_cat_family, 'vi', 'Gia đình & Trẻ em');

  -- Product-category assignments — based on each product's real seeded
  -- title/summary/description in 0007_attraction_ticket_demo.sql, not
  -- guessed. "Vé Du Thuyền Tham Quan Vịnh Hạ Long" is intentionally left
  -- uncategorized: its content (day-trip, business-traveler-friendly) does
  -- not clearly fit any of the 6 categories, and the join table is
  -- optional many-to-many — leaving it empty is correct, not a gap to fill.
  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select p.id, v_cat_cable_car from attraction_products p where p.slug = 've-cap-treo-nu-hoang-ha-long';

  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select p.id, v_cat_water_park from attraction_products p where p.slug = 've-cong-vien-nuoc-typhoon-ha-long';

  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select p.id, v_cat_cable_car from attraction_products p where p.slug = 've-cap-treo-cat-hai-cat-ba';

  -- Vinpearl Cát Bà: "công viên nước, khu safari bán hoang dã và bãi biển
  -- riêng ... phù hợp cho một ngày vui chơi trọn vẹn cùng gia đình" — genuinely
  -- spans 3 categories per its own seeded description, not over-tagged.
  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select p.id, cat.id from attraction_products p
  cross join lateral (values (v_cat_water_park), (v_cat_safari), (v_cat_family)) as cat(id)
  where p.slug = 've-vui-choi-vinpearl-cat-ba';
end $$;
