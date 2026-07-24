# TRAVEL INSPIRATION HUB V1 — Sprint UI-03
### Consultation Form + Travel Inspiration Hub

## 1. Mục tiêu nghiệp vụ

Thiết kế lại section tư vấn gần cuối Homepage thành bố cục hai cột: form thu lead (trái) không đổi về logic, cộng thêm một khu vực truyền cảm hứng du lịch thật (phải) để tiếp tục giữ chân và thuyết phục người chưa sẵn sàng điền form — thay vì để họ rời trang ngay sau khi lướt qua form. Đây là bản V1 demo: nội dung là mock data có cấu trúc CMS-ready, không phải nội dung biên tập cứng lâu dài.

## 2. Kiến trúc component

```
sections/consultation-inspiration-section.tsx   (ConsultationInspirationSection — section wrapper, 2 cột)
├─ components/homepage/consultation-tabs.tsx     (ConsultationTabs — tablist + 2 panel, keepMounted)
│   └─ components/homepage/consultation-forms.tsx
│       ├─ OrganizationConsultationForm (export)
│       ├─ IndividualConsultationForm (export)
│       └─ ConsultationFormPanel (nội bộ, dùng chung để tránh trùng lặp JSX)
│           └─ components/homepage/lead-form.tsx (KHÔNG đổi — field/submit logic giữ nguyên)
└─ components/homepage/travel-inspiration-hub.tsx (TravelInspirationHub)
    ├─ components/homepage/featured-inspiration-video.tsx (FeaturedInspirationVideo)
    │   └─ components/homepage/video-modal.tsx (VideoModal — native <dialog>)
    └─ components/homepage/inspiration-card.tsx (InspirationCard) × N
```

Data layer:
```
types/inspiration.ts                      (TravelInspirationItem, TravelInspirationHomepageConfig, enums)
lib/inspiration/inspiration-demo-data.ts   (mock items, mock config, getHomepageInspiration() resolver)
```

Không tạo abstraction thừa: `ConsultationFormPanel` là hàm nội bộ (không export), chỉ tồn tại để `OrganizationConsultationForm`/`IndividualConsultationForm` không phải chép lại cùng một khối JSX.

## 3. Data contract

`types/inspiration.ts` định nghĩa đầy đủ `TravelInspirationItem` (id, slug, type, status, title, subtitle, excerpt, content, category, tags, coverImage, coverImageAlt, gallery, videoUrl, videoProvider, videoDuration, destination, targetAudience, season, ctaLabel, ctaUrl, priority, featured, publishFrom, publishTo, locale, seoTitle, metaDescription, ogImage, createdAt, updatedAt) và `TravelInspirationHomepageConfig` (featuredItemId, supportingItemIds, sectionTitle, sectionSubtitle, isEnabled, displayFrom, displayUntil, locale, updatedBy, updatedAt) — đúng danh sách trường trong brief §VIII/§XI. `InspirationContentType` và `InspirationContentStatus` là 2 union type đúng 12 và 5 giá trị yêu cầu.

`coverImage`/`gallery` dùng lại `CmsImage` (`types/cms.ts`) — cùng type ảnh mọi section khác trên Homepage đã dùng, không tạo type ảnh riêng.

## 4. CMS V1 requirements (đặc tả cho backend/CMS sprint sau)

CMS Travel Inspiration Hub V1 (chưa xây trong sprint này) cần hỗ trợ đúng 23 mục trong brief §X. Ghi chú triển khai quan trọng nhất:

- **Draft không được lộ ra site**: `getHomepageInspiration()` lọc `status !== 'PUBLISHED'` trước khi trả kết quả — CMS chỉ cần đảm bảo API/DB filter tương tự, không cần logic ẩn ở tầng UI nữa.
- **Hết hạn tự ẩn, không xoá**: được mô hình hoá bằng `publishFrom`/`publishTo` — resolver so sánh với `now`, không xoá record.
- **Fallback khi placement chưa chọn**: nếu `featuredItemId` trỏ tới item không hợp lệ/hết hạn, resolver tự chọn item có `priority` cao nhất trong tập hợp lệ.
- **Homepage placement (Featured main / Supporting 1-3)**: chính là `featuredItemId` + `supportingItemIds[0..2]` trong `TravelInspirationHomepageConfig`.
- **Preview Desktop/Mobile**: ngoài phạm vi V1 (không có màn hình CMS admin trong sprint này) — cần một trang preview riêng ở sprint CMS, tái sử dụng thẳng `TravelInspirationHub`/`FeaturedInspirationVideo`/`InspirationCard` vì các component này chỉ nhận data qua props, không tự fetch.

