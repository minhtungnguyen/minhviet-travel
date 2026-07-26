# BRAND-008 — Iconography

**Project:** Minh Việt Travel Platform
**Layer:** Emotional Brand Design System
**Version:** 1.0.0
**Nguồn chuẩn:** `lucide-react` (đã dùng thực tế xuyên suốt codebase — `flight-search-box.tsx`, `flight-card.tsx`, `site-header.tsx`, v.v.), khớp với khuyến nghị "Lucide Icons" của `09-iconography.md`. **Không xung đột nguồn** — đây là điểm hiếm hoi cả tài liệu cũ và code thật đã thống nhất sẵn.

---

## 1. Thư viện

**Lucide** (`lucide-react`) là thư viện icon duy nhất. Không trộn thêm Heroicons hay bất kỳ bộ icon nào khác trong cùng một giao diện — kể cả khi Lucide thiếu một icon cụ thể, ưu tiên tìm icon gần nghĩa nhất trong Lucide hoặc dùng SVG tuỳ chỉnh **theo đúng style rule ở §3** thay vì nhập bộ icon thứ hai.

## 2. Kích thước

Dựa trên các kích thước đã dùng thực tế trong code (Tailwind `size-*`):

| Class | Pixel | Dùng cho |
|---|---|---|
| `size-3.5` | 14px | Icon inline trong text nhỏ (caption, meta info) |
| `size-4` | 16px | Icon mặc định trong button, input, label — **kích thước phổ biến nhất** |
| `size-5` | 20px | Icon trong nút lớn (`size="lg"`), icon nổi bật trong card |
| `size-6` | 24px | Icon tiêu đề section, icon trong empty/error state |

Không dùng icon nhỏ hơn 14px (khó thấy, vi phạm accessibility) hoặc lớn hơn 24px trong UI thao tác (icon lớn hơn thuộc phạm vi Illustration, xem BRAND-007).

## 3. Style

| Thuộc tính | Quy định |
|---|---|
| **Kiểu nét** | **Outline (line icon) mặc định** — Lucide vốn là bộ icon outline, giữ nguyên, không tô đặc (filled) trừ ngoại lệ ở §4 |
| **Stroke weight** | Đồng nhất `strokeWidth={2}` (mặc định của Lucide) trên toàn hệ thống — không trộn icon nét mảnh với icon nét dày trong cùng một màn hình |
| **Góc** | Bo góc mềm (Lucide mặc định `strokeLinecap="round"`, `strokeLinejoin="round"`) — giữ nguyên, khớp với `rounded-2xl` của card system |
| **Animation** | Icon **không tự động chuyển động** trừ khi gắn với một hành động cụ thể (xoay 180° khi đổi chiều điểm đi/đến — đã triển khai `flight-search-box.tsx`; xoay chevron khi mở/đóng accordion). Không dùng icon animate liên tục (xem BRAND-005 §2 — cấm lặp vô hạn ở nội dung chính) |
| **Màu** | Icon chức năng dùng `text-muted-foreground` (trung tính) hoặc accent module (BRAND-003 §12) khi icon đó là điểm nhấn tương tác — **không bao giờ multi-color trong 1 icon** |

## 4. Ngoại lệ duy nhất — Ticket

Theo BRAND-002 §Ticket: module Ticket được phép dùng icon **filled nhẹ** (không phải outline) cho một số icon chọn lọc (vé, QR) để tạo cảm giác "vui vẻ có kiểm soát" khác biệt với phần còn lại của hệ thống. Đây là ngoại lệ duy nhất — mọi module khác giữ outline mặc định.

## 5. Quy tắc sử dụng

1. **Một icon cho một hành động, nhất quán toàn hệ thống** — icon "gọi điện" luôn là `Phone`, không đổi giữa các trang.
2. Icon luôn đứng **trước** label trong nav/button (đã là pattern chuẩn trong `mv-button.tsx`, `site-header.tsx`).
3. Icon quyết định/trạng thái (success/warning/error) dùng đúng semantic color ở BRAND-003 §10, không dùng icon trung tính cho trạng thái có ý nghĩa cảnh báo.
4. **Cấm:** icon 3D, icon nhiều màu (multi-color), icon hoạt hình liên tục, dùng emoji thay icon trong UI chức năng (emoji chỉ dùng ở microcopy AI theo quy tắc riêng, xem BRAND-010).

## 6. Bảng icon theo module (một số icon đặc trưng, không giới hạn)

| Module | Icon đặc trưng | Ghi chú |
|---|---|---|
| Flight | `PlaneTakeoff`, `PlaneLanding`, `ArrowLeftRight`, `Search`, `Luggage` | Đã triển khai |
| Hotel | `BedDouble`, `Waves` (hồ bơi), `Sparkles` (spa) | — |
| Cruise | `Anchor`, `Compass`, `Sunset` | — |
| Tour | `MapPin`, `Compass`, `Camera` | — |
| Visa | `Stamp`, `FileText`, `Clock` | Không dùng icon "vui", xem BRAND-002 |
| Insurance | `Shield`, `CheckCircle2`, `Umbrella` | — |
| MICE | `Calendar`, `Users`, `Building2` | — |
| Ticket | `Ticket`, `QrCode`, `CalendarDays` | Được phép filled nhẹ |
| AI Assistant | `Sparkles` (duy nhất, nhỏ) | Không dùng icon robot/mặt người — xem BRAND-002, BRAND-007 |

---

## Revision History

| Version | Notes |
|---|---|
| 1.0.0 | Khởi tạo — Lucide xác nhận là chuẩn (khớp code thật), size/style/ngoại lệ Ticket |

**End of BRAND-008-Iconography.md**
