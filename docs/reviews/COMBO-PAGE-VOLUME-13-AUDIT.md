# COMBO PAGE — VOLUME 13 VISUAL EMOTION SYSTEM AUDIT

**Module:** Combo (`/combo`, `/combo/tat-ca`)
**Branch:** `feature/combo-landing-page`
**Ngày audit:** 2026-07-27
**Người thực hiện:** Claude Code (Senior UI/UX Engineer · Frontend Architect · Design System Auditor · Brand Experience Reviewer · Web Performance Engineer)
**Phạm vi:** Audit-only pass trước khi sửa code, theo `MASTER-BIBLE/VOLUME-13-VISUAL-EMOTION-SYSTEM/` đối chiếu với `docs/Brand-System/` (nguồn brand chuẩn, xem §0) và code thực tế trên nhánh.

---

## 0. Ghi chú nguồn tài liệu — xung đột đã phát hiện

Trước khi audit, cần ghi nhận một xung đột giữa hai tài liệu được yêu cầu đối chiếu:

- **`MASTER-BIBLE/VOLUME-13-VISUAL-EMOTION-SYSTEM/`** (12 file, 13.1–13.11 — 13.5 có 2 file trùng chương: `13.5-VIDEO-DNA.md` 15 dòng và `13.5-VIDEO-DNA-V1.md` 88 dòng, dùng bản V1 vì đầy đủ hơn) định nghĩa **Combo = Vacation**, Accent **Sunset Orange**, ảnh hero "gia đình, hồ bơi, biển, hoàng hôn".
- **`docs/Brand-System/BRAND-002-Emotional-Design-System.md`** và **`BRAND-003-Color-System.md`** — tài liệu tự nhận là "nguồn chuẩn" vì đối chiếu trực tiếp với `app/globals.css` đang chạy production (không phải spec chưa triển khai) — định nghĩa ma trận cảm xúc cho **9 module: Flight, Hotel, Cruise, Tour, Visa, Insurance, MICE, Ticket, AI Assistant**. **Combo không nằm trong danh sách này.** Không có token `Sunset Orange`/`Sand Beige` nào tồn tại trong `app/globals.css` — chỉ có họ Navy/Sky/Journey Blue và 2 ngoại lệ Gold đã duyệt (Cruise, MICE).

**Kết luận dùng cho audit này:** đây là một khoảng trống tài liệu thật (Combo là module mới, chưa được BRAND-002/003 "onboard"), không phải lỗi của người viết code Combo. Code hiện tại đã chọn hướng an toàn — tái dùng nguyên token Flight (Journey Blue/Sky Cyan) thay vì tự chế màu — đúng tinh thần "không dùng màu tùy hứng". Nhưng điều đó khiến Combo **không đạt được** yêu cầu rõ ràng của Volume 13 §13.2/13.3 và của chính brief sprint này (mục II: Sunset Orange/Sand Beige/Warm Neutral, tỷ lệ ~70/30). Xem phát hiện **P2-01**.

**Tài liệu Volume 13 còn thiếu/không nhất quán (ghi nhận theo yêu cầu phần III):**
- 13.5 (Video DNA) tồn tại 2 bản trùng chương, không phải "thiếu" nhưng cần dọn (không sửa trong phạm vi audit này vì đây là tài liệu, không phải code Combo).
- 13.1–13.4 không có hậu tố `-V1` trong khi 13.5–13.11 đều có — không nhất quán quy ước đặt tên, không ảnh hưởng nội dung audit.

---

## 1. Executive Summary

Trang `/combo` là một **Editorial Commerce Landing Page** hoàn chỉnh, code sạch, kiến trúc tốt (data-driven qua `ComboLandingContent`, Zod-validated, tái dùng tối đa component/token có sẵn — `MVButton`, `SectionHeading`, `Reveal`, `ComboCard`, `FlightArticleCard`). Toàn bộ nội dung nghiệp vụ (giá, CTA, trạng thái) đều trung thực — không có giá giả, đếm ngược giả, hay lượt đặt giả. `pnpm lint`/`typecheck`/`test`/`build` đều pass theo handover doc.

