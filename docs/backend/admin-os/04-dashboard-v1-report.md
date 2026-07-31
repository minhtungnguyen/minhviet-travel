# 04 — Dashboard V1 Report (Phase 3)

**Trạng thái:** Hoàn thành phạm vi Phase 3. **Chưa push Production.**

---

## Nguyên tắc áp dụng: không có bảng → không có số, không suy đoán số từ bảng khác

Trước khi code, đã truy vấn trực tiếp Supabase để xác nhận **bảng nào thực sự tồn tại** cho từng khái niệm brief yêu cầu (`Leads`, `Bookings`, `Customers`, `Products`, `Articles`). Kết quả — và cách xử lý từng trường hợp:

| Khái niệm | Bảng thật | Số hiện tại | Cách hiển thị |
|---|---|---|---|
| Leads | `form_submissions` (module Forms có thật) | 0 | Giá trị thật (0 → Empty State "Chưa có lead nào") |
| Bookings | `attraction_orders` (module vé vui chơi — **duy nhất** có khái niệm "booking" thật trong DB, không có bảng booking chung cho tour/flight) | 0 | Giá trị thật, **nhưng bị chặn quyền**: SUPER_ADMIN hiện thiếu `attraction_ticket.booking.read` (đúng gap đã ghi nhận ở `docs/backend/auth/03-rbac-matrix.md` từ Phase 0) → tile hiện "Không có quyền xem", không hiện "0" (0 sẽ nói dối — 0 nghĩa là "đã xem, không có gì", còn ở đây là "không được xem") |
| Customers | **Không có bảng nào** — không có CRM, không có bảng `customers` | — | "Sắp triển khai". Đã cân nhắc và **từ chối** dùng `user_profiles` (đó là tài khoản nhân viên nội bộ, không phải khách hàng) — dùng nhầm sẽ chính là kiểu "fake data" brief cấm |
| Products | `attraction_products` (chỉ có catalog vé vui chơi, không có catalog Tour/Flight/Hotel chung) | 11 | Giá trị thật, ghi rõ nguồn "Vé vui chơi" để không ngộ nhận là tổng sản phẩm toàn hệ thống |
| Articles | `cms_pages` với `slug like 'brand/news/%'` (đúng quy ước News đã dùng ở `lib/cms/news.ts`) | 0 | Giá trị thật (0 → Empty State "Chưa có bài viết nào") |

**Không tự thêm cột/bảng nào.** Không có migration nào trong Phase 3.

## Checklist Phase 3 so với brief

| Yêu cầu | Trạng thái |
|---|---|
| Welcome card: tên, role, organization, thời gian | ✅ `profile.display_name`, `actor.roles` (badge), `organizations.display_name` (qua `OrganizationService.getOrganization` — không cần permission đặc biệt để xem tổ chức của chính mình), thời gian render server-side theo `vi-VN` |
| Quick Stats đọc trực tiếp DB, Empty State nếu chưa có dữ liệu, không fake | ✅ Xem bảng trên — mọi tile đều truy vấn thật; thêm 2 state ngoài "value"/"empty" mà brief không nêu tên nhưng cần để trung thực: **"denied"** (có bảng, có quyền là điều kiện, nhưng actor hiện tại thiếu quyền) và **"not_built"** (không có bảng/module) |
| Quick Actions: New Article / New Lead / New Booking / Upload Media / Settings | ⚠️ Chỉ **2/5 có đích thật**: "Tải lên Media" → `/admin/media`, "Cài đặt" → `/admin/settings`. 3 mục còn lại (**Bài viết mới, Lead mới, Booking mới**) chưa có luồng tạo mới thật nào trong code (không có `/admin/news`, không có CRM, không có Booking admin) → hiển thị "Sắp triển khai" giống hệt cách Sidebar xử lý mục chưa có, **không trỏ tới link chết** |
| Recent Activities đọc `audit_logs` | ✅ `AuditQueryService.listAuditLogs(actor, {pageSize:5})` — tái dùng nguyên service đã có, không viết query mới. Ẩn cả khối nếu actor không có `audit.read` (không phải mọi role đều có quyền này) |
| Notifications đọc `announcements` | ✅ `CmsService.listAnnouncements(websiteId)` — tái dùng đúng service đã dùng ở trang `/admin/cms/announcements` |
| Recent Login đọc auth history | ✅ Lọc `audit_logs` theo `search: 'auth.login'` (tái dùng cùng service, không thêm bảng/cột mới), kèm email thật qua `lookupAuthEmails()` (đã có sẵn, dùng ở trang Users) |
| Sidebar giữ nguyên | ✅ Không đụng `admin-shell.tsx`/`nav-config.ts` trong Phase 3 |
| Responsive | ✅ Verify 1440/768/390 bằng Playwright (route QA tạm, đã xoá) — không vỡ layout ở breakpoint nào |
| typecheck/lint/test/build | ✅ Cả 4 sạch |

## Vì sao mọi thứ hiện đang trống

Dữ liệu thật hiện tại: `form_submissions=0`, `attraction_orders=0`, `cms_pages` (news)=0, `announcements=0`, `audit_logs=0` — **đúng thực tế**, vì Production chưa có ai thao tác thật (SUPER_ADMIN chưa từng đăng nhập — Phase 1). Riêng `attraction_products=11` là dữ liệu thật đã có (seed catalog vé vui chơi). Dashboard vì vậy sẽ hiện phần lớn Empty State cho tới khi có người dùng thật — **đúng như brief yêu cầu, không fake để "trông đẹp hơn"**.

## Kết quả `pnpm typecheck` / `lint` / `test` / `build`

| Lệnh | Kết quả |
|---|---|
| `pnpm typecheck` | ✅ Sạch |
| `pnpm lint` | ✅ Sạch |
| `pnpm test` | ✅ 30 test file / 182 test, pass 100% |
| `pnpm build` | ✅ Pass |

## File thay đổi

| File | Loại | Nội dung |
|---|---|---|
| `components/admin/dashboard-view.tsx` | **Mới** | Server Component thuần render toàn bộ Dashboard (welcome/stats/actions/activities/notifications/logins) từ props đã resolve — tách riêng để `app/admin/page.tsx` chỉ lo phần fetch dữ liệu |
| `app/admin/page.tsx` | Sửa | Fetch dữ liệu thật cho mọi block (organization, form_submissions, attraction_orders, attraction_products, cms_pages news, audit_logs, announcements), gate theo permission đúng chỗ, không service/repository mới nào được viết — tái dùng 100% service đã có (`FormsService`, `AuditQueryService`, `CmsService`, `OrganizationService`, `lookupAuthEmails`) |

Không đụng file nào khác. Route QA tạm `app/dev-dashboard-preview/` (mock props, không chạm auth/DB) đã tạo, chụp màn hình, và **xoá sạch** trước khi commit.
