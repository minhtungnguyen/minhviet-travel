# BRAND-004 — Typography

**Project:** Minh Việt Travel Platform
**Layer:** Emotional Brand Design System
**Version:** 1.0.0
**Nguồn chuẩn:** `app/layout.tsx` + `app/globals.css` (font đã tải và đang chạy production).

---

## 0. Quyết định font — chốt lại xung đột 3 nguồn

Ba nguồn tài liệu cũ đề xuất ba lựa chọn khác nhau (xem BRAND-001 §0): Volume 01 nói "Inter chính / Manrope phụ" (không tải font nào tên Manrope trong code); `design-system/` nói "Manrope cho heading / Inter cho body" (chưa tải font nào của lớp này). **Cả hai đều sai so với thực tế đang chạy.**

**Font đang chạy thật, và là chuẩn chính thức của tài liệu này:**

| Vai trò | Font | CSS variable | Weight đã tải | Subset |
|---|---|---|---|---|
| Display / Heading (h1–h5) | **Plus Jakarta Sans** | `--font-jakarta` → `font-display` | 500, 600, 700, 800 | latin, vietnamese |
| Body / UI / Label | **Inter** | `--font-inter` → `font-sans` (mặc định `<body>`) | variable (toàn dải) | latin, vietnamese |

Không dùng Manrope ở bất kỳ đâu — loại hẳn khỏi hệ thống để tránh nhầm lẫn về sau.

---

## 1. Vì sao 2 font này

- **Plus Jakarta Sans** cho heading: có tính cách hơn Inter ở trọng lượng đậm (700–800), hình chữ hơi vuông vắn tạo cảm giác hiện đại/công nghệ mà vẫn nghiêm túc — phù hợp "premium competence" (BRAND-001 §2) hơn một grotesk trung tính thuần tuý.
- **Inter** cho phần thân: tối ưu cho đọc ở kích thước nhỏ, hỗ trợ tiếng Việt tốt, là lựa chọn an toàn cho UI dày đặc thông tin (bảng giá, form, danh sách chuyến bay).
- Không dùng quá 2 họ font — đúng nguyên tắc `05-typography-dna.md`: "max 2 fonts."

**Không đổi theo module** (xem BRAND-002 §0) — Flight, Hotel, Cruise, Tour... đều dùng cùng cặp font này. Cảm xúc riêng của module đến từ màu/motion/ảnh, không từ đổi kiểu chữ.

---

## 2. Type Scale

Volume 01 chỉ nêu tên tầng (Display/Heading/Body/Caption) không có số đo; `design-system/` có bảng số đo đầy đủ nhưng gắn với font khác. Tài liệu này **lấy cấu trúc số đo của `design-system/tokens/typography.ts` làm khung** (vì đây là bảng type scale đầy đủ nhất từng có trong repo) nhưng gắn vào cặp font Plus Jakarta Sans / Inter đã chốt ở §0 — không đổi font, chỉ mượn khung kích thước.

| Tầng | Size / Line-height | Weight | Font | Dùng cho |
|---|---|---|---|---|
| Display | 64px / 72px | 800 | Plus Jakarta Sans | Hero headline (Homepage, Flight Hero) — dùng rất hạn chế |
| H1 | 48px / 56px (responsive: `text-4xl sm:text-5xl` ~ 36–48px thực tế) | 700 | Plus Jakarta Sans | Tiêu đề trang, hero section |
| H2 | 36px / 44px | 700 | Plus Jakarta Sans | Tiêu đề section |
| H3 | 28px / 36px | 600–700 | Plus Jakarta Sans | Tiêu đề card lớn, sub-section |
| H4 | 22px / 30px | 600 | Plus Jakarta Sans | Tiêu đề card, tên sản phẩm |
| Body Large | 18px / 28px | 400 | Inter | Đoạn mở đầu, mô tả quan trọng |
| Body | 16px / 26px | 400 | Inter | Nội dung chính — **tối thiểu 16px cho mọi nội dung thân**, theo `15-accessibility.md` |
| Small | 14px / 22px | 400 | Inter | Metadata, chú thích phụ, nhãn form |
| Caption | 12px / 18px | 500, tracking +0.02em | Inter | Timestamp, nguồn trích dẫn, ghi chú nhỏ nhất |
| Button | 14px / 20px | 600, tracking +0.01em | Inter | Nhãn nút — Inter, không dùng font display cho nút (giữ nút gọn, dễ scan) |
| Label / Eyebrow | 13px / 18px | 600, UPPERCASE, tracking +0.24em | Inter | Nhãn phân loại phía trên tiêu đề (`.eyebrow` đã có trong `globals.css`, tracking thực tế 0.24em — rộng hơn đề xuất gốc, giữ nguyên vì đã tinh chỉnh và đang chạy) |

**Quy tắc cứng đã triển khai:** mọi `h1–h5` tự động nhận `font-family: var(--font-display)`, `letter-spacing: -0.02em`, `font-weight: 700` từ `@layer base` trong `globals.css` — không override thủ công trừ khi có lý do rất cụ thể (ví dụ H3 dùng 600 thay vì 700 khi ở trong danh sách dày đặc).

---

## 3. Quy tắc sử dụng

1. **Không viết hoa toàn đoạn văn** — chỉ Eyebrow/Label được phép uppercase, và luôn kèm tracking rộng để dễ đọc.
2. **Line-height rộng cho block đọc dài** (Body Large, Body) — không nén dòng để "vừa khung" trên mobile (vi phạm nguyên tắc responsive ở `02-design-philosophy.md`).
3. Không quá 3 trọng lượng (weight) khác nhau trên cùng một màn hình.
4. Không dùng font trang trí/viết tay ở bất kỳ đâu trong sản phẩm (chỉ áp dụng cho nội dung marketing ngoài platform nếu có, không áp dụng cho UI).
5. Tiếng Việt có dấu — luôn kiểm tra line-height đủ cho dấu thanh không bị cắt (đặc biệt Display/H1 ở trên ảnh nền, nơi dễ bị crop theo container cố định).

---

## 4. Vì sao Typography không đổi theo module

Trái với Color/Motion/Photography, Typography nằm trong nhóm "Không đổi theo module" (BRAND-002 §0) vì hai lý do:

1. **Nhận diện thương hiệu**: nếu mỗi module có font riêng, người dùng chuyển từ Flight sang Hotel sẽ có cảm giác "hai sản phẩm khác nhau", phá vỡ mục tiêu cuối của toàn bộ Brand System (nhận ra ngay là Minh Việt dù ở module nào — xem MỤC TIÊU của MASTER PROMPT).
2. **Chi phí kỹ thuật**: mỗi font thêm vào là một request tải font, ảnh hưởng Core Web Vitals (LCP) — vốn đã là yêu cầu cứng ở mọi PRD Flight (`Lighthouse Performance ≥ 90`).

Sự khác biệt cảm xúc giữa các module đến từ **trọng lượng và kích thước được chọn trong cùng một scale**, không phải từ đổi font — ví dụ Visa dùng H2/H3 nhỏ hơn, ít Display hơn (vì ít hero lớn) trong khi Cruise dùng Display nhiều hơn (hero cảm xúc chiếm ưu thế).

---

## Revision History

| Version | Notes |
|---|---|
| 1.0.0 | Khởi tạo — chốt Inter + Plus Jakarta Sans làm chuẩn duy nhất, type scale đầy đủ số đo |

**End of BRAND-004-Typography.md**