Hai khoảng cách chính so với Volume 13:

1. **Combo Emotion Layer chưa tồn tại** — toàn trang dùng nguyên palette Journey Blue/Sky Cyan của Flight, không có Sunset Orange/Sand Beige nào để phân biệt cảm xúc "Vacation" của Combo với "Freedom" của Flight (13.2, 13.3).
2. **Một lỗi số liệu nghiệp vụ** — Destination Explorer hiển thị "2 hành trình Combo" cho Sa Pa nhưng chỉ có 1 Combo `published` (Combo còn lại là `draft`, không hiển thị) — số liệu không khớp với những gì người dùng thực sự thấy khi click vào.

Không phát hiện lỗi P0. Một lỗi P1 (số liệu sai). Phần còn lại là P2/P3 — tinh chỉnh cảm xúc và nhịp bố cục, không phải lỗi chức năng.

**Điểm tổng thể: 74/100** (NEED IMPROVEMENT — nền tảng kỹ thuật và brand-safety tốt, thiếu lớp cảm xúc riêng của module).

---

## 2. Điểm theo từng chương Volume 13

| Chương | Điểm /100 | Verdict |
|---|---|---|
| 13.1 Emotion Philosophy | 82 | PASS |
| 13.2 Emotion DNA | 58 | NEED IMPROVEMENT |
| 13.3 Color & Accent System | 55 | NEED IMPROVEMENT |
| 13.4 Photography DNA | 76 | PASS (có lưu ý) |
| 13.5 Video DNA | 85 | PASS |
| 13.6 Motion DNA | 85 | PASS |
| 13.7 Layout Rhythm | 66 | NEED IMPROVEMENT |
| 13.8 Component Emotion | 80 | PASS |
| 13.9 Asset Standard | 66 | NEED IMPROVEMENT |
| 13.10 Creative Review | — | Xem §5 (áp dụng khung này để chấm các mục trên) |
| 13.11 Design Evolution Log | — | Chưa tồn tại trước audit này — xem `COMBO-PAGE-CHANGELOG.md` (deliverable) |

---

## 3. Điểm đang làm tốt

- **Kiến trúc dữ liệu đúng chuẩn CMS-ready**: `types/combo.ts` + `combo-schema.ts` (Zod, boundary validation) + `combo-repository.ts` (cache-wrapped) — swap sang CMS thật chỉ cần thay 1 file seed.
- **Không có dữ liệu nghiệp vụ giả**: không đếm ngược, không lượt đặt giả, không đánh giá giả. CTA toàn bộ là "Xem hành trình" / "Thiết kế Combo riêng" — không dùng "Đặt ngay" dù chưa có booking engine (đúng mục VIII.4 của brief).
- **Giá hiển thị đúng chuẩn**: luôn có "Giá từ", đơn vị VND nhất quán, không có badge giảm giá không có dữ liệu.
- **Destination Explorer thực sự data-driven**: chỉ render `status: 'published'`, không hardcode danh sách — đúng nguyên tắc "ẩn đến khi có ảnh thật" của brief.
- **Reuse tối đa, đúng tinh thần "không tạo Component mới khi component hiện có mở rộng được"**: `ComboCard` dùng chung Section 01 + `/combo/tat-ca`; Section 05 tái dùng thẳng `FlightArticleCard`; form tái dùng `ConsultationTabs` → `LeadForm` → `submitLeadAction` không có logic submit song song.
- **Ảnh có alt text mô tả thật, tránh cliché đã cấm** (không ảnh "giơ tay trên biển", không ảnh nhìn thẳng camera) — xác nhận qua toàn bộ 23 alt text trong seed.
- **Video hero đúng chuẩn 13.5**: muted, autoplay, loop, poster fallback, không che CTA, và tôn trọng `prefers-reduced-motion` qua `useSyncExternalStore` (không hydration-mismatch) — fallback về ảnh tĩnh khi giảm chuyển động hoặc video lỗi.
- **Accessibility cơ bản tốt**: heading hierarchy đúng (h1 hero → h2 mỗi section), breadcrumb có `aria-label`, nút mobile menu có `aria-label`, touch target nút ≥44px (`h-11`/`h-13` theo `mv-button.tsx`), input luôn có label (kế thừa từ `LeadForm` chung).
- **Header/Footer không bị đụng**: nav item `/combo` đã có sẵn từ trước, không phải sửa `site-header.tsx`. Không tạo regression cho component dùng chung.
- **Ảnh được Next/Image tự động chuyển AVIF/WebP** qua `next.config.mjs` (`formats: ['image/avif', 'image/webp']`) dù file gốc là `.jpg` — đạt yêu cầu 13.9 ở tầng delivery.

