# Sprint UI-01 — Homepage Redesign (Go-Live Version)

**Ngày:** 2026-07-24
**Phạm vi:** Chỉ Homepage (`/`) và nội dung CMS-seam phục vụ Homepage (`lib/cms/schema.ts`, `lib/cms/content/homepage.seed.ts`, `types/homepage.ts`). Không sửa Tour Detail, CMS backend, Booking, CRM, AI Import, Database, API, Authentication, hoặc token màu/font trong Design DNA.

**Mục tiêu:** Sau khi hoàn thành, khách truy cập trong 5 giây đầu phải hiểu "Minh Việt không chỉ bán tour — Minh Việt thiết kế và tổ chức toàn bộ hành trình."

---

## Đã sửa

### 1. Hero — bỏ Search Box, còn đúng 2 CTA
- **File:** `sections/hero-section.tsx`
- **Trước:** Có `<SmartSearchBar />` (3 tab: Tour đoàn / MICE & Sự kiện / Hỏi AI) ngay dưới Hero; CTA là "Nhận tư vấn giải pháp" + "Thử gợi ý AI".
- **Sau:** Bỏ hẳn `SmartSearchBar` khỏi Hero (file `components/homepage/smart-search-bar.tsx` vẫn giữ nguyên trong repo, không xoá — chỉ không còn được import). 2 CTA đổi thành **"Thiết kế chương trình riêng"** (→ `/contact?intent=corporate`) và **"Khám phá tour có sẵn"** (→ `#tour-ghep-quoc-te`, cuộn tới section Tour ghép quốc tế trên cùng trang).

### 2. AI Advisor — gỡ khỏi Homepage
- **File:** `app/page.tsx`
- **Trước:** `AIAdvisorSection` là section thứ 5/9, có 2 điểm chạm above-the-fold (Hero CTA + tab search bar) dẫn vào.
- **Sau:** Gỡ import + render khỏi `app/page.tsx`. `sections/ai-advisor-section.tsx`, `components/homepage/ai-advisor-form.tsx`, `ai-advisor-result.tsx`, `lib/ai/match-engine.ts` **giữ nguyên trong repo, không xoá** — có thể gắn lại ở nơi khác sau. Đúng nguyên tắc "AI chỉ là công cụ hỗ trợ, không phải thương hiệu".

### 3. "Minh Việt làm gì" — thêm đoạn định vị vào đầu TrustStrip
- **File:** `sections/trust-strip-section.tsx`, `types/homepage.ts`, `lib/cms/schema.ts`, `lib/cms/content/homepage.seed.ts`
- **Thêm:** Field `trustStrip.positioning` (headline + description) render ngay đầu section, trước hàng audience-segment/stat hiện có: "Minh Việt không chỉ bán tour — Minh Việt thiết kế và tổ chức toàn bộ hành trình." + 1 câu mô tả 2 nhóm dịch vụ (thiết kế riêng / phân phối có sẵn). Không tạo section mới — chỉ thêm nội dung vào section đã có, giữ nguyên stat grid (đã có nguồn) và partner logos.

### 4. Core Services — regroup theo đúng 2 nhóm mô hình kinh doanh
- **File:** `sections/core-services-section.tsx`, `types/homepage.ts`, `lib/cms/schema.ts`, `lib/cms/content/homepage.seed.ts`, `components/homepage/icon-map.ts`
- **Trước:** 1 tile lớn (Tour đoàn) + 5 tile nhỏ đồng hạng (MICE, Dịch vụ lẻ, Khách sạn, Du thuyền, Vé máy bay) — không phân biệt "thiết kế riêng" và "có sẵn".
- **Sau:** Shape đổi từ `services: ServiceTile[]` sang `groups: ServiceGroup[]` (2 nhóm, có nhãn). Nhóm **"Thiết kế theo yêu cầu"** (Tour đoàn, MICE & Sự kiện) hiển thị dạng 2 tile lớn ngang hàng; nhóm **"Có sẵn — khám phá ngay"** (Dịch vụ lẻ, Khách sạn, Du thuyền, Vé máy bay, **Vé vui chơi — tile mới**) hiển thị dạng lưới nhỏ như cũ. Icon `ticket` mới thêm vào `SERVICE_ICONS`.

### 5. MICE — thay lưới 4 ô tính năng bằng storytelling + quy trình rút gọn (không phải flowchart)
- **File:** `sections/enterprise-mice-section.tsx`, `types/homepage.ts`, `lib/cms/schema.ts`, `lib/cms/content/homepage.seed.ts`
- **Trước:** Lưới 4 ô "Thiết kế riêng / Vận hành trọn gói / Điều phối 24/7 / Tiêu chuẩn doanh nghiệp" kiểu feature-box.
- **Sau:** Field `differentiators` thay bằng `story` (1 đoạn văn kể ngắn: "Từ tiếp nhận yêu cầu đến nghiệm thu sau sự kiện, một đội điều phối duy nhất đồng hành...") và `process` (mảng 6 nhãn, render thành 1 dòng text phân cách bằng "·": Tiếp nhận yêu cầu · Lên Concept · Thiết kế chương trình · Điều phối · Vận hành · Nghiệm thu) — **không dùng diagram/flowchart component**. Giữ nguyên khung ảnh, badge, `VerifiedStat`, CTA. CTA đổi thành "Yêu cầu thiết kế chương trình" → `/contact?intent=corporate` (gộp về CTA A, trước đó trỏ `/mice`).

### 6. Tour ghép quốc tế — đổi khung + Tour Card thiết kế lại
- **File:** `sections/featured-journeys-section.tsx`, `components/homepage/journey-card.tsx`, `lib/cms/content/homepage.seed.ts`
- Eyebrow/title đổi từ "Hành trình tuyển chọn / Những chuyến đi đáng nhớ" sang khung "Tour ghép quốc tế / Khởi hành định kỳ, ghép đoàn theo lịch có sẵn". Thêm `id="tour-ghep-quoc-te"` để Hero CTA B cuộn tới đúng vị trí. CTA "Xem tất cả tour" → **"Khám phá tour"**.
- **Tour Card** (`journey-card.tsx`, chỉ card dùng trên Homepage — không đụng `components/site/tour-card.tsx` của `/tours`): ảnh lớn hơn (tỷ lệ 16:11 thay vì 4:3), bỏ badge rating nổi kiểu OTA (điểm đánh giá nếu có được đưa vào dòng meta dạng chữ), gộp 2 dòng meta (khởi hành/điểm đi) thành 1 dòng, giảm cỡ chữ giá (không còn là yếu tố lớn nhất — tiêu đề hành trình mới là yếu tố lớn nhất), 1 CTA duy nhất "Khám phá tour". Dữ liệu (`JourneyContent`, badge trạng thái còn chỗ) giữ nguyên — không có rating/giá giả nào được thêm.

