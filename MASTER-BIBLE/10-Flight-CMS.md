# 10 - Flight CMS

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Mục tiêu

Flight CMS là trung tâm quản trị toàn bộ dữ liệu và quy trình nghiệp vụ của nền tảng bán vé máy bay.

Nguyên tắc:

- Không thao tác trực tiếp trên cơ sở dữ liệu.
- Mọi thay đổi đều thực hiện qua CMS.
- Có phân quyền và lưu vết (Audit Log).

---

# Phân hệ quản trị

```text
Flight CMS
│
├── Dashboard
├── Flight Requests
├── Bookings
├── Passengers
├── Tickets
├── Payments
├── Airlines
├── Airports
├── Routes
├── Promotions
├── Reports
└── Settings
```

---

# Dashboard

Hiển thị:

- Booking mới
- Booking chờ xử lý
- Booking đã xuất vé
- Doanh thu hôm nay
- Booking sắp khởi hành
- Cảnh báo thanh toán

---

# Flight Requests

Thông tin:

- Mã yêu cầu
- Khách hàng
- Hành trình
- Ngày đi/về
- Trạng thái
- Nhân viên phụ trách

Chức năng:

- Xem
- Phân công
- Chuyển thành Booking

---

# Booking Management

Cho phép:

- Cập nhật trạng thái
- Quản lý hành khách
- Lưu PNR
- Gửi email xác nhận
- Gửi E-ticket

---

# Airline Master Data

Quản lý:

- Hãng bay
- Mã hãng
- Logo
- Quốc gia
- Trạng thái hoạt động

---

# Airport Master Data

Quản lý:

- Sân bay
- Mã IATA
- Thành phố
- Quốc gia
- Múi giờ

---

# Permission Matrix

| Vai trò | Quyền |
|---------|--------|
| Admin | Toàn quyền |
| Booking | Xử lý booking |
| Accountant | Thanh toán & hóa đơn |
| CSKH | Tra cứu & hỗ trợ |

---

# Audit Log

Lưu:

- Người thao tác
- Thời gian
- Dữ liệu trước
- Dữ liệu sau
- Địa chỉ IP

---

# Claude Code Guidance

CMS phải phát triển theo hướng:

- Component-based
- Table reusable
- Filter reusable
- Form reusable
- Permission middleware
- Audit middleware

Không lặp lại giao diện giữa các module.

---

# Definition of Done

- Dashboard hoạt động
- CRUD đầy đủ
- Phân quyền
- Audit Log
- Responsive
- Hỗ trợ Desktop và Tablet

---

**End of 10-Flight-CMS.md**
