# TECH-005 – Flight User Flow

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-005-Flight-User-Flow.md`

---

# 1. Mục tiêu

Chuẩn hóa toàn bộ luồng nghiệp vụ (User Flow) của Flight Module, từ khi người dùng truy cập website đến khi hoàn tất hành trình đặt vé hoặc xử lý sau bán.

Tài liệu này là cơ sở để triển khai Frontend, Backend, API và Automation.

---

# 2. Phạm vi

Bao gồm:

- Luồng khách truy cập (Guest)
- Luồng đặt vé
- Luồng thanh toán
- Luồng tra cứu
- Luồng đổi vé
- Luồng hoàn vé
- Luồng CMS
- Các trường hợp ngoại lệ

---

# 3. User Journey tổng quát

```text
Homepage
      │
      ▼
Flight Search
      │
      ▼
Search Result
      │
      ▼
Flight Detail
      │
      ▼
Booking
      │
      ▼
Payment
      │
      ▼
Booking Success
      │
      ▼
My Booking
```

---

# 4. Luồng tìm kiếm

1. Người dùng nhập:
   - Điểm đi
   - Điểm đến
   - Ngày đi
   - Ngày về (nếu khứ hồi)
   - Hành khách
   - Hạng ghế

2. Nhấn **Tìm chuyến bay**.

3. Hệ thống:
   - Kiểm tra dữ liệu đầu vào.
   - Ghi log tìm kiếm.
   - Trả về danh sách chuyến bay (Mock hoặc API).

Ngoại lệ:

- Thiếu dữ liệu.
- Không có chuyến.
- Lỗi hệ thống.

---

# 5. Luồng chọn chuyến

Người dùng:

- Xem thông tin.
- So sánh giá.
- Lọc kết quả.
- Chọn chuyến.

Hệ thống:

- Hiển thị chi tiết.
- Kiểm tra trạng thái dữ liệu.
- Chuyển sang Booking.

---

# 6. Luồng đặt chỗ

Người dùng nhập:

- Thông tin liên hệ.
- Danh sách hành khách.
- Dịch vụ bổ sung.

Hệ thống:

- Validate dữ liệu.
- Tính tổng tiền.
- Tạo Booking ở trạng thái:

```text
PENDING_PAYMENT
```

---

# 7. Luồng thanh toán

Người dùng chọn:

- QR
- Chuyển khoản
- Thẻ (Mock)

Kết quả:

## Thành công

```text
PENDING_PAYMENT
        │
        ▼
PAID
```

## Thất bại

```text
PENDING_PAYMENT
        │
        ▼
FAILED
```

## Hết hạn

```text
PENDING_PAYMENT
        │
        ▼
EXPIRED
```

---

# 8. Luồng sau thanh toán

Nếu thành công:

- Hiển thị trang cảm ơn.
- Gửi Email (sau này).
- Cho phép tra cứu Booking.

---

# 9. Luồng tra cứu

Người dùng nhập:

- Booking Code

hoặc

- Email
- Điện thoại

Hệ thống:

- Kiểm tra dữ liệu.
- Hiển thị Booking Detail.

---

# 10. Luồng đổi vé

Người dùng:

- Chọn "Yêu cầu đổi vé".
- Nhập nội dung.

Hệ thống:

- Tạo Ticket.
- Chuyển trạng thái:

```text
CHANGE_REQUEST
```

Không đổi vé tự động.

---

# 11. Luồng hoàn vé

Người dùng:

- Chọn "Yêu cầu hoàn vé".
- Gửi lý do.

Hệ thống:

- Tạo Refund Request.

Trạng thái:

```text
REFUND_REQUEST
```

Không hoàn tiền tự động.

---

# 12. Luồng CMS

Content Admin:

- Tạo Banner.
- Tạo Flash Sale.
- Tạo FAQ.
- Tạo Landing SEO.
- Xuất bản.

Hệ thống:

- Kiểm tra quyền.
- Ghi Audit Log.
- Publish.

---

# 13. Trạng thái Booking

```text
DRAFT

PENDING_PAYMENT

PAID

TICKETED

COMPLETED

CANCELLED

FAILED

EXPIRED

REFUND_REQUEST

REFUNDED

CHANGE_REQUEST
```

---

# 14. Trạng thái Payment

```text
PENDING

SUCCESS

FAILED

EXPIRED
```

---

# 15. Trạng thái CMS

```text
DRAFT

REVIEW

SCHEDULED

PUBLISHED

ARCHIVED
```

---

# 16. Exception Flow

Các trường hợp cần xử lý:

- Không tìm thấy Booking.
- Thanh toán thất bại.
- Session hết hạn.
- API Timeout.
- Mất kết nối mạng.
- Dữ liệu không hợp lệ.
- Người dùng refresh giữa quy trình.

Mỗi trường hợp cần:

- Thông báo rõ ràng.
- Không mất dữ liệu đã nhập nếu có thể.
- Cho phép thử lại.

---

# 17. Logging

Ghi nhận:

- Search.
- Booking.
- Payment.
- Refund Request.
- Change Request.
- CMS Publish.
- Error.

---

# 18. Điều kiện hoàn thành

- Bao phủ toàn bộ User Journey.
- Không có vòng lặp nghiệp vụ không cần thiết.
- Phù hợp với 8 Epic và 4 tài liệu Technical trước đó.
- Có thể dùng làm tài liệu tham chiếu cho Frontend, Backend và QA.