## 5. Homepage curator contract

`getHomepageInspiration(config, items, now)` trong `lib/inspiration/inspiration-demo-data.ts` là phần "rendering logic frontend" mà brief §XI yêu cầu, không cần database:

1. `isEnabled=false` hoặc ngoài `displayFrom`/`displayUntil` → trả về rỗng (kích hoạt empty state).
2. Lọc `items` còn `status='PUBLISHED'` và trong cửa sổ `publishFrom`/`publishTo`.
3. Resolve `featuredItemId`; nếu không hợp lệ → fallback item có `priority` cao nhất trong tập đã lọc.
4. Resolve tối đa 3 `supportingItemIds`, loại bỏ item trùng với `featured`, loại id không tồn tại/không hợp lệ.
5. Trả về `{ sectionTitle, sectionSubtitle, featured, supporting }` — đây là **toàn bộ** những gì `TravelInspirationHub` biết; nó không đọc config hay danh sách item thô.

## 6. Demo content

| Item | Type | Category | Ảnh dùng |
|---|---|---|---|
| Featured | FEATURED_VIDEO | CẢM XÚC HÀNH TRÌNH | `/images/hero/ha-long-bay.jpg` (ảnh flycam Vịnh Hạ Long thật, đã dùng làm poster Hero) |
| Supporting 1 | CASE_STUDY | Company Trip | `/brand-group.webp` (đoàn khách thật tại Nhật Bản) |
| Supporting 2 | DESTINATION_STORY | Điểm đến | `/dest-thailand.webp` (chưa dùng ở section nào khác trên Homepage) |
| Supporting 3 | MICE_INSIGHT | MICE | `/enterprise-mice.webp` (khác với `/editorial-mice.webp` đã dùng ở section MICE, tránh trùng ảnh) |

Toàn bộ ảnh đã có sẵn trong `public/`, không có ảnh AI-generate, không hotlink ngoài. `demoVideoUrl` (`videoUrl` trên item featured) để `null` **có chủ đích** — dự án hiện chưa có file video "thương hiệu"/testimonial thật (chỉ có 3 video nền Hero dạng flycam loop, khác mục đích), nên FeaturedInspirationVideo/VideoModal hiển thị đúng trạng thái "Video giới thiệu Minh Việt Travel đang được cập nhật." thay vì nhúng video không liên quan.

Không có ngày/tác giả/view/rating giả ở bất kỳ item nào — đúng yêu cầu §VII.

## 7. SEO rules

- Không thêm H1 mới. `FeaturedInspirationVideo`'s title dùng **H2** (section này chưa có heading cấp section nào khác — xem lý do ở dưới), `ConsultationFormPanel`'s title cũng dùng **H2** (2 heading ngang hàng cho 2 cột, hợp lệ về semantic HTML). `InspirationCard`'s title dùng **H3** (con của khu vực Inspiration Hub).
- "Travel Inspiration Hub — Trung tâm truyền cảm hứng du lịch" là **eyebrow** (`<p>`), không phải heading — theo đúng pattern `eyebrow + <h2>` mà mọi section khác trên Homepage đã dùng (`SectionHeading`), không tạo thêm 1 cấp heading không cần thiết.
- CTA "Xem câu chuyện hành trình"/"Khám phá điểm đến"/... dùng `next/link` (`<Link>`), điều hướng được, crawl được.
- Play button trong `FeaturedInspirationVideo` là `<button>` (hành động mở modal, không điều hướng) — đúng "Button chỉ dùng cho Play/tab/action".
- Ảnh có `alt` mô tả thật (không rỗng, không "image").
- `VideoModal` có `aria-label="Video: {title}"` — accessible name cho dialog.
- Mock item có `slug` hợp lệ và `ctaUrl` trỏ route nội bộ có thật (`/mice`, `/tours`, `/brand/news`) — không route giả 404.

