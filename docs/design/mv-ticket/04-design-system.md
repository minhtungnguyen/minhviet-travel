# MV Ticket — Design System (Color · Typography · Spacing · Animation · Responsive)

**Đọc trước:** `01-design-direction.md`, `02-homepage-and-listing-concept.md`, `03-product-detail-and-checkout-concept.md`.
**Nguyên tắc bao trùm:** mọi token ở đây là **additive** vào `app/globals.css` — không sửa/xoá token nền tảng đang chạy (`--mv-deep-navy`, `--mv-journey-blue`, `--mv-sky-cyan`...), đúng khuôn mẫu đã dùng cho Combo (`--mv-combo-sunset`, `--mv-combo-sand`) và MICE Gold trước đó. Giá trị hex dưới đây là đề xuất để duyệt, **chốt cùng lúc nhìn thấy trên UI thật** (browser-verify), không chốt cứng chỉ trên giấy.

---

## 1. Color System

### 1.1 Quyết định cuối cùng — ĐÃ CHỐT (D1, phê duyệt trực tiếp bởi chủ dự án)

**Primary = Minh Việt Blue** — nguyên hệ Navy/Journey Blue/Sky Cyan đã có trong `app/globals.css` (`--mv-deep-navy`, `--mv-journey-blue`, `--mv-sky-cyan`), **không phải màu mới**. **Accent = Festival Orange**, dùng riêng cho CTA/giá/badge — tín hiệu "tiền, hành động mua". **Không dùng Purple** — loại bỏ hoàn toàn khỏi hệ thống màu của module này, kể cả cho category (khác đề xuất ban đầu ở `mv-ticket-ui-research.md` §13, nay đã bị quyết định này ghi đè).

**Hệ quả trực tiếp — phân vai rõ ràng giữa 2 màu duy nhất:**
- **Minh Việt Blue** = điều hướng/lựa chọn/trạng thái (category chip active, tab active, link).
- **Festival Orange** = tiền/hành động (CTA "Mua vé", giá, badge khuyến mãi có dữ liệu thật).

Cách phân vai này thực ra **mạnh hơn** phương án Purple+Orange ban đầu: khi chỉ có đúng 1 màu gắn với "mua hàng", tín hiệu thị giác "đây là chỗ để bấm mua/đây là giá" trở nên rõ ràng tuyệt đối trên toàn trang — không bị pha loãng bởi màu thứ 2 cũng nổi bật ở nơi khác.

### 1.2 Token đề xuất (additive, theo đúng khuôn mẫu `--mv-combo-*`)

```css
--mv-ticket-orange: #E8630A;        /* CTA chính, giá, badge nổi bật — độ bão hoà cao hơn hẳn
                                        --mv-combo-sunset (#d97a3f) để tạo tương phản "sôi động"
                                        rõ rệt so với "nghỉ dưỡng" của Combo */
--mv-ticket-orange-light: #FDE8D8;  /* nền badge nhạt, hover nhẹ */
```

Không có token `--mv-ticket-purple*` — đã loại bỏ theo D1. Mọi nhu cầu màu "xanh Minh Việt" dùng thẳng token nền tảng đã có (`--mv-journey-blue`, `--mv-brand-blue`, `--mv-deep-navy`), không tạo token trùng lặp riêng cho Ticket.

Rating sao (nếu/khi có dữ liệu thật): dùng nguyên `--mv-mice-gold` hoặc vàng sao đã thống nhất toàn hệ thống (Color Philosophy Volume 01: "Gold chỉ được dùng cho icon sao đánh giá") — **không tạo màu vàng riêng cho Ticket**.

Badge trạng thái tồn kho thật (nếu có, vd "Sắp hết ngày"): tái dùng `--mv-limited-bg`/`--mv-limited-text` đã có sẵn trong `globals.css` cho đúng ngữ nghĩa "limited", không phát minh cặp màu mới trùng chức năng.

### 1.3 Tỷ lệ sử dụng (khác Volume 01 §Color Ratio ở đúng phần "Emotion Layer", giữ nguyên phần "Brand Foundation")

| Layer | Tỷ lệ | Ghi chú |
|---|---|---|
| Brand Foundation (trắng/Navy/Blue/text) | ~70% | Không đổi — Minh Việt Blue vẫn là primary, giống tỷ lệ đã áp dụng cho Combo |
| Emotion Layer (Festival Orange) | ~15–20% | Thấp hơn ước tính ban đầu (từng gộp cả Purple) vì giờ chỉ còn 1 màu accent — nhưng vẫn cao hơn hẳn mức "chỉ icon/hover" của Combo, vì Excitement cần Orange *nhìn thấy được* trên card/badge/CTA |
| Gold (sao đánh giá) | ~0%, chỉ khi có dữ liệu thật | Không đổi quy tắc toàn hệ thống |

