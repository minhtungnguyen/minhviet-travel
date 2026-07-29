# Combo Landing Page — Handover

**Module:** Combo
**Route:** `/combo` (landing), `/combo/tat-ca` (full listing)
**Branch:** `feature/combo-landing-page`
**Status:** Code complete, đã qua 2 vòng (v1 tối giản đúng brief gốc → v2 nâng cấp demo theo feedback "sơ sài quá"). `pnpm lint`/`pnpm typecheck`/`pnpm test`/`pnpm build` đều pass. Browser-verified trên production server đã rebuild (`pnpm build && pnpm start`), desktop 1440×900 và mobile ~468px CSS width — không có lỗi console/hydration liên quan tới Combo.

**Ghi chú v2 (demo pass):** sau khi review v1, feedback là "làm sơ sài quá" — yêu cầu ưu tiên chất lượng trình diễn demo hơn giới hạn asset thật hiện có: dùng thoải mái ảnh/video stock có giấy phép hợp lệ, hiển thị đủ 6 destination như thiết kế gốc thay vì chỉ 3, mỗi section phải "dày" hơn về nội dung/thị giác, hero phải ấn tượng hơn, card không được lặp ảnh/bố cục. Toàn bộ mục 2 dưới đây phản ánh trạng thái v2. Tài liệu tách rõ Demo Asset (stock, tạm) và Production Asset (ảnh thật Minh Việt) trong `COMBO-MEDIA-REQUIREMENTS.md` để thay thế sau này chỉ cần sửa 1 file seed, không đụng code.

---

## 1. Mục tiêu

Xây dựng `/combo` theo đúng brief EPIC-006: một **Editorial Commerce Landing Page** — không phải Booking Engine, không phải Dynamic Package, không phải Marketplace — mục tiêu truyền cảm hứng, SEO, tạo lead, giới thiệu các Combo nổi bật và dẫn khách sang đội ngũ tư vấn. Mirror pattern đã dùng ở `/mice` và `/tour-thiet-ke` (SEO + Conversion Landing Page), vay mượn một số pattern storytelling từ nhánh chưa merge `design/flight-homepage-experience` (Route Explorer split-visual, Destination Story full-bleed, Why-Minh-Việt numbered journey) nhưng **không phụ thuộc code vào nhánh đó** — mọi pattern được viết lại độc lập trong module Combo.

## 2. Những gì đã hoàn thành

**Content model** (`types/combo.ts`, `lib/combo/`): `ComboItem`/`ComboCategory`/`ComboDestination`/`ComboWhyItem`/`ComboLandingContent`, theo đúng field set brief yêu cầu (Title/Slug/Thumbnail/Summary/Content/Destination/Category/Price From/CTA/SEO/Status) — không có Inventory/Room Type/Availability/Dynamic Pricing. `status: 'draft' | 'published' | 'archived'` (không chỉ `isActive: boolean`) để khớp yêu cầu Draft/Review/Publish/Archive của CMS module map. v2 bổ sung thêm field nội dung (không phải kiến trúc mới): `ComboItem.highlights: string[]` (2–4 gạch đầu dòng "gói gồm những gì", vẫn là copy marketing, không phải inventory), `ComboCategory.description`, `ComboDestination.stat`, `hero.trustSignals`. Zod schema (`lib/combo/combo-schema.ts`) + seed (`lib/combo/combo-data-seed.ts`) + repository cache-wrapped (`lib/combo/combo-repository.ts`), theo đúng độ nghiêm ngặt của `lib/flight/` (không phải `lib/mice/` seed-only).

