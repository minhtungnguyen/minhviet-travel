# EPIC-005 — Payment & Confirmation: Handover

**Module:** Flight
**Routes:** `/ve-may-bay/thanh-toan/[bookingId]`, `/ve-may-bay/thanh-cong/[bookingId]`, `/ve-may-bay/that-bai/[bookingId]` (query `reason=failed|expired`)
**PRD:** `docs/PRD/Flight/EPIC-005-Payment-Confirmation.md`
**Status:** Code complete, Mock Payment only — không có cổng thanh toán thật, không webhook, không API ngân hàng/hãng bay. Đã xác minh trực tiếp trên trình duyệt thật (production build); không rerun lint/typecheck/test trong phiên này theo yêu cầu của người vận hành (xem §9).

---

## 1. Mục tiêu

Giao diện thanh toán và xác nhận đơn đặt vé, nối tiếp Booking Flow (EPIC-004): tóm tắt đơn hàng, chọn phương thức thanh toán (QR/chuyển khoản/thẻ nội địa/thẻ quốc tế — đều Mock), trạng thái Pending có đếm ngược, Success, và Failed (gộp cả lý do `failed` lẫn `expired`).

## 2. Những gì đã hoàn thành

Toàn bộ UI trong PRD §4: Booking Summary, Payment Method (4 lựa chọn Mock), QR Card, Bank Transfer Card, Card Form (nội địa/quốc tế), Pending Panel (đếm ngược 5 phút, "Kiểm tra lại" → Success, "Mô phỏng thanh toán thất bại" → Failed, hết giờ tự động → Failed với `reason=expired`), Success Page, Failed Page (dùng chung cho cả `failed` và `expired`), Support Box, Action Buttons, Loading Skeleton, Booking-not-found state.

**Nối với EPIC-004**: `FlightBookingView.handleContinue()` giờ tạo `bookingId` thật (`generateBookingId()`), lưu toàn bộ draft (contact, passengers, extra services, `query`) vào `sessionStorage` qua `saveBookingDraft()`, rồi điều hướng sang `/ve-may-bay/thanh-toan/{bookingId}` — đúng việc đầu tiên được ghi ở `EPIC-004-HANDOVER.md` §12. `FlightBookingSuccess` (panel "đã ghi nhận, gọi hotline" tạm thời của EPIC-004) đã bị xoá vì không còn là điểm dừng cuối cùng của luồng.

**Cơ chế mang dữ liệu qua bước Payment**: `sessionStorage`, không phải query string hay server draft — vì dữ liệu hành khách (họ tên, ngày sinh, số giấy tờ) không được phép đi qua URL, và chưa có domain Booking phía server để tạo draft thật. Hệ quả đúng như PRD §8 "Booking phải tồn tại": mở link Payment ở tab mới hoặc sau khi đóng trình duyệt sẽ hợp lệ hiện "Booking không tồn tại" — đây là phản ánh đúng của một mock chỉ tồn tại trong phiên tab, không phải lỗi.

`resolveBookingContext()` (`lib/flight/flight-booking-context.ts`) tái tạo lại flight/fare/price từ draft theo đúng cách xác định (deterministic) mà `flight-detail-repository.ts` dùng phía server — không cần truy vấn gì thêm.

---

## 3. File tạo mới

```
app/ve-may-bay/thanh-toan/[bookingId]/page.tsx
app/ve-may-bay/thanh-toan/[bookingId]/loading.tsx
app/ve-may-bay/thanh-toan/[bookingId]/error.tsx

app/ve-may-bay/thanh-cong/[bookingId]/page.tsx
app/ve-may-bay/thanh-cong/[bookingId]/loading.tsx
app/ve-may-bay/thanh-cong/[bookingId]/error.tsx

app/ve-may-bay/that-bai/[bookingId]/page.tsx
app/ve-may-bay/that-bai/[bookingId]/loading.tsx
app/ve-may-bay/that-bai/[bookingId]/error.tsx

components/flight/flight-payment-view.tsx            (orchestrator: Payment page — method selection → Pending)
components/flight/flight-payment-success-view.tsx
components/flight/flight-payment-failed-view.tsx
components/flight/flight-payment-booking-summary.tsx
components/flight/flight-payment-booking-not-found.tsx
components/flight/flight-payment-method-list.tsx
components/flight/flight-payment-qr-card.tsx
components/flight/flight-payment-bank-transfer-card.tsx
components/flight/flight-payment-card-form.tsx
components/flight/flight-payment-pending-panel.tsx
components/flight/flight-payment-status-badge.tsx
components/flight/flight-payment-action-buttons.tsx
components/flight/flight-payment-loading-skeleton.tsx

lib/flight/flight-booking-draft.ts      (+ .test.ts) — sessionStorage read/write/clear cho booking draft
lib/flight/flight-booking-context.ts    (+ .test.ts) — tái tạo flight/fare/price từ draft
```