### 7. Năng lực — đổi khung BrandCenter
- **File:** `lib/cms/content/homepage.seed.ts`
- Eyebrow đổi từ "Dấu ấn Minh Việt" sang **"Năng lực"**. Giữ nguyên cấu trúc 3 story-tile (case evidence thật, không phải blog).

### 8. Đồng bộ nhãn CTA còn lại
- **File:** `components/homepage/featured-journeys-grid.tsx`
- Nhãn CTA ở trạng thái rỗng-kết-quả đổi từ "Yêu cầu tư vấn" → **"Liên hệ chuyên gia"** (cùng trỏ `#lead-form`).
- **Kết quả:** Toàn bộ CTA điều hướng/chuyển đổi chính trên Homepage giờ quy về đúng 3 nhóm: **Thiết kế chương trình** (Hero, MICE), **Khám phá tour** (Hero, Tour ghép quốc tế), **Liên hệ chuyên gia** (empty-state, section Liên hệ). Các link tiện ích khác (Đăng nhập/Đăng ký ở header, submit Newsletter, gọi điện/Zalo trực tiếp, "Xem hồ sơ năng lực" → `/about`) giữ nguyên vì là hành động khác nhóm (tài khoản/liên hệ trực tiếp/điều hướng thứ cấp), không phải 1 trong 3 CTA chính.

### 9. Sửa lỗi type phát sinh từ đổi shape `coreServices`
- **File:** `sections/final-cta-section.tsx`
- `coreServices.services` (cũ) → `coreServices.groups.flatMap((g) => g.services)` để giữ đúng danh sách `serviceOptions` cho dropdown trong `LeadForm` (section Liên hệ) sau khi đổi shape ở mục 4.

### 10. `.gitignore`
- Thêm `.playwright-mcp/` — thư mục trace/log do Playwright MCP sinh ra trong lúc kiểm thử responsive, không phải mã nguồn dự án.

---

## Không đụng tới (đúng phạm vi)

- `components/site/tour-card.tsx`, `/tours` listing, `app/tour/[slug]` — không nằm trong "Homepage Redesign".
- CMS backend, Booking, CRM, AI Import, Supabase, Authentication.
- Token màu/font/spacing trong `app/globals.css` hay tài liệu Volume 01 Design DNA.
- Không thêm rating/review/số liệu/countdown/flash-sale giả — mọi số liệu mới dùng lại `VerifiedStat`/`verifiedStatSchema` đã có nguồn.
- `sections/destinations-section.tsx` — không nằm trong flow 10 mục nhưng vẫn hợp lý, giữ nguyên không lý do di chuyển/xoá.
- `sections/final-cta-section.tsx` / `lead-form.tsx` — cấu trúc giữ nguyên (đã đúng chuẩn từ trước), chỉ sửa lỗi type ở mục 9. (`dual-path-cta.tsx` sau đó được sửa bởi hotfix riêng — xem mục "Hotfix" bên dưới.)

## Đã xác minh

- `npx tsc --noEmit` → sạch, không lỗi.
- `npx eslint .` → sạch, 0 lỗi/0 cảnh báo.
- `npx next build` → build production thành công, toàn bộ 22 route generate không lỗi.
- Responsive: kiểm tra bằng Playwright ở 4 mốc trên dev server thật (`localhost:3100`) — `document.documentElement.scrollWidth` so với `clientWidth` ở cả 4 mốc đều bằng nhau (không overflow ngang):
  - Desktop 1440×900 → 1440 = 1440 ✓ (`docs/sprint-ui-01/after-desktop.png`)
  - Laptop 1280×800 → 1280 = 1280 ✓ (`docs/sprint-ui-01/after-laptop.png`)
  - Tablet 768×1024 → 768 = 768 ✓ (`docs/sprint-ui-01/after-tablet.png`)
  - Mobile 375×812 → 375 = 375 ✓ (`docs/sprint-ui-01/after-mobile.png`)
  - Kiểm tra trực quan cả 4 ảnh: 2 tile "Thiết kế theo yêu cầu" xếp cạnh nhau từ Tablet trở lên, xuống 1 cột ở Mobile; lưới Tour Card 3→2→1 cột đúng breakpoint; không có chữ tràn/vỡ dòng bất thường.
- Không có console error/warning mới phát sinh từ các thay đổi trong sprint này (có 1 hydration warning tiền tồn tại ở `VerifiedStat`/count-up, không liên quan tới thay đổi của sprint này — xem "Còn tồn đọng").

## Còn tồn đọng

1. `components/site/tour-card.tsx` (dùng ở `/tours`) chưa đồng bộ phong cách Tour Card mới — vẫn còn giá gạch ngang/seat-count kiểu cũ theo `PROJECT_AUDIT.md` §3.2, ngoài phạm vi sprint này.
2. Hydration mismatch tiền tồn tại ở `components/homepage/verified-stat.tsx` (count-up animation render khác giữa server/client) — xuất hiện độc lập với thay đổi của sprint này, cần task riêng.
3. `sections/ai-advisor-section.tsx` và các component liên quan hiện không còn route nào trỏ tới — cần quyết định giữ làm tính năng ở trang khác hay dọn hẳn trong một sprint sau.
4. `/hotels`, `/cruises`, `/tickets` vẫn là `PlaceholderSection` tĩnh — section Core Services trên Homepage trỏ tới các trang này nhưng bản thân trang đích chưa có nội dung/listing thật.

---

## Hotfix — Consultation Form Tabs (2026-07-24)

