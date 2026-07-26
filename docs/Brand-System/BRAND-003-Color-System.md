# BRAND-003 — Color System

**Project:** Minh Việt Travel Platform
**Layer:** Emotional Brand Design System
**Version:** 1.0.0
**Nguồn chuẩn:** `app/globals.css` (token đã triển khai thật, đang chạy production) — **không phải** `volume-01-design-dna/04-color-philosophy.md` (tự nhận giá trị chưa chốt) hay `design-system/tokens/colors.ts` (tự nhận chưa được dùng ở đâu). Lý do quyết định: xem BRAND-001 §0.

---

## 0. Nguyên tắc phân bổ màu (tỷ lệ)

Kế thừa nguyên tắc tỷ lệ của Volume 01, áp cho token thật:

| Vai trò | Tỷ lệ diện tích | Token |
|---|---|---|
| Nền/Surface trung tính | ~85% | `--background`, `--card`, `--secondary` |
| Accent tương tác (nút, link, focus) | ~10% | `--accent` / `--mv-journey-blue` / `--mv-sky-cyan` |
| Navy (text/heading/footer) | ~5% | `--primary` / `--mv-deep-navy` |
| Gold | Gần như 0% — chỉ icon sao đánh giá, trừ 2 ngoại lệ đã ghi ở BRAND-002 (Cruise, MICE) | `--gold` / `--mv-mice-gold` |

**Quy tắc cứng:** Navy/Deep Navy **không bao giờ** là nền của một nút bấm (button fill) — chỉ dùng cho text, heading, hoặc nền tối toàn khối (hero overlay, footer). Nút dùng Accent (Sky Blue/Journey Blue).

---

## 1. Primary

`--primary: #0b1f3a` (alias `--navy`). Text trên nền: `--primary-foreground: #ffffff`.

**Dùng cho:** heading, text nhấn mạnh, nền tối toàn khối (footer, hero overlay), biến thể nút `primary` (nền navy — dùng khi ngữ cảnh cần độ nghiêm túc cao hơn accent, ví dụ Visa/MICE).
**Không dùng cho:** nền surface thông thường, text trên nền tối khác navy (dùng trắng).

## 2. Secondary

`--secondary: #eef1f4` (alias `--sand`). Text: `--secondary-foreground: #0b1f3a`.

**Dùng cho:** nền phụ (badge trung tính, nút `secondary`, nền input khi cần phân biệt nhẹ với `background`), chip bộ lọc chưa chọn.
**Không dùng cho:** CTA chính — quá nhạt để làm hành động chính.

## 3. Accent

Hai tầng, dùng đồng thời tuỳ ngữ cảnh:

- `--accent: #35a9e0` (site-wide, alias `--sky`) — dùng cho các trang ngoài phạm vi module Sprint UI-02.
- `--mv-journey-blue: #1677d2` / `--mv-sky-cyan: #25a9e0` — dùng cho Homepage và các module mới (Flight, và mọi module BRAND-002 mới xây từ nay).

**Quyết định cho module mới:** dùng cặp `mv-journey-blue` (đậm, dùng cho nút/link/focus chính) + `mv-sky-cyan` (nhạt hơn, dùng cho gradient/nhấn nhẹ) — nhất quán với những gì Flight Module đã triển khai.

**Dùng cho:** nút CTA chính, link, trạng thái focus/active, icon tương tác, gradient chính. **Đây là màu duy nhất được phép chiếm >1 vị trí nổi bật/màn hình.**

## 4. Background

`--background: #ffffff`. Trắng là nền mặc định cho mọi surface **trừ hero** — đúng cả ba nguồn tài liệu đều thống nhất điểm này (không xung đột).

## 5. Surface

`--card: #ffffff`, viền phân tách bằng `--border` (không dùng đổ bóng để phân tách surface với surface). Với các khối cần phân biệt nhẹ khỏi nền trắng: `--mv-ice-blue: #f5fafe` hoặc `--mv-mist-blue: #eaf4fc` (dùng cho khối "đang chọn"/"đã xác nhận" nhạt, ví dụ FAQ section, Insurance).

## 6. Border

`--border` / `--input`: `#e4e8ed`, đậm hơn Secondary một chút để còn nhìn thấy trên nền trắng ("hairline"). Module-specific: `--mv-border-soft: #dce7f2` cho viền trong các block xanh nhạt (không dùng border xám trên nền xanh nhạt — lệch tông).

