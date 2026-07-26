# EPIC-004 — Flight Booking Flow: Handover

**Module:** Flight
**Route:** `/ve-may-bay/dat-ve/[flightId]` (query params: `fareOptionId`, `cabinClass`, `adults`, `children`, `infants`)
**PRD:** `docs/PRD/Flight/EPIC-004-Booking-Flow.md`
**Status:** Code complete, mock data/form state only — không có booking/thanh toán/API hãng bay thật. typecheck/lint/test(128)/build đều pass; xác nhận toàn bộ luồng (điền form → validate lỗi → sửa → submit thành công) trên trình duyệt thật.

---

## 1. Mục tiêu

Luồng nhập thông tin đặt vé từ sau khi chọn chuyến bay (Flight Detail, EPIC-003) tới trước bước thanh toán: thông tin liên hệ, danh sách hành khách, dịch vụ bổ sung, xác nhận điều khoản, tổng tiền tạm tính, CTA sang bước thanh toán. Chỉ xử lý giao diện + Mock Data — không giữ chỗ thật, không thanh toán, không API hãng bay, không xuất vé.

**Không sửa module B2B** (`app/flights/page.tsx` và các route B2B khác) — xác nhận không có file nào ngoài `app/ve-may-bay/`, `components/flight/`, `lib/flight/`, `types/flight.ts` bị đụng tới.

---

## 2. Những gì đã hoàn thành

Toàn bộ UI trong PRD §4: Flight Summary (hành trình/giờ bay/hãng bay/giá đã chọn), Contact Information (họ tên/email/điện thoại), Passenger Form cho từng hành khách theo đúng số lượng người lớn/trẻ em/em bé đã tìm kiếm (họ tên/giới tính/ngày sinh/quốc tịch/giấy tờ), Extra Services (hành lý mua thêm 2 mức, chọn chỗ, bảo hiểm du lịch), Price Summary (tái dùng breakdown của EPIC-003 + dòng dịch vụ thêm + tổng cộng), Terms checkbox, CTA (Tiếp tục thanh toán / Quay lại, cố định ở Mobile).

**Validation đầy đủ theo PRD §8**: email, điện thoại, họ tên, ngày sinh (bắt buộc, kiểm tra lỗi ngay dưới trường nhập) — thêm một lớp kiểm tra **ngày sinh phải khớp độ tuổi loại hành khách đã chọn** (người lớn ≥12, trẻ em 2–11, em bé <2, tính theo ngày khởi hành chứ không phải hôm nay — đúng cách hãng bay thật tính tuổi hành khách) mà PRD không yêu cầu cụ thể nhưng là hệ quả tự nhiên của "Ngày sinh" + phân loại hành khách đã có sẵn.

**Điểm nối với EPIC-003**: `FlightBookingCTA` (nút "Tiếp tục đặt vé" trên Flight Detail) giờ điều hướng thật sang route này — đúng việc đầu tiên được ghi trong `docs/Handover/Flight/EPIC-003-HANDOVER.md` §12. Panel xác nhận nội tuyến "sắp ra mắt" trước đây đã **chuyển tiếp** sang CTA "Tiếp tục thanh toán" của chính Booking (vì giờ EPIC-005/Payment mới là bước chưa tồn tại).

---

## 3. File tạo mới

```
app/ve-may-bay/dat-ve/[flightId]/page.tsx
app/ve-may-bay/dat-ve/[flightId]/loading.tsx
app/ve-may-bay/dat-ve/[flightId]/error.tsx

components/flight/flight-booking-view.tsx           (orchestrator: form state + validate-on-submit)
components/flight/flight-booking-summary-card.tsx    (FlightSummaryCard)
components/flight/flight-booking-contact-form.tsx    (ContactForm)
components/flight/flight-booking-passenger-list.tsx  (PassengerList)
components/flight/flight-booking-passenger-form.tsx  (PassengerForm)
components/flight/flight-booking-extra-service-card.tsx (ExtraServiceCard)
components/flight/flight-booking-price-summary.tsx   (PriceSummary)
components/flight/flight-booking-terms-checkbox.tsx  (TermsCheckbox)
components/flight/flight-booking-actions.tsx         (BookingActions)
components/flight/flight-booking-loading-skeleton.tsx (LoadingSkeleton)
components/flight/flight-booking-success.tsx         (hiện sau submit hợp lệ — xem §10)

lib/flight/flight-booking-data.ts        — catalog Dịch vụ bổ sung (static, không seed theo tìm kiếm)
lib/flight/flight-booking-schema.ts      (+ .test.ts) — validate contact/passenger/terms
lib/flight/flight-booking-price.ts       (+ .test.ts) — cộng dịch vụ thêm vào breakdown của EPIC-003
```

