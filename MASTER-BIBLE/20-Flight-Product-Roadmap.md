
# 20 - Flight Product Roadmap

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Tầm nhìn

Xây dựng Flight Platform trở thành nền tảng bán vé máy bay AI-Native, tích hợp sâu vào MV Travel OS và có khả năng mở rộng sang nhiều nhà cung cấp, nhiều thương hiệu và ứng dụng di động.

---

# Mục tiêu sản phẩm

## Ngắn hạn (0–3 tháng)

- MVP hoạt động ổn định
- Tra cứu chuyến bay
- Gửi yêu cầu booking
- Quản trị CMS
- Tích hợp nhà cung cấp đầu tiên
- Dashboard vận hành

## Trung hạn (3–12 tháng)

- Thanh toán trực tuyến
- AI hỗ trợ booking
- CRM khách hàng
- Automation
- Mobile PWA

## Dài hạn (1–3 năm)

- Multi-provider
- Dynamic Pricing
- Loyalty Program
- Affiliate Portal
- Mobile App
- AI Revenue Analytics

---

# Roadmap kỹ thuật

| Giai đoạn | Kết quả |
|-----------|----------|
| Foundation | Kiến trúc, DB, API, CMS |
| MVP | Booking vận hành |
| V1 | AI + CRM + Payment |
| V2 | Multi-provider + Automation |
| Enterprise | Multi-brand + Multi-tenant |

---

# Module Dependency

```text
Auth
 │
 ├── Customer
 ├── Booking
 │      ├── Passenger
 │      ├── Ticket
 │      └── Payment
 │
 ├── Notification
 ├── Reporting
 └── AI Assistant
```

---

# Sprint Plan

## Sprint 1

- Khởi tạo dự án
- Authentication
- Database
- Flight Request
- Booking

## Sprint 2

- CMS
- Payment
- Notification
- Reporting

## Sprint 3

- AI Assistant
- Analytics
- Monitoring
- Performance

---

# KPI

- Booking xử lý < 10 phút
- Uptime ≥ 99.9%
- Error Rate < 1%
- API Response < 500ms
- Test Coverage ≥ 80%

---

# Rủi ro

- Phụ thuộc API nhà cung cấp
- Thay đổi chính sách hãng
- Hiệu năng khi tăng tải
- Sai lệch dữ liệu

Giải pháp: Adapter Pattern, Monitoring, Backup và CI/CD.

---

# Điều kiện hoàn thành MVP

- Tìm kiếm chuyến bay
- Tạo booking
- Quản lý hành khách
- Theo dõi thanh toán
- Xuất vé (qua quy trình nghiệp vụ)
- CMS quản trị
- Audit Log
- Dashboard

---

# Claude Code Guidance

Triển khai theo Sprint.
Không phát triển tính năng ngoài phạm vi Sprint nếu chưa được cập nhật trong Product Bible.

---

# Definition of Done

- Roadmap được thống nhất
- Sprint rõ ràng
- KPI xác định
- Module dependency đầy đủ
- Có cơ sở để triển khai Sprint 1

---

**End of 20-Flight-Product-Roadmap.md**