**Hero** (`components/combo/combo-hero.tsx` + `combo-hero-media.tsx`): ~78vh (nâng từ ~70vh ở v1 để có sức nặng thị giác hơn), video-with-fallback-image (pattern-copy từ `design/flight-homepage-experience`'s `flight-hero-media.tsx`, không import vì nhánh đó chưa merge). v2: video hero đổi từ ảnh/video Hạ Long (trùng với section khác) sang video cinematic riêng — Mixkit "Flying over a beautiful tropical landscape" (xem `COMBO-MEDIA-REQUIREMENTS.md`) — cộng dải trust-signal 3 pill ("Giá trọn gói minh bạch", "Lịch trình chuẩn bị sẵn", "Đội ngũ hỗ trợ xuyên suốt") dưới CTA, cùng pattern với flight hero's trust band nhưng nội dung riêng cho Combo. Text motion fade-up có stagger (tắt khi `prefers-reduced-motion`).

**Section 01 — Combo nổi bật** (`combo-featured-section.tsx` + `combo-card.tsx`): 1 featured + N secondary (8 combo published + 1 draft ẩn), layout dựa trên `components/homepage/travel-inspiration-hub.tsx` (precedent duy nhất trong codebase cho pattern featured+secondary). `ComboCard` dùng chung cho cả Section 01 và trang `/combo/tat-ca`. v2: mỗi card có 1 ảnh riêng biệt (không còn card nào trùng ảnh với card khác hay với Destination Explorer) và 1 dòng highlights ngắn (VD "Vé máy bay khứ hồi · Resort 4 sao gần biển · Buffet sáng mỗi ngày") tăng độ dày nội dung mà không biến thành bảng so sánh tính năng. CTA "Xem tất cả Combo" dẫn `/combo/tat-ca`.

**Section 02 — Chọn theo nhu cầu** (`combo-category-section.tsx`): 6 tile ảnh (Gia đình/Cặp đôi/Nghỉ dưỡng/Doanh nghiệp/Nhóm bạn/Khách công tác), không icon, hover scale nhẹ. v2: thêm mô tả ngắn 1 dòng dưới mỗi label (VD "Lịch trình vừa sức, phòng nghỉ rộng rãi cho cả nhà"), đổi grid từ 6 cột 1 hàng (v1) sang 3 cột 2 hàng để tile đủ rộng chứa mô tả, đúng tinh thần "đầu tư bố cục" thay vì nhồi nhỏ. Mỗi tile link tới `/combo/tat-ca?category=...` (filter thật, không phải link chết).

**Section 03 — Destination Explorer** (`combo-destination-explorer-section.tsx`): vẫn **hoàn toàn data-driven, không hardcode danh sách điểm đến** — component chỉ map qua destination có `status: 'published'`. v2: hiển thị đủ **6/6 điểm đến** theo đúng thiết kế gốc (Hạ Long, Sa Pa dùng ảnh thật; Cát Bà, Đà Nẵng, Nha Trang, Phú Quốc dùng ảnh stock được cấp phép, xem quyết định ở §7) thay vì chỉ 3 như v1. Mỗi destination có thêm `stat` ("2 hành trình Combo") hiển thị dưới tagline.

**Section 04 — Vì sao nên chọn Combo** (`combo-why-section.tsx`): layout editorial alternating ảnh-trái/ảnh-phải, KHÔNG dùng pattern 4-icon-grid như `MiceProcessSection`/flight's Why-Minh-Việt — đúng yêu cầu brief. v2: 3 ảnh đều riêng biệt, không còn tái sử dụng ảnh category tile như v1.

**Section 05 — Bài viết mới** (`combo-articles-section.tsx`): tái sử dụng trực tiếp `FlightArticleCard` (`components/flight/flight-article-card.tsx`) — không tạo card mới. `ComboLandingContent.articles` được type thẳng là `FlightArticle` (import type, không duplicate) nên đây là cross-module reuse zero-adapter, cùng tiền lệ với việc nhánh flight từng import `components/homepage/reveal.tsx`.

**Section 06 — CTA** (`combo-final-cta.tsx`): banner navy, dùng token `--mv-deep-navy` có sẵn thay vì `#1F3863` brief đề cập (hex đó không tồn tại trong `app/globals.css`, chỉ có trong file spec `MV_Operating_System` chưa được wire vào code) — theo đúng chỉ dẫn "reuse Design System, không tạo ngôn ngữ thị giác mới" của chính brief.

**Form**: `combo-consultation-form.tsx` tái sử dụng nguyên `ConsultationTabs` → `LeadForm` → `submitLeadAction`, `prefill={{ source: 'COMBO_LANDING', landingIntent: 'COMBO', serviceType: 'COMBO', defaultServiceInterest: 'combo' }}`, section `id="combo-form"`.

**`/combo/tat-ca`** (`app/combo/tat-ca/page.tsx`): trang danh sách tối giản theo đúng yêu cầu — hero nhỏ + tiêu đề, grid dùng lại `ComboCard`, filter theo `category`/`destination` qua `searchParams` (equality filter, không state client mới), pagination qua `searchParams.page` (12/trang), không Booking Engine/Inventory/Dynamic Pricing.

## 3. File tạo mới

```
types/combo.ts
lib/combo/combo-schema.ts
lib/combo/combo-data-seed.ts
lib/combo/combo-repository.ts
components/combo/combo-hero.tsx
components/combo/combo-hero-media.tsx
components/combo/combo-card.tsx
components/combo/combo-featured-section.tsx
components/combo/combo-visual-tile.tsx
components/combo/combo-category-section.tsx
components/combo/combo-destination-explorer-section.tsx
components/combo/combo-why-section.tsx
components/combo/combo-articles-section.tsx
components/combo/combo-final-cta.tsx
components/combo/combo-consultation-form.tsx
app/combo/page.tsx
app/combo/tat-ca/page.tsx
public/images/combo/*.jpg (23 file — xem COMBO-MEDIA-REQUIREMENTS.md)
public/images/hero/combo-hero-preview.jpg
public/videos/hero/combo-hero-preview.mp4
docs/Handover/Combo/COMBO-MEDIA-REQUIREMENTS.md
docs/Handover/Combo/COMBO-LANDING-HANDOVER.md (file này)
```

## 4. File sửa

Không sửa file nào ngoài module Combo. Header đã có sẵn nav item `/combo` từ trước (commit `dfafc10`), không cần đổi `components/site/site-header.tsx`.

## 5. Test Result

```
pnpm lint        ✅ 0 lỗi
pnpm typecheck   ✅ 0 lỗi
pnpm test        ✅ 137/137 pass (24 test file — không có test nào bị ảnh hưởng)
pnpm build       ✅ Compiled successfully — /combo là route ○ (Static), /combo/tat-ca là ƒ (Dynamic, do dùng searchParams)
```

## 6. Browser Verification

Verify trên `pnpm dev`/`pnpm build`, Playwright MCP, sau cả 2 vòng v1 và v2:

- **Desktop 1440×900**: Hero video Mixkit tự phát đúng, fallback poster hoạt động, breadcrumb/headline/CTA/trust-signal pills hiển thị đúng. Xác nhận qua DOM và qua screenshot theo từng section (dùng `scrollIntoView` + chụp ngay sau đó): Hero → Featured (1 featured + 7 secondary, mỗi card 1 ảnh riêng + dòng highlights) → Category (6 tile, đủ mô tả) → Destination Explorer (đủ 6/6 điểm đến, có stat) → Why Combo (3 block ảnh riêng, alternating đúng) → Articles (4 thumbnail riêng biệt) → Related Links → Final CTA → Form → Footer — đúng thứ tự, đúng nội dung, không thiếu section nào.
- **Lưu ý xác minh quan trọng (lặp lại ở cả 2 vòng)**: screenshot chụp ngay sau `window.scrollTo`/`scrollIntoView` bằng script tự động đôi khi cho ra ảnh trắng hoàn toàn hoặc "thiếu" card. Đây **không phải bug hiển thị thật** — xác nhận trực tiếp qua `getComputedStyle`/`getBoundingClientRect` ngay tại thời điểm đó rằng phần tử vẫn `visibility: visible`, đúng vị trí, đúng nội dung; chụp lại lần 2 ở cùng vị trí luôn ra ảnh đúng. Đây là race condition của chính công cụ chụp ảnh tự động trong môi trường này (kịp paint chậm hơn lệnh chụp), đúng hiện tượng đã ghi nhận ở `FLIGHT-HOMEPAGE-EXPERIENCE-HANDOVER.md` §8. Ở vòng v1 còn xác nhận thêm bằng cách ép `opacity: 1 !important` toàn trang qua CSS injection trước khi chụp — loại trừ hoàn toàn khả năng đây là lỗi Reveal/Framer Motion.
- **Mobile ~468px CSS width** (môi trường có hệ số scale, cùng hiện tượng đã ghi nhận ở flight handover): không có horizontal overflow ở cấp trang (`scrollWidth === clientWidth`), hero/card xếp 1 cột đúng, trust-signal pills wrap 2 dòng gọn, MobileCTA (Gọi ngay/Zalo/Tư vấn) không đè lên nội dung.
- **`/combo/tat-ca?category=gia-dinh`**: filter hoạt động đúng — chỉ hiển thị 2 combo thuộc category "gia-dinh", label "Xóa bộ lọc" hiển thị, đếm đúng số hành trình, không hiện pagination vì chỉ có 1 trang kết quả.
- **Console**: kiểm tra qua nhiều lần điều hướng/tương tác ở cả 2 vòng — 0 lỗi liên quan Combo. Vòng v1 còn có vài lỗi 404 pre-existing site-wide (footer/header prefetch tới `/deals`, `/insurance`, `/services`, `/brand/news`, `/faq`, `/policy/*`, `/careers`, `/brand/leadership`) — không liên quan Combo, không sửa. **0 lỗi Hydration** ở cả 2 vòng.

## 7. Known Issues / Technical Debt

1. 23 file ảnh + 1 video ở `public/images/combo/`/`public/videos/hero/combo-hero-preview.mp4` là **Demo Asset** (Pexels/Mixkit, miễn phí thương mại) — xem bảng đầy đủ và checklist thay thế bằng ảnh/video thật Minh Việt ở `COMBO-MEDIA-REQUIREMENTS.md`. Đây là quyết định có chủ đích cho bản demo (ưu tiên trình diễn UI/UX/Creative Direction), không phải sơ suất.
2. Destination Explorer hiện hiển thị đủ 6/6 điểm đến cho mục đích demo — 2/6 (Hạ Long, Sa Pa) dùng ảnh/video thật, 4/6 còn lại (Cát Bà, Đà Nẵng, Nha Trang, Phú Quốc) dùng Demo Asset. Khi có bộ ảnh/video thật đạt chuẩn thương hiệu cho 4 điểm đến này, chỉ cần cập nhật `src` trong seed — component không cần sửa vì đã data-driven từ đầu.
3. `ComboItem.content`/`heroImage`/`heroVideo`/`ogImage` được reserve trong type cho một trang chi tiết Combo trong tương lai — chưa có trang chi tiết nào trong epic này, các field này chưa được render ở đâu cả.
4. Không có FAQ section — brief liệt kê rõ 6 section (01–06), FAQ không nằm trong danh sách đó nên không thêm, tránh mở rộng phạm vi ngoài yêu cầu.
5. **(Pre-existing, ngoài phạm vi)** Một số 404 site-wide ghi nhận ở vòng v1 §6 — không sửa trong phạm vi module Combo.

## 8. Trạng thái merge

Code nằm trên `feature/combo-landing-page`, chưa commit. Nhánh `design/flight-homepage-experience` không được merge vào và cũng không phải dependency của module Combo — mọi pattern vay mượn đều được viết độc lập.