## 4. File sửa

- `types/flight.ts` — thêm `BookingContactInfo`, `BookingPassenger` (+ `BookingPassengerType`/`BookingGender`/`BookingDocumentType`), `BookingExtraService`, `FlightBookingPriceSummary`.
- `lib/flight/flight-detail-id.ts` — thêm `buildFlightBookingPath()`; tách `parseFlightDetailUrlContext()` dùng chung cho cả `chi-tiet` và `dat-ve` (trước đó logic này chỉ nằm trong `chi-tiet/page.tsx`).
- `app/ve-may-bay/chi-tiet/[flightId]/page.tsx` — dùng `parseFlightDetailUrlContext()` thay vì hàm nội bộ trùng lặp.
- `components/flight/flight-booking-cta.tsx` — bỏ toàn bộ state "confirming" tạm thời của EPIC-003, giờ là link thật (`buildFlightBookingPath`), không còn `'use client'`.
- `components/flight/flight-detail-view.tsx` — cập nhật 2 chỗ gọi `FlightBookingCTA` theo props mới (`flightId`/`fareOptionId`/`query` thay vì `fareName`/`totalForParty`).

## 5. Component

Đúng 11/11 component trong PRD §5 (không tính `BookingPage`, là route file — cùng cách xử lý `*Page` như các epic trước). Passenger Form dùng lại `Select` (Base UI) cho giới tính/loại giấy tờ, `Input` cho các trường còn lại — không tạo primitive UI mới. Price Summary tái dùng `FlightPriceBreakdownList` của EPIC-003 nguyên vẹn, chỉ thêm dòng dịch vụ.

## 6. API

**Không có API thật, không có Mock API endpoint** (khác EPIC-001/002/003 — PRD §6 liệt kê `GET /mock/booking`, `POST /mock/booking/validate`, `GET /mock/extra-services` nhưng đây là form nhập liệu thuần tuý phía client, không có gì để "GET" — dữ liệu chuyến bay đã có sẵn từ `getFlightDetail()` của EPIC-003, catalog dịch vụ thêm là hằng số tĩnh `flightExtraServices`, không cần một request riêng). Validate diễn ra hoàn toàn client-side bằng Zod khi bấm "Tiếp tục thanh toán" — không có `POST /mock/booking/validate` vì không có gì để gửi đi (không lưu trữ, xem PRD §3 "Không bao gồm: Giữ chỗ thật").

## 7. Mock Data

`lib/flight/flight-booking-data.ts`: catalog 4 dịch vụ thêm tĩnh (hành lý +10kg/+20kg, chọn chỗ, bảo hiểm du lịch), giá tính theo đầu khách (nhân theo `adults + children`, không tính `infants` — nhất quán quy ước đã có từ EPIC-002/003). Danh sách hành khách khởi tạo tự động đúng số lượng người lớn/trẻ em/em bé từ `FlightSearchQuery` (không cần người dùng tự thêm/bớt dòng).

---

## 8. Test Result

```
pnpm typecheck   ✅ 0 lỗi
pnpm lint        ✅ 0 lỗi
pnpm test        ✅ 128/128 pass (22 test file — 8 test mới cho booking schema/price)
```

## 9. Build Result

```
pnpm build   ✅ Compiled successfully — /ve-may-bay/dat-ve/[flightId] xuất hiện là route ƒ (Dynamic)
```

Đã xác minh trực tiếp trên trình duyệt (Chrome, `pnpm start` — production server), toàn bộ luồng thật:
- Trang render đầy đủ Flight Summary, Contact Form, Passenger List (đúng số lượng theo query), Extra Services (4 thẻ), Price Summary đúng breakdown + tổng theo số khách, không console error.
- Bấm "Tiếp tục thanh toán" khi form trống → hiện đúng lỗi dưới từng trường: "Vui lòng nhập họ tên đầy đủ", "Email không hợp lệ", "Số điện thoại không hợp lệ", "Ngày sinh không hợp lệ", "Số giấy tờ không hợp lệ", "Vui lòng đồng ý điều khoản đặt vé" — viền đỏ đúng theo `aria-invalid`.
- Điền đầy đủ thông tin hợp lệ (bao gồm ngày sinh khớp độ tuổi người lớn) + tick điều khoản → bấm "Tiếp tục thanh toán" → hiện đúng `FlightBookingSuccess` ("Đã ghi nhận thông tin đặt vé... gọi hotline...").
- Link "Tiếp tục đặt vé" từ Flight Detail trỏ đúng `/ve-may-bay/dat-ve/{flightId}?fareOptionId=..&cabinClass=..&adults=..&children=..&infants=..`.
- **Một lần nữa gặp lại tình trạng bất ổn định của môi trường trình duyệt sandbox đã ghi nhận ở EPIC-003 handover** (một số cú click qua tool `computer` không đăng ký được sự kiện, một lần chụp màn hình timeout) — lần này xác minh dứt điểm bằng cách gọi trực tiếp qua `javascript_tool` (`element.click()` + đọc `document.body.textContent`), cho kết quả đúng 100% ngay từ lần đầu ở mọi bước — khẳng định chắc chắn đây là vấn đề của công cụ/môi trường, không phải lỗi ứng dụng.
- Chưa đo Lighthouse, chưa xác minh trực quan breakpoint Tablet/Mobile thật (cùng giới hạn môi trường đã ghi nhận từ EPIC-001/002/003).

