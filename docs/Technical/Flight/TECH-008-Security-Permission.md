# TECH-008 – Security & Permission Specification

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-008-Security-Permission.md`

---

# 1. Mục tiêu

Thiết lập chuẩn bảo mật và phân quyền cho Flight Module nhằm đảm bảo an toàn dữ liệu, giảm rủi ro truy cập trái phép và tạo nền tảng mở rộng cho toàn bộ Minh Việt Travel Platform.

---

# 2. Phạm vi

Bao gồm:

- Authentication
- Authorization (RBAC)
- API Security
- Session Management
- Audit Log
- Data Protection
- Rate Limiting

Không bao gồm:

- Chính sách hạ tầng mạng
- Firewall vật lý
- HSM

---

# 3. Authentication

## Public

- Không cần đăng nhập:
  - Tìm kiếm chuyến bay
  - Xem Landing SEO
  - Xem FAQ

## User

- Tra cứu booking
- Quản lý booking

## Admin

- JWT Access Token
- Refresh Token
- Token hết hạn tự động
- Logout toàn bộ phiên

---

# 4. RBAC

Các vai trò:

```text
SuperAdmin
Admin
ContentAdmin
ContentEditor
BookingStaff
Finance
Viewer
```

Ví dụ quyền:

```text
flight.view
flight.booking.view
flight.booking.update
flight.payment.view
flight.cms.view
flight.cms.publish
flight.cms.delete
flight.audit.view
```

---

# 5. API Security

- HTTPS bắt buộc
- JWT Bearer Token
- Validate Input
- Output Encoding
- Không trả stack trace
- Request ID cho mọi request

---

# 6. Rate Limiting

Public API

- 100 request/phút/IP

Booking

- 20 request/phút/IP

Admin

- 300 request/phút/User

---

# 7. Data Protection

Không ghi log:

- Mật khẩu
- CVV
- Token
- Cookie
- Thông tin thẻ

Ẩn một phần:

- Email
- Số điện thoại

---

# 8. Audit Log

Ghi nhận:

- Đăng nhập
- Đăng xuất
- CRUD CMS
- Publish
- Archive
- Phân quyền
- Thay đổi Booking

Thông tin:

- User
- IP
- Browser
- Request ID
- Timestamp

---

# 9. Session Management

- Timeout không hoạt động
- Refresh Token Rotation
- Logout khi Refresh Token không hợp lệ

---

# 10. OWASP Checklist

Bảo vệ khỏi:

- SQL Injection
- XSS
- CSRF
- Broken Access Control
- Sensitive Data Exposure
- Security Misconfiguration

---

# 11. Điều kiện hoàn thành

- RBAC áp dụng cho toàn bộ Admin.
- API yêu cầu xác thực đúng phạm vi.
- Có Audit Log.
- Không lưu dữ liệu nhạy cảm trong log.
- Tuân thủ các nguyên tắc OWASP cơ bản.
