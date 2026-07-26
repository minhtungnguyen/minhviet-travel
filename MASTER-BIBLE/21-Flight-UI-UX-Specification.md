\
# 21 - Flight UI/UX Specification

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Định nghĩa tiêu chuẩn UI/UX cho Flight Platform nhằm mang lại trải nghiệm nhất quán, trực quan và tối ưu tỷ lệ chuyển đổi.

---

# Nguyên tắc thiết kế

- Mobile First
- Desktop Optimized
- AI Assisted Experience
- Accessibility (WCAG)
- Hiệu năng ưu tiên hàng đầu

---

# Luồng người dùng

```text
Trang chủ
   │
Tìm chuyến bay
   │
Kết quả tìm kiếm
   │
Chi tiết chuyến bay
   │
Thông tin hành khách
   │
Thanh toán
   │
Xác nhận
```

---

# Các màn hình chính

1. Homepage
2. Flight Search
3. Search Results
4. Flight Details
5. Passenger Information
6. Payment
7. Booking Confirmation
8. Order Lookup
9. User Profile

---

# Design System

## Typography

- Heading
- Subtitle
- Body
- Caption

## Spacing

- 4px Grid
- 8px Base Unit

## Components

- Button
- Input
- Card
- Badge
- Modal
- Table
- Pagination
- Toast

---

# UX Rules

- Không quá 3 bước để bắt đầu tìm kiếm.
- CTA luôn hiển thị rõ.
- Form có kiểm tra dữ liệu theo thời gian thực.
- Hiển thị Loading, Empty và Error State.

---

# Accessibility

- Keyboard Navigation
- Focus State
- ARIA Labels
- Độ tương phản đạt chuẩn

---

# SEO & Performance

- Server Rendering
- Lazy Loading
- Image Optimization
- Structured Data
- Core Web Vitals

---

# Claude Code Guidance

- Xây dựng Component Library dùng chung.
- Tách Presentation và Business Logic.
- Hạn chế re-render không cần thiết.

---

# Definition of Done

- Responsive
- Accessibility
- Design System thống nhất
- UX Flow hoàn chỉnh
- Core Web Vitals đạt mục tiêu

---

**End of 21-Flight-UI-UX-Specification.md**
