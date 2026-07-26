\
# 30 - Repository Structure & Development Workflow (Claude Code Playbook)

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Định nghĩa cấu trúc Repository và quy trình phát triển chuẩn cho toàn bộ **MV Travel OS**, giúp Claude Code và đội ngũ phát triển triển khai thống nhất trên mọi module.

---

# Kiến trúc Repository

Khuyến nghị **Monorepo**.

```text
mv-travel-os/
│
├── apps/
│   ├── flight
│   ├── hotel
│   ├── tour
│   ├── cruise
│   ├── cms
│   └── admin
│
├── packages/
│   ├── ui
│   ├── auth
│   ├── database
│   ├── ai
│   ├── notification
│   ├── payment
│   └── shared
│
├── docs/
├── infrastructure/
├── scripts/
└── .github/
```

---

# Thứ tự đọc Product Bible

1. 00–06: Vision & Foundation
2. 07–20: Flight Architecture
3. 21–25: Product & Operations
4. 26–30: AI & Engineering Rules

Không triển khai tính năng khi chưa đọc các tài liệu liên quan.

---

# Quy trình phát triển

```text
Product Bible
      │
Architecture Review
      │
Sprint Planning
      │
Implementation
      │
Testing
      │
Code Review
      │
Deployment
      │
Monitoring
```

---

# Sprint Workflow

- Sprint Planning
- Task Breakdown
- Development
- Pull Request
- Review
- Merge
- Release
- Retrospective

---

# Checklist trước khi Code

- Đọc Product Bible
- Kiểm tra kiến trúc liên quan
- Xác nhận API & Database
- Xác nhận Acceptance Criteria

---

# Checklist trước khi Merge

- Unit Test đạt
- Lint sạch
- Không còn TODO quan trọng
- Đã cập nhật tài liệu nếu thay đổi kiến trúc

---

# Checklist trước Production

- Backup
- Migration
- Smoke Test
- Monitoring
- Rollback Plan

---

# Vai trò

## ChatGPT

- Product Architect
- Solution Architect
- Business Analysis
- Product Bible
- Sprint Planning

## Claude Code

- Engineering
- Implementation
- Refactoring
- Testing
- Deployment Support

---

# Definition of Done

- Repository chuẩn
- Workflow thống nhất
- Checklist đầy đủ
- Sprint Process rõ ràng
- Có thể mở rộng cho mọi module của MV Travel OS

---

# Kết luận

30 tài liệu Foundation là nền tảng để triển khai Sprint 1. Mọi thay đổi kiến trúc lớn cần được cập nhật trước vào Product Bible, sau đó mới triển khai mã nguồn nhằm duy trì tính nhất quán của hệ thống.

---

**End of 30-Repository-Structure-Development-Workflow.md**
