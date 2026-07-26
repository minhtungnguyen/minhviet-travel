\
# 18 - Flight Deployment Architecture

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Thiết lập quy trình triển khai (Deployment) an toàn, tự động hóa và có khả năng mở rộng cho Flight Platform, đảm bảo việc phát hành phiên bản mới diễn ra ổn định và hạn chế tối đa thời gian gián đoạn.

---

# Môi trường triển khai

- Local Development
- Development
- Staging
- Production

Mỗi môi trường có cấu hình và dữ liệu tách biệt.

---

# Kiến trúc triển khai

```text
Developer
    │
GitHub
    │
CI Pipeline
    │
Build
    │
Automated Tests
    │
Deploy Staging
    │
Approval
    │
Deploy Production
```

---

# Công nghệ đề xuất

- GitHub
- GitHub Actions / Jenkins
- Docker
- Vercel (Frontend)
- VPS / Cloud (Backend)
- Supabase (Database)
- Cloud Storage

---

# Quy trình phát hành

1. Tạo Feature Branch
2. Pull Request
3. Code Review
4. Automated Tests
5. Merge vào Main
6. Deploy Staging
7. User Acceptance Test (UAT)
8. Deploy Production

---

# Versioning

Áp dụng Semantic Versioning:

- MAJOR: Thay đổi lớn
- MINOR: Thêm tính năng
- PATCH: Sửa lỗi

Ví dụ:

- 1.0.0
- 1.1.0
- 1.1.2

---

# Rollback Strategy

- Lưu phiên bản trước
- Database Migration có kế hoạch rollback
- Khôi phục trong thời gian ngắn khi phát sinh lỗi nghiêm trọng

---

# Monitoring sau triển khai

- Kiểm tra trạng thái dịch vụ
- Theo dõi lỗi
- Theo dõi hiệu năng
- Theo dõi log

---

# Claude Code Guidance

- Không deploy trực tiếp từ máy cá nhân.
- Mọi thay đổi phải qua CI/CD.
- Có kiểm tra chất lượng trước Production.
- Hạn chế downtime.

---

# Definition of Done

- Pipeline CI/CD hoạt động
- Tự động Build & Test
- Deploy Staging
- Deploy Production
- Rollback Strategy
- Versioning rõ ràng

---

**End of 18-Flight-Deployment-Architecture.md**
