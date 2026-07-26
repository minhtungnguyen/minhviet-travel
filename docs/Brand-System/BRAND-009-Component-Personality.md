# BRAND-009 — Component Personality

**Project:** Minh Việt Travel Platform
**Layer:** Emotional Brand Design System
**Version:** 1.0.0

---

## 0. Nguyên tắc nền — kiến trúc không đổi, cá tính có giới hạn

Theo nguyên tắc cuối MASTER PROMPT (đã ghi lại ở BRAND-002 §0): **Component Architecture không đổi theo module.** Tài liệu này định nghĩa chính xác ranh giới đó — phần nào của một component là "kiến trúc" (bất biến) và phần nào là "cá tính" (được phép đổi theo module, trong giới hạn BRAND-003/005 đã cho phép).

**Bất biến trên mọi component, mọi module** (kế thừa `11-component-principles.md`):

- **8 trạng thái bắt buộc**: Default, Hover, Focus, Active, Disabled, Loading, Error, Success. Một component thiếu bất kỳ trạng thái nào trong 8 trạng thái này (khi trạng thái đó có ý nghĩa với component) là chưa hoàn thiện, không được coi là xong.
- Border-radius: card `16px` (`rounded-2xl`), button/input theo `--radius: 0.9rem`.
- Đúng 3 biến thể nút: **Primary, Secondary, Ghost** (cộng thêm `Accent`, `Outline`, `Danger` đã có trong `mv-button.tsx` cho nhu cầu thực tế — nhưng không phát sinh thêm biến thể mới ngoài các biến thể đã định nghĩa trong `mv-button.tsx` hiện tại).
- Label form luôn hiển thị (không dùng placeholder thay label). Lỗi hiển thị ngay dưới field, không chỉ báo bằng màu.
- Không tạo component mới nếu component hiện có mở rộng được bằng props.

**Được phép đổi theo module** (trong giới hạn đã duyệt): màu accent (viền focus, nền khi active, icon), shadow depth trong 2 tier đã có (`shadow-soft`/`shadow-soft-lg`, + `luxury-ring` riêng Cruise), tốc độ transition (theo tier BRAND-005), nội dung/icon bên trong.

---

## 1. Card

| | |
|---|---|
| **Bất biến** | `rounded-2xl`, `shadow-soft` mặc định → `shadow-soft-lg` khi hover, border `1px` `--border`, padding nhất quán theo `card-gap` (1.25rem) |
| **Đổi theo module** | Cruise dùng thêm `.luxury-ring` khi hover thay vì chỉ `shadow-soft-lg`; MICE có thể có 1 badge Gold góc trên (giới hạn BRAND-003 §11); Ticket dùng `.img-zoom` mạnh hơn (1.08x) cho ảnh; Tour dùng `.reveal` khi vào viewport |

## 2. Button

| | |
|---|---|
| **Bất biến** | Kiến trúc `mv-button.tsx` (`cva` variants: primary/accent/gold/secondary/outline/outline-gold/outline-light/ghost/danger; size sm/md/lg/icon) — không tạo variant mới ngoài hệ này. Min touch target 44px (`h-11`) trên mobile/tablet. |
| **Đổi theo module** | Variant `accent` đổi tông theo accent module đang active (nếu module dùng `mv-journey-blue` riêng thay vì `--accent` mặc định — xem BRAND-003 §3); label luôn theo Tone of Voice module (BRAND-010 cho phần AI, còn lại theo `brand-strategy` Ch.11 chung) |
| **Ví dụ label khác biệt** | Flight: "Tìm chuyến bay" · Hotel: "Tìm phòng" · Tour: "Khám phá hành trình" · Insurance: "Nhận báo giá bảo vệ" — hành động giống nhau về chức năng (submit search) nhưng ngôn ngữ theo cảm xúc module |

## 3. Input

