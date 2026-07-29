# MV Ticket — Homepage, Listing & Card Concept

**Đọc trước:** `01-design-direction.md`. Wireframe dưới đây là **sơ đồ bố cục mô tả (ASCII)**, không phải component/markup — mục đích thống nhất cấu trúc trước khi ai đó viết code.

---

## 1. Homepage `/ve-vui-choi` — Marketplace, không phải Landing Page

### 1.1 Khác biệt cấu trúc so với Landing Page hiện tại

| | Landing Page (hiện tại — sai hướng) | Marketplace (đề xuất) |
|---|---|---|
| Nhịp cuộn | Tuyến tính: Hero → Why → Featured → CTA cuối | Nhiều dải ngang độc lập, mỗi dải tự đứng được |
| Hero | 85vh, chiếm gần hết màn hình đầu | ~60vh (đã chốt, D8) — thấp hơn hero hiện tại nhưng đủ không gian để Search box là trọng tâm thị giác, không bị ép nhỏ |
| Số điểm chạm sản phẩm trước khi cuộn hết trang | 1 (chỉ "Vé bán chạy") | 5–7 dải, mỗi dải 1 lý do khác nhau để dừng lại |
| CTA | 1 CTA cuối trang ("Liên hệ tư vấn" kiểu) | CTA lặp lại trên từng card, không có "CTA tư vấn" |

### 1.2 Thứ tự dải nội dung (bám theo research §11 — đồng thuận ≥3 nền tảng)

```
┌─────────────────────────────────────────────┐
│ HERO (thấp, ảnh/video hành động thật)        │
│ Headline ngắn + Search box (điểm đến/ngày)   │  ← trả lời câu hỏi 1 "Có vé không?"
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ QUICK CATEGORY CHIPS (cuộn ngang)            │
│ [Tất cả][Công viên nước][Cáp treo][Show diễn]│  ← lối vào nhanh, không cần scroll tìm
│ [Safari][Trong nhà][Gia đình]                │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ DẢI 1 — Được đề xuất hôm nay                 │  is_featured/sort_order, nhãn trung thực
│ [Card][Card][Card][Card] → cuộn ngang         │  (không dùng "Bán chạy" nếu không đo được)
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ DẢI 2 — Theo điểm đến nổi bật                │  data-driven từ destinations published
│ [Hạ Long — 12 trải nghiệm]                    │  (tile lớn, không phải card sản phẩm)
│ [Đà Nẵng — 8 trải nghiệm]  [...]              │  MỖI TILE PHẢI HIỂN THỊ SỐ TRẢI NGHIỆM
└─────────────────────────────────────────────┘  (D7, đã chốt — xem §1.2b)
┌─────────────────────────────────────────────┐
│ DẢI 3 — Công viên nước & Cáp treo             │  theo category (khi có taxonomy — §5.2
│ [Card][Card][Card][Card] → cuộn ngang         │  của 01-design-direction.md)
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ DẢI 4 — Gia đình & Trẻ em                     │  category khác, ảnh khác tông (ấm hơn)
│ [Card][Card][Card][Card]                      │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ THƯƠNG HIỆU/KHU VUI CHƠI NỔI BẬT — BẮT BUỘC   │  attraction_venues.is_featured
│ [Logo/ảnh venue][Logo/ảnh venue][...]         │  (Sun World, VinWonders... khi có thật)
└─────────────────────────────────────────────┘  (D6, đã chốt — không phải section tuỳ chọn)
┌─────────────────────────────────────────────┐
│ VÌ SAO MUA Ở MINH VIỆT (rút gọn, KHÔNG dài)   │  3 cột icon ngắn: vé điện tử / giá minh
│                                                │  bạch / hỗ trợ nhanh — không đoạn văn dài
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ FAQ (chỉ khi có FAQ thật) + Footer            │
└─────────────────────────────────────────────┘
```

**Loại bỏ khỏi trang chủ so với spec cũ (`05-ui-ux-specification.md`):** không còn mục "Ưu đãi" tách riêng nếu badge giảm giá đã gắn trực tiếp trên card (tránh 1 section rỗng khi chưa có discount thật — đúng nguyên tắc "ẩn khi không có dữ liệu"). "Cam kết dịch vụ" rút từ 1 section riêng thành 1 dải icon ngắn, không phải block văn bản dài kiểu tư vấn.

**Section bắt buộc (đã chốt, không phải tuỳ chọn):** Hero+Search, Category Chips, ít nhất 1 dải sản phẩm, **Thương hiệu/Khu vui chơi nổi bật (D6)**. Nếu venue `is_featured` rỗng ở một thời điểm nào đó, đây là dấu hiệu cần bổ sung dữ liệu biên tập (đánh dấu venue nổi bật), không phải lý do ẩn vĩnh viễn section này.

