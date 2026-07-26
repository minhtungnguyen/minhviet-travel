# TECH-006 – State Management Specification

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-006-State-Management.md`

---

# 1. Mục tiêu

Chuẩn hóa cách quản lý trạng thái (State) trong Flight Module để Frontend dễ mở rộng, dễ bảo trì và không trùng lặp logic.

---

# 2. Nguyên tắc

- Tách UI State và Server State.
- Không lưu dữ liệu API vào Local State nếu không cần.
- Mỗi Store chỉ quản lý một domain.
- Không để Component chia sẻ state trực tiếp.

---

# 3. Công nghệ đề xuất

## Server State

- TanStack Query (React Query)

Quản lý:

- Flight Search
- Flight Detail
- Booking Detail
- Payment Status
- CMS List

## Client State

- Zustand

Quản lý:

- Bộ lọc tìm kiếm
- Hành khách
- Ngôn ngữ
- Theme
- Sidebar
- Booking Draft

---

# 4. Store đề xuất

```text
searchStore
bookingStore
paymentStore
userPreferenceStore
cmsStore
```

---

# 5. Cache Strategy

| Dữ liệu | Cache |
|---------|------:|
| Flight Search | 5 phút |
| Flight Detail | 10 phút |
| Airline | 24 giờ |
| Airport | 24 giờ |
| FAQ | 24 giờ |
| SEO Landing | 24 giờ |

---

# 6. Loading State

Mỗi màn hình phải có:

- Skeleton Loading
- Error State
- Empty State
- Retry Button

Không sử dụng spinner toàn màn hình nếu có thể hiển thị skeleton.

---

# 7. Mutation

Các thao tác ghi dữ liệu:

- Create Booking
- Payment
- Refund Request
- Change Request
- CMS CRUD

Quy trình:

```text
Validate
    │
    ▼
Submit
    │
    ▼
Loading
    │
    ▼
Success / Error
```

---

# 8. Đồng bộ dữ liệu

Sau khi Mutation thành công:

- Invalidate Query liên quan.
- Không reload toàn trang.
- Chỉ cập nhật dữ liệu thay đổi.

---

# 9. Persistence

Chỉ lưu cục bộ:

- Theme
- Language
- Booking Draft (tạm)
- Search History (tùy chọn)

Không lưu:

- Payment
- JWT nhạy cảm
- Thông tin thẻ

---

# 10. Điều kiện hoàn thành

- Server State dùng React Query.
- Client State dùng Zustand.
- Cache nhất quán.
- Không phát sinh vòng lặp render.
- Có thể tái sử dụng cho Hotel, Tour và Cruise.
