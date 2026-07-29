# 05 — UI/UX Specification

## 1. Định vị cảm xúc

Theo `MASTER-BIBLE/VOLUME-13-VISUAL-EMOTION-SYSTEM` §13.2: **Excitement** (sôi động, có kiểm soát), accent đề xuất **Purple + Orange**, hero "gia đình, trẻ em, trò chơi". Áp dụng đúng tỷ lệ đã dùng cho Combo trước đó (~70% Brand Foundation Navy/Blue, ~30% Emotion Layer) — **không** để Purple+Orange lấn át nền tảng, chỉ dùng ở CTA/badge/hover/icon-highlight, đúng quy tắc BRAND-003 §"Quy tắc sử dụng Accent". Vì `docs/Brand-System/BRAND-002/003` (nguồn chuẩn thật) chưa có module Ticket, xử lý **giống hệt cách đã làm cho Combo**: thêm 2 token mới (`--mv-ticket-purple`, `--mv-ticket-orange` hoặc tên tương đương) theo đúng khuôn additive đã dùng cho Cruise/MICE Gold và Combo Sunset — không quyết định giá trị hex cụ thể ở tài liệu Phase 0 này, để lúc code mới chốt cùng thiết kế UI thật (tránh chọn màu "trên giấy" không kiểm chứng bằng mắt).

## 2. Landing page — `/ve-vui-choi`

| Section | Nội dung | Component tái dùng |
|---|---|---|
| 1. Hero | Headline (đề xuất giữ tinh thần "Hôm nay bạn muốn vui chơi ở đâu?" hoặc biến thể ngắn hơn), search box lớn, ảnh/video giàu cảm xúc thật (KHÔNG dùng ảnh giữ chỗ khi nghiệm thu) | Pattern `combo-hero.tsx`/`combo-hero-media.tsx` (video-with-fallback, `prefers-reduced-motion` an toàn) |
| 2. Search box | Điểm đến, ngày, số lượng khách (tối giản, không quá nhiều field như Flight) | Mới, nhẹ — không copy nguyên `flight-search-box` (khác nghiệp vụ) |
| 3. Điểm đến nổi bật | Data-driven từ `destinations` (status='published'/'ACTIVE'), không hardcode | Pattern `ComboVisualTile`/`ComboDestinationExplorerSection` |
| 4. Thương hiệu/khu vui chơi nổi bật | `attraction_venues.is_featured = true` | Card mới, DNA giống `ComboCard` |
| 5. Vé bán chạy | `attraction_products` sort theo tiêu chí thật (KHÔNG fake lượt bán — nếu chưa có dữ liệu bán thật, dùng `is_featured`/`sort_order` thủ công, ghi rõ đây là "được đề xuất" không phải "bán chạy" nếu không đo được thật) | `ComboCard`-like |
| 6. Ưu đãi | Chỉ hiển thị nếu có dữ liệu giảm giá **thật** từ OneInventory hoặc override thủ công có ngày hết hạn thật — không badge % giả |
| 7. Gợi ý gia đình | Filter theo category/tag nếu model hỗ trợ (mở rộng `attraction_products` nếu cần tag — cân nhắc ở Phase 5, không thêm bảng tag riêng nếu chỉ cần 1-2 nhóm) |
| 8. Combo/dịch vụ liên quan | Link tĩnh sang `/combo`, `/tour-thiet-ke`... (giống `RelatedLinks` đã dùng ở Combo) |
| 9. Cam kết dịch vụ | Nội dung tĩnh biên tập (giao vé nhanh, hỗ trợ 24/7...) — trung thực, không cam kết chưa kiểm chứng được |
| 10. FAQ | Chỉ hiển thị nếu có FAQ thật; JSON-LD FAQPage chỉ render khi FAQ thật sự hiển thị (đúng §XII brief) |
| 11. Footer | `SiteFooter` có sẵn, không sửa |

## 3. Listing page

