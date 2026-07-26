# EPIC-005 – Payment & Confirmation

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-005-Payment-Confirmation.md`

---

## 1. Mục tiêu

Xây dựng giao diện thanh toán và xác nhận đơn đặt vé.

Epic này chỉ xây dựng UI, UX và Mock Data.

Không kết nối cổng thanh toán thật.

---

## 2. Existing System Impact

- Không sửa module B2B.
- Không sửa route hiện có.
- Route mới:

```text
/ve-may-bay/thanh-toan/[bookingId]
```

```text
/ve-may-bay/thanh-cong/[bookingId]
```

```text
/ve-may-bay/that-bai/[bookingId]
```

---

## 3. Phạm vi

Bao gồm

- Tóm tắt đơn hàng
- Chọn phương thức thanh toán
- QR thanh toán (Mock)
- Chuyển khoản ngân hàng (Mock)
- Trang thanh toán thành công
- Trang thanh toán thất bại
- Trang đang chờ thanh toán

Không bao gồm

- Thanh toán thật
- Webhook
- API ngân hàng
- API hãng bay

---

## 4. UI cần có

### Booking Summary

Hiển thị

- Mã đơn
- Chuyến bay
- Hành khách
- Giá
- Dịch vụ thêm
- Tổng tiền

---

### Payment Method

Các lựa chọn

- QR Code
- Chuyển khoản
- Thẻ nội địa
- Thẻ quốc tế

(Tất cả dùng Mock)

---

### Payment Status

Các trạng thái

- Pending
- Success
- Failed
- Expired

---

### Success Page

Hiển thị

- Cảm ơn
- Mã đơn
- Thông tin liên hệ
- Hướng dẫn tiếp theo
- Nút Tra cứu đơn

---

### Failed Page

Hiển thị

- Lý do
- Thử lại
- Liên hệ hỗ trợ

---

### Pending Page

Hiển thị

- Đang chờ thanh toán
- Đồng hồ đếm ngược (Mock)
- Kiểm tra lại

---

## 5. Component

```text
PaymentPage
BookingSummary
PaymentMethodList
QRCodeCard
BankTransferCard
PaymentStatus
SuccessPage
FailedPage
PendingPage
SupportBox
ActionButtons
LoadingSkeleton
ErrorState
```

---

## 6. Mock API

```text
GET /mock/payment
POST /mock/payment

GET /mock/payment-status
```

---

## 7. Responsive

Desktop

- 2 cột

Mobile

- 1 cột

CTA luôn dễ nhìn.

---

## 8. Validation

- Chọn phương thức thanh toán.
- Booking phải tồn tại.
- Tổng tiền lớn hơn 0.

---

## 9. Điều kiện hoàn thành

- Giao diện hoàn chỉnh.
- Mock Payment hoạt động.
- Có 4 trạng thái.
- Responsive.
- Không lỗi TypeScript.
- npm run build thành công.

---

## 10. Checklist bàn giao

Claude Code bàn giao:

- Source code
- Mock Data
- Component
- README
- Build Report
- Responsive Report

---

## Lệnh giao Claude Code

```text
Đọc Product Bible.

Đọc:

docs/PRD/Flight/EPIC-005-Payment-Confirmation.md

Triển khai đúng Epic 005.

Không tích hợp:

- VNPay
- Napas
- Stripe
- API ngân hàng

Chỉ dùng Mock Data.

Không sửa module B2B.

Hoàn thành phải chạy:

npm run lint
npm run typecheck
npm run build
```
