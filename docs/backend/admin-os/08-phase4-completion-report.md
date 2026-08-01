# 08 — Phase 4 (CMS Operations V1): Completion Report

**Trạng thái: Code xong, đã verify local (typecheck/lint/test/build). Chưa commit, chưa deploy Preview, chưa push Production — chờ xác nhận trước khi commit/push.**

Điều kiện tiên quyết đã hoàn tất trước khi code: RBAC gap cho SUPER_ADMIN (`05-rbac-gap-report.md`, đã apply), migration metadata cho `cms_page_versions` (`07-phase4-metadata-migration-preview.md`, đã apply).

---

## 1. CMS Architecture Report

### 1.1 Record metadata vs Audit trail (mục 4 yêu cầu Founder) — đã tách biệt

- **Record metadata** (sống trên chính bản ghi `cms_page_versions`): `created_by/created_at` (đã có từ trước), `updated_by/updated_at` (mới — cột + trigger `set_updated_at`), `reviewed_by/reviewed_at` (mới — set khi transition sang `APPROVED`), `published_by` (mới — set khi transition sang `PUBLISHED`; `published_at` đã có sẵn từ trước).
- **Audit trail** (`audit_logs`, không đổi): mọi transition (`submit-review`, `approve`, `publish`, `archive`, tạo/xoá page, tạo/sửa/xoá announcement, tạo/sửa/xoá navigation menu/item, cập nhật SEO) tiếp tục ghi qua `auditLogger` — không service method Phase 4 nào bỏ qua audit log.
- Hai luồng ghi độc lập nhau trong `CmsService.transition()`: `metadataExtra` (cột bản ghi) và `auditLogger(...)` (lịch sử) là 2 lệnh riêng, không lệnh nào suy ra từ lệnh kia.

### 1.2 Pages (`app/admin/cms/`)
- **Có sẵn từ trước, không đổi:** state machine `DRAFT → IN_REVIEW → APPROVED → SCHEDULED/PUBLISHED → ARCHIVED`, block-type form cho `hero/trustStrip/ceoSection`.
- **Mới:** Create (`/admin/cms/new`, gọi `createPageWithDraftVersion`), Delete (`deletePageAction`, soft-delete qua `deleted_at` — đúng "Delete/Archive" tách biệt với "Lưu trữ" = archive trạng thái version), Preview (`/admin/cms/[id]/preview`, render latest version bất kể status), SEO fields (nhúng `SeoMetadataForm` ngay trong editor, `entityType='cms_page'`).
- **Phát hiện kiến trúc quan trọng (đã hỏi Founder trước khi code):** trước Phase 4, không có route Next.js nào render một `cms_pages` bất kỳ ngoài trang chủ (`app/page.tsx`, hardcode). Founder chọn phương án xây route generic — xem mục 1.4.
- **Không làm** (đúng quyết định Founder): không có form block-type nào khác ngoài `hero/trustStrip/ceoSection/meta`; các block khác vẫn dùng JSON thô như trước.

### 1.3 News (`app/admin/news/`)
- News **vẫn là `cms_pages`** với `slug` bắt đầu `brand/news/` (không bảng riêng, không đổi `lib/cms/news.ts`).
- Mới: List (lọc theo slug prefix), Create (`createNewsArticleAction` — tạo page + version DRAFT + section `meta` + block `CUSTOM` rỗng trong 1 lần gọi), chỉnh sửa tiếp tục qua route Pages có sẵn (`/admin/cms/{id}`) — không có editor riêng cho News.
- **1 block-type form mới theo đúng phạm vi đã duyệt:** `NewsMetaBlockForm` (category/excerpt/ảnh/size) — khớp field `lib/cms/news.ts` đang đọc.
- `pageType: 'CUSTOM'` cho bài viết đơn lẻ — enum không có giá trị "1 bài viết", `ARTICLE_INDEX` nghĩa là trang danh sách, không phải 1 bài.