## 4. File sửa

- `types/flight.ts` — thêm `FlightBookingDraft`, `PaymentMethod`, `PaymentStatus`.
- `lib/flight/flight-booking-schema.ts` — bổ sung schema liên quan validate booking draft.
- `components/flight/flight-booking-view.tsx` — `handleContinue()` tạo `bookingId`, lưu draft, điều hướng sang Payment thay vì hiện `FlightBookingSuccess`.
- `components/flight/flight-booking-cta.tsx` — cập nhật theo luồng điều hướng mới.
- `components/flight/flight-booking-success.tsx` — **đã xoá** (không còn là điểm dừng cuối).
- `components/ui/badge.tsx` — bổ sung variant dùng cho `FlightPaymentStatusBadge`.

---

## 5. Sự cố hydration đã phát hiện và sửa trong phiên này

Ba component `FlightPaymentView`, `FlightPaymentSuccessView`, `FlightPaymentFailedView` ban đầu đọc `sessionStorage` ngay trong lazy initializer của `useState`:

```ts
const [draft] = useState(() => loadBookingDraft(bookingId))
```

Trên server, `window` không tồn tại nên `loadBookingDraft` trả `null` → SSR render "Booking không tồn tại". Trên client, initializer chạy lại ngay trong lần render đầu (thời điểm hydrate) và đọc được `sessionStorage` thật → render nội dung thật ngay từ frame đầu tiên → khác với HTML server gửi xuống → React ném lỗi hydration (`Minified React error #418`), tái hiện được ổn định trên cả 3 route mỗi lần tải trang.

**Cách sửa**: dời việc đọc `sessionStorage` sang `useEffect` (chạy sau mount, không phải trong lúc render), dùng `undefined` làm sentinel cho trạng thái "chưa đọc xong" (khác `null` — "đã đọc, không tìm thấy"). Cả server và lần render đầu tiên phía client đều thấy `draft === undefined` nên đều render `FlightPaymentLoadingSkeleton` — khớp nhau tuyệt đối, không còn hydration mismatch. Sau khi effect chạy, component re-render với dữ liệu thật như một cập nhật client bình thường (không phải hydrate) nên không kích hoạt lỗi.

Đã xác minh: môi trường xác minh ban đầu là server `next start` cũ (build trước khi sửa) — phải `next build` lại rồi khởi động lại `next start` mới thấy được bản vá; đây là bản rebuild duy nhất được phép trong phiên theo yêu cầu người vận hành, chỉ để xác minh bản vá này.

---

## 6. Component

Đúng danh sách PRD §5 (`PaymentPage`, `BookingSummary`, `PaymentMethodList`, `QRCodeCard`, `BankTransferCard`, `PaymentStatus`, `SuccessPage`, `FailedPage`, `PendingPage`, `SupportBox`, `ActionButtons`, `LoadingSkeleton`, `ErrorState`) — không tính `*Page` là route file, cùng cách xử lý các epic trước.

## 7. Mock API

Không có Mock API endpoint thật (khác PRD §6 liệt kê `GET/POST /mock/payment`, `GET /mock/payment-status`) — cùng lý do như EPIC-004: toàn bộ trạng thái xử lý client-side (chọn phương thức → "Tôi đã thanh toán" → Pending → "Kiểm tra lại"/"Mô phỏng thanh toán thất bại"/hết giờ), không có gì để gửi lên hay poll từ server vì không có backend Payment thật.

## 8. Validation

- Booking phải tồn tại (`draft` + `resolveBookingContext()` hợp lệ) — nếu không, hiện `FlightPaymentBookingNotFound` ở cả 3 route.
- Tổng tiền lớn hơn 0 — `resolveBookingContext()` trả `null` nếu `grandTotal <= 0`, dẫn tới cùng trạng thái "không tồn tại".
- Phải chọn phương thức thanh toán trước khi CTA "Tôi đã thanh toán" xuất hiện.

---

## 9. Test Result

Không rerun trong phiên này theo yêu cầu người vận hành ("Do not rerun tests unless necessary" / "treat as already completed"). Không có bằng chứng log của lần chạy trước trong repo — nếu cần xác nhận chính thức cho release, chạy lại:

