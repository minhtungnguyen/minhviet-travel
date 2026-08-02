# 09 — Sprint 5 (CMS Operations Completion): Audit hiện trạng & Đề xuất phân kỳ

**Trạng thái: AUDIT + PLAN ONLY. Chưa viết code Sprint 5, chưa tạo migration nào.**

Đọc trực tiếp code (3 agent audit song song, không suy đoán) trước khi lập kế hoạch. Kết quả cho thấy: một số mục đã có sẵn (chỉ cần nối dây), một số mục **mâu thuẫn trực tiếp** với quyết định đã chốt ở Phase 4, và có **1 lỗ hổng nghiêm trọng** (News hiện không thể xem công khai) cần biết trước khi làm "News CMS đầy đủ".

## A. Phát hiện quan trọng nhất: News hiện không có URL công khai nào cả

Route generic tôi xây ở Phase 4 (`app/[slug]/page.tsx`) là dynamic segment **1 cấp** — chỉ khớp `/vi-du` (1 segment), **không khớp** `/brand/news/ten-bai-viet` (3 segment). News dùng slug `brand/news/...` (có dấu `/`) nên **hiện tại không ai xem được bài viết nào trên site thật, kể cả sau khi publish** — không lỗi, chỉ là chưa từng có route nào khớp. Đây không phải bug mới, là khoảng trống đã có từ trước, chỉ lộ ra khi audit cho Sprint 5. Toàn bộ mục "Featured Image/Related Posts/SEO" của News đều vô nghĩa cho tới khi có trang chi tiết bài viết công khai — **phải làm route `app/brand/news/[slug]/page.tsx` (hoặc đổi slug convention) trước, không sau**.

## B. Mâu thuẫn với quyết định đã chốt ở Phase 4 — cần Founder xác nhận lại

| Yêu cầu Sprint 5 | Quyết định Phase 4 trước đó | Đề xuất |
|---|---|---|
| Navigation: **Drag & Drop ordering** | "không làm drag-and-drop builder" | Diễn giải: quyết định cũ nói về **Homepage/Page Builder** (kéo-thả bố cục trang), không phải kéo-thả sắp xếp 1 danh sách phẳng (nav items). Đề xuất: **cho phép** — kéo-thả sắp xếp list là UI nhỏ, khác bản chất với page builder. Cần Founder xác nhận cách hiểu này đúng không. |
| Recycle Bin **soft delete** cho mọi thứ | `deleteAnnouncementAction`, `NavigationService.deleteMenu/deleteItem` tôi viết ở Phase 4 là **hard DELETE thật** (đã audit xác nhận — 2 bảng `announcements`, `navigation_menus`/`navigation_items` **không có cột `deleted_at`**) | Cần migration additive (thêm `deleted_at`) + đổi 3 method trên từ DELETE sang UPDATE set deleted_at + lọc lại mọi query đọc + xây UI Recycle Bin. Xem mục D.7. |
| **Redirect Manager** | Phase 4 mục 7.C founder **không liệt kê** redirects — tôi đã chủ động không xây dù service/schema đã có sẵn | Sprint 5 xin lại — **được phép làm**, không còn mâu thuẫn, chỉ ghi nhận đã đổi phạm vi. |

## C. Hiện trạng từng hạng mục (tóm tắt — chi tiết đầy đủ nằm trong audit gốc)

### 1. CMS Pages
- CRUD/Preview/SEO/workflow: **đã có** (Phase 4). Search/Filter: có filter theo `search` (slug) + phân trang, chưa có filter theo status/pageType.
- **Autosave: hoàn toàn chưa có** — mọi form đều yêu cầu bấm "Lưu" tường minh (đã audit toàn bộ 4 block-form, không có debounce/autosave nào).
- **Version History/Rollback: hoàn toàn chưa có UI** — `cms_page_versions` đã lưu đủ mọi version, nhưng `[id]/page.tsx` chỉ lấy `versions[0]` (mới nhất), không có danh sách version cũ, không có action "khôi phục".

### 2. News CMS
- Categories: chỉ là 1 field text tự do trong block `meta`, **không có bảng categories/tags** nào (đã audit toàn bộ migration, không tồn tại).
- Tags, Related Posts: **hoàn toàn chưa có** — không có bảng, không có component nào tính "related".
- **Route công khai xem 1 bài viết: chưa tồn tại** (mục A).
- Publish Workflow/SEO: dùng lại engine Pages có sẵn — đã hoạt động ở tầng admin, chỉ thiếu tầng public.