### 1.2b Destination Tile phải hiển thị số trải nghiệm (D7, đã chốt)

Mỗi tile điểm đến (dải 2) hiển thị: ảnh + tên điểm đến + **"N trải nghiệm"** (đếm số `attraction_products` đang `ACTIVE`/published, join qua `attraction_venues.destination_id`). Đây là tín hiệu định lượng đầu tiên khách thấy về 1 điểm đến — trả lời ngầm câu hỏi "ở đây có nhiều lựa chọn không" trước khi họ bấm vào. Không cần bảng đếm riêng — đây là 1 query đếm (`count(*)` có điều kiện), không phải trường lưu sẵn, để luôn khớp thực tế không cần đồng bộ thủ công.

### 1.3 Hero — cụ thể hoá (D8, đã chốt: ~60vh, Search là trung tâm)

- **Chiều cao: ~60vh** (không phải 40–45vh như đề xuất ban đầu) — thấp hơn hero Tour/Combo hiện tại (85vh/82vh) nhưng đủ cao để Search box có không gian là điểm nhấn thị giác chính, không bị thu nhỏ thành 1 field phụ dưới headline.
- **Search là trung tâm bố cục, không phải headline.** Thứ tự ưu tiên thị giác trong hero: (1) ảnh/video nền hành động thật, (2) Search box — kích thước lớn, vị trí giữa/nổi bật, (3) headline ngắn phía trên Search đóng vai trò dẫn nhập, không phải nội dung chính. Đây là khác biệt cấu trúc quan trọng nhất so với hero hiện tại (nơi headline là trung tâm, search box là 1 khối nhỏ bên dưới).
- Nền: ảnh/video hành động thật theo moodboard `01-design-direction.md` §4 (không phải Hạ Long Bay tĩnh). Nếu chưa có asset thật đạt chuẩn, xem `13-asset-library-strategy.md` — **không nghiệm thu UI với placeholder** (đúng nguyên tắc đã áp dụng toàn hệ thống).
- Overlay: nhẹ hơn hẳn overlay navy 85% hiện tại — chỉ đủ để chữ đọc được ở góc đặt headline, không phủ kín khung hình (đúng Color Philosophy §"Hero là nền video/ảnh thật... overlay tối chỉ đủ để chữ đọc được").
- Headline: giữ tinh thần ngắn, nhưng bỏ giọng "gợi mở tư vấn" — ví dụ hướng: câu hỏi trực tiếp + động từ hành động, không phải câu văn hoa mỹ.
- Search box: điểm đến + ngày, tối giản — không thêm field không cần thiết (đúng ghi chú đã có trong spec cũ, giữ nguyên) — nhưng **kích thước/vị trí phải là điểm nhấn chính của Hero**, không phải 1 field phụ.

---

## 2. Category Page — "cửa hàng nhỏ", không phải bộ lọc khô khan

Bám theo bài học KKday (research §2): category không phải danh sách card + filter sidebar khô khan, mà có identity riêng.

```
┌─────────────────────────────────────────────┐
│ Ảnh banner category (nhỏ, ~25vh, KHÔNG lặp    │
│ lại kiểu hero trang chủ) + Tên category       │
│ + 1 dòng mô tả cảm xúc ngắn (không đoạn văn)  │
├─────────────────────────────────────────────┤
│ Thanh filter ngang (không sidebar dọc):       │  mobile-first — sidebar dọc buộc
│ [Điểm đến ▾][Khoảng giá ▾][Sắp xếp ▾]         │  người dùng cuộn qua trước khi
├─────────────────────────────────────────────┤  thấy sản phẩm — sai mindset §2
│ Grid card 2 cột (mobile) / 3–4 cột (desktop)  │  của 01-design-direction.md
│ [Card][Card]                                  │
│ [Card][Card]                                  │
│ ... load more / pagination                   │
└─────────────────────────────────────────────┘
```

Filter nằm ngang, dùng dropdown/sheet khi chạm (mobile), không phải sidebar cố định chiếm 25% chiều rộng màn hình — đúng nguyên tắc mobile-first ưu tiên số 1.

---

## 3. Card System — đúng 3 loại, không có loại thứ 4 (D10, đã chốt)

Toàn bộ module chỉ dùng **3 loại card**. Bất kỳ nhu cầu hiển thị mới nào trong tương lai phải tái sử dụng 1 trong 3 loại này — không tạo biến thể card thứ 4 mà không sửa lại tài liệu này trước.