**Phạm vi:** Chỉ section form tư vấn ở cuối Homepage (`#lead-form`). Không sửa section khác, không đổi backend lead handling/API/database.

### Vấn đề
2 form (Doanh nghiệp/Tổ chức và Khách cá nhân) hiển thị đồng thời cạnh nhau trên desktop (`md:grid md:grid-cols-2`) — tải nhận thức cao, section quá nặng, mất cân đối thị giác.

### Đã sửa
- **File:** `components/homepage/dual-path-cta.tsx`
- Gộp 2 form vào 1 khối duy nhất, chuyển sang segmented tab control (dùng lại `components/ui/tabs.tsx` — primitive `@base-ui/react/tabs` có sẵn, không tạo component mới). Tab mặc định: **Doanh nghiệp / Tổ chức**. Chỉ 1 form render tại một thời điểm — xác nhận bằng DOM: Base UI **unmount hẳn** panel không active (không phải ẩn bằng CSS), nên không có rủi ro submit nhầm form/gộp sai dữ liệu giữa 2 loại khách hàng.
- Bỏ hẳn layout `hidden md:grid` / `md:hidden` (2 nhánh desktop/mobile riêng biệt trước đây) — giờ dùng đúng 1 markup cho mọi breakpoint, cùng container (`max-w-2xl`, cùng nền `bg-card`/`rounded-2xl`/`shadow-soft-lg` kế thừa từ `LeadForm`).
- Thêm `min-h-[560px] sm:min-h-[520px]` cho vùng panel để giảm layout shift khi đổi tab (2 form chỉ lệch 1 field — Đơn vị/Doanh nghiệp — nên chiều cao gần như không đổi).
- **Phát hiện & sửa lỗi tiền tồn tại:** `components/ui/tabs.tsx`'s `TabsTab` style nhắm vào thuộc tính `data-selected`, nhưng Base UI Tabs thực tế set `data-active` (xác nhận bằng cách đọc DOM đã render) — nghĩa là trạng thái active/inactive **chưa từng thực sự áp dụng** kể cả ở bản mobile-only trước đây. Sửa bằng cách nhắm đúng `data-[active]` **trong class truyền qua `className` của `dual-path-cta.tsx`** (không sửa `components/ui/tabs.tsx` — đúng phạm vi "chỉ sửa section form tư vấn"); dùng modifier `!important` cho các thuộc tính màu vì class mặc định của primitive dùng `not-data-[selected]` (luôn đúng, do sai tên thuộc tính) có cùng độ ưu tiên CSS và thứ tự build không ổn định.
- Active tab: nền trắng, chữ navy đậm (`bg-white`/`text-primary`) — tương phản tốt trên nền `bg-deep` của section. Inactive: trong suốt, chữ `paper/70`, dễ đọc nhưng không nổi bật.
- `role="tablist"`/`role="tab"`/`role="tabpanel"`, `aria-selected`, keyboard navigation (mũi tên trái/phải đổi tab + focus theo) đều có sẵn từ primitive Base UI — xác nhận bằng kiểm thử thực tế (xem "Đã kiểm tra" bên dưới), không cần code thêm.

