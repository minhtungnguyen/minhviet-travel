# MV Ticket — Design Emotion Map

**Vai trò áp dụng:** Creative Director · Principal UI Designer.
**Nguyên tắc:** Emotion không phải một thuộc tính trang trí đặt ở hero rồi thôi — **mỗi màn hình trong hành trình mua vé phải có một Emotion chủ đạo riêng**, nối tiếp nhau thành một cung cảm xúc (emotion arc) có chủ đích, giống cách một bộ phim có nhịp lên-xuống chứ không phẳng lì suốt hành trình.
**Đọc trước:** `01-design-direction.md` §3 (Excitement là chủ đạo toàn module) và `05-brand-psychology.md` (hành vi từng nhóm khách).

---

## 1. Cung cảm xúc tổng thể (đường đi chính — nhóm khách lẻ, self-service)

```
Homepage        Search/Filter      Category         Product Detail     Chọn vé          Checkout         Voucher
   │                  │                │                   │               │                │                │
  WOW  ────────►  CONFIDENCE  ────►  DISCOVERY  ────►   DESIRE   ────►  CLARITY  ────►   TRUST   ────►   DELIGHT
   │                  │                │                   │               │                │                │
"Chỗ này          "Tìm đúng cái      "Còn nhiều thứ      "Mình muốn      "Biết chính     "An toàn khi      "Xong rồi,
sôi động,         mình cần dễ         hay ho khác          trải nghiệm    xác đang trả     đưa thông tin     dễ dàng,
đáng xem"         dàng"               nữa"                 này"           bao nhiêu"       thanh toán"       đáng mong chờ"
```

**Quy tắc bắt buộc:** không có 2 màn hình liên tiếp cùng một emotion — nếu Category và Product Detail cùng tạo cảm giác "Discovery", một trong hai bị coi là thiết kế sai (thiếu vai trò riêng). Đây chính là phép thử để phát hiện "section thừa" — liên kết trực tiếp với `10-conversion-design.md`.

---

## 2. Chi tiết từng màn hình

### 2.1 Homepage — **WOW**

- **Vì sao:** Đây là 3 giây đầu tiên quyết định khách có tiếp tục cuộn hay rời đi. WOW phải xảy ra trước khi khách kịp đọc chữ.
- **Cơ chế tạo emotion:** Ảnh/video hành động thật có chuyển động (không phải cảnh tĩnh), accent Orange xuất hiện ngay trong khung hình đầu (không đợi cuộn xuống mới thấy màu), mật độ nội dung marketplace (nhiều dải sản phẩm) tạo cảm giác "có rất nhiều thứ đang diễn ra" ngay từ màn hình đầu.
- **Chống chỉ định:** Overlay tối phủ kín ảnh, headline dài, khoảng trắng lớn kiểu editorial — những thứ này tạo ra Calm, không tạo WOW.
- **Đo lường được không:** Có — tỷ lệ cuộn qua khỏi hero trong <2 giây là tín hiệu WOW hoạt động; nếu %thoát trang ngay tại hero cao, WOW đang thất bại.

### 2.2 Search / Filter (search box ở hero, filter ở listing) — **CONFIDENCE**

- **Vì sao:** Sau khi bị thu hút, khách cần cảm thấy "mình sẽ tìm được đúng thứ mình cần, không phải mò mẫm" — đây là bước chuyển từ cảm xúc sang lý trí.
- **Cơ chế tạo emotion:** Autocomplete/gợi ý tức thì khi gõ điểm đến; filter hiển thị **số kết quả thay đổi ngay** khi chọn tiêu chí (phản hồi tức thì = tự tin); category chip có icon rõ ràng, không cần đọc kỹ mới hiểu.
- **Chống chỉ định:** Filter dạng sidebar dài phải cuộn hết mới thấy hết tuỳ chọn (mất tự tin vì không thấy toàn cảnh); kết quả tìm kiếm rỗng không gợi ý gì tiếp theo.
- **Đo lường được không:** Có — tỷ lệ dùng filter/search rồi rời đi ngay (0 click tiếp) là tín hiệu Confidence thất bại.

### 2.3 Category — **DISCOVERY**

