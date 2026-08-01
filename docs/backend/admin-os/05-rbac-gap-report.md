# 05 — RBAC Gap Report & Patch Proposal (pre-Phase 4)

**Trạng thái: ĐÃ ÁP DỤNG.** Founder duyệt phương án "chỉ SUPER_ADMIN" (không gộp ADMIN). Patch ở mục C đã chạy trên `mv-travel-os-dev` qua Supabase MCP và đã xác minh lại bằng query sống.

**Kết quả xác minh sau patch (`role_permissions` count theo role):**

| Role | Trước | Sau |
|---|---|---|
| SUPER_ADMIN | 25/33 | **33/33** ✅ |
| ADMIN | 25/33 | 25/33 (không đổi, đúng như đã duyệt) |
| MANAGER, MARKETING, SALES, BOOKING, OPERATION, VIEWER | không đổi | không đổi |

File seed đã tạo: `database/seeds/0014_super_admin_attraction_ticket_grant.sql` (idempotent, `on conflict do nothing` — an toàn khi seed pipeline chạy lại).

ADMIN vẫn còn gap 0/8 `attraction_ticket.*` y hệt như ghi nhận ở mục B — giữ nguyên, chưa xử lý, chờ quyết định riêng nếu founder muốn.

Nguồn dữ liệu: truy vấn trực tiếp `mv-travel-os-dev` (project `otusjahkdjpxqayeeqqn`) qua Supabase MCP, đối chiếu với `database/seeds/0003_rbac.sql`, `0006_attraction_ticket.sql`, `0008_attraction_ticket_categories.sql` và `shared/auth/guards.ts`. Không suy đoán từ tài liệu cũ — `docs/backend/auth/03-rbac-matrix.md` (Phase 0) đã từng ghi nhận gap này; báo cáo này xác nhận lại bằng query sống và bổ sung phần patch.

## A. Audit phạm vi yêu cầu: `attraction_ticket.*`, `booking.*`, `cms.*`, `media.*`, `settings.*`

| Module | Số permission | SUPER_ADMIN có đủ? |
|---|---|---|
| `attraction_ticket.*` | 8 | ❌ **0/8** |
| `booking.*` | 0 — **không tồn tại module này**. "Booking" trong DB chỉ có dưới dạng `attraction_ticket.booking.read` / `attraction_ticket.booking.cancel` (đã tính trong 8 permission attraction_ticket ở trên). Không có permission nào với `module = 'booking'`. | — (không áp dụng) |
| `cms.*` | 9 | ✅ 9/9 |
| `media.*` | 2 | ✅ 2/2 |
| `settings.*` | 5 | ✅ 5/5 |

Toàn bộ 10 module permission hiện có trong DB: `attraction_ticket, audit, cms, forms, master_data, media, role, seo, settings, user` (33 permission, khớp `docs/backend/auth/03-rbac-matrix.md`).

## B. Xác nhận SUPER_ADMIN có đầy đủ mọi permission hiện hữu?

**Không.** SUPER_ADMIN thiếu đúng 8 permission, toàn bộ thuộc `attraction_ticket.*`:

| Permission còn thiếu | Mô tả |
|---|---|
| `attraction_ticket.category.write` | Create/edit attraction ticket category taxonomy |
| `attraction_ticket.content.publish` | Edit/publish FAQ and cross-sell content for ticket products |
| `attraction_ticket.product.write` | Create/edit ticket products and translations |
| `attraction_ticket.venue.write` | Create/edit attraction venues and translations |
| `attraction_ticket.sync.read` | View provider sync logs and API error logs |
| `attraction_ticket.sync.trigger` | Trigger a manual provider sync and edit provider references |
| `attraction_ticket.booking.read` | View attraction ticket bookings and vouchers |
| `attraction_ticket.booking.cancel` | Cancel an attraction ticket booking |

**Ghi nhận thêm (ngoài phạm vi câu hỏi B nhưng cùng nguyên nhân):** `ADMIN` cũng thiếu chính xác 8 permission này (0/8), y hệt SUPER_ADMIN. Không đề xuất patch cho ADMIN trong mục C bên dưới vì brief chỉ yêu cầu xác nhận SUPER_ADMIN — nêu ra để founder quyết định có muốn gộp chung vào patch này hay xử lý riêng.

**Nguyên nhân gốc:** `0003_rbac.sql` cấp toàn bộ permission cho SUPER_ADMIN/ADMIN bằng `cross join permissions` — nhưng câu lệnh đó chỉ chạy **một lần**, tại thời điểm seed 0003 (33 - 8 = 25 permission khi đó chưa có module `attraction_ticket`). Khi `0006_attraction_ticket.sql` và `0008_attraction_ticket_categories.sql` thêm 8 permission mới sau này, hai file đó chỉ gán quyền cho `MANAGER/MARKETING/BOOKING/OPERATION/VIEWER` theo nhu cầu nghiệp vụ lúc đó — không có dòng nào re-run cross-join cho SUPER_ADMIN/ADMIN. Đây là lỗ hổng seed-ordering, không phải lỗi thiết kế role.

