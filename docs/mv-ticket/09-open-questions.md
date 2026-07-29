# 09 — Open Questions

Sắp xếp theo mức độ chặn tiến độ. **#1 là blocker cứng cho Phase 3**, các mục còn lại cần trả lời trước phase tương ứng nhưng không chặn bắt đầu Phase 1-2.

## 🔴 Blocker

### #1. Tài liệu OneAPI thiếu toàn bộ phần đặc tả endpoint (Mục III, trang 8–50/50)

File hiện có trong repo (`docs/integrations/oneinventory/Giới thiệu_Tài liệu đặc tả kỹ thuật OneAPI (1).pdf`) chỉ chứa 7 trang đầu (Giới thiệu + Mô hình kết nối). Toàn bộ chi tiết kỹ thuật — endpoint path, HTTP method, request field, response field, mã lỗi, cho tất cả 19 API liệt kê trong mục lục (Khu vui chơi, Vị trí địa lý, Loại hình, Tìm kiếm khu vui chơi, Tìm kiếm loại vé, Tạo đơn hàng, Xác nhận thanh toán, Chi tiết đơn hàng, Xem vé, Hủy đơn hàng, Danh sách đơn hàng, 6 API Người dùng, 2 API Thanh toán) — **không có trong repo**.

**Cần:** bản đầy đủ tài liệu (ít nhất trang 8-50) HOẶC Postman collection / sandbox API key + base URL để tự khám phá qua gọi thử. Không thể viết `OneInventoryProvider` thật (Phase 3) nếu thiếu.

## 🟠 Cần quyết định trước phase liên quan (không chặn Phase 0-2)

### #2. Chốt định dạng HTTP Authorization Header

Tài liệu xác nhận có dùng "HTTP Authorization Header" nhưng không rõ scheme (`Bearer <token>`? `Basic`? custom header tên riêng như `X-API-Key`?). Nằm trong phần bị thiếu — gộp chung với #1 nhưng tách riêng vì ảnh hưởng trực tiếp thiết kế `one-inventory-http-client.ts`.

### #3. Bản chất API "Người dùng" (6.1–6.6) — merchant user hay khách hàng cuối?

Mục lục có Đăng ký/Đăng nhập/Quên-Đổi mật khẩu/Thông tin/Chỉnh sửa/Quản lý người dùng (danh sách, kích hoạt, xóa). Đây có khả năng cao là API quản lý **tài khoản merchant/nhân viên đại lý** trên hệ thống OneInventory (để nhân viên Minh Việt đăng nhập backend OneInventory quản lý), **không phải** tài khoản khách hàng cuối mua vé. Nếu đúng vậy, module Ticket V1 (guest checkout, không tài khoản khách hàng) **không cần dùng nhóm API này**. Cần xác nhận trước khi quyết định bỏ hẳn hay phải tích hợp 1 phần (ví dụ: 1 tài khoản merchant duy nhất được tạo thủ công 1 lần, không qua code).

### #4. `revalidatePrice`/`searchAvailability` có API riêng hay lồng trong "Tìm kiếm loại vé" (4.2)?

Changelog dòng 3 (trang 2 của PDF) ghi: "Loại bỏ tham số đầu vào theo ngày sử dụng, bổ sung ngày sử dụng có sẵn ở đầu ra" cho API Tìm kiếm khu vui chơi (không phải Tìm kiếm loại vé) — gợi ý khả dụng theo ngày có thể nằm ở tầng "khu vui chơi" (4.1) chứ không phải tầng "loại vé" (4.2). Ảnh hưởng cách thiết kế UI chọn ngày (chọn ngày trước hay sau khi chọn loại vé). Cần xác nhận cùng lúc với #1.

### #5. `changeUsageDate` (đổi ngày sử dụng) có được OneAPI hỗ trợ không?

Không thấy mục nào trong Mục lục tên tương ứng ("Đổi ngày sử dụng" không xuất hiện). Method này đã có sẵn trong contract `AttractionTicketProvider` (viết trước khi có tài liệu này) — có thể OneAPI không hỗ trợ, và method sẽ throw "not supported" hoặc bị bỏ khỏi V1 UI (không hiện nút "đổi ngày" nếu backend không hỗ trợ). Xác nhận cùng #1.

### #6. Luồng thanh toán thật — Minh Việt tự thu tiền hay OneInventory/cổng thứ 3 xử lý?