- **Vì sao:** Khách đã thu hẹp phạm vi (vd: "Công viên nước"), giờ là lúc họ muốn *lướt và ngạc nhiên*, chưa cần quyết định ngay — đây là bước "shopping", không phải bước "mua".
- **Cơ chế tạo emotion:** Grid card mật độ vừa phải để lướt nhanh bằng ngón tay cái; ảnh đa dạng (không phải 10 card giống hệt bố cục); có dải "Có thể bạn thích" xen giữa để tạo cảm giác "còn nhiều điều thú vị chưa xem".
- **Chống chỉ định:** Ép khách vào bảng so sánh chi tiết ngay ở bước này (đó là việc của Product Detail, không phải Category).
- **Đo lường được không:** Có — số lượng card được xem (scroll depth) trước khi click vào 1 sản phẩm; nếu khách click sản phẩm đầu tiên ngay lập tức mọi lần, Discovery không thực sự xảy ra (có thể tốt cho tốc độ nhưng không phải mục tiêu emotion của màn hình này).

### 2.4 Product Detail — **DESIRE**

- **Vì sao:** Đây là khoảnh khắc khách tưởng tượng bản thân đang trải nghiệm sản phẩm — nếu không tạo được Desire ở đây, mọi trust-signal phía sau (giá tốt, chính sách rõ) đều vô nghĩa vì khách chưa muốn.
- **Cơ chế tạo emotion:** Gallery ảnh/video hành động thật lên đầu (đúng `03-product-detail-and-checkout-concept.md` §1.2); Benefits viết ở góc nhìn trải nghiệm ("Trượt nước 5 tầng, cao 20m" thay vì "Có khu vui chơi nước"); không có block editorial dài chen giữa ảnh và phần chọn vé.
- **Chống chỉ định:** Đoạn văn giới thiệu dài kiểu tư vấn viên trước khi khách kịp thấy ảnh; ảnh đầu tiên là kiến trúc/cổng vào thay vì trải nghiệm.
- **Đo lường được không:** Có — thời gian xem Gallery (số ảnh đã lướt) trước khi cuộn xuống phần chọn vé; Desire thấp nếu khách bỏ qua gallery ngay.

### 2.5 Chọn vé (loại vé — ngày — số lượng, trong Product Detail) — **CLARITY**

- **Vì sao:** Đây là điểm chuyển tiếp từ cảm xúc (Desire) sang quyết định tài chính — khách cần cảm thấy hoàn toàn rõ ràng đang trả bao nhiêu, cho cái gì, trước khi cam kết. Đây **không phải** là bước để tạo thêm cảm xúc mới — cố tình làm "vui" ở bước này (màu sắc rực rỡ, hoạt hình nhiều) sẽ phản tác dụng, gây phân tán khi khách cần tập trung tính toán.
- **Cơ chế tạo emotion:** Tổng tiền cập nhật tức thì khi đổi số lượng (đúng Animation Guideline `04-design-system.md` §4 — count-up ngắn); loại vé dạng thẻ chọn dọc rõ ràng tên + giá trên cùng 1 hàng; ngày không khả dụng bị disable trực quan, không để khách chọn nhầm rồi mới báo lỗi.
- **Chống chỉ định:** Ẩn field quan trọng trong dropdown thu gọn; hiển thị giá tạm rồi "tính lại" ở bước sau (phá vỡ Clarity ngay lập tức).
- **Đo lường được không:** Có — tỷ lệ rời bỏ ngay tại bước chọn vé (trước khi bấm "Mua vé") là tín hiệu Clarity thất bại nhiều nhất trong toàn phễu.

### 2.6 Checkout — **TRUST**

- **Vì sao:** Đây là bước duy nhất trong toàn hành trình mà emotion quay lại đúng với DNA nền tảng Minh Việt (Trust/Calm — Volume 01 §3.1), không phải Excitement. Khách sắp đưa thông tin cá nhân và tiền — "sôi động" ở bước này là phản tác dụng.
- **Cơ chế tạo emotion:** Bố cục đơn giản, ít màu sắc hơn hẳn các màn hình trước (giảm accent Orange, tăng khoảng trắng); tổng tiền cố định hiển thị rõ, khớp 100% với số đã thấy (đúng nguyên tắc đã khoá ở `03-product-detail-and-checkout-concept.md` §2.1); tóm tắt đơn hàng luôn hiển thị (khách không phải "tin tưởng mù" là hệ thống nhớ đúng đơn của họ).
- **Chống chỉ định:** Badge khuyến mãi/màu rực rỡ tại checkout (đúng thứ tạo Excitement ở các bước trước lại phá vỡ Trust ở bước này); đếm ngược gây áp lực nếu không có cơ sở thật (đã cấm ở `01-design-direction.md` §7).
- **Đo lường được không:** Có — tỷ lệ rời bỏ checkout (cart abandonment) là chỉ số Trust trực tiếp nhất trong toàn ngành thương mại điện tử.

