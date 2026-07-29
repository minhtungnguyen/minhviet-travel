# MV Ticket — Iconography Guideline

**Thư viện icon:** `lucide-react` — đã là dependency chuẩn của toàn hệ thống (xác nhận trong `attraction-ticket-hero.tsx`, mọi component MV khác). **Không thêm thư viện icon thứ hai** cho module này — vi phạm nguyên tắc "không thêm dependency mới khi cái có sẵn đủ dùng".

---

## 1. Style chung

| Thuộc tính | Giá trị | Ghi chú |
|---|---|---|
| Kiểu | **Stroke** (outline), không phải Filled, cho trạng thái mặc định | Nhất quán với `lucide-react` mặc định và toàn hệ thống hiện tại |
| Độ dày nét (stroke-width) | 2px ở kích thước chuẩn (20–24px), 1.5px ở icon lớn (≥32px) | Nét quá mảnh ở icon nhỏ làm giảm cảm giác "chắc chắn" cần có cho Excitement; nét quá dày ở icon lớn trông nặng nề |
| Góc | Rounded (mặc định của Lucide — `stroke-linecap="round"`, `stroke-linejoin="round"`) | Khớp với bo góc mềm của card/button đã dùng toàn hệ thống (`rounded-2xl`, `rounded-full` cho badge) |
| Filled | **Chỉ dùng cho trạng thái active/selected** (category chip đang chọn, tab đang active) | Filled toàn bộ mọi lúc tạo cảm giác nặng/công nghiệp, ngược với "sôi động nhẹ nhàng" đã khoá ở `01-design-direction.md` §3 |
| Kích thước chuẩn | 16px (inline text), 20px (button/card meta), 24px (section heading/category chip), 32–40px (feature icon 3 cột "Vì sao mua ở đây") | Không tự do chọn size ngoài thang này — giữ nhất quán thị giác |

---

## 2. Màu icon theo ngữ cảnh (tham chiếu `04-design-system.md` §1)

| Ngữ cảnh | Màu icon |
|---|---|
| Icon trong CTA chính (nút "Mua vé") | Trắng (trên nền `--mv-ticket-orange`) |
| Icon category chip active | Trắng (trên nền `--mv-journey-blue` — Minh Việt Blue, không dùng Purple/Orange ở đây; đã chốt D1 trong `DESIGN-BIBLE-v1.0.md`) |
| Icon category chip inactive | `--mv-deep-navy` hoặc `--mv-slate-text` |
| Icon trust/benefit (vé điện tử, hỗ trợ nhanh...) | `--mv-ticket-orange` — dùng có kiểm soát, không tô màu mọi icon trên trang |
| Icon sao đánh giá | Vàng — dùng nguyên token Gold hiện có, không đổi (Color Philosophy Volume 01, ngoại lệ duy nhất cho vàng) |
| Icon trạng thái đơn hàng (thành công/lỗi) | Xanh lá thành công / Đỏ lỗi — dùng token semantic đã có (`--mv-offer-red` cho lỗi/cảnh báo nếu phù hợp ngữ nghĩa), không phát minh màu mới |

---

## 3. Bộ icon theo category (dùng cho chip lọc — `02-homepage-and-listing-concept.md` §1.2)

| Category | Icon Lucide đề xuất | Lý do chọn |
|---|---|---|
| Tất cả | `LayoutGrid` | Trung tính, không thiên vị 1 loại hình |
| Công viên nước | `Waves` | Rõ ràng, không cần label vẫn hiểu |
| Cáp treo | `CableCar` (nếu có trong bộ Lucide hiện tại) / fallback `MoveUp` xoay góc | Cần kiểm tra version Lucide đang dùng có icon này không trước khi code — nếu không có, dùng icon gần nghĩa nhất, không tự vẽ SVG mới |
| Show diễn | `Drama` hoặc `Sparkles` | `Sparkles` an toàn hơn nếu `Drama` không có sẵn trong version đang dùng |
| Safari & Thú | `PawPrint` | Rõ nghĩa, không gây nhầm với icon khác trong bộ chip |
| Vui chơi trong nhà | `Gamepad2` | Phân biệt rõ với "ngoài trời" |
| Gia đình & Trẻ em | `Users` hoặc `Baby` | `Users` trung tính hơn nếu muốn tránh giới hạn hình ảnh chỉ trẻ em |