### 1.4 Route công khai generic (`app/[slug]/page.tsx`) — hạ tầng mới, không phải Homepage Builder
- Render bất kỳ `cms_pages` nào đã `PUBLISHED` (trừ `home`, dành riêng cho `/`), dùng `CmsGenericPageRenderer` (component mới, `components/site/cms-generic-page-renderer.tsx`).
- Chỉ hỗ trợ 3 block-type có shape an toàn đã biết: `RICH_TEXT`, `IMAGE`, `CTA` (đã tồn tại sẵn trong `cms_block_definitions`, không thêm định nghĩa mới). Block-type khác bị bỏ qua khi render công khai — không đoán shape của JSON tuỳ ý (đúng nguyên tắc "không render arbitrary JSON như HTML thô", master-prompt §8.7).
- Admin Preview (`/admin/cms/[id]/preview`) dùng lại đúng component renderer này cho version mới nhất bất kể status.

### 1.5 SEO (`app/admin/seo/`)
- Từ "cứng 1 entity (trang chủ)" → chọn bất kỳ `cms_page` nào qua dropdown (`?entityId=`). Không đổi schema/service — `seo_metadata` đã hỗ trợ nhiều entity từ trước.
- `SeoMetadataForm` giờ nhận `metadata: SeoMetadata | null` — hỗ trợ tạo mới (chưa có row) lẫn sửa (đã có row), dùng chung `putMetadata()` (upsert có sẵn).
- Validation: `updateSeoMetadataAction` giờ chạy `seoMetadataPutSchema.parse()` tường minh (trước đây chỉ có type, không có runtime check ở tầng Server Action).
- Redirects (`redirect_rules`): **không xây** — brief chính thức mục 7.C chỉ liệt kê "Single entity configuration, Save = Apply immediately, Validation, Audit log", không có redirects. Giữ nguyên hiện trạng (service/schema đã có, không UI).

### 1.6 Navigation (`app/admin/navigation/`) — mới hoàn toàn (UI)
- CRUD menu (tạo menu còn thiếu theo key chuẩn) + item (label, target = trang CMS hoặc URL tự do, parent, thứ tự, active/inactive).
- Ordering: nút lên/xuống hoán vị `position` (giống pattern `moveSectionAction` đã có ở Pages) — không kéo-thả (đúng loại trừ "không làm drag-and-drop builder").
- "Prevent invalid or dead routes where possible": target = trang CMS chọn từ danh sách thật (không thể trỏ tới trang không tồn tại); target = URL tự do được validate định dạng phải bắt đầu `/` hoặc `http(s)://` (`assertPlausibleUrl` ở action layer) — không thể kiểm chứng URL ngoài có "sống" hay không, đúng giới hạn "where possible".

### 1.7 Footer — không có màn hình riêng (theo đúng audit)
- Cột link Footer = menu `FOOTER` → sửa qua chính UI Navigation Menu (1.6).
- Thông tin liên hệ/mạng xã hội = `company.*` settings → đã sửa được từ trước qua `/admin/settings` (đã xác nhận đủ 8 key `company.*` tồn tại, kể cả `social_youtube/linkedin` mới thêm ở seed 0013).
- Không còn "seed-only editing": cả 2 nguồn dữ liệu Footer đọc đều có UI ghi thật.

### 1.8 Announcements (`app/admin/cms/announcements/`)
- Mới: sửa `message/linkHref/startsAt/endsAt` sau khi tạo (trước chỉ toggle status), xoá (`deleteAnnouncementAction` — repository/service method mới, trước đây không tồn tại), thêm field `startsAt/endsAt` vào cả form tạo và sửa (cột DB đã có từ trước, chỉ thiếu UI).
- Không có state machine — giữ `ACTIVE/INACTIVE` như quyết định Founder.