### Đã kiểm tra
- Chuyển tab bằng click: chỉ 1 panel tồn tại trong DOM tại một thời điểm (xác nhận qua `document.querySelectorAll('[data-slot="tabs-panel"]')` → luôn length 1).
- Chuyển tab bằng bàn phím: focus tab đầu, `ArrowRight` → focus + `aria-selected` chuyển đúng sang tab 2.
- Nhập dữ liệu + submit thật trên form Khách cá nhân (Playwright, dev server thật) → nhận đúng trạng thái thành công trung thực có sẵn từ `useLeadForm`: "Đã ghi nhận yêu cầu. Chuyên viên tư vấn Minh Việt sẽ phản hồi trong thời gian sớm nhất." — logic submit/webhook không bị đụng.
- Desktop (1440px), Mobile (375px): không overflow ngang (`scrollWidth === clientWidth` ở cả hai), tab vẫn bấm được và đọc được ở mobile (wrap 2 dòng trong pill, không tràn).
- Console: không phát sinh lỗi mới. Vẫn còn đúng 1 warning hydration tiền tồn tại ở `VerifiedStat` (mục "Còn tồn đọng" #2 ở trên) — không liên quan tới hotfix này.
- `npx tsc --noEmit`, `npx eslint .`, `npx next build` — cả 3 sạch.

### Không đụng tới
`lead-form.tsx`, `use-lead-form.ts`, `lib/actions/lead-action.ts`, mọi section khác của Homepage, `components/ui/tabs.tsx` (bug trong file này được né bằng override cục bộ thay vì sửa trực tiếp, để không vượt phạm vi "chỉ sửa section form tư vấn" — nếu muốn sửa tận gốc cho các chỗ dùng `Tabs` khác trong tương lai, cần một task riêng).

---

## Sprint UI-01.1 — Header & Navigation Refinement (2026-07-24)

**Phạm vi:** Chỉ `components/site/site-header.tsx` (+ 1 component mới cho language switcher). Không sửa Hero, Homepage section, backend, CMS, hay responsive ngoài Header.

### Đã sửa
- **File mới:** `components/site/language-switcher.tsx` — dropdown chọn ngôn ngữ bằng cờ quốc gia (🇻🇳 mặc định, 🇬🇧, 🇨🇳, 🇯🇵, 🇰🇷), có hover + active state (chữ đậm + màu accent + dấu check), đóng khi click ra ngoài hoặc nhấn `Esc`. **Chỉ UI** — chọn ngôn ngữ đổi state cục bộ, chưa đổi route/nội dung; cấu trúc list phẳng có `code` để việc nối i18n thật sau này chỉ cần sửa bên trong component này, không phải nơi gọi nó.
- **File:** `components/site/site-header.tsx` — viết lại thành 3 tầng đúng yêu cầu:
  - **Level 1 (Utility bar):** trái = Hotline 24/7; phải = Về chúng tôi · Tin tức · Tư vấn (đổi tên từ "Liên hệ", giữ nguyên href `/contact`) · `LanguageSwitcher` · Đăng nhập · Đăng ký. Bỏ hành vi ẩn khi cuộn (trước đây `scrolled` làm `h-0 opacity-0`) — nay luôn hiển thị vì đây là nơi duy nhất còn hotline + tài khoản.
  - **Level 2 (Brand):** bỏ hẳn hotline (trước đây có 1 nút gọi persistent ở đây). Logo căn giữa, tăng từ 50px lên 60px (scroll co còn 48px) — xem phần "Quyết định kỹ thuật" bên dưới về lý do không đạt đúng 1.8–2 lần như brief gốc. Thêm dòng Brand Statement dưới logo: "Tour Thiết Kế Trọn Gói" (navy, semibold) · kim cương vàng nhỏ · "MICE" (vàng, bold, đậm hơn — điểm nhấn) · kim cương vàng nhỏ · "Tour Ghép Quốc Tế" (navy, semibold), 2 đường line vàng mảnh 2 bên (ẩn dưới `sm` để tránh chật). Không icon máy bay, không gradient.
  - **Level 3 (Main nav):** đổi "Tour" → "Tour Thiết Kế"; thêm mục mới "Bảo hiểm" (href tạm `/insurance`, trang đích chưa tồn tại — xem "Còn tồn đọng"); "Ưu đãi" tô `text-destructive` (đỏ) — mục duy nhất có màu riêng; "Bảo hiểm" và mọi mục khác dùng chung 1 màu chuẩn (`text-foreground/80 hover:text-accent`), không có màu xanh riêng nào khác biệt.
  - Mobile drawer: thêm `LanguageSwitcher` (trước đây không có ở mobile), áp cùng màu đỏ cho "Ưu đãi" trong danh sách menu mobile.

### Quyết định kỹ thuật: chiều cao Header vs. Hero
- `sections/hero-section.tsx` (không được sửa) dùng `lg:pt-40` (160px) cố định để chừa chỗ cho Header `fixed` — thực đo, headline (`h1`) render tại `y≈200px` (160px padding + dòng eyebrow + `mt-6` phía trên h1), không phải đúng 160px như tính nhẩm ban đầu.
- Logo 1.8–2 lần (90–100px) + thêm dòng Brand Statement không thể vừa trong ngân sách cũ mà không đụng Hero — đã hỏi lại và được chọn phương án: **tăng logo vừa phải (60px, ~1.2 lần) thay vì 1.8–2 lần**, nén padding Level 1/2 để tổng chiều cao Header thực đo còn **173.75px ở Desktop/Laptop** (94–106px ở Tablet/Mobile do Utility bar + Nav ẩn) — headline Hero vẫn hiện đầy đủ, đo được khoảng hở thực tế **~27px**, không đè lên chữ.

### Đã kiểm tra
- Desktop (1440px)/Laptop (1280px): Header 173.75px, không overflow ngang, không đè Hero (khoảng hở 26.75px).
- Tablet (768px): Header 94.33px, logo + brand statement căn giữa, không tràn.
- Mobile (375px): Header 106.33px, brand statement tự xuống 2 dòng gọn gàng, hamburger đúng vị trí, không overflow ngang.
- `npx tsc --noEmit`, `npx eslint .`, `npx next build` — cả 3 sạch.
- Không phát sinh console error mới (vẫn chỉ còn cảnh báo hydration tiền tồn tại ở `VerifiedStat`, không liên quan).

### Không đụng tới
`sections/hero-section.tsx`, mọi Homepage section khác, backend/CMS/API/database, responsive của các thành phần ngoài Header.

### Còn tồn đọng (mới)
5. Nav item "Bảo hiểm" trỏ tới `/insurance` — route này **chưa tồn tại** trong `app/`, cần tạo trang (kể cả dạng placeholder như `/hotels`/`/cruises`) trước go-live để tránh 404.
6. Logo chỉ tăng ~1.2 lần thay vì 1.8–2 lần theo đúng số brief gốc, do ràng buộc không được sửa `pt-40` của Hero — nếu muốn đúng 1.8–2 lần, cần một task riêng được phép điều chỉnh padding của Hero (hoặc đổi Header từ `fixed` sang `sticky`, kéo theo thay đổi cách Hero hiển thị video nền — cả hai đều ngoài phạm vi task này).

---

## Global UI Spacing Optimization (2026-07-24)

**Phạm vi:** Toàn bộ Homepage (trừ `sections/hero-section.tsx` — không đụng, vì `pt-40` của Hero đang được Header mới ở trên tính toán khớp; đổi giá trị đó sẽ phá lại phép đo vừa chốt).

### Đã sửa
- **File:** `app/globals.css` — thêm 3 token spacing dùng chung, theo đúng cơ chế `@utility` đã có sẵn cho `container-mv` (không hardcode `py-*` riêng từng section nữa):
  - `section-py-lg` = `py-12 lg:py-16` (48/64px) — dùng cho section nhiều nội dung nhất (Tour ghép quốc tế, Điểm đến), giảm ~50% so với `py-24 lg:py-32` cũ.
  - `section-py-md` = `py-10 lg:py-14` (40/56px) — Core Services, MICE, Năng lực, Liên hệ, giảm ~42–50% so với `py-20 lg:py-24/28` cũ.
  - `section-py-sm` = `py-8 lg:py-10` (32/40px) — Trust Strip, giảm 50% so với `py-16 lg:py-20` cũ.
- **File:** `components/homepage/section-heading.tsx` — gap Eyebrow→Title→Description dùng chung cho 4 section (Core Services, Tour ghép quốc tế, Năng lực, Điểm đến) giảm từ `gap-4` (16px) xuống `gap-2.5` (10px) — sửa 1 nơi, áp dụng đồng loạt.
- **File:** từng section (`trust-strip`, `core-services`, `enterprise-mice`, `featured-journeys`, `destinations`, `brand-center`, `final-cta`) — áp đúng 1 trong 3 token trên, đồng thời giảm khoảng cách nội bộ (heading khối→nội dung, description→CTA, viền phân cách) theo cùng tỉ lệ ~35–45% (mt-8→mt-5, mt-10→mt-6, mt-12→mt-6, pt-8→pt-5...).
- **File:** `components/homepage/journey-card.tsx`, `components/homepage/featured-journeys-grid.tsx`, `components/homepage/destinations-rail.tsx`, `components/homepage/dual-path-cta.tsx` — giảm gap giữa Card trong grid (`gap-6`→`gap-5`), padding nội dung Card (`p-6`→`p-5`), và khoảng cách heading→mô tả bên trong từng Card/khối form.
- Card ảnh MICE: `min-h-[560px]` → `min-h-[480px] lg:min-h-[520px]` — nội dung chữ bên trong đã gọn hơn nên không cần khung ảnh cao như cũ.

### Đã đo (thực tế, không ước lượng)
- Chiều cao trang chủ (Desktop 1440px, `document.body.scrollHeight`): **6533px** — so với 7490px trước khi tối ưu (đo lại từ ảnh `before.png`/`after.png` của Sprint UI-01) → **giảm ~12.8%**.
- Từng section riêng lẻ (đo `getBoundingClientRect().height`) giảm đúng theo tỉ lệ ~40–50% ở phần padding — nhưng **tổng thể trang chỉ ngắn hơn ~13%, không đạt mục tiêu "~30%"** nêu ở brief, vì phần lớn chiều cao còn lại đến từ **nội dung** (Hero cao 820px không được sửa; section Tour ghép quốc tế cao 1283px chủ yếu do 6 Tour Card thật, không phải khoảng trắng) — không cắt bớt nội dung/số lượng card vì ngoài phạm vi yêu cầu (chỉ được đụng "spacing", không đụng "content").
- Không overflow ngang ở Desktop (1440px)/Tablet (768px)/Mobile (375px) — `scrollWidth === clientWidth` cả 3 mốc. Ảnh minh chứng: `docs/sprint-ui-01/spacing-after-{desktop,tablet,mobile}.png`.
- `npx tsc --noEmit`, `npx eslint .`, `npx next build` — cả 3 sạch.

### Không đụng tới
`sections/hero-section.tsx` (giữ nguyên `pt-28/32/40` vì Header vừa tính khớp với giá trị này), `components/homepage/lead-form.tsx` (gap giữa các field trong form giữ nguyên — đây là nhịp điệu thao tác nhập liệu, không phải nhịp điệu trình bày biên tập, thay đổi rủi ro ảnh hưởng khả năng đọc form), `components/site/site-header.tsx`, backend/CMS/API/database.

### Còn tồn đọng (mới)
7. Mục tiêu "ngắn hơn ~30%" chưa đạt (mới đạt ~13%) — muốn đạt được cần hoặc giảm số lượng Tour Card hiển thị trên Homepage (vd. 6→4), hoặc thu nhỏ Hero (cả hai đều là thay đổi **nội dung/Hero**, ngoài phạm vi task "chỉ spacing" này, cần task riêng nếu muốn theo đuổi tiếp mục tiêu 30%.

---

## Hotfix — Brand Statement → Utility Bar + Phóng to Logo (2026-07-24)

**Phạm vi:** Chỉ khu vực Header Brand (`components/site/site-header.tsx`). Không sửa Hero Banner, Homepage, Menu Navigation, màu, font, spacing của section khác.

### Vấn đề & giải pháp
Yêu cầu trước đó (tăng logo 1.8–2 lần ngay trong Header Level 2 cũ, vốn còn chứa cả Brand Statement 3 cụm) không đủ chỗ vì Header là `fixed` đè lên Hero Banner, và Hero Banner có `padding-top` cố định không được sửa. Giải pháp: **chuyển hẳn Brand Statement từ Header Level 2 sang Header Level 1 (Utility Bar)** — nhờ vậy Level 2 chỉ còn một mình Logo, giải phóng đủ không gian để phóng to logo mà không cần đụng Hero.

### Đã sửa
- **File:** `components/site/site-header.tsx`
- **Header 1 (Utility Bar):** đổi từ layout 2 cột (trái/phải) sang **grid 3 cột** (`grid-cols-[auto_1fr_auto]`) — trái: Hotline (giữ nguyên); **giữa: Brand Statement mới** (2 đường line vàng mảnh · "TOUR THIẾT KẾ TRỌN GÓI" Navy · kim cương vàng · "MICE" Gold đậm · kim cương vàng · "TOUR GHÉP QUỐC TẾ" Navy · 2 đường line vàng), canh giữa tuyệt đối theo chiều ngang của cả Header 1 (không phải chỉ theo khoảng trống còn lại) nhờ cột giữa `1fr`; phải: Về chúng tôi/Tin tức/Tư vấn/Ngôn ngữ/Đăng nhập/Đăng ký (giữ nguyên, chỉ giảm gap để đủ chỗ — xem mục kỹ thuật bên dưới).
- **Header 2 (Brand):** bỏ hẳn khối Brand Statement 3 dòng cũ — giờ chỉ còn `<Logo>` canh giữa. Logo image gốc (`/logo-minhviet.png`) đã có sẵn dòng "Khám phá cảm xúc bất tận" nằm trong chính file ảnh (dưới chữ MINHVIET), nên khi phóng to Logo, slogan tự động phóng to theo — đúng yêu cầu "giữ nguyên font/màu/style" vì không có node text riêng nào bị đổi, chỉ ảnh phóng to.
- **Logo:** tăng từ 50px → **90px (đúng 1.8 lần)**, dùng thẳng prop `height` của component `Logo` (Next.js `<Image>` tự tính `width` theo tỷ lệ khoá sẵn `ratio = 1.415`) — **không dùng `transform: scale()`**, ảnh luôn render đúng kích thước gốc nên nét, không vỡ.

### Quyết định kỹ thuật (đo thật, không ước lượng)
- Header 1 tăng nhẹ (36.67px → 41px) để đủ chỗ cho Brand Statement chen vào cùng hàng với Hotline.
- Ban đầu thử phóng logo lên 96px (~1.9 lần) → **âm khoảng cách với headline Hero (-2px tại 1024–1152px)** — đã giảm lại còn 90px (đúng 1.8 lần, cận dưới khoảng brief cho phép) để có biên an toàn dương.
- **Phát hiện & sửa lỗi phát sinh khi thêm cột giữa:** ở đúng ngưỡng breakpoint `lg` (1024px, "Laptop"), grid 3 cột với `whitespace-nowrap` ban đầu bị tràn ngang trong chính hàng Utility Bar (nội dung rộng hơn ~48px so với chỗ có) khiến nút "Đăng ký" bị đẩy khuất — đã sửa bằng cách giảm gap/kích thước chữ Brand Statement và cụm bên phải ở `lg`, mở rộng lại về kích thước gốc từ `xl` (1280px) trở lên. Xác nhận lại bằng đo `scrollWidth` = `clientWidth` của hàng Utility Bar ở cả 1024/1152/1280/1440px.
- Kết quả đo cuối cùng — khoảng hở giữa đáy Header và đỉnh headline Hero (`h1`), dương ở mọi mốc:

  | Viewport | Chiều cao Header (trước → sau) | Logo (trước → sau) | Khoảng hở còn lại |
  |---|---|---|---|
  | 1024–1152px (Laptop) | 173.75px → 204px | 60px → 90px | +12px |
  | 1280–1440px (Desktop) | 173.75px → 185px | 60px → 90px | +16px |
  | Tablet (768px) | — → 105px | 60px → 90px | không áp dụng (Hero dùng `pt-32`, không đo `h1Top` riêng — kiểm tra bằng mắt qua ảnh, không chồng) |
  | Mobile (375px) | — → 105px | 60px → 90px | không áp dụng — kiểm tra bằng mắt qua ảnh, không chồng |

### Đã kiểm tra
- Desktop (1440px)/Laptop (1024, 1152, 1280px): Logo 90px canh giữa chính xác, Brand Statement 1 dòng không xuống dòng, không overflow ngang, không đè headline Hero (khoảng hở +12 đến +16px).
- Tablet (768px)/Mobile (375px): Logo 90px canh giữa, không crop, không tràn ngang (`scrollWidth === clientWidth`) — Utility Bar (và do đó Brand Statement) vẫn ẩn dưới `lg` như hành vi gốc trước mọi hotfix header trong sprint này (không đổi breakpoint hiển thị, đúng yêu cầu "không sửa Responsive layout").
- `npx tsc --noEmit`, `npx eslint .`, `npx next build` — cả 3 sạch.
- **Phát hiện ngoài phạm vi (không sửa):** ở đúng 1024–1152px, hàng Main Navigation (Level 3, không đụng tới trong hotfix này) tự xuống 2 dòng do 10 mục menu không đủ chỗ trên 1 hàng — đây là vấn đề tồn tại từ trước (không phải do hotfix này gây ra, đã xác nhận bằng cách so trước/sau chỉ riêng khu vực Utility+Brand), nằm ngoài phạm vi "không sửa Menu Navigation" của task này.

### Không đụng tới
`sections/hero-section.tsx`, Main Navigation (Level 3), Hero Banner, các section Homepage khác, màu sắc, font, backend/logic/CMS.

### Còn tồn đọng (mới)
8. Main Navigation tự xuống 2 dòng ở 1024–1152px (xem "Đã kiểm tra" ở trên) — cần một task riêng được phép sửa Menu Navigation để xử lý (vd. ẩn bớt mục hoặc thu gọn ở đúng khoảng này).

---

## Sprint UI-02 — Homepage Color System, Visual Rhythm & Premium Motion Refinement (2026-07-24)

**Phạm vi:** Màu sắc, typography colors, section rhythm, card styling, motion nhẹ, responsive liên quan — Homepage + shared Header/Footer chrome. Không sửa cấu trúc nghiệp vụ, backend, CMS, API, lead handling, route, menu architecture, hay Tour Detail/Booking/CRM/AI Import/Authentication. Không redesign toàn bộ — giữ nguyên Information Architecture. Chi tiết đầy đủ (token cuối cùng, section mapping, before/after, QA) ở `UI_COLOR_SYSTEM_IMPLEMENTATION.md`.

### Vấn đề
Homepage dùng quá nhiều chữ gần-đen (`text-foreground` trên heading), nhiều mảng Navy đặc liên tiếp (Hero/MICE/Consultation overlay đều là navy/đen phẳng), Header rò rỉ màu Gold ra ngoài phạm vi MICE (vi phạm Volume 01 §04), 2 tile "Bespoke" trong Core Services dùng chung một màu Navy, và Consultation/Newsletter/Footer nối liền thành một khối tối kéo dài không có điểm ngắt.

### Đã sửa
- **File mới trong `app/globals.css`:** bộ token `--mv-deep-navy/--mv-brand-blue/--mv-journey-blue/--mv-sky-cyan/--mv-mist-blue/--mv-ice-blue/--mv-slate-text/--mv-mice-gold/--mv-offer-red/--mv-border-soft` (đăng ký cộng thêm qua `@theme inline`, không đổi `--primary`/`--accent`/`--foreground` hiện có), token motion (`--motion-fast/normal/slow`, `--ease-mv-standard`), token spacing tham chiếu, và các utility gradient (`bg-gradient-mv-hero/-brand/-consultation/-mice`, `divider-mv-gradient`).
- **`components/ui/button.tsx`:** thêm `variant="journey"` (Journey Blue → Sky Cyan hover) — additive, không đổi `default/accent/outline/gold` hiện có.
- **`components/site/site-header.tsx`:** bỏ Gold khỏi utility bar (dải "Tour Thiết Kế Trọn Gói · MICE · Tour Ghép Quốc Tế" — Gold giờ chỉ còn trong chính section MICE), nav active/hover đổi sang Journey Blue, "Ưu đãi" đổi sang token `--mv-offer-red`.
- **`sections/hero-section.tsx`:** overlay đổi từ gradient đen phẳng sang `bg-gradient-mv-hero` (navy → Journey Blue tail), CTA chính đổi `variant="accent"` → `variant="journey"`, eyebrow → Sky Cyan.
- **`sections/trust-strip-section.tsx`:** nền `bg-paper` → `bg-mv-ice-blue`, heading/segment pill/border đổi sang Deep Navy + Mist Blue + border-soft.
- **`components/homepage/verified-stat.tsx`:** số liệu ở chế độ sáng (`!onDark`) đổi từ `text-foreground` (gần đen) sang `text-mv-brand-blue`.
- **`components/homepage/section-heading.tsx`:** heading `!onDark` → Deep Navy, eyebrow → Journey Blue, divider chuyển gradient Brand Blue → Sky Cyan — áp dụng đồng loạt cho Core Services/Featured Journeys/Destinations/Brand Center vì dùng chung component này.
- **`sections/core-services-section.tsx`:** 2 tile Bespoke hết dùng chung `bg-primary` — "Tour đoàn" đổi gradient Brand→Journey Blue, "MICE & Sự kiện" giữ Deep Navy + icon/arrow Gold; 5 tile "Có sẵn" đổi sang Mist Blue/border-soft/icon Journey Blue.
- **`sections/enterprise-mice-section.tsx`:** overlay ảnh đổi sang `bg-gradient-mv-mice` (navy-blue, không còn đen phẳng), badge → Sky Cyan + icon Gold, process-line → Cyan, CTA → `variant="journey"`; đồng thời thêm `border-t` còn thiếu (khớp pattern các section lân cận) và chuẩn hoá `rounded-3xl` → `rounded-2xl` cho đồng nhất với Journey/Destination card.
- **`components/homepage/journey-card.tsx`:** title/price/label chuyển Deep Navy/Journey Blue/Slate; bỏ hiệu ứng nổi mạnh (`hover:-translate-y-1`), thay bằng border chuyển Sky Cyan khi hover; ảnh hover scale chuẩn hoá còn 1.035 ở 360ms (token `duration-mv-slow`).
- **`components/homepage/featured-journeys-grid.tsx`, `sections/featured-journeys-section.tsx`, `sections/destinations-section.tsx`, `components/homepage/destinations-rail.tsx`, `components/homepage/destination-card.tsx`, `sections/brand-center-section.tsx`:** đồng bộ theo cùng token (tab active, nền Mist Blue xen kẽ, arrow button Ice Blue→Journey Blue, radius `rounded-2xl` thống nhất, accent-word heading đổi từ `text-primary` — trùng màu heading, gần như vô hình — sang Journey Blue).
- **`sections/final-cta-section.tsx`:** nền `bg-deep` phẳng → `bg-gradient-mv-consultation` (Deep Navy → Brand Blue).
- **`components/homepage/lead-form.tsx`, `components/homepage/dual-path-cta.tsx`:** submit CTA → `variant="journey"`; tab active/focus ring đổi sang token mới.
- **`components/site/site-footer.tsx`:** tách **Newsletter thành băng `bg-mv-mist-blue` riêng** (không còn dùng chung `bg-deep` với phần Footer chính) — sửa đúng vấn đề "form, newsletter và footer nối thành một khối tối quá dài" nêu trong brief; Footer chính đổi `bg-deep` → `bg-mv-deep-navy`; sửa luôn lỗi có sẵn — 3 icon mạng xã hội trước đó dùng chung 1 `aria-label`, nay có nhãn riêng cho Facebook/YouTube/LinkedIn.
- **`components/homepage/newsletter-form.tsx`:** lật toàn bộ style từ surface-tối (input `bg-white/5 text-white`) sang surface-sáng (input `bg-white text-mv-deep-navy border-mv-border-soft`) cho khớp băng Mist Blue mới của Newsletter.

### Đã kiểm tra
- `npx eslint .`, `npx tsc --noEmit`, `npx next build` — cả 3 sạch, 22/22 route generate.
- Responsive: `document.documentElement.scrollWidth === clientWidth` ở cả 4 mốc (1440/1280/768/390) — không overflow ngang.
- Console runtime trên dev server sạch (restart mới): 0 lỗi, chỉ còn 1 warning tiền tồn tại không liên quan (`Logo` width/height ratio).
- Ảnh Before/After: `docs/sprint-ui-02/{before,after}-{desktop,mobile}-full.png`.

### Không đụng tới
`components/site/tour-card.tsx` (Tour Card của `/tours`, khác `journey-card.tsx` của Homepage), `components/ui/badge.tsx`, token toàn cục `--primary/--accent/--foreground/--muted-foreground/--border`, backend/CMS/API/lead handling/route/menu architecture, Tour Detail/Booking/CRM/AI Import/Authentication.

### Còn tồn đọng (mới)
9. Bug hiển thị giá trị thô `group-tours` (thay vì nhãn tiếng Việt) trong dropdown "Nhu cầu quan tâm" của Consultation form — lỗi resolve label của `Select.Value` (Base UI), đã ghi nhận từ trước ở `UI_MASTER_REVIEW.md` P0 #2, không phải màu sắc nên ngoài phạm vi sprint này.
10. Mật độ nội dung của card MICE (7 khối chữ chồng trên một ảnh) chưa được rút gọn — chỉ màu/overlay/motion được chỉnh trong sprint này, đúng chỉ thị "không redesign toàn bộ".
11. Mega menu Header vẫn chỉ mở bằng hover, chưa hỗ trợ `onFocus` cho bàn phím — thuộc về hành vi/component logic, ngoài phạm vi "màu sắc/motion nhẹ" của sprint này.

---

## Sprint UI-03 — Consultation Form + Travel Inspiration Hub V1 (2026-07-24)

**Phạm vi:** Section tư vấn gần cuối Homepage — chia 2 cột (form trái, Travel Inspiration Hub phải mới). Không sửa Header, Hero, section tour, MICE, Footer, Database production, Lead API, logic submit, Authentication, Tour Detail, CMS Admin, AI Import. Chi tiết đầy đủ (data contract, CMS V1 spec, curator contract, acceptance test) ở `TRAVEL_INSPIRATION_HUB_V1.md`.

### Đã sửa
- **File mới:** `sections/consultation-inspiration-section.tsx` (`ConsultationInspirationSection`) — thay thế `sections/final-cta-section.tsx` (đã xoá). Grid 2 cột `lg:grid-cols-[0.46fr_0.54fr]` (46/54 đúng brief), 1 cột dưới `lg` (form trước theo thứ tự DOM — tự đáp ứng cả yêu cầu Tablet "nếu chật thì 1 cột" lẫn Mobile "form trước"). Nền dùng lại `bg-gradient-mv-consultation` (Deep Navy → Brand Blue) từ Sprint UI-02, padding riêng `py-16 lg:py-20` (64/80px, đúng khoảng brief yêu cầu cho section này).
- **File mới:** `components/homepage/consultation-tabs.tsx` (`ConsultationTabs`) — thay thế `components/homepage/dual-path-cta.tsx` (đã xoá). Dùng lại primitive `@base-ui/react/tabs` như trước (đầy đủ `role`/`aria-selected`/`aria-controls`/keyboard ArrowLeft-Right/Enter-Space có sẵn), nhưng thêm `keepMounted` trên cả 2 `TabsPanel` — Base UI mặc định **unmount** panel không active (xem Sprint UI-01 hotfix note), nghĩa là trước sprint này chuyển tab sẽ xoá sạch dữ liệu đã nhập; `keepMounted` giữ cả 2 form trong DOM (ẩn bằng `hidden` attribute thật) nên dữ liệu sống sót qua việc đổi tab — đúng yêu cầu mới của brief.
- **File mới:** `components/homepage/consultation-forms.tsx` — `OrganizationConsultationForm`/`IndividualConsultationForm` (export), dùng chung 1 hàm nội bộ `ConsultationFormPanel` để không lặp JSX. Field/logic submit của `LeadForm` giữ nguyên 100%, chỉ thêm eyebrow + copy đúng brief phía trên form.
- **File mới:** `components/homepage/travel-inspiration-hub.tsx`, `featured-inspiration-video.tsx`, `inspiration-card.tsx`, `video-modal.tsx` — cột phải mới. `VideoModal` dùng `<dialog>` gốc trình duyệt (không cài thư viện modal mới) — `showModal()` tự trap focus, Escape tự đóng, backdrop click tự đóng (so `e.target` với chính phần tử dialog).
- **File mới:** `types/inspiration.ts`, `lib/inspiration/inspiration-demo-data.ts` — data contract CMS-ready (`TravelInspirationItem`, `TravelInspirationHomepageConfig`, enum loại/trạng thái đúng brief) + mock data (1 video nổi bật "Cảm xúc hành trình", 3 nội dung phụ, ảnh thật có sẵn trong `public/`) + `getHomepageInspiration()` — logic resolve featured/supporting từ config (lọc Draft/Archived/hết hạn, fallback theo `priority`, không trùng id giữa featured/supporting).
- **`types/homepage.ts`, `lib/cms/schema.ts`, `lib/cms/content/homepage.seed.ts`:** thêm field `eyebrow` vào `FinalCtaContent.corporate`/`.individual`; cập nhật `description`/`cta.label`/`individual.label` khớp đúng copy trong brief.
- **`app/page.tsx`:** đổi `FinalCtaSection` → `ConsultationInspirationSection`.

### Lỗi phát hiện & sửa trong QA
- Grid 2 cột bị lệch nghiêm trọng (210px/812px thay vì ~535px/629px) — cột phải có hàng supporting-card cuộn ngang (`overflow-x-auto`) khiến CSS Grid tính `fr` theo min-content của nó thay vì tỷ lệ 46/54 khai báo. Sửa bằng `[&>*]:min-w-0` trên grid cha (kinh điển "CSS Grid `fr` + overflow child" gotcha).
- Tab pill vỡ chữ trên mobile (chỉ hiện "chức"/"nhân") — label dài tự xuống dòng trong pill cao cố định, dòng trên bị che khuất. Sửa bằng `whitespace-nowrap` trên tab + cho `TabsList` tự cuộn ngang khi không đủ chỗ, thay vì ép chữ xuống dòng.

### Đã kiểm tra
- `npx eslint .`, `npx tsc --noEmit`, `npx next build` — cả 3 sạch, 22/22 route generate.
- Responsive 1440/1280/768/390px: `scrollWidth === clientWidth` cả 4 mốc.
- Tab: role/aria-selected/aria-controls đúng (xác nhận qua DOM thật); `ArrowRight` di chuyển + tự kích hoạt tab kế tiếp; dữ liệu nhập ở tab Doanh nghiệp còn nguyên sau khi chuyển sang tab Cá nhân rồi quay lại.
- Video modal: mở bằng Play (`aria-label` đúng tên item), đóng bằng nút đóng/phím Escape thật/click backdrop — cả 3 đường đều xác nhận qua DOM (`dialog.open`).
- Ảnh Before/After: `docs/sprint-ui-03/*.png` (desktop/tablet/mobile, 2 trạng thái tab, trạng thái video modal desktop + mobile).

### Không đụng tới
`components/site/site-header.tsx`, `sections/hero-section.tsx`, mọi section tour (`featured-journeys-section.tsx`, `destinations-section.tsx`, `core-services-section.tsx`), `sections/enterprise-mice-section.tsx`, `components/site/site-footer.tsx`, `lib/actions/lead-action.ts`, `hooks/use-lead-form.ts`, `leadFormSchema` (giá trị `intent` gửi lên server vẫn là `corporate`/`individual` như cũ — xem "Còn tồn đọng" bên dưới), Authentication, Tour Detail, CMS Admin, AI Import, database production.

### Còn tồn đọng (mới)
12. `leadFormSchema.intent` vẫn nhận `'corporate' | 'individual'`, chưa đổi thành `ORGANIZATION`/`INDIVIDUAL` như brief §III.10 gợi ý — chỉ đổi ở tầng hiển thị/tên component (`OrganizationConsultationForm`/`IndividualConsultationForm`) để không phá payload hiện có gửi lên `submitLeadAction`. Cần một quyết định + task riêng ở sprint Backend nếu muốn đổi enum thực sự gửi lên server.
13. CMS Admin cho Travel Inspiration Hub (23 mục ở brief §X: list, CRUD mềm, workflow Draft→Published, homepage placement, preview desktop/mobile...) chưa xây — V1 chỉ có mock repository + type contract, đúng phạm vi được giao.
14. Chưa có video thương hiệu/testimonial thật trong project — `videoUrl` của item nổi bật để `null` có chủ đích; cần gắn video thật khi có, không cần đổi code (chỉ đổi data).