URL: `/ve-vui-choi/tat-ca` (khớp pattern `/combo/tat-ca` đã có) hoặc theo điểm đến `/ve-vui-choi/[destination-slug]` — **quyết định cần chốt ở Phase 2** (xem Open Question #7): brief yêu cầu URL sản phẩm dạng `/ve-vui-choi/[destination-slug]/[product-slug]`, nên listing theo điểm đến (`/ve-vui-choi/ha-long`) tự nhiên hơn là 1 trang "tất cả" tách rời — nhưng cũng cần 1 trang liệt kê toàn bộ không lọc theo điểm đến cho SEO/UX tìm kiếm rộng. Đề xuất: `/ve-vui-choi/tat-ca` = listing tổng (mirror `/combo/tat-ca`), `/ve-vui-choi/[destination-slug]` = listing đã lọc sẵn theo điểm đến (SEO-friendly, giống cấu trúc ví dụ brief đưa ra).

Thành phần bắt buộc: search, filter (điểm đến/loại hình/thương hiệu), khoảng giá (nếu dữ liệu hỗ trợ — phụ thuộc OneAPI có trả min/max giá theo venue hay không, xem `09-open-questions.md`), sort, pagination/load-more, empty/loading/error state — **tái dùng chính xác pattern đã kiểm chứng ở `app/combo/tat-ca/page.tsx`** (searchParams-driven, không client state mới).

## 4. Product detail — `/ve-vui-choi/[destination-slug]/[product-slug]`

| Phần | Ghi chú |
|---|---|
| Breadcrumb | Trang chủ → Vé vui chơi → [Điểm đến] → [Tên vé] |
| Gallery | `media_assets` liên kết `attraction_products`/`attraction_venues` |
| Highlights | Từ `attraction_venue_translations.highlights` |
| Rating | **Chỉ hiển thị nếu có dữ liệu thật** — hiện chưa có nguồn rating nào trong toàn bộ audit (không có bảng review) — mặc định **ẩn** cho tới khi có nguồn thật (đúng §VIII.C brief) |
| Khối đặt vé | Chọn ngày → gọi `checkAvailability`/`revalidatePrice` real-time → chọn loại vé → chọn số lượng → tổng giá cập nhật ngay |
| Chính sách | Từ `attraction_product_translations.cancellation_policy` + policy chung của venue |
| CTA đặt vé | Dẫn sang bước checkout — **không dùng "Đặt ngay" nếu backend chưa thật sự giữ chỗ tức thời**; vì OneAPI bước 7 "tự động xuất và giữ vé" ngay khi xác nhận thanh toán, "Đặt vé" trực tiếp là hợp lý một khi Adapter thật hoạt động (khác Combo — nơi vẫn cần nhân viên xác nhận) |
| Bản đồ | Optional — dùng `latitude`/`longitude` sẵn có trên `destinations`/tương lai `attraction_venues` nếu bổ sung |
| Sản phẩm liên quan | `attraction_cross_sells` + sản phẩm cùng `attraction_venue_id` |

**Desktop:** booking panel sticky bên phải (giống pattern đã dùng cho Tour/Flight detail nếu có, hoặc thiết kế mới nhất quán token/shadow hệ thống).
**Mobile:** sticky bottom CTA, không che nội dung, không đè `MobileCTA`/cookie banner sẵn có (bài học đã ghi nhận từ audit Combo P2-02) — kiểm tra tương tác với `MobileCTA` toàn site nếu có.

## 5. Checkout

Tối thiểu theo brief: sản phẩm, ngày, loại vé, số lượng, người dùng vé (nếu OneAPI yêu cầu — **chưa xác nhận field-level**), người liên hệ (tên/SĐT/email), ghi chú, tổng tiền, chính sách, đồng ý điều khoản. Route đề xuất `/ve-vui-choi/dat-ve/[bookingId]` (khớp pattern `/ve-may-bay/dat-ve/[flightId]` đã có) hoặc gộp làm modal/step trong trang detail nếu UX đơn giản hơn — **quyết định ở Phase 2 dựa trên test UI thật**, không chốt cứng ở tài liệu.

## 6. Booking result

6 trạng thái theo brief: Pending/Processing/Confirmed/Failed/Cancelled/Voucher issued — map trực tiếp từ `attraction_order_status` enum (`03-database-design.md`). Route: `/ve-vui-choi/ket-qua/[bookingId]` — 1 route xử lý nhiều trạng thái bằng polling ngắn (khác Flight tách 3 route riêng `thanh-cong/that-bai/thanh-toan`, vì Flight là mock không polling thật; Ticket có backend thật nên có thể polling `getOrderDetail` và render đúng trạng thái tại chỗ, tránh 3 route trùng lặp logic).

Bắt buộc có: mã đơn Minh Việt (hiển thị), mã đơn provider (nội bộ/hỗ trợ, cân nhắc không phô ra URL — dùng `bookingId` nội bộ làm route param, không dùng `order_code` hay `provider_order_id` trực tiếp làm identifier công khai nếu dễ đoán — brief "không công khai identifier nhạy cảm trong URL"), hotline hỗ trợ, hướng dẫn nhận vé, nút xem/tải voucher (chỉ hiện khi `status = 'VOUCHER_ISSUED'` và có `download_url`/`hash_code` hợp lệ).

## 7. Trạng thái bắt buộc mọi nơi có dữ liệu động

Loading skeleton, empty state, error state — đẹp, nhất quán token hệ thống, không dùng text lỗi kỹ thuật thô cho khách hàng (map qua thông báo thân thiện, đúng §I.13 brief).

## 8. Responsive breakpoints bắt buộc kiểm tra

360 / 390 / 768 / 1024 / 1280 / 1440px — không horizontal scroll, không vỡ layout, không CLS nghiêm trọng (đặc biệt ảnh hero + gallery), modal không vượt viewport.

## 9. SEO

- `generateMetadata` theo đúng pattern `app/ve-may-bay/page.tsx`/`app/combo/page.tsx` — field SEO nằm trong content schema (Zod), không hardcode.
- JSON-LD: thêm `TicketProductJsonLd`/`AttractionVenueJsonLd` vào `components/seo/json-ld.tsx` theo đúng pattern các component đã có (`TourDetailJsonLd`, `FlightDetailJsonLd`). Dùng schema.org `TouristAttraction` cho venue, cân nhắc `Product`/`Offer` cho vé nếu giá/currency hợp lệ theo schema.org spec — **không tạo structured data giả nếu thiếu field bắt buộc** (đúng §XII).
- Slug tiếng Việt không dấu, `redirect_rules`/`next.config.mjs` xử lý đổi slug (xem `02-system-architecture.md` §8).
- Breadcrumb schema đi kèm breadcrumb UI thật (không tách rời).

## 10. Điều KHÔNG làm (nhắc lại §IX brief)

Không nền vàng/kem lỗi thời, không lạm dụng gradient/glassmorphism, không animation phô trương, không card dày đặc thiếu khoảng trắng, không placeholder ảnh xấu khi nghiệm thu UI.
