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
