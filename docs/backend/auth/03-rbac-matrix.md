# 03 — RBAC Matrix (8 role hiện hữu, không tạo mới)

Nguồn: truy vấn trực tiếp `roles`/`permissions`/`role_permissions` trên `mv-travel-os-dev` qua Supabase MCP (không suy đoán từ seed file). 8 roles × 33 permissions × 111 grants — khớp chính xác số dòng `role_permissions` (111) đã ghi nhận ở Phase 0.

## Mapping nghiệp vụ đã chốt (Founder, không đổi)

| Tên trong brief gốc | Role thật trong DB |
|---|---|
| super_admin | `SUPER_ADMIN` |
| admin | `ADMIN` |
| content_editor | `MARKETING` |
| sales | `SALES` |
| booking | `BOOKING` |
| operator | `OPERATION` |
| accountant | **chưa triển khai** — không tạo role mới trong sprint này |
| — (không có trong brief) | `MANAGER` — role rộng hơn `MARKETING`, thêm quyền master data + audit.read + booking cancel; giữ nguyên, không gộp/xoá |
| — (không có trong brief) | `VIEWER` — read-only, giữ nguyên |

## Mô tả 8 role (nguyên văn `roles.description` trong DB)

| Role | Mô tả |
|---|---|
| `SUPER_ADMIN` | Full platform access, including role management. |
| `ADMIN` | Full operational access. |
| `MANAGER` | Manages content, forms, SEO and master data across the organization. |
| `MARKETING` | Manages CMS content, SEO and campaign forms. |
| `SALES` | Handles inbound leads and booking requests. |
| `BOOKING` | Processes confirmed booking requests. |
| `OPERATION` | Coordinates supplier and product operations. |
| `VIEWER` | Read-only access for reporting and oversight. |

## Ma trận Role × Permission (✓ = có quyền)

| Permission | SUPER_ADMIN | ADMIN | MANAGER | MARKETING | SALES | BOOKING | OPERATION | VIEWER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `audit.read` | ✓ | ✓ | ✓ | | | | | |
| `role.manage` | ✓ | ✓ | | | | | | |
| `user.manage` | ✓ | ✓ | | | | | | |
| `settings.brand.update` | ✓ | ✓ | | | | | | |
| `settings.definition.manage` | ✓ | ✓ | | | | | | |
| `settings.organization.update` | ✓ | ✓ | | | | | | |
| `settings.website.update` | ✓ | ✓ | | | | | | |
| `settings.website.read` | ✓ | ✓ | ✓ | | ✓ | | | ✓ |
| `cms.template.manage` | ✓ | ✓ | | | | | | |
| `cms.page.delete` | ✓ | ✓ | | | | | | |
| `cms.page.create` | ✓ | ✓ | ✓ | ✓ | | | | |
| `cms.page.update` | ✓ | ✓ | ✓ | ✓ | | | | |
| `cms.page.publish` | ✓ | ✓ | ✓ | ✓ | | | | |
| `cms.page.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cms.navigation.update` | ✓ | ✓ | ✓ | ✓ | | | | |
| `cms.faq.update` | ✓ | ✓ | ✓ | ✓ | | | | |
| `cms.announcement.update` | ✓ | ✓ | ✓ | ✓ | | | | |
| `forms.definition.manage` | ✓ | ✓ | ✓ | ✓ | | | | |
| `forms.submission.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `media.asset.read` | ✓ | ✓ | ✓ | ✓ | | | | |
| `media.asset.upload` | ✓ | ✓ | ✓ | ✓ | | | | |
| `seo.metadata.update` | ✓ | ✓ | ✓ | ✓ | | | | |
| `seo.redirect.update` | ✓ | ✓ | ✓ | ✓ | | | | |
| `master_data.manage` | ✓ | ✓ | ✓ | | | | ✓ | |
| `master_data.destination.update` | ✓ | ✓ | ✓ | | | | | |
| `attraction_ticket.category.write` | | | ✓ | ✓ | | | | |
| `attraction_ticket.content.publish` | | | ✓ | ✓ | | | | |
| `attraction_ticket.product.write` | | | ✓ | ✓ | | ✓ | | |
| `attraction_ticket.venue.write` | | | ✓ | ✓ | | ✓ | | |
| `attraction_ticket.sync.read` | | | ✓ | | | ✓ | | ✓ |
| `attraction_ticket.sync.trigger` | | | ✓ | | | ✓ | | |
| `attraction_ticket.booking.read` | | | ✓ | | | ✓ | | ✓ |
| `attraction_ticket.booking.cancel` | | | ✓ | | | ✓ | | |

*(Cột `OPERATION` ở 4 dòng `attraction_ticket.*` phía trên đúng ra thuộc "OPERATION", đã gộp đúng theo dữ liệu thật — xem ghi chú lệch cột ở phần Phát hiện bên dưới nếu cần đối chiếu lại số liệu thô.)*

**Số quyền mỗi role đang giữ:** SUPER_ADMIN 25/33, ADMIN 24/33, MANAGER 20/33, MARKETING 13/33, VIEWER 5/33, OPERATION 7/33, BOOKING 6/33, SALES 3/33.

## Phát hiện cần Founder biết (không tự sửa — ngoài phạm vi sprint theo quyết định #6)

**`SUPER_ADMIN` hiện KHÔNG có bất kỳ permission `attraction_ticket.*` nào (0/8).** Role mô tả là "Full platform access" nhưng dữ liệu `role_permissions` thật chỉ gán 8 quyền này cho `MANAGER`/`MARKETING`/`OPERATION`/`BOOKING`/`VIEWER` (seed `database/seeds/0008_attraction_ticket_categories.sql` chỉ chạy `where r.key in ('MANAGER','MARKETING')` cho 2 quyền đầu, các seed khác của module vé vui chơi tương tự — không có dòng nào cấp cho SUPER_ADMIN). Code (`shared/auth/guards.ts#hasPermission`) **không có bất kỳ special-case nào bỏ qua check cho SUPER_ADMIN** — nghĩa là nếu Admin Shell sau này có màn hình quản lý vé vui chơi, tài khoản SUPER_ADMIN hiện tại sẽ bị `FORBIDDEN` khi thao tác, trừ khi được gán thêm role `MANAGER` hoặc quyền được cấp trực tiếp.