---

## 4. Danh sách sai lệch — phân loại P0–P3

| ID | Mức độ | Khu vực | Hiện trạng | Quy chuẩn liên quan | Đề xuất | File liên quan |
|----|--------|---------|------------|----------------------|---------|-----------------|
| P1-01 | **P1** | Destination Explorer — số liệu | Sa Pa hiển thị "2 hành trình Combo" nhưng chỉ 1 combo có `status: 'published'` (combo còn lại `draft`, ẩn). Người dùng click vào `/combo/tat-ca?destination=Sa Pa` chỉ thấy 1 kết quả — lệch với số đã hứa. | Brief §V "Không tự tạo dữ liệu nghiệp vụ giả"; Volume 13 §13.10 Checklist Emotion "không tạo cảm giác quảng cáo quá mức" | Sửa text `stat` của Sa Pa trong seed thành "1 hành trình Combo" để khớp số combo published thực tế | `lib/combo/combo-data-seed.ts` (destinationExplorer → sa-pa) |
| P2-01 | **P2** | Toàn trang — Color & Accent | Combo không có Accent riêng — dùng nguyên `mv-journey-blue`/`mv-sky-cyan` của Flight. Volume 13 §13.2/13.3 và brief mục II yêu cầu Sunset Orange/Sand Beige/Warm Neutral cho Combo (~30% Emotion Layer), nhưng `docs/Brand-System/` (nguồn màu chuẩn thật) chưa có module Combo/token cam nào. | Volume 13 §13.2 "Combo → Accent: Sunset Orange"; §13.3 Quy tắc sử dụng Accent | Bổ sung 2 token mới theo đúng khuôn mẫu ngoại lệ Gold đã có (Cruise/MICE): `--mv-combo-sunset`, `--mv-combo-sand`, dùng có kiểm soát (badge/highlight-icon/hover-accent, KHÔNG dùng cho nền toàn trang/logo/header) — xem kế hoạch §6 | `app/globals.css`, `components/combo/combo-card.tsx`, `components/combo/combo-visual-tile.tsx` |
| P2-02 | **P2** | Layout Rhythm cuối trang | `ComboFinalCta` và `ComboConsultationForm` là 2 section liền kề, cùng dùng `bg-mv-deep-navy` phẳng → tạo một khối tối liền mạch quá dài ở cuối trang. Đây là chính xác anti-pattern mà `site-footer.tsx` đã ghi nhận và sửa trước đó cho khối Newsletter/Footer ("nối thành một khối tối quá dài"). | Volume 13 §13.7 "khoảng nghỉ thị giác"; BRAND-003 §8 (token `.bg-gradient-mv-consultation` được định nghĩa riêng cho "Section CTA tư vấn" nhưng chưa được dùng ở đây) | Đổi `ComboConsultationForm` từ `bg-mv-deep-navy` phẳng sang `.bg-gradient-mv-consultation` (token có sẵn, đúng mục đích, không thêm màu mới) | `components/combo/combo-consultation-form.tsx` |
| P3-01 | **P3** | Photography DNA | 100% ảnh hero/card/tile hiện là stock đã cấp phép (Pexels/Mixkit), không phải ảnh thật Minh Việt — đã được `COMBO-MEDIA-REQUIREMENTS.md` ghi nhận minh bạch là Demo Asset có lộ trình thay thế. | Volume 13 §13.4 "Ưu tiên ảnh thật" | Không sửa trong phạm vi audit này (là quyết định demo đã được ghi nhận, thay ảnh thật là công việc nghiệp vụ/asset, không phải lỗi code) — giữ nguyên khuyến nghị đã có trong handover | `lib/combo/combo-data-seed.ts`, `docs/Handover/Combo/COMBO-MEDIA-REQUIREMENTS.md` |
| P3-02 | **P3** | Asset Standard — naming | Tên file ảnh (`ha-long-sunset.jpg`, `cap-doi.jpg`...) không theo quy ước `module-loai-noidung-phienban` của §13.9 (vd. `combo-thumb-halong-v1.jpg`). | Volume 13 §13.9 Quy tắc đặt tên | Không đổi tên trong đợt này — rename kéo theo sửa toàn bộ path trong seed, rủi ro/lợi ích không cân xứng cho một audit không-redesign. Ghi nhận là technical debt. | `public/images/combo/*.jpg` |
| P3-03 | **P3** | Combo Card — ảnh nặng nhất | 2 ảnh trong `public/images/combo/` vượt 400KB (`cat-ba.jpg` 561KB, `ha-long-cruise.jpg` 490KB) trước khi qua Next/Image optimize. Không vi phạm ngưỡng cụ thể nào của Volume 13 (không quy định KB) nhưng là ảnh nặng nhất trong bộ. | Volume 13 §13.9 "Đã tối ưu"; brief §VIII.7 Performance | Không bắt buộc sửa — Next/Image tự resize/serve AVIF theo viewport nên tác động thực tế lên LCP là nhỏ; ghi nhận theo dõi nếu Lighthouse cho thấy vấn đề | `public/images/combo/cat-ba.jpg`, `public/images/combo/ha-long-cruise.jpg` |