### 2.7 Voucher / Booking Result — **DELIGHT**

- **Vì sao:** Đây là khoảnh khắc "phần thưởng" sau một quyết định tài chính — khách vừa hoàn thành hành trình, cảm xúc phải quay lại mức cao (không phải kết thúc bằng một màn hình xác nhận khô khan kiểu hoá đơn).
- **Cơ chế tạo emotion:** Trạng thái thành công có chuyển động nhẹ có ý nghĩa (không phải confetti trang trí vô nghĩa — xem giới hạn ở `09-motion-guideline.md`); QR code lớn, rõ, là tâm điểm màn hình (không phải 1 dòng text nhỏ trong nhiều thông tin khác); copy chúc mừng ngắn, đúng giọng "sôi động" đã quay lại từ Trust của bước Checkout.
- **Chống chỉ định:** Màn hình xác nhận trông như hoá đơn kế toán (toàn chữ, không phân cấp thị giác); animation rực rỡ nhưng che mất QR code hoặc nút tải voucher.
- **Đo lường được không:** Gián tiếp — tỷ lệ khách quay lại mua lần 2 và tỷ lệ khách tải/lưu voucher thành công là tín hiệu Delight hoạt động.

---

## 3. Emotion arc thay thế theo persona (không phải mọi khách đều đi qua cung cảm xúc §1)

### 3.1 Nhóm Show (`05-brand-psychology.md` §2)

Emotion arc chèn thêm **URGENCY có kiểm soát** giữa Product Detail và Chọn vé — vì suất diễn có giới hạn thật (khác công viên có thể đi bất kỳ ngày nào). Urgency ở đây hợp lệ vì có cơ sở thật (số suất diễn còn lại là dữ liệu real-time từ OneInventory, không phải giả lập) — không vi phạm kỷ luật dữ liệu thật đã khoá ở `01-design-direction.md` §7.

### 3.2 Nhóm Doanh nghiệp (`05-brand-psychology.md` §8)

Toàn bộ cung cảm xúc §1 **không áp dụng**. Nhóm này đi theo cung khác, ngắn hơn và nghiêng hẳn về Trust ngay từ đầu:

```
Homepage/Landing → CONFIDENCE (thấy có lối đi riêng "Đặt đoàn") → TRUST (form rõ ràng, có cam kết phản hồi) → REASSURANCE (xác nhận đã nhận yêu cầu, có người liên hệ lại)
```

Không có bước WOW/DESIRE mạnh — người mua doanh nghiệp không ra quyết định bằng cảm xúc trải nghiệm, họ ra quyết định bằng độ tin cậy và tính rõ ràng của quy trình.

---

## 4. Cách dùng tài liệu này khi thiết kế/code từng màn hình

Trước khi thiết kế bất kỳ màn hình nào thuộc module này, người thiết kế (hoặc AI tạo code) phải tự trả lời:

1. Emotion chủ đạo của màn hình này là gì? (chọn đúng 1, không phải danh sách nhiều emotion)
2. Cơ chế cụ thể nào (bố cục/màu/chuyển động/copy) đang tạo ra emotion đó?
3. Có yếu tố nào trên màn hình đang vô tình tạo ra emotion của bước *trước* hoặc *sau* không? (vd: màu sắc rực rỡ kiểu Discovery xuất hiện ở Checkout — đây là lỗi, phải sửa)

Nếu không trả lời được câu 1 rõ ràng, màn hình đó chưa đủ điều kiện để bắt đầu code.

---

*Tài liệu tiếp theo: `07-photography-guideline.md` — quy định ảnh/video cụ thể hoá cơ chế tạo emotion WOW/DESIRE đã nêu ở đây.*
