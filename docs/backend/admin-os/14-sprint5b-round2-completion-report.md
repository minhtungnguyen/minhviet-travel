# 14 — Sprint 5B (round 2): Completion Report

**Trạng thái: Code xong, verify local sạch. Chờ commit/push lên CÙNG branch `sprint5b-recycle-bin-media-seo` (không tạo branch mới, đúng chỉ đạo Founder).**

## 1. Global SEO settings — mở rộng

Thêm 9 setting mới vào namespace `seo` đã có (không tạo bảng mới): `seo.site_name`, `seo.default_robots`, `seo.canonical_base_url`, `seo.twitter_card_type`, `seo.organization_name`, `seo.organization_logo`, `seo.google_site_verification`, `seo.bing_site_verification`, `seo.facebook_app_id`. Cộng 3 setting đã có từ vòng trước (`default_title_template`/`default_description`/`default_og_image`) = **12 setting SEO toàn site**, tất cả `visibility = PUBLIC` (không phải bí mật).

**Đã nối dây thật (không chỉ lưu trong DB):**
- `lib/seo/default-metadata.ts` mở rộng: `resolveDefaultSeoMetadata()` (dùng theo trang) trả thêm `robots`/`twitterCard`/`canonicalBaseUrl`/`siteName`/`organizationName`/`organizationLogo`; `resolveSiteWideSeoSettings()` mới (site-wide, không theo trang).
- `app/[slug]/page.tsx` và `app/tin-tuc/[slug]/page.tsx`: canonical URL giờ dùng `canonicalBaseUrl` (thay vì hằng số `SITE_URL` cứng), có `robots` (ưu tiên `is_indexed`/`is_followed` thật của từng trang nếu đã có `seo_metadata`, rơi về `seo.default_robots` nếu chưa có), có `twitter` card, `openGraph.siteName`.
- `GenericPageJsonLd`/`NewsArticleJsonLd` nhận thêm `baseUrl`/`organizationName`/`organizationLogo` (mặc định về hằng số `constants/seo.ts` nếu setting trống — không phá vỡ hành vi cũ).
- `app/layout.tsx`: chèn `<meta name="google-site-verification">`, `<meta name="msvalidate.01">` (Bing), `<meta property="fb:app_id">` khi có giá trị.

**Phạm vi có chủ đích không làm:** không đổi mọi nơi dùng hằng số `SITE_URL` trong toàn site (ví dụ trang chủ, các trang landing khác) — chỉ áp dụng `canonical_base_url` ở 2 route tôi đang sở hữu (`[slug]`, `tin-tuc/[slug]`). Đổi toàn site là việc lớn hơn phạm vi "SEO editor settings" được yêu cầu.

## 2. Replace File — thêm Checksum

Đã xin duyệt nhanh + apply migration nhỏ `0022_media_asset_checksum.sql` (1 cột `checksum text`, nullable, không rủi ro). SHA-256 tính phía client (Web Crypto, không round-trip qua server) — áp dụng cho **cả Replace File lẫn upload lần đầu** (nhất quán, tránh tình trạng chỉ file được thay mới có checksum). Giữ đúng danh sách Founder chốt — Keep: URL/Alt/Caption/Copyright/Folder (không đổi); Update: File Size/Mime Type/Dimensions/Checksum.

## 3. Media Usage panel

Nút "Xem nơi sử dụng" mới trên mỗi asset card. Hiện 2 loại kết quả:
- **Chính xác:** khớp trực tiếp qua `seo_metadata.og_image_media_id`/`featured_image_media_id` (cột FK thật).
- **Tương đối (best-effort):** tìm chuỗi `storage_path` trong `cms_blocks.config` (JSONB không có cột tham chiếu asset riêng, ảnh trong block lưu URL đầy đủ, không lưu asset id) — có ghi chú rõ "có thể không đầy đủ 100%" ngay trong UI, không giả vờ đây là kết quả chính xác tuyệt đối.

## 4. SEO editor: Google Search Preview + OpenGraph Preview

Thêm 2 khối xem trước sống (live) ngay trong `SeoMetadataForm`, cập nhật theo form đang gõ, không cần lưu trước mới xem được:
- **Google Search Preview:** URL + Title (xanh) + Description, đúng bố cục SERP.
- **OpenGraph Preview:** thẻ card giống Facebook/Zalo — ảnh (hoặc placeholder "Chưa có ảnh OG" vì form hiện chưa có trường chọn ảnh OG), site domain, title, description.

**Phát hiện phụ (không phải lỗi mới, chỉ ghi nhận):** `seo_metadata.og_image_media_id` là cột thật nhưng **chưa từng có UI để đặt nó** — form hiện tại không có trường chọn ảnh OG nào cả. Preview vẫn hoạt động đúng (hiện placeholder trung thực), nhưng nếu Founder muốn ảnh OG thật sự chọn được qua UI, cần thêm 1 việc riêng (mở rộng `MediaPickerInput` để trả về asset id, không chỉ URL) — ngoài phạm vi "thêm preview" được yêu cầu lần này.

## 5. Sitemap

Đã xác nhận lại: `app/sitemap.ts` (làm từ Sprint 5A) đã tự động liệt kê mọi `cms_pages`/News đã `PUBLISHED` — không có việc gì mới cần làm.

## Việc bị từ chối/ngoài phạm vi (nhắc lại)

Homepage Builder, Recycle Bin, CRM, Booking, Tour CMS — không đụng.

## Test Report

| Lệnh | Kết quả |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ⚠️ 3 lỗi tiền tồn tại, không liên quan |
| `pnpm test` | ✅ 182 test pass |
| `pnpm build` | ✅ |

---

**Dừng ở đây.** Sẽ verify import graph + isolated build rồi commit vào cùng branch `sprint5b-recycle-bin-media-seo` — không merge main, không deploy Production.
