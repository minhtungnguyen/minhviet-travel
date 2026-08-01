# 06 — Phase 4 (CMS Operations V1): Audit hiện trạng & Implementation Plan

**Trạng thái: AUDIT + PLAN ONLY. Chưa viết code Phase 4.** Điều kiện tiên quyết (RBAC gap cho SUPER_ADMIN) đã xử lý ở `docs/backend/admin-os/05-rbac-gap-report.md`.

Scope Phase 4 theo founder: Pages, Articles/News, SEO, Navigation Menu, Footer, Popup/Announcements, Publish workflow.
**Ngoài phạm vi:** Homepage Builder, CRM, Booking creation flow, Product CMS đầy đủ.

## A. Hiện trạng từng khu vực (đọc code trực tiếp, không suy đoán)

### 1. CMS Pages
Model thật và đầy đủ: `cms_pages → cms_page_versions → cms_sections → cms_blocks` (`database/migrations/0009_cms.sql`). List (`app/admin/cms/page.tsx`) và edit (`app/admin/cms/[id]/page.tsx` + `components/admin/cms-page-editor.tsx`) đã chạy thật. Publish workflow là state machine thật: `DRAFT → IN_REVIEW → APPROVED → SCHEDULED/PUBLISHED → ARCHIVED` (`modules/cms/application/cms.service.ts`), có nút submit/approve/publish/archive gate theo status.

**Thiếu:**
- Không có UI "Tạo trang mới" (service `createPage()` đã có, không có form/action nào gọi nó từ admin).
- Không có UI xoá trang (`deletePage()` có, không có nút).
- Block-type form chỉ có cho `hero`, `trustStrip`, `ceoSection` — mọi block khác rơi về JSON thô (`<pre>`, chỉ đọc, không có form biên tập thân thiện).
- `SCHEDULED` không có cơ chế tự chuyển sang `PUBLISHED` khi tới giờ — không có cron/job nào chạy việc này (comment trong code: "no scheduler required yet").

### 2. Articles/News
Không phải bảng riêng — là `cms_pages` với `slug like 'brand/news/%'` (`lib/cms/news.ts`), hiện **chỉ đọc** (dùng cho trang chủ). Không có `/admin/news` — menu sidebar đã có placeholder `comingSoon: true` (`lib/admin/nav-config.ts`). Vì News = Pages thông thường, việc thiếu UI tạo trang (mục 1) chính là lý do 0 bài viết tồn tại — không có đường nào để tạo một bài, kể cả qua admin.

### 3. SEO
`app/admin/seo/` (mới) hoạt động nhưng **cứng cho đúng 1 entity: trang chủ** (hằng số `WEBSITE_ID`/`HOME_ENTITY`). Không có bộ chọn trang khác để sửa SEO. Bảng `redirect_rules` + service `modules/seo/*` đã tồn tại, permission `seo.redirect.update` đã định nghĩa, nhưng **không có màn hình admin nào cho redirect** — 0 UI.

### 4. Navigation Menu
Không có UI admin nào, dù DB (`navigation_menus`/`navigation_items`) và API (`/api/v1/cms/navigation/...`) đã có đầy đủ, và `cms.navigation.update` đã là permission thật. Không xuất hiện trong `nav-config.ts`. Nav Footer/Header hiện chỉ được điền qua seed SQL.

### 5. Footer
`components/site/site-footer.tsx` đọc thật từ `NavigationService.getPublicMenu('FOOTER')` + `company.*` settings — không hardcode. `site-footer-minimal.tsx` chỉ là fallback tĩnh cho `error.tsx` (không dùng server code được), không phải footer thứ hai. **Không có admin editor** — sửa footer hiện phải sửa seed SQL trực tiếp.

### 6. Popup/Announcements
Đã có CRUD-lite thật: `app/admin/cms/announcements/` (list, tạo message+link, toggle ACTIVE/INACTIVE), gate bằng `cms.announcement.update`. Hiển thị public qua `announcement-modal-loader.tsx` + `announcement-modal.tsx` (dismiss 24h qua localStorage).
**Thiếu:** không sửa được message/link sau khi tạo (chỉ toggle status), không xoá được, không có UI cho `starts_at`/`ends_at` dù cột DB đã hỗ trợ.

### 7. Publish workflow
Chỉ **Pages/News** có state machine đầy đủ (draft→review→approve→publish/schedule→archive). Announcements chỉ có ACTIVE/INACTIVE. SEO metadata, Navigation, Footer **không có khái niệm trạng thái** — lưu là hiệu lực ngay lập tức.

