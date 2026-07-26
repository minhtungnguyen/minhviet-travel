# EPIC-008 – SEO Landing Engine

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-008-SEO-Landing-Engine.md`

---

## 1. Mục tiêu

Xây dựng hệ thống Landing Page SEO cho Flight Module nhằm tăng lưu lượng truy cập tự nhiên và hỗ trợ mở rộng nội dung mà không cần tạo thủ công từng trang.

---

## 2. Existing System Impact

- Không sửa module B2B.
- Không thay đổi route hiện có.
- Tạo mới các route SEO dưới `/ve-may-bay`.

---

## 3. Phạm vi

### Bao gồm

- Landing theo tỉnh/thành.
- Landing theo sân bay.
- Landing theo chặng bay.
- Landing theo hãng bay.
- Metadata động.
- JSON-LD.
- Breadcrumb.
- Sitemap tự sinh.
- Canonical.

### Không bao gồm

- AI sinh nội dung.
- API hãng bay.
- Blog CMS.

---

## 4. Route SEO

```text
/ve-may-bay

/ve-may-bay/hai-phong

/ve-may-bay/ha-noi

/ve-may-bay/ho-chi-minh

/ve-may-bay/hai-phong/ho-chi-minh

/ve-may-bay/ha-noi/da-nang

/ve-may-bay/vietnam-airlines

/ve-may-bay/vietjet-air
```

---

## 5. Nội dung mỗi Landing

- H1 duy nhất.
- Giới thiệu ngắn.
- Flight Search Box.
- Giá tham khảo.
- Chặng liên quan.
- Hãng bay khai thác.
- FAQ.
- CTA.
- Internal Link.

---

## 6. Component

```text
SeoLandingPage
HeroSection
FlightSearchBox
PriceTable
PopularRoutes
AirlineList
FAQSection
CTASection
Breadcrumb
RelatedLinks
```

---

## 7. Data Model

```text
SeoLanding

id
slug
title
description
h1
content
cityFrom
cityTo
airline
status
seoTitle
seoDescription
canonical
updatedAt
```

---

## 8. Mock API

```text
GET /mock/seo-landings

GET /mock/seo-landing/{slug}
```

---

## 9. SEO

Bắt buộc:

- Metadata động.
- Canonical.
- robots.
- sitemap.
- BreadcrumbList.
- FAQPage.
- Organization.
- Website.
- Open Graph.
- Twitter Card.
- URL thân thiện.

---

## 10. Responsive

- Desktop.
- Tablet.
- Mobile.

Toàn bộ Landing sử dụng chung Design System.

---

## 11. Validation

- Slug không trùng.
- Canonical hợp lệ.
- Thiếu H1 không cho Publish.
- Thiếu Meta Description cảnh báo.

---

## 12. Điều kiện hoàn thành

- Landing hoạt động bằng Mock Data.
- Metadata sinh động.
- Sitemap tạo thành công.
- Responsive.
- Không lỗi TypeScript.
- npm run build thành công.

---

## 13. Checklist bàn giao

Claude Code bàn giao:

- Source code.
- Dynamic Route.
- Metadata.
- JSON-LD.
- Sitemap.
- Mock Data.
- README.
- Build Report.

---

## Lệnh giao Claude Code

```text
Đọc Product Bible.

Đọc:

docs/PRD/Flight/EPIC-008-SEO-Landing-Engine.md

Triển khai đúng Epic 008.

Chỉ dùng Mock Data.

Không tích hợp AI sinh nội dung.

Không sửa module B2B.

Hoàn thành phải chạy:

npm run lint
npm run typecheck
npm run build

Báo cáo:

- Route đã tạo.
- Metadata.
- Sitemap.
- Component.
- Kết quả build.
```
