\
# 29 - Engineering Coding Standards

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Thiết lập bộ tiêu chuẩn kỹ thuật thống nhất để mọi lập trình viên và AI Coding Agent phát triển Flight Platform theo cùng một quy ước, giảm lỗi và tăng khả năng bảo trì.

---

# Nguyên tắc cốt lõi

- Readability over Cleverness
- Convention over Configuration
- Clean Architecture
- SOLID Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)

---

# Quy ước đặt tên

## File

- kebab-case
- Ví dụ: `flight-service.ts`

## Component React

- PascalCase
- Ví dụ: `FlightCard.tsx`

## Function

- camelCase
- Ví dụ: `calculateFare()`

## Database

- Table: snake_case, số nhiều
- Column: snake_case
- Primary Key: UUID

---

# Cấu trúc Module

```text
module/
├── controller
├── service
├── repository
├── dto
├── entity
├── validator
├── tests
└── index
```

---

# API Standards

- RESTful API
- Versioning: `/api/v1`
- HTTP Status Code chuẩn
- Response theo định dạng thống nhất

---

# Error Handling

- Không trả về Stack Trace cho client
- Dùng Error Code chuẩn
- Ghi đầy đủ log phía server
- Có Correlation ID

---

# Git Workflow

- main
- develop
- feature/*
- hotfix/*
- release/*

---

# Commit Convention

- feat:
- fix:
- refactor:
- docs:
- test:
- chore:
- perf:

Ví dụ:

```text
feat(flight): add booking approval workflow
```

---

# Pull Request Checklist

- Có mô tả thay đổi
- Đã chạy test
- Không còn lỗi lint
- Đã cập nhật tài liệu nếu cần
- Được review trước khi merge

---

# Logging Standard

Mọi log cần có:

- Timestamp
- Service
- Level
- Correlation ID
- Message

---

# Claude Code Guidance

- Không viết Business Logic trong UI.
- Không hard-code giá trị cấu hình.
- Tất cả module phải có Unit Test.
- Ưu tiên tái sử dụng component và service.

---

# Definition of Done

- Coding Standards được áp dụng
- Commit Convention thống nhất
- Pull Request Checklist
- Error Handling chuẩn
- Logging chuẩn
- Có khả năng mở rộng lâu dài

---

**End of 29-Engineering-Coding-Standards.md**