### 8. Media (hạ tầng dùng chung, không phải mục riêng của Phase 4)
`components/admin/media-picker-input.tsx` đã tái sử dụng đúng module Media Library có sẵn (`app/admin/media`, `modules/media/*`), đã gắn vào form Hero/CEO/partner-logo. Không cần hạ tầng mới.

## B. Quyết định đã chốt (Founder)

1. **Scheduler:** thủ công (Phương án 1) — action "Kiểm tra lịch xuất bản" trong Admin CMS, không dùng Vercel Cron / pg_cron ở Phase 4. Spec đầy đủ ở mục D.7.
2. **Publish scope:** giữ đơn giản cho V1 — chỉ Pages/News dùng state machine draft→review→approve→publish/schedule→archive đầy đủ. Announcements/Navigation/Footer/SEO giữ nguyên cơ chế hiện có (lưu = hiệu lực ngay, hoặc ACTIVE/INACTIVE).
3. **Block editing scope:** chỉ cần Create/Delete cho Pages + 1 block-type form mới cho `meta` (News). Không mở rộng form cho các block-type khác (hero/trustStrip/ceoSection giữ nguyên, phần còn lại tiếp tục JSON thô).

## C. Điểm cần xác nhận thêm trước khi code (phát sinh khi thiết kế chi tiết scheduler)

Yêu cầu #3 của scheduler ("ghi `published_by` nếu có actor") — **cột `published_by` không tồn tại** trên `cms_page_versions` (chỉ có `created_by`, xem `database/migrations/0009_cms.sql:47-58`). Hai lựa chọn:

- **(a) Không thêm cột — dùng `audit_logs.actor_user_id` đã có sẵn.** Mọi lần transition (kể cả publish tự động qua scheduler) đã tự động ghi `auditLogger({ actorUserId: actor.userId, action: 'cms.page_version.published', ... })` (`cms.service.ts:172-181`) — "ai publish, lúc nào" đã có sẵn trong audit log, không cần cột mới, không cần migration.
- **(b) Thêm cột `published_by uuid references auth.users(id)`** vào `cms_page_versions` — additive migration, tra cứu nhanh hơn (không cần join `audit_logs`) nhưng là thay đổi schema thật.

Đề xuất **(a)** — không có nhu cầu nghiệp vụ nào ở brief đòi hỏi query nhanh theo `published_by` riêng, và tránh migration không cần thiết. Nếu Founder muốn (b), nêu rõ để bổ sung vào migration trước khi code Phase 4.

## D. Implementation plan (đầy đủ, theo thứ tự phụ thuộc)

### D.1 Pages — Create + Delete UI
- Thêm form "Tạo trang mới" (title, slug, website) trong `app/admin/cms/`, gọi thẳng `createPage()` (đã có, `cms.service.ts:68`).
- Thêm nút xoá trang (confirm dialog) gọi `deletePage()` (đã có, `cms.service.ts:108`). Gate `cms.page.delete` (đã có permission).
- Không đổi service layer — chỉ thêm route/form/action ở tầng UI.
- Khoá phụ thuộc cho D.2.

### D.2 Articles/News
- Route `/admin/news` (bỏ `comingSoon` ở `lib/admin/nav-config.ts:33`), tái dùng UI D.1 với validation `slug` bắt buộc prefix `brand/news/%`.
- 1 block-type form mới: `meta` (category, excerpt, image, size) — theo đúng field `lib/cms/news.ts` đang đọc. Tái dùng `media-picker-input.tsx` đã có cho trường `image`.
- Không đổi `lib/cms/news.ts` (đọc dữ liệu, giữ nguyên).

### D.3 SEO — gỡ hardcode 1-entity
- Thêm bộ chọn trang (từ `cms_pages` list) vào `app/admin/seo/page.tsx`, thay hằng số `HOME_ENTITY`/`WEBSITE_ID` bằng tham số động (`entityId` từ query string hoặc dropdown).
- `seo-metadata-form.tsx` và `updateSeoMetadataAction` giữ nguyên logic, chỉ nhận `entityId` động thay vì hardcode.
- Không đổi schema (`seo_metadata` đã hỗ trợ nhiều entity).

### D.4 SEO Redirects — màn hình mới
- List/create/deactivate `redirect_rules`, tái dùng service có sẵn ở `modules/seo/*`.
- Gate `seo.redirect.update`. Route mới, ví dụ `app/admin/seo/redirects/`.

