# UI COLOR SYSTEM IMPLEMENTATION — Sprint UI-02
### Homepage Color System, Visual Rhythm & Premium Motion Refinement ("Modern Blue Travel Premium")

**Phạm vi:** Màu sắc, typography colors, section rhythm, card styling, motion nhẹ, responsive styling liên quan — chỉ Homepage + shared chrome (Header/Footer). Không đụng cấu trúc nghiệp vụ, backend, CMS, API, lead handling, route, hay component logic ngoài UI. Information Architecture giữ nguyên 100%.

---

## 1. Color tokens cuối cùng

Thêm vào `app/globals.css` `:root`, đăng ký cộng thêm (additive) vào `@theme inline` dưới namespace `mv-*` — không đổi giá trị của `--primary`/`--accent`/`--foreground`/... hiện có, nên Tour Detail/Booking/CRM/Auth và mọi trang ngoài Homepage không đổi giao diện.

| Token | Hex | Vai trò |
|---|---|---|
| `--mv-deep-navy` | `#071D3A` | Heading, section tối, footer |
| `--mv-brand-blue` | `#2148A5` | Gradient CTA, Consultation |
| `--mv-journey-blue` | `#1677D2` | CTA chính, giá, active state |
| `--mv-sky-cyan` | `#25A9E0` | Eyebrow, label, hover, icon |
| `--mv-mist-blue` | `#EAF4FC` | Nền phụ, badge trust, chip |
| `--mv-ice-blue` | `#F5FAFE` | Nền Trust Strip |
| `--mv-slate-text` | `#465569` | Body/meta text |
| `--mv-warm-white` | `#FCFCFA` | (đăng ký, dự phòng cho surface ấm) |
| `--mv-mice-gold` | `#C89A36` | Chỉ MICE — icon/premium accent |
| `--mv-offer-red` | `#D92D20` | Chỉ "Ưu đãi" / cảnh báo |
| `--mv-border-soft` | `#DCE7F2` | Border/divider nhẹ |
| `--mv-shadow-color` | `rgba(7,29,58,.08)` | (đăng ký tham chiếu — `.shadow-soft` hiện có đã cùng họ màu, không tạo shadow trùng lặp) |

**Đối chiếu logo:** so trực quan với `public/logo-minhviet.png` (mark máy bay/địa cầu + wordmark "MINHVIET", gradient cyan → navy-indigo). Dải màu đề xuất khớp đúng gradient đó — giữ nguyên giá trị gốc trong brief, không chỉnh.

**Motion tokens:** `--motion-fast:160ms` / `--motion-normal:240ms` / `--motion-slow:360ms` / `--ease-mv-standard: cubic-bezier(.2,0,0,1)` — có utility class tương ứng (`duration-mv-fast/normal/slow`, `ease-mv-standard`).

**Gradient utilities (mới, tập trung 1 chỗ thay vì hard-code lặp lại):**
`.bg-gradient-mv-hero`, `.bg-gradient-mv-brand`, `.bg-gradient-mv-consultation`, `.bg-gradient-mv-mice`, `.divider-mv-gradient`.

**Spacing tokens:** `--section-space-lg/md/sm`, `--content-gap-lg/md`, `--card-gap` được khai báo làm tài liệu tham chiếu, **giữ nguyên giá trị hiện có** (`section-py-lg/md/sm` đã tồn tại từ Sprint UI-01) thay vì brief's 72–88px/56–72px — xem lý do ở Mục 11.

## 2. Typography color rules (áp dụng)

