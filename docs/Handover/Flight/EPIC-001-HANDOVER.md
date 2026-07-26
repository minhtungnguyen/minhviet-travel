# EPIC-001 — Flight Homepage: Handover

**Module:** Flight
**Route:** `/ve-may-bay`
**PRD:** `docs/PRD/Flight/EPIC-001-Flight-Homepage.md`
**Status:** Code complete, mock data only. Committed at `78e5491` (platform foundation), `e2a9880` (this epic), `76373b4` (unrelated homepage fixes carried in the same session). Tagged `epic-001-complete`.

---

## 1. Mục tiêu

Xây dựng Homepage cho Flight Module (B2C) của Minh Việt Travel Platform: tỷ lệ chuyển đổi cao, chuẩn SEO, responsive, tốc độ tải nhanh, component tái sử dụng cho các Epic sau, sẵn sàng thay Mock Data bằng API/CMS thật mà không cần viết lại UI. Epic này **chỉ dùng Mock Data** — không có Search Results, Booking, Payment, Login, API hãng bay thật, hay CMS Admin.

---

## 2. Những gì đã hoàn thành

Toàn bộ phạm vi UI trong PRD §3: Header/Footer (dùng lại `SiteChrome` có sẵn), Hero Banner, Flight Search Box (trip-type tabs, airport selector có đổi chiều, date selector, passenger selector, cabin-class selector, validation Zod, trạng thái xác nhận sau submit), Flash Sale, Popular Routes, Airlines, Travel Guide, FAQ (accordion, chỉ mở một câu), CTA Section. SEO đầy đủ: title/description/canonical/OG/Twitter Card qua `generateMetadata`, JSON-LD Organization + WebSite/SearchAction + FAQPage + BreadcrumbList, và `/ve-may-bay` đã có trong `app/sitemap.ts` với `changeFrequency: daily`, `priority: 0.8`.

Trang phân biệt rõ với `/flights` (module B2B doanh nghiệp hiện có) — không đụng vào route đó.

---

## 3. File tạo mới

```
app/ve-may-bay/page.tsx
app/ve-may-bay/loading.tsx
app/ve-may-bay/error.tsx

components/flight/flight-hero.tsx
components/flight/flight-search-box.tsx
components/flight/flight-trip-type-tabs.tsx
components/flight/flight-airport-selector.tsx
components/flight/flight-date-selector.tsx
components/flight/flight-passenger-selector.tsx
components/flight/flight-cabin-class-selector.tsx
components/flight/flight-flash-sale-section.tsx
components/flight/flight-flash-sale-card.tsx
components/flight/flight-popular-routes-section.tsx
components/flight/flight-popular-route-card.tsx
components/flight/flight-airlines-section.tsx
components/flight/flight-airline-card.tsx
components/flight/flight-travel-guide-section.tsx
components/flight/flight-article-card.tsx
components/flight/flight-faq-section.tsx
components/flight/flight-final-cta.tsx

lib/flight/flight-data-seed.ts
lib/flight/flight-repository.ts
lib/flight/flight-schema.ts
lib/flight/flight-schema.test.ts

types/flight.ts

docs/PRD/Flight/EPIC-001-Flight-Homepage.md   (+ EPIC-002..008, scoping future epics)
docs/Technical/Flight/TECH-001..010-*.md      (technical specs for the whole Flight module)
```

## 4. File sửa

- `components/seo/json-ld.tsx` — thêm `FlightHomeJsonLd` (thuần cộng thêm, không đổi component nào có sẵn).
- `app/sitemap.ts` — thêm một dòng cho `/ve-may-bay`.
- `README.md` — file mới, mô tả cách chạy dự án + mục "EPIC-001 — Flight Homepage".

---

## 5. Component

Đúng danh sách component trong PRD §4 (19 component, mỗi component một file trong `components/flight/`), không có component nào viết gộp cả trang trong một file. `FlightSearchBox` là component phức tạp nhất, tự quản lý state (trip type, sân bay, ngày, hành khách, hạng ghế) và validate bằng `flightSearchInputSchema` trước khi hiển thị xác nhận.

## 6. API

**Không có API thật.** Theo đúng phạm vi Epic 001. Điểm nối duy nhất với dữ liệu là `getFlightHomeContent()` trong `lib/flight/flight-repository.ts` — một hàm `cache()`-wrapped, hiện chỉ đọc `flight-data-seed.ts` và validate qua Zod. Khi có CMS hoặc API hãng bay thật, chỉ cần thay nội dung hàm này; mọi component chỉ phụ thuộc vào type `FlightHomeContent`, không phụ thuộc trực tiếp vào seed file.

`integrations/flight/contracts/flight-provider.ts` (từ Platform Foundation, Sprint 1B.2) đã định nghĩa sẵn interface cho provider thật trong tương lai — chưa có caller nào dùng.

## 7. Mock Data