**Xác nhận code không có bypass:** `shared/auth/guards.ts:40-42` — `hasPermission()` chỉ kiểm tra `actor.permissions.has(permission)`, không có special-case nào cho SUPER_ADMIN. Do đó gap này là thật ở runtime, không chỉ ở dữ liệu.

## C. Patch đề xuất (additive only — chỉ SUPER_ADMIN, đúng phạm vi câu hỏi B)

File mới: `database/seeds/0014_super_admin_attraction_ticket_grant.sql` (số kế tiếp sau `0013_footer_navigation.sql`).

```sql
-- 0014_super_admin_attraction_ticket_grant.sql
-- Purpose: close the RBAC gap identified in docs/backend/admin-os/05-rbac-gap-report.md.
-- SUPER_ADMIN ("Full platform access") currently holds 0/8 attraction_ticket.*
-- permissions because 0006_attraction_ticket.sql and
-- 0008_attraction_ticket_categories.sql only granted the new permissions to
-- MANAGER/MARKETING/BOOKING/OPERATION/VIEWER, never re-running the blanket
-- cross-join 0003_rbac.sql used at the time SUPER_ADMIN was seeded. Additive
-- only: does not touch roles, permissions, or any existing role_permissions row.

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
cross join permissions p
where r.key = 'SUPER_ADMIN'
  and p.module = 'attraction_ticket'
on conflict do nothing;
```

Không có:
- Migration DDL (không đổi schema).
- Thay đổi `roles` hay `permissions` (không tạo permission trùng, không đổi mô tả).
- Thay đổi quyền của bất kỳ role nào khác.

## D. Impact analysis

**Trước patch (thực tế đo được hôm nay):**
- SUPER_ADMIN khi gọi bất kỳ service method nào `requirePermission()`/`requireAnyPermission()` với 1 trong 8 permission trên → nhận `FORBIDDEN`.
- Cụ thể đang thấy: Dashboard V1 tile "Bookings" hiển thị "Không có quyền xem" cho SUPER_ADMIN (`docs/backend/admin-os/04-dashboard-v1-report.md` dòng 14) — do thiếu `attraction_ticket.booking.read`.
- Module vé vui chơi (attraction ticket) hiện chưa có Admin UI (theo `docs/backend/auth/03-rbac-matrix.md` dòng 87), nên phần lớn 8 quyền này chưa có màn hình nào để "thấy" tác dụng ngay — ngoại trừ tile Bookings ở Dashboard, vốn đã dùng `attraction_ticket.booking.read`.

**Sau patch:**
- SUPER_ADMIN có đủ 33/33 permission hiện hữu — đúng với mô tả role "Full platform access, including role management."
- Tile Bookings ở Dashboard sẽ đọc được `attraction_orders` thật (0 hoặc số thật) thay vì "Không có quyền xem".
- Khi module Admin UI cho vé vui chơi được xây (sprint khác, ngoài Phase 4), SUPER_ADMIN sẽ không bị chặn.
- Không role nào khác bị ảnh hưởng. Không mất quyền nào đang có (patch chỉ `insert`, không `delete`/`update`).
- Rủi ro: bằng không — additive, idempotent (`on conflict do nothing`), không có side-effect ở tầng RLS (chưa test riêng RLS nhưng RLS policies dùng `auth_has_permission()` đọc cùng bảng `role_permissions`, nên hành vi nhất quán giữa service layer và RLS).

## E. Rollback plan

Vì patch chỉ `insert` 8 dòng vào `role_permissions`, rollback là một `delete` chính xác theo đúng scope đã insert — không cần khôi phục từ backup:

```sql
delete from role_permissions
where role_id = (select id from roles where key = 'SUPER_ADMIN')
  and permission_id in (
    select id from permissions where module = 'attraction_ticket'
  );
```

Điều kiện an toàn khi rollback: chỉ chạy nếu chưa có `user_roles` nào của SUPER_ADMIN thực sự dùng 1 trong 8 quyền này để tạo dữ liệu phụ thuộc (vd. huỷ 1 booking) — tại thời điểm viết báo cáo này, `attraction_orders` = 0 dòng nên không có rủi ro dữ liệu treo.

---

## Đã hoàn tất

- Tile Bookings ở Dashboard V1 sẽ đọc `attraction_orders` thật cho SUPER_ADMIN (số thật hoặc 0), không còn "Không có quyền xem".
- Không còn permission nào bị thiếu cho SUPER_ADMIN (33/33).
- Sẵn sàng chuyển sang **Phase 4 — CMS Operations V1** theo yêu cầu founder.
