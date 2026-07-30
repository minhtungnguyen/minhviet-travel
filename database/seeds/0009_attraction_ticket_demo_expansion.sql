-- 0009_attraction_ticket_demo_expansion.sql
-- Purpose: `/ve-vui-choi` had only 2 destinations (Hạ Long, Cát Bà — the only
-- two `DESTINATION`-type rows in `0001_core_master_data.sql`), so the
-- Homepage/Brand/Category rails read as sparse despite the UI being done
-- (docs/design/mv-ticket/16-checkpoint-reconciliation-2026-07-28.md).
-- This adds 3 more real, well-known destinations — Đà Nẵng, Nha Trang, Phú
-- Quốc — each with one venue and real bookable ticket products, using only
-- photography that already exists in `public/images/combo/` (no fabricated
-- placeholder images, same discipline as `0007_attraction_ticket_demo.sql`
-- §comment). Prices are plausible market approximations for demo purposes;
-- `provider_product_id`/`provider_venue_id` values are arbitrary strings the
-- mock provider ignores, same as 0007 — not real OneInventory ids.
--
-- Destinations block mirrors `0001_core_master_data.sql`'s idempotent
-- existence-check style (safe to re-run). The venue/product block below it
-- follows `0007`'s plain-insert style (assumes a fresh apply, same as 0007
-- — do not re-run against a database that already has these slugs).

-- Provinces referenced by the new destinations.
insert into provinces (country_code, name, code, status) values
  ('VN', 'Đà Nẵng', 'DN', 'ACTIVE'),
  ('VN', 'Khánh Hòa', 'KH', 'ACTIVE'),
  ('VN', 'Kiên Giang', 'KG', 'ACTIVE')
on conflict (country_code, code) do update set name = excluded.name;

do $$
declare
  v_vn_id uuid;
  v_danang_province_id uuid;
  v_khanhhoa_id uuid;
  v_kiengiang_id uuid;
  v_danang_id uuid;
  v_nhatrang_id uuid;
  v_phuquoc_id uuid;
begin
  select id into v_vn_id from destinations where destination_type = 'COUNTRY' and country_code = 'VN' limit 1;

  select destination_id into v_danang_province_id from destination_translations where locale = 'vi' and slug = 'thanh-pho-da-nang';
  if v_danang_province_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, status)
    values (v_vn_id, 'PROVINCE_CITY', 'VN', 'ACTIVE') returning id into v_danang_province_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_danang_province_id, 'vi', 'Thành phố Đà Nẵng', 'thanh-pho-da-nang'),
      (v_danang_province_id, 'en', 'Da Nang City', 'da-nang-city');
  end if;

  select destination_id into v_khanhhoa_id from destination_translations where locale = 'vi' and slug = 'khanh-hoa';
  if v_khanhhoa_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, status)
    values (v_vn_id, 'PROVINCE_CITY', 'VN', 'ACTIVE') returning id into v_khanhhoa_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_khanhhoa_id, 'vi', 'Khánh Hòa', 'khanh-hoa'),
      (v_khanhhoa_id, 'en', 'Khanh Hoa', 'khanh-hoa-en');
  end if;

  select destination_id into v_kiengiang_id from destination_translations where locale = 'vi' and slug = 'kien-giang';
  if v_kiengiang_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, status)
    values (v_vn_id, 'PROVINCE_CITY', 'VN', 'ACTIVE') returning id into v_kiengiang_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_kiengiang_id, 'vi', 'Kiên Giang', 'kien-giang'),
      (v_kiengiang_id, 'en', 'Kien Giang', 'kien-giang-en');
  end if;

  select destination_id into v_danang_id from destination_translations where locale = 'vi' and slug = 'da-nang';
  if v_danang_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, is_featured, status)
    values (v_danang_province_id, 'DESTINATION', 'VN', true, 'ACTIVE') returning id into v_danang_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_danang_id, 'vi', 'Đà Nẵng', 'da-nang'),
      (v_danang_id, 'en', 'Da Nang', 'da-nang-en');
  end if;

  select destination_id into v_nhatrang_id from destination_translations where locale = 'vi' and slug = 'nha-trang';
  if v_nhatrang_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, is_featured, status)
    values (v_khanhhoa_id, 'DESTINATION', 'VN', true, 'ACTIVE') returning id into v_nhatrang_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_nhatrang_id, 'vi', 'Nha Trang', 'nha-trang'),
      (v_nhatrang_id, 'en', 'Nha Trang', 'nha-trang-en');
  end if;

  select destination_id into v_phuquoc_id from destination_translations where locale = 'vi' and slug = 'phu-quoc';
  if v_phuquoc_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, is_featured, status)
    values (v_kiengiang_id, 'DESTINATION', 'VN', true, 'ACTIVE') returning id into v_phuquoc_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_phuquoc_id, 'vi', 'Phú Quốc', 'phu-quoc'),
      (v_phuquoc_id, 'en', 'Phu Quoc', 'phu-quoc-en');
  end if;
