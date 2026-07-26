# TECH-004 – Flight Component Library

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-004-Flight-Component-Library.md`

---

# 1. Mục tiêu

Chuẩn hóa toàn bộ Component sử dụng trong Flight Module.

Mỗi Component phải độc lập, tái sử dụng được và tuân thủ Design System.

---

# 2. Cấu trúc thư mục

```text
components/
└── flight/
    ├── search/
    ├── booking/
    ├── payment/
    ├── seo/
    ├── cms/
    ├── shared/
    └── ui/
```

---

# 3. Quy chuẩn Component

Mỗi Component cần có:

- Props Interface
- Default Props
- Loading State
- Empty State
- Error State
- Disabled State
- Responsive
- Accessibility (ARIA)
- Unit Test (khuyến nghị)

---

# 4. Component theo nhóm

## Search

- FlightSearchBox
- PassengerSelector
- DatePicker
- AirportSelector
- CabinSelector
- SearchButton

## Search Result

- FlightCard
- AirlineLogo
- FlightTimeline
- PriceBadge
- FilterSidebar
- SortDropdown
- Pagination

## Booking

- BookingSummary
- PassengerForm
- ContactForm
- AncillaryServiceCard
- FareRuleCard

## Payment

- PaymentMethodCard
- QRCodeCard
- BankTransferCard
- PaymentStatusBadge
- CountdownTimer

## My Booking

- BookingSearchForm
- BookingDetailCard
- PassengerList
- RefundRequestDialog
- ChangeRequestDialog

## SEO

- HeroBanner
- Breadcrumb
- FAQAccordion
- RelatedRouteCard
- AirlineCard

## CMS

- DataTable
- StatusBadge
- RichTextEditor
- ImageUploader
- PublishActionBar
- PreviewDrawer

---

# 5. Component Interface

Ví dụ:

```typescript
interface FlightCardProps {
  flightId: string
  airline: string
  departureTime: string
  arrivalTime: string
  price: number
  currency: string
  onSelect: () => void
}
```

Không truyền dữ liệu dư thừa.

---

# 6. Quy ước đặt tên

- PascalCase cho Component
- camelCase cho Props
- Không viết tắt khó hiểu

Ví dụ:

```text
FlightSearchBox
BookingSummary
PaymentStatusBadge
```

---

# 7. Events

Các Component chỉ phát ra Event cần thiết.

Ví dụ:

- onSearch
- onSelect
- onSubmit
- onCancel
- onRetry
- onChange

---

# 8. Styling

- Tailwind CSS
- Design Tokens
- Không hard-code màu sắc
- Không inline style nếu không cần

---

# 9. Khả năng tái sử dụng

Ưu tiên thiết kế để có thể dùng cho:

- Flight
- Hotel
- Cruise
- Tour
- Ticket

---

# 10. Performance

- Lazy Loading khi phù hợp
- Dynamic Import cho Component lớn
- Memo hóa Component tốn tài nguyên
- Skeleton Loading thay vì Spinner kéo dài

---

# 11. Accessibility

- Keyboard Navigation
- Focus Ring
- ARIA Label
- Alt Text
- Semantic HTML

---

# 12. Điều kiện hoàn thành

- Component độc lập
- Không phụ thuộc Mock Data
- Có Interface TypeScript
- Tương thích Design System
- Có thể tái sử dụng ở các module khác
