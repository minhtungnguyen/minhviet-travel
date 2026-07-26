\
# 24 - Flight Payment Module

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Thiết kế Payment Module phục vụ quản lý toàn bộ vòng đời thanh toán của booking vé máy bay, đảm bảo tính chính xác, minh bạch và khả năng tích hợp nhiều cổng thanh toán trong tương lai.

---

# Phạm vi

- Ghi nhận thanh toán
- Theo dõi công nợ
- Đối soát giao dịch
- Hoàn tiền
- Xuất hóa đơn
- Tích hợp Payment Gateway

---

# Kiến trúc

```text
Booking
    │
    ▼
Payment Service
    │
 ┌──┼───────────────┐
 ▼  ▼               ▼
Gateway         Accounting
 │                  │
 ▼                  ▼
Transaction      Invoice
```

---

# Trạng thái thanh toán

| Status | Ý nghĩa |
|---------|----------|
| Pending | Chờ thanh toán |
| Processing | Đang xử lý |
| Paid | Đã thanh toán |
| Partial Paid | Thanh toán một phần |
| Failed | Thất bại |
| Refunded | Đã hoàn tiền |
| Cancelled | Hủy |

---

# Phương thức thanh toán

- Chuyển khoản ngân hàng
- QR Code
- Thẻ tín dụng/ghi nợ
- Ví điện tử
- Thanh toán tại văn phòng
- Công nợ doanh nghiệp

---

# Business Rules

- Không xuất vé khi trạng thái chưa là **Paid** (trừ trường hợp được phân quyền đặc biệt).
- Mọi giao dịch phải có mã giao dịch (Transaction ID).
- Mỗi lần hoàn tiền phải ghi nhận lý do và người thực hiện.

---

# Đối soát

Lưu:

- Booking Code
- Transaction ID
- Gateway
- Số tiền
- Thời gian
- Trạng thái

---

# Logging

Ghi nhận:

- Người thao tác
- Thời gian
- Hành động
- Trạng thái trước/sau

---

# Claude Code Guidance

- Payment Service tách biệt với Booking Service.
- Thiết kế theo Adapter Pattern để dễ tích hợp nhiều cổng thanh toán.
- Không lưu dữ liệu nhạy cảm của thẻ thanh toán.

---

# Definition of Done

- Payment Service
- Payment Status Flow
- Refund Flow
- Reconciliation
- Audit Log
- Multi Gateway Ready

---

**End of 24-Flight-Payment-Module.md**
