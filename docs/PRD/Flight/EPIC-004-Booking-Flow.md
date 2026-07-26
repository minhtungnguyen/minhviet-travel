# EPIC-004 – Flight Booking Flow

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-004-Booking-Flow.md`

---

## 1. Mục tiêu

Xây dựng quy trình nhập thông tin đặt vé từ sau khi người dùng chọn chuyến bay đến trước bước thanh toán.

Epic này chỉ xử lý giao diện và Mock Data.

---

## 2. Existing System Impact

- Không sửa module B2B.
- Không sửa route hiện có.
- Route mới đề xuất:

```text
/ve-may-bay/dat-ve/[flightId]
```

---

## 3. Phạm vi

### Bao gồm

- Thông tin chuyến bay đã chọn.
- Thông tin liên hệ.
- Danh sách hành khách.
- Dịch vụ bổ sung.
- Xác nhận điều khoản.
- Tổng tiền tạm tính.
- CTA sang bước thanh toán.

### Không bao gồm

- Thanh toán.
- Giữ chỗ thật.
- API hãng bay.
- Xuất vé.

---

## 4. UI cần có

### Flight Summary
- Hành trình.
- Giờ bay.
- Hãng bay.
- Giá đã chọn.

### Contact Information

- Họ tên.
- Email.
- Điện thoại.

### Passenger Form

Cho phép nhập:

- Người lớn.
- Trẻ em.
- Em bé.

Thông tin:

- Họ tên.
- Giới tính.
- Ngày sinh.
- Quốc tịch.
- Giấy tờ.

### Extra Services

- Hành lý mua thêm.
- Chọn chỗ.
- Bảo hiểm.
- Ghi chú.

### Price Summary

- Giá vé.
- Thuế.
- Phí.
- Dịch vụ thêm.
- Tổng cộng.

### Terms

Checkbox:

"Tôi đồng ý điều khoản đặt vé."

### CTA

- Quay lại.
- Tiếp tục thanh toán.

---

## 5. Component

```text
BookingPage
FlightSummaryCard
ContactForm
PassengerList
PassengerForm
ExtraServiceCard
PriceSummary
TermsCheckbox
BookingActions
LoadingSkeleton
ErrorState
```

---

## 6. Mock API

```text
GET /mock/booking
POST /mock/booking/validate
GET /mock/extra-services
```

---

## 7. Responsive

- Desktop 2 cột.
- Tablet 2 hàng.
- Mobile 1 cột.
- CTA cố định cuối màn hình trên Mobile.

---

## 8. Validation

Bắt buộc kiểm tra:

- Email.
- Điện thoại.
- Họ tên.
- Ngày sinh.
- Điều khoản phải được chọn.

Hiển thị lỗi ngay dưới trường nhập.

---

## 9. Điều kiện hoàn thành

- Form hoạt động với Mock Data.
- Validation đầy đủ.
- Responsive.
- Không lỗi TypeScript.
- Build thành công.

---

## 10. Checklist bàn giao

Claude Code phải bàn giao:

- Source code.
- Component.
- Mock Data.
- Type definitions.
- README.
- Báo cáo:
  - Lint.
  - Typecheck.
  - Build.
  - Responsive.

---

## Lệnh giao Claude Code

```text
Đọc Product Bible.

Đọc:
docs/PRD/Flight/EPIC-004-Booking-Flow.md

Triển khai đúng Epic 004.

Không triển khai Payment.
Không tích hợp API hãng bay.
Chỉ dùng Mock Data.

Không sửa module B2B hiện có.

Hoàn thành phải chạy:

npm run lint
npm run typecheck
npm run build
```
