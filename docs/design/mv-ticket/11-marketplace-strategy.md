# MV Ticket — Marketplace Strategy

**Đây không phải Landing Page. Đây là Marketplace.**

Landing Page thuyết phục 1 câu chuyện cho 1 loại khách. Marketplace phục vụ nhiều persona (`05-brand-psychology.md`) cùng lúc, mỗi người có một lối vào khác nhau, và giữ khách quay lại nhiều lần trước cả khi họ mua lần đầu. Tài liệu này định nghĩa từng cơ chế marketplace tiêu chuẩn ngành (Flash Sale, Trending, Best Seller...) và — quan trọng hơn — **cơ chế nào có thể làm thật ngay bây giờ, cơ chế nào cần dữ liệu chưa tồn tại, và cơ chế nào không nên làm giả để lấp chỗ trống.**

Mọi cơ chế dưới đây đã được chạy qua khung kiểm tra ở `10-conversion-design.md` §1 và kỷ luật dữ liệu thật ở `01-design-direction.md` §7.

---

## 1. Bảng tổng hợp — sẵn sàng ngay / cần bổ sung schema / chỉ dùng khi có dữ liệu vận hành thật

| Cơ chế | Trạng thái dữ liệu hiện tại | Sẵn sàng cho V1? | Cách làm đúng |
|---|---|---|---|
| Best Seller / Trending | Không có bảng thống kê lượt bán/lượt xem public | **Không** | Thay bằng "Được đề xuất" dùng `is_featured`/`sort_order` — nhãn trung thực, không tự nhận là "bán chạy" khi không đo được |
| Just Released | Có `created_at` trên `attraction_products` | **Có** | Sort theo `created_at desc`, nhãn "Mới ra mắt" cho sản phẩm trong N ngày gần nhất — dữ liệu thật 100% |
| Family Picks / Theme Park / Category khác | Taxonomy category — **đã chốt: bảng riêng `attraction_categories`** (D2, không dùng tag) | **Có — chờ migration** | Cần migration mới (`14-implementation-plan.md` Phase 1B) trước khi dải này có dữ liệu thật để render |
| Brand (Sun World, VinWonders...) | `attraction_venues.is_featured` đã có | **Có** | Dải venue nổi bật, không cần bảng mới |
| Destination | `destinations` published đã có | **Có** | Đã dùng cho Combo trước đó — pattern đã kiểm chứng |
| Recommendation (gợi ý cá nhân hoá) | Không có hành vi người dùng được lưu (V1 guest checkout, không có bảng customer/hành vi) | **Không** | Xem §3 — thay bằng "Recommendation phi cá nhân hoá" (biên tập/rule-based), không giả vờ là AI cá nhân hoá khi không có dữ liệu hành vi |
| Cross Sell | `attraction_cross_sells` đã có bảng | **Có** | Đã thiết kế sẵn ở schema, dùng trực tiếp |
| Recently Viewed | Không cần bảng mới — có thể làm client-side | **Có** | Xem §4 — dùng `sessionStorage`/`localStorage`, đúng pattern đã dùng cho `FlightBookingDraft` (`lib/flight/flight-booking-draft.ts`) |
| Continue Browsing | Giống Recently Viewed | **Có** | Cùng cơ chế client-side |
| Flash Sale | Không có cơ chế campaign/thời hạn giảm giá thật trong schema V1 | **Không** | Xem §2 — không dựng UI đếm ngược cho tới khi có trường `discount_ends_at`/`original_price` thật |
| Wishlist | Không có bảng customer/account (V1 là guest checkout — `03-database-design.md` §3) | **Không — đã được đánh dấu "Future" ngay trong yêu cầu** | Xem §5 |

---

## 2. Flash Sale — vì sao KHÔNG làm ở V1, và điều kiện để làm đúng sau này

Nghiên cứu (`mv-ticket-ui-research.md` §1) xác nhận Flash Sale là cơ chế mạnh (Klook chạy khung giờ cố định 21h hàng đêm) — **nhưng sức mạnh của nó đến từ việc có thật**: giá gốc thật, thời hạn thật, số lượng giới hạn thật. Dựng UI đếm ngược/badge giảm giá khi `attraction_products` hiện chỉ có `price_from` (không có `original_price`, không có trường thời hạn) sẽ tạo ra chính xác anti-pattern đã cấm ở `01-design-direction.md` §7 — và đây là hành vi bị người dùng nhận ra rất nhanh (Fever, research §10: badge cảm xúc lặp lại vô căn cứ mất giá trị tín hiệu).

**Điều kiện để bật Flash Sale thật (không thuộc phạm vi Design Bible, là quyết định sản phẩm/kỹ thuật sau này):**
1. Thêm trường `original_price` và `discount_ends_at` (hoặc bảng campaign riêng) vào schema.
2. Có cơ chế vận hành thật đặt giá gốc/giá khuyến mãi (không phải nhập tay 1 lần rồi quên cập nhật `discount_ends_at`).
3. Khi đó mới thiết kế UI đếm ngược — tuân theo đúng thông số động lượng đã khoá ở `09-motion-guideline.md`.

---

## 3. Recommendation — phi cá nhân hoá, không giả vờ là AI

Vì V1 không lưu hành vi người dùng (không tài khoản, không lịch sử duyệt web phía server), "Sản phẩm liên quan"/"Có thể bạn thích" ở V1 phải là **rule-based, minh bạch về bản chất**:

