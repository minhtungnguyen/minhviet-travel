\
# 16 - Flight Security Architecture

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Thiết lập kiến trúc bảo mật cho Flight Platform theo nguyên tắc **Security by Design**, đảm bảo an toàn cho dữ liệu khách hàng, giao dịch và tích hợp API.

---

# Mục tiêu bảo mật

- Bảo mật dữ liệu cá nhân
- Bảo vệ giao dịch
- Chống truy cập trái phép
- Đảm bảo tính toàn vẹn dữ liệu
- Khả năng truy vết

---

# Security Layers

```text
Internet
   │
WAF / CDN
   │
API Gateway
   │
Authentication
   │
Authorization (RBAC)
   │
Business Services
   │
Database
```

---

# Authentication

- JWT Access Token
- Refresh Token
- MFA (tùy chọn)
- Session Timeout
- Password Hash (Argon2/Bcrypt)

---

# Authorization

Áp dụng RBAC:

- Super Admin
- Admin
- Booking
- Accountant
- Customer Service
- Viewer

Nguyên tắc: **Least Privilege**.

---

# Data Protection

- HTTPS bắt buộc
- Mã hóa dữ liệu nhạy cảm
- Secret lưu trong Vault/Environment
- Không lưu thông tin thẻ thanh toán

---

# API Security

- Rate Limiting
- IP Whitelist (khi cần)
- Request Validation
- CORS
- API Versioning

---

# Audit & Monitoring

Lưu:

- User
- Action
- Timestamp
- IP
- Device
- Before/After Data

---

# Backup & Recovery

- Daily Backup
- Point-in-Time Recovery
- Kiểm tra khôi phục định kỳ
- Offsite Backup

---

# Incident Response

1. Phát hiện
2. Cô lập
3. Điều tra
4. Khắc phục
5. Báo cáo
6. Rút kinh nghiệm

---

# Claude Code Guidance

- Không hard-code Secret.
- Kiểm tra quyền ở Backend.
- Validate toàn bộ input.
- Ghi Audit Log cho thao tác quan trọng.

---

# Definition of Done

- RBAC hoàn chỉnh
- JWT hoạt động
- HTTPS Only
- Audit Log
- Backup Strategy
- Security Review hoàn thành

---

**End of 16-Flight-Security-Architecture.md**