## 8. Performance rules

- Video: **không** mount `<video>` cho tới khi `VideoModal` mở (`open=true`) và có `videoUrl` — với demo data hiện tại (`videoUrl: null`) không có video nào từng được tải, kể cả khi bấm Play.
- Không autoplay video nền/preload — `<video>` trong `VideoModal` chỉ dùng `autoPlay` khi modal đã mở **do người dùng bấm Play** (không phải khi trang tải).
- Ảnh featured dùng `next/image` với `sizes="(min-width: 1024px) 54vw, 100vw"`; ảnh supporting dùng `sizes="260px"` cố định — không preload toàn bộ ảnh supporting (Next Image mặc định lazy-load ảnh dưới fold, không set `priority`).
- `aspect-video` (16:9) cố định trên Featured, `aspect-[4/3]` cố định trên Supporting — không có CLS khi ảnh tải xong.
- Không thêm thư viện video/animation/modal mới — `VideoModal` dùng `<dialog>` gốc của trình duyệt.

## 9. Accessibility

- Tabs: `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls`, `id` tương ứng — toàn bộ đến từ primitive `@base-ui/react/tabs` (`components/ui/tabs.tsx`), đã xác nhận qua DOM thực tế (xem Mục 14).
- Keyboard: `ArrowLeft`/`ArrowRight` di chuyển + tự kích hoạt tab (activation tự động theo WAI-ARIA APG Tabs pattern), `focus-visible` có ring rõ (`focus-visible:ring-2 ring-mv-sky-cyan/60`).
- `VideoModal`: `<dialog>` gốc — `showModal()` tự trap focus vào modal, `Escape` tự đóng (hành vi mặc định trình duyệt), backdrop click tự đóng (so sánh `e.target === dialogRef.current`), nút đóng có `aria-label="Đóng video"`.
- Contrast: chữ trên nền Deep Navy→Brand Blue đều dùng `white`/`white/78`/`mv-sky-cyan` — không dùng chữ tối trên nền tối.

## 10. Empty/error states

- **Featured null** (`getHomepageInspiration` trả `featured: null`): `TravelInspirationHub` render fallback — ảnh `/editorial-hero.webp` + overlay navy + headline "Những câu chuyện hành trình đang được cập nhật." + CTA "Khám phá tour đang mở" → `/tours`. Đã xác minh bằng code review + TypeScript (không có ảnh hưởng runtime nào phụ thuộc `featured` khác `null`); không chụp ảnh riêng vì brief đánh dấu mục này "nếu có thể".
- **Supporting rỗng**: `{supporting.length > 0 && (...)}` — không render hàng card nào, không có card rỗng, không phá bố cục (Featured Video vẫn đứng một mình, layout vẫn hợp lệ).
- **Ảnh lỗi**: dùng `next/image` như mọi ảnh khác trên Homepage — kế thừa cơ chế fallback sẵn có của dự án, không thêm xử lý riêng (đúng "dùng cơ chế tối ưu hiện có").
- **Video lỗi/chưa có URL**: giữ nguyên cover, hiển thị thông báo "Video giới thiệu Minh Việt Travel đang được cập nhật." (xem Mục 6) — không crash section, đã xác minh bằng ảnh chụp thật (`docs/sprint-ui-03/after-video-modal*.png`).

## 11. Danh sách file sửa/thêm

**Thêm mới:**
```
types/inspiration.ts
lib/inspiration/inspiration-demo-data.ts
components/homepage/consultation-forms.tsx
components/homepage/consultation-tabs.tsx
components/homepage/travel-inspiration-hub.tsx
components/homepage/featured-inspiration-video.tsx
components/homepage/inspiration-card.tsx
components/homepage/video-modal.tsx
sections/consultation-inspiration-section.tsx
```

