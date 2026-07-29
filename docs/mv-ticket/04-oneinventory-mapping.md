# 04 — OneInventory Mapping

## 0. TÌNH TRẠNG TÀI LIỆU — ĐỌC TRƯỚC KHI DÙNG FILE NÀY

File PDF tại `docs/integrations/oneinventory/Giới thiệu_Tài liệu đặc tả kỹ thuật OneAPI (1).pdf` (v1.1.3) **chỉ có 7/50 trang** theo chính mục lục của nó. Đã xác nhận bằng 2 cách độc lập (đếm trang thật qua PyMuPDF: `page_count = 7`; và `pdftotext` không trích được nội dung nào từ trang 8 trở đi). Nội dung có trong file: **Bìa, Bảng ghi nhận thay đổi, Mục lục, Mục I (Giới thiệu), Mục II (Mô hình kết nối)**. Nội dung **hoàn toàn thiếu**: **Mục III (Đặc tả kết nối)** — chính là phần chứa mọi endpoint, request/response field, mã lỗi — từ trang 8 đến 50.

**Hệ quả:** Bảng mapping dưới đây chỉ có thể liệt kê **tên nghiệp vụ và thứ tự luồng** (lấy từ Mục lục + mô tả luồng kết nối 10 bước ở trang 6-7, đều có tên tài liệu tham chiếu rõ ràng, ví dụ "API 5.1", "API 4.2"). **Không có bất kỳ field, endpoint path, HTTP method, hay response schema nào được xác nhận** — đúng nguyên tắc brief §I.11, mọi chỗ thiếu thông tin dưới đây là **typed placeholder + TODO**, không phải suy đoán trình bày như thật.

**Hành động cần thiết trước Phase 3:** xin bản đầy đủ tài liệu (ít nhất trang 8–50) hoặc Postman collection / sandbox credentials trực tiếp từ ezCloud/OneInventory. Đây là **blocker cứng** cho việc viết `OneInventoryProvider` thật — ghi ở `09-open-questions.md` #1.

---

## 1. Những gì ĐÃ xác nhận từ tài liệu (đáng tin cậy)

| Mục | Nội dung xác nhận |
|---|---|
| Nhà cung cấp | ezCloud (Công ty TNHH Công nghệ ezCLOUD Toàn Cầu), sản phẩm OneInventory, API tên "OneAPI" |
| Phiên bản tài liệu | v1.1.3, cập nhật gần nhất 20/12/2022 (API bản thân là v1.3 theo bảng changelog) |
| Mô hình kết nối | Server-to-Server. `Merchant Server` (Minh Việt) gọi `OneAPI Server` (OneInventory), không có bước nào client gọi thẳng OneInventory |
| Giao thức | HTTPS, RESTful API, JSON, xác thực qua **HTTP Authorization Header** (loại header cụ thể — Bearer? Basic? API-Key custom? — **chưa xác nhận**, xem Open Question) |
| Yêu cầu để lấy khoá | Phải đăng ký với OneInventory để họ cấp "khóa API và khóa bảo mật" (2 khoá riêng — khớp việc brief đã đặt sẵn cả `ONEINVENTORY_API_KEY` và `ONEINVENTORY_SECRET`) |
| Đồng bộ trước khi kết nối | Bắt buộc đồng bộ 3 loại dữ liệu tĩnh trước: Khu vui chơi (API 3.1), Vị trí địa lý (API 3.2), Loại hình (API 3.3) — trước khi gọi bất kỳ API bán hàng nào |
| Luồng nghiệp vụ đầy đủ | 10 bước, đúng thứ tự, có thể tuỳ biến/lặp lại (xem bảng §2) |

## 2. Luồng 10 bước → API tương ứng (theo đúng số mục trong tài liệu)

| Bước | Nghiệp vụ | API tham chiếu (theo Mục lục) | Trang gốc (không có trong file) |
|---|---|---|---|
| 1–3 | Đồng bộ Khu vui chơi / Vị trí địa lý / Loại hình | 3.1, 3.2, 3.3 | 8–13 |
| 4 | Tìm kiếm khu vui chơi | 4.1 Tìm kiếm khu vui chơi | 14–16 |
| 5 | Xem loại vé của khu vui chơi đã chọn | 4.2 Tìm kiếm loại vé | 17–18 |
| 6 | Tạo đơn hàng | 5.1 Tạo đơn hàng | 19–21 |
| 7 | Xác nhận thanh toán → tự động xuất & giữ vé | 5.2 Xác nhận thanh toán | 22 |
| 8 | Xem chi tiết đơn hàng | 5.3 Chi tiết đơn hàng | 23–27 |
| 9 | Xem vé đã xuất | 5.4 Xem vé | 28–29 |
| 10 | Hủy đơn hàng | 5.5 Hủy đơn hàng | 30 |
| (bổ sung, không nằm trong 10 bước chính) | Danh sách đơn hàng | 5.6 | 31–34 |
| (bổ sung) | Người dùng: đăng ký/đăng nhập/quên-đổi mật khẩu/thông tin/chỉnh sửa | 6.1–6.6 | 35–45 |
| (bổ sung) | Danh sách phương thức thanh toán | 7.1 | 46–47 |
| (bổ sung) | Kiểm tra trạng thái thanh toán tạm thời | 7.2 | 48–49 |

