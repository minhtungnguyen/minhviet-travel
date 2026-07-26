# HOMEPAGE UI AUDIT — Pre Go-Live

**Scope:** Homepage only (`app/page.tsx` and its 8 sections + shared header/footer/mobile CTA).
**Excluded:** Tour Detail, listing pages, CMS, backend, database, CRM, booking, AI import, auth.
**Method:** Playwright against a local `next dev` build (Turbopack) at 4 breakpoints, full-page + per-section screenshots, plus direct source review of every homepage section component. This is an **audit pass** — no redesign, no IA changes, no new dependencies.
**Screenshots:** `artifacts/ui-audit/` (index in §17).

---

## 1. Executive Summary

The homepage is well past "template" — it has a real design system (Blue Horizon color tokens, `container-mv`/`section-py-*` spacing tokens, a shared `Reveal` motion primitive, a shared `Button`/`MVButton` component), a disciplined MICE-first narrative, and components (tour cards, consultation tabs) that are genuinely well-built: equal-height cards, `keepMounted` tab panels so users don't lose typed data, `prefers-reduced-motion` respected in the hero video.

The one **structural Safe Area bug** this task was originally scoped around — the MICE hero's badge/CTA being clipped by a fixed-height, absolutely-centered content block — was **already fixed in a prior session** (commit `739c765`, verified again in this audit: safe-area gaps now measure 32–40px top / 48–64px bottom at all 4 breakpoints, screenshots in §17). It is not re-litigated here beyond confirming it holds.

What this pass surfaced instead: the homepage does **not yet have a shared Content Safe Area token system** — every section still hand-rolls its own padding via Tailwind utilities (`py-16 lg:py-20`, `p-8 sm:p-12 lg:p-16`, etc.), which is exactly how the MICE bug happened in the first place and is why a similar bug could recur in any new section. There's also one real, unambiguous **P0 accessibility failure**: the main nav's mega menu only opens on `onMouseEnter` — a keyboard-only user cannot reach a single mega-menu link. It does not meet this task's "small scope, low risk" bar for an auto-fix, so it is reported, not patched.

## 2. Tổng điểm

**81 / 100 — NEAR READY**

(See §5 for why this is graded on the score band but flagged as blocked from a hard "lock" until the P0 in §5 is scheduled.)

## 3. Điểm từng nhóm A–J

| Nhóm | Tên | Điểm /100 | Ghi chú 1 dòng |
|---|---|---|---|
| A | Information Architecture & Brand Positioning | 86 | MICE rõ ràng là thế mạnh; tour thiết kế vs tour có sẵn tách bạch; nav hơi nhiều mục |
| B | Header & Navigation | 62 | Mega menu không dùng được bằng bàn phím (P0); 11 mục nav |
| C | Hero | 90 | An toàn, đọc tốt trên video, CTA phân cấp rõ, tôn trọng reduced-motion |
| D | Color System | 88 | Blue Horizon dùng có hệ thống; Gold/Red không bị lạm dụng |
| E | Typography | 84 | Phân cấp rõ, line-clamp chống vỡ chữ; vài eyebrow label hơi nhỏ |
| F | Spacing, Safe Area & Alignment | 72 | MICE hero đã sửa; nhưng CHƯA có token Safe Area dùng chung |
| G | Components & Cards | 87 | Tour card cùng chiều cao, radius/shadow nhất quán |
| H | Forms & Conversion | 90 | Tabs có a11y thật (Base UI), giữ dữ liệu khi đổi tab |
| I | Travel Inspiration Hub & Content | 85 | Cấu trúc đúng brief, ảnh thật, CTA thẳng hàng |
| J | Motion, Accessibility, Performance, SEO UI | 70 | 3 video autoplay preload cùng lúc; mega menu lặp lại lỗi bàn phím |

**Trung bình: 81.4 → làm tròn 81/100**

## 4. Điểm từng section