**Xoá (thay thế hoàn toàn bởi các file trên):**
```
sections/final-cta-section.tsx
components/homepage/dual-path-cta.tsx
```

**Sửa:**
```
app/page.tsx                          (đổi import/render FinalCtaSection -> ConsultationInspirationSection)
types/homepage.ts                     (thêm field `eyebrow` vào FinalCtaContent.corporate/individual)
lib/cms/schema.ts                     (thêm z.string() `eyebrow` tương ứng)
lib/cms/content/homepage.seed.ts      (thêm eyebrow, cập nhật copy/label/cta khớp đúng brief)
```

**Không đổi (đúng phạm vi cấm):** `components/site/site-header.tsx`, `sections/hero-section.tsx`, mọi section tour, `sections/enterprise-mice-section.tsx`, `components/site/site-footer.tsx`, `lib/actions/lead-action.ts`, `hooks/use-lead-form.ts`, `lib/cms/schema.ts`'s `leadFormSchema`, Authentication, Tour Detail, CMS Admin, AI Import.

## 12. Hạng mục để Sprint Backend/CMS tiếp theo

1. Xây API/DB thật thay cho `lib/inspiration/inspiration-demo-data.ts` (giữ nguyên `types/inspiration.ts` làm hợp đồng — không đổi shape nếu không cần).
2. Màn hình CMS Admin cho 23 yêu cầu ở brief §X (list, CRUD mềm, workflow, homepage placement, preview desktop/mobile...).
3. Backend nhận rõ loại lead `ORGANIZATION`/`INDIVIDUAL` — xem Mục 13.
4. Video upload/hosting thật (hoặc xác nhận provider — YouTube/Vimeo/internal CDN) khi có video thương hiệu chính thức, gắn vào `videoUrl`/`videoProvider`/`videoDuration` của item `insp-featured-video`.
5. Trang preview Desktop/Mobile cho CMS Admin — tái sử dụng `TravelInspirationHub` (component chỉ nhận props, sẵn sàng cho việc này).

## 13. Migration/database đề xuất (chưa thực hiện)

Không tạo migration nào trong sprint này. Đề xuất cho sprint sau (chỉ mô tả, không code):

- Bảng `inspiration_items` — cột khớp 1-1 với `TravelInspirationItem` (bổ sung `id` dạng UUID, `created_at`/`updated_at` do DB quản lý).
- Bảng `inspiration_homepage_config` — 1 dòng active tại một thời điểm (hoặc theo `locale`), khớp `TravelInspirationHomepageConfig`.
- Index trên `(status, publish_from, publish_to)` cho query "eligible items" mà `getHomepageInspiration()` hiện làm bằng JS filter.
- Cân nhắc bảng `inspiration_item_gallery` riêng nếu gallery cần nhiều ảnh hơn số lượng hợp lý để nhét vào 1 cột JSON.
- Trường `intent`/lead type: xem Mục 13 kế tiếp — không phải bảng mới, chỉ là 1 cột thêm vào bảng `leads` hiện có nếu backend sprint sau muốn nhận `ORGANIZATION`/`INDIVIDUAL` tường minh thay vì `corporate`/`individual`.

### Ghi chú riêng: `ORGANIZATION`/`INDIVIDUAL` (brief §III.10)

`leadFormSchema.intent` hiện tại (`lib/cms/schema.ts`) chỉ nhận `'corporate' | 'individual'` — **không đổi** trong sprint này (đúng "không sửa logic submit hiện có"). Ở tầng component, tên `OrganizationConsultationForm`/`IndividualConsultationForm` đã tường minh hoá đúng 2 loại lead theo đúng tinh thần `ORGANIZATION`/`INDIVIDUAL` — nhưng trường `intent` thực sự gửi lên `submitLeadAction` vẫn là `corporate`/`individual` như cũ, để không phá `leadFormSchema.parse()` hiện có ở server. Backend sprint sau cần quyết định: đổi enum này thành `ORGANIZATION`/`INDIVIDUAL` (breaking change, cần cập nhật `leadFormSchema` + bất kỳ hệ thống nào đang đọc payload `intent`), hoặc giữ `corporate`/`individual` và chỉ dùng `ORGANIZATION`/`INDIVIDUAL` ở tầng hiển thị/CMS như hiện tại.

