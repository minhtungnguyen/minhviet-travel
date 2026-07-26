# EPIC-002 — Flight Search Results: Handover

**Module:** Flight
**Route:** `/ve-may-bay/{originSlug}/{destinationSlug}` (e.g. `/ve-may-bay/hai-phong/ho-chi-minh`)
**PRD:** `docs/PRD/Flight/EPIC-002-Flight-Search-Results.md`
**Status:** Code complete, mock data only. typecheck/lint/test/build all pass; verified in a real browser (desktop) after fixing one layout bug found during that check.

---

## 1. Mục tiêu

Xây dựng trang hiển thị kết quả tìm kiếm chuyến bay sau khi người dùng nhập điều kiện tìm kiếm từ Search Box (Homepage, EPIC-001). Vẫn **chỉ dùng Mock Data**, chưa nối API hãng bay. Không làm Booking, Thanh toán, Đăng nhập.

---

## 2. Những gì đã hoàn thành

Toàn bộ UI trong PRD §3: Search Summary (rút gọn + nút "Sửa tìm kiếm" mở lại `FlightSearchBox` đã điền sẵn dữ liệu), Filter Sidebar (khoảng giá, hãng bay, giờ cất/hạ cánh, bay thẳng/số điểm dừng, hạng ghế hiển thị theo tìm kiếm hiện tại), Sort (Khuyến nghị/Giá thấp nhất/Cất cánh sớm nhất/Bay nhanh nhất), Flight Card (logo hãng dạng monogram, mã chuyến, giờ đi/đến, thời gian bay, điểm dừng, hành lý khi mở rộng, giá, nút Chọn), Fare Calendar (±3 ngày, có nhãn "Rẻ nhất", chọn ngày điều hướng sang kết quả ngày đó), Pagination dạng "Xem thêm chuyến bay", Loading Skeleton, Empty State, Error State.

URL thân thiện đúng ví dụ PRD §6 (`/ve-may-bay/hai-phong/ho-chi-minh`), có `generateMetadata` động, `BreadcrumbList` + `SearchResultsPage` JSON-LD. Responsive: sidebar cố định bên trái ở desktop, chuyển thành bottom sheet có nút "Bộ lọc" ở tablet/mobile (`lg:hidden`).

**Điểm nối với EPIC-001**: `FlightSearchBox` giờ điều hướng thật (`router.push`) tới route này thay vì chỉ hiện thông báo "sắp ra mắt" — đúng việc đầu tiên được ghi trong `docs/Handover/Flight/EPIC-001-HANDOVER.md` §12. CTA "Xem chi tiết"/"Xem chuyến bay" của Flash Sale và Popular Routes (Homepage) cũng đã trỏ về route thật thay vì `#tim-chuyen-bay`.

---

## 3. File tạo mới

```
app/ve-may-bay/[from]/[to]/page.tsx
app/ve-may-bay/[from]/[to]/loading.tsx
app/ve-may-bay/[from]/[to]/error.tsx

components/flight/flight-search-summary.tsx
components/flight/flight-search-results.tsx     (orchestrator: filter/sort/pagination state)
components/flight/flight-filter-sidebar.tsx
components/flight/flight-price-filter.tsx
components/flight/flight-airline-filter.tsx
components/flight/flight-time-filter.tsx
components/flight/flight-sort-bar.tsx
components/flight/flight-fare-calendar.tsx
components/flight/flight-card.tsx
components/flight/flight-list.tsx
components/flight/flight-pagination.tsx
components/flight/flight-search-loading-skeleton.tsx
components/flight/flight-empty-state.tsx
components/flight/flight-error-state.tsx

lib/flight/flight-search-url.ts        (+ .test.ts)  — friendly-URL build/parse, one place owns the URL shape
lib/flight/flight-search-mock.ts       (+ .test.ts)  — deterministic (seeded) offer/fare-calendar generator
lib/flight/flight-search-filters.ts    (+ .test.ts)  — pure filter/sort logic
lib/flight/flight-search-repository.ts               — server-only seam, mirrors flight-repository.ts
lib/flight/flight-format.ts            (+ .test.ts)  — time/duration/price display formatters
```

## 4. File sửa