- Trên Product Detail: `attraction_cross_sells` (biên tập thủ công theo venue/liên quan địa lý) — đã có bảng, đúng cách làm.
- Trên Homepage: theo category cùng nhóm hoặc theo điểm đến đang xem gần nhất trong phiên (client-side, xem §4) — không phải machine learning, không cần giả vờ là vậy. Nhãn hiển thị nên trung tính ("Có thể bạn thích", "Liên quan") thay vì ngụ ý cá nhân hoá sâu ("Dành riêng cho bạn") khi cơ chế thực chất là rule-based.

Khi nào nâng cấp lên cá nhân hoá thật: chỉ sau khi có tài khoản khách hàng + lịch sử đặt vé thật (ngoài phạm vi V1 theo `03-database-design.md` §3).

---

## 4. Recently Viewed & Continue Browsing — làm được ngay, không cần backend mới

**Cơ chế:** lưu danh sách `productSlug` đã xem trong phiên hiện tại vào `sessionStorage` (nếu chỉ cần trong phiên) hoặc `localStorage` (nếu muốn giữ qua nhiều lần ghé thăm) ở phía client — đúng pattern đã được chấp nhận và kiểm chứng trong hệ thống cho `FlightBookingDraft` (`lib/flight/flight-booking-draft.ts`, `use-booking-draft.ts`). Không cần bảng database mới, không cần tài khoản khách hàng.

**Vai trò chuyển đổi (theo khung `10-conversion-design.md` §1):**
1. Vai trò: đưa khách quay lại đúng sản phẩm đang cân nhắc mà không phải tìm lại từ đầu — đặc biệt quan trọng cho hành vi "so sánh 2–3 nguồn" đã nêu trong Decision Journey chung (`05-brand-psychology.md` §1).
2. Giai đoạn phễu: Cân nhắc (khách đã xem, chưa quyết định).
3. Nếu xoá: khách rời trang giữa chừng (đóng tab so giá chỗ khác) khó quay lại đúng sản phẩm, tăng rò rỉ chuyển đổi ở đúng nhóm khách gần chuyển đổi nhất.
4. Dữ liệu: 100% có thể làm thật ngay — chỉ là `productSlug` + timestamp lưu client-side, không có rủi ro dữ liệu giả.
5. Đo lường: tỷ lệ khách quay lại từ dải "Xem gần đây" trong cùng phiên/lần ghé thăm sau.

**Vị trí hiển thị:** dải ngang trên Homepage, chỉ hiện khi có ít nhất 1 sản phẩm đã xem (ẩn hoàn toàn nếu rỗng — không hiển thị section trống hoặc placeholder giả).

---

## 5. Wishlist — xác nhận Future, không xây ở V1

Yêu cầu đã tự đánh dấu "(Future)" — đúng với thực trạng kỹ thuật: Wishlist cần lưu trữ *bền vững qua thiết bị/phiên* gắn với một danh tính khách hàng, nghĩa là cần bảng `customers`/tài khoản mà `03-database-design.md` §3 đã xác nhận **chưa tồn tại trong V1** (V1 là guest checkout thuần tuý). Xây Wishlist "tạm" bằng `localStorage` không gắn tài khoản sẽ tạo trải nghiệm nửa vời (mất danh sách khi đổi thiết bị) — không đáng để làm trước khi có tài khoản khách hàng thật.

**Quyết định:** không đưa Wishlist vào phạm vi thiết kế/implementation của lần triển khai này. Ghi nhận là hạng mục Phase sau, phụ thuộc vào roadmap tài khoản khách hàng (ngoài phạm vi Design Bible này).

---

## 6. Cấu trúc dải marketplace chuẩn — áp dụng chung cho mọi dải "sản phẩm ngang" trên Homepage/Category

Không phát minh lại bố cục cho mỗi dải — mọi dải (Được đề xuất, Theo điểm đến, Theo category, Mới ra mắt, Xem gần đây...) dùng chung 1 khuôn:

```
[Tiêu đề dải — ngắn, rõ]                          [Xem tất cả →]
[Card][Card][Card][Card][Card...] — cuộn ngang, card kế tiếp lộ ~30%
```

Lý do dùng chung 1 khuôn (không phải vì đơn giản hoá kỹ thuật, mà vì lý do trải nghiệm): khách học cách tương tác với 1 dải là áp dụng được cho mọi dải còn lại ngay lập tức — không phải học lại cách dùng UI mới mỗi lần cuộn xuống dải tiếp theo. Đây là nguyên tắc "tính nhất quán giảm tải nhận thức" áp dụng cho toàn bộ mật độ marketplace.

---

## 7. Thứ tự ưu tiên triển khai (những gì làm được ngay trước, những gì chờ quyết định schema sau)

```
Làm ngay (dữ liệu đã có đủ):
  1. Được đề xuất (is_featured/sort_order)
  2. Theo điểm đến nổi bật (destinations)
  3. Thương hiệu/Venue nổi bật (attraction_venues.is_featured)
  4. Mới ra mắt (created_at)
  5. Sản phẩm liên quan / Cross-sell (attraction_cross_sells)
  6. Xem gần đây (client-side, không cần schema)

Chờ migration mới (taxonomy category đã chốt bảng riêng — D2, xem 14-implementation-plan.md Phase 1B):
  7. Theo category (Công viên nước, Cáp treo, Show diễn...)
  8. Family Picks và các dải theo persona

Không làm ở V1 (thiếu nền tảng dữ liệu/tài khoản):
  9. Flash Sale thật (cần original_price + discount_ends_at)
  10. Trending/Best Seller thật (cần thống kê lượt bán)
  11. Recommendation cá nhân hoá thật (cần tài khoản + lịch sử)
  12. Wishlist (cần tài khoản khách hàng)
```

---

*Tài liệu tiếp theo: `12-design-rules.md` — 100 luật thiết kế cụ thể, tổng hợp từ toàn bộ 11 tài liệu trước.*
