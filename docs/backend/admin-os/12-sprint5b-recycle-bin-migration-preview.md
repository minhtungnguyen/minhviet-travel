# 12 — Sprint 5B: Recycle Bin Migration Preview

**Trạng thái: TỪ CHỐI (KHÔNG DUYỆT). File migration `0022_recycle_bin.sql` đã bị xoá khỏi repo — không áp dụng.**

Founder quyết định: Recycle Bin **không** làm ở Sprint 5 — giữ V1 đơn giản (hard delete + confirmation dialog + audit log là đủ). Recycle Bin/soft-delete/restore/purge sẽ làm cùng lúc với Version History & Rollback ở 1 sprint sau. Không tạo cột `deleted_at`, không sửa RLS, không đổi hành vi delete. Giữ nguyên tài liệu này chỉ để ghi lại thiết kế đã cân nhắc, phòng khi sprint sau cần tham khảo lại.

Founder đã hoãn Recycle Bin ở Sprint 5A (quyết định #3: "keep hard delete for V1... Soft delete will be implemented in a later sprint"). Đây là sprint đó.

## Hiện trạng (đã audit ở Sprint 5A)

| Bảng | Có `deleted_at`? | Delete hiện tại |
|---|---|---|
| `cms_pages` | ✅ Có sẵn (Phase 4) | Soft delete đã hoạt động (`deletePage`), nhưng **chưa có UI Recycle Bin / restore** |
| `announcements` | ❌ Không có | Hard `DELETE` thật (`deleteAnnouncement`) |
| `navigation_menus` | ❌ Không có | Hard `DELETE` thật (`deleteMenu`) |
| `navigation_items` | ❌ Không có | Hard `DELETE` thật (`deleteItem`) |

## Migration preview (`database/migrations/0022_recycle_bin.sql`)

```sql
alter table announcements add column deleted_at timestamptz;
alter table navigation_menus add column deleted_at timestamptz;
alter table navigation_items add column deleted_at timestamptz;

alter policy "public_read_live_announcements" on announcements
  using (status = 'ACTIVE' and deleted_at is null and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
alter policy "public_read_active_menus" on navigation_menus
  using (status = 'ACTIVE' and deleted_at is null);
alter policy "public_read_active_items" on navigation_items
  using (status = 'ACTIVE' and deleted_at is null);
```

Không `DROP`, không `DELETE`. Chỉ thêm cột + sửa 3 policy public-read để loại trừ hàng đã xoá mềm — đúng pattern `cms_pages` đã dùng từ Phase 4 (`public_read_pages_with_published_version` đã lọc `deleted_at is null`). Policy `staff_write_*`/`staff_read_all_pages` **không đổi** — staff vẫn thấy được hàng đã xoá mềm, đúng yêu cầu để màn hình Recycle Bin hoạt động.

## Kế hoạch code sau khi duyệt (không tạo permission mới — tái dùng permission xoá hiện có của từng module)

- `deleteAnnouncement`/`deleteMenu`/`deleteItem`: đổi từ `.delete()` sang `update({deleted_at: now()})`.
- Thêm `restoreAnnouncement`/`restoreMenu`/`restoreItem` (set `deleted_at = null`) + `restorePage` (CmsService đã có `softDeletePage`, thiếu chiều ngược lại).
- `listAnnouncements`/`listMenus`/`listItems` (dùng ở màn hình quản lý bình thường): thêm lọc `deleted_at is null` — nếu không, xoá xong vẫn hiện trong danh sách chính, phản tác dụng.
- Màn hình mới `/admin/recycle-bin`: liệt kê Pages + Announcements + Navigation đã xoá mềm, nút "Khôi phục" cho từng loại.
- Audit log: `cms.page.restored`, `cms.announcement.restored`, `navigation.menu.restored`, `navigation.item.restored`.

## Safety report

| Rủi ro | Đánh giá |
|---|---|
| Cột mới trên bảng có dữ liệu thật | `announcements`/`navigation_menus`/`navigation_items` đều đang có vài dòng thật (menu HEADER/FOOTER, item thật) — `ADD COLUMN ... timestamptz` không mặc định giá trị, an toàn, không rewrite bảng, mọi dòng hiện có tự động `deleted_at = null` (đúng ý nghĩa "chưa xoá") |
| RLS | Sửa 3 policy public-read bằng `ALTER POLICY` — chỉ đổi điều kiện `using`, không đổi quyền truy cập nào khác. Trước khi sửa: hàng có `status='ACTIVE'` luôn hiện công khai. Sau khi sửa: thêm điều kiện `deleted_at is null` — hàng hiện tại toàn bộ có `deleted_at = null` nên **không có hàng nào bị ẩn thêm ngay sau khi apply** |
| Ảnh hưởng code hiện tại | `deleteAnnouncement`/`deleteMenu`/`deleteItem` sẽ đổi hành vi (soft thay vì hard) — cần sửa cùng lúc với migration để tránh khoảng trống (xoá xong nhưng không có UI Recycle Bin để thấy) |

## Rollback plan

```sql
alter policy "public_read_live_announcements" on announcements
  using (status = 'ACTIVE' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
alter policy "public_read_active_menus" on navigation_menus
  using (status = 'ACTIVE');
alter policy "public_read_active_items" on navigation_items
  using (status = 'ACTIVE');

alter table announcements drop column if exists deleted_at;
alter table navigation_menus drop column if exists deleted_at;
alter table navigation_items drop column if exists deleted_at;
```

An toàn — không có dữ liệu nào lưu trong cột trước khi rollback (mọi hàng vẫn `null` nếu chưa từng dùng tính năng xoá mềm mới).

---

**Dừng ở đây — chờ duyệt trước khi `apply_migration` và code phần còn lại.**