- Heading cấp 2 (mọi `<h2>` qua `SectionHeading`, và MICE/Hero riêng): **Deep Navy** trên nền sáng, **White** trên nền tối/ảnh. Không còn `text-foreground` (gần đen `#1a1d21`) trên heading nào thuộc Homepage.
- Eyebrow: **Journey Blue** (`SectionHeading`, Trust Strip, Core Services) hoặc **Sky Cyan** (Hero, MICE badge).
- Body/meta: **Slate** (`text-mv-slate`) — JourneyCard, Trust Strip description, Newsletter, empty-state.
- Giá tour: **Journey Blue** (JourneyCard).
- Accent word trong heading (vd. "**ghép đoàn theo lịch có sẵn**" ở Featured Journeys, "**Việt Nam**" ở Destinations): đổi từ `text-primary` (trùng màu navy với chính heading, gần như vô hình) sang **Journey Blue** — sửa luôn một lỗi tương phản tiềm ẩn có sẵn trước sprint này.
- Link/CTA: Journey Blue mặc định, hover Sky Cyan (Button `variant="journey"` mới, additive — không đổi `variant="accent"`/`default` đang dùng ở nơi khác).

## 3. Section color mapping (đã áp dụng, theo đúng 10 section thật của Homepage)

| Section thật | Trước | Sau |
|---|---|---|
| Header (chrome, toàn site) | Gold ở utility bar (vi phạm) | Navy/Journey Blue; Gold rút về đúng phạm vi MICE |
| Hero | Overlay đen phẳng | `bg-gradient-mv-hero` (navy → Journey Blue tail) |
| Trust Strip | `bg-paper`, số liệu đen | `bg-mv-ice-blue`, số liệu **Brand Blue** |
| Core Services | 2 tile Bespoke cùng 1 màu Navy | Tile A: gradient Brand→Journey Blue; Tile B (MICE): Deep Navy + Gold |
| Enterprise & MICE | Overlay đen phẳng, badge/CTA sky mặc định | `bg-gradient-mv-mice`, badge Cyan + icon Gold, process Cyan, CTA Journey Blue |
| Featured Journeys (Tour Ghép) | Tab/underline đen | Tab active Deep Navy, underline Journey Blue |
| Destinations | `bg-background` (trắng) | `bg-mv-mist-blue`, arrow Ice Blue→Journey Blue hover |
| Brand Center (Trust/Capability) | Heading đen, radius lệch | Heading Deep Navy (qua `SectionHeading`), radius thống nhất |
| Consultation (Final CTA) | `bg-deep` phẳng | `bg-gradient-mv-consultation` (Deep Navy → Brand Blue) |
| Newsletter | Cùng nền tối với Footer | **Tách lớp**: băng riêng `bg-mv-mist-blue`, chữ Deep Navy/Slate |
| Footer | `bg-deep`, đã gần đúng | `bg-mv-deep-navy`; social icon có `aria-label` riêng biệt |

Không còn hai section tối lớn liên tiếp: Consultation (tối) → Newsletter (sáng, băng riêng) → Footer (tối) — đúng tiêu chí nghiệm thu #4.

## 4. Motion rules (áp dụng)

- JourneyCard, DestinationCard, Brand Center story card: bỏ hiệu ứng "nổi" (`hover:-translate-y-1`) quá mạnh trên JourneyCard, thay bằng **border chuyển Sky Cyan + shadow tăng nhẹ**, đúng §8/§9 của brief.
- Ảnh hover scale: chuẩn hóa còn **1.035** (trong khoảng 1.025–1.04 yêu cầu), dùng `duration-mv-slow` (360ms) thay vì giá trị rời rạc `duration-[1200ms]`/`duration-500`.
- Arrow hover translate: tăng từ ~2px lên **4px** (`translate-x-1 -translate-y-1`) đúng "3–4px" yêu cầu (Destination, Brand Center story).
- Tab/filter/label transition: `duration-mv-fast` (160ms).
- Không thêm parallax, không thêm counter re-trigger, không thêm Lottie/glassmorphism — đúng danh sách "Không dùng".

## 5. Danh sách file đã sửa (20 file, không tính docs/ảnh)

