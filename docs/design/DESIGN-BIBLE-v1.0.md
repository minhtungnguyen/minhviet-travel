# MV Ticket — Design Bible v1.0

**Module:** Vé vui chơi (Attraction Tickets) — `/ve-vui-choi`
**Trạng thái:** **APPROVED** — 12 tài liệu gốc đã duyệt, 10 quyết định bổ sung đã chốt (xem §3). **Chưa có React component, chưa có Tailwind class nào được viết** — bước tiếp theo là Implementation Plan (`mv-ticket/14-implementation-plan.md`), vẫn không phải code.
**Bản chất tài liệu:** Đây là một **Product**, không phải một Website. Toàn bộ 13 tài liệu dưới đây là tài sản thiết kế dài hạn — được viết để bất kỳ công cụ tạo code nào (con người, hoặc AI code generator bất kỳ — không giới hạn ở một công cụ cụ thể) đọc và triển khai đúng, không phụ thuộc vào ngữ cảnh hội thoại đã tạo ra nó.
**Điều kiện để chuyển sang code:** Toàn bộ 13 tài liệu phải được phê duyệt rõ ràng. Sau khi phê duyệt, bước tiếp theo là implementation plan (map từng tài liệu vào component/route cụ thể) — vẫn chưa phải code, là bước riêng sau Design Bible này.

---

## 0. Vấn đề đang giải quyết (1 câu)

UI hiện tại của `/ve-vui-choi` là một website Tour đổi tên — Design Bible này định nghĩa lại toàn bộ trải nghiệm sản phẩm để nó là một **marketplace vé vui chơi sôi động, tự phục vụ, bán được hàng**, không phải một trang landing page du lịch được dán nhãn lại.

---

## 1. Mục lục — 13 tài liệu, đọc theo đúng thứ tự

| # | Tài liệu | Trả lời câu hỏi |
|---|---|---|
| — | [`mv-ticket-ui-research.md`](./mv-ticket-ui-research.md) | Ngành này (Klook, KKday, GetYourGuide, Disney, Universal, Ticketmaster, Eventbrite, Traveloka Xperience, Airbnb Experience, Fever) đang làm gì đúng, sai, và Minh Việt nên học/tránh gì? |
| 01 | [`mv-ticket/01-design-direction.md`](./mv-ticket/01-design-direction.md) | Khách mua vé vui chơi nghĩ gì? Emotion nào đúng? Site map và user journey tổng thể ra sao? |
| 02 | [`mv-ticket/02-homepage-and-listing-concept.md`](./mv-ticket/02-homepage-and-listing-concept.md) | Homepage/Category/Card trông như thế nào ở dạng marketplace? |
| 03 | [`mv-ticket/03-product-detail-and-checkout-concept.md`](./mv-ticket/03-product-detail-and-checkout-concept.md) | Trang sản phẩm/Checkout/Voucher trông như thế nào khi không có timeline Tour? |
| 04 | [`mv-ticket/04-design-system.md`](./mv-ticket/04-design-system.md) | Color/Typography/Spacing/Animation/Responsive cụ thể là gì? |
| 05 | [`mv-ticket/05-brand-psychology.md`](./mv-ticket/05-brand-psychology.md) | 8 nhóm khách hàng (Show, Theme Park, Water Park, Safari, Gia đình, Couple, Doanh nghiệp...) khác nhau ra sao trong hành vi mua? |
| 06 | [`mv-ticket/06-design-emotion-map.md`](./mv-ticket/06-design-emotion-map.md) | Mỗi màn hình trong hành trình mua có emotion chủ đạo gì, vì sao? |
| 07 | [`mv-ticket/07-photography-guideline.md`](./mv-ticket/07-photography-guideline.md) | Ảnh/video nào được dùng, ảnh nào bị cấm, shot-list theo persona là gì? |
| 08 | [`mv-ticket/08-iconography.md`](./mv-ticket/08-iconography.md) | Hệ icon (style, màu, size, bộ icon theo category/chức năng) là gì? |
| 09 | [`mv-ticket/09-motion-guideline.md`](./mv-ticket/09-motion-guideline.md) | Từng animation cụ thể (card hover, search, booking, checkout, voucher) giải quyết vấn đề chuyển đổi nào? |
| 10 | [`mv-ticket/10-conversion-design.md`](./mv-ticket/10-conversion-design.md) | **(Quan trọng nhất)** Mỗi section trên mỗi trang có thực sự tăng conversion không — có bằng chứng gì nếu xoá đi? |
| 11 | [`mv-ticket/11-marketplace-strategy.md`](./mv-ticket/11-marketplace-strategy.md) | Flash Sale/Trending/Best Seller/Family Picks/Cross-sell/Recently Viewed/Wishlist — cái nào làm được ngay, cái nào cần chờ dữ liệu, cái nào không nên làm giả? |
| 12 | [`mv-ticket/12-design-rules.md`](./mv-ticket/12-design-rules.md) | 100 luật thiết kế cụ thể, kiểm tra được — checklist cuối cùng trước khi code. |
| 13 | [`mv-ticket/13-asset-library-strategy.md`](./mv-ticket/13-asset-library-strategy.md) | Ảnh/video thật lấy từ đâu, theo lộ trình nào — không hoàn thiện Hero/Card bằng placeholder. |
| 14 | [`mv-ticket/14-implementation-plan.md`](./mv-ticket/14-implementation-plan.md) | Build theo thứ tự nào, ai/gì làm trước, phạm vi V1 dừng ở đâu (không AI, không animation phức tạp). |