- `types/flight.ts` — thêm `slug` vào `FlightAirport`; thêm `FlightOffer`, `FareCalendarDay`, `FlightSearchQuery`, `FlightSearchResults`.
- `lib/flight/flight-schema.ts` — thêm `flightAirportSchema.slug`, `flightSearchQuerySchema`, `flightSearchResultsSchema`.
- `lib/flight/flight-schema.test.ts` — thêm test cho `flightSearchQuerySchema`.
- `lib/flight/flight-data-seed.ts` — mỗi airport có `slug` cố định (khớp ví dụ PRD, không suy ra máy móc từ tên tiếng Việt); Popular Route/Flash Sale `href` trỏ về route thật qua `buildFlightSearchPath` thay vì `#tim-chuyen-bay`.
- `components/flight/flight-search-box.tsx` — `handleSubmit` điều hướng (`router.push`) thay vì set state xác nhận cục bộ; thêm `initialValues` để `FlightSearchSummary` tái sử dụng cho "Sửa tìm kiếm".
- `components/seo/json-ld.tsx` — `FlightHomeJsonLd`'s `SearchAction.target` cập nhật theo URL thật; thêm `FlightSearchResultsJsonLd`.

## 5. Component

Đúng 13 component trong PRD §4. "Bay thẳng/Số điểm dừng" và "Hạng ghế" không có tên riêng trong danh sách PRD nên nằm inline trong `FlightFilterSidebar` thay vì tách file riêng; `FlightTimeFilter` dùng chung cho cả "Giờ cất cánh" và "Giờ hạ cánh" (một component, gọi hai lần) theo đúng nguyên tắc tái sử dụng của cả hai PRD.

## 6. API

**Không có API thật**, đúng phạm vi. Seam duy nhất là `getFlightSearchResults(query)` trong `lib/flight/flight-search-repository.ts` (server-only, `cache()`-wrapped, mirror của `getFlightHomeContent()`) — validate query bằng `flightSearchQuerySchema`, sinh dữ liệu qua `flight-search-mock.ts`, validate kết quả bằng `flightSearchResultsSchema` trước khi trả về component. `integrations/flight/contracts/flight-provider.ts` (Platform Foundation) vẫn là interface chờ provider thật, chưa có caller.

## 7. Mock Data

`lib/flight/flight-search-mock.ts` sinh 8–12 chuyến bay và 7 ngày Fare Calendar **có seed** (hash chuỗi `origin-destination-date-cabin`, thuật toán mulberry32) — cùng một tìm kiếm luôn ra cùng một kết quả (UX ổn định, test được), khác `Math.random()`. Giá phân biệt nội địa/quốc tế theo `origin.country !== destination.country`; hãng bay chỉ-nội-địa (Vietravel) không xuất hiện trên chặng quốc tế. Giá nhân theo tổng số khách (người lớn + trẻ em), không phải giá/khách.

## 8. Test Result

```
pnpm typecheck   ✅ 0 lỗi
pnpm lint        ✅ 0 lỗi (1 lỗi react-hooks/set-state-in-effect phát hiện và sửa trong lúc làm — xem §10)
pnpm test        ✅ 107/107 pass (17 test file — 21 test mới cho URL/mock/filters/format)
```

## 9. Build Result

```
pnpm build   ✅ Compiled successfully — /ve-may-bay/[from]/[to] xuất hiện là route ƒ (Dynamic), đúng vì phụ thuộc searchParams
```