| Section | Điểm /100 | Vấn đề chính |
|---|---|---|
| Utility bar + Header | 65 | Mega menu keyboard-inaccessible (P0); 11 nav items |
| Hero | 90 | Không có lỗi đáng kể |
| Trust Strip | 88 | Sạch, có citation cho mọi stat |
| Core Services | 86 | Rõ ràng, 2 cụm đúng mô hình kinh doanh |
| MICE Section (Enterprise MICE) | 88 | Safe area đã sửa (commit `739c765`); ảnh dùng `sizes="100vw"` sai thực tế render (P1) |
| Featured Journeys / Tour Cards | 87 | Card đều, filter có `aria-pressed` |
| Destinations Rail | 82 | Carousel không kiểm tra sâu điều khiển bàn phím trong audit này |
| Brand Center | 85 | Layout đúng theo dữ liệu (1 featured + 1 story) |
| Consultation + Inspiration Hub | 89 | Form + Hub cân bằng, tab có a11y thật |
| Newsletter band | 80 | Tách lớp màu hợp lý, chưa kiểm tra validation state |
| Footer | 78 | Social icon là `href="#"` placeholder (P1) |

## 5. P0 — Blocking Go-Live

| # | Vấn đề | Bằng chứng | Đã sửa? |
|---|---|---|---|
| P0-1 | **Mega menu không thể điều hướng bằng bàn phím.** `components/site/site-header.tsx:139-148` mở submenu chỉ qua `onMouseEnter`/`onMouseLeave`; menu con (`{openMenu && megaMenu[openMenu] && (...)}`) chỉ được render vào DOM khi `openMenu` khác `null`. Người dùng dùng Tab/bàn phím không có cách nào set `openMenu`, nên toàn bộ link cấp 2 dưới Tour / Sự kiện & MICE / Dịch vụ **không thể tiếp cận được** bằng bàn phím — vi phạm WCAG 2.1.1 (Keyboard). | Đọc mã trực tiếp, không cần screenshot | **Chưa sửa** — fix đòi hỏi thêm `onFocus`/`onBlur`, `aria-expanded`, `aria-haspopup` và xử lý đóng-khi-blur, không phải thay đổi nhỏ/an toàn theo tiêu chí của task này. Đề xuất: item riêng, cần review UX trước khi code. |

Không có P0 nào khác đủ điều kiện "rõ ràng, phạm vi nhỏ, ít rủi ro" để tự sửa trong đợt audit này → **không sửa code, không commit**, theo đúng quy tắc phần VII của task.

## 6. P1

| # | Vấn đề | Vị trí |
|---|---|---|
| P1-1 | Không có Content Safe Area token system dùng chung — mỗi section tự khai `py-*`/`p-*` riêng lẻ. Đây là nguyên nhân gốc của bug MICE hero đã sửa; rủi ro tái diễn ở section mới. | Toàn Homepage — không có token `content-safe-top/bottom/horizontal` trong `app/globals.css` hay Tailwind config |
| P1-2 | Hero phát 3 video autoplay + `preload="auto"` đồng thời liên tục (crossfade qua opacity), kể cả khi chỉ 1 video hiển thị — nặng cho data/battery di động. | `components/homepage/hero-video-rotator.tsx:91-113` |
| P1-3 | Ảnh MICE hero dùng `sizes="100vw"` nhưng không render full viewport width → tải ảnh nặng hơn cần thiết (cảnh báo trực tiếp từ Next.js dev console). | `sections/enterprise-mice-section.tsx`, console warning xác nhận |
| P1-4 | Social icon ở Footer đều là `href="#"` (chưa có link thật) — trông như liên kết chết. | `components/site/site-footer.tsx:80-88` |
| P1-5 | Nav chính có 11 mục cấp 1 — dễ chật ở laptop 1280px, có cảm giác OTA-menu hơn là brand cao cấp. | `components/site/site-header.tsx:22-34` |
| P1-6 | Logo `next/image` bị Next.js cảnh báo "width/height modified but not the other" — rủi ro méo tỉ lệ khi `height` đổi theo `scrolled` state. | `components/mv/logo.tsx`, console warning xác nhận |

## 7. P2

- Logo image bị preload nhưng không dùng trong vài giây đầu (console warning, ảnh hưởng không đáng kể).
- Vài eyebrow label (`text-[9.5px]`/`text-[10px]`) ở utility bar khá nhỏ, nên theo dõi ở màn hình mật độ điểm ảnh thấp.
- Reveal-on-scroll (`once: true`, IntersectionObserver qua Framer Motion) hoạt động đúng với thao tác cuộn thật của người dùng; **không phải bug** — chỉ là lưu ý cho QA tự động: nhảy scroll tức thời (`scrollTo` lập trình) không luôn kích hoạt observer giống thao tác cuộn thật, cần script QA cuộn từng bước có độ trễ.

