# TECH-007 – Error Handling & Exception Specification

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-007-Error-Handling.md`

---

# 1. Mục tiêu

Chuẩn hóa toàn bộ cơ chế xử lý lỗi (Error Handling) và ngoại lệ (Exception Handling) trong Flight Module nhằm:

- Cung cấp trải nghiệm nhất quán cho người dùng.
- Giúp Developer dễ bảo trì.
- Hỗ trợ QA kiểm thử đầy đủ.
- Thuận lợi cho Logging và Monitoring.

---

# 2. Nguyên tắc

- Không hiển thị lỗi kỹ thuật cho người dùng.
- Mọi lỗi đều có Error Code.
- Lỗi phải được ghi log.
- Có khả năng Retry nếu phù hợp.
- Không làm mất dữ liệu người dùng đã nhập.

---

# 3. Phân loại lỗi

## Client Error

- Validation Error
- Required Field
- Sai định dạng Email
- Sai số điện thoại
- Thiếu dữ liệu

## Business Error

- Không tìm thấy chuyến bay
- Giá đã thay đổi
- Booking hết hạn
- Booking không tồn tại
- Không thể đổi vé
- Không thể hoàn vé

## Server Error

- API Timeout
- Internal Server Error
- Database Error
- Network Error
- Unknown Error

---

# 4. Error Code

```text
FLIGHT_001  Validation Failed
FLIGHT_002  Flight Not Found
FLIGHT_003  Booking Not Found
FLIGHT_004  Booking Expired
FLIGHT_005  Payment Failed
FLIGHT_006  Payment Timeout
FLIGHT_007  Unauthorized
FLIGHT_008  Permission Denied
FLIGHT_009  Internal Server Error
FLIGHT_010  Unknown Error
```

---

# 5. Chuẩn Response

```json
{
  "success": false,
  "errorCode": "FLIGHT_003",
  "message": "Booking not found"
}
```

---

# 6. UI xử lý lỗi

Mỗi màn hình phải có:

- Error Banner
- Retry Button
- Contact Support
- Back Button

Không hiển thị Stack Trace.

---

# 7. Retry Strategy

Cho phép Retry:

- Search
- Payment Status
- CMS List
- Flight Detail

Không Retry tự động:

- Payment
- Booking Create

---

# 8. Logging

Ghi nhận:

- Error Code
- URL
- User
- Browser
- Request ID
- Timestamp

Không ghi:

- Mật khẩu
- Thẻ thanh toán
- CVV
- Token nhạy cảm

---

# 9. Monitoring

Theo dõi:

- API Error Rate
- Timeout
- Payment Error
- Booking Error
- CMS Error

Có cảnh báo khi tỷ lệ lỗi vượt ngưỡng.

---

# 10. Điều kiện hoàn thành

- Mọi lỗi có Error Code.
- Có Retry khi phù hợp.
- Không lộ thông tin hệ thống.
- Thống nhất trên toàn Flight Module.