`lib/flight/flight-data-seed.ts` (336 dòng): sân bay (origin/destination cho search box), 4-8 flash sale, 6 popular route (Hải Phòng/Hà Nội/TP.HCM theo đúng ví dụ PRD §3.5), 4 hãng bay (Vietnam Airlines, Vietjet, Bamboo, Vietravel Airlines), 4 bài Travel Guide, FAQ. Validate bằng `flightHomeContentSchema` (Zod) trong `flight-schema.ts` trước khi tới component — dữ liệu sai hình dạng sẽ fail ở build/render time thay vì render âm thầm sai.

---

## 8. Test Result

```
pnpm typecheck   ✅ 0 lỗi
pnpm lint        ✅ 0 lỗi
pnpm test        ✅ 86/86 test pass (13 test file, gồm lib/flight/flight-schema.test.ts)
```

(Trước khi chạy được sạch, đã phải xoá `.next/` — cache dev bị hỏng để lại `.next/dev/types/routes.d.ts` sinh lỗi cú pháp giả trong `tsc`, không liên quan gì tới code của Epic này.)

## 9. Build Result

```
pnpm build   ✅ Compiled successfully, toàn bộ route generate OK
             (kể cả /ve-may-bay và ~90 route /api/v1/* của Platform Foundation)
```

Chưa đo Lighthouse (yêu cầu PRD §8: Performance ≥90, SEO ≥95, Accessibility ≥90, LCP <2.5s, CLS <0.1) — cần môi trường chạy `next start` + Lighthouse CI, chưa thực hiện trong phiên này.

---

## 10. Known Issues

1. **Chưa đo Lighthouse** — điều kiện hoàn thành PRD §8 chưa được xác minh bằng số liệu thật, chỉ mới đảm bảo `next/image`, lazy phía dưới fold, không thư viện thừa theo thiết kế.
2. **CTA "Xem chi tiết" của Flash Sale và "Xem chuyến bay" của Popular Routes đều trỏ về `#tim-chuyen-bay`** (cuộn lại Search Box) — đúng chủ ý vì Search Results (EPIC-002) và Flight Detail (EPIC-003) chưa tồn tại, nhưng cần nhớ đổi sang route thật khi hai Epic đó xong.
3. **Nút "Tìm chuyến bay" trong Search Box không điều hướng đi đâu** — validate xong chỉ hiện thông báo "Tính năng đặt vé trực tuyến sẽ sớm ra mắt — gọi hotline". Đây là hành vi cố ý (chưa có trang kết quả), không phải bug.
4. **4 link bài Travel Guide trỏ tới `/cam-nang-bay/...` — các route này chưa tồn tại**, sẽ 404 nếu click. Không có Epic nào trong PRD hiện tại (EPIC-001..008) phủ trang chi tiết bài viết Travel Guide/Blog — cần làm rõ đây có thuộc phạm vi Flight module hay là một module Content/Blog riêng.
5. `ai-advisor-section.tsx` / các cụm AI khác của homepage chính không liên quan tới trang này — không phải known issue của Epic 001, chỉ ghi chú để không nhầm lẫn khi đọc `UI_MASTER_REVIEW.md` (audit của trang chủ, không phải `/ve-may-bay`).

## 11. Technical Debt

- Không có debt cố ý nào được đưa vào riêng cho Epic này — kiến trúc seam (`getFlightHomeContent`) được thiết kế để Epic sau không phải viết lại UI.
- `flight-schema.ts` validate toàn bộ nội dung ở mỗi request (`cache()` chỉ cache trong 1 request/render, không cache liên request) — chấp nhận được với mock data tĩnh, nhưng khi chuyển sang API thật cần cân nhắc tầng cache riêng (giống pattern `lib/cms/client.ts` nếu có).
- Ảnh trong mock data (`CmsImage`) là placeholder — cần ảnh thật trước khi go-live theo đúng tinh thần "không dùng ảnh giả" đã áp dụng ở homepage chính (xem `UI_MASTER_REVIEW.md`, `HOMEPAGE_UI_AUDIT_100.md`).

---

## 12. Công việc của EPIC-002

Theo `docs/PRD/Flight/EPIC-002-Flight-Search-Results.md`: trang kết quả tìm kiếm sau khi submit Search Box — Search Summary (rút gọn, có nút sửa tìm kiếm), danh sách chuyến bay, Filter Sidebar (khoảng giá, hãng bay, giờ cất/hạ cánh, bay thẳng, số điểm dừng, hạng ghế), Sort (giá thấp nhất / cất cánh sớm nhất / bay nhanh nhất), Fare Calendar, phân trang hoặc Load More, đầy đủ Loading/Empty/Error state. Vẫn dùng Mock Data, chưa nối API hãng bay, chưa có Booking/Payment/Login.

Việc đầu tiên khi bắt đầu EPIC-002: nối `FlightSearchBox`'s `handleSubmit` (hiện chỉ hiện confirmation message) để điều hướng sang route kết quả mới với query params thay vì chỉ set state cục bộ.
