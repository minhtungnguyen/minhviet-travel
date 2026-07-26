\
# 13 - Flight Frontend Architecture

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Mục tiêu

Tài liệu này quy định kiến trúc Frontend cho Flight Platform nhằm đảm bảo giao diện hiện đại, dễ mở rộng và nhất quán trên toàn hệ sinh thái.

---

# Công nghệ

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

---

# Cấu trúc thư mục

```text
app/
components/
features/
  ├── flight-search
  ├── booking
  ├── passenger
  ├── payment
  └── ticket
services/
hooks/
lib/
types/
```

---

# Các màn hình chính

1. Trang chủ
2. Kết quả tìm kiếm
3. Chi tiết chuyến bay
4. Nhập thông tin hành khách
5. Thanh toán
6. Xác nhận
7. Tra cứu đơn hàng

---

# Component dùng chung

- Search Box
- Airport Selector
- Date Picker
- Passenger Selector
- Price Card
- Flight Card
- Stepper
- Status Badge
- Empty State
- Loading Skeleton

---

# Responsive

- Mobile First
- Tablet
- Desktop
- Wide Screen

---

# UI Rules

- Không quá 3 màu chủ đạo trên một màn hình.
- CTA luôn nổi bật.
- Font và spacing thống nhất.
- Ưu tiên tốc độ tải.

---

# State Management

- Server State: TanStack Query
- UI State: React Context
- Form State: React Hook Form

---

# SEO

- Dynamic Metadata
- Structured Data
- Open Graph
- Canonical URL
- Sitemap

---

# Claude Code Guidance

- Component phải tái sử dụng.
- Không viết logic API trong component.
- Không hard-code dữ liệu.
- Ưu tiên Server Components khi phù hợp.

---

# Definition of Done

- Responsive
- Accessibility
- Dark Mode Ready
- Loading State
- Error State
- Empty State

---

**End of 13-Flight-Frontend.md**