---

## 2. Nguyên tắc xuyên suốt cả 13 tài liệu (không lặp lại ở từng tài liệu con, nêu 1 lần ở đây)

1. **Sản phẩm, không phải website.** Mọi quyết định bám theo hành vi mua thật (`05`), không theo quy ước trình bày nội dung của một trang thông tin.
2. **Excitement là emotion chủ đạo module**, khác Trust/Calm của nền tảng Minh Việt — đây là ứng dụng đúng cơ chế "mỗi khu vực sản phẩm có emotion riêng" đã có sẵn trong `MV_Operating_System/docs/volume-01-design-dna/01-brand-emotion.md` §4 và `MASTER-BIBLE/VOLUME-13-VISUAL-EMOTION-SYSTEM/13.2-EMOTION-DNA.md` — không phải một ngoại lệ phá vỡ hệ thống.
3. **Sôi động ≠ Rẻ tiền/Giả tạo.** Ranh giới duy nhất giữ 2 thứ này tách biệt là **dữ liệu thật** — mọi badge, rating, urgency, con số phải có dữ liệu thật đứng sau, nếu không thì ẩn (luật 98–99 của `12`).
4. **Mọi thành phần phải chứng minh được vai trò chuyển đổi** (`10`) — không có thành phần tồn tại chỉ vì "đẹp" hoặc "trang khác cũng có".
5. **Mobile là ưu tiên số 1** — mọi khái niệm concept ở `02`/`03` được thiết kế mobile-first, desktop là mở rộng, không phải ngược lại.
6. **Additive, không phá vỡ nền tảng.** Mọi token màu/thành phần mới được thêm vào hệ thống hiện có (`app/globals.css`, `lucide-react`, `framer-motion`, các hook/pattern đã kiểm chứng), không thay thế hay viết lại nền tảng dùng chung cho các module khác (Flight/Combo/Tour/MICE).

---

## 3. Quyết định đã CHỐT (phê duyệt ngày duyệt Design Bible — không còn là open question)

