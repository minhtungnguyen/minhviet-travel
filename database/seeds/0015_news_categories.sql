-- 0015_news_categories.sql
-- Purpose: Sprint 5A, Founder decision #4 — seed the 8 default News
-- categories. Uses WEBSITE_MAIN_ID = 00000000-0000-4000-8000-000000000003
-- from 0002_organization.sql, same constant every other seed in this
-- repo uses for the single active website.

insert into news_categories (website_id, name, slug, sort_order) values
  ('00000000-0000-4000-8000-000000000003', 'Tin công ty', 'tin-cong-ty', 1),
  ('00000000-0000-4000-8000-000000000003', 'Khuyến mại', 'khuyen-mai', 2),
  ('00000000-0000-4000-8000-000000000003', 'Du lịch', 'du-lich', 3),
  ('00000000-0000-4000-8000-000000000003', 'Cẩm nang', 'cam-nang', 4),
  ('00000000-0000-4000-8000-000000000003', 'Sự kiện', 'su-kien', 5),
  ('00000000-0000-4000-8000-000000000003', 'Thông báo', 'thong-bao', 6),
  ('00000000-0000-4000-8000-000000000003', 'Đối tác', 'doi-tac', 7),
  ('00000000-0000-4000-8000-000000000003', 'Tuyển dụng', 'tuyen-dung', 8)
on conflict (website_id, lower(slug)) do nothing;