**Quy tắc bắt buộc khi implement:** xác nhận icon tồn tại trong version `lucide-react` thực tế của repo trước khi dùng tên cụ thể — đây là tài liệu design, không phải cam kết API; nếu tên icon đề xuất không tồn tại, chọn icon gần nghĩa nhất trong cùng bộ thư viện, không thêm SVG custom rời rạc phá vỡ tính nhất quán "1 thư viện duy nhất".

---

## 4. Icon theo chức năng UI (booking flow)

| Chức năng | Icon | Vị trí |
|---|---|---|
| Vé điện tử/QR | `QrCode` | Trust badge trên hero, voucher screen |
| Xác nhận nhanh | `Zap` hoặc `BadgeCheck` (đã dùng `BadgeCheck` trong hero hiện tại — giữ nguyên, không đổi không cần thiết) | Trust badge |
| Giá minh bạch | `Tag` hoặc `Receipt` | Trust badge, checkout summary |
| Chọn ngày | `Calendar` | Booking panel |
| Số lượng | `Plus`/`Minus` (nút tăng giảm) | Booking panel — đã là pattern chuẩn, không đổi |
| Vị trí/bản đồ | `MapPin` | Product Detail §Vị trí |
| Chính sách huỷ | `ShieldCheck` hoặc `RefreshCcw` | Product Detail §Chính sách |
| Tải voucher | `Download` | Booking result |
| Thêm vào Ví điện thoại | `Wallet` | Booking result |
| Hotline hỗ trợ | `Phone` | Mọi trạng thái booking result |
| Sản phẩm liên quan | `ArrowRight` (đã dùng, giữ nguyên) | Card CTA |

---

## 5. Hover & tương tác

- Icon trong nút: không tự chuyển động độc lập khi hover — chuyển động (nếu có) đi theo toàn bộ nút (đổi màu nền/nâng nhẹ), đúng nguyên tắc "Button đổi màu nhẹ" đã có ở `13.8-COMPONENT-EMOTION-V1.md` §4.
- Icon category chip: khi chuyển từ inactive → active, chuyển đổi màu nền + màu icon cùng lúc trong 150–200ms (khung thời lượng đã khoá ở `04-design-system.md` §4), không có hiệu ứng xoay/nảy riêng cho icon.
- Icon trong card (badge góc ảnh): tĩnh, không hover riêng — icon là một phần của badge, hover áp dụng cho toàn card (nâng nhẹ + shadow, pattern đã đúng trong code hiện tại).
- Icon trạng thái thành công (voucher): **được phép** có 1 hiệu ứng xuất hiện nhẹ (scale-in ngắn dưới 300ms) vì đây là khoảnh khắc Delight duy nhất được phép "ăn mừng" nhẹ theo `06-design-emotion-map.md` §2.7 — không lặp lại hiệu ứng này ở bất kỳ đâu khác để giữ giá trị đặc biệt của khoảnh khắc đó.

---

## 6. Cấm

- Không dùng icon 2 màu (duotone)/gradient riêng lẻ khi phần còn lại hệ thống dùng stroke đơn sắc — phá vỡ nhất quán.
- Không dùng emoji thay icon trong UI sản phẩm (khác với nội dung copy/marketing nếu có, nhưng không phải trong component UI).
- Không tự vẽ icon SVG rời rạc ngoài `lucide-react` trừ khi thực sự không có icon tương đương và đã xác nhận với người duyệt thiết kế.
- Không dùng icon kích thước lớn hơn 40px trong bất kỳ ngữ cảnh nào thuộc module này (khác biểu tượng minh hoạ lớn trong empty-state, không tính là "icon chức năng").

---

*Tài liệu tiếp theo: `09-motion-guideline.md` — cách các icon/card/button ở trên chuyển động phục vụ chuyển đổi.*