## 3. Map sang `AttractionTicketProvider` (interface nội bộ, xem `02-system-architecture.md` §5)

| Method interface | API OneAPI tương ứng | Trạng thái field-level |
|---|---|---|
| `syncProducts()` | 3.1 Khu vui chơi (+ có thể cần 3.3 Loại hình) | **TODO** — chưa biết response shape |
| `syncVariants(providerProductId)` | 4.2 Tìm kiếm loại vé | **TODO** |
| `searchAvailability(providerVariantId, date)` | Không có API riêng biệt tên "availability" trong mục lục — nhiều khả năng nằm trong 4.2 (tài liệu changelog dòng 3 ghi: "bổ sung ngày sử dụng có sẵn ở đầu ra" của Tìm kiếm khu vui chơi) hoặc 4.2 | **TODO — cần xác nhận có API riêng hay lồng trong 4.2** |
| `revalidatePrice(providerVariantId, date)` | Không thấy tên mục riêng — có thể trùng với gọi lại 4.2 trước khi 5.1 | **TODO — Open Question #4** |
| `createOrder(...)` | 5.1 Tạo đơn hàng | **TODO** |
| *(đề xuất mới)* `confirmPayment(...)` | 5.2 Xác nhận thanh toán | **TODO — method chưa có trong contract hiện tại, xem 02 §5** |
| `retrieveVoucher(providerOrderId)` | 5.4 Xem vé | **TODO** |
| `cancelOrder(providerOrderId)` | 5.5 Hủy đơn hàng | **TODO — chưa biết chính sách hủy (điều kiện, phí) vì Mục III thiếu** |
| `changeUsageDate(providerOrderId, newDate)` | Không thấy mục riêng trong Mục lục — **có thể KHÔNG được OneAPI hỗ trợ** | **TODO — Open Question #5, có thể phải bỏ method này hoặc implement bằng hủy+tạo lại** |
| `queryOrderStatus(providerOrderId)` | 5.3 Chi tiết đơn hàng (và/hoặc 5.6 Danh sách đơn hàng) | **TODO** |
| *(đề xuất mới)* `getOrderDetail(...)` | 5.3 Chi tiết đơn hàng | **TODO** |
| *(đề xuất mới)* `listPaymentMethods()` | 7.1 Danh sách phương thức thanh toán | **TODO** |
| *(chưa map)* Kiểm tra trạng thái thanh toán tạm thời | 7.2 | **Không có method tương ứng trong contract — cần hiểu rõ nghiệp vụ trước khi thêm** (có thể dùng khi thanh toán qua cổng thứ 3, cần biết luồng thanh toán thật — Open Question #6) |
| *(không dùng ở V1)* Toàn bộ 6.1–6.6 (Người dùng) | 6.1–6.6 | Xem `09-open-questions.md` #3 — nhiều khả năng là quản lý user cấp merchant trên OneInventory, không phải khách hàng cuối; **V1 không tích hợp phần này** trừ khi xác nhận ngược lại |

## 4. Typed placeholder — mẫu áp dụng cho Phase 3

Không viết code ở tài liệu này, nhưng để Phase 3 bắt đầu đúng hướng, mẫu bắt buộc cho MỌI method khi chưa có field thật:

```ts
// TODO(OneInventory): request/response field CHƯA được xác nhận từ tài liệu đầy đủ.
// Nguồn: docs/integrations/oneinventory/... (chỉ có trang 1-7/50).
// Không tự đoán field — chờ tài liệu đầy đủ hoặc sandbox Postman collection.
// Xem docs/mv-ticket/09-open-questions.md #1.
async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  throw new Error('NOT_IMPLEMENTED: OneInventory field-level spec missing — see docs/mv-ticket/09-open-questions.md #1')
}
```

Mọi request/response type trong `integrations/attraction-ticket/schemas/one-inventory-*.schema.ts` ở Phase 3 khởi đầu **rỗng có chú thích TODO**, không tự bịa field tên tiếng Anh đoán theo cảm tính.

## 5. Việc CÓ thể làm ngay dù thiếu field-level spec

Dù không có chi tiết field, các phần sau **không phụ thuộc** vào field-level spec và có thể triển khai song song (đúng brief §XVI "UI và Backend chạy song song"):

- Toàn bộ Phase 1 (DB schema, domain model nội bộ) — đã thiết kế ở `03-database-design.md`, không phụ thuộc OneAPI field.
- Toàn bộ Phase 2 (UI với dữ liệu mock chuẩn hoá theo `AttractionTicketProvider`'s domain types, KHÔNG phải theo response OneAPI thật) — vì domain type nội bộ (`TicketVariant`, `TicketOrder`...) đã có sẵn trong contract, độc lập với OneAPI's raw shape.
- Khung Adapter (client wrapper, retry, timeout, logging, error mapping) — logic này không phụ thuộc field cụ thể, chỉ phụ thuộc **giao thức chung** (đã xác nhận: HTTPS/REST/JSON/Authorization Header) đã biết đủ ở Mục 1.
- CMS quản lý Content Override — hoàn toàn không phụ thuộc OneAPI.

**Việc KHÔNG thể làm nếu thiếu tài liệu:** viết `OneInventoryProvider` thật gọi API thật (Phase 3 phần "kết nối Sandbox thật"), vì không biết endpoint path, field, mã lỗi cụ thể.