| # | Quyết định | Kết luận cuối cùng | Nằm ở tài liệu |
|---|---|---|---|
| D1 | Màu sắc module | **Primary = Minh Việt Blue** (nguyên hệ Navy/Journey Blue/Sky Cyan đã có, không phải màu mới) + **Accent = Festival Orange** (CTA/giá/badge). **Không dùng Purple** — bỏ hoàn toàn khỏi hệ thống, kể cả cho category. Category chip active state dùng Minh Việt Blue, không dùng Orange (Orange dành riêng cho tín hiệu "tiền/hành động mua" — xem `04` §1) | `04` §1 (đã cập nhật) |
| D2 | Taxonomy category | **Bảng riêng `attraction_categories` + join `attraction_product_categories`** — không dùng tag/jsonb. Cần migration mới (`0018` trở đi, xem `14-implementation-plan.md` Phase 1B) | `01` §5.2, `14` |
| D3 | Asset Library | Có chiến lược nguồn ảnh/video riêng — xem `13-asset-library-strategy.md`. **Không hoàn thiện Hero/Card bằng ảnh placeholder** — mọi build UI dùng ảnh thật hoặc rõ ràng đánh dấu "chưa sẵn sàng nghiệm thu" | `13` |
| D4 | Corporate Booking | **Không build luồng đặt đoàn đầy đủ ở V1**, nhưng Information Architecture phải có lối rẽ (route + entry point) sẵn sàng để cắm vào sau — tái dùng pattern `LeadForm`/`ConsultationTabs` đã có (Combo/MICE) | `01` §5 (đã cập nhật), `05` §8, `14` |
| D5 | Wishlist | **Future — không build**, kể cả bản rút gọn client-side | `11` §5 |
| D6 | Brand Section (Homepage) | **Bắt buộc**, không phải section tuỳ chọn — venue/thương hiệu nổi bật (Sun World, VinWonders...) luôn hiển thị khi có ≥1 venue `is_featured` | `02` §1.2, `10` §2 (đã cập nhật) |
| D7 | Destination Tile | Phải hiển thị **số trải nghiệm** (đếm số `attraction_products` published qua venue thuộc destination đó), không chỉ tên + ảnh | `02` §1.2, `14` |
| D8 | Hero | Chiều cao **~60% viewport** (không phải 40–45% như đề xuất ban đầu), **Search box là trọng tâm thị giác của Hero**, không phải 1 field phụ bên dưới headline | `02` §1.3 (đã cập nhật) |
| D9 | Thứ tự build | **Mobile First** tuyệt đối — mọi phase implementation thiết kế/build màn hình mobile trước, mở rộng desktop sau, không làm song song 2 chiều | `14` |
| D10 | Card system | Chuẩn hoá đúng **3 loại Card** dùng xuyên suốt toàn module — không loại thứ 4. Xem bảng canonical ở `02` §3 (đã cập nhật) | `02` §3, `12` (đã cập nhật) |

---

## 4. Việc KHÔNG nằm trong phạm vi Design Bible này

- Không quyết định cấu trúc bảng database cụ thể (đã có ở `docs/mv-ticket/03-database-design.md`, Design Bible chỉ tham chiếu, không sửa đổi).
- Không viết component/route/API — đó là bước implementation plan, sau khi Design Bible được duyệt.
- Không chọn ảnh/video cụ thể — đó là công việc biên tập/asset (`13-asset-library-strategy.md`), Design Bible chỉ quy định tiêu chuẩn chọn ảnh.
- Không viết migration SQL thật cho `attraction_categories` (D2) hay gallery ảnh nhiều tấm (xem `14` — khoảng trống schema mới phát hiện) — đó là việc của Implementation Plan/Phase 1B, tài liệu này chỉ xác nhận hướng.

---

## 5. Trạng thái phê duyệt

**APPROVED.** 12 tài liệu gốc + 10 quyết định bổ sung (§3) đã được chủ dự án duyệt trực tiếp. Bước tiếp theo đã thực hiện: `13-asset-library-strategy.md` và `14-implementation-plan.md`. Sau khi Implementation Plan cũng được xác nhận, mới bắt đầu viết React component đầu tiên.

```
Người duyệt:        Chủ dự án (minhtungnguyen)
Ngày duyệt:         2026-07-27
Phê duyệt toàn bộ:  [x] Có, kèm 10 yêu cầu bổ sung — đã cập nhật vào §3 và các tài liệu con liên quan
```