## 14. Acceptance test results

Thực hiện thủ công qua Playwright trên dev server thật (`localhost:3000`), không phải unit test framework (dự án hiện chưa có test suite cho Homepage — không có "tests hiện có liên quan" nào bị ảnh hưởng để chạy lại).

| # | Test | Kết quả |
|---|---|---|
| 1 | Tab mặc định là Doanh nghiệp/Tổ chức | ✅ `aria-selected="true"` trên tab "Doanh nghiệp / Tổ chức" khi tải trang |
| 2 | Chuyển sang Cá nhân | ✅ Click + `ArrowRight` bằng bàn phím đều chuyển đúng, `aria-selected` cập nhật |
| 3 | Chỉ một form hiển thị | ✅ `[role="tabpanel"]` không active có `hidden=true` (thuộc tính `hidden` thật, không phải CSS giả) |
| 4 | Dữ liệu 2 form không lẫn nhau | ✅ Gõ vào field "Họ và tên" ở tab Doanh nghiệp, chuyển sang Cá nhân rồi quay lại — giá trị vẫn còn nguyên (`keepMounted`) |
| 5 | Submit logic hiện tại vẫn hoạt động | ✅ `LeadForm`/`useLeadForm`/`submitLeadAction` không bị sửa; build + typecheck xác nhận không lỗi type ở chỗ gọi |
| 6 | Play video mở modal | ✅ `<dialog>.open === true`, `aria-label="Video: Kiến tạo hành trình, nâng tầm trải nghiệm"` |
| 7a | Đóng modal — nút đóng | ✅ Có nút `aria-label="Đóng video"`, xác nhận qua ảnh chụp |
| 7b | Đóng modal — Escape | ✅ Phím Escape thật (không phải dispatch synthetic) đóng dialog, `open` chuyển `false` |
| 7c | Đóng modal — click backdrop | ✅ Click vào chính phần tử `<dialog>` (không phải nội dung bên trong) đóng modal |
| 8 | Keyboard navigation của tab | ✅ Focus tab đầu, `ArrowRight` chuyển focus + kích hoạt tab thứ 2 đúng WAI-ARIA APG |
| 9 | Empty state | ✅ Xác minh bằng code review (Mục 10) — không chụp ảnh riêng |
| 10 | Mobile responsive | ✅ 390/768/1280/1440px — `scrollWidth === clientWidth` cả 4 mốc, không overflow ngang |

**Lỗi phát hiện và đã sửa trong lúc QA (trước khi coi task hoàn thành):**
- Cột trái/phải bị lệch tỷ lệ nghiêm trọng (210px/812px thay vì ~535px/629px) do CSS Grid `fr` track tôn trọng kích thước nội dung tối thiểu (min-content) của hàng supporting-card cuộn ngang — sửa bằng `[&>*]:min-w-0` trên grid cha.
- Tab pill trên mobile bị vỡ chữ (chỉ hiện "chức"/"nhân") do label dài tự xuống dòng trong khung pill có chiều cao cố định — sửa bằng `whitespace-nowrap` + cho `TabsList` cuộn ngang khi cần, thay vì ép chữ xuống dòng.

## Ảnh Before/After

Toàn bộ tại `docs/sprint-ui-03/`:
- `before-consultation-desktop.png` / `before-consultation-mobile.png` — section cũ (1 cột, 1 form)
- `after-consultation-desktop.png` — 2 cột, tab Doanh nghiệp active
- `after-consultation-individual-tab.png` — tab Khách hàng cá nhân active
- `after-consultation-tablet.png` — 768px, 1 cột
- `after-consultation-mobile-1.png` / `after-consultation-mobile-2.png` — 390px, form → hotline/zalo → Inspiration Hub
- `after-video-modal.png` / `after-video-modal-mobile.png` — trạng thái "đang được cập nhật" desktop/mobile
