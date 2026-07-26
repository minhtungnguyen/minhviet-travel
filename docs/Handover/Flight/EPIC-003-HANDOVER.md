# EPIC-003 — Flight Detail: Handover

**Module:** Flight
**Route:** `/ve-may-bay/chi-tiet/[flightId]` (query params: `cabinClass`, `adults`, `children`, `infants`)
**PRD:** `docs/PRD/Flight/EPIC-003-Flight-Detail.md`
**Status:** Code complete, mock data only. typecheck/lint/test(120)/build all pass; verified in a real browser — one real bug found and fixed during that check (see §10).

---

## 1. Mục tiêu

Trang chi tiết một chuyến bay cụ thể sau khi bấm "Chọn" trên Flight Card ở Search Results (EPIC-002): hành trình, thời gian bay, hãng bay, điều kiện vé, hành lý, giá cuối cùng, chính sách đổi/hoàn, dịch vụ đi kèm. Vẫn **chỉ dùng Mock Data**. Không làm nhập hành khách, giữ chỗ, thanh toán, xuất vé, API hãng bay, đăng nhập.

**Không đụng vào route/module B2B hiện có** (`app/flights/page.tsx` và các route khác) — xác nhận không có file nào ngoài `app/ve-may-bay/`, `components/flight/`, `lib/flight/`, `types/flight.ts`, `components/seo/json-ld.tsx` bị thay đổi.

---

## 2. Những gì đã hoàn thành

Toàn bộ UI trong PRD §4: Flight Summary (logo hãng dạng monogram, mã chuyến, hạng ghế, loại tàu bay, bay thẳng/số điểm dừng), Route Timeline (từng chặng bay + điểm dừng, đúng giờ đi/đến/ngày, tổng thời gian), Fare Options (4 hạng vé Economy Saver/Standard/Flex/Business dạng tab + card chi tiết, đúng giá tăng dần theo hạng), Baggage Information, Fare Rules (accordion: đổi vé/hoàn vé/no-show/thời hạn giữ chỗ + disclaimer bắt buộc), Price Summary (breakdown đầy đủ: giá cơ bản/thuế/phí sân bay/phí dịch vụ/tổng theo số khách), CTA (Tiếp tục đặt vé + Quay lại kết quả + hotline + sticky mobile), Loading Skeleton, Error State (lỗi runtime thật), và một "not found" state riêng (flightId không hợp lệ/cũ — xem §10 về quyết định kiến trúc).

**Điểm nối với EPIC-002**: `FlightCard`'s "Chọn" giờ điều hướng thật tới route này (thay vì mở panel inline) — đúng việc đầu tiên được ghi trong `docs/Handover/Flight/EPIC-002-HANDOVER.md` §12.

**Điểm nối với Brand-System** (`docs/Brand-System/`, vừa hoàn thành trước Epic này): dùng đúng token màu/motion/shadow đã chốt ở BRAND-003/005 (`mv-journey-blue`, `shadow-soft`, tier `fast`/`normal`), giữ đúng cảm xúc Flight ("Nhanh, Tin cậy, Hiện đại" — BRAND-002 §Flight) qua layout gọn, không có animation trang trí thừa.

---

## 3. File tạo mới

