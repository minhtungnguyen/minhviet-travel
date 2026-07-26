\
# 28 - AI Automation Workflow

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Thiết kế kiến trúc AI Automation cho Flight Platform nhằm tự động hóa các quy trình lặp lại, giảm thao tác thủ công và tăng tốc độ xử lý nghiệp vụ, đồng thời vẫn giữ con người ở các điểm phê duyệt quan trọng.

---

# Nguyên tắc

- Human-in-the-Loop
- Event-Driven Automation
- Idempotent Workflow
- Có khả năng Retry và Resume
- Ghi nhận đầy đủ Audit Log

---

# Kiến trúc tổng thể

```text
Business Event
      │
      ▼
 Event Bus / Queue
      │
      ▼
Automation Engine
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
AI Service   Business Rule   Notification
      │
      ▼
Human Approval (nếu cần)
      │
      ▼
Business Action
```

---

# Workflow tự động

## Lead → Booking

1. Khách gửi yêu cầu
2. AI kiểm tra dữ liệu
3. Tạo Flight Request
4. Phân công Booking Staff
5. Gửi thông báo

---

## Booking → Payment

- Nhắc thanh toán
- Kiểm tra trạng thái giao dịch
- Cập nhật Booking

---

## Payment → Ticket

- Xác nhận thanh toán
- Tạo yêu cầu xuất vé
- Gửi E-ticket

---

## After Sales

- Gửi hướng dẫn check-in
- Thu thập đánh giá
- Gợi ý dịch vụ liên quan

---

# AI Decision Points

AI được phép:

- Phân loại yêu cầu
- Gợi ý phương án
- Tóm tắt dữ liệu
- Soạn nội dung

AI không được phép:

- Tự xác nhận thanh toán
- Tự xuất vé
- Tự hoàn tiền

---

# Trigger Types

- API Event
- Database Event
- Scheduled Job
- Manual Trigger
- Webhook

---

# Logging

Lưu:

- Workflow ID
- Trigger
- Step
- Result
- Retry Count
- Execution Time

---

# Claude Code Guidance

- Automation Engine độc lập với Business Service.
- Workflow định nghĩa bằng cấu hình (configuration-first).
- Hỗ trợ mở rộng cho Hotel, Tour, Cruise.

---

# Definition of Done

- Workflow Engine
- Queue Integration
- Retry Policy
- Human Approval
- Audit Log
- Monitoring

---

**End of 28-AI-Automation-Workflow.md**