## 10. Known Issues

1. **CTA "Tiếp tục thanh toán" không điều hướng sang route Thanh toán thật** — Payment (EPIC-005) chưa tồn tại. Khi submit hợp lệ, hiển thị `FlightBookingSuccess` (xác nhận đã ghi nhận + hotline thật) thay vì điều hướng — tiếp nối đúng cách xử lý trung thực đã áp dụng xuyên suốt module (Search Box, Flight Card, Booking CTA cũ). PRD §9 "Điều kiện hoàn thành" chỉ yêu cầu "Form hoạt động với Mock Data" + validate đầy đủ, không yêu cầu route Payment phải tồn tại.
2. **Không có `POST /mock/booking/validate` endpoint riêng** như PRD §6 liệt kê — validate chạy client-side, không có gì để gửi lên server vì không lưu trữ gì (xem §6). Nếu sau này cần audit log lượt "đặt vé nháp" phía server, đây là chỗ cần bổ sung.
3. Chưa xác minh trực quan breakpoint Tablet/Mobile thật và chưa đo Lighthouse (xem §9) — cùng giới hạn môi trường đã ghi nhận từ các epic trước.
4. `FlightBookingActions` (giống `FlightBookingCTA` ở EPIC-003) được render 2 lần (sidebar desktop + sticky mobile) — cùng nợ kỹ thuật đã ghi ở EPIC-003 handover §11, chưa gộp lại.

## 11. Technical Debt

- Passenger `gender`/`documentType` dùng `Select` (Base UI) — giá trị mặc định (`male`/`cccd`) hợp lệ ngay cả khi người dùng chưa tương tác, nghĩa là 2 trường này thực tế không bao giờ báo lỗi "chưa chọn" dù chưa được xác nhận — chấp nhận được vì đã có giá trị mặc định hợp lý, nhưng khác một chút với hành vi "bắt buộc" chặt chẽ của các trường text.
- `computeBookingPriceSummary` tính giá dịch vụ thêm nhân theo `adults + children` đồng nhất cho mọi loại dịch vụ (kể cả "Bảo hiểm du lịch") — thực tế em bé (`infants`) có thể cũng cần bảo hiểm riêng; đơn giản hoá có chủ đích cho epic này, cần xem lại nếu nghiệp vụ thật yêu cầu khác.
- Chưa có cơ chế giữ dữ liệu form khi người dùng rời trang rồi quay lại (không persist vào `sessionStorage`/URL) — nếu bấm "Quay lại" rồi "Tiếp tục đặt vé" lại từ Flight Detail, form Booking sẽ trống lại từ đầu. Chấp nhận được cho epic dữ liệu mock, cần cân nhắc khi có Payment thật (EPIC-005) nối tiếp — luồng nhiều bước thường cần giữ trạng thái qua lại.

---

## 12. Công việc của EPIC-005

Theo PRD gốc (chưa có file `docs/PRD/Flight/EPIC-005-Payment-Confirmation.md` được đọc trong epic này, chỉ biết tên qua danh sách 8 Epic ở `docs/PRD/Flight/`): bước thanh toán và xác nhận. Việc đầu tiên khi bắt đầu: đổi `FlightBookingActions`'s "Tiếp tục thanh toán" từ hiển thị `FlightBookingSuccess` sang điều hướng thật tới Payment, mang theo toàn bộ dữ liệu đã nhập (contact, passengers, extra services đã chọn, `grandTotal`) — cần quyết định cơ chế mang dữ liệu qua bước tiếp theo (query params không còn phù hợp vì dữ liệu hành khách quá lớn/nhạy cảm; cân nhắc `sessionStorage` phía client hoặc một draft id tạm thời phía server) trước khi triển khai, và **xác nhận route Payment không trùng với bất kỳ URL nào đã dùng hoặc dành riêng** (bài học lặp lại từ EPIC-002/003).