## 8. KEEP — đang làm tốt

- **MICE Hero safe area** (đã sửa ở commit `739c765`): container giờ tăng chiều cao theo nội dung thay vì cắt qua `overflow-hidden`; badge/CTA có khoảng cách 32–40px / 48–64px ổn định ở mọi breakpoint.
- **Hero chính**: mẫu safe-area đúng ngay từ đầu — `flex flex-col justify-center` trong luồng bình thường, không dùng pattern "ảnh quyết định chiều cao, nội dung overlay tuyệt đối" gây lỗi.
- **`prefers-reduced-motion`**: tôn trọng thật (server default = ảnh tĩnh, `useSyncExternalStore` theo `matchMedia`), video tự pause khi tab ẩn (`visibilitychange`).
- **Tour card**: chiều cao đều nhờ `flex flex-col` + `flex-1`, CTA neo đáy qua `border-t pt-4`, `line-clamp-2` chống vỡ tiêu đề, badge availability có logic thật (không phải trang trí).
- **Consultation Tabs**: dùng Base UI thật (role/aria-selected/aria-controls tự động, điều hướng mũi tên + Enter/Space), `keepMounted` giữ dữ liệu đã nhập khi đổi tab — đúng yêu cầu brief, không phải tab giả.
- **Color discipline**: Gold chỉ xuất hiện ở MICE/rating, Red chỉ ở nav "Ưu đãi" — không bị lạm dụng như OTA thường thấy.

## 9. REMOVE — nên bỏ

- Không phát hiện section hoặc khối nội dung nào nên loại bỏ hoàn toàn trong phạm vi audit này. `href="#"` ở social icons nên được thay bằng link thật hoặc ẩn tạm, không phải xoá cấu trúc.

## 10. FIX — phải sửa (không tự động sửa trong đợt này)

1. Thêm hỗ trợ bàn phím cho mega menu (P0-1) — cần thiết kế lại tương tác (`onFocus`/`onBlur` theo từng item, `aria-expanded`, đóng khi `Escape`/blur ra ngoài).
2. Thiết lập Content Safe Area token system dùng chung (P1-1) — đúng mục tiêu ban đầu của nhiệm vụ Safe Area (đang được xử lý song song ở một phiên khác của dự án).
3. Giảm tải video Hero (P1-2): cân nhắc chỉ autoplay video đang active, `preload="none"`/`"metadata"` cho 2 video còn lại, hoặc dùng `IntersectionObserver` để chỉ decode khi hero trong viewport.
4. Sửa `sizes` cho ảnh MICE hero theo chiều rộng thực render (P1-3).
5. Gắn link thật hoặc `aria-disabled` rõ ràng cho social icon Footer (P1-4).
6. Rà soát lại số lượng mục nav chính, cân nhắc gộp nhóm (P1-5) — cần quyết định IA, ngoài phạm vi "sửa nhỏ".

## 11. Motion recommendations

- Giữ nguyên `Reveal`/`useReducedMotionSafe` — đây là pattern đúng, áp dụng nhất quán cho mọi section mới.
- Hero video: chuyển sang chỉ giữ 1 video "nóng" (đang phát) + poster tĩnh cho 2 video còn lại cho đến ngay trước khi chúng active, thay vì cả 3 cùng `autoplay` + `preload="auto"` vĩnh viễn.
- Không phát hiện motion nào quá tay/giật cục trong review mã; animation dùng `duration-mv-*`/easing token nhất quán.

## 12. Color recommendations

- Hệ Blue Horizon (`mv-journey-blue`, `mv-sky-cyan`, `mv-deep-navy`, `mv-mist-blue`, `mv-ice-blue`) được dùng nhất quán qua token, không có section nào lệch hệ.
- Không phát hiện mảng "pure black" — `bg-deep`/`bg-mv-deep-navy` là navy có chủ đích, đúng brief "gradient nhẹ, không pure black".
- Gold reserved cho MICE + rating sao — đúng vai trò accent cao cấp, không lạm dụng.
- Red chỉ gắn với "Ưu đãi" — đúng vai trò trạng thái đặc biệt, không rò rỉ sang nơi khác.

## 13. Mobile issues