**Quy tắc bo góc component đi kèm border** (áp thống nhất, không đổi theo module — xem BRAND-009): card `16px` (Tailwind `rounded-2xl`), input/button `~14px` (`--radius: 0.9rem`).

## 7. Shadow

Không dùng box-shadow kiểu Material (nhiều lớp, tối). Hai tier đã triển khai:

- `.shadow-soft`: `0 1px 2px rgb(11 31 58 / 6%), 0 12px 28px -12px rgb(11 31 58 / 18%)` — mặc định cho card ở trạng thái nghỉ.
- `.shadow-soft-lg`: `0 2px 4px rgb(11 31 58 / 6%), 0 24px 48px -18px rgb(11 31 58 / 24%)` — hover/trạng thái nổi bật.
- `.luxury-ring` (ngoại lệ Cruise, xem BRAND-002): `0 1px 0 0 rgb(255 255 255/60%) inset, 0 30px 60px -30px rgb(7 22 43/40%)` — viền sáng + bóng lan toả, dùng khi cần cảm giác "vật thể cao cấp nổi trên nền", không dùng tràn lan.

Tất cả shadow đều dùng tint navy (`rgb(11 31 58 / …)`), không dùng xám/đen thuần — giữ shadow "thuộc về" bảng màu thương hiệu thay vì trung tính vô cảm.

## 8. Gradient

Không dùng gradient "vì đẹp" — mỗi gradient đã triển khai có mục đích cụ thể (xem `globals.css`):

| Gradient | Giá trị | Dùng cho |
|---|---|---|
| `.bg-gradient-mv-hero` | Navy đậm → Journey Blue → Sky Cyan trong suốt, ngang | Overlay ảnh/video hero, đảm bảo độ tương phản chữ bên trái |
| `.bg-gradient-mv-brand` | Brand Blue → Journey Blue, 135deg | Tile/khối thương hiệu (ví dụ ô "Tour Thiết Kế Trọn Gói") |
| `.bg-gradient-mv-consultation` | Deep Navy → Brand Blue, 160deg | Section CTA tư vấn |
| `.bg-gradient-mv-mice` | Navy đậm → Brand Blue nhạt dần, ngang | Overlay ảnh MICE |
| `.text-gradient-sky` / `.text-gradient-brand` | Sky/Brand blue, dùng cho text | Chữ nhấn trên nền tối (`sky`) hoặc nền sáng (`brand`) |

**Nguyên tắc:** không dùng quá 1 gradient/section; gradient luôn nằm trong họ xanh dương-navy trừ 2 ngoại lệ vàng đã nêu (Cruise, MICE — xem §Gold bên dưới).

## 9. Dark Mode

**Trạng thái hiện tại: chưa triển khai.** `globals.css` đã khai báo `@custom-variant dark (&:is(.dark *));` nhưng chưa có khối `.dark { }` override giá trị nào — đây là **spec chuẩn bị cho tương lai**, không phải mô tả trạng thái đang chạy. Khi triển khai, áp nguyên tắc sau (không đảo ngược tuỳ tiện từng token):

| Token light | Đề xuất dark |
|---|---|
| `--background: #ffffff` | Navy rất đậm, không dùng đen thuần (`#0b1420` gợi ý — cùng họ với `--deep: #07162b`) |
| `--foreground: #1a1d21` | `#f4f6f8` (trắng ngà, không trắng thuần — giữ ấm) |
| `--card: #ffffff` | Navy đậm hơn background một bậc, giữ phân lớp bằng độ sáng chứ không bằng shadow (shadow không rõ trên nền tối) |
| `--accent: #35a9e0` | Giữ nguyên hoặc sáng hơn nhẹ (`#4db8ea`) để đủ tương phản trên nền tối |
| `--gold` | Giữ nguyên — vàng vốn đã tương phản tốt trên nền tối |

Dark mode **không áp dụng khác nhau theo module** — đây là lựa chọn hệ thống (theme toggle), không phải một biến thể cảm xúc.

## 10. Success / Warning / Error / Info