Đây **không phải lỗi của Sprint này** và **không được tự sửa** ở đây theo đúng quyết định #6 (không tạo lại `role_permissions`). Nêu ra để Founder quyết định hướng xử lý khi module vé vui chơi có Admin UI (một sprint khác): (a) cấp thêm `role_permissions` cho `SUPER_ADMIN` (additive, insert thuần), hoặc (b) thêm cơ chế "SUPER_ADMIN luôn qua mọi permission check" ở tầng `hasPermission()` (thay đổi hành vi code, cần thiết kế riêng, ảnh hưởng rộng hơn).

## Áp dụng vào Admin Shell (Phase 5) — menu sinh theo permission

| Menu Admin Shell | Điều kiện hiện (permission cần **bất kỳ** quyền nào trong danh sách) | Role thấy được |
|---|---|---|
| Dashboard | Luôn hiện cho mọi user đã đăng nhập (không gate theo permission) | Cả 8 |
| Website CMS | `cms.page.read` | Cả 8 (mọi role đều có) |
| Media | `media.asset.read` | SUPER_ADMIN, ADMIN, MANAGER, MARKETING |
| Products | *(module Tour/Product Core chưa xây)* → hiện "Sắp triển khai", không gate theo permission vì chưa có permission tương ứng | — |
| Leads | *(module CRM chưa xây, `forms.submission.read` là gần nhất nhưng không phải "lead" thật)* → hiện "Sắp triển khai" cho tới khi CRM có permission riêng | — |
| Bookings | *(booking chung chưa xây — chỉ có `attraction_ticket.booking.*` scoped riêng module vé)* → hiện "Sắp triển khai" ở cấp menu chung; nếu muốn, có thể thay bằng "Vé vui chơi" dùng `attraction_ticket.booking.read` — quyết định UX, không phải audit | SUPER_ADMIN\* (xem phát hiện ở trên), MANAGER, BOOKING, VIEWER (chỉ đọc) |
| Users | `user.manage` | SUPER_ADMIN, ADMIN |
| Roles & Permissions | `role.manage` | SUPER_ADMIN, ADMIN |
| Settings | `settings.website.read` (xem) / `settings.website.update` (sửa) | SUPER_ADMIN, ADMIN, MANAGER, SALES, VIEWER (chỉ xem) |
| Audit Logs | `audit.read` | SUPER_ADMIN, ADMIN, MANAGER |

Quy tắc chung: ẩn/hiện menu chỉ là UX — mọi hành động ghi phía sau menu đó vẫn phải gọi lại `requirePermission()` ở server (đã có sẵn), không suy ra quyền từ việc menu có hiện hay không.
