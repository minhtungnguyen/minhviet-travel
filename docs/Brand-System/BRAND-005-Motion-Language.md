# BRAND-005 — Motion Language

**Project:** Minh Việt Travel Platform
**Layer:** Emotional Brand Design System
**Version:** 1.0.0
**Nguồn chuẩn:** `app/globals.css` (token `--motion-*` đã triển khai thật).

---

## 0. Quyết định — chốt lại xung đột 3 nguồn

Volume 01 (`10-motion.md`) đề xuất khoảng 150–300ms không có easing curve cụ thể. `design-system/` đề xuất thang 100/150/200/300/400ms với `cubic-bezier(0.4, 0, 0.2, 1)`. **Token đang chạy thật** trong `globals.css` là:

```css
--motion-fast: 160ms;
--motion-normal: 240ms;
--motion-slow: 360ms;
--ease-mv-standard: cubic-bezier(0.2, 0, 0, 1);
```

**Đây là chuẩn chính thức của tài liệu này** — lý do chọn giống BRAND-003/004: giá trị đã chạy thật, hai nguồn kia tự nhận chưa chốt/chưa dùng.

Đường cong `cubic-bezier(0.2, 0, 0, 1)` là một dạng "ease-out mạnh ở đầu" — bắt đầu nhanh, giảm tốc êm về cuối. Cảm giác: dứt khoát nhưng không giật, phù hợp brand personality "tự tin điềm tĩnh" (BRAND-001 §2).

---

## 1. Ba tier + khi nào dùng tier nào

| Tier | Giá trị | Utility class | Dùng khi |
|---|---|---|---|
| Fast | 160ms | `.duration-mv-fast` | Hover, focus, toggle, thay đổi trạng thái nhỏ (checkbox, tab) |
| Normal | 240ms | `.duration-mv-normal` | Mở/đóng panel, chuyển tab nội dung, xuất hiện phần tử mới trong viewport |
| Slow | 360ms | `.duration-mv-slow` | Chuyển trang, mở modal lớn, hero entrance, mọi chuyển động mang tính "cảm xúc" (Cruise, Hotel) |

Easing `.ease-mv-standard` áp dụng mặc định cho cả 3 tier trừ khi có lý do cụ thể (ví dụ `.reveal` dùng `cubic-bezier(0.22, 1, 0.36, 1)` riêng — một ease-out mềm hơn, phù hợp cho hiệu ứng xuất hiện theo scroll dài hơi, xem §3).

---

## 2. Nguyên tắc hành vi (kế thừa nguyên vẹn từ `10-motion.md`, không đổi)

**Bắt buộc:**
- Mọi trạng thái tải dữ liệu dùng skeleton loading, không dùng spinner toàn màn hình nếu có thể tránh.
- Chuyển động chính là fade + dịch chuyển nhẹ (translate), không phải scale/zoom mạnh.
- Tôn trọng `prefers-reduced-motion` — đã triển khai đầy đủ trong `globals.css` (`@media (prefers-reduced-motion: reduce)` tắt toàn bộ `.reveal`, `.animate-kenburns`, `.animate-float`, `.animate-gradient`, `.animate-glow`, `.animate-soft-ping`, `.shine`).

**Cấm tuyệt đối** (không có ngoại lệ theo module):
- Bounce / spring giật (overshoot).
- Nhấp nháy (flash).
- Zoom mạnh (>1.15 scale trong animation UI, phân biệt với Ken Burns ảnh nền vốn chủ đích rất chậm).
- Hiệu ứng lặp vô hạn ở nội dung chính (được phép ở chi tiết trang trí rất nhỏ và rất tinh tế — ví dụ `.animate-soft-ping` cho chấm báo hiệu "còn chỗ", `.animate-glow` cho nhấn nhẹ nút CTA — không dùng cho block lớn).

---

## 3. Thư viện chuyển động đã triển khai (dùng lại, không tạo mới trùng lặp)