| Vai trò | Token | Giá trị | Dùng cho |
|---|---|---|---|
| Success | `--success` | `oklch(0.58 0.13 155)` (xanh lá) | Xác nhận đặt chỗ thành công, thanh toán thành công, trạng thái "Còn chỗ" |
| Warning | `--warning` | `oklch(0.7 0.15 75)` (hổ phách) | "Sắp hết chỗ", cảnh báo cần chú ý nhưng chưa phải lỗi |
| Error | `--destructive` | `oklch(0.58 0.2 25)` (đỏ) | Lỗi form, thanh toán thất bại, "Hết chỗ" |
| Info | `--accent` (dùng lại, không token riêng) | `#35a9e0` | Thông báo trung tính, gợi ý AI, tooltip |

Không có token `--info` riêng trong hệ thống hiện tại — dùng lại Accent cho vai trò thông tin trung tính là quyết định có chủ đích: tránh phình thêm một họ màu mới cho một vai trò xuất hiện ít và không cần phân biệt mạnh với accent thông thường.

**Trạng thái nghiệp vụ chuyên biệt** (đã triển khai cho Tour, dùng chung logic cho mọi module có trạng thái tồn kho — Flight ghế, Ticket vé, Cruise cabin):

| Trạng thái | Nền | Chữ |
|---|---|---|
| LIMITED (sắp hết) | `--mv-limited-bg #fbf0dc` | `--mv-limited-text #92600c` |
| CHECKING (đang kiểm tra) | `--mv-checking-bg #e9edf5` | `--muted-foreground` |
| SOLD_OUT (hết) | `--mv-soldout-bg #fbeae8` | `--mv-soldout-text #9a2e24` |

Quy tắc: LIMITED dùng hổ phách trầm — **không** dùng `--mv-mice-gold` (đã dành riêng cho MICE) và **không** dùng `--mv-offer-red` (đã dành riêng cho "Ưu đãi"). SOLD_OUT dùng đỏ trầm hơn `--destructive` chuẩn — đây là trạng thái thông tin, không phải lỗi hệ thống.

---

## 11. Gold — quy tắc nghiêm ngặt và 2 ngoại lệ

**Mặc định:** `--gold: #c7a86b` **chỉ** dùng cho icon sao đánh giá (rating stars). Không dùng cho badge, CTA, eyebrow, border, hay bất kỳ vị trí nào khác — quy tắc kế thừa nguyên vẹn từ `04-color-philosophy.md`, đã được `UI_MASTER_REVIEW.md` xác nhận là lỗi P0 khi bị vi phạm (header dùng gold ngoài phạm vi cho phép).

**2 ngoại lệ đã được duyệt** (xem lý do tại BRAND-002):

1. **Cruise** — `gold-soft (#e2d3b3)` trong gradient nền/overlay hero, không dùng cho CTA/text.
2. **MICE** — `--mv-mice-gold (#c89a36)` trong gradient nền và có thể dùng cho 1 badge/metric nổi bật mỗi màn hình (tối đa), không dùng cho CTA chính.

Không có ngoại lệ thứ 3 nếu chưa có quyết định rõ ràng ghi vào tài liệu này.

---

## 12. Bảng accent theo module (tham chiếu nhanh)

| Module | Accent chính | Accent phụ/gradient | Vàng? |
|---|---|---|---|
| Flight | `mv-journey-blue` | `mv-sky-cyan` | Không |
| Hotel | `mv-journey-blue` | `paper`/`sand` (ấm) | Không |
| Cruise | `mv-deep-navy` | `gold-soft` | Có (nền) |
| Tour | Theo điểm đến (trong palette xanh/navy đã duyệt) | — | Không |
| Visa | `mv-deep-navy` | — (gần đơn sắc) | Không |
| Insurance | `mv-mist-blue` | `success` (khi xác nhận) | Không |
| MICE | `mv-deep-navy` | `mv-mice-gold` | Có (nền/badge) |
| Ticket | `mv-sky-cyan` | — | Không |
| AI Assistant | `mv-journey-blue` | `mv-sky-cyan` (nhẹ) | Không |

---

## Revision History

| Version | Notes |
|---|---|
| 1.0.0 | Khởi tạo — chốt token thật làm nguồn chuẩn, ghi nhận xung đột 3 nguồn tại BRAND-001 |

**End of BRAND-003-Color-System.md**