```
pnpm lint
pnpm typecheck
pnpm test
```

## 10. Build Result

```
pnpm build   ✅ Compiled successfully — /ve-may-bay/thanh-toan/[bookingId], /ve-may-bay/thanh-cong/[bookingId],
                /ve-may-bay/that-bai/[bookingId] đều xuất hiện là route ƒ (Dynamic)
```

Build này được chạy **một lần, ngoại lệ**, chỉ để nạp bản vá hydration ở §5 vào server `next start` đang chạy (server trước đó phục vụ bản build cũ hơn thời điểm sửa code, nên không thể xác minh bản vá qua trình duyệt nếu không rebuild).

Đã xác minh trực tiếp trên trình duyệt (Chrome, `pnpm start` — production server, sau rebuild), toàn bộ luồng thật, cả tải lại trang (SSR + hydrate) lẫn điều hướng client:

- Luồng đầy đủ: Tìm kiếm → Chi tiết chuyến bay → Đặt vé (điền contact + hành khách + dịch vụ thêm + điều khoản) → "Tiếp tục thanh toán" → Payment page với đúng Booking Summary (mã đơn, chuyến bay, hành khách, dịch vụ thêm, tổng tiền).
- Chọn "Quét mã QR" → hiện đúng QR Card (mock) → "Tôi đã thanh toán" → Pending Panel với đếm ngược 5 phút.
- Pending → "Kiểm tra lại" → điều hướng đúng sang Success page, hiện đúng số điện thoại liên hệ, tóm tắt đơn hàng, nút "Tra cứu đơn".
- Failed page (`reason=failed`): "Thanh toán không thành công" + lý do đúng, tóm tắt đơn hàng đầy đủ.
- Failed page (`reason=expired`): "Đã hết thời gian thanh toán" + lý do đúng.
- **Cả 3 route đều được tải lại trực tiếp (full page reload, không phải soft navigation) trong một tab hoàn toàn sạch** để buộc SSR + hydrate thật sự chạy lại — không còn lỗi console nào (đã kiểm tra bằng `read_console_messages` với `onlyErrors`, 0 kết quả ở mọi lần tải).
- Trạng thái "Booking không tồn tại" (mở route Payment ở tab mới, không có draft trong `sessionStorage`) cũng được xác minh — hiện đúng thông báo, không lỗi console.

## 11. Known Issues

1. **Sự cố hydration React #418 đã được phát hiện và sửa trong chính phiên hoàn thiện epic này** (xem §5) — không phải nợ để lại, nhưng ghi lại vì đây là lỗi thật đã từng lọt qua bước "xây xong" trước khi bị bắt ở bước xác minh trình duyệt. Bài học: bất kỳ component đọc `sessionStorage`/`localStorage` trong lazy initializer của `useState` đều cần dời sang `useEffect` với sentinel phân biệt "chưa đọc" vs "đọc rồi, rỗng" — áp dụng cho mọi component tương lai đọc client-only storage.
2. Cùng giới hạn "không có Mock API endpoint riêng" như EPIC-004 §10 — nếu sau này cần audit log lượt thanh toán phía server, đây là chỗ cần bổ sung.
3. Chưa đo Lighthouse, chưa xác minh trực quan breakpoint Tablet/Mobile thật (cùng giới hạn môi trường đã ghi nhận từ các epic trước).
4. Lint/typecheck/test không được rerun trong phiên này (xem §9) — chạy lại trước khi coi là release-ready chính thức nếu chưa có log gần đây.

## 12. Technical Debt

- `FlightPaymentPendingPanel`'s "Kiểm tra lại" resolve thành công ngay lập tức (mock) — không có độ trễ giả lập poll thật; chấp nhận được cho epic Mock Data, cần thay bằng polling thật khi có gateway thật.
- Đồng hồ đếm ngược Pending dùng `setInterval` phía client, không đồng bộ với server — nếu cần chính xác tuyệt đối (ví dụ giữ chỗ thật), cần chuyển sang tính từ timestamp server.

---

## 13. Công việc tiếp theo (EPIC-006 trở đi)

Theo danh sách 8 Epic ở `docs/PRD/Flight/` (chưa đọc PRD cụ thể của epic kế tiếp trong phiên này): việc đầu tiên khi bắt đầu epic tiếp theo, đọc PRD tương ứng và xác nhận không route/component nào bị trùng với các route đã có (`chi-tiet`, `dat-ve`, `thanh-toan`, `thanh-cong`, `that-bai`, `tim-kiem`) — bài học lặp lại từ EPIC-002/003/004.