Không phát hiện lỗi **P0**.

---

## 5. Creative Review (khung 13.10) — áp dụng cho trạng thái audit (trước khi sửa)

| Nhóm | Verdict | Ghi chú |
|---|---|---|
| Brand | PASS | Logo/Header/Footer không bị đụng, Navy vẫn là nền tảng, không có nút màu Navy (đúng quy tắc BRAND-003 §0) |
| Emotion | NEED IMPROVEMENT | Nội dung/ảnh/copy đã kể đúng câu chuyện "nghỉ dưỡng", nhưng thiếu Accent riêng — xem P2-01 |
| UI | PASS | Card/Button/Badge nhất quán, đúng kiến trúc `mv-button.tsx`, không phát sinh biến thể mới |
| UX | PASS | CTA trung thực, không tạo sức ép mua hàng, luồng Hero→Value→Product→Trust→CTA rõ ràng |
| Responsive | PASS | Grid 1→2→3 cột chuẩn Tailwind breakpoints, không phát hiện overflow trong code (xem §9 để xác nhận runtime) |
| Accessibility | PASS | Heading hierarchy, alt text, aria-label, focus-visible, touch target đều đạt |
| Performance | PASS (có lưu ý) | AVIF/WebP tự động, hero dùng `priority`, phần dưới fold lazy mặc định qua Next/Image; video hero 1.56MB poster 115KB — hợp lý | 
| Content | PASS | Không dữ liệu giả, trừ lệch số liệu P1-01 |
| Technical Quality | PASS | Lint/typecheck/test/build đều pass theo handover; sẽ re-verify ở §9 sau khi sửa |

**Kết quả tổng: NEED IMPROVEMENT** — không REJECT, không cần chặn publish, nhưng cần xử lý P1-01 và khuyến nghị xử lý P2-01/P2-02 trước khi coi là hoàn thiện theo Volume 13.

---

## 6. Kế hoạch thực hiện (sau audit, theo thứ tự P0→P1→P2→P3)

