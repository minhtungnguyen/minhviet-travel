# 01 — Product Scope (V1)

## 1. Mục tiêu V1

Một trang thương mại thật cho "Vé vui chơi" tại `/ve-vui-choi` (đổi từ `/tickets` — xem quyết định URL ở §5), kết nối OneInventory OneAPI, có thể tạo doanh thu ngay khi go-live: khách tìm được khu vui chơi, xem loại vé và giá thật, đặt vé, thanh toán, nhận voucher.

## 2. Trong phạm vi V1 (IN)

| Hạng mục | Chi tiết |
|---|---|
| Landing page | Hero, search box, điểm đến nổi bật, vé bán chạy, ưu đãi (thật, không giả), gợi ý gia đình, cross-sell nội bộ Minh Việt, cam kết dịch vụ, FAQ, footer |
| Listing page | Search, filter điểm đến/loại hình/thương hiệu, sort, pagination/load-more, empty/loading/error state |
| Product detail | Gallery, highlights, chọn ngày + loại vé + số lượng, giá, chính sách, CTA, mô tả, hướng dẫn sử dụng, điều kiện vé, chính sách hủy, FAQ, sản phẩm liên quan |
| Checkout | Thông tin sản phẩm đã chọn, người liên hệ, người dùng vé (nếu OneInventory yêu cầu), tổng tiền, đồng ý điều khoản |
| Booking result | Pending/Processing/Confirmed/Failed/Cancelled/Voucher issued, mã đơn Minh Việt + provider, hướng dẫn nhận vé, hotline hỗ trợ |
| CMS quản trị | Destinations (map từ `master-data` có sẵn), Attractions, Ticket Products, Provider References, Content Overrides, SEO metadata, FAQ, Highlights, Cross-sell, Bookings (đọc), Customers (đọc), Sync logs, API error logs |
| OneInventory Adapter | Implement `AttractionTicketProvider` (mở rộng có kiểm soát — xem `02-system-architecture.md`), Sandbox trước, Production sau khi duyệt |
| Booking + Voucher | Tạo đơn thật, xác nhận thanh toán, lấy voucher theo đúng luồng OneAPI (10 bước trong tài liệu §II.3) |
| SEO | Metadata động, canonical, OG/Twitter card, sitemap, robots, breadcrumb schema, TouristAttraction/Product schema (chỉ khi dữ liệu hợp lệ), FAQ schema (chỉ khi FAQ thật sự hiển thị) |
| Responsive | 360/390/768/1024/1280/1440px, mobile-first, sticky CTA mobile |
| Error handling | Logging + error mapping + retry có kiểm soát + thông báo thân thiện cho mọi lỗi gọi OneInventory |

## 3. Ngoài phạm vi V1 (OUT — không xây)

Theo đúng nguyên tắc §I của brief, liệt kê tường minh để không ai vô tình xây thêm:

- AI Planner / gợi ý lịch trình bằng AI
- Dynamic Pricing (giá luôn lấy trực tiếp từ OneInventory tại thời điểm truy vấn, Minh Việt không tự tính lại giá)
- Loyalty / tích điểm
- Affiliate
- Marketplace nhiều người bán
- Multi-provider routing (OneInventory là provider **duy nhất** trong V1 — interface Adapter cho phép mở rộng sau nhưng **không xây UI/logic chọn provider** trong V1)
- Multi-currency (chỉ VND, khớp `currency: 'VND'` literal type đã dùng ở module Combo)
- Native mobile app
- Animation phức tạp không phục vụ chuyển đổi (không thêm parallax/3D/particle effect)
- Trang chi tiết khu vui chơi (Attraction) độc lập với trang sản phẩm vé — V1 gộp thông tin khu vui chơi vào trang chi tiết sản phẩm (giống cấu trúc URL 2 cấp `/ve-vui-choi/[destination]/[product]` đã yêu cầu), không tạo thêm 1 loại trang riêng cho "Attraction" nếu chưa có nhu cầu SEO rõ ràng
- Hệ thống tài khoản khách hàng (đăng ký/đăng nhập) trên site Minh Việt cho riêng module Ticket — OneAPI có API "Người dùng" (§6 trong tài liệu) nhưng đây nhiều khả năng là quản lý user ở **cấp merchant/đại lý** trên hệ thống OneInventory, không phải tài khoản khách hàng cuối. Xem `09-open-questions.md` #3. V1 checkout **không bắt buộc đăng nhập** (guest checkout), khớp mô hình "Editorial Commerce Landing Page" đã dùng ở Combo/MICE.
- Notification/CRM sync tự động phức tạp — chỉ ghi nhận booking, gửi email/SMS xác nhận cơ bản (kênh cụ thể là open question — xem `09-open-questions.md`)
- Integration Registry admin UI (bảng `integration_providers`/`integration_connections`) — dùng cách "inject trực tiếp qua constructor + env var" theo playbook hiện có, không khôi phục bảng registry trong V1 trừ khi có provider thứ 2 thật

## 4. Emotion & vị trí trong hệ sinh thái

Theo `MASTER-BIBLE/VOLUME-13-VISUAL-EMOTION-SYSTEM` §13.1/13.2: Module "Vé vui chơi" = **Excitement** (sôi động), accent đề xuất **Purple + Orange**. Đây là module duy nhất trong ma trận Volume 13 gán 2 màu accent — cần làm rõ tỷ lệ dùng (xem `05-ui-ux-specification.md`). Lưu ý: giống phát hiện đã ghi nhận ở audit Combo trước đó, `docs/Brand-System/BRAND-002/003` (nguồn màu chuẩn đã wire vào `globals.css`) **cũng chưa có module Ticket/Excitement** — cùng một khoảng trống tài liệu, xử lý theo đúng cách đã dùng cho Combo: bổ sung token phụ có kiểm soát, không phá nền tảng Navy/Blue.

## 5. Quyết định URL: `/tickets` → `/ve-vui-choi`

Brief yêu cầu URL cuối cùng là `/ve-vui-choi` (tiếng Việt không dấu, khớp pattern `/ve-may-bay`, `/combo`, `/mice` đã dùng toàn site). Route hiện tại `app/tickets/page.tsx` là placeholder tiếng Anh, đã có trong `sitemap.ts` và nav (`href: '/tickets'`). **Quyết định:** xây route mới `/ve-vui-choi`, cập nhật `site-header.tsx` nav item (href, không đổi label — 1 dòng), thêm redirect `/tickets` → `/ve-vui-choi` (301, qua `redirect_rules` table đã có sẵn ở module `seo` hoặc `next.config.mjs` redirects — quyết định kỹ thuật ở `02-system-architecture.md`), giữ nguyên `app/tickets/` không xoá file ngay (deprecate) để không phá URL đã index. Đây là thay đổi **có chạm** vào `site-header.tsx` — mức độ: 1 dòng, không đổi kiến trúc, không phá module khác.

## 6. Tiêu chí hoàn thành V1 (tham chiếu XVII của brief)

Xem đầy đủ tại `08-go-live-checklist.md`. Tóm tắt: Landing/Listing/Detail/Checkout/Booking Sandbox/Voucher/CMS/SEO/Mobile/Error handling đều hoạt động thật trên Sandbox OneInventory trước khi xin duyệt Production.