| | |
|---|---|
| **Bất biến** | Label luôn hiển thị phía trên, height `h-11`, border `--border` → `--ring` khi focus (accent), error state viền đỏ + text lỗi dưới field, không bao giờ chỉ đổi màu mà không có text lỗi kèm theo |
| **Đổi theo module** | Màu `--ring` khi focus theo accent module; Visa/Insurance ưu tiên input dạng rõ ràng từng bước (multi-step form) hơn input tự do, phản ánh cảm xúc "được xử lý đúng quy trình" |

## 4. Modal / Dialog

| | |
|---|---|
| **Bất biến** | Nền tối `bg-mv-deep-navy/60` (hoặc tương đương), nội dung nổi trên `bg-card`, đóng bằng click ngoài + phím Esc + nút đóng rõ ràng, animation `slow` tier (360ms) |
| **Đổi theo module** | Modal xác nhận đặt chỗ (Flight/Tour) có thể có icon success animate nhẹ; modal Insurance/Visa ưu tiên hiển thị nhiều text pháp lý rõ ràng hơn hiệu ứng |

## 5. Table

| | |
|---|---|
| **Bất biến** | Header có background phân biệt nhẹ (`--secondary`), hàng zebra tuỳ chọn nhưng không bắt buộc, sort/filter icon nhất quán (`ArrowUpDown` — Lucide), responsive: chuyển thành card list trên mobile thay vì scroll ngang ép buộc |
| **Đổi theo module** | MICE dùng Table nhiều nhất (báo giá, danh sách hạng mục dịch vụ) — có thể có dòng tổng (subtotal) nổi bật bằng weight, không bằng màu nền loè loẹt |

## 6. Search Box

| | |
|---|---|
| **Bất biến** | Luôn có validation rõ ràng theo field, trạng thái hover/focus/error đầy đủ, nút submit luôn là hành động chính duy nhất trong box |
| **Đổi theo module** | Flight: nhiều field nhất (điểm đi/đến/ngày/khách/hạng ghế), nhịp Fast; Hotel: điểm đến/ngày nhận-trả/số khách, nhịp Slow hơn; Tour: điểm đến/số người/ngân sách (không có "ngày chính xác" bắt buộc — Tour thường linh hoạt hơn); Visa: quốc gia/loại visa/ngày dự kiến, không cần "tìm kiếm" theo nghĩa OTA mà theo nghĩa "bắt đầu hồ sơ" |

## 7. Booking Box / Booking Summary

| | |
|---|---|
| **Bất biến** | Luôn hiển thị: tổng giá rõ ràng (không giá ẩn xuất hiện ở bước cuối — vi phạm Non-negotiable "một nguồn sự thật"), breakdown chi phí nếu có phụ phí, nút hành động chính duy nhất mỗi bước |
| **Đổi theo module** | MICE: breakdown chi tiết theo hạng mục dịch vụ (dashboard-style); Flight/Ticket: breakdown đơn giản (giá vé + số lượng); Insurance: breakdown theo gói bảo vệ + thời hạn |

## 8. CTA (Call To Action, dạng section/banner cuối trang)

| | |
|---|---|
| **Bất biến** | Tối đa 2 CTA trong một khối (1 chính + 1 phụ dạng liên hệ tư vấn — pattern "Dual-Path CTA" đã dùng ở Homepage), luôn có kênh liên hệ người thật đi kèm (hotline) — không có CTA nào chỉ dẫn tới một form không có lối thoát sang người thật |
| **Đổi theo module** | Nội dung/gradient nền theo BRAND-002/003; MICE và Insurance ưu tiên CTA "Nhận tư vấn" hơn "Đặt ngay" — phản ánh chu kỳ quyết định dài hơn của hai module này |

---

## Revision History

| Version | Notes |
|---|---|
| 1.0.0 | Khởi tạo — ranh giới rõ giữa kiến trúc bất biến và cá tính theo module cho 8 nhóm component |

**End of BRAND-009-Component-Personality.md**
