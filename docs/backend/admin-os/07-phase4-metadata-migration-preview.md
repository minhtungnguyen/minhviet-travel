# 07 — Phase 4 Metadata Migration: Schema Audit, Preview, Safety Report, Rollback

**Trạng thái: ĐÃ ÁP DỤNG.** Founder duyệt cả 3 điểm (mục B/C/D). Migration `0020_cms_page_version_metadata` đã chạy trên `mv-travel-os-dev` qua Supabase MCP và đã xác minh lại bằng `information_schema.columns` — `cms_page_versions` nay có đủ `updated_at/updated_by/reviewed_by/reviewed_at/published_by`.

Bối cảnh: Founder yêu cầu tách biệt 2 trách nhiệm — (A) record metadata (`created_by/updated_by/reviewed_by/published_by` + timestamp tương ứng) sống trên chính bản ghi, và (B) `audit_logs` tiếp tục là lịch sử thao tác đầy đủ, không dùng (B) để thay thế (A).

## A. Audit schema thật (query trực tiếp `mv-travel-os-dev`, đối chiếu migration file)

| Bảng | Cột đã có | Cột còn thiếu (theo yêu cầu Founder) |
|---|---|---|
| `cms_pages` | `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (đã có trigger `set_updated_at`) | Không thiếu gì — `reviewed_by/reviewed_at/published_by` **không áp dụng ở cấp `cms_pages`**, xem giải thích mục B |
| `cms_page_versions` | `created_at`, `created_by`, `published_at` | `updated_at`, `updated_by`, `reviewed_by`, `reviewed_at`, `published_by` |

**Không có cột nào trùng lặp sẽ được tạo** — đã kiểm tra từng cột trước khi viết migration.

## B. Vì sao reviewed/published gắn vào `cms_page_versions`, không phải `cms_pages`

Workflow `DRAFT → IN_REVIEW → APPROVED → SCHEDULED → PUBLISHED → ARCHIVED` (Founder đã chốt) vận hành trên `cms_page_versions.status` (`modules/cms/application/cms.service.ts`), không phải trên `cms_pages`. Một `cms_page` có nhiều version; "ai duyệt / ai publish" là thuộc tính của **version cụ thể** được duyệt/publish, không phải của trang. Do đó:
- `reviewed_by`/`reviewed_at` = actor + thời điểm hoàn tất bước **APPROVED** (không có khái niệm "approved_at" riêng trong yêu cầu Founder — 4 cặp cột được liệt kê là created/updated/reviewed/published, nên `reviewed_*` được map vào đúng bước APPROVE).
- `published_by` = actor thực hiện transition sang `PUBLISHED` (`published_at` cột này đã tồn tại sẵn từ `0009_cms.sql`, chỉ thiếu actor).
- `updated_by`/`updated_at` = actor + thời điểm của **lần ghi cuối cùng** lên version đó (mọi transition đều là 1 UPDATE lên `cms_page_versions`).

News dùng chung đúng bảng này (News = `cms_pages` với `slug like 'brand/news/%'`) — nên "một chuẩn nhất quán cho cả Pages và News" tự động thoả mãn, không cần bảng/cột riêng cho News.

## C. Chuẩn FK được chọn

`auth.users(id)`, không phải `user_profiles.id`.

**Lý do:** cột `created_by` đã có sẵn trên chính `cms_page_versions` (và `created_by/updated_by` trên `cms_pages`) đều đã tham chiếu `auth.users(id)` (`0009_cms.sql:36-37,58`). Thêm cột mới cùng bảng với FK target khác sẽ tạo ra 2 chuẩn trên cùng 1 bảng — chọn khớp với cột đã tồn tại là nhất quán nhất trong phạm vi Pages/News.

**Ghi nhận (không sửa):** `0016_attraction_ticket_module.sql` (module vé vui chơi, không thuộc Phase 4) dùng `user_profiles(id)` cho `created_by`/`triggered_by` — một chuẩn khác đã tồn tại ở module khác. Đây là inconsistency có sẵn trong codebase từ trước, ngoài phạm vi Phase 4 — không đụng vào.

## D. Migration preview (additive only)

File: `database/migrations/0020_cms_page_version_metadata.sql`

```sql
alter table cms_page_versions
  add column updated_at timestamptz not null default now(),
  add column updated_by uuid references auth.users(id),
  add column reviewed_by uuid references auth.users(id),
  add column reviewed_at timestamptz,
  add column published_by uuid references auth.users(id);

create trigger set_updated_at before update on cms_page_versions
  for each row execute function set_updated_at();

update cms_page_versions
set updated_at = created_at,
    updated_by = created_by
where updated_by is null;

