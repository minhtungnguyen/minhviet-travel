# EPIC-001 – Flight Homepage

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-001-Homepage.md`

---

## 1. Mục tiêu

Xây dựng Homepage cho Flight Module của **Minh Việt Travel Platform** với các yêu cầu:

- Tỷ lệ chuyển đổi cao.
- Chuẩn SEO.
- Responsive trên Desktop, Tablet và Mobile.
- Tốc độ tải nhanh.
- Có thể tái sử dụng component cho các trang tiếp theo.
- Sẵn sàng kết nối API thật ở các Epic sau.

Epic này chỉ dùng Mock Data, chưa tích hợp API hãng bay.

---

## 2. Phạm vi

### Bao gồm

- Header.
- Hero Banner.
- Flight Search Box.
- Flash Sale.
- Popular Routes.
- Airlines.
- Travel Guide.
- FAQ.
- CTA Section.
- Footer.

### Không bao gồm

- Search Results.
- Flight Detail.
- Booking.
- Payment.
- Login.
- API hãng bay.
- CMS Admin.

---

## 3. UI cần có

### 3.1 Header

Bao gồm:

- Logo Minh Việt Travel.
- Menu chính.
- Hotline.
- Nút đăng nhập.
- Nút đăng ký.
- Sticky Header khi cuộn trang.

### 3.2 Hero Banner

Bao gồm:

- Hình nền du lịch hoặc hàng không.
- Tiêu đề chính.
- Mô tả ngắn.
- Flight Search Box nổi bật.

### 3.3 Flight Search Box

Bao gồm:

- Loại hành trình:
  - Một chiều.
  - Khứ hồi.
- Điểm đi.
- Điểm đến.
- Nút đổi chiều.
- Ngày đi.
- Ngày về.
- Số hành khách.
- Hạng ghế.
- Nút “Tìm chuyến bay”.

Yêu cầu:

- Có trạng thái hover.
- Có trạng thái focus.
- Có validation cơ bản.
- Có giao diện phù hợp Mobile.

### 3.4 Flash Sale

Hiển thị từ 4 đến 8 ưu đãi nổi bật.

Thông tin mỗi ưu đãi:

- Tên chương trình.
- Chặng bay.
- Giá từ.
- Thời hạn.
- Hình ảnh.
- Nút xem chi tiết.

### 3.5 Popular Routes

Ví dụ:

- Hải Phòng → TP.HCM.
- Hải Phòng → Đà Nẵng.
- Hải Phòng → Phú Quốc.
- Hà Nội → Đà Nẵng.
- Hà Nội → Nha Trang.
- TP.HCM → Phú Quốc.

Thông tin mỗi chặng:

- Điểm đi.
- Điểm đến.
- Giá từ.
- Hãng bay phổ biến.
- CTA “Xem chuyến bay”.

### 3.6 Airlines

Hiển thị logo và tên các hãng:

- Vietnam Airlines.
- Vietjet Air.
- Bamboo Airways.
- Vietravel Airlines.
- Các hãng quốc tế có thể bổ sung sau.

### 3.7 Travel Guide

Hiển thị 4 bài viết mới nhất.

Thông tin mỗi bài:

- Ảnh đại diện.
- Tiêu đề.
- Mô tả ngắn.
- Ngày đăng.
- Nút đọc tiếp.

### 3.8 FAQ

Hiển thị từ 5 đến 10 câu hỏi thường gặp.

Yêu cầu:

- Dạng Accordion.
- Chỉ mở một câu hỏi tại một thời điểm.
- Có schema FAQPage.

### 3.9 CTA Section

Bao gồm:

- Tiêu đề kêu gọi đặt vé.
- Nội dung ngắn.
- Hotline.
- Nút “Tìm chuyến bay”.
- Nút “Liên hệ tư vấn”.

### 3.10 Footer

Bao gồm:

- Thông tin doanh nghiệp.
- Địa chỉ.
- Hotline.
- Email.
- Chính sách.
- Liên kết nhanh.
- Mạng xã hội.
- Copyright.

---

## 4. Component

```text
Header
HeroBanner
FlightSearchBox
TripTypeTabs
AirportSelector
DateSelector
PassengerSelector
CabinClassSelector
FlashSaleSection
FlashSaleCard
PopularRoutesSection
PopularRouteCard
AirlinesSection
AirlineCard
TravelGuideSection
ArticleCard
FAQSection
FAQItem
CTASection
Footer
```

Nguyên tắc:

- Mỗi component nằm trong file riêng.
- Không viết toàn bộ trang trong một file.
- Component có props rõ ràng.
- Không hardcode dữ liệu trong UI component.
- Mock Data tách riêng.

---

## 5. Mock API

```text
GET /mock/flash-sales
GET /mock/popular-routes
GET /mock/airlines
GET /mock/articles
GET /mock/faqs
```

Cấu trúc thư mục đề xuất:

```text
apps/flight-web/
├── app/
├── components/
│   ├── flight/
│   ├── home/
│   └── shared/
├── data/
│   └── mock/
├── lib/
├── public/
└── types/
```

---

## 6. SEO

Bắt buộc có:

- Title.
- Meta Description.
- Canonical URL.
- Open Graph.
- Twitter Card.
- Organization Schema.
- WebSite Schema.
- SearchAction Schema.
- FAQPage Schema.
- BreadcrumbList Schema.
- Sitemap.
- Robots.txt.
- Một thẻ H1 duy nhất.
- Các section chính dùng H2.

Tiêu đề đề xuất:

```text
Vé Máy Bay Giá Tốt – Đặt Vé Nhanh Cùng Minh Việt Travel
```

Mô tả đề xuất:

```text
Tìm và đặt vé máy bay nội địa, quốc tế nhanh chóng cùng Minh Việt Travel. Hỗ trợ khách hàng tại Hải Phòng, tư vấn trực tiếp, giá minh bạch.
```

---

## 7. Responsive

### Desktop

- Bố cục tối đa 1440px.
- Search Box hiển thị ngang.
- Card hiển thị theo grid.

### Tablet

- Search Box chia thành hai hàng.
- Card từ 2 đến 3 cột.

### Mobile

- Search Box hiển thị dọc.
- Card một cột hoặc dạng kéo ngang.
- CTA và nút tìm kiếm full width.
- Header chuyển sang Mobile Menu.

---

## 8. Hiệu năng

Yêu cầu:

- Lighthouse Performance ≥ 90.
- Lighthouse SEO ≥ 95.
- Lighthouse Accessibility ≥ 90.
- LCP dưới 2.5 giây.
- CLS dưới 0.1.
- Ảnh dùng `next/image`.
- Font dùng `next/font`.
- Không tải thư viện không cần thiết.
- Có lazy loading cho section dưới màn hình đầu tiên.

---

## 9. Điều kiện hoàn thành

Epic được xem là hoàn thành khi:

- Homepage render đầy đủ.
- Responsive trên Desktop, Tablet và Mobile.
- Không có lỗi TypeScript.
- Không có lỗi ESLint.
- `npm run build` thành công.
- Dữ liệu lấy từ Mock Data.
- Không hardcode dữ liệu trực tiếp trong component.
- Có đầy đủ loading, empty và error state phù hợp.
- Có metadata và JSON-LD.
- Có README hướng dẫn chạy.
- Các component có thể tái sử dụng.

---

## 10. Checklist bàn giao Claude Code

Claude Code phải bàn giao:

- Source code Homepage.
- Danh sách component đã tạo.
- Mock Data.
- Type definitions.
- Metadata và schema.
- README hướng dẫn cài đặt và chạy.
- Kết quả kiểm tra:
  - TypeScript.
  - ESLint.
  - Build.
  - Responsive.
- Danh sách việc chưa làm và lý do.

---

## Lệnh giao việc cho Claude Code

```text
Đọc toàn bộ Product Bible của Minh Việt Travel Platform trước.

Sau đó đọc file:
docs/PRD/Flight/EPIC-001-Homepage.md

Triển khai đúng phạm vi Epic 001.

Không làm Search Results, Booking, Payment hoặc CMS.

Ưu tiên:
1. UI/UX
2. Responsive
3. SEO
4. Hiệu năng
5. Component tái sử dụng

Chỉ sử dụng Mock Data trong Epic này.

Trước khi kết thúc, phải chạy:
npm run lint
npm run typecheck
npm run build

Sau đó báo cáo:
- File đã tạo
- Component đã tạo
- Kết quả kiểm tra
- Việc chưa hoàn thành
```
