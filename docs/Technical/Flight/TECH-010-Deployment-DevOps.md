# TECH-010 – Deployment & DevOps Specification

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-010-Deployment-DevOps.md`

---

# 1. Mục tiêu

Chuẩn hóa quy trình Build, Deploy và Vận hành Flight Module để đảm bảo triển khai ổn định, có khả năng rollback và dễ mở rộng.

---

# 2. Kiến trúc triển khai

```text
Developer
    │
GitHub
    │
CI Pipeline
    │
Build
    │
Test
    │
Deploy
    │
Production
```

---

# 3. Môi trường

## Local

- Developer
- Mock API
- Test Data

## Staging

- UAT
- QA
- Demo

## Production

- Người dùng cuối
- Monitoring đầy đủ

---

# 4. Công nghệ

- Next.js
- Node.js
- Supabase
- Vercel
- Docker (nếu triển khai VPS)
- GitHub Actions

---

# 5. CI Pipeline

Thực hiện theo thứ tự:

```text
Install
   │
Lint
   │
Type Check
   │
Unit Test
   │
Build
   │
Artifact
   │
Deploy
```

Nếu bất kỳ bước nào thất bại thì dừng Pipeline.

---

# 6. Biến môi trường

Tách riêng:

- .env.local
- .env.staging
- .env.production

Không commit file `.env` vào Git.

---

# 7. Migration

Nguyên tắc:

- Migration có version.
- Không sửa migration đã phát hành.
- Có khả năng rollback.

---

# 8. Rollback

Cho phép:

- Rollback ứng dụng.
- Rollback migration (nếu an toàn).
- Khôi phục cấu hình.

---

# 9. Monitoring

Theo dõi:

- Uptime
- API Error Rate
- Build Status
- Deployment History
- Response Time

---

# 10. Logging

Lưu:

- Application Log
- Error Log
- Audit Log
- Deployment Log

Không lưu dữ liệu nhạy cảm.

---

# 11. Backup

Khuyến nghị:

- Database Backup hằng ngày.
- Retention tối thiểu 30 ngày.
- Kiểm tra khả năng khôi phục định kỳ.

---

# 12. Release Strategy

- Semantic Versioning
- Release Notes
- Tag Git
- Triển khai theo từng phiên bản

Ví dụ:

```text
v1.0.0
v1.1.0
v1.1.1
```

---

# 13. Checklist trước Production

- Lint thành công.
- Type Check thành công.
- Build thành công.
- Unit Test đạt yêu cầu.
- E2E luồng chính thành công.
- Migration đã kiểm tra.
- Biến môi trường đầy đủ.
- Backup sẵn sàng.
- Rollback đã chuẩn bị.

---

# 14. Điều kiện hoàn thành

- Có CI/CD chuẩn hóa.
- Có quy trình rollback.
- Có monitoring và logging.
- Có backup.
- Có tài liệu Release.
- Có thể áp dụng chung cho Hotel, Tour, Cruise và các module khác của Minh Việt Travel Platform.
