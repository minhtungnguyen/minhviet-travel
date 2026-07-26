# TECH-003 – Flight UI Design System

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-003-Flight-UI-Design-System.md`

---

# 1. Mục tiêu

Thiết lập Design System thống nhất cho toàn bộ Flight Module, đảm bảo các Epic 001–008 có giao diện nhất quán và dễ mở rộng.

---

# 2. Design Principles

- Hiện đại, tối giản.
- Ưu tiên tốc độ tìm kiếm và đặt vé.
- Responsive Mobile First.
- Tuân thủ WCAG AA.
- Không tạo component trùng chức năng.

---

# 3. Design Tokens

## Typography

- Font: Inter
- H1: 40px / 700
- H2: 32px / 700
- H3: 24px / 600
- Body: 16px / 400
- Caption: 14px / 400

## Spacing

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px
```

## Radius

```text
8 / 12 / 16 px
```

## Shadow

- Small
- Medium
- Large

---

# 4. Color System

## Primary

- Primary 500
- Primary 600
- Primary 700

## Neutral

- Gray 50 → Gray 900

## Semantic

- Success
- Warning
- Error
- Info

Không sử dụng màu trực tiếp trong component; tất cả dùng Design Tokens.

---

# 5. Layout

Desktop

- Max Width: 1440px
- Content: 1280px

Tablet

- 768–1023px

Mobile

- 360–767px

---

# 6. Iconography

- Lucide Icons
- SVG
- Kích thước: 16 / 20 / 24 px

---

# 7. Component Standards

Các component phải hỗ trợ:

- Loading
- Empty
- Error
- Disabled
- Hover
- Focus
- Active

---

# 8. Accessibility

- Keyboard Navigation
- Visible Focus
- ARIA Label
- Alt Text
- Contrast đạt WCAG AA

---

# 9. Responsive Rules

- Grid 12 cột Desktop
- Grid 8 cột Tablet
- Grid 4 cột Mobile

CTA luôn nằm trong vùng dễ thao tác.

---

# 10. Naming Convention

```text
FlightSearchBox
FlightCard
BookingSummary
PaymentCard
SeoLandingHero
```

PascalCase cho Component.

---

# 11. Điều kiện hoàn thành

- Áp dụng cho toàn bộ Flight Module.
- Không có component dùng style riêng lẻ ngoài token.
- Tương thích Tailwind CSS.
- Dễ tái sử dụng cho Hotel, Cruise và Tour.
