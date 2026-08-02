# 11 — Sprint 5A (CMS Operations Completion): Completion Report

**Trạng thái: Code xong, verify local sạch. Chờ commit/push lên branch Preview riêng (`sprint5a-cms-operations-completion`, nhánh từ `phase4-cms-operations-v1`) — chưa commit tại thời điểm viết báo cáo này.**

Phạm vi: Founder Decisions (News public route đổi sang `/tin-tuc`, Navigation drag-and-drop được duyệt, Recycle Bin và Redirect Manager hoãn, News Categories + Featured/Hot/Pinned được thêm). Scope: Pages, News, Media, Navigation, Footer, SEO. Không đụng Homepage Builder / Tour CMS / CRM / Booking / Product CMS / Homepage dynamic rendering (Sprint 2 homepage-CMS-loader vẫn để riêng, chưa commit).

## 1. News — đổi route công khai + Categories quan hệ thật

- **Route công khai mới:** `/tin-tuc` (index, phân trang, pinned nổi lên đầu) và `/tin-tuc/[slug]` (chi tiết bài viết). `NEWS_SLUG_PREFIX` đổi từ `brand/news/` → `tin-tuc/` — không có bài viết thật nào tồn tại trước đó (0 bài, theo báo cáo Phase 4) nên không có gì cần migrate dữ liệu.
- **Trước Sprint 5A, News hoàn toàn không xem được công khai** (route `[slug]` 1-segment của Phase 4 không khớp path 2-3 segment `brand/news/...`) — đây là lỗ hổng phát hiện lúc audit, giờ đã đóng.
- **News Categories — bảng quan hệ thật, không JSON** (đúng yêu cầu Founder, đã sửa lại design so với preview đầu): `news_categories` (id, website_id, name, slug, description, icon, color, sort_order, is_active, created_at, updated_at — đúng field list Founder cho, không soft-delete) + `news_article_categories` (page_id ↔ category_id, 1 category/bài, `on delete restrict` — không phải cơ chế soft-delete, chỉ là ràng buộc toàn vẹn dữ liệu). Migration `0021_news_categories.sql` + policy `0008_news_categories_policies.sql` đã apply lên `mv-travel-os-dev`, seed 8 category mặc định đã chạy (`0015_news_categories.sql`).
- **CRUD danh mục:** `/admin/news/categories` (tạo/sửa/bật-tắt/xoá cứng — đúng quyết định #3 "keep hard delete for V1"). Gán category cho bài viết: chọn lúc tạo bài, đổi được sau qua `NewsCategoryPicker` nhúng trong editor chung (`/admin/cms/{id}`, chỉ hiện khi trang là News).
- **Featured/Hot/Pinned:** đúng quyết định #5 — thuộc về Article (nằm trong block `meta` JSON, không phải cột trên `news_categories`), có checkbox trong `NewsMetaBlockForm`, badge hiển thị trên `/tin-tuc` (Ghim/Hot).
- **Permission:** tái dùng `cms.page.update` cho toàn bộ Category CRUD + gán category — không tạo permission mới.

## 2. Pages — search/filter mở rộng

Thêm filter theo `pageType` và `status` (trạng thái version hiện tại) vào `/admin/cms`, cùng ô tìm slug đã có sẵn. Cột "Trạng thái" hiện trong bảng list (trước đây không hiện).

## 3. Media — 2 field còn thiếu

Thêm `source` (nguồn) và `licenseStatus` (tình trạng bản quyền) vào form sửa metadata trong `MediaAssetCard` — 2 field này đã có sẵn ở DB/API/schema từ trước, chỉ thiếu UI (đúng phát hiện audit).

## 4. Navigation — Drag & Drop

Thay nút lên/xuống bằng kéo-thả thật (HTML5 Drag and Drop API gốc, **không thêm thư viện npm mới**). `reorderItemsAction` mới tính lại vị trí 0..N-1 cho toàn bộ nhóm anh-em cùng cấp (cùng `parentItemId`) trong 1 lần gọi, thay vì gọi tuần tự N lần. Đúng xác nhận Founder: đây không phải Homepage/Page Builder, chỉ là sắp xếp 1 danh sách phẳng.

## 5. Footer

Không có việc riêng — Footer tiếp tục dùng chung UI Navigation Menu (menu `FOOTER`), nên tự động có drag-and-drop cùng lúc với mục 4.

## 6. SEO Center

- **OpenGraph cho route CMS generic** (`app/[slug]/page.tsx`): trước đây chỉ có title/description, giờ có đủ `openGraph` object.
- **JSON-LD generic mới:** `GenericPageJsonLd` (WebPage + BreadcrumbList) cho `app/[slug]/page.tsx`, `NewsArticleJsonLd` (Article + BreadcrumbList) cho `/tin-tuc/[slug]` — trước đây route CMS generic không phát JSON-LD nào cả.
- **Breadcrumb:** sinh tự động (Trang chủ → [Tin tức →] Tiêu đề) dưới dạng `BreadcrumbList` JSON-LD thật — **chưa** xây UI chỉnh tay `breadcrumb_config` (cột DB vẫn chưa có editor, ngoài phạm vi vòng này, để sau nếu Founder cần).
- **Sitemap:** `app/sitemap.ts` giờ liệt kê cms_pages/News đã PUBLISHED thật (trước đây chỉ có route tĩnh + vé vui chơi).
- **Analytics/GTM/Facebook Pixel — đã inject script thật:** `app/layout.tsx` đọc `analytics.ga4_measurement_id`, `analytics.gtm_container_id`, `facebook.pixel_id` và chèn đúng script chuẩn (GTM ưu tiên nếu có, ngược lại gtag.js; Pixel độc lập). **Thay đổi dữ liệu cần lưu ý:** 3 setting này trước đó có `visibility = 'INTERNAL'` (RLS chặn đọc ẩn danh) — đã đổi sang `'PUBLIC'` để trang public đọc được qua anon client. Đây là thay đổi dữ liệu đúng đắn về bảo mật, không phải hạ chuẩn: ID phân tích/pixel không bao giờ là bí mật, luôn lộ trong HTML công khai một khi đã gắn — đây chính là bước "nối vào public" mà seed comment gốc đã ghi chú là việc còn thiếu.
- **Redirect Manager:** hoãn theo quyết định #4, chuyển sang sprint SEO Center riêng — không đụng.

## Test Report

| Lệnh | Kết quả |
|---|---|
| `pnpm typecheck` | ✅ Sạch |
| `pnpm lint` | ⚠️ 3 lỗi tiền tồn tại, không liên quan Sprint 5A (giống Phase 4) |
| `pnpm test` | ✅ 30 file / 182 test pass |
| `pnpm build` | ✅ Route mới lên đủ: `/tin-tuc`, `/tin-tuc/[slug]`, `/admin/news/categories` |

## Việc không làm (đúng phạm vi đã duyệt)

- Recycle Bin/soft-delete (quyết định #3 — hoãn).
- Redirect Manager UI (quyết định #4 — chuyển sang sprint SEO Center).
- Editor chỉnh tay `breadcrumb_config`.
- Mega Menu thật nối vào `site-header.tsx` (còn hardcode `lib/site-data.ts` — ngoài phạm vi vòng này, không được nhắc lại trong quyết định Founder).
- Language Switch thật, Global SEO defaults, Version History/rollback, Autosave, Related Posts, Media drag-drop/multi-upload/folder nesting UI — đúng như đề xuất phân kỳ ở `09-sprint5-audit-and-plan.md` (Sprint 5B/5C), không nằm trong "Sprint 5A only".

## Dừng ở đây

Chưa `git add`/`commit`/`push`. Đang ở branch `sprint5a-cms-operations-completion`. Sẽ commit đúng phạm vi file Sprint 5A (loại trừ bundle Sprint 2 homepage chưa review), verify import graph closed như quy trình Phase 4, rồi push — không merge main, không deploy Production.
