# 11 - Flight API Architecture

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Mục tiêu

Định nghĩa kiến trúc tích hợp API của Flight Platform để hệ thống có thể kết nối nhiều nhà cung cấp mà không làm thay đổi Business Logic.

---

# Nguyên tắc

- Business Logic độc lập với nhà cung cấp.
- Có thể thay đổi hoặc bổ sung nhà cung cấp mà không sửa Frontend.
- Chuẩn hóa dữ liệu trước khi lưu vào hệ thống.

---

# Kiến trúc

```text
Frontend
    │
    ▼
API Gateway
    │
    ▼
Flight Service
    │
    ├────────────── Adapter: Provider A
    ├────────────── Adapter: Provider B
    ├────────────── Adapter: Provider C
    │
    ▼
Mapping Layer
    │
    ▼
MV Travel Domain Model
    │
    ▼
Database
```

---

# API Gateway

Chức năng:

- Authentication
- Authorization
- Rate Limiting
- Logging
- Request Validation
- Response Standardization

---

# Adapter Layer

Mỗi nhà cung cấp phải có Adapter riêng.

Ví dụ:

- BGT Adapter
- Sabre Adapter
- Amadeus Adapter
- Galileo Adapter

Adapter chịu trách nhiệm:

- Kết nối API
- Mapping Request
- Mapping Response
- Retry
- Error Handling

---

# Mapping Layer

Không để dữ liệu từ nhà cung cấp ghi trực tiếp vào Database.

Mapping về chuẩn nội bộ:

- Airline
- Airport
- Flight
- Fare
- Booking
- Ticket

---

# API Standards

## Response

```json
{
  "success": true,
  "message": "",
  "data": {},
  "meta": {}
}
```

## Error

```json
{
  "success": false,
  "error_code": "FLIGHT_NOT_FOUND",
  "message": "No available flight."
}
```

---

# Logging

Lưu:

- Request Time
- Response Time
- Provider
- Endpoint
- Duration
- Status
- Correlation ID

---

# Retry Policy

- Timeout: Retry tối đa 2 lần.
- Không retry với lỗi xác thực.
- Có Circuit Breaker khi Provider lỗi liên tục.

---

# Security

- API Key Vault
- Secret Rotation
- HTTPS Only
- IP Whitelist (nếu cần)
- Audit Log

---

# Claude Code Guidance

- Không gọi API trực tiếp từ UI.
- Tất cả truy cập thông qua API Gateway.
- Adapter phải tuân thủ Interface chung.
- Không hard-code Provider.

---

# Definition of Done

- API Gateway hoàn chỉnh
- Adapter Pattern
- Mapping Layer
- Logging
- Monitoring
- Retry Strategy
- Error Standard

---

**End of 11-Flight-API-Architecture.md**