```
app/globals.css
components/ui/button.tsx
components/site/site-header.tsx
components/site/site-footer.tsx
sections/hero-section.tsx
sections/trust-strip-section.tsx
sections/core-services-section.tsx
sections/enterprise-mice-section.tsx
sections/featured-journeys-section.tsx
sections/destinations-section.tsx
sections/brand-center-section.tsx
sections/final-cta-section.tsx
components/homepage/verified-stat.tsx
components/homepage/section-heading.tsx
components/homepage/journey-card.tsx
components/homepage/featured-journeys-grid.tsx
components/homepage/destinations-rail.tsx
components/homepage/destination-card.tsx
components/homepage/dual-path-cta.tsx
components/homepage/lead-form.tsx
components/homepage/newsletter-form.tsx
```

**Lưu ý:** working tree có thêm một số file khác đang ở trạng thái "modified"/"deleted" từ trước khi sprint này bắt đầu (`components/site/contact-form.tsx`, `components/site/flash-deals.tsx`, `components/site/tour-card.tsx`, `components/site/why-choose.tsx`, `lib/actions/lead-action.ts`, `lib/site-data.ts`, `package.json`, `pnpm-lock.yaml`, `next-env.d.ts`) — **không đụng tới, không nằm trong commit của sprint này**, vì không phải do task này tạo ra.

## 6. Component sửa — theo vai trò

- **Additive (không phá vỡ nơi khác dùng):** `components/ui/button.tsx` — thêm `variant="journey"`, giữ nguyên `default/outline/accent/gold/...`.
- **Homepage-only (an toàn tuyệt đối):** toàn bộ `sections/*.tsx` và `components/homepage/*.tsx`.
- **Shared chrome (ảnh hưởng toàn site theo đúng chủ đích của brief, vì Header/Footer nằm trong `SiteChrome` bọc mọi trang):** `components/site/site-header.tsx`, `components/site/site-footer.tsx`. Đây là tác động lan toả **có chủ đích** — brief liệt kê rõ "Header"/"Footer" trong phạm vi, và Volume 01 §2.4.7 ("Systemic, not page-by-page") coi đây là hành vi đúng, không phải rò rỉ phạm vi.

## 7. Before/After

Ảnh lưu tại `docs/sprint-ui-02/`:
- `before-desktop-full.png` / `after-desktop-full.png` (1440×900, full page)
- `before-mobile-full.png` / `after-mobile-full.png` (390×844, full page)

Thay đổi thấy rõ nhất: (1) Header hết dải Gold ở utility bar; (2) Hero overlay ngả xanh thay vì đen phẳng; (3) 2 tile Core Services phân biệt màu rõ (xanh gradient vs navy+gold); (4) MICE section ấm hơn nhờ badge cyan + icon gold; (5) Trust Strip/Destinations có nền xanh nhạt xen kẽ thay vì trắng liên tục; (6) khối Consultation→Newsletter→Footer không còn là một mảng tối liền mạch — Newsletter tách thành băng sáng riêng.

## 8. Responsive review

Kiểm tra `document.documentElement.scrollWidth === clientWidth` (không overflow ngang) tại cả 4 mốc, trên dev server thật:

| Viewport | scrollWidth = clientWidth | Ghi chú |
|---|---|---|
| Desktop 1440×900 | ✓ | Ảnh đầy đủ, xem Mục 7 |
| Laptop 1280×800 | ✓ (1265=1265) | Không kiểm tra ảnh đầy đủ, chỉ đo overflow |
| Tablet 768×1024 | ✓ (753=753) | Xác nhận trực quan: MICE process-line Cyan, heading accent Journey Blue đọc rõ |
| Mobile 390×844 | ✓ (375=375) | Ảnh đầy đủ, xem Mục 7; Core Services/MICE xác nhận hiển thị đúng màu qua ảnh cận cảnh riêng |

Không section nào bị crop ảnh hay tràn chữ phát sinh từ thay đổi màu/motion.

## 9. Accessibility review