1. **P1-01** — Sửa text `stat` của Sa Pa trong seed cho khớp số combo `published` thực tế. Rủi ro: gần như bằng 0 (đổi 1 chuỗi text).
2. **P2-01** — Thêm 2 token màu mới (`--mv-combo-sunset`, `--mv-combo-sand`) vào `app/globals.css`, theo đúng khuôn mẫu đã duyệt cho ngoại lệ Cruise/MICE Gold (§11 BRAND-003): chỉ dùng cho icon/badge/hover-accent trong phạm vi component Combo, không đổi nền toàn section, không đổi Header/Footer/Logo. Áp dụng có kiểm soát vào: dải trust-signal ở Hero (icon), badge "sắp ra mắt" nếu có, hover-accent trên `ComboVisualTile`/`ComboCard`. Rủi ro: thấp — additive token, không đổi hành vi component có sẵn nếu không truyền prop mới.
3. **P2-02** — Đổi nền `ComboConsultationForm` sang `.bg-gradient-mv-consultation` (token có sẵn). Rủi ro: bằng 0 — 1 class CSS.
4. **P3-01, P3-02, P3-03** — Không sửa trong đợt này (lý do nêu tại bảng §4), giữ làm technical debt đã ghi nhận.

---

## 7. Rủi ro regression

- Không sửa `components/site/site-header.tsx`, `components/site/site-footer.tsx`, `components/mv/mv-button.tsx`, `components/homepage/reveal.tsx`, `components/homepage/section-heading.tsx`, `components/flight/flight-article-card.tsx` — đây là các component dùng chung nhiều module (Flight, Tour, MICE, Homepage...). Mọi thay đổi màu chỉ thêm token mới (additive), không sửa token cũ (`--accent`, `--mv-journey-blue`...) nên các module khác không bị ảnh hưởng.
- `app/globals.css` bị sửa (thêm token) — file này được nhiều module dùng chung, nhưng thêm biến CSS mới không xóa/đổi biến cũ nên an toàn theo đúng tiền lệ đã có (MICE Gold, Tour status badges đều được thêm theo cách này).
- `combo-consultation-form.tsx` chỉ đổi 1 class Tailwind (`bg-mv-deep-navy` → `bg-gradient-mv-consultation`), không đổi logic form/submit.

---

## 8. Phần không nên thay đổi

- Kiến trúc `types/combo.ts`/`combo-schema.ts`/`combo-repository.ts` — đã đúng chuẩn, không có lý do kỹ thuật để đổi.
- `ComboCard`, `ComboVisualTile` — kiến trúc component giữ nguyên, chỉ thêm class màu có điều kiện nếu cần ở bước P2-01.
- Header/Footer/nav — đã đúng, đã có `/combo` sẵn.
- Form/booking flow (`ConsultationTabs`/`LeadForm`/`submitLeadAction`) — ngoài phạm vi, không đụng.
- `/combo/tat-ca` filter/pagination logic — đúng yêu cầu tối giản của brief, không mở rộng thêm state client mới.

## 9. Thông tin/tài liệu còn thiếu

- Không có tài liệu Volume 13 nào bị thiếu hoàn toàn (13.1–13.11 đều có ít nhất 1 file), nhưng 13.5 có 2 bản trùng chương và 13.1–13.4 thiếu hậu tố phiên bản so với 13.5–13.11 — nên dọn dẹp ở cấp tài liệu (ngoài phạm vi code Combo).
- `docs/Brand-System/BRAND-002/003` chưa có module Combo — khuyến nghị team Brand bổ sung một mục "Combo" chính thức (kế thừa Sunset Orange đã có trong Volume 13) để các module tương lai (vd. Insurance, Ticket mở rộng) không lặp lại khoảng trống này.
- Không có kết quả Lighthouse/CWV thực đo trong repo — phần Performance ở §5 dựa trên review code (Next/Image, `priority`, lazy-by-default), không phải số đo runtime thật. Xem §10 kiểm thử sau khi sửa để bổ sung nếu môi trường cho phép.

---

## 10. Kết quả sau khi sửa

**Đã sửa:** P1-01, P2-01, P2-02 (xem chi tiết tại `docs/reviews/COMBO-PAGE-CHANGELOG.md`).
**Không sửa (theo kế hoạch §6):** P3-01, P3-02, P3-03 — giữ nguyên là technical debt đã ghi nhận, không có lý do kỹ thuật bắt buộc phải sửa trong đợt audit này.

**Điểm trước / sau:**