### 1.9 Scheduler V1 (`app/admin/cms/scheduler/`)
- Thủ công hoàn toàn: không cron, không job nền. Màn hình hiện số "đã đến hạn"/"chưa đến hạn" trước, có `window.confirm()` trước khi chạy, sau khi chạy hiện số đã publish/còn lại/lỗi.
- Idempotent theo thiết kế: `listDueScheduledVersions` chỉ lấy `status = 'SCHEDULED'` — bản ghi đã `PUBLISHED` (do lần chạy trước hoặc do publish thủ công ở nơi khác) không bao giờ được chọn lại.
- Ghi `published_by` (record metadata) + audit log `cms.page_version.published` — tái dùng đúng `transition()`/`publish()` đã có, không code đường ghi riêng.
- Đúng ghi chú bắt buộc: **CMS Scheduler V1 uses manual due-item processing. Automated scheduling is deferred.**

---

## 2. RBAC matrix áp dụng cho Phase 4

Permission dùng bởi màn hình mới/mở rộng — tất cả đã tồn tại từ trước, **không tạo permission mới**:

| Màn hình | Permission | SUPER_ADMIN |
|---|---|---|
| Pages Create/Delete/Preview/SEO | `cms.page.create` / `cms.page.delete` / `cms.page.read` / `seo.metadata.update` | ✅ (33/33, xem `05-rbac-gap-report.md`) |
| News Create/List | `cms.page.create` / `cms.page.read` | ✅ |
| SEO entity picker | `seo.metadata.update` | ✅ |
| Navigation Menu | `cms.navigation.update` | ✅ |
| Announcements edit/delete | `cms.announcement.update` | ✅ |
| Scheduler V1 | `cms.page.publish` | ✅ |

Không đụng `roles`/`permissions`/`role_permissions` nào khác ngoài patch đã duyệt ở `05-rbac-gap-report.md`. ADMIN vẫn còn gap `attraction_ticket.*` (không thuộc phạm vi Phase 4, đã ghi nhận riêng).

---

## 3. Test Report

| Lệnh | Kết quả |
|---|---|
| `pnpm typecheck` | ✅ Sạch |
| `pnpm lint` | ⚠️ 3 lỗi — **tiền tồn tại, không liên quan Phase 4** (`app/admin/audit-logs/page.tsx`, `components/site/login-form.tsx` — dùng `<a>` thay vì `<Link>`, không phải file Phase 4 chạm tới) |
| `pnpm test` | ✅ 30 test file / 182 test, pass 100% (bao gồm test fixture `cms.service.test.ts` đã cập nhật cho field metadata mới) |
| `pnpm build` | ✅ Build thành công, tất cả route mới lên đúng (`/[slug]`, `/admin/cms/new`, `/admin/cms/[id]/preview`, `/admin/cms/scheduler`, `/admin/navigation`, `/admin/news`, `/admin/news/new`), không route nào xung đột với route tĩnh có sẵn |

**Giới hạn đã biết — chưa test qua browser với tài khoản thật:** giống tiền lệ đã ghi ở `02-auth-verification-report.md`/`03-admin-shell-report.md`, không có tài khoản dev/test nào có mật khẩu đã biết (SUPER_ADMIN thật đặt mật khẩu qua `/forgot-password`, cố ý không test bằng email thật để tránh gửi email ngoài ý muốn). Đã smoke-test không cần đăng nhập: `GET /` và các route `/admin/*` mới đều trả về đúng hành vi (200 cho public, 307 redirect sang login cho admin chưa đăng nhập, không có lỗi 500 nào trong log dev server). **Chưa click-through được các luồng thật (tạo trang, xuất bản, kéo item nav...) bằng UI thật** — cần Founder tự đăng nhập để xác nhận.

---

## 4. Security Review (tự rà soát)

