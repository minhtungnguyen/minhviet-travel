-- 0012_homepage_cms_content.sql
-- Purpose: Sprint 2 ("Make the CMS usable") — populate the real HOME
-- cms_page (00000000-0000-4000-8000-000000000100, already existed as a
-- placeholder with just a stub `hero` section) with content matching
-- lib/cms/content/homepage.seed.ts exactly, so swapping
-- lib/cms/client.ts#getHomepageContent() to read from the database is a
-- no-op visually. No schema change — cms_pages/cms_page_versions/
-- cms_sections/cms_blocks/cms_block_definitions all already existed.
--
-- `featuredJourneys`/`destinations` are intentionally NOT seeded here —
-- those depend on real Tour/Destination product data that doesn't exist
-- as a module yet (out of scope per Sprint 2's 10 named modules); the
-- read path keeps sourcing them from the existing mechanism.
--
-- `brandCenter` block config holds only eyebrow/title/description/cta —
-- `stories` is deliberately NOT stored here; it's computed at read time
-- from real published news cms_pages (News management, same sprint),
-- so the homepage and News admin never fall out of sync with each other.
--
-- `ceoSection` is seeded EMPTY (quote/name = '') on purpose — no real
-- CEO name or quote exists anywhere in this codebase to source honestly,
-- and fabricating one would misattribute a statement to a real person
-- who never said it. The public section component skips rendering
-- entirely when quote/name are empty; a Founder/Admin fills this in for
-- real through the new CMS editor before it ever appears live.

update cms_blocks set config = $hero$
{
  "eyebrow": "Minh Việt Travel · Enterprise Travel & MICE",
  "headline": "Kiến tạo hành trình, nâng tầm trải nghiệm",
  "headlineAccent": "doanh nghiệp",
  "subhead": "Giải pháp du lịch, sự kiện và công tác trọn gói dành cho doanh nghiệp, tổ chức và khách hàng cao cấp — thẩm định bởi chuyên gia, hỗ trợ bởi AI.",
  "primaryCta": { "label": "Thiết kế chương trình riêng", "href": "/tour-thiet-ke" },
  "secondaryCta": { "label": "Khám phá tour có sẵn", "href": "#tour-ghep-quoc-te" },
  "backgroundImage": { "src": "/editorial-hero.webp", "alt": "Du khách ngắm bình minh trên thung lũng núi đá vôi Việt Nam", "width": 1920, "height": 1080 },
  "proofStat": { "id": "years-experience", "value": 5, "suffix": "+", "label": "Năm kinh nghiệm triển khai MICE", "source": "Hồ sơ năng lực Minh Việt Travel", "asOf": "2026" }
}
$hero$::jsonb
where id = '00000000-0000-4000-8000-000000000103';

do $$
declare
  v_version_id uuid := '00000000-0000-4000-8000-000000000101';
  v_section_id uuid;
  v_block_id uuid;
  v_def_id uuid;
begin
  -- trustStrip -----------------------------------------------------------
  insert into cms_sections (page_version_id, section_key, position) values (v_version_id, 'trustStrip', 2)
  returning id into v_section_id;
  select id into v_def_id from cms_block_definitions where key = 'STATISTICS';
  insert into cms_blocks (section_id, block_definition_id, position, config) values (
    v_section_id, v_def_id, 1, $ts$
{
  "eyebrow": "Được tin dùng bởi doanh nghiệp & tổ chức trên cả nước",
  "positioning": {
    "headline": "Minh Việt không chỉ bán tour — Minh Việt thiết kế và tổ chức toàn bộ hành trình.",
    "description": "Đội ngũ chuyên trách thiết kế chương trình riêng cho tour doanh nghiệp, MICE, hội nghị và tour gia đình — song song phân phối tour ghép quốc tế, vé máy bay, du thuyền, khách sạn, vé vui chơi, visa và bảo hiểm cho khách cần dịch vụ có sẵn."
  },
  "segments": [
    { "id": "fdi", "label": "Khu công nghiệp & FDI", "icon": "building" },
    { "id": "gov", "label": "Cơ quan nhà nước", "icon": "landmark" },
    { "id": "association", "label": "Hiệp hội & tổ chức", "icon": "users" },
    { "id": "corporate", "label": "Corporate travel", "icon": "briefcase" }
  ],
  "stats": [
    { "id": "clients-served", "value": 200, "suffix": "+", "label": "Doanh nghiệp đã tin dùng", "source": "CRM nội bộ Minh Việt, tổng lũy kế", "asOf": "2026-Q2" },
    { "id": "travelers-served", "value": 10, "suffix": "K+", "label": "Lượt khách được phục vụ", "source": "Báo cáo vận hành nội bộ", "asOf": "2026-Q2" },
    { "id": "global-partners", "value": 150, "suffix": "+", "label": "Đối tác lưu trú, vận chuyển", "source": "Danh mục đối tác Minh Việt", "asOf": "2026-Q2" }
  ],
  "partners": [
    { "id": "vietnam-airlines", "name": "Vietnam Airlines", "category": "airline" },
    { "id": "singapore-airlines", "name": "Singapore Airlines", "category": "airline" },
    { "id": "korean-air", "name": "Korean Air", "category": "airline" },
    { "id": "ana", "name": "ANA", "category": "airline" },
    { "id": "marriott", "name": "Marriott", "category": "hotel" },
    { "id": "accor", "name": "Accor", "category": "hotel" },
    { "id": "intercontinental", "name": "InterContinental", "category": "hotel" },
    { "id": "vinpearl", "name": "Vinpearl", "category": "hotel" }
  ]
}
$ts$::jsonb
  );

  -- coreServices -----------------------------------------------------------
  insert into cms_sections (page_version_id, section_key, position) values (v_version_id, 'coreServices', 3)
  returning id into v_section_id;
  select id into v_def_id from cms_block_definitions where key = 'CARDS';
  insert into cms_blocks (section_id, block_definition_id, position, config) values (
    v_section_id, v_def_id, 1, $cs$
{
  "eyebrow": "Dịch vụ cốt lõi",
  "title": "Một đầu mối, trọn vẹn hành trình",
  "groups": [
    { "id": "bespoke", "label": "Thiết kế theo yêu cầu", "services": [
      { "id": "group-tours", "title": "Tour đoàn", "icon": "group", "href": "/tours?type=group" },
      { "id": "mice", "title": "MICE & Sự kiện", "icon": "briefcase", "href": "/mice" }
    ]},
    { "id": "ready-made", "label": "Có sẵn — khám phá ngay", "services": [
      { "id": "flights", "title": "Vé máy bay", "icon": "plane", "href": "/flights" },
      { "id": "hotels", "title": "Khách sạn", "icon": "building", "href": "/hotels" },
      { "id": "tour-ghep-quoc-te", "title": "Tour ghép Quốc tế", "icon": "globe", "href": "#tour-ghep-quoc-te" },
      { "id": "cruises", "title": "Du thuyền", "icon": "ship", "href": "/cruises" },
      { "id": "tickets", "title": "Vé vui chơi", "icon": "ticket", "href": "/tickets" },
      { "id": "custom-service", "title": "Dịch vụ lẻ", "icon": "sparkles", "href": "/services" }
    ]}
  ]
}
$cs$::jsonb
  );

  -- enterpriseMice -----------------------------------------------------------
  insert into cms_sections (page_version_id, section_key, position) values (v_version_id, 'enterpriseMice', 4)
  returning id into v_section_id;
  select id into v_def_id from cms_block_definitions where key = 'RICH_TEXT';
  insert into cms_blocks (section_id, block_definition_id, position, config) values (
    v_section_id, v_def_id, 1, $em$
{
  "badge": "Giải pháp doanh nghiệp & MICE",
  "title": "Sự kiện đẳng cấp cho doanh nghiệp của bạn",
  "description": "Hội nghị, team building, gala dinner và incentive — dàn dựng trọn gói, chuyên nghiệp, đạt tiêu chuẩn doanh nghiệp và tổ chức quốc tế.",
  "story": "Từ tiếp nhận yêu cầu đến nghiệm thu sau sự kiện, một đội điều phối duy nhất đồng hành cùng doanh nghiệp qua từng bước — không bàn giao giữa chừng, không phát sinh đầu mối thứ hai.",
  "process": ["Tiếp nhận yêu cầu", "Lên Concept", "Thiết kế chương trình", "Điều phối", "Vận hành", "Nghiệm thu"],
  "proofStat": { "id": "mice-programs-delivered", "value": 30, "suffix": "+", "label": "Chương trình MICE đã triển khai", "source": "Báo cáo vận hành nội bộ Minh Việt", "asOf": "2026-Q2" },
  "image": { "src": "/mice-audience-vietnam.jpg", "alt": "Khán phòng sự kiện doanh nghiệp do Minh Việt tổ chức, khách mời vỗ tay hưởng ứng", "width": 1600, "height": 1067 },
  "cta": { "label": "Yêu cầu thiết kế chương trình", "href": "/mice" }
}
$em$::jsonb
  );

  -- aiAdvisor -----------------------------------------------------------
  insert into cms_sections (page_version_id, section_key, position) values (v_version_id, 'aiAdvisor', 5)
  returning id into v_section_id;
  select id into v_def_id from cms_block_definitions where key = 'FORM';
  insert into cms_blocks (section_id, block_definition_id, position, config) values (
    v_section_id, v_def_id, 1, $ai$
{
  "eyebrow": "Công nghệ & con người",
  "title": "Trợ lý AI, thẩm định bởi",
  "titleAccent": "chuyên gia thật",
  "description": "Chọn ngân sách, quy mô đoàn và ưu tiên điểm đến — AI của Minh Việt đề xuất hành trình phù hợp kèm mức độ phù hợp và lý do cụ thể. Chuyên viên xác nhận trước khi triển khai.",
  "disclosureNote": "Đây là gợi ý từ AI dựa trên dữ liệu bạn cung cấp, chưa phải xác nhận cuối cùng — chuyên viên Minh Việt sẽ liên hệ để xác nhận tính khả thi trước khi triển khai.",
  "questions": [
    { "id": "budget", "label": "Ngân sách dự kiến", "placeholder": "Chọn mức ngân sách", "options": [
      { "value": "under-15tr", "label": "Dưới 15 triệu / người" },
      { "value": "15-30tr", "label": "15 - 30 triệu / người" },
      { "value": "30-70tr", "label": "30 - 70 triệu / người" },
      { "value": "70tr-plus", "label": "Trên 70 triệu / người" }
    ]},
    { "id": "groupSize", "label": "Quy mô đoàn", "placeholder": "Chọn quy mô", "options": [
      { "value": "individual", "label": "Cá nhân / cặp đôi" },
      { "value": "small-group", "label": "Nhóm nhỏ (dưới 10 người)" },
      { "value": "large-group", "label": "Đoàn lớn (10 - 50 người)" },
      { "value": "corporate", "label": "Doanh nghiệp / tổ chức (50+ người)" }
    ]},
    { "id": "preference", "label": "Ưu tiên điểm đến", "placeholder": "Chọn ưu tiên", "options": [
      { "value": "beach", "label": "Biển & nghỉ dưỡng" },
      { "value": "mountain", "label": "Núi & thiên nhiên" },
      { "value": "culture", "label": "Văn hoá & di sản" },
      { "value": "city", "label": "Đô thị & hiện đại" }
    ]}
  ],
  "humanHandoffCta": { "label": "Nói chuyện với chuyên viên", "href": "/contact?intent=ai-advisor" }
}
$ai$::jsonb
  );

  -- ceoSection (new — seeded empty, see file header) ------------------------
  insert into cms_sections (page_version_id, section_key, position) values (v_version_id, 'ceoSection', 6)
  returning id into v_section_id;
  select id into v_def_id from cms_block_definitions where key = 'TESTIMONIALS';
  insert into cms_blocks (section_id, block_definition_id, position, config) values (
    v_section_id, v_def_id, 1, $ceo$
{ "eyebrow": "Thông điệp lãnh đạo", "quote": "", "name": "", "title": "", "portrait": null }
$ceo$::jsonb
  );

  -- brandCenter (stories computed at read time from real News articles) ----
  insert into cms_sections (page_version_id, section_key, position) values (v_version_id, 'brandCenter', 7)
  returning id into v_section_id;
  select id into v_def_id from cms_block_definitions where key = 'RELATED_CONTENT';
  insert into cms_blocks (section_id, block_definition_id, position, config) values (
    v_section_id, v_def_id, 1, $bc$
{
  "eyebrow": "Năng lực",
  "title": "Năng lực & uy tín được khẳng định",
  "description": "Trích từ Hồ sơ năng lực Minh Việt Travel: pháp lý minh bạch từ 2013, mạng lưới đối tác chiến lược cùng hàng không — khách sạn — resort, và năng lực tổ chức đoàn lớn đã được kiểm chứng qua thực tế vận hành.",
  "cta": { "label": "Xem hồ sơ năng lực", "href": "/ho-so-nang-luc" }
}
$bc$::jsonb
  );

  -- finalCta -----------------------------------------------------------
  insert into cms_sections (page_version_id, section_key, position) values (v_version_id, 'finalCta', 8)
  returning id into v_section_id;
  select id into v_def_id from cms_block_definitions where key = 'CTA';
  insert into cms_blocks (section_id, block_definition_id, position, config) values (
    v_section_id, v_def_id, 1, $fc$
{
  "corporate": { "eyebrow": "DOANH NGHIỆP / TỔ CHỨC", "label": "Doanh nghiệp / Tổ chức", "title": "Nâng tầm hành trình doanh nghiệp của bạn", "description": "Đội ngũ chuyên gia Minh Việt sẵn sàng thiết kế giải pháp du lịch, sự kiện và MICE phù hợp với quy mô, ngân sách và mục tiêu của tổ chức.", "cta": { "label": "Gửi yêu cầu tư vấn", "href": "#lead-form" } },
  "individual": { "eyebrow": "KHÁCH HÀNG CÁ NHÂN", "label": "Khách hàng cá nhân", "title": "Sẵn sàng cho chuyến đi tiếp theo", "description": "Chia sẻ nhu cầu của bạn, chuyên viên Minh Việt sẽ tư vấn hành trình phù hợp với thời gian, ngân sách và sở thích.", "cta": { "label": "Gửi yêu cầu tư vấn", "href": "#lead-form" } },
  "phone": "0934 368 132",
  "zaloHref": "https://zalo.me/0934368132"
}
$fc$::jsonb
  );
end $$;

-- Bring the existing placeholder seo_metadata row in line with the real
-- homepage copy (was seeded with slightly different placeholder text).
update seo_metadata set
  title = 'Minh Việt Travel — Kiến tạo hành trình, kết nối giá trị',
  meta_description = 'Đối tác tin cậy của doanh nghiệp, tổ chức & khách hàng cao cấp. Tour đoàn, MICE & Sự kiện, Khách sạn, Du thuyền, Vé máy bay, Visa — trải nghiệm chuyên nghiệp, ứng dụng AI.'
where id = '00000000-0000-4000-8000-000000000130';

-- New non-secret setting for the homepage's organization JSON-LD locality
-- (organizations.city is null and that's a shared record other parts of
-- the app read — adding a setting here rather than guessing/overwriting it).
insert into setting_definitions (key, namespace, value_type, default_value, description, is_secret, visibility) values
  ('company.city', 'company', 'STRING', '"Hải Phòng"'::jsonb, 'Thành phố trụ sở, dùng cho dữ liệu SEO có cấu trúc (JSON-LD) của trang chủ.', false, 'PUBLIC')
on conflict (key) do update set description = excluded.description;