end $$;

do $$
declare
  v_website_id uuid := '00000000-0000-4000-8000-000000000003';
  v_danang_id uuid;
  v_nhatrang_id uuid;
  v_phuquoc_id uuid;
  v_product_type_id uuid;
  v_cat_water_park uuid;
  v_cat_cable_car uuid;
  v_cat_safari uuid;
  v_cat_indoor uuid;
  v_cat_family uuid;
  v_venue_bana uuid;
  v_venue_vinpearl_nt uuid;
  v_venue_vinwonders_pq uuid;
  v_product_id uuid;
begin
  select destination_id into v_danang_id from destination_translations where locale = 'vi' and slug = 'da-nang';
  select destination_id into v_nhatrang_id from destination_translations where locale = 'vi' and slug = 'nha-trang';
  select destination_id into v_phuquoc_id from destination_translations where locale = 'vi' and slug = 'phu-quoc';
  select id into v_product_type_id from product_types where code = 'ATTRACTION_TICKET';
  select id into v_cat_water_park from attraction_categories where website_id = v_website_id and slug = 'cong-vien-nuoc';
  select id into v_cat_cable_car from attraction_categories where website_id = v_website_id and slug = 'cap-treo';
  select id into v_cat_safari from attraction_categories where website_id = v_website_id and slug = 'safari-thu';
  select id into v_cat_indoor from attraction_categories where website_id = v_website_id and slug = 'vui-choi-trong-nha';
  select id into v_cat_family from attraction_categories where website_id = v_website_id and slug = 'gia-dinh-tre-em';

  -- Venue 4: Sun World Bà Nà Hills (Đà Nẵng) ------------------------------
  insert into attraction_venues (website_id, destination_id, slug, image_url, image_alt, is_featured, sort_order)
  values (v_website_id, v_danang_id, 'sun-world-ba-na-hills', '/images/combo/da-nang-dragon-bridge.jpg', 'Cầu Rồng Đà Nẵng rực sáng lúc hoàng hôn bên sông Hàn', true, 4)
  returning id into v_venue_bana;

  insert into attraction_venue_translations (attraction_venue_id, locale, name, summary, description, usage_guide, policy, highlights)
  values (
    v_venue_bana, 'vi',
    'Sun World Bà Nà Hills',
    'Quần thể vui chơi trên đỉnh núi Bà Nà, nổi tiếng với Cầu Vàng và hệ thống cáp treo đạt kỷ lục Guinness.',
    'Sun World Bà Nà Hills nằm trên đỉnh núi Chúa, cách trung tâm Đà Nẵng khoảng 25km, kết hợp cáp treo, Cầu Vàng, Làng Pháp và công viên trong nhà Fantasy Park trong một quần thể duy nhất. Cabin cáp treo đưa du khách vượt qua rừng nguyên sinh lên đến độ cao hơn 1.400m.',
    'Vé điện tử gửi qua email/SMS sau khi thanh toán thành công. Xuất trình mã vé tại cổng soát vé để quét và vào cổng, không cần đổi vé giấy.',
    'Vé đã mua không áp dụng đổi/trả trừ trường hợp khu vui chơi đóng cửa do thời tiết xấu — khi đó được đổi ngày sử dụng khác trong vòng 30 ngày.',
    '["Cầu Vàng - biểu tượng du lịch Đà Nẵng", "Cáp treo đạt kỷ lục Guinness thế giới", "Làng Pháp và Fantasy Park trong cùng quần thể"]'::jsonb
  );

  insert into attraction_provider_refs (attraction_venue_id, provider_code, provider_venue_id)
  values (v_venue_bana, 'ONEINVENTORY', 'demo-venue-bana-hills');

  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_bana, v_product_type_id, 've-cap-treo-cong-vien-ba-na-hills', '/images/combo/da-nang-dragon-bridge.jpg', 'Cầu Rồng Đà Nẵng rực sáng lúc hoàng hôn bên sông Hàn', 880000, true, 6)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy, meta_title, meta_description)
  values (
    v_product_id, 'vi',
    'Vé Cáp Treo & Công Viên Bà Nà Hills',
    'Trọn gói cáp treo, Cầu Vàng, Làng Pháp và Fantasy Park trong một vé.',
    'Vé vào cổng Bà Nà Hills bao gồm cáp treo khứ hồi, tham quan Cầu Vàng, Làng Pháp và toàn bộ trò chơi tại Fantasy Park — phù hợp cho một ngày khám phá trọn vẹn trên đỉnh núi Chúa.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.',
    'Vé Cáp Treo & Công Viên Bà Nà Hills | Minh Việt Travel',
    'Đặt vé Bà Nà Hills trực tuyến — cáp treo, Cầu Vàng, Fantasy Park, vé điện tử xác nhận nhanh.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-bana-hills-full');

  insert into attraction_faqs (attraction_product_id, locale, question, answer, sort_order) values
    (v_product_id, 'vi', 'Vé có bao gồm xe đưa đón từ trung tâm Đà Nẵng không?', 'Vé chỉ bao gồm cáp treo và vào cổng khu vui chơi, không bao gồm xe đưa đón. Minh Việt có dịch vụ combo xe + vé nếu bạn cần, liên hệ tư vấn để biết thêm.', 1);

  insert into attraction_cross_sells (attraction_product_id, related_url, label, sort_order) values
    (v_product_id, '/combo/tat-ca?destination=%C4%90%C3%A0%20N%E1%BA%B5ng', 'Xem Combo trọn gói Đà Nẵng', 1);

  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select v_product_id, cat.id from (values (v_cat_cable_car), (v_cat_indoor), (v_cat_family)) as cat(id);

  -- Product 4.2: Vé Bà Nà Hills kèm buffet trưa
  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_bana, v_product_type_id, 've-ba-na-hills-buffet-trua', '/images/combo/da-nang.jpg', 'Du khách đi dạo trên bãi biển Đà Nẵng buổi sáng, nhìn ra thành phố', 1150000, false, 7)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy)
  values (
    v_product_id, 'vi',
    'Vé Bà Nà Hills Kèm Buffet Trưa',
    'Trọn gói cáp treo, công viên và buffet trưa tại nhà hàng trong khu.',
    'Cùng nội dung vé cáp treo & công viên Bà Nà Hills, kèm suất buffet trưa tại nhà hàng trong quần thể — không cần xếp hàng chọn món riêng.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-bana-hills-buffet');

  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select v_product_id, cat.id from (values (v_cat_cable_car), (v_cat_family)) as cat(id);

  -- Venue 5: Vinpearl Nha Trang --------------------------------------------
  insert into attraction_venues (website_id, destination_id, slug, image_url, image_alt, is_featured, sort_order)
  values (v_website_id, v_nhatrang_id, 'vinpearl-nha-trang', '/images/combo/nha-trang.jpg', 'Quảng trường 2/4 và bãi biển Trần Phú, Nha Trang nhìn từ trên cao', true, 5)
  returning id into v_venue_vinpearl_nt;

  insert into attraction_venue_translations (attraction_venue_id, locale, name, summary, description, usage_guide, policy, highlights)
  values (
    v_venue_vinpearl_nt, 'vi',
    'Vinpearl Nha Trang',
    'Khu vui chơi giải trí trên đảo Hòn Tre, nối với đất liền bằng cáp treo vượt biển.',
    'Vinpearl Nha Trang nằm trên đảo Hòn Tre, kết nối với đất liền bằng tuyến cáp treo vượt biển dài hàng đầu Việt Nam. Trong quần thể có công viên nước, khu trò chơi và các tiện ích giải trí trong nhà, phù hợp cho một ngày vui chơi trọn vẹn.',
    'Vé điện tử gửi qua email/SMS sau khi thanh toán thành công. Xuất trình mã vé tại ga cáp treo Vinpearl để quét và vào cổng.',
    'Vé đã mua không áp dụng đổi/trả trừ trường hợp khu vui chơi đóng cửa do thời tiết xấu — khi đó được đổi ngày sử dụng khác trong vòng 30 ngày.',
    '["Cáp treo vượt biển nối đảo Hòn Tre", "Công viên nước ngay trong quần thể", "Toàn cảnh vịnh Nha Trang từ cabin cáp treo"]'::jsonb
  );

  insert into attraction_provider_refs (attraction_venue_id, provider_code, provider_venue_id)
  values (v_venue_vinpearl_nt, 'ONEINVENTORY', 'demo-venue-vinpearl-nhatrang');

  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_vinpearl_nt, v_product_type_id, 've-cap-treo-cong-vien-vinpearl-nha-trang', '/images/combo/nha-trang.jpg', 'Quảng trường 2/4 và bãi biển Trần Phú, Nha Trang nhìn từ trên cao', 750000, true, 8)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy, meta_title, meta_description)
  values (
    v_product_id, 'vi',
    'Vé Cáp Treo & Công Viên Vinpearl Nha Trang',
    'Trọn gói cáp treo vượt biển, công viên nước và khu trò chơi trên đảo Hòn Tre.',
    'Vé bao gồm cáp treo khứ hồi ra đảo Hòn Tre và toàn bộ khu vui chơi Vinpearl Nha Trang — công viên nước, khu trò chơi trong nhà và ngoài trời.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.',
    'Vé Cáp Treo & Công Viên Vinpearl Nha Trang | Minh Việt Travel',
    'Đặt vé Vinpearl Nha Trang trực tuyến — cáp treo vượt biển, công viên nước, vé điện tử xác nhận nhanh.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-vinpearl-nhatrang-full');

  insert into attraction_faqs (attraction_product_id, locale, question, answer, sort_order) values
    (v_product_id, 'vi', 'Trẻ em có cần mua vé riêng không?', 'Trẻ em dưới 1m được miễn vé. Từ 1m trở lên áp dụng giá vé trẻ em, chọn đúng loại vé khi đặt.', 1);

  insert into attraction_cross_sells (attraction_product_id, related_url, label, sort_order) values
    (v_product_id, '/combo/tat-ca?destination=Nha%20Trang', 'Xem Combo trọn gói Nha Trang', 1);

  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select v_product_id, cat.id from (values (v_cat_cable_car), (v_cat_water_park), (v_cat_family)) as cat(id);

  -- Product 5.2: Vé Cano cao tốc Nha Trang - Đảo Hòn Tre (khứ hồi)
  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_vinpearl_nt, v_product_type_id, 've-cano-nha-trang-hon-tre', '/images/combo/nha-trang-boat.jpg', 'Du khách di chuyển bằng thuyền trên biển Nha Trang', 300000, false, 9)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy)
  values (
    v_product_id, 'vi',
    'Vé Cano Cao Tốc Nha Trang - Đảo Hòn Tre (khứ hồi)',
    'Phương án di chuyển nhanh ra đảo Hòn Tre thay cho cáp treo, khứ hồi trong ngày.',
    'Vé cano cao tốc khứ hồi giữa cảng Nha Trang và đảo Hòn Tre — lựa chọn thay thế cáp treo, phù hợp khách muốn di chuyển nhanh hoặc đi vào giờ cáp treo tạm dừng.',
    'Hoàn 100% nếu hủy trước 24 giờ. Hủy trong vòng 24 giờ áp dụng phí theo chính sách của đơn vị vận hành cano.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-canoe-hon-tre');

  -- Venue 6: VinWonders & Safari Phú Quốc -----------------------------------
  insert into attraction_venues (website_id, destination_id, slug, image_url, image_alt, is_featured, sort_order)
  values (v_website_id, v_phuquoc_id, 'vinwonders-safari-phu-quoc', '/images/combo/phu-quoc-sunset.jpg', 'Lối đi giữa hàng dừa dẫn ra bãi biển lúc hoàng hôn tại Phú Quốc', true, 6)
  returning id into v_venue_vinwonders_pq;

  insert into attraction_venue_translations (attraction_venue_id, locale, name, summary, description, usage_guide, policy, highlights)
  values (
    v_venue_vinwonders_pq, 'vi',
    'VinWonders & Safari Phú Quốc',
    'Công viên chủ đề và khu safari bán hoang dã lớn nhất Việt Nam, cùng nằm trong khu Bãi Dài, Phú Quốc.',
    'VinWonders và Vinpearl Safari nằm cạnh nhau tại khu Bãi Dài, phía bắc đảo Phú Quốc. VinWonders có công viên nước và các khu trò chơi chủ đề; Safari là khu bảo tồn bán hoang dã với hàng trăm loài động vật, tham quan bằng xe chuyên dụng hoặc đi bộ.',
    'Vé điện tử gửi qua email/SMS sau khi thanh toán thành công. Xuất trình mã vé tại cổng soát vé để quét và vào cổng.',
    'Vé đã mua không áp dụng đổi/trả trừ trừ trường hợp khu vui chơi đóng cửa do thời tiết xấu — khi đó được đổi ngày sử dụng khác trong vòng 30 ngày.',
    '["Safari bán hoang dã lớn nhất Việt Nam", "Công viên nước và khu trò chơi chủ đề VinWonders", "Cùng nằm trong khu Bãi Dài, dễ kết hợp trong một ngày"]'::jsonb
  );

  insert into attraction_provider_refs (attraction_venue_id, provider_code, provider_venue_id)
  values (v_venue_vinwonders_pq, 'ONEINVENTORY', 'demo-venue-vinwonders-safari-phuquoc');

  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_vinwonders_pq, v_product_type_id, 've-vinwonders-phu-quoc', '/images/combo/phu-quoc-sunset.jpg', 'Lối đi giữa hàng dừa dẫn ra bãi biển lúc hoàng hôn tại Phú Quốc', 750000, true, 10)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy, meta_title, meta_description)
  values (
    v_product_id, 'vi',
    'Vé VinWonders Phú Quốc',
    'Công viên nước và khu trò chơi chủ đề tại khu Bãi Dài, Phú Quốc.',
    'Vé vào cổng VinWonders Phú Quốc bao gồm công viên nước và toàn bộ khu trò chơi chủ đề trong quần thể tại Bãi Dài.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.',
    'Vé VinWonders Phú Quốc | Minh Việt Travel',
    'Đặt vé VinWonders Phú Quốc trực tuyến — công viên nước, khu trò chơi chủ đề, vé điện tử xác nhận nhanh.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-vinwonders-phuquoc');

  insert into attraction_cross_sells (attraction_product_id, related_url, label, sort_order) values
    (v_product_id, '/combo/tat-ca?destination=Ph%C3%BA%20Qu%E1%BB%91c', 'Xem Combo trọn gói Phú Quốc', 1);

  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select v_product_id, cat.id from (values (v_cat_water_park), (v_cat_indoor), (v_cat_family)) as cat(id);

  -- Product 6.2: Vé Safari Phú Quốc
  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_vinwonders_pq, v_product_type_id, 've-safari-phu-quoc', '/images/combo/phu-quoc.jpg', 'Rừng dừa ven biển nhìn ra khơi tại Phú Quốc', 650000, false, 11)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy)
  values (
    v_product_id, 'vi',
    'Vé Safari Phú Quốc',
    'Khu bảo tồn bán hoang dã lớn nhất Việt Nam, tham quan bằng xe chuyên dụng hoặc đi bộ.',
    'Vé vào cổng Vinpearl Safari Phú Quốc — khu bảo tồn bán hoang dã với hàng trăm loài động vật, có khu tham quan bằng xe chuyên dụng và khu đi bộ gần gũi động vật ăn cỏ.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-safari-phuquoc');

  insert into attraction_faqs (attraction_product_id, locale, question, answer, sort_order) values
    (v_product_id, 'vi', 'Vé có bao gồm xe điện tham quan khu bán hoang dã không?', 'Vé đã bao gồm xe chuyên dụng tham quan khu bán hoang dã. Khu đi bộ gần động vật ăn cỏ tham quan tự do, không giới hạn thời gian trong giờ mở cửa.', 1);

  insert into attraction_product_categories (attraction_product_id, attraction_category_id)
  select v_product_id, cat.id from (values (v_cat_safari), (v_cat_family)) as cat(id);
end $$;
