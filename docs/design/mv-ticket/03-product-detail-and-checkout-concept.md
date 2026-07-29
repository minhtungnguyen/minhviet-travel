# MV Ticket — Product Detail, Checkout & Booking Result Concept

**Đọc trước:** `01-design-direction.md`, `02-homepage-and-listing-concept.md`.

---

## 1. Product Detail `/ve-vui-choi/[destinationSlug]/[productSlug]`

### 1.1 Vì sao không dùng Tour Detail

Tour Detail giải quyết bài toán "thuyết phục mua một cam kết nhiều ngày, nhiều rủi ro" — cần timeline, cần lịch trình để khách hình dung *toàn bộ* chuyến đi trước khi trả tiền. Vé vui chơi là **1 lượt sử dụng, ít rủi ro, quyết định nhanh** — nội dung timeline không tồn tại vì sản phẩm không có "Ngày 1/2/3". Áp một khuôn Tour Detail vào đây là ép dữ liệu không có vào một cấu trúc không cần, kết quả là các mục trống hoặc nội dung "câu giờ" (padding content) để lấp timeline.

### 1.2 Cấu trúc trang (mobile-first, thứ tự đọc từ trên xuống)

```
┌─────────────────────────────────────────────┐
│ Breadcrumb (nhỏ, không chiếm không gian)      │
├─────────────────────────────────────────────┤
│ GALLERY — ảnh/video lướt ngang, đếm 1/8       │  ← lên đầu, KHÔNG phải sau văn bản
│ (media_assets liên kết product/venue)         │     (bài học GetYourGuide/Eventbrite)
├─────────────────────────────────────────────┤
│ Tên vé (đậm, 2 dòng max)                      │
│ Venue · Điểm đến    ★ 4.8 (120) [nếu có]     │
│ Giá từ  350.000đ                              │  ← giá xuất hiện NGAY, cùng màn hình
│                                                │     đầu tiên với ảnh — không cuộn mới thấy
├─────────────────────────────────────────────┤
│ BENEFITS / INCLUDED (bullet, tối đa ~5 dòng)  │  ← từ highlights (jsonb), không đoạn văn
│ ✓ Vé vào cổng cả ngày                         │
│ ✓ Miễn phí trẻ em dưới 1m                     │
│ ✓ Đổi/huỷ linh hoạt trước 24h                 │
├─────────────────────────────────────────────┤
│ CHỌN VÉ (sticky panel — xem §1.3)             │  ← trọng tâm trang, không phải phụ lục
│ Loại vé:  ○ Người lớn   350.000đ              │     cuối trang
│           ○ Trẻ em      250.000đ              │
│ Ngày sử dụng: [date picker]                   │
│ Số lượng: [– 2 +] người lớn  [– 0 +] trẻ em   │
│ ─────────────────────────────                │
│ Tổng cộng: 700.000đ           [Mua vé]        │  ← TỔNG GIÁ CỐ ĐỊNH ngay từ đây,
├─────────────────────────────────────────────┤     không phí ẩn lộ ra sau (Ticketmaster
│ CÁCH SỬ DỤNG VÉ (usage_guide)                 │     anti-pattern — research §7)
├─────────────────────────────────────────────┤
│ CHÍNH SÁCH HUỶ/ĐỔI (cancellation_policy)      │
├─────────────────────────────────────────────┤
│ VỊ TRÍ (map — nếu có lat/lng)                 │
├─────────────────────────────────────────────┤
│ ĐÁNH GIÁ (CHỈ khi có nguồn thật — hiện chưa   │
│ có bảng review trong schema, ẩn cho tới khi có)│
├─────────────────────────────────────────────┤
│ FAQ (chỉ khi có FAQ thật — attraction_faqs)   │
├─────────────────────────────────────────────┤
│ SẢN PHẨM LIÊN QUAN (attraction_cross_sells)   │
└─────────────────────────────────────────────┘
Mobile: [thanh CTA dính đáy màn hình — Tổng tiền + nút "Mua vé"] luôn hiển thị
        khi cuộn qua khỏi block "Chọn vé" (không che MobileCTA/cookie banner
        toàn site — bài học đã ghi nhận từ audit Combo P2-02)
```

### 1.3 Khối "Chọn vé" — trái tim của trang

- **Desktop:** sticky panel bên phải (giữ nguyên hướng đã đề xuất trong `05-ui-ux-specification.md` §4 — đúng, không đổi), nhưng nội dung bên trong đổi hẳn: không phải box "liên hệ tư vấn", mà là công cụ tính giá real-time — chọn loại vé → chọn ngày → chọn số lượng → tổng tiền cập nhật ngay, giống mô hình GetYourGuide/Eventbrite (research §4, §8).
- **Loại vé hiển thị dạng thẻ chọn dọc** (radio-card: tên loại vé + giá trên cùng 1 hàng), không phải dropdown ẩn giá — đúng bài học Eventbrite (research §8) và tránh anti-pattern bảng ma trận ngang của Universal trên mobile (research §6).
- Nếu chỉ có 1 loại vé, ẩn hẳn bước "chọn loại vé", đi thẳng vào chọn ngày/số lượng — không hiển thị UI chọn lựa giả khi chỉ có 1 lựa chọn.
- Ngày không khả dụng phải bị disable trực quan trên date picker, không phải để khách chọn xong mới báo lỗi (giảm bước quay lại — đúng tinh thần "giảm số bước đặt dịch vụ" đã có trong Volume 01 §14).