**Vẫn cấm tuyệt đối** (kế thừa nguyên §"Forbidden" của Color Philosophy Volume 01): nền vàng, card nền vàng, button vàng đặc, ảnh AI-render giả làm hero.

### 1.4 Áp dụng cụ thể theo component

| Vị trí | Màu |
|---|---|
| Nút "Mua vé"/"Chọn vé" (CTA chính) | `--mv-ticket-orange` nền đặc, chữ trắng |
| Giá trên card/PDP | `--mv-ticket-orange` hoặc `--mv-deep-navy` đậm — chốt khi nhìn UI thật (§0), ưu tiên orange nếu cần giá nổi bật hơn text xung quanh |
| Badge "Được đề xuất" | Nền `--mv-ticket-orange-light`, chữ `--mv-ticket-orange` |
| Chip category active | Nền `--mv-journey-blue` (Minh Việt Blue), chữ trắng — **không dùng Orange** ở đây, giữ Orange chỉ cho tín hiệu mua |
| Chip category inactive | Nền `--mv-mist-blue`/`--mv-ice-blue` (đã có), chữ `--mv-deep-navy` |
| Header/Footer/Logo | **Không đổi** — nguyên Navy toàn hệ thống, đúng quy tắc "Emotion Accent không dùng cho Header/Logo" (13.3 §Quy tắc sử dụng) |

---

## 2. Typography

Kế thừa nguyên hệ font đã có (`--font-display`: Plus Jakarta Sans qua biến `--font-jakarta`; `--font-sans`: Inter) — **không thêm font mới**, đúng nguyên tắc Volume 01 §05 "không quá 2 font". Khác biệt với Tour/Combo nằm ở **cách dùng**, không phải font family:

| | Tour/Combo (editorial) | Ticket (marketplace) |
|---|---|---|
| Heading | `font-display`, có thể italic/serif-leaning, dòng dài | `font-display` giữ nguyên nhưng **ngắn hơn, đậm hơn** (font-weight cao hơn 1 bậc so với heading Tour cùng cấp) — ưu tiên quét nhanh |
| Giá | Cỡ ngang heading phụ, không phải body | **Lớn hơn** — ngang hoặc lớn hơn tiêu đề sản phẩm trên card, vì giá là tín hiệu quyết định số 1 (research §11) |
| Body/mô tả | Đoạn văn dài, line-height rộng | Bullet ngắn, tối đa 2 dòng trên card (`line-clamp-2` — đã dùng đúng trong code hiện tại, giữ nguyên) |
| Eyebrow/label | Mảnh, letter-spacing rộng, giọng tư vấn | Ngắn, có thể đặt trong badge nền màu thay vì chỉ text mảnh |

**Không đổi:** cỡ chữ body tối thiểu 16px, line-height rộng cho đoạn văn dài (usage_guide/cancellation_policy vẫn là văn bản chính sách, cần dễ đọc như phần còn lại hệ thống) — Excitement áp dụng cho heading/giá/badge, không áp dụng cho văn bản chính sách pháp lý.

---

## 3. Spacing System

Volume 01 §06 định nghĩa spacing cho tinh thần "Luxury = nhiều khoảng thở" (section padding 96–120px, card padding 24–32px, grid gap 24–32px) — đúng cho Tour/Combo/Cruise nhưng **không phù hợp mật độ marketplace** mà research (§11, Klook/KKday) xác nhận là cần thiết cho vé vui chơi.

| | Editorial (Volume 01 gốc) | Ticket (đề xuất) |
|---|---|---|
| Section padding (dọc) | 96–120px | **56–72px** — nhiều dải nội dung hơn trên cùng 1 màn hình, không cần khoảng thở lớn giữa mỗi dải |
| Card padding | 24–32px | **16–20px** — card nhỏ, mật độ cao hơn, vẫn đủ thở để không "dính" |
| Grid gap | 24–32px | **12–16px** trên mobile (2 cột/màn hình), **20–24px** desktop |
| Card trên 1 hàng ngang (mobile) | 1 (Tour full-width) | **1.3–1.5 card hiển thị** (card kế tiếp lộ 1 phần) — gợi ý "còn nữa, vuốt tiếp", đúng pattern rack Klook/KKday |

**Vẫn giữ nguyên tắc nền tảng không đổi:** "Không nhồi quá nhiều card", "Không dính sát mép", "Mỗi màn hình chỉ có một trọng tâm" (Volume 01 §06 Rules) — mật độ cao hơn Tour không có nghĩa được phép hỗn loạn; mỗi dải marketplace vẫn phải có 1 trọng tâm rõ ràng (1 chủ đề/dải), ranh giới dải-với-dải phải rõ bằng heading + khoảng cách nhất quán, không phải bằng cách nhồi card sát nhau không ngắt.

---

## 4. Animation Guideline

