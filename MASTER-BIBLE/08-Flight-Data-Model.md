\
# 08 - Flight Data Model

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Mục tiêu

Tài liệu này mô tả mô hình dữ liệu cốt lõi của Flight Platform, đảm bảo hệ thống có thể mở rộng khi tích hợp nhiều nhà cung cấp API.

---

# Nguyên tắc

- Business Logic không phụ thuộc nhà cung cấp.
- Mỗi Entity có UUID riêng.
- Soft Delete mặc định.
- Audit Log cho mọi thay đổi.
- Chuẩn hóa CreatedBy, UpdatedBy.

---

# Domain Model

```text
Customer
    │
    ├──────────────┐
    ▼              │
FlightRequest      │
    │              │
    ▼              │
Booking ───────── Payment
    │
    ├────────────── Passenger
    │
    ├────────────── Ticket
    │
    └────────────── Invoice
```

---

# Core Entities

## Customer

| Field | Type |
|-------|------|
| id | UUID |
| full_name | String |
| phone | String |
| email | String |
| status | Enum |

---

## FlightRequest

Lưu yêu cầu ban đầu của khách.

| Field |
|------|
| departure_airport |
| arrival_airport |
| departure_date |
| return_date |
| adults |
| children |
| infants |
| cabin_class |

---

## Booking

Đơn đặt chỗ trung tâm.

Trạng thái:

- Draft
- Waiting Confirmation
- Confirmed
- Ticketed
- Completed
- Cancelled
- Refunded

---

## Passenger

Thông tin hành khách.

- Họ tên
- Ngày sinh
- Giới tính
- Quốc tịch
- Số giấy tờ
- Ngày hết hạn

---

## Ticket

Thông tin vé.

- Ticket Number
- Airline
- PNR
- Fare
- Tax
- Total Amount

---

## Payment

- Method
- Amount
- Currency
- Status
- Transaction Code

---

## Invoice

- Invoice Number
- Company Name
- Tax Code
- Address
- Email

---

# Quan hệ dữ liệu

- Một Customer có nhiều FlightRequest.
- Một FlightRequest sinh một hoặc nhiều Booking.
- Một Booking có nhiều Passenger.
- Một Passenger có một hoặc nhiều Ticket.
- Một Booking có nhiều Payment.

---

# Audit Fields

Mọi bảng đều phải có:

- id
- created_at
- updated_at
- deleted_at
- created_by
- updated_by
- version

---

# Claude Code Guidance

Không tạo quan hệ trực tiếp với API nhà cung cấp.

Mọi dữ liệu từ API phải đi qua Adapter Layer và Mapping Layer trước khi ghi vào cơ sở dữ liệu.

---

# Definition of Done

- Entity hoàn chỉnh
- Quan hệ rõ ràng
- Hỗ trợ mở rộng nhiều nhà cung cấp
- Sẵn sàng cho Supabase/PostgreSQL

---

**End of 08-Flight-Data-Model.md**
