\
# 15 - Flight Database Design

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Thiết kế cơ sở dữ liệu chuẩn hóa cho Flight Platform, đảm bảo khả năng mở rộng, hiệu năng và dễ bảo trì.

---

# Database Engine

- PostgreSQL (Supabase)
- UTF-8
- UUID làm khóa chính
- Soft Delete
- Audit Fields

---

# Core Tables

```text
customers
flight_requests
bookings
passengers
tickets
payments
payment_transactions
airlines
airports
routes
notifications
audit_logs
users
roles
permissions
```

---

# Quan hệ dữ liệu

```text
Customer
   │1
   │
   ├───────────────∞ FlightRequest
                           │1
                           │
                           ├────────────∞ Booking
                                         │1
                                         │
                                         ├──────∞ Passenger
                                         │
                                         ├──────∞ Ticket
                                         │
                                         └──────∞ Payment
```

---

# Quy ước đặt tên

- snake_case
- Bảng số nhiều
- UUID cho PK
- created_at
- updated_at
- deleted_at
- created_by
- updated_by

---

# Chỉ mục (Indexes)

Tạo index cho:

- booking_code
- customer_email
- customer_phone
- departure_date
- airline_code
- ticket_number
- payment_status

---

# Audit Fields

Mọi bảng nghiệp vụ cần có:

- created_at
- updated_at
- deleted_at
- created_by
- updated_by

---

# Backup Strategy

- Daily Backup
- Point-in-Time Recovery
- Monthly Snapshot
- Offsite Backup

---

# Claude Code Guidance

- Prisma Schema là nguồn dữ liệu chuẩn.
- Không truy cập SQL trực tiếp trong Business Logic.
- Migration phải có version.
- Không xóa cứng dữ liệu nghiệp vụ.

---

# Definition of Done

- ERD hoàn chỉnh
- Migration chuẩn
- Index tối ưu
- Backup Strategy
- Audit Fields
- Soft Delete

---

**End of 15-Flight-Database-Design.md**