### D.5 Navigation Menu — màn hình admin mới
- List menu (HEADER/FOOTER), sửa items (label/href/order/parent) qua API có sẵn `/api/v1/cms/navigation/*`.
- Gate `cms.navigation.update`. Thêm entry vào `lib/admin/nav-config.ts`.

### D.6 Footer
- Không cần model/editor riêng — một khi D.5 xong, sửa menu `FOOTER` chính là sửa footer. Không có việc riêng ở mục này.

### D.7 Popup/Announcements — mở rộng panel có sẵn
- Thêm sửa `message`/`linkHref` sau khi tạo (hiện chỉ toggle status) — mở rộng `announcements-panel.tsx` + action tương ứng trong `cms.service.ts` (dùng lại `requirePermission(actor, 'cms.announcement.update')` đã có ở dòng 360/376).
- Thêm xoá.
- Thêm 2 field `starts_at`/`ends_at` vào form (cột DB đã hỗ trợ, `0009_cms.sql:110-123`).

### D.8 Publish Scheduler V1 (thủ công) — spec đầy đủ theo yêu cầu Founder

**Vị trí:** action mới "Kiểm tra lịch xuất bản" trong `app/admin/cms/` (ví dụ nút ở trang list Pages, hoặc trang riêng `app/admin/cms/scheduler/`).

**Gate quyền:** chỉ actor có `cms.page.publish` mới chạy được (permission publish hiện hữu, không tạo permission mới).

**Logic server action/API (idempotent):**
1. Query `cms_page_versions` where `status = 'SCHEDULED'` and `scheduled_publish_at <= now()`.
2. Với mỗi bản ghi due: chuyển `status → PUBLISHED`, set `is_current = true` (unset current cũ của cùng `page_id` trước, đúng pattern hai bước đã có ở `transition()` dòng 163-169), set `published_at = now()`.
3. Ghi "ai publish" — dùng `audit_logs` sẵn có (mục C phương án a): `auditLogger({ actorUserId: actor.userId, action: 'cms.page_version.published', entityId: versionId, ... })`, tái dùng nguyên `auditLogger` đã tiêm vào `CmsService`.
4. Cập nhật `updated_at` (đã có trigger `set_updated_at` tự động, không cần code thêm).
5. Idempotent theo thiết kế: query lọc đúng `status = 'SCHEDULED'` nên bản ghi đã `PUBLISHED`/`ARCHIVED` không bao giờ bị chọn lại ở lần chạy sau; bản ghi chưa đến hạn (`scheduled_publish_at > now()`) không nằm trong tập kết quả.
6. Trả về 3 số: **đã publish**, **chưa đến hạn** (còn lại trong tập `SCHEDULED` nhưng chưa due — để hiển thị cho admin biết còn gì đang chờ), **lỗi** (nếu 1 bản ghi lỗi transition, ví dụ `assertTransition` fail vì trạng thái đã đổi giữa lúc query và lúc update — không chặn các bản ghi khác, gom lỗi để báo cáo).
7. UI có bước xác nhận (confirm dialog) trước khi chạy, hiển thị số lượng due sẽ bị ảnh hưởng trước khi admin bấm xác nhận cuối.

**Không làm:** không thêm Vercel Cron, không bật pg_cron, không thêm bất kỳ job nền tự động nào ở Phase 4.

**Ghi chú bắt buộc trong tài liệu/README liên quan:** "CMS Scheduler V1 uses manual due-item processing. Automated scheduling is deferred."

**Verify sau khi code xong toàn bộ Phase 4:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` — cả 4 phải sạch, theo đúng chuẩn đã áp dụng ở Phase 3 (`docs/backend/admin-os/04-dashboard-v1-report.md`).

## E. Ngoài phạm vi (nhắc lại, không làm ở Phase 4)
Homepage Builder, CRM, Booking creation flow, Product CMS đầy đủ, mọi cơ chế tự động hoá lịch xuất bản (cron), state machine draft→publish cho Announcements/Navigation/Footer/SEO, form block-type ngoài hero/trustStrip/ceoSection/meta.

---

**Dừng ở đây — chờ Founder duyệt plan đầy đủ ở mục D trước khi bắt đầu code toàn bộ module Phase 4**, và xác nhận lựa chọn ở mục C (`published_by`: audit log vs cột mới).
