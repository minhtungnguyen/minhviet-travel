\
# 23 - Flight Notification System

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Xây dựng hệ thống thông báo (Notification System) thống nhất cho Flight Platform nhằm đảm bảo mọi sự kiện quan trọng đều được gửi đúng người, đúng thời điểm và có khả năng theo dõi trạng thái.

---

# Nguyên tắc

- Event-Driven Architecture
- Gửi bất đồng bộ qua Queue
- Có cơ chế Retry
- Theo dõi trạng thái gửi

---

# Notification Channels

- Email
- SMS (tùy chọn)
- Zalo OA (tương lai)
- Mobile Push Notification
- In-App Notification
- Telegram (nội bộ)

---

# Các sự kiện

## Customer

- Booking được tạo
- Booking được xác nhận
- Chờ thanh toán
- Thanh toán thành công
- Xuất vé thành công
- Thay đổi lịch bay
- Hủy booking
- Hoàn tiền

## Internal

- Có booking mới
- Thanh toán lỗi
- API Provider lỗi
- Queue tồn đọng
- Cảnh báo bảo mật

---

# Workflow

```text
Business Event
      │
      ▼
Notification Queue
      │
      ▼
Notification Service
      │
 ┌────┼──────────┐
 ▼    ▼          ▼
Email SMS     Zalo/App
```

---

# Template Management

Mỗi loại thông báo có:

- Subject
- Content
- Variables
- Ngôn ngữ
- Kênh gửi

Ví dụ biến:

- {{customer_name}}
- {{booking_code}}
- {{departure_date}}

---

# Retry Strategy

- Retry tối đa 3 lần
- Exponential Backoff
- Đưa vào Dead Letter Queue nếu thất bại

---

# Logging

Lưu:

- Thời gian gửi
- Kênh gửi
- Người nhận
- Trạng thái
- Lỗi (nếu có)

---

# Claude Code Guidance

- Notification Service độc lập.
- Không gửi trực tiếp từ Business Service.
- Sử dụng Queue để tránh chặn luồng nghiệp vụ.

---

# Definition of Done

- Queue hoạt động
- Template Engine
- Multi-channel
- Retry Policy
- Logging & Tracking

---

**End of 23-Flight-Notification-System.md**