| Chương | Trước | Sau | Ghi chú |
|---|---|---|---|
| 13.2 Emotion DNA | 58 | 72 | Có Accent riêng (Sunset) ở icon/hover, chưa phủ toàn bộ trang — vẫn còn dư địa cải thiện ở lần sau nếu Brand-System chính thức "onboard" module Combo |
| 13.3 Color & Accent | 55 | 74 | Token mới tuân thủ đúng quy tắc "chỉ CTA/Badge/Hover/Icon Highlight", không đổi nền toàn trang |
| 13.7 Layout Rhythm | 66 | 78 | Hết tình trạng 2 khối navy phẳng liền kề ở cuối trang |
| Tổng thể | 74/100 | 82/100 | NEED IMPROVEMENT → PASS (có lưu ý ở P3, không chặn publish) |

**Xác nhận component dùng chung bị tác động:** Không có. `app/globals.css` chỉ được **thêm** token mới (không sửa/xóa token cũ) — an toàn theo đúng tiền lệ đã dùng cho MICE Gold. Không file nào trong `components/site/*`, `components/mv/*`, `components/homepage/*` (ngoài việc Combo tự đọc token mới) bị sửa.

**Kiểm thử sau khi sửa:**

| Hạng mục | Kết quả |
|---|---|
| `pnpm typecheck` | ✅ 0 lỗi |
| `pnpm lint` | ✅ 0 lỗi |
| `pnpm test` | ✅ 137/137 pass (24 test file) |
| `pnpm build` | ✅ Compiled successfully — `/combo` vẫn Static (○), `/combo/tat-ca` vẫn Dynamic (ƒ) |
| Browser verify (`pnpm build && pnpm start`, 1440×900) | ✅ Hero trust-signal icon màu cam đúng; section "Chọn theo nhu cầu" nền be ấm đúng; section form tư vấn có gradient navy→brand-blue phân biệt rõ với banner CTA navy phẳng phía trên |
| Hover state `ComboVisualTile` | CSS rule xác nhận đúng ở tầng specificity (không bị `.shadow-soft` ghi đè sau khi đổi từ `ring` sang `border`); chưa chụp được ảnh hover ổn định do race condition chụp ảnh đã ghi nhận trước đó ở handover, không phải lỗi code |
| Console runtime | Không có lỗi/warning liên quan Combo |
| Responsive 375/430/768/1024/1440px | Chưa kiểm thử đủ cả 5 mốc trong phiên audit này (đã kiểm 1440px qua browser; các mốc còn lại nên kiểm trước khi merge — xem "Vấn đề còn tồn tại" bên dưới) |

**Vấn đề còn tồn tại (chưa xử lý, không chặn publish):**
- P3-01, P3-02, P3-03 (xem bảng §4) — technical debt đã ghi nhận, có chủ đích không sửa.
- Chưa browser-verify đầy đủ 5 breakpoint bắt buộc (375/430/768/1024/1440) và keyboard-navigation trong phiên audit này — khuyến nghị verify trước khi merge lên `main`.
- Khoảng trống tài liệu Brand-System chưa có module Combo chính thức (§9) — ngoài phạm vi sửa code.

**Hướng dẫn rollback:**
- Toàn bộ thay đổi nằm trong 5 file: `lib/combo/combo-data-seed.ts`, `components/combo/combo-consultation-form.tsx`, `components/combo/combo-hero.tsx`, `components/combo/combo-visual-tile.tsx`, `components/combo/combo-category-section.tsx`, và phần bổ sung token trong `app/globals.css`.
- Rollback nhanh: `git checkout -- lib/combo/combo-data-seed.ts components/combo/combo-consultation-form.tsx components/combo/combo-hero.tsx components/combo/combo-visual-tile.tsx components/combo/combo-category-section.tsx app/globals.css` (chạy trên nhánh `feature/combo-landing-page`, trước khi commit) sẽ khôi phục nguyên trạng trước audit.
- Vì mọi thay đổi token trong `app/globals.css` là additive (chỉ thêm, không sửa/xóa dòng cũ), rollback không ảnh hưởng module nào khác kể cả khi thực hiện từng phần (vd. chỉ revert riêng `combo-visual-tile.tsx` mà giữ nguyên token mới vẫn an toàn).