API 7.1 "Danh sách phương thức thanh toán" và 7.2 "Kiểm tra trạng thái thanh toán tạm thời" gợi ý có thể có redirect sang cổng thanh toán (giống mô hình OTA thường dùng QR/chuyển khoản/thẻ qua cổng trung gian). Cần xác nhận: (a) Minh Việt tích hợp cổng thanh toán riêng (VNPay/Momo/ZaloPay...) rồi chỉ gửi "đã thanh toán" cho OneInventory ở bước 5.2? Hay (b) OneInventory tự có cổng thanh toán, Minh Việt chỉ redirect khách sang? Ảnh hưởng lớn tới kiến trúc Checkout — **cần trả lời sớm nhất có thể trong nhóm 🟠**, gần mức độ blocker.

### #7. Cấu trúc URL listing — theo điểm đến hay danh sách phẳng?

Đề xuất ở `05-ui-ux-specification.md` §3 (`/ve-vui-choi/tat-ca` + `/ve-vui-choi/[destination-slug]`) — cần Product Owner xác nhận trước khi cố định route tại Phase 2.

### #8. Có Admin UI (frontend quản trị) cho các module hiện có không, hay chỉ có API?

Từ audit backend: `app/api/v1/**` đầy đủ nhưng chưa xác nhận có `app/admin/**` (frontend) tương ứng render CMS. Nếu chưa có Admin UI frontend chung nào, CMS cho Ticket ở Phase 5 phải tự xây UI riêng (tăng phạm vi đáng kể) hoặc dùng tạm Supabase Studio / API trực tiếp cho V1 (giảm phạm vi, hợp lý cho V1 nếu số lượng sản phẩm ít). **Cần quyết định phạm vi CMS thật trước Phase 5** — brief nói "Không xây CMS quá lớn", nên xu hướng đề xuất: CMS tối giản, ưu tiên các thao tác cần thiết nhất (publish/unpublish, sửa content override, xem booking/sync log), không xây full admin dashboard mới nếu chưa có nền sẵn.

### #9. Kênh thông báo khách hàng sau khi đặt vé thành công

Brief không chỉ định cụ thể (email? SMS? cả hai?). Repo hiện có `LEADS_WEBHOOK_URL`/`NEWSLETTER_WEBHOOK_URL` (webhook, không phải email service thật) và `EmailProvider` contract mới có `ConsoleEmailProvider` (dev-only, chỉ log). Cần quyết định: dùng email thật (cần chọn provider — Resend/Zoho — và xin credential) hay tạm thời chỉ hiển thị trên trang kết quả + hotline cho V1.

### #10. Trạng thái hợp đồng/thương mại với OneInventory

Ngoài phạm vi kỹ thuật nhưng chặn go-live Production: đã có hợp đồng/API key Production thật với ezCloud chưa, hay hiện tại chỉ có tài liệu kỹ thuật để nghiên cứu? Ảnh hưởng timeline Phase 7.

### #11. Có bổ sung Playwright (E2E tự động) cho repo hay giữ nguyên chỉ Vitest?

Xem `07-test-plan.md` §0 — đây là quyết định thêm tooling mới cho toàn repo, không riêng module Ticket, nên cần chủ dự án duyệt thay vì tự ý thêm dependency lớn.

### #12. `faqs`/`faq_categories` có polymorphic attach theo sản phẩm cụ thể không?

Xem `03-database-design.md` §2.6 — quyết định có tái dùng module `faq` hiện có hay tạo `attraction_faqs` riêng.

### #13. Cơ chế deploy/CI-CD thật của repo

`00-current-state-audit.md` §9 — không tìm thấy pipeline trong repo, cần xác nhận với chủ dự án để biết cách rollback code thật sự diễn ra ở đâu (Vercel dashboard? thủ công?).

### #14. Bảng giá tối thiểu/tối đa cho filter "khoảng giá" ở Listing

Phụ thuộc OneAPI có trả sẵn field này ở cấp venue hay phải tính toán phía Minh Việt từ toàn bộ variant — thuộc nhóm chờ tài liệu đầy đủ (#1), tách riêng vì ảnh hưởng thiết kế filter UI.

---

## Tổng hợp hành động đề xuất ngay

1. Gửi yêu cầu tới ezCloud/OneInventory xin tài liệu đầy đủ (trang 8-50) hoặc sandbox Postman collection — **việc quan trọng nhất, làm trước tiên**, song song với Phase 1-2 (không chặn 2 phase đó).
2. Chủ dự án xác nhận nhanh #3 (bản chất API Người dùng), #6 (luồng thanh toán), #7 (cấu trúc URL), #8 (phạm vi CMS) — đều là quyết định sản phẩm/kiến trúc, không cần chờ tài liệu OneAPI.
3. Chủ dự án tự điền `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_DATABASE_URL` vào `.env.local` trước Phase 4 (không ai khác lấy được key này).
