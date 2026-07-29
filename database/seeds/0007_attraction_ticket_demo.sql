-- 0007_attraction_ticket_demo.sql
-- Purpose: Phase 2 demo content for the Attraction Ticket module
-- (docs/mv-ticket/06-implementation-plan.md Phase 2 "Premium UI bằng dữ
-- liệu mock chuẩn hoá"). Attached only to destinations that actually exist
-- in `destinations` (Hạ Long, Cát Bà — the only two `DESTINATION`-type
-- rows seeded so far) with images that already exist in `public/images/`
-- (no fabricated/placeholder image URLs, per brief §IX "Không dùng
-- placeholder ảnh xấu"). `provider_product_id` values are arbitrary
-- strings the mock provider ignores (`MockAttractionTicketProvider
-- .syncVariants` returns the same fixed catalog regardless of input) —
-- NOT real OneInventory ids, this data is demo/UI content only, honestly
-- gated behind the mock provider until Phase 3 connects a real one.
--
-- website_id = minhviettravel.com (MAIN_SITE, ACTIVE).

do $$
declare
  v_website_id uuid := '00000000-0000-4000-8000-000000000003';
  v_ha_long_id uuid := '814e51d5-2135-4541-86be-668f2f6f12be';
  v_cat_ba_id uuid := '581475e1-2432-4e15-9718-08ed9f93f128';
  v_product_type_id uuid;
  v_venue_sunworld uuid;
  v_venue_cruise uuid;
  v_venue_vinpearl uuid;
  v_product_id uuid;
begin
  select id into v_product_type_id from product_types where code = 'ATTRACTION_TICKET';

  -- Venue 1: Sun World Hạ Long Complex ------------------------------------
  insert into attraction_venues (website_id, destination_id, slug, image_url, image_alt, is_featured, sort_order)
  values (v_website_id, v_ha_long_id, 'sun-world-ha-long', '/images/combo/ha-long-sunset.jpg', 'Hoàng hôn trên vịnh Hạ Long nhìn từ Sun World Hạ Long Complex', true, 1)
  returning id into v_venue_sunworld;

  insert into attraction_venue_translations (attraction_venue_id, locale, name, summary, description, usage_guide, policy, highlights)
  values (
    v_venue_sunworld, 'vi',
    'Sun World Hạ Long Complex',
    'Quần thể vui chơi giải trí trên đỉnh núi Ba Đèo, nhìn toàn cảnh vịnh Hạ Long.',
    'Sun World Hạ Long Complex nằm trên đỉnh núi Ba Đèo, kết hợp cáp treo, công viên nước và khu vui chơi trong một quần thể duy nhất. Từ cabin cáp treo Nữ Hoàng, du khách có thể ngắm toàn cảnh vịnh Hạ Long từ trên cao trước khi xuống tham gia các trò chơi tại công viên.',
    'Vé điện tử gửi qua email/SMS sau khi thanh toán thành công. Xuất trình mã vé tại cổng soát vé để quét và vào cổng, không cần đổi vé giấy.',
    'Vé đã mua không áp dụng đổi/trả trừ trường hợp khu vui chơi đóng cửa do thời tiết xấu — khi đó được đổi ngày sử dụng khác trong vòng 30 ngày.',
    '["Cáp treo Nữ Hoàng vượt biển dài nhất thế giới", "Toàn cảnh vịnh Hạ Long từ đỉnh Ba Đèo", "Công viên nước Typhoon trong cùng quần thể"]'::jsonb
  );

  insert into attraction_provider_refs (attraction_venue_id, provider_code, provider_venue_id)
  values (v_venue_sunworld, 'ONEINVENTORY', 'demo-venue-sunworld-halong');

  -- Product 1.1: Vé Cáp Treo Nữ Hoàng
  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_sunworld, v_product_type_id, 've-cap-treo-nu-hoang-ha-long', '/images/combo/ha-long-sunset.jpg', 'Cabin cáp treo Nữ Hoàng vượt biển trên vịnh Hạ Long', 350000, true, 1)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy, meta_title, meta_description)
  values (
    v_product_id, 'vi',
    'Vé Cáp Treo Nữ Hoàng - Sun World Hạ Long',
    'Cabin cáp treo vượt biển dài nhất thế giới, ngắm toàn cảnh vịnh Hạ Long từ độ cao 189m.',
    'Cáp treo Nữ Hoàng đưa du khách từ chân núi Ba Đèo lên đỉnh, vượt qua vịnh Hạ Long ở độ cao 189m trong cabin kín đáo sức chứa 230 người. Hành trình khoảng 8 phút mỗi chiều, mở ra góc nhìn toàn cảnh vịnh di sản hiếm có.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.',
    'Vé Cáp Treo Nữ Hoàng - Sun World Hạ Long | Minh Việt Travel',
    'Đặt vé cáp treo Nữ Hoàng Sun World Hạ Long trực tuyến — xác nhận nhanh, vé điện tử, giá minh bạch.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-cap-treo-nu-hoang');

  insert into attraction_faqs (attraction_product_id, locale, question, answer, sort_order) values
    (v_product_id, 'vi', 'Vé có bao gồm xe đưa đón không?', 'Vé chỉ bao gồm cáp treo và vào cổng khu vui chơi, không bao gồm xe đưa đón. Minh Việt có dịch vụ combo xe + vé nếu bạn cần, liên hệ tư vấn để biết thêm.', 1),
    (v_product_id, 'vi', 'Trẻ em có cần mua vé riêng không?', 'Trẻ em dưới 1m được miễn vé. Từ 1m trở lên áp dụng giá vé trẻ em, chọn đúng loại vé khi đặt.', 2);

  insert into attraction_cross_sells (attraction_product_id, related_url, label, sort_order) values
    (v_product_id, '/combo/tat-ca?destination=H%E1%BA%A1%20Long', 'Xem Combo trọn gói Hạ Long', 1),
    (v_product_id, '/cruises', 'Du thuyền ngủ đêm trên vịnh', 2);

  -- Product 1.2: Vé Công Viên Nước Typhoon
  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_sunworld, v_product_type_id, 've-cong-vien-nuoc-typhoon-ha-long', '/images/combo/ha-long-cruise.jpg', 'Du thuyền lớn di chuyển giữa các đảo đá vôi trên vịnh Hạ Long', 250000, false, 2)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy)
  values (
    v_product_id, 'vi',
    'Vé Công Viên Nước Typhoon Hạ Long',
    'Khu vui chơi nước quy mô lớn ngay trong quần thể Sun World Hạ Long.',
    'Công viên nước Typhoon có các đường trượt nước, bể tạo sóng và khu vui chơi riêng cho trẻ em, nằm trong quần thể Sun World Hạ Long Complex — có thể kết hợp cùng vé cáp treo trong một ngày.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-typhoon-water-park');

  -- Venue 2: Du thuyền tham quan Vịnh Hạ Long (day tour, distinct from Combo's overnight cruise) --
  insert into attraction_venues (website_id, destination_id, slug, image_url, image_alt, is_featured, sort_order)
  values (v_website_id, v_ha_long_id, 'du-thuyen-tham-quan-ha-long', '/images/hero/ha-long-bay.jpg', 'Vịnh Hạ Long nhìn từ du thuyền lúc hoàng hôn', false, 2)
  returning id into v_venue_cruise;

  insert into attraction_venue_translations (attraction_venue_id, locale, name, summary, description, usage_guide, policy, highlights)
  values (
    v_venue_cruise, 'vi',
    'Du thuyền tham quan Vịnh Hạ Long',
    'Hành trình tham quan vịnh trong ngày, không ngủ đêm — phù hợp lịch trình ngắn.',
    'Vé du thuyền tham quan (không lưu trú) dành cho khách muốn khám phá vịnh Hạ Long trong một buổi, ghé thăm hang Sửng Sốt hoặc đảo Titop tuỳ hải trình, không cần sắp xếp lịch trình qua đêm.',
    'Vé điện tử gửi qua email/SMS. Tập trung tại cảng theo giờ ghi trên vé, mang theo giấy tờ tuỳ thân.',
    'Hoàn 100% nếu hủy trước 48 giờ. Hủy trong vòng 48 giờ áp dụng phí theo chính sách của đơn vị vận hành tàu.',
    '["Không cần sắp xếp lịch trình qua đêm", "Ghé hang Sửng Sốt hoặc đảo Titop", "Phù hợp khách đi công tác kết hợp tham quan"]'::jsonb
  );

  insert into attraction_provider_refs (attraction_venue_id, provider_code, provider_venue_id)
  values (v_venue_cruise, 'ONEINVENTORY', 'demo-venue-day-cruise-halong');

  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_cruise, v_product_type_id, 've-du-thuyen-tham-quan-vinh-ha-long', '/images/hero/ha-long-bay.jpg', 'Vịnh Hạ Long nhìn từ du thuyền lúc hoàng hôn', 590000, false, 3)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy)
  values (
    v_product_id, 'vi',
    'Vé Du Thuyền Tham Quan Vịnh Hạ Long (4 giờ)',
    'Hành trình 4 giờ trên vịnh, ghé hang Sửng Sốt, bao gồm hướng dẫn viên.',
    'Vé bao gồm vé tàu khứ hồi, vé tham quan hang Sửng Sốt và hướng dẫn viên tiếng Việt trong suốt hành trình 4 giờ trên vịnh Hạ Long.',
    'Hoàn 100% nếu hủy trước 48 giờ. Hủy trong vòng 48 giờ áp dụng phí theo chính sách của đơn vị vận hành tàu.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-day-cruise-4h');

  -- Venue 3: Vinpearl Cát Bà ------------------------------------------------
  insert into attraction_venues (website_id, destination_id, slug, image_url, image_alt, is_featured, sort_order)
  values (v_website_id, v_cat_ba_id, 'vinpearl-cat-ba', '/images/combo/cat-ba.jpg', 'Bãi biển và vách đá xanh của đảo Cát Bà', true, 3)
  returning id into v_venue_vinpearl;

  insert into attraction_venue_translations (attraction_venue_id, locale, name, summary, description, usage_guide, policy, highlights)
  values (
    v_venue_vinpearl, 'vi',
    'Vinpearl Cát Bà',
    'Khu nghỉ dưỡng và vui chơi giải trí trên đảo Cát Bà, có công viên nước và safari.',
    'Vinpearl Cát Bà là khu phức hợp nghỉ dưỡng — vui chơi trên đảo Cát Bà, bao gồm công viên nước, safari và bãi biển riêng — điểm đến phù hợp cho cả gia đình muốn kết hợp nghỉ dưỡng và vui chơi trong cùng một ngày.',
    'Vé điện tử gửi qua email/SMS sau khi thanh toán thành công. Xuất trình mã vé tại cổng soát vé.',
    'Vé đã mua không áp dụng đổi/trả trừ trường hợp khu vui chơi đóng cửa do thời tiết xấu.',
    '["Công viên nước ngay trên đảo", "Safari bán hoang dã", "Bãi biển riêng trong khuôn viên"]'::jsonb
  );

  insert into attraction_provider_refs (attraction_venue_id, provider_code, provider_venue_id)
  values (v_venue_vinpearl, 'ONEINVENTORY', 'demo-venue-vinpearl-catba');

  -- Product 3.1: Vé Vui Chơi Vinpearl Cát Bà
  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_vinpearl, v_product_type_id, 've-vui-choi-vinpearl-cat-ba', '/images/combo/cat-ba.jpg', 'Bãi biển và vách đá xanh của đảo Cát Bà', 450000, true, 4)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy, meta_title, meta_description)
  values (
    v_product_id, 'vi',
    'Vé Vui Chơi Vinpearl Cát Bà',
    'Trọn gói công viên nước, safari và bãi biển riêng trong một vé.',
    'Vé vào cổng Vinpearl Cát Bà bao gồm công viên nước, khu safari bán hoang dã và quyền sử dụng bãi biển riêng trong khuôn viên — phù hợp cho một ngày vui chơi trọn vẹn cùng gia đình.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.',
    'Vé Vui Chơi Vinpearl Cát Bà | Minh Việt Travel',
    'Đặt vé Vinpearl Cát Bà trực tuyến — công viên nước, safari, bãi biển riêng, vé điện tử xác nhận nhanh.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-vinpearl-catba-full');

  insert into attraction_faqs (attraction_product_id, locale, question, answer, sort_order) values
    (v_product_id, 'vi', 'Vé có bao gồm ăn uống không?', 'Vé chỉ bao gồm vào cổng và các trò chơi. Ăn uống tính riêng theo thực đơn tại chỗ.', 1);

  insert into attraction_cross_sells (attraction_product_id, related_url, label, sort_order) values
    (v_product_id, '/combo/tat-ca?destination=C%C3%A1t%20B%C3%A0', 'Xem Combo trọn gói Cát Bà', 1);

  -- Product 3.2: Vé Cáp Treo Cát Hải - Cát Bà
  insert into attraction_products (website_id, attraction_venue_id, product_type_id, slug, image_url, image_alt, price_from, is_featured, sort_order)
  values (v_website_id, v_venue_vinpearl, v_product_type_id, 've-cap-treo-cat-hai-cat-ba', '/images/combo/cat-ba-kayak.jpg', 'Kayak màu cam trên vịnh Lan Hạ yên bình giữa các vách đá vôi', 300000, false, 5)
  returning id into v_product_id;

  insert into attraction_product_translations (attraction_product_id, locale, title, summary, description, cancellation_policy)
  values (
    v_product_id, 'vi',
    'Vé Cáp Treo Cát Hải - Cát Bà',
    'Cáp treo vượt biển nối đảo Cát Hải và Cát Bà, ngắm cảnh vịnh Lan Hạ.',
    'Tuyến cáp treo nối đảo Cát Hải với Cát Bà, cho góc nhìn toàn cảnh vịnh Lan Hạ và quần đảo xung quanh trong hành trình khoảng 15-20 phút.',
    'Miễn phí đổi ngày sử dụng nếu báo trước 24 giờ. Không hoàn tiền sau khi đã quét vé vào cổng.'
  );

  insert into attraction_provider_refs (attraction_product_id, provider_code, provider_product_id)
  values (v_product_id, 'ONEINVENTORY', 'demo-product-cap-treo-cat-hai');
end $$;
