# EPIC-006 – My Booking

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-006-My-Booking.md`

---

## 1. Mục tiêu

Xây dựng khu vực để khách hàng tra cứu và quản lý đơn đặt vé.

Sử dụng Mock Data.

---

## 2. Existing System Impact

- Không sửa module B2B.
- Không sửa route hiện có.

Route mới:

```text
/ve-may-bay/tra-cuu
/ve-may-bay/tra-cuu/[bookingCode]
```

---

## 3. Phạm vi

Bao gồm

- Tra cứu theo mã đơn.
- Tra cứu theo email + điện thoại.
- Chi tiết booking.
- Trạng thái đơn.
- Tải xác nhận đặt chỗ (Mock PDF).
- Gửi yêu cầu đổi vé.
- Gửi yêu cầu hoàn vé.
- Liên hệ hỗ trợ.

Không bao gồm

- Đổi vé thật.
- Hoàn vé thật.
- API hãng bay.

---

## 4. UI cần có

### Booking Search

- Mã đặt chỗ.
- Email.
- Số điện thoại.
- Nút Tra cứu.

### Booking Detail

Hiển thị:

- Mã đơn.
- Trạng thái.
- Hành khách.
- Hành trình.
- Giá.
- Phương thức thanh toán.
- Thời gian tạo.

### Booking Status

- Chờ thanh toán.
- Đã thanh toán.
- Đã xuất vé.
- Đã hủy.
- Đã hoàn.

### Actions

- Tải xác nhận.
- Yêu cầu đổi vé.
- Yêu cầu hoàn vé.
- Liên hệ hỗ trợ.

---

## 5. Component

```text
BookingSearchForm
BookingDetailCard
PassengerList
BookingStatusBadge
ActionPanel
SupportBox
DownloadButton
LoadingSkeleton
EmptyState
ErrorState
```

---

## 6. Mock API

```text
POST /mock/booking/search
GET /mock/booking/{bookingCode}
POST /mock/refund-request
POST /mock/change-request
```

---

## 7. Responsive

- Desktop 2 cột.
- Tablet tối ưu.
- Mobile 1 cột.

---

## 8. Validation

- Booking Code bắt buộc.
- Email đúng định dạng.
- Điện thoại hợp lệ.

---

## 9. Điều kiện hoàn thành

- Tra cứu hoạt động với Mock Data.
- Responsive.
- Không lỗi TypeScript.
- npm run build thành công.

---

## 10. Checklist bàn giao

- Source code.
- Component.
- Mock Data.
- README.
- Build Report.

---

## Lệnh giao Claude Code

```text
Đọc Product Bible.

Đọc:
docs/PRD/Flight/EPIC-006-My-Booking.md

Triển khai đúng Epic 006.

Không tích hợp API hãng bay.

Không triển khai đổi/hoàn vé thật.

Chỉ sử dụng Mock Data.

Không sửa module B2B.

Hoàn thành phải chạy:

npm run lint
npm run typecheck
npm run build
```