| # | Tên | Dùng ở đâu | Dữ liệu chính | Kích thước ảnh |
|---|---|---|---|---|
| 1 | **Product Card** | Mọi dải sản phẩm (Được đề xuất, theo Category, Cross-sell, Xem gần đây), Listing/Category grid | Ảnh, venue, điểm đến, tên vé, giá, badge (có điều kiện), rating (có điều kiện), CTA | 4:3 |
| 2 | **Destination Tile** | Dải "Theo điểm đến nổi bật" trên Homepage | Ảnh lớn, tên điểm đến, **số trải nghiệm** (D7) | 16:10, lớn hơn Product Card |
| 3 | **Venue/Brand Tile** | Dải "Thương hiệu/Khu vui chơi nổi bật" (D6 — bắt buộc) | Logo/ảnh venue, tên thương hiệu, (tuỳ chọn) số sản phẩm thuộc venue | Vuông hoặc 4:3, nhỏ gọn hơn Destination Tile — vai trò là "logo trust", không phải "ảnh cảm xúc" |

**Không phải card, không tính vào 3 loại trên:** Category Chip (là chip/pill điều hướng, không phải card), FAQ item (là accordion), khối "Vì sao mua ở đây" (là icon + text ngắn, không có ảnh/CTA nên không phải card).

### 3.1 So sánh trực tiếp với card hiện tại (Product Card)

| Vùng | Card hiện tại (`AttractionProductCard`) | Card đề xuất |
|---|---|---|
| Ảnh | 4:3, không badge trạng thái ngoài "Nổi bật" | Giữ tỷ lệ ảnh tương tự nhưng **luôn có ít nhất 1 badge có dữ liệu thật** (Được đề xuất / Còn vé hôm nay — không badge trang trí) |
| Meta trên tiêu đề | "Venue · Điểm đến", chữ nhỏ xám | Giữ nguyên vị trí — đây là thông tin đúng, không phải vấn đề |
| Tiêu đề | Font display/serif-leaning, giọng editorial | Font rõ, đậm hơn, ngắn hơn — ưu tiên đọc nhanh hơn "đẹp" |
| Giá | "Giá từ [số]" — số nhỏ hơn tiêu đề | **Giá là yếu tố thị giác mạnh nhất trên card sau ảnh** — cỡ chữ lớn, màu accent, đặt ngang hàng hoặc dưới tiêu đề ngay, không chờ tới cuối card |
| Rating | Không có | Có vị trí dành sẵn, **chỉ render khi có dữ liệu thật** (ẩn hoàn toàn nếu null — không icon sao rỗng) |
| CTA | Link text mảnh "Xem vé →" (non-featured) | Toàn bộ card là target bấm được (đã đúng — giữ), nhưng thêm 1 nút rõ ràng hơn ở card nổi bật, chữ hành động ("Chọn vé" thay vì chỉ "Xem vé") |
| Hover | Nâng nhẹ + shadow (đã đúng chuẩn Component Emotion §5) | Giữ nguyên — pattern hover đã đúng, không đổi |

### 3.2 Wireframe card (mô tả)

```
┌───────────────────────┐
│                       │
│      [ẢNH 4:3]        │  ← badge trạng thái góc trên trái, CHỈ khi có dữ liệu thật
│  [Badge nếu có]       │     (vd: "Được đề xuất" — không phải "-30%" giả)
│                       │
├───────────────────────┤
│ Venue · Điểm đến      │  ← meta nhỏ, xám, giữ nguyên vị trí hiện tại (đúng)
│ Tên vé (đậm, 2 dòng)  │
│ ★ 4.8 (120)           │  ← CHỈ hiện nếu có rating thật, ẩn hoàn toàn nếu không
│                       │
│ Giá từ                │
│ 350.000đ    [Chọn vé] │  ← giá đậm/lớn + CTA rõ, không phải link mảnh
└───────────────────────┘
```

### 3.3 Nguyên tắc bất di bất dịch cho card

- Không thêm badge nếu không có trường dữ liệu thật đứng sau (kỷ luật đã khoá ở `01-design-direction.md` §7).
- Card không "kể chuyện" — không có chỗ cho mô tả dài quá 1 dòng meta. Câu chuyện cảm xúc (nếu có, học từ Airbnb Experience — research §9) chỉ áp dụng có chọn lọc cho nhóm "Gia đình/Show diễn", đặt ở subtitle 1 dòng, không thay thế giá.
- Mọi card đều phải tự trả lời được câu hỏi 1–3 trong §2 của `01-design-direction.md` (có vé/giá/ưu đãi) mà không cần bấm vào.

---

## 4. Việc tiếp theo

`03-product-detail-and-checkout-concept.md` — cấu trúc trang sản phẩm và checkout.