### 1.4 Gallery

- Ảnh/video hành động thật lên đầu tiên (không phải ảnh venue tĩnh xa) — theo đúng moodboard đã khoá ở `01-design-direction.md` §4.
- Đếm số ảnh (1/8) để khách biết còn nội dung để lướt — tín hiệu nhỏ nhưng khuyến khích tương tác trước khi quyết định.
- Không dùng lightbox phức tạp nhiều lớp trên mobile — vuốt ngang đơn giản, đúng nguyên tắc mobile-first.

---

## 2. Checkout

### 2.1 Nguyên tắc giá — không thương lượng

Tổng giá hiển thị ở bước "Chọn vé" trên Product Detail phải **giữ nguyên, không đổi** khi vào checkout, trừ khi có thay đổi do chính khách thao tác (đổi số lượng). Không thêm phí dịch vụ/phí xử lý xuất hiện lần đầu ở bước checkout — đây là anti-pattern bị chỉ trích nhiều nhất trong toàn bộ nghiên cứu (Ticketmaster, research §7) và đối lập trực tiếp với copy cam kết đã có sẵn trong hero hiện tại ("giá minh bạch không phụ phí ẩn"). Nếu OneInventory thực sự có phí phát sinh, phí đó phải được cộng vào và hiển thị **ngay từ bước chọn vé** trên Product Detail, không phải giấu tới bước cuối.

### 2.2 Cấu trúc (theo tối thiểu đã chốt ở `05-ui-ux-specification.md` §5, không đổi phạm vi dữ liệu — chỉ đổi cách trình bày)

```
┌─────────────────────────────────────────────┐
│ Tóm tắt đơn (ảnh nhỏ + tên vé + ngày + SL)    │  ← luôn hiển thị, khách không "quên
│                                                │     mình đang mua gì" giữa luồng
├─────────────────────────────────────────────┤
│ Thông tin liên hệ: Tên · SĐT · Email          │
│ Tên người dùng vé (nếu provider yêu cầu)      │
│ Ghi chú (tuỳ chọn)                            │
├─────────────────────────────────────────────┤
│ Tổng tiền (CỐ ĐỊNH, khớp số đã thấy ở PDP)    │
│ ☐ Đồng ý điều khoản/chính sách huỷ            │
│ [Xác nhận & Thanh toán]                       │
└─────────────────────────────────────────────┘
```

Một trang, không chia nhiều bước/wizard nhiều màn hình — vé vui chơi không cần luồng nhiều bước như đặt tour phức tạp (đúng tinh thần "giảm số bước" và mindset "mua ngay" đã khoá).

### 2.3 Trạng thái xử lý

Loading/pending khi chờ OneInventory xác nhận phải có animation nhẹ có ý nghĩa (đang giữ chỗ/đang xử lý), không phải spinner câm — nhưng **không dùng đếm ngược giả** nếu không có cơ sở giữ chỗ thật theo kỷ luật đã khoá ở §7 tài liệu `01-design-direction.md`.

---

## 3. Booking Result / Voucher `/ve-vui-choi/ket-qua/[orderCode]`

Đây **không phải màn hình phụ** — theo bài học Disney (research §5), trải nghiệm sau khi mua phải được thiết kế kỹ ngang trang bán, vì đây là màn hình khách sẽ mở lại tại cổng vào công viên.

```
┌─────────────────────────────────────────────┐
│ ✓ Trạng thái đơn (map 6 trạng thái enum       │
│   attraction_order_status — hiển thị đúng     │
│   trạng thái thật, không lạc quan hoá khi     │
│   đang Pending/Failed)                        │
├─────────────────────────────────────────────┤
│ Mã đơn Minh Việt (hiển thị) — KHÔNG hiển thị  │
│ provider_order_id trực tiếp trong URL         │
├─────────────────────────────────────────────┤
│ [MÃ QR lớn, rõ] — chỉ hiện khi                │
│ status = 'VOUCHER_ISSUED' và có download_url  │
│ hợp lệ (đúng field thật trong schema)         │
├─────────────────────────────────────────────┤
│ Cách sử dụng vé tại cổng (lặp lại usage_guide)│
│ [Tải voucher] [Thêm vào Ví điện thoại]        │
├─────────────────────────────────────────────┤
│ Hotline hỗ trợ (luôn hiển thị, mọi trạng thái)│
└─────────────────────────────────────────────┘
```

Với trạng thái Pending/Processing: hiển thị rõ ràng "đang xử lý", có polling ngắn cập nhật tự động (đúng quyết định đã ghi trong `05-ui-ux-specification.md` §6 — 1 route xử lý nhiều trạng thái), không bắt khách tự bấm refresh.

---

## 4. Việc tiếp theo

`04-design-system.md` — Color, Typography, Spacing, Animation, Responsive.