### 3. Media Library
- Folder: có bảng `media_folders` (hỗ trợ nested qua `parent_folder_id`) nhưng UI chỉ hiện folder gốc, không có rename/xoá/di chuyển asset giữa folder.
- Drag & drop upload, Multi upload: **hoàn toàn chưa có** (input file đơn, không có dropzone).
- Search: có (theo tên file), chưa tìm theo alt/caption/nguồn.
- Alt/Caption/Copyright: **đã có ở DB + API + UI** (trừ 2 field `source`/`licenseStatus` có ở DB nhưng chưa lộ ra UI).
- Replace file: **hoàn toàn chưa có** — migration đã cố tình bỏ `media_asset_versions` ("chưa cần tới khi có UI dùng"), giờ là lúc cần.
- **Không có Storage RLS policy nào trong repo, không có migration tạo bucket** — bucket `media-public`/`media-private` đang tồn tại (dùng được) nhưng có lẽ được tạo tay ngoài migration. Cần xác nhận với Founder đây có phải rủi ro bảo mật cần vá trong Sprint 5 không.

### 4. Navigation
- Header/Footer CRUD: đã có (Phase 4). Social Links: đã là settings, không phải nav item — đúng như thiết kế, giữ nguyên.
- Mega Menu: DB đã hỗ trợ nested, nhưng **UI admin chưa có ô chọn parent** (chỉ tạo được list phẳng), và **menu mega thật trên header đang hardcode 100% từ `lib/site-data.ts`**, không đọc `navigation_items` — nối dây 2 chiều (UI cho phép nested + header đọc thật) là việc thật, không nhỏ.
- Language Switch: chỉ là UI giả (tự nhận "UI-only" trong code) — đổi ngôn ngữ không đổi route/nội dung. Toàn bộ `cms_pages`/`seo_metadata`/`navigation_menus` **chỉ có dữ liệu locale 'vi'**, không có bản 'en' nào. Làm cho nó "thật" đòi hỏi nội dung song ngữ thật, không chỉ code.
- Drag & Drop ordering: xem mục B.

### 5. SEO Center
- Global SEO defaults: gần như không có — có đúng 1 setting `seo.default_og_image` không ai đọc.
- Robots/Sitemap: đã hoạt động, nhưng **sitemap không liệt kê `cms_pages`/News nào cả** (chỉ liệt kê route tĩnh + vé vui chơi).
- JSON-LD: đã có nhiều hàm riêng cho từng loại trang (Tour/Flight/Insurance...), nhưng **không có component generic tái dùng được** — trang CMS generic (`app/[slug]`) hiện không phát JSON-LD nào.
- OpenGraph: đầy đủ cho trang chủ, **thiếu ở route CMS generic** (chỉ có title/description, chưa có `openGraph` object dù cột DB đã có og_title/og_description/og_image).
- Breadcrumb: chỉ là 1 chuỗi text hiển thị, **cột `breadcrumb_config` tồn tại nhưng không ai đọc/ghi** thật.
- Analytics/GTM/Pixel: **settings đã có, nhưng không có dòng script nào inject** — nhập ID vào admin xong không có tác dụng gì trên site thật (đã grep xác nhận 0 kết quả `gtag|GTM-|fbq(`).
- Redirect Manager: service/schema đã có sẵn từ trước (Phase 4 không xây UI, giờ được phép) — chỉ thiếu UI.

### Additional requirements
- **Activity Log**: đã bao phủ đủ 100% — mọi write method của CMS/Navigation/SEO service đều gọi `auditLogger`, không có lỗ hổng nào (đã audit từng dòng).
- **Recycle Bin / soft delete**: xem mục B.
- **Version History/rollback**: xem mục C.1.

## D. Đề xuất phân kỳ (không làm hết 1 lần — quá lớn cho 1 branch/1 lần review)