- Không phát hiện lỗi vỡ layout ở 390×844 qua review full-page screenshot và source (mọi section dùng `container-mv` + breakpoint chuẩn `sm:`/`lg:`).
- Mobile menu (drawer) hoạt động tốt, đóng/mở rõ ràng, có hotline + đăng nhập/đăng ký ở đáy (ảnh `mobile-menu.png`).
- Mobile form (Consultation) hiển thị đầy đủ, input đủ lớn để chạm (ảnh `mobile-form.png`).
- Carousel Destinations dùng `snap-x`/`overflow-x-auto` cục bộ trong section — không gây horizontal overflow ở cấp trang (đã kiểm chứng bằng script quét toàn bộ DOM, `document.documentElement.scrollWidth` không vượt viewport).

## 14. Accessibility issues

- **P0**: Mega menu không thể điều hướng bằng bàn phím (chi tiết §5).
- Filter tabs ở Featured Journeys có `aria-pressed` đúng chuẩn.
- Consultation Tabs dùng Base UI — role/aria-selected/aria-controls đầy đủ, điều hướng bàn phím hoạt động.
- Form liên hệ (`components/site/contact-form.tsx`) có `role="alert"` cho lỗi, `aria-invalid` theo field — đúng pattern.
- Social icon Footer có `aria-label` dù `href="#"` — label đúng nhưng đích đến chưa thật (P1-4).
- Ảnh review được đều có `alt` mô tả thật (không rỗng, không tên file) — hero video, tour card, brand center.

## 15. Performance issues

- 3 video hero autoplay + `preload="auto"` đồng thời (P1-2) — mục lớn nhất.
- Ảnh MICE hero over-fetch do `sizes` sai thực tế (P1-3), xác nhận qua cảnh báo Next.js dev.
- Logo bị preload nhưng chưa dùng trong vài giây đầu (P2, cảnh báo Next.js dev) — ảnh hưởng nhỏ.

## 16. SEO UI issues

- Heading hierarchy đúng thứ tự nhìn thấy được: `<h1>` chỉ ở Hero, `<h2>` cho từng section — không phát hiện heading nhảy cấp trong các file đã review.
- Không phát hiện thẻ `<img>` thiếu `alt` trong các component đã review.
- CTA đều dùng `<Link>`/`<a>` thật (qua `render={<Link .../>}` của `Button`/`MVButton`), không phải `<div onClick>` giả link.

## 17. Screenshots index

Tất cả lưu tại `artifacts/ui-audit/`:

| File | Nội dung |
|---|---|
| `homepage-desktop-full.png` | Toàn trang, 1440×1000 |
| `homepage-laptop-full.png` | Toàn trang, 1280×800 |
| `homepage-tablet-full.png` | Toàn trang, 768×1024 |
| `homepage-mobile-full.png` | Toàn trang, 390×844 |
| `header-desktop.png` | Utility bar + brand row + nav |
| `hero-desktop.png` | Header + Hero + đầu Trust Strip |
| `mice-desktop.png` | MICE Hero (đã fix) + đầu Featured Journeys |
| `tour-cards-desktop.png` | Grid tour card + filter tabs |
| `consultation-desktop.png` | Form tư vấn + Inspiration Hub + Newsletter + đầu Footer |
| `inspiration-desktop.png` | Travel Inspiration Hub (crop từ consultation) |
| `footer-desktop.png` | Footer đầy đủ |
| `mobile-menu.png` | Mobile drawer đang mở |
| `mobile-form.png` | Consultation form trên mobile |

## 18. Kết luận

**NEAR READY** (81/100) theo thang điểm — nhưng có **1 lỗi P0 accessibility chưa được lên lịch sửa** (mega menu không dùng được bằng bàn phím). Theo định nghĩa P0 của chính task này ("lỗi ảnh hưởng trực tiếp Go Live"), khuyến nghị:

> **"Cần thêm một vòng UI trước khi khóa"** — không phải vì điểm số, mà vì còn đúng 1 hạng mục P0 chưa xử lý. Sau khi P0-1 được lên kế hoạch sửa (không cần làm ngay trong phiên này), Homepage đủ điều kiện khóa UI.

---

*Không có thay đổi code nào được thực hiện trong đợt audit này — không có P0 nào đủ điều kiện "phạm vi nhỏ, ít rủi ro" để tự sửa. Không commit.*