```
app/ve-may-bay/chi-tiet/[flightId]/page.tsx
app/ve-may-bay/chi-tiet/[flightId]/loading.tsx
app/ve-may-bay/chi-tiet/[flightId]/error.tsx

components/flight/flight-detail-view.tsx        (orchestrator: selected fare option state)
components/flight/flight-detail-summary.tsx     (FlightSummary)
components/flight/flight-route-timeline.tsx     (RouteTimeline)
components/flight/flight-airport-point.tsx      (AirportPoint)
components/flight/flight-stopover-detail.tsx    (StopoverDetail)
components/flight/flight-fare-option-tabs.tsx   (FareOptionTabs)
components/flight/flight-fare-option-card.tsx   (FareOptionCard)
components/flight/flight-baggage-info.tsx       (BaggageInfo)
components/flight/flight-fare-rules.tsx         (FareRules)
components/flight/flight-price-breakdown.tsx    (PriceBreakdown)
components/flight/flight-price-summary.tsx      (PriceSummary)
components/flight/flight-booking-cta.tsx        (BookingCTA)
components/flight/flight-support-box.tsx        (SupportBox)
components/flight/flight-detail-loading-skeleton.tsx  (LoadingSkeleton)
components/flight/flight-detail-fare-empty-state.tsx  (EmptyState — no fare options)
components/flight/flight-detail-not-found.tsx         (flightId không hợp lệ, xem §10)

lib/flight/flight-detail-id.ts       (+ .test.ts)  — parse/build flightId ↔ detail URL
lib/flight/flight-detail-mock.ts     (+ .test.ts)  — deterministic segments + fare option generator
lib/flight/flight-detail-price.ts    (+ .test.ts)  — pure price-breakdown math
lib/flight/flight-detail-repository.ts             — server-only seam, mirrors flight-search-repository.ts
```

## 4. File sửa