| Class | Mô tả | Dùng cho |
|---|---|---|
| `.reveal` (+ `-left`/`-right`/`-scale`/`-blur`) | Fade + translate/scale khi vào viewport, 0.8s, ease riêng | Nội dung xuất hiện theo scroll — dùng nhiều nhất ở Tour (BRAND-002) |
| `.hover-lift` | Nâng nhẹ + đổ bóng sâu hơn khi hover, 0.35s | Card sản phẩm nói chung |
| `.img-zoom` | Zoom ảnh 1.08x khi hover card cha | Card có ảnh (Tour, Hotel, Ticket) |
| `.animate-kenburns` | Zoom rất chậm 1.04→1.13 trong 20s, chạy 1 lần | Ảnh hero tĩnh cần cảm giác "sống" (Hotel, Cruise) |
| `.shine` | Vệt sáng quét qua khi hover | CTA cao cấp, thẻ ưu đãi — dùng tiết chế |
| `.animate-glow` | Viền sáng nhấp nháy rất nhẹ, 2.4s loop | Nút CTA cần thu hút nhẹ (không dùng cho >1 phần tử/màn hình) |
| `.animate-soft-ping` | Chấm ping báo hiệu "live"/khẩn cấp thật | Chỉ dùng khi có dữ liệu thật đứng sau (ví dụ số chỗ còn thật) — **cấm dùng cho khan hiếm giả**, xem BRAND-001 §5 |
| `.link-underline` | Gạch chân quét khi hover link | Link trong đoạn văn, nav |
| `.scroll-progress` | Thanh tiến trình cuộn trang, gradient 3 màu | Trang nội dung dài (Tour detail, bài viết Travel Guide) |

Trước khi tạo animation mới, kiểm tra bảng này — nếu có class phù hợp, dùng lại (nguyên tắc "không tạo component/hiệu ứng mới nếu cái cũ mở rộng được", kế thừa `11-component-principles.md`).

---

## 4. Bảng thời lượng theo ngữ cảnh (yêu cầu cụ thể của MASTER PROMPT)

| Ngữ cảnh | Tier | Ghi chú |
|---|---|---|
| **Hover** (nút, card, link) | Fast (160ms) | Toàn hệ thống, không đổi theo module |
| **Page Transition** | Slow (360ms) | Route chuyển hẳn trang — dùng fade, không dùng slide toàn trang (dễ gây motion sickness trên mobile) |
| **Loading** (khởi tạo dữ liệu) | — | Không dùng thời lượng cố định — hiển thị Skeleton (xem §5) tới khi dữ liệu sẵn sàng, không animation giả kéo dài thời gian chờ cảm nhận |
| **Skeleton** | Pulse loop, không thuộc 3 tier | `animate-pulse` (Tailwind mặc định) trên khối `bg-secondary` — đã dùng ở `flight-search-loading-skeleton.tsx` |
| **Success** (đặt chỗ/thanh toán thành công) | Normal (240ms) entrance + icon xác nhận | Nhẹ nhàng, **không confetti/pháo giấy** — vi phạm "premium competence", trừ khi được duyệt riêng cho một khoảnh khắc cực kỳ hiếm (ví dụ hoàn tất một gói MICE lớn) |
| **Error** | Fast (160ms) shake rất nhẹ (≤4px, 1 chu kỳ) hoặc chỉ đổi màu viền + fade-in thông báo lỗi | Không rung mạnh, không đỏ chớp nháy |
| **Booking flow** (chuyển bước) | Normal (240ms), có hướng ngang (bước sau trượt từ phải) | Cho khách cảm nhận tiến trình, đồng thời với progress stepper (BRAND-009) |
| **Payment** (đang xử lý thanh toán) | Trạng thái tĩnh có label rõ ("Đang xử lý thanh toán…") + spinner nhỏ duy nhất chỗ này được phép dùng spinner thay skeleton, vì không có "khung nội dung" để skeleton hoá | Không dùng progress bar giả chạy nhanh hơn thời gian xử lý thật |

---

## 5. Motion theo module (tham chiếu, chi tiết đầy đủ ở BRAND-002)

| Module | Tier chủ đạo | Đặc trưng riêng |
|---|---|---|
| Flight | Fast | Có hướng ngang, mô phỏng hành trình |
| Hotel | Slow | Fade/Ken Burns, không slide gấp |
| Cruise | Slow (mở rộng 360–450ms) | Ease êm như sóng, `.luxury-ring` |
| Tour | Normal, nhiều `.reveal` | Đa hướng theo layout |
| Visa | Fast, chỉ hover/focus | Gần tĩnh |
| Insurance | Slow | Không hiệu ứng "ăn mừng" quá mức |
| MICE | Normal | Chuyển động cho data (timeline/dashboard) |
| Ticket | Fast, nảy nhẹ trong giới hạn cấm bounce | "Vui có kiểm soát" |
| AI Assistant | Normal | Streaming text, gradient "thở" biên độ nhỏ |

---

## Revision History

| Version | Notes |
|---|---|
| 1.0.0 | Khởi tạo — chốt token thật (160/240/360ms, cubic-bezier(0.2,0,0,1)), bảng ngữ cảnh đầy đủ |

**End of BRAND-005-Motion-Language.md**
