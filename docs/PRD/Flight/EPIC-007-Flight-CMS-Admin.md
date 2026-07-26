# EPIC-007 – Flight CMS & Admin

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-007-Flight-CMS-Admin.md`

---

## 1. Mục tiêu

Xây dựng khu vực quản trị nội dung cho Flight Module.

Cho phép nhân sự nội bộ quản lý nội dung hiển thị trên website vé máy bay mà không cần sửa mã nguồn.

---

## 2. Existing System Impact

- Không sửa hoặc xóa module B2B hiện có.
- Không thay đổi route công khai đang vận hành.
- Tái sử dụng hệ thống Auth và RBAC của Minh Việt Travel Platform nếu đã có.
- Nếu Admin hiện tại đã tồn tại, bổ sung Flight Module vào hệ thống hiện có.
- Không tạo một Admin độc lập nếu không cần thiết.

Route đề xuất:

```text
/admin/flight
/admin/flight/banners
/admin/flight/flash-sales
/admin/flight/routes
/admin/flight/airlines
/admin/flight/airports
/admin/flight/faqs
/admin/flight/articles
```

---

## 3. Phạm vi

### Bao gồm

- Dashboard Flight CMS.
- Quản lý banner.
- Quản lý Flash Sale.
- Quản lý chặng bay nổi bật.
- Quản lý hãng bay.
- Quản lý sân bay.
- Quản lý FAQ.
- Quản lý bài viết.
- Trạng thái nháp và xuất bản.
- Tìm kiếm, lọc và phân trang.
- Audit log cơ bản.

### Không bao gồm

- API hãng bay.
- Quản lý booking thật.
- Quản lý payment thật.
- Quản lý xuất vé.
- Workflow phê duyệt nhiều cấp.
- AI tự động viết bài.

---

## 4. Vai trò và phân quyền

### Super Admin

- Toàn quyền Flight CMS.
- Xóa dữ liệu.
- Quản lý trạng thái xuất bản.
- Xem Audit Log.

### Content Admin

- Tạo và sửa nội dung.
- Xuất bản nội dung.
- Không được xóa dữ liệu hệ thống quan trọng.

### Content Editor

- Tạo và sửa bản nháp.
- Không được xuất bản.
- Không được xóa.

### Viewer

- Chỉ xem.

RBAC đề xuất:

```text
flight.cms.view
flight.cms.create
flight.cms.update
flight.cms.publish
flight.cms.delete
flight.cms.audit
```

---

## 5. Dashboard

Hiển thị:

- Tổng số banner.
- Tổng số Flash Sale.
- Tổng số chặng bay nổi bật.
- Tổng số hãng bay.
- Tổng số sân bay.
- Tổng số FAQ.
- Tổng số bài viết.
- Nội dung đang ở trạng thái Draft.
- Nội dung đang Published.
- Nội dung sắp hết hạn.

---

## 6. Quản lý Banner

Trường dữ liệu:

- Tiêu đề.
- Mô tả.
- Ảnh Desktop.
- Ảnh Mobile.
- CTA Label.
- CTA URL.
- Vị trí hiển thị.
- Thứ tự.
- Ngày bắt đầu.
- Ngày kết thúc.
- Trạng thái.
- Alt Text.

Trạng thái:

```text
draft
scheduled
published
expired
archived
```

---

## 7. Quản lý Flash Sale

Trường dữ liệu:

- Tên chương trình.
- Chặng bay.
- Hãng bay.
- Giá từ.
- Ngày khởi hành áp dụng.
- Thời gian bắt đầu.
- Thời gian kết thúc.
- Hình ảnh.
- Nội dung ngắn.
- Điều kiện áp dụng.
- CTA URL.
- Trạng thái.

Yêu cầu:

- Không cho phép ngày kết thúc nhỏ hơn ngày bắt đầu.
- Tự động chuyển trạng thái Expired khi hết hạn.
- Có Preview trước khi xuất bản.

---

## 8. Quản lý Chặng bay nổi bật

Trường dữ liệu:

- Điểm đi.
- Điểm đến.
- Mã sân bay đi.
- Mã sân bay đến.
- Giá từ.
- Hình ảnh.
- Hãng bay phổ biến.
- CTA URL.
- Thứ tự.
- Trạng thái.

Yêu cầu:

- Không tạo hai bản ghi trùng chặng và cùng thời gian hiệu lực.
- Có chức năng kéo thả sắp xếp nếu thuận tiện.

---

## 9. Quản lý Hãng bay

Trường dữ liệu:

- Tên hãng.
- Mã IATA.
- Mã ICAO.
- Logo.
- Quốc gia.
- Website.
- Mô tả.
- Trạng thái hoạt động.
- SEO Title.
- SEO Description.
- Slug.

Yêu cầu:

- Mã IATA không trùng.
- Slug không trùng.
- Logo có Alt Text.

---

## 10. Quản lý Sân bay

Trường dữ liệu:

- Tên sân bay.
- Mã IATA.
- Mã ICAO.
- Thành phố.
- Tỉnh hoặc bang.
- Quốc gia.
- Múi giờ.
- Địa chỉ.
- Latitude.
- Longitude.
- Mô tả.
- Hướng dẫn di chuyển.
- SEO Title.
- SEO Description.
- Slug.
- Trạng thái.

Yêu cầu:

- Mã IATA không trùng.
- Có thể tìm kiếm theo tên, mã hoặc thành phố.
- Không xóa cứng khi sân bay đang được tham chiếu.

---

## 11. Quản lý FAQ

Trường dữ liệu:

- Câu hỏi.
- Câu trả lời.
- Danh mục.
- Thứ tự.
- Trạng thái.
- Trang áp dụng.

Danh mục gợi ý:

```text
booking
payment
baggage
refund
change-ticket
check-in
general
```

---

## 12. Quản lý Bài viết

Trường dữ liệu:

- Tiêu đề.
- Slug.
- Mô tả ngắn.
- Nội dung.
- Ảnh đại diện.
- Danh mục.
- Tác giả.
- Thẻ.
- SEO Title.
- SEO Description.
- Canonical URL.
- Ngày xuất bản.
- Trạng thái.

Trạng thái:

```text
draft
review
scheduled
published
archived
```

Yêu cầu:

- Rich Text Editor.
- Preview.
- Autosave bản nháp nếu hệ thống hỗ trợ.
- Không cho phép slug trùng.

---

## 13. UI cần có

### Danh sách dữ liệu

- Search.
- Filter.
- Sort.
- Pagination.
- Bulk action.
- Status badge.
- Empty State.
- Loading State.
- Error State.

### Form

- Validation.
- Upload ảnh.
- Preview ảnh.
- Save Draft.
- Publish.
- Archive.
- Cancel.

### Confirm Dialog

Bắt buộc với:

- Xóa.
- Archive.
- Publish.
- Bulk action.

---

## 14. Component

```text
FlightAdminDashboard
AdminPageHeader
DataTable
SearchBar
FilterBar
Pagination
StatusBadge
FormSection
ImageUploader
RichTextEditor
DateRangePicker
PublishControls
PreviewDrawer
ConfirmDialog
AuditLogTable
EmptyState
LoadingSkeleton
ErrorState
```

---

## 15. Data Model tối thiểu

```text
FlightBanner
FlightFlashSale
FeaturedRoute
Airline
Airport
FlightFAQ
FlightArticle
FlightContentAuditLog
```

Các trường chung:

```text
id
status
createdAt
updatedAt
createdBy
updatedBy
publishedAt
```

---

## 16. API đề xuất

```text
GET    /api/admin/flight/banners
POST   /api/admin/flight/banners
GET    /api/admin/flight/banners/:id
PATCH  /api/admin/flight/banners/:id
DELETE /api/admin/flight/banners/:id

