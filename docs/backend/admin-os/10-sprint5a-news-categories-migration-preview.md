# 10 — Sprint 5A: News Categories Migration Preview

**Trạng thái: ĐÃ ÁP DỤNG (bản sửa theo yêu cầu Founder).**

Founder duyệt với 5 điều chỉnh: đổi field list (thêm description/icon/color/sort_order/is_active, bỏ status enum), **không dùng JSON cho categories — kể cả phần gán category cho bài viết** (nên tách thành bảng `news_article_categories` riêng thay vì `categoryId` trong JSON như preview đầu), không soft-delete, seed 8 category mặc định, xác nhận Featured/Hot/Pinned thuộc về Article (đã đúng thiết kế — nằm trong block `meta`, không phải trên category). Đã apply cả 2 bảng + RLS + seed lên `mv-travel-os-dev`, xác nhận 8/8 category active. Types đã regenerate.

Founder quyết định #5 (Sprint 5): thêm News Categories. Audit xác nhận (`09-sprint5-audit-and-plan.md`) không có bảng categories/tags nào cho News — chỉ có 1 field text tự do `category` trong block `meta`.

## Thiết kế

Bảng mới `news_categories` (lookup, không phải bảng nội dung) — News vẫn giữ nguyên kiến trúc "là `cms_pages` thường, không bảng riêng": bài viết trỏ tới category qua `categoryId` (uuid) **bên trong JSON config của block `meta`**, không phải cột FK thật — nhất quán với cách mọi field khác trong block config hoạt động (ảnh, size... đều không có FK), tránh phá vỡ kiến trúc "News = cms_pages thường" đã có.

## Migration preview

`database/migrations/0021_news_categories.sql`:
```sql
create table news_categories (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  name text not null,
  slug text not null,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);
create trigger set_updated_at before update on news_categories
  for each row execute function set_updated_at();
create unique index news_categories_website_slug_idx
  on news_categories (website_id, lower(slug));
```

`database/policies/0008_news_categories_policies.sql`:
```sql
alter table news_categories enable row level security;
create policy "public_read_active_news_categories" on news_categories
  for select to anon, authenticated using (status = 'ACTIVE');
create policy "staff_write_news_categories" on news_categories
  for all to authenticated
  using (auth_has_permission('cms.page.update'))
  with check (auth_has_permission('cms.page.update'));
```

Không có `DROP`/`DELETE`. Không đổi bảng nào khác. **Không tạo permission mới** — tái dùng `cms.page.update` đã có (đúng kỷ luật RBAC đã thiết lập ở Phase 4: category là 1 phần cấu trúc CMS, không cần permission riêng).

## Safety report

| Rủi ro | Đánh giá |
|---|---|
| Bảng mới hoàn toàn, 0 dòng dữ liệu | Không có gì để mất — tạo bảng trống, không ảnh hưởng bảng khác |
| RLS | Bật ngay từ đầu, đúng pattern `cms_block_definitions` đã có (public đọc ACTIVE, staff ghi theo permission) |
| Ảnh hưởng code hiện tại | Không — chưa có code nào đọc/ghi bảng này cho tới khi tôi nối dây ở bước sau (Task #16, sau khi duyệt) |

## Rollback plan

```sql
drop policy if exists "public_read_active_news_categories" on news_categories;
drop policy if exists "staff_write_news_categories" on news_categories;
drop table if exists news_categories;
```

An toàn tuyệt đối — bảng trống, chưa có code phụ thuộc.

---

**Dừng ở đây — chờ duyệt trước khi `apply_migration`.**
