# TECH-001 – Flight Database Schema

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-001-Database-Schema.md`

---

## 1. Mục tiêu

Định nghĩa các bảng dữ liệu cốt lõi cho Flight Module để toàn bộ Epic 001–008 sử dụng thống nhất.

---

## 2. Nguyên tắc

- UUID cho khóa chính.
- Soft Delete khi cần.
- createdAt / updatedAt bắt buộc.
- createdBy / updatedBy nếu là dữ liệu CMS.

---

## 3. Danh sách bảng

```text
airlines
airports
routes
flight_search_logs
bookings
booking_passengers
booking_services
payments
flight_banners
flight_flash_sales
flight_articles
flight_faqs
seo_landings
```

---

## 4. Mô tả ngắn

### airlines

- id
- iata_code
- icao_code
- name
- logo
- country
- status

### airports

- id
- iata_code
- name
- city
- country
- timezone
- latitude
- longitude

### routes

- id
- from_airport_id
- to_airport_id
- distance
- status

### bookings

- id
- booking_code
- contact_name
- email
- phone
- total_amount
- payment_status
- booking_status
- created_at

### booking_passengers

- id
- booking_id
- full_name
- passenger_type
- gender
- birthday
- nationality

### payments

- id
- booking_id
- method
- amount
- status
- transaction_code

---

## 5. Quan hệ

```text
Airport 1 ---- n Route

Booking 1 ---- n Passenger

Booking 1 ---- n Payment
```

---

## 6. Quy ước

- Không lưu dữ liệu hãng bay thật ở Epic hiện tại.
- Mock Data phải đúng cấu trúc bảng.
- Tất cả Entity dùng TypeScript Interface.

---

## 7. Điều kiện hoàn thành

- Claude Code tạo đầy đủ model.
- Migration chạy thành công.
- Không tạo bảng trùng chức năng.