create index cms_page_versions_scheduled_due_idx
  on cms_page_versions (scheduled_publish_at)
  where status = 'SCHEDULED';
```

Không có `DROP`, không có `DELETE`. Không đổi `cms_pages` (đã đủ cột). Không đổi bất kỳ bảng nào khác.

**Về index:** chỉ thêm 1 index — partial index hỗ trợ đúng câu query mới của Scheduler V1 (`status = 'SCHEDULED' and scheduled_publish_at <= now()`). Không thêm index trên `updated_by/reviewed_by/published_by`: không có pattern truy vấn nào cần lookup theo actor, và toàn bộ schema hiện tại **không có tiền lệ** đánh index lên bất kỳ cột `*_by` nào (đã grep xác nhận) — giữ nhất quán, không đánh index thừa.

## E. Safety report

| Rủi ro | Đánh giá |
|---|---|
| Số dòng bị khoá khi `ALTER TABLE ADD COLUMN` | `cms_page_versions` hiện có **1 dòng** (query trực tiếp) — lock time không đáng kể, không cần chạy off-peak |
| `add column ... not null default now()` trên `updated_at` | An toàn trên Postgres 12+ (kể cả bảng lớn) — default constant được ghi vào catalog, không rewrite toàn bộ bảng. Dự án chạy Postgres 17.6 (xác nhận qua `list_projects`) |
| Trigger `set_updated_at` mới trên `cms_page_versions` | Trigger dùng chung function đã có sẵn (`0001_extensions_and_helpers.sql`), đã áp dụng cho hàng chục bảng khác — không phải code mới, rủi ro thấp |
| Backfill `update ... where updated_by is null` | Chỉ 1 dòng bị ảnh hưởng hiện tại; điều kiện `where updated_by is null` khiến câu lệnh **idempotent** — chạy lại không đổi gì thêm |
| FK mới (`updated_by/reviewed_by/published_by` → `auth.users(id)`) | Cột nullable, không có dữ liệu hiện tại nào vi phạm (toàn bộ giá trị bắt đầu từ `null`) |
| Ảnh hưởng RLS | Không đổi policy nào; RLS trên `cms_page_versions` không lọc theo các cột này |
| Ảnh hưởng code hiện tại | `modules/cms/application/cms.service.ts` và repository chưa đọc/ghi các cột mới — thêm cột không phá vỡ code đang chạy (cột mới, không đổi cột cũ). Việc set `updated_by/reviewed_by/published_by` từ `actor.userId` là việc của bước code Phase 4 (sau khi migration được duyệt), không nằm trong migration này |

## F. Rollback plan

Vì migration chỉ `ADD COLUMN`/`CREATE INDEX`/`CREATE TRIGGER`, rollback là drop đúng những gì đã thêm — không cần khôi phục từ backup:

```sql
drop trigger if exists set_updated_at on cms_page_versions;
drop index if exists cms_page_versions_scheduled_due_idx;
alter table cms_page_versions
  drop column if exists updated_at,
  drop column if exists updated_by,
  drop column if exists reviewed_by,
  drop column if exists reviewed_at,
  drop column if exists published_by;
```

An toàn vì: chưa có code nào phụ thuộc các cột này tại thời điểm migration được áp dụng (code Phase 4 chỉ bắt đầu viết sau khi migration này được duyệt và apply, theo đúng thứ tự Founder yêu cầu ở mục 10).

## G. Việc còn lại ở tầng code (không thuộc migration, ghi chú để không quên khi vào Phase 4)

Trigger chỉ tự set `updated_at`. `updated_by`/`reviewed_by`/`published_by` **không có cơ chế tự động** — đúng như mọi cột `*_by` khác trong toàn bộ schema, tầng service phải set tường minh từ `actor.userId` tại đúng transition tương ứng (`submitForReview`/`approve`/`publish`/mọi update khác trong `cms.service.ts`). Đây là việc của Task #5/#6 (Pages/News), không phải của migration này.

---

## Dừng ở đây — chờ duyệt

Chưa chạy `apply_migration`. Cần Founder xác nhận:
1. Đồng ý mapping `reviewed_by/reviewed_at` = bước APPROVE (mục B).
2. Đồng ý FK target `auth.users(id)` (mục C).
3. Đồng ý migration ở mục D để tôi `apply_migration` lên `mv-travel-os-dev`.

Sau khi duyệt, migration sẽ được áp dụng, sau đó mới bắt đầu code Phase 4 (Pages/News/SEO/Navigation/Footer/Announcements/Scheduler) theo đúng thứ tự ở `docs/backend/admin-os/06-phase4-cms-operations-audit-plan.md`.