| Hạng mục | Kết quả |
|---|---|
| SQL injection | Không có SQL thô ở code mới — 100% qua Supabase query builder (`.eq/.lte/.gt/...`), giống pattern toàn bộ codebase |
| XSS / raw HTML | `CmsGenericPageRenderer` không dùng `dangerouslySetInnerHTML` ở đâu cả — `RICH_TEXT` tách đoạn văn bằng `.split()` rồi render trong `<p>` (React tự escape), đúng master-prompt §8.7 |
| Authorization | Mọi service method mới (`createPageWithDraftVersion`, `getPreviewContent`, `deleteAnnouncement`, `previewScheduledPublish`, `runScheduledPublish`) đều gọi `requirePermission`/`checkWebsiteAccess` trước khi đọc/ghi — không có method nào bỏ qua permission check |
| Mass assignment | Input Server Action đều gõ theo type suy ra từ Zod schema; riêng SEO đã thêm `.parse()` tường minh (mục 1.5) để chặn payload sai định dạng thay vì chỉ tin tưởng TypeScript |
| IDOR (truy cập chéo website) | Preview (`getPreviewContent`) và Scheduler (`runScheduledPublish`) đều gọi `checkWebsiteAccess` — actor không có quyền trên website khác sẽ bị chặn |
| Open redirect / dead link | `assertPlausibleUrl` chặn navigation item trỏ tới chuỗi không phải `/...` hay `http(s)://...` |
| Secrets | Không có key/secret nào được thêm vào code hay commit trong Phase 4 |

Không phát hiện lỗ hổng mới. Rủi ro còn lại giống toàn bộ codebase hiện có (ví dụ: chưa có rate-limiting ở Server Action, đã là hiện trạng từ trước Phase 4, ngoài phạm vi).

---

## 5. Việc không làm (đúng phạm vi đã duyệt)

- Homepage Builder, CRM, Booking creation flow, Product CMS đầy đủ, Automation, AI, drag-and-drop builder — không đụng.
- SEO Redirects UI — brief chính thức không yêu cầu (khác với audit-plan sơ bộ ở `06-...md`).
- Form block-type khác ngoài `hero/trustStrip/ceoSection/meta`.
- State machine draft→publish cho Navigation/Footer/SEO/Announcements — giữ đơn giản theo quyết định Founder.
- Cron/pg_cron cho Scheduler — thủ công theo quyết định Founder.
- Sửa gap `attraction_ticket.*` cho ADMIN — ngoài phạm vi Phase 4 theo quyết định RBAC.

## 6. File thay đổi (tóm tắt)

**Migration/seed:** `database/migrations/0020_cms_page_version_metadata.sql` (đã apply), `database/seeds/0014_super_admin_attraction_ticket_grant.sql` (đã apply), `shared/supabase/database.types.ts` (regenerate).

**Service/repository:** `modules/cms/domain/types.ts`, `modules/cms/infrastructure/cms.repository.ts`, `modules/cms/application/cms.service.ts`, `modules/cms/application/cms.service.test.ts`.

**Pages/News:** `app/admin/cms/actions.ts`, `app/admin/cms/page.tsx`, `app/admin/cms/new/page.tsx`, `app/admin/cms/[id]/page.tsx`, `app/admin/cms/[id]/preview/page.tsx`, `app/admin/news/*` (mới), `components/admin/cms-page-editor.tsx`, `components/admin/cms-page-create-form.tsx` (mới), `components/admin/news-article-create-form.tsx` (mới), `components/admin/blocks/news-meta-block-form.tsx` (mới), `components/admin/seo-metadata-form.tsx`, `lib/cms/news-constants.ts` (mới), `lib/cms/news.ts`.

**Route công khai:** `app/[slug]/page.tsx` (mới), `components/site/cms-generic-page-renderer.tsx` (mới).

**SEO:** `app/admin/seo/page.tsx`, `app/admin/seo/actions.ts`.

**Navigation:** `app/admin/navigation/*` (mới), `components/admin/navigation-editor.tsx` (mới), `components/admin/admin-icon-map.ts`, `lib/admin/nav-config.ts`.

**Announcements:** `app/admin/cms/announcements/actions.ts`, `components/admin/announcements-panel.tsx`.

**Scheduler:** `app/admin/cms/scheduler/*` (mới), `components/admin/scheduler-panel.tsx` (mới).

---

## Dừng ở đây — chờ xác nhận trước khi commit/push

Chưa `git add`/`git commit`/`git push` bất kỳ file nào ở Phase 4. Theo mục 10 brief ("deploy Preview, không push Production"), cần Founder xác nhận để tôi commit và push lên nhánh Preview.
