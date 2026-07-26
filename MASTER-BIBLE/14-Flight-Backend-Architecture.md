
# 14 - Flight Backend Architecture

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Định nghĩa kiến trúc Backend cho Flight Platform theo hướng Domain-Driven, dễ mở rộng và phù hợp với MV Travel OS.

## Công nghệ

- Node.js
- NestJS (khuyến nghị) hoặc Next.js Route Handlers
- TypeScript
- PostgreSQL (Supabase)
- Prisma ORM
- Redis
- BullMQ
- OpenAPI

## Kiến trúc

```text
Client
  │
API Gateway
  │
Authentication
  │
Application Layer
  │
Domain Layer
  │
Infrastructure Layer
  │
PostgreSQL / Redis / Object Storage
```

## Domain Modules

- Auth
- Customer
- Flight Request
- Booking
- Passenger
- Ticket
- Payment
- Notification
- Reporting
- Audit

## Nguyên tắc

- Business Logic không nằm trong Controller.
- Repository chỉ truy cập dữ liệu.
- Service không phụ thuộc nhà cung cấp API.
- Event-driven cho các tác vụ bất đồng bộ.

## Queue

Dùng hàng đợi cho:

- Gửi email
- Đồng bộ API
- Sinh báo cáo
- Thông báo

## Logging

- Structured Logging
- Correlation ID
- Audit Log
- Error Tracking

## Security

- JWT
- RBAC
- Rate Limit
- Input Validation
- Secret Management

## Claude Code Guidance

- Mỗi module độc lập.
- Dependency Injection.
- Unit Test cho Service.
- OpenAPI sinh tự động.

## Definition of Done

- Module hóa hoàn chỉnh
- REST API chuẩn
- Queue hoạt động
- Logging & Monitoring
- CI/CD sẵn sàng

**End of 14-Flight-Backend-Architecture.md**