- `types/flight.ts` — thêm `FlightSegment`, `FlightLayover`, `FareOption`, `FareOptionTier`, `FlightFareRules`, `FlightPriceBreakdown`, `FlightDetail`.
- `lib/flight/flight-schema.ts` — thêm schema cho tất cả type trên; sửa `flightBaggageAllowanceSchema.checkedKg` từ `.positive()` sang `.nonnegative()` (Economy Saver hợp lệ có 0kg ký gửi — xem §10 Known Issue đã sửa).
- `lib/flight/flight-search-mock.ts` — export thêm `createSeededRandom`, `CABIN_PRICE_MULTIPLIER`, `isInternationalRoute`, `combineDateAndMinutes`, `partySize` để `flight-detail-mock.ts` dùng lại cùng một họ seed, không viết trùng PRNG.
- `components/flight/flight-card.tsx` — bỏ toàn bộ state mở rộng inline (EPIC-002's tạm thời), "Chọn" giờ là `MVButton href={buildFlightDetailPath(...)}` — component đơn giản hơn, không còn `'use client'`.
- `components/flight/flight-list.tsx`, `components/flight/flight-search-results.tsx` — truyền `query` xuống `FlightCard` để build link Flight Detail đúng ngữ cảnh (hạng ghế/số khách).
- `components/seo/json-ld.tsx` — thêm `FlightDetailJsonLd` (schema.org `Flight` — type có sẵn, khớp trực tiếp với `FlightDetail`, không phải generic type như các trang khác).

## 5. Component

Đúng 15/15 component trong PRD §5 (không tính `FlightDetailPage`, là route file, không phải component riêng — theo đúng cách EPIC-001/002 đã xử lý `*Page`). Mỗi component nhận dữ liệu qua props, không hardcode. Tái sử dụng được cho một chiều lẫn khứ hồi — `FlightDetail`/`FlightSearchQuery` không phân biệt logic hiển thị theo `tripType`, mọi khác biệt (nếu có chặng về) sẽ tự nhiên fit vào cùng cấu trúc `segments`/`fareOptions` khi EPIC-004+ cần.

## 6. API

**Không có API thật**, đúng phạm vi. Seam duy nhất là `getFlightDetail(flightId, context)` trong `lib/flight/flight-detail-repository.ts` (server-only, `cache()`-wrapped) — parse `flightId` (xem §7), quy đổi lại `FlightOffer` gốc bằng cách regenerate với **cùng seed** `flight-search-mock.ts` đã dùng khi tạo Search Results, rồi sinh `FlightDetail` (segment/fare option) qua `flight-detail-mock.ts`, validate bằng `flightDetailSchema` trước khi trả về.

## 7. Mock Data

**`flightId` không lưu trữ gì cả** — nó chính là `FlightOffer.id` (`offer-{originCode}-{destinationCode}-{departDate}-{index}`, đã có từ EPIC-002) và tự mã hoá đủ thông tin để `flight-detail-repository.ts` **tái tạo lại chính xác cùng một offer** bằng seed generator, không cần persist gì. Vì seed cũng phụ thuộc `cabinClass` (và giá phụ thuộc số khách), `flightId` được mang theo `?cabinClass=&adults=&children=&infants=` qua `buildFlightDetailPath()` — **luôn dùng hàm này để link sang Flight Detail, không tự ráp URL tay**, nếu không giá/hạng vé hiển thị có thể lệch với Search Results.

`flight-detail-mock.ts` sinh: **segments/layovers** — tổng thời gian bay + thời gian dừng cộng lại **khớp chính xác tuyệt đối** với `durationMinutes` của offer gốc (xử lý làm tròn bằng kỹ thuật "phần tử cuối hấp thụ số dư", có test riêng xác nhận); **4 hạng vé** (Saver/Standard/Flex/Business) định giá theo hệ số nhân trên nền giá Economy (tách khỏi hệ số hạng ghế đã áp trong `offer.price`, tránh nhân đôi khi khách tìm sẵn hạng Business) — thứ tự giá luôn Saver < Standard < Flex < Business, hạng được đề xuất mặc định khớp đúng hạng ghế đã tìm kiếm.

## 8. Test Result

```
pnpm typecheck   ✅ 0 lỗi
pnpm lint        ✅ 0 lỗi
pnpm test        ✅ 120/120 pass (20 test file — 20 test mới cho flightId/detail-mock/price-breakdown)
```

## 9. Build Result

```
pnpm build   ✅ Compiled successfully — /ve-may-bay/chi-tiet/[flightId] xuất hiện là route ƒ (Dynamic)
```

Đã xác minh trực tiếp trên trình duyệt (Chrome, `pnpm start` — production server):
- Trang render đầy đủ Flight Summary, Route Timeline (kể cả điểm dừng), 4 tab hạng vé đúng thứ tự giá, Baggage, Fare Rules, Price Summary đúng breakdown, không console error.
- Chuyển tab hạng vé và bấm "Tiếp tục đặt vé" hoạt động đúng: hiện panel xác nhận "Đã chọn {hạng vé} — {giá}. Đặt vé trực tuyến sẽ sớm ra mắt, gọi hotline..." kèm nút gọi thật.
- Link "Chọn" từ Search Results trỏ đúng `/ve-may-bay/chi-tiet/{flightId}?cabinClass=..&adults=..&children=..&infants=..`.
- flightId không hợp lệ (`/ve-may-bay/chi-tiet/not-a-real-id`) hiển thị đúng trạng thái "Không tìm thấy chuyến bay này" (200, có chủ đích — xem §10).
- Môi trường trình duyệt sandbox trong phiên này có lúc không ổn định (renderer treo tạm thời, tab thao tác bị lỗi quyền truy cập) — đã xác nhận lại bằng tab mới rằng đây là vấn đề công cụ/môi trường, không phải lỗi ứng dụng: cùng một thao tác lặp lại trên tab mới hoạt động đúng ngay lần đầu.
- Chưa đo Lighthouse, chưa xác minh trực quan breakpoint Tablet/Mobile thật (cùng giới hạn môi trường đã ghi ở EPIC-002 handover).

## 10. Known Issues

1. **Đã sửa trong epic này**: `flightBaggageAllowanceSchema.checkedKg` yêu cầu `.positive()` khiến validate lỗi ngay khi tải trang (Economy Saver có `checkedKg: 0` hợp lệ) — phát hiện qua lỗi runtime thật khi kiểm tra trên trình duyệt, không phải qua test tự động (chưa có test tích hợp gọi hết pipeline repository → schema trước đó). Đã sửa thành `.nonnegative()`.
2. **`flightId` không hợp lệ không trả về HTTP 404 thật, mà trả 200 với nội dung "Không tìm thấy chuyến bay này"** — quyết định có chủ đích, khác với slug-based 404 kiểu `/tour/[slug]`. Lý do: cùng giới hạn Next.js App Router đã ghi trong `docs/Handover/Flight/EPIC-002-HANDOVER.md` (route có `loading.tsx` + gọi `notFound()` sẽ vẫn trả 200 vì shell đã stream trước khi biết 404) — route này **chủ động không gọi `notFound()`** để không lặp lại vấn đề đó, xử lý "not found" như một trạng thái nội dung (giống cách EPIC-002 xử lý query sai định dạng) thay vì mã trạng thái HTTP. Đánh đổi: một flightId cũ/sai vẫn "thành công" về mặt HTTP dù nội dung là thông báo lỗi — chấp nhận được cho epic dữ liệu mock, cần xem lại nếu SEO crawler quan tâm mã trạng thái của các trang detail cũ.
3. Các chặng bay ngắn với 1-2 điểm dừng đôi khi cho ra thời gian bay từng chặng rất ngắn (ví dụ 15 phút) — thuật toán chia thời gian giữ đúng ràng buộc tổng thời gian khớp tuyệt đối với offer gốc (ưu tiên đúng đắn hơn thực tế hoá), nhưng chưa tối ưu tỷ lệ chặng bay/thời gian dừng cho cảm giác thực tế hơn ở các chặng ngắn.
4. Chưa xác minh trực quan breakpoint Tablet/Mobile thật và chưa đo Lighthouse (xem §9) — cùng giới hạn môi trường đã ghi nhận từ EPIC-001/002.
5. Nút "Tiếp tục đặt vé" mở panel xác nhận nội tuyến thay vì điều hướng sang route Booking thật — Booking/Payment (EPIC-004) chưa tồn tại, cùng cách xử lý trung thực đã áp dụng xuyên suốt module (không dẫn tới link chết). PRD §10 diễn giải "CTA chuyển sang route Booking dự kiến" theo nghĩa CTA thể hiện đúng bước tiếp theo dự kiến, không bắt buộc route đó phải tồn tại trong epic này.

## 11. Technical Debt

- `flightId` phải luôn được xây bằng `buildFlightDetailPath()` (không tự ráp URL) để giữ đúng ngữ cảnh hạng ghế/số khách — chưa có cơ chế lint/test tự động chặn việc ai đó ráp URL tay ở component mới sau này; cần lưu ý khi mở rộng.
- `FlightBookingCTA` được render 2 lần trên cùng trang (sidebar desktop + sticky mobile) với 2 state `confirming` độc lập — nhất quán về UX (chỉ một cái hiển thị tại một thời điểm theo breakpoint) nhưng là một chỗ trùng lặp nhỏ có thể gộp lại bằng context/state nâng lên nếu sau này cần đồng bộ hai bản hiển thị.
- `computePriceBreakdown` tách "phí sân bay"/"phí dịch vụ" theo tỷ lệ cố định 60/40 từ `serviceFee` của mock data — hợp lý cho hiển thị mock, cần thay bằng số liệu thật từ provider khi tích hợp API.

---

## 12. Công việc của EPIC-004

Theo cấu trúc PRD đã có (`docs/PRD/Flight/EPIC-004-Booking-Flow.md`, chưa đọc chi tiết trong epic này): luồng nhập thông tin hành khách và giữ chỗ. Việc đầu tiên khi bắt đầu: đổi `FlightBookingCTA`'s "Tiếp tục đặt vé" từ panel xác nhận nội tuyến sang điều hướng thật tới Booking, mang theo `flightId` + `fareOptionId` đã chọn + context hạng ghế/số khách (đã có sẵn qua `detail.query`) — và, giống bài học từ EPIC-002, **xác nhận route Booking không trùng với bất kỳ URL nào đã dùng hoặc dành riêng trước khi đặt tên**.
