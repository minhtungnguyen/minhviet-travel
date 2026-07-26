# EPIC-002 – Flight Search Results

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-002-Search-Results.md`

---

## 1. Mục tiêu

Xây dựng trang hiển thị kết quả tìm kiếm chuyến bay sau khi người dùng nhập điều kiện tìm kiếm.

Epic này sử dụng Mock Data, chưa kết nối API hãng bay.

---

## 2. Phạm vi

### Bao gồm

- Thanh tìm kiếm rút gọn
- Danh sách chuyến bay
- Bộ lọc
- Sắp xếp
- Fare Calendar
- Phân trang hoặc Load More
- Loading / Empty / Error State

### Không bao gồm

- Booking
- Thanh toán
- Đăng nhập

---

## 3. UI cần có

### Search Summary
- Điểm đi
- Điểm đến
- Ngày bay
- Hành khách
- Nút sửa tìm kiếm

### Filter Sidebar

- Khoảng giá
- Hãng bay
- Giờ cất cánh
- Giờ hạ cánh
- Bay thẳng
- Số điểm dừng
- Hạng ghế

### Sort

- Giá thấp nhất
- Cất cánh sớm nhất
- Bay nhanh nhất
- Khuyến nghị

### Flight Card

Hiển thị:

- Logo hãng
- Mã chuyến
- Giờ đi
- Giờ đến
- Thời gian bay
- Điểm dừng
- Hành lý
- Giá
- Nút Chọn

### Fare Calendar

Hiển thị giá rẻ trong ±3 ngày.

---

## 4. Component

```text
SearchSummary
FilterSidebar
PriceFilter
AirlineFilter
TimeFilter
SortBar
FareCalendar
FlightCard
FlightList
Pagination
LoadingSkeleton
EmptyState
ErrorState
```

---

## 5. Mock API

```text
GET /mock/flights
GET /mock/fare-calendar
GET /mock/filters
```

---

## 6. SEO

- Metadata động
- Canonical
- Breadcrumb
- Schema SearchResultsPage
- URL thân thiện

Ví dụ:

```text
/ve-may-bay/hai-phong/ho-chi-minh
```

---

## 7. Responsive

Desktop:
- Sidebar trái
- Danh sách phải

Tablet:
- Filter Drawer

Mobile:
- Filter Bottom Sheet
- Sort Sticky

---

## 8. Hiệu năng

- Lazy Load
- Virtual list nếu dữ liệu lớn
- Lighthouse > 90

---

## 9. Điều kiện hoàn thành

- Filter hoạt động với Mock Data
- Sort hoạt động
- Responsive
- Không lỗi TypeScript
- npm run build thành công

---

## 10. Checklist bàn giao

- Source code
- Component
- Mock Data
- README
- Báo cáo build
- Danh sách file đã tạo

---

## Lệnh giao Claude Code

Đọc Product Bible.

Đọc:
docs/PRD/Flight/EPIC-002-Search-Results.md

Triển khai đúng Epic 002.

Không làm Booking hoặc Payment.

Chỉ dùng Mock Data.