**Sprint 5A — Sửa lỗ hổng + việc rẻ, rủi ro thấp (làm trước):**
1. Route public cho News (`app/brand/news/[slug]/page.tsx`) — mở khoá toàn bộ phần còn lại của News.
2. OpenGraph + JSON-LD generic cho route CMS/News (tận dụng cột DB đã có, không đổi schema).
3. Sitemap: thêm `cms_pages`/News đã PUBLISHED vào `app/sitemap.ts`.
4. Analytics/GTM/Facebook Pixel: inject script thật từ settings đã có (không đổi schema).
5. Redirect Manager UI (service/schema có sẵn, chỉ thiếu UI).
6. Media: thêm 2 field `source`/`licenseStatus` vào UI edit (đã có ở DB, chỉ thiếu ô nhập).

**Sprint 5B — Migration cần duyệt trước (giống quy trình Phase 4: audit → preview → dừng → duyệt → apply):**
7. Recycle Bin: thêm `deleted_at` cho `announcements`/`navigation_menus`/`navigation_items`, đổi 3 method delete từ hard sang soft, xây UI Recycle Bin (list + khôi phục) cho cả Pages/Announcements/Navigation.
8. Categories/Tags cho News: cần quyết định thiết kế (bảng `news_categories` + `news_tags` + junction, hay tiếp tục dùng JSON tự do có kiểm soát hơn?).
9. Media "Replace file": cần quyết định (ghi đè cùng path + không giữ lịch sử, hay tạo bảng version như migration cũ đã cân nhắc rồi bỏ?).
10. Storage RLS policy cho `media-public`/`media-private` — vá lỗ hổng bảo mật đã phát hiện.

**Sprint 5C — Tính năng lớn, cần thiết kế riêng:**
11. Version History + Rollback cho Pages/News (UI xem version cũ + action "khôi phục" = tạo version mới copy nội dung version cũ).
12. Autosave (cần chọn cơ chế: debounce bao lâu, hiển thị trạng thái "đang lưu", xử lý xung đột nếu 2 tab cùng sửa).
13. Related Posts cho News (cần thuật toán: cùng category, hay chọn tay, hay mới nhất).
14. Mega Menu thật: thêm ô chọn parent trong Navigation admin + đổi `site-header.tsx` đọc từ `navigation_items` thay vì `lib/site-data.ts`.
15. Media: folder nesting UI đầy đủ (rename/xoá/di chuyển), drag & drop, multi-upload.

**Sprint 5D — Ngoài phạm vi Sprint 5, cần dự án riêng nếu Founder muốn thật:**
16. Language Switch thật (i18n đầy đủ) — cần nội dung song ngữ thật cho toàn bộ `cms_pages`/`seo_metadata`/`navigation_menus`, không chỉ code. Đề xuất: **không làm trong Sprint 5**, để riêng thành 1 sprint i18n khi có nội dung tiếng Anh thật.
17. Global SEO defaults (org-level fallback template) — việc nhỏ, có thể gộp vào 5A nếu Founder muốn, tôi tạm để 5B do cần 1 quyết định thiết kế nhỏ (fallback ở cấp organization hay website?).

## E. Câu hỏi cần Founder quyết định trước khi bắt đầu code

1. Xác nhận cách hiểu "Drag & Drop ordering" (mục B) — sắp xếp list phẳng, không phải page builder.
2. Đồng ý thứ tự 5A → 5B → 5C, mỗi phần dừng lại để duyệt (giống Phase 4) thay vì làm hết 1 lần?
3. 5B.7 (Recycle Bin): xác nhận migration thêm `deleted_at` cho 3 bảng — sẽ trình migration preview riêng như đã làm ở Phase 4 trước khi apply.
4. 5B.8: chọn thiết kế Categories/Tags cho News (bảng riêng có kiểm soát, hay tiếp tục JSON tự do).
5. 5B.9: chọn thiết kế "Replace file" cho Media (ghi đè không lịch sử, hay có version).
6. 5D.16: xác nhận Language Switch thật **để ngoài phạm vi Sprint 5** (đúng đề xuất) hay Founder vẫn muốn 1 phần nhỏ nào đó ngay.
7. Storage RLS (5B.10): xác nhận đây là việc cần làm trong Sprint 5, không phải việc đã có sẵn ở tầng khác ngoài repo mà tôi chưa thấy.

---

**Chưa code gì.** Chờ Founder trả lời mục E, rồi tôi tạo branch (từ `phase4-cms-operations-v1`, tiếp tục không merge main) và bắt đầu đúng thứ tự 5A trước.
