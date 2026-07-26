# EPIC-003 – Flight Detail

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/PRD/Flight/EPIC-003-Flight-Detail.md`

---

## 1. Mục tiêu

Xây dựng trang chi tiết chuyến bay sau khi người dùng chọn một kết quả trong trang Search Results.

Trang phải giúp người dùng hiểu rõ:

- Hành trình.
- Thời gian bay.
- Hãng bay.
- Điều kiện vé.
- Hành lý.
- Giá cuối cùng.
- Chính sách đổi, hoàn.
- Dịch vụ đi kèm.

Epic này dùng Mock Data, chưa tích hợp API hãng bay và chưa tạo booking thật.

---

## 2. Existing System Impact

- Không sửa hoặc xóa route hiện có.
- Không thay đổi module B2B đang vận hành.
- Chỉ tạo mới trong phạm vi Flight B2C.
- Route đề xuất:

```text
/ve-may-bay/chi-tiet/[flightId]
```

- Nếu route hoặc component trùng với hệ thống hiện tại, phải báo cáo trước khi thay đổi.
- Không thay đổi navigation hiện có ngoài việc bổ sung liên kết từ Search Results sang Flight Detail.

---

## 3. Phạm vi

### Bao gồm

- Thông tin hành trình.
- Thông tin hãng bay.
- Chi tiết giờ bay.
- Sân bay đi và đến.
- Điểm dừng.
- Hạng ghế.
- Điều kiện giá vé.
- Hành lý.
- Chính sách đổi, hoàn.
- Chi tiết giá.
- CTA tiếp tục đặt vé.
- Loading, Empty và Error State.

### Không bao gồm

- Nhập thông tin hành khách.
- Giữ chỗ.
- Thanh toán.
- Xuất vé.
- API hãng bay.
- Đăng nhập.

---

## 4. UI cần có

### 4.1 Flight Summary

Hiển thị:

- Logo hãng bay.
- Tên hãng bay.
- Mã chuyến bay.
- Hạng ghế.
- Loại tàu bay nếu có.
- Bay thẳng hoặc có điểm dừng.

### 4.2 Route Timeline

Hiển thị:

- Sân bay đi.
- Mã sân bay đi.
- Thành phố đi.
- Giờ khởi hành.
- Ngày khởi hành.
- Sân bay đến.
- Mã sân bay đến.
- Thành phố đến.
- Giờ đến.
- Ngày đến.
- Tổng thời gian bay.
- Điểm dừng nếu có.
- Thời gian chờ nếu có.

### 4.3 Fare Options

Nếu chuyến bay có nhiều gói giá, hiển thị dạng card hoặc tab:

- Economy Saver.
- Economy Standard.
- Economy Flex.
- Business.

Mỗi gói giá hiển thị:

- Giá.
- Hành lý xách tay.
- Hành lý ký gửi.
- Suất ăn.
- Chọn chỗ.
- Điều kiện đổi vé.
- Điều kiện hoàn vé.
- Nút chọn gói giá.

### 4.4 Baggage Information

Hiển thị riêng:

- Hành lý xách tay.
- Hành lý ký gửi.
- Phí mua thêm hành lý nếu có.
- Điều kiện giới hạn trọng lượng.

### 4.5 Fare Rules

Hiển thị:

- Điều kiện đổi vé.
- Điều kiện hoàn vé.
- Phí đổi.
- Phí hoàn.
- No-show.
- Thời hạn giữ chỗ.
- Lưu ý giá có thể thay đổi.

### 4.6 Price Summary

Hiển thị:

- Giá cơ bản.
- Thuế.
- Phí sân bay.
- Phí dịch vụ.
- Phụ thu.
- Tổng tiền.
- Giá theo số hành khách.

Phải ghi rõ:

```text
Giá hiện tại là giá tham khảo từ Mock Data và chưa phải giá giữ chỗ thực tế.
```

### 4.7 CTA

Bao gồm:

- Nút “Tiếp tục đặt vé”.
- Nút “Quay lại kết quả”.
- Hotline hỗ trợ.
- CTA cố định ở Mobile.

---

## 5. Component

```text
FlightDetailPage
FlightSummary
RouteTimeline
AirportPoint
StopoverDetail
FareOptionTabs
FareOptionCard
BaggageInfo
FareRules
PriceBreakdown
PriceSummary
BookingCTA
SupportBox
LoadingSkeleton
EmptyState
ErrorState
```

Nguyên tắc:

- Component tách riêng.
- Dữ liệu truyền bằng props.
- Không hardcode dữ liệu trong component.
- Fare Rule và Price Breakdown phải có type riêng.
- Component phải tái sử dụng được cho chuyến một chiều và khứ hồi.

---

## 6. Mock API

```text
GET /mock/flights/:flightId
GET /mock/flights/:flightId/fare-options
GET /mock/flights/:flightId/fare-rules
GET /mock/flights/:flightId/baggage
```

Ví dụ cấu trúc dữ liệu:

```ts
type FlightDetail = {
  id: string
  airline: Airline
  flightNumber: string
  aircraft?: string
  cabinClass: string
  segments: FlightSegment[]
  durationMinutes: number
  stops: number
  fareOptions: FareOption[]
}
```

```ts
type FareOption = {
  id: string
  name: string
  baseFare: number
  taxes: number
  serviceFee: number
  totalPrice: number
  baggage: BaggageAllowance
  changePolicy: string
  refundPolicy: string
}
```

---

## 7. Responsive

### Desktop

- Nội dung chính bên trái.
- Price Summary và CTA bên phải.
- Sidebar có thể sticky.

### Tablet

- Price Summary chuyển xuống dưới nội dung chính.
- Fare Option hiển thị hai cột nếu đủ không gian.

### Mobile

- Tất cả hiển thị một cột.
- CTA cố định cuối màn hình.
- Fare Rule hiển thị dạng Accordion.
- Timeline tối ưu cho màn hình nhỏ.

---

## 8. SEO

Bắt buộc có:

- Metadata động theo chặng bay.
- Canonical URL.
- Breadcrumb.
- Open Graph.
- Không index các URL có tham số tạm thời không cần thiết.
- Structured data phù hợp cho trang dịch vụ du lịch.
- H1 duy nhất.

Ví dụ title:

```text
Chi tiết chuyến bay Hải Phòng đi TP.HCM – Minh Việt Travel
```

Ví dụ description:

```text
Xem giờ bay, giá vé, hành lý và điều kiện vé cho chuyến bay Hải Phòng đi TP.HCM cùng Minh Việt Travel.
```

---

## 9. Hiệu năng và trạng thái

Yêu cầu:

- Có Loading Skeleton.
- Có Error State khi không tìm thấy chuyến bay.
- Có Empty State khi không có gói giá.
- Ảnh và logo tối ưu bằng `next/image`.
- Không tải dữ liệu không cần thiết.
- Lighthouse Performance ≥ 90.
- Không có lỗi hydration.

---

## 10. Điều kiện hoàn thành

Epic được xem là hoàn thành khi:

- Trang Flight Detail hoạt động với Mock Data.
- Có đầy đủ hành trình, điều kiện vé, hành lý và giá.
- Có thể chọn một Fare Option.
- CTA chuyển sang route Booking dự kiến nhưng chưa thực hiện booking thật.
- Responsive trên Desktop, Tablet và Mobile.
- Không lỗi TypeScript.
- Không lỗi ESLint.
- `npm run build` thành công.
- Không ảnh hưởng route B2B hiện có.
- Có README hoặc ghi chú triển khai.

---

## 11. Checklist bàn giao Claude Code

Claude Code phải bàn giao:

- Source code trang Flight Detail.
- Danh sách component đã tạo.
- Mock Data.
- Type definitions.
- Route đã tạo.
- Metadata động.
- Kết quả:
  - Lint.
  - Typecheck.
  - Build.
  - Responsive.
- Danh sách việc chưa hoàn thành.
- Xác nhận không sửa module B2B.

---

## 12. Lệnh giao việc cho Claude Code

```text
Đọc toàn bộ Product Bible của Minh Việt Travel Platform.

Sau đó đọc file:
docs/PRD/Flight/EPIC-003-Flight-Detail.md

Triển khai đúng phạm vi Epic 003.

Route mới:
app/ve-may-bay/chi-tiet/[flightId]/page.tsx

Không sửa:
app/flights/page.tsx
và các module B2B hiện có.

Chỉ sử dụng Mock Data.

Không triển khai:
- Booking thật
- Payment
- API hãng bay
- Xuất vé

Trước khi kết thúc phải chạy:
npm run lint
npm run typecheck
npm run build

Sau đó báo cáo:
- File đã tạo
- Component đã tạo
- Route đã tạo
- Kết quả kiểm tra
- Việc chưa hoàn thành
- Xác nhận không ảnh hưởng hệ thống hiện có
```