- Contrast: mọi heading chuyển từ gần-đen sang Deep Navy (đậm hơn, contrast với nền trắng **tăng** chứ không giảm). Body chuyển sang Slate (`#465569` trên trắng) — đạt AA cho text thường.
- Footer: sửa lỗi có sẵn — 3 icon mạng xã hội trước đó dùng chung một `aria-label`, nay có nhãn riêng biệt cho từng nền tảng (Facebook/YouTube/LinkedIn) — screen reader phân biệt được.
- Focus ring: không đổi (`--ring` vẫn Sky-family, đã đúng vai trò từ trước).
- Không phát hiện regression về `prefers-reduced-motion` — không có animation mới nằm ngoài các `transition-colors/transform` đã tôn trọng cơ chế reduced-motion sẵn có của `Reveal`/`VerifiedStat`.
- Chưa sửa (ngoài phạm vi màu sắc): mega menu Header chỉ mở bằng hover, chưa có `onFocus` cho bàn phím — đây là hành vi/component logic, không phải màu sắc, xem Mục 11.

## 10. Performance impact

- Không thêm thư viện mới, không thêm ảnh/video, không đổi `next/image`/lazy-loading.
- Toàn bộ thay đổi là CSS class/token — 0 JS bundle tăng thêm ngoài 1 dòng biến thể CVA (`variant: journey`) trong `button.tsx`.
- `npx next build`: **thành công**, 22/22 route generate, không lỗi. Không có cảnh báo build mới phát sinh từ sprint này.
- Console runtime (dev, sau khi chạy lại server sạch): **0 lỗi mới**, chỉ còn 1 warning tiền tồn tại (`Logo` width/height ratio — không liên quan tới sprint này).

## 11. Các vấn đề còn tồn tại

1. **Bug hiển thị `group-tours`** trong dropdown "Nhu cầu quan tâm" của Consultation form vẫn còn nguyên — đây là lỗi resolve label của `Select.Value` (Base UI), không phải màu sắc, đã ghi nhận từ trước ở `UI_MASTER_REVIEW.md` (P0 #2). Cần một task riêng.
2. **Mật độ nội dung MICE card** (7 khối chữ chồng trên ảnh) không được rút gọn trong sprint này — đúng chỉ thị "không redesign toàn bộ, giữ nguyên Information Architecture". Chỉ màu/overlay/motion được chỉnh.
3. **Mega menu Header** chưa hỗ trợ mở bằng bàn phím (`onFocus`) — nằm ngoài phạm vi "màu sắc/motion nhẹ" của sprint này.
4. Giá trị `--section-space-lg/md/sm` được đăng ký làm tài liệu tham chiếu nhưng **giữ nguyên** pixel hiện có thay vì tăng theo ví dụ minh hoạ 72–88/56–72px trong brief — xem giải thích ở khối comment trong `globals.css` (ưu tiên tiếp nối Sprint UI-01 "Global UI Spacing Optimization" + chỉ thị chính brief này đưa ra: "tránh section nào cũng dùng padding rất lớn"). Nếu người yêu cầu muốn đúng con số minh hoạ, cần xác nhận lại — đây là một lựa chọn có chủ đích, không phải bỏ sót.

## 12. Các hạng mục chưa làm vì ngoài phạm vi

- Không sửa `components/site/tour-card.tsx` (Tour Card dùng ở `/tours`, khác với `journey-card.tsx` của Homepage) — đúng chỉ dẫn "chỉ Tour Card Homepage".
- Không sửa Badge component (`components/ui/badge.tsx`) — dùng chung toàn site, các variant hiện có (success/warning/info/accent/gold/neutral) không nằm trong danh sách vi phạm cụ thể của brief.
- Không đụng `--primary`/`--accent`/`--foreground`/`--muted-foreground`/`--border` toàn cục trong `:root` — đây là token dùng bởi Tour Detail/Booking/CRM/Auth, nằm ngoài phạm vi cho phép.
- Không sửa backend, CMS, lead handling, route, menu architecture — đúng danh sách cấm của brief.
