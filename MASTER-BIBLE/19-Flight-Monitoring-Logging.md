\
# 19 - Flight Monitoring & Logging

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Thiết kế hệ thống Monitoring & Logging giúp Flight Platform được giám sát liên tục, phát hiện sớm sự cố, hỗ trợ điều tra lỗi và tối ưu hiệu năng.

---

# Nguyên tắc

- Quan sát được toàn bộ hệ thống (Observability).
- Nhật ký có cấu trúc (Structured Logging).
- Cảnh báo theo thời gian thực.
- Không ghi thông tin nhạy cảm vào log.

---

# Kiến trúc

```text
Application
    │
    ├── Application Logs
    ├── Audit Logs
    ├── Access Logs
    └── Metrics
            │
            ▼
   Log Collector / Monitoring
            │
            ▼
 Dashboard & Alerting
```

---

# Các loại Log

## Application Log

- Thời gian
- Service
- Endpoint
- Duration
- Status Code

## Audit Log

- Người thao tác
- Hành động
- Dữ liệu trước/sau
- Địa chỉ IP

## Security Log

- Đăng nhập thất bại
- Thay đổi quyền
- Truy cập bất thường

---

# Metrics

Theo dõi:

- API Response Time
- Error Rate
- Booking Success Rate
- Payment Success Rate
- Queue Length
- CPU / Memory
- Database Connections

---

# Alerting

Kích hoạt cảnh báo khi:

- API lỗi liên tục
- Queue tồn đọng
- Database quá tải
- CPU vượt ngưỡng
- Tăng đột biến lỗi 5xx

---

# Dashboard

Dashboard vận hành nên hiển thị:

- Trạng thái dịch vụ
- Lưu lượng truy cập
- Booking theo giờ
- Lỗi hệ thống
- Hiệu năng API

---

# Công cụ đề xuất

- Grafana
- Prometheus
- Loki
- OpenTelemetry
- Sentry

---

# Claude Code Guidance

- Mỗi request có Correlation ID.
- Log ở định dạng JSON.
- Không log mật khẩu, token hoặc dữ liệu nhạy cảm.
- Tất cả exception phải được ghi nhận.

---

# Definition of Done

- Structured Logging
- Metrics Dashboard
- Alert Rules
- Audit Log
- Error Tracking
- Health Check Endpoint

---

**End of 19-Flight-Monitoring-Logging.md**
