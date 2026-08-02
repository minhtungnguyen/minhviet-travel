# 13 — Sprint 5B (continued CMS Operations Completion): Completion Report

**Trạng thái: Code xong, verify local sạch. Chờ commit/push lên branch riêng (`sprint5b-recycle-bin-media-seo`, nhánh từ `sprint5a-cms-operations-completion`) — chưa commit tại thời điểm viết báo cáo.**

Phạm vi vòng này (theo quyết định Founder, "Continue Sprint 5A", loại Recycle Bin khỏi phạm vi):

## 1. Recycle Bin — TỪ CHỐI, không làm

Founder quyết định giữ V1 đơn giản: hard delete + confirmation dialog + audit log là đủ. Recycle Bin/soft-delete/restore/purge sẽ làm cùng Version History & Rollback ở sprint sau. **Không có thay đổi DB nào** cho mục này — file migration nháp đã bị xoá khỏi repo, không apply. Chi tiết ở `docs/backend/admin-os/12-sprint5b-recycle-bin-migration-preview.md` (đánh dấu TỪ CHỐI).

## 2. Media — Replace File (ghi đè, không giữ lịch sử)

- `MediaAssetCard` có nút "Thay tệp" mới (có confirm dialog cảnh báo không thể khôi phục) — upload file mới đè lên đúng `storage_path` cũ (Supabase Storage `upload(..., { upsert: true })`), giữ nguyên `id`/URL/alt/caption/credit/copyright/source/license — chỉ cập nhật metadata kỹ thuật thực sự đổi (mime type, dung lượng, kích thước ảnh).
- Mở rộng `mediaAssetUpdateSchema`/`MediaRepository.updateAsset` để nhận `originalFilename`/`mimeType`/`fileSizeBytes`/`width`/`height` — trước đây chỉ sửa được các field mô tả (alt/caption/...), không sửa được metadata kỹ thuật.
- Không có bảng `media_asset_versions` nào được tạo — đúng lựa chọn "ghi đè, không lịch sử".

## 3. SEO — Global Defaults (cấp Website)

- 2 setting mới trong namespace `seo` đã có sẵn: `seo.default_title_template` (hỗ trợ placeholder `{title}`), `seo.default_description`. Tái dùng `seo.default_og_image` đã tồn tại từ trước (trước đây không ai đọc, giờ đã nối dây thật).
- Cả 3 setting đổi `visibility` từ `INTERNAL` → `PUBLIC` (cùng lý do như Analytics/GTM/Pixel ở Sprint 5A: không phải bí mật, phải lộ ra `<head>` công khai mới có tác dụng).
- Helper mới `lib/seo/default-metadata.ts` (`resolveDefaultSeoMetadata`) — dùng khi 1 trang **chưa có `seo_metadata` riêng**: sinh title theo template, description/OG image từ default toàn site thay vì chỉ hiện tiêu đề trơn như trước.
- Đã nối vào cả `app/[slug]/page.tsx` và `app/tin-tuc/[slug]/page.tsx`. Trang **đã có** `seo_metadata` riêng không bị ảnh hưởng — chỉ trang chưa có mới dùng fallback này.
- Không tạo bảng mới — đúng lựa chọn tái dùng `setting_definitions`/`setting_values` đã có.

## Test Report

| Lệnh | Kết quả |
|---|---|
| `pnpm typecheck` | ✅ Sạch |
| `pnpm lint` | ⚠️ 3 lỗi tiền tồn tại, không liên quan (giống Phase 4/Sprint 5A) |
| `pnpm test` | ✅ 30 file / 182 test pass |
| `pnpm build` | ✅ |

## Việc không làm (đúng phạm vi đã duyệt)

Recycle Bin, Version History/Rollback, Autosave, Related Posts, Mega Menu thật, Media drag-drop/multi-upload/folder-nesting UI, Language Switch thật — đều ngoài phạm vi 2 vòng Sprint 5A/5B, để dành sprint sau theo đề xuất phân kỳ gốc.

---

**Dừng ở đây.** Chưa commit/push. Sẽ verify import graph + isolated build như 2 vòng trước rồi mới commit — không merge main, không deploy Production.
