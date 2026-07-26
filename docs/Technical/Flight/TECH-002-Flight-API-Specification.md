# TECH-002 – Flight API Specification

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-002-Flight-API-Specification.md`

---

# 1. Mục tiêu

Chuẩn hóa toàn bộ API cho Flight Module.

Thiết kế theo hướng RESTful, dễ thay thế Mock API bằng API thật trong tương lai.

---

# 2. Nguyên tắc

- JSON UTF-8
- HTTPS
- Bearer Token cho API quản trị
- Pagination thống nhất
- Response Format thống nhất
- Versioning: `/api/v1`

---

# 3. Chuẩn Response

## Success

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

## Error

```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Invalid request"
}
```

---

# 4. Public API

## Flight Search

```text
GET /api/v1/flights/search
```

Query

- from
- to
- departureDate
- returnDate
- adults
- children
- infants
- cabinClass

---

## Flight Detail

```text
GET /api/v1/flights/{flightId}
```

---

## Booking

```text
POST /api/v1/bookings
```

Body

- Contact
- Passengers
- Services

---

## Booking Detail

```text
GET /api/v1/bookings/{bookingCode}
```

---

## Payment

```text
POST /api/v1/payments
```

---

## Payment Status

```text
GET /api/v1/payments/{bookingCode}
```

---

# 5. CMS API

## Banner

```text
GET    /api/v1/admin/flight/banners
POST   /api/v1/admin/flight/banners
PATCH  /api/v1/admin/flight/banners/{id}
DELETE /api/v1/admin/flight/banners/{id}
```

---

## Flash Sale

```text
GET
POST
PATCH
DELETE
```

---

## Airline

```text
GET
POST
PATCH
DELETE
```

---

## Airport

```text
GET
POST
PATCH
DELETE
```

---

## FAQ

```text
GET
POST
PATCH
DELETE
```

---

## Article

```text
GET
POST
PATCH
DELETE
```

---

# 6. Authentication

Public API

- Không yêu cầu Login.

Admin API

- JWT.
- Refresh Token.
- RBAC.

---

# 7. Validation

- Required.
- UUID.
- Email.
- Phone.
- Slug.
- IATA Code.
- ICAO Code.

---

# 8. HTTP Status

200

201

400

401

403

404

409

422

500

---

# 9. Rate Limit

Public

```text
100 requests / minute / IP
```

Admin

```text
300 requests / minute / user
```

---

# 10. Logging

Ghi log:

- Request
- Response Time
- Error
- User
- IP

---

# 11. Điều kiện hoàn thành

- Toàn bộ API được chuẩn hóa.
- Có Mock API tương ứng.
- Có Interface TypeScript.
- Không phụ thuộc API hãng bay.