Kế thừa nguyên **tiêu chuẩn thời lượng** đã có ở Volume 13 §13.6 (Hover 150–250ms, Fade 200–300ms, Modal 250–350ms, Page transition <500ms) và **danh sách cấm** (flash liên tục, bounce quá mạnh, zoom lớn, hiệu ứng gây chóng mặt) — không đổi, áp dụng nguyên vẹn cho Ticket.

Volume 13 §13.6 chưa có dòng "Motion theo Module" cho Ticket (chỉ có Flight/Hotel/Cruise/Tour/Combo) — đề xuất bổ sung, nhất quán về *cường độ* (không vượt ngưỡng thời lượng đã quy định) nhưng khác về *cảm giác*:

> **Vé vui chơi — Motion:** Nhanh, có bật nhẹ (subtle spring/ease-out thay vì ease linear), cảm giác "đáp ứng ngay". Card hover nâng 4–8px (đúng chuẩn chung §6), nhưng easing dùng đường cong bật nhẹ hơn Tour (vẫn trong khung 150–250ms, không kéo dài hơn). Số hiển thị (giá, tổng tiền khi đổi số lượng) nên có hiệu ứng đổi số ngắn (count-up nhẹ dưới 300ms) khi khách bấm +/- số lượng — phản hồi tức thì, đúng emotion "Instant booking".

Vẫn tôn trọng `prefers-reduced-motion` ở mọi nơi (đúng pattern `useReducedMotionSafe` đã có sẵn trong code — không tạo hook mới, tái dùng nguyên).

**Cấm bổ sung riêng cho Ticket:** không dùng confetti/pháo hoa animation trang trí không phục vụ chuyển đổi (đúng ranh giới "sôi động ≠ phô trương" đã khoá ở `01-design-direction.md` §3) — chuyển động rực rỡ nằm ở *ảnh/video thật* (roller coaster, pháo hoa trong ảnh), không phải ở hiệu ứng UI giả lập.

---

## 5. Responsive Guideline

Breakpoint bắt buộc kiểm tra: **360 / 390 / 768 / 1024 / 1280 / 1440px** — giữ nguyên danh sách đã chốt ở `05-ui-ux-specification.md` §8, không đổi.

| Vùng | Mobile (360–430) | Tablet (768) | Desktop (1024+) |
|---|---|---|---|
| Homepage — dải sản phẩm | Cuộn ngang, 1.3 card lộ ra | Cuộn ngang, 2.3 card | Grid tĩnh hoặc cuộn ngang 4+ card |
| Category chips | Cuộn ngang 1 hàng | Cuộn ngang 1 hàng | Có thể hiện đủ không cần cuộn |
| Listing grid | 2 cột | 3 cột | 4 cột |
| Product Detail — khối chọn vé | Sticky bottom bar thu gọn (giá + nút), mở full khi chạm | Inline trong luồng cuộn | Sticky panel bên phải |
| Gallery | Vuốt ngang full-width | Vuốt ngang | Grid ảnh lớn + lightbox |
| Checkout | 1 cột, tóm tắt đơn thu gọn ở trên | 1 cột | 2 cột (form trái, tóm tắt phải) nếu đủ rộng |

**Ưu tiên số 1 là mobile** (đúng yêu cầu "80% khách sẽ mua trên điện thoại") — nghĩa là: thiết kế mobile trước khi mở rộng desktop, không thiết kế desktop rồi co lại. Thanh CTA dính đáy màn hình trên mobile ở Product Detail phải test thực tế không đè lên `MobileCTA`/cookie banner toàn site đã có (bài học Combo P2-02, xem `docs/reviews/COMBO-PAGE-VOLUME-13-AUDIT.md`).

---

## 6. Checklist nghiệm thu trước khi coi là "đạt"

Áp dụng khung Creative Review đã dùng cho Combo (`13.10-CREATIVE-REVIEW-V1.md`), cộng thêm câu hỏi riêng cho module này:

- [ ] Nhìn tổng thể, người xem có nói "đây là website Tour" không? (Nếu có → thất bại, theo đúng yêu cầu bắt buộc của brief)
- [ ] Mọi badge/rating/số liệu hiển thị có dữ liệu thật đứng sau không? (§7 tài liệu `01-design-direction.md`)
- [ ] Giá ở checkout có khớp 100% với giá đã thấy ở Product Detail không?
- [ ] Card có tự trả lời được câu hỏi "có vé/giá bao nhiêu" mà không cần bấm vào không?
- [ ] Thanh CTA mobile có che UI toàn site (MobileCTA, cookie banner) không?
- [ ] Cả 6 breakpoint bắt buộc đã browser-verify chưa?
- [ ] Header/Footer/Logo có bị đổi màu ngoài phạm vi cho phép không? (phải là "Không")

---

*Đây là tài liệu cuối trong bộ 4 (`01`–`04`). Sau khi cả 4 được phê duyệt, mới bắt đầu chuyển sang implementation plan (component/code) — không trước.*