GET    /api/admin/flight/flash-sales
POST   /api/admin/flight/flash-sales
PATCH  /api/admin/flight/flash-sales/:id
DELETE /api/admin/flight/flash-sales/:id

GET    /api/admin/flight/routes
POST   /api/admin/flight/routes
PATCH  /api/admin/flight/routes/:id
DELETE /api/admin/flight/routes/:id

GET    /api/admin/flight/airlines
POST   /api/admin/flight/airlines
PATCH  /api/admin/flight/airlines/:id

GET    /api/admin/flight/airports
POST   /api/admin/flight/airports
PATCH  /api/admin/flight/airports/:id

GET    /api/admin/flight/faqs
POST   /api/admin/flight/faqs
PATCH  /api/admin/flight/faqs/:id
DELETE /api/admin/flight/faqs/:id

GET    /api/admin/flight/articles
POST   /api/admin/flight/articles
PATCH  /api/admin/flight/articles/:id
DELETE /api/admin/flight/articles/:id
```

Epic này có thể dùng Mock Repository nếu backend thật chưa sẵn sàng.

---

## 17. Validation

Bắt buộc:

- Trường required.
- Slug hợp lệ.
- Slug không trùng.
- Mã IATA đúng định dạng.
- Ngày kết thúc không nhỏ hơn ngày bắt đầu.
- Giá không âm.
- URL hợp lệ.
- Ảnh đúng định dạng.
- Không cho publish nội dung thiếu trường bắt buộc.

---

## 18. Responsive

### Desktop

- Sidebar Admin.
- Data Table đầy đủ.
- Form hai cột khi phù hợp.

### Tablet

- Sidebar thu gọn.
- Table cho phép cuộn ngang.

### Mobile

- Data Table chuyển dạng card nếu cần.
- Form một cột.
- Action chính luôn dễ truy cập.

---

## 19. Audit và an toàn dữ liệu

- Ghi lại người tạo.
- Ghi lại người sửa.
- Ghi lại thời gian publish.
- Ghi lại thay đổi trạng thái.
- Không xóa cứng Airline và Airport nếu đang được tham chiếu.
- Ưu tiên Archive hoặc Soft Delete.
- Kiểm tra quyền ở cả UI và API.

---

## 20. Điều kiện hoàn thành

Epic được xem là hoàn thành khi:

- Có Dashboard Flight CMS.
- CRUD hoạt động cho toàn bộ entity trong phạm vi.
- RBAC hoạt động.
- Có Draft, Published và Archived.
- Có Search, Filter và Pagination.
- Có Validation.
- Có Preview cho Banner, Flash Sale và Article.
- Responsive.
- Không ảnh hưởng module B2B.
- Không lỗi TypeScript.
- Không lỗi ESLint.
- `npm run build` thành công.

---

## 21. Checklist bàn giao Claude Code

Claude Code phải bàn giao:

- Source code Flight CMS.
- Route đã tạo.
- Component đã tạo.
- Data model hoặc Mock Repository.
- Permission đã bổ sung.
- API hoặc Server Action đã tạo.
- Validation schema.
- Kết quả:
  - Lint.
  - Typecheck.
  - Build.
  - RBAC.
  - Responsive.
- Danh sách việc chưa hoàn thành.
- Xác nhận không ảnh hưởng module B2B.

---

## 22. Lệnh giao việc cho Claude Code

```text
Đọc toàn bộ Product Bible của Minh Việt Travel Platform.

Sau đó đọc file:

docs/PRD/Flight/EPIC-007-Flight-CMS-Admin.md

Triển khai đúng phạm vi Epic 007.

Ưu tiên tích hợp vào Admin hiện có.

Không tạo một hệ thống Admin độc lập nếu Platform đã có Auth, RBAC và Dashboard.

Không sửa hoặc xóa module B2B.

Không tích hợp:
- API hãng bay
- Booking thật
- Payment thật
- AI tự động viết bài

Nếu backend chưa sẵn sàng, sử dụng Mock Repository nhưng phải giữ interface rõ ràng để thay thế sau.

Trước khi kết thúc phải chạy:

npm run lint
npm run typecheck
npm run build

Sau đó báo cáo:

- File đã tạo
- Route đã tạo
- Component đã tạo
- Data model đã tạo
- Permission đã tạo
- Kết quả kiểm tra
- Việc chưa hoàn thành
- Xác nhận không ảnh hưởng hệ thống hiện có
```