Đã xác minh trực tiếp trên trình duyệt (Chrome, `pnpm start` — production server) chứ không chỉ dựa vào build log:
- `/ve-may-bay/hai-phong/ho-chi-minh?...` render đầy đủ Search Summary, Fare Calendar, Filter Sidebar, 9 kết quả, Sort, Pagination — không có console error.
- "Sửa tìm kiếm" mở đúng `FlightSearchBox` đã điền sẵn Hải Phòng → TP.HCM, 20/08/2026, 1 khách, Phổ thông.
- Route không tồn tại (`/ve-may-bay/xxx/yyy`) hiển thị đúng nội dung trang 404 (xem Known Issues #1 về mã trạng thái HTTP).
- Homepage Popular Route CTA đã trỏ đúng sang URL kết quả thật.
- Chưa đo Lighthouse (như EPIC-001, cần môi trường `next start` + Lighthouse CI riêng).
- Chưa xác minh trực quan breakpoint tablet/mobile thật — công cụ resize trình duyệt trong sandbox này không đổi kích thước viewport chụp ảnh được (giới hạn môi trường đã ghi nhận từ trước trong `UI_MASTER_REVIEW.md`); code responsive (`lg:hidden`, bottom-sheet filter) dựa trên rà soát mã nguồn, chưa có ảnh chụp màn hình thật để đối chiếu.

## 10. Known Issues

1. **`notFound()` trên route này trả về HTTP status 200 thay vì 404** (nội dung trang vẫn đúng là "Không tìm thấy" — chỉ mã trạng thái sai). Nguyên nhân: sự tồn tại của `loading.tsx` khiến Next.js App Router stream shell 200 trước khi `notFound()` được xác định, một giới hạn được ghi nhận của Next.js App Router khi route có Suspense boundary, không phải lỗi logic trong `resolveRoute()`. Xác nhận bằng đối chứng: `/tour/[slug]` (không có `loading.tsx`) trả 404 đúng cho slug không tồn tại; route này thì không. Cách sửa triệt để (bỏ `loading.tsx` hoặc validate slug trong `proxy.ts` trước khi vào App Router) đánh đổi với yêu cầu bắt buộc "có Skeleton Loading" của cả hai PRD — chưa sửa trong epic này, cần quyết định đánh đổi ở cấp sản phẩm.
2. **Vietravel Airlines (`isInternational: false`) không xuất hiện trên các chặng quốc tế** — đây là chủ ý (hãng thật không bay quốc tế), không phải bug, nhưng cần lưu ý khi so khớp với dữ liệu hãng bay thật sau này.
3. Chưa xác minh trực quan breakpoint Tablet/Mobile thật (xem §9) — cần trình duyệt thật hoặc kỹ thuật iframe cô lập viewport (như `UI_MASTER_REVIEW.md` đã dùng) ở phiên sau.
4. Nút "Chọn" trên Flight Card mở rộng panel chi tiết (hành lý, điều kiện vé) và CTA gọi hotline — không dẫn tới Flight Detail/Booking thật vì EPIC-003/004 chưa tồn tại, cùng cách xử lý trung thực đã áp dụng ở EPIC-001 (không dẫn tới link chết).

## 11. Technical Debt

- `FlightPriceFilter` chỉ có một thanh trượt "giá tối đa" (không có khoảng min-max hai đầu) — dự án chưa có sẵn primitive range-slider hai đầu; đủ dùng cho lọc giá ở epic này, nên nâng cấp nếu có yêu cầu lọc theo khoảng giá cả hai đầu.
- Filter/sort/pagination là state cục bộ trong `FlightSearchResults` (không phản ánh lên URL) — nghĩa là không chia sẻ được link đã lọc/sắp xếp. `TECH-006-State-Management.md` đề xuất Zustand/React Query cho toàn Flight Module, nhưng epic này (dữ liệu mock, không có mutation thật) chưa cần đến — xem xét lại khi Booking (EPIC-004) cần server state thật.
- `stopAirportCodes` có thể rỗng dù `stops > 0` nếu sân bay trung chuyển giả định trùng mã điểm đi/đến (edge case hiếm trong `flight-search-mock.ts`) — Flight Card khi đó chỉ hiển thị "N điểm dừng" mà không nêu tên sân bay, không crash.

---

## 12. Công việc của EPIC-003

Theo `docs/PRD/Flight/EPIC-003-Flight-Detail.md`: trang chi tiết một chuyến bay cụ thể sau khi bấm "Chọn" trên Flight Card. Việc đầu tiên khi bắt đầu: đổi `FlightCard`'s "Chọn" từ panel mở rộng inline sang điều hướng thật tới Flight Detail (`offer.id` cần một cách định tuyến ổn định — cân nhắc query param hoặc route riêng), và quyết định cách xử lý Known Issue #1 (404 status) trước khi nhân rộng pattern `loading.tsx` cho các route tiếp theo.
