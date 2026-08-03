-- 0013_footer_navigation.sql
-- Purpose: Sprint 2 ("Footer management") — a FOOTER navigation_menu
-- didn't exist yet (only HEADER was seeded); components/site/site-footer.tsx
-- had its 3 link columns, address and social hrefs 100% hardcoded. No
-- schema change — navigation_menus/navigation_items already supported
-- 'FOOTER' as a first-class NavigationMenuKey value, and the existing
-- parent/child item structure models "column heading + links" directly
-- (a heading item has url=null and children carry the real hrefs).
do $$
declare
  v_menu_id uuid;
  v_col_id uuid;
begin
  insert into navigation_menus (website_id, key, locale, status)
  values ('00000000-0000-4000-8000-000000000003', 'FOOTER', 'vi', 'ACTIVE')
  returning id into v_menu_id;

  insert into navigation_items (menu_id, parent_item_id, label, url, is_external, open_in_new_tab, position, status)
  values (v_menu_id, null, 'Về chúng tôi', null, false, false, 1, 'ACTIVE') returning id into v_col_id;
  insert into navigation_items (menu_id, parent_item_id, label, url, is_external, open_in_new_tab, position, status) values
    (v_menu_id, v_col_id, 'Giới thiệu', '/about', false, false, 1, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Tầm nhìn - Sứ mệnh', '/about#vision', false, false, 2, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Đội ngũ', '/brand/leadership', false, false, 3, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Tin tức', '/brand/news', false, false, 4, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Tuyển dụng', '/careers', false, false, 5, 'ACTIVE');

  insert into navigation_items (menu_id, parent_item_id, label, url, is_external, open_in_new_tab, position, status)
  values (v_menu_id, null, 'Dịch vụ', null, false, false, 2, 'ACTIVE') returning id into v_col_id;
  insert into navigation_items (menu_id, parent_item_id, label, url, is_external, open_in_new_tab, position, status) values
    (v_menu_id, v_col_id, 'Tour đoàn', '/tours?type=group', false, false, 1, 'ACTIVE'),
    (v_menu_id, v_col_id, 'MICE & Sự kiện', '/mice', false, false, 2, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Dịch vụ lẻ', '/services', false, false, 3, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Khách sạn', '/hotels', false, false, 4, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Du thuyền', '/cruises', false, false, 5, 'ACTIVE');

  insert into navigation_items (menu_id, parent_item_id, label, url, is_external, open_in_new_tab, position, status)
  values (v_menu_id, null, 'Hỗ trợ', null, false, false, 3, 'ACTIVE') returning id into v_col_id;
  insert into navigation_items (menu_id, parent_item_id, label, url, is_external, open_in_new_tab, position, status) values
    (v_menu_id, v_col_id, 'FAQ', '/faq', false, false, 1, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Điều khoản & điều kiện', '/policy/terms', false, false, 2, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Chính sách bảo mật', '/policy/privacy', false, false, 3, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Hướng dẫn thanh toán', '/policy/payment', false, false, 4, 'ACTIVE'),
    (v_menu_id, v_col_id, 'Liên hệ', '/contact', false, false, 5, 'ACTIVE');
end $$;

insert into setting_definitions (key, namespace, value_type, default_value, description, is_secret, visibility) values
  ('company.social_youtube', 'company', 'STRING', '""'::jsonb, 'YouTube channel URL.', false, 'PUBLIC'),
  ('company.social_linkedin', 'company', 'STRING', '""'::jsonb, 'LinkedIn page URL.', false, 'PUBLIC')
on conflict (key) do update set description = excluded.description;
