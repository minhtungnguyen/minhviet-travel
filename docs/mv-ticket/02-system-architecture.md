# 02 — System Architecture

## 1. Nguyên tắc chọn kiến trúc

Theo yêu cầu brief §IV: "Phải ưu tiên convention hiện tại của dự án." Repo đã có 2 quy ước rất rõ ràng (xem `00-current-state-audit.md` §2):

1. Business module nội bộ: `modules/<name>/{domain,infrastructure,application,schemas}` — **không phải** `domain/application/infrastructure/presentation` như brief gợi ý (không module nào hiện có dùng layer "presentation" — trình bày do chính route handler + React component đảm nhiệm, gọi thẳng vào `application/` service).
2. Provider integration: `integrations/<domain>/contracts/<domain>-provider.ts` — **và quan trọng nhất: `integrations/attraction-ticket/contracts/attraction-ticket-provider.ts` đã tồn tại**, viết sẵn cho đúng bài toán này, đặt tên nhà cung cấp tương lai gồm cả "EZ OneAPI" (chính là OneInventory/ezCloud).

**Quyết định kiến trúc #1: dùng nguyên 2 convention trên, không tạo `/src/modules/tickets/` hay `/src/integrations/oneinventory/` như brief gợi ý minh hoạ.** Tên module business = `attraction-ticket` (khớp tên contract đã có), tên route công khai = `/ve-vui-choi` (khớp yêu cầu SEO tiếng Việt).

## 2. Sơ đồ kiến trúc thực tế

```
Frontend (app/ve-vui-choi/**, React Server/Client Components)
        ↓ gọi qua fetch nội bộ HOẶC gọi thẳng application-service trong Server Component
Internal Ticket API (app/api/v1/attraction-tickets/**)   ← withRoute + resolveActor + Zod, đúng pattern 35 route hiện có
        ↓
Ticket Application Service (modules/attraction-ticket/application/*.service.ts)
        ↓ (business rule, RBAC, audit log — KHÔNG gọi HTTP trực tiếp)
Ticket Repository (modules/attraction-ticket/infrastructure/*.repository.ts)   → Supabase (dữ liệu Minh Việt quản lý: Content Override, Booking, Voucher cache)
        +
OneInventoryProvider (integrations/attraction-ticket/providers/one-inventory-provider.ts implements AttractionTicketProvider)
        ↓
OneInventory Adapter internals (client/schemas/mappers/errors — xem §4)
        ↓ HTTPS, server-side only
OneInventory OneAPI (ezCloud)
```

Điểm khác biệt quan trọng so với sơ đồ minh hoạ trong brief: **Application Service không gọi Provider trực tiếp một cách vô tổ chức** — nó gọi qua interface `AttractionTicketProvider` được inject vào constructor (đúng pattern `OrganizationService(repository)` đã có), để business logic (Application Service) không phụ thuộc trực tiếp vào chi tiết OneInventory. Đây chính là yêu cầu §I.9 của brief ("phải có lớp Adapter để chuẩn hóa dữ liệu").

## 3. Cấu trúc thư mục đề xuất

```
modules/attraction-ticket/
  domain/
    types.ts                 Destination(dùng lại master-data), Attraction, TicketProduct, TicketVariant,
                              Availability, Booking, BookingItem, Voucher, ProviderReference, ContentOverride
  infrastructure/
    attraction-ticket.repository.ts     AttractionTicketRepository interface + SupabaseAttractionTicketRepository
                                         (chỉ đọc/ghi bảng Minh Việt sở hữu — KHÔNG gọi OneInventory)
  application/
    attraction-catalog.service.ts       Tìm kiếm/list/detail sản phẩm — trộn Content Override (DB) + dữ liệu động (Provider)
    attraction-booking.service.ts       Toàn bộ luồng đặt vé/thanh toán/hủy — nhận AttractionTicketProvider qua constructor
    attraction-sync.service.ts          Đồng bộ metadata (không đồng bộ giá/tồn định kỳ — xem 07-VII của brief)
  schemas/
    attraction-ticket.schema.ts         Zod input schema cho mọi route (search, checkout, admin CRUD content override)

integrations/attraction-ticket/
  contracts/
    attraction-ticket-provider.ts       ĐÃ CÓ — mở rộng có kiểm soát, xem §5 bên dưới
  providers/
    one-inventory-provider.ts           class OneInventoryProvider implements AttractionTicketProvider
  client/
    one-inventory-http-client.ts        fetch wrapper: timeout, retry có giới hạn, correlation ID, structured logging
  schemas/
    one-inventory-request.schema.ts     Zod cho MỌI request gửi đi (validate trước khi gọi)
    one-inventory-response.schema.ts    Zod cho MỌI response nhận về (KHÔNG tin response thô)
  mappers/
    one-inventory-mapper.ts             Response OneInventory (đã validate) → domain type nội bộ (TicketVariant, Booking...)
  errors/
    one-inventory-error.ts              Chuẩn hoá lỗi OneInventory → AppError nội bộ (dùng lại shared/errors/app-error.ts đã có)
  fixtures/
    *.json                              Fixture cố định cho test (KHÔNG dùng Production API cho automated test — brief §XIV)

app/api/v1/attraction-tickets/
  destinations/route.ts
  attractions/route.ts, attractions/[id]/route.ts
  products/route.ts, products/[id]/route.ts, products/[id]/availability/route.ts
  bookings/route.ts, bookings/[id]/route.ts, bookings/[id]/confirm-payment/route.ts, bookings/[id]/cancel/route.ts, bookings/[id]/voucher/route.ts
  content-overrides/route.ts, content-overrides/[id]/route.ts
  sync-logs/route.ts

app/ve-vui-choi/
  page.tsx                              Landing
  tat-ca/page.tsx (hoặc [destination-slug]/page.tsx tuỳ quyết định listing — xem 05)
  [destination-slug]/[product-slug]/page.tsx    Product detail
  dat-ve/[bookingId]/page.tsx            Checkout (nếu tách riêng bước, giống pattern /ve-may-bay/dat-ve)
  ket-qua/[bookingId]/page.tsx           Booking result (gộp Pending/Confirmed/Failed theo trạng thái, không tách 3 route như Flight — quyết định ở 05, lý do: Ticket có polling trạng thái ngắn hơn Flight)

lib/attraction-ticket/
  attraction-ticket-content-repository.ts   Đọc Content Override (SEO/marketing) — pattern seed→Zod chỉ dùng cho phần
                                              TĨNH nếu cần cache tại build time; phần ĐỘNG luôn qua modules/attraction-ticket
```

## 4. OneInventory Adapter — yêu cầu bắt buộc (brief §VI)

Toàn bộ nằm trong `integrations/attraction-ticket/{client,schemas,mappers,errors,providers}`:

- **Request/Response schema validation**: Zod parse cả 2 chiều — request trước khi gửi (bắt lỗi build sai payload sớm), response sau khi nhận (không tin OneInventory trả đúng shape).
- **Timeout**: `ONEINVENTORY_TIMEOUT_MS`, dùng `AbortController`.
- **Retry có giới hạn**: chỉ retry lỗi mạng/5xx/timeout, KHÔNG retry lỗi nghiệp vụ (4xx như hết vé) — số lần retry giới hạn (đề xuất 2), backoff tăng dần.
- **Error normalization**: mọi lỗi từ OneInventory → `AppError` (dùng `shared/errors/app-error.ts` đã có, cùng type với lỗi nội bộ khác) qua `one-inventory-error.ts`.
- **Correlation ID**: sinh `requestId` (giống `withRoute` đã sinh sẵn cho mọi route nội bộ), gắn vào log và (nếu OneAPI hỗ trợ header custom) gửi kèm request để đối chiếu 2 bên khi debug.
- **Structured logging**: log JSON có `requestId`, `endpoint`, `durationMs`, `status` — che (mask) toàn bộ field nhạy cảm (API key, secret, thông tin thanh toán) trước khi log.
- **Masking dữ liệu nhạy cảm**: không log API key/secret dù ở log level nào; không log số thẻ/thông tin thanh toán (brief §XIII).
- **Idempotency cho createOrder**: OneAPI chưa xác nhận có hỗ trợ idempotency key ở tầng của họ hay không (xem `09-open-questions.md`) — **bắt buộc chống trùng ở tầng Minh Việt**: `attraction_orders.idempotency_key` unique constraint (client sinh UUID khi bắt đầu checkout, gửi lại đúng key nếu retry) + disable nút submit ngay khi click (client) + kiểm tra double-submit ở Application Service trước khi gọi Provider.
- **Audit log cho booking**: mọi tạo/sửa/hủy booking gọi `recordAuditLog` (đã có sẵn, dùng service-role client) — cần `SUPABASE_SERVICE_ROLE_KEY` được cấu hình (xem open question).
- **Sandbox vs Production**: `ONEINVENTORY_ENV=sandbox|production`, đổi `ONEINVENTORY_BASE_URL` tương ứng.
- **Feature flag**: `ONEINVENTORY_ENABLED=false` mặc định — khi tắt, `OneInventoryProvider` trả lỗi nghiệp vụ chuẩn hoá ("dịch vụ đang chuẩn bị") thay vì gọi mạng, để Phase 2 (UI mock) chạy độc lập trước khi Adapter thật sẵn sàng.

## 5. Mở rộng contract `AttractionTicketProvider` — quyết định cần thiết

Contract hiện có (9 method) được viết cho một mô hình đơn giản hơn OneAPI thực tế yêu cầu — cụ thể, OneAPI tách rõ **Bước 6: Tạo đơn hàng** và **Bước 7: Xác nhận thanh toán (kèm xuất vé)** thành 2 lệnh gọi khác nhau (§II.3 tài liệu), trong khi `createOrder(providerVariantId, quantity, date)` hiện tại gộp làm một và không có method `confirmPayment` nào.

**Đề xuất bổ sung (additive, không sửa method cũ — đúng nguyên tắc "nếu contract chưa vừa, đó là dấu hiệu cần mở rộng cho mọi provider tương lai" đã ghi trong `add-future-api-provider.md`):**

```ts
// Bổ sung vào integrations/attraction-ticket/contracts/attraction-ticket-provider.ts
confirmPayment(providerOrderId: string, payment: { method: string; reference?: string }): Promise<TicketOrder>
getOrderDetail(providerOrderId: string): Promise<TicketOrderDetail>   // chi tiết đầy đủ hơn queryOrderStatus hiện có
listPaymentMethods(): Promise<PaymentMethod[]>
```

Đây là **đề xuất chờ phê duyệt**, không tự ý sửa file trong Phase 0. Ghi vào `09-open-questions.md` để chủ dự án xác nhận trước khi động vào contract dùng chung cho cả Flight/Email/AI trong tương lai.

## 6. Chiến lược dữ liệu Hybrid (brief §VII)

| Loại dữ liệu | Nguồn | Lưu ở đâu | Tần suất |
|---|---|---|---|
| Biên tập/SEO (tiêu đề marketing, mô tả, ảnh chọn lọc, FAQ, highlights, hướng dẫn, chính sách trình bày, cross-sell, thứ tự, trạng thái publish, meta) | Minh Việt tự nhập qua CMS | Bảng `attraction_content_overrides` (Postgres, RLS theo `website_id`) | Realtime khi admin sửa |
| Metadata tham chiếu (provider ID, trạng thái active, lần sync gần nhất) | OneInventory (đồng bộ định kỳ/khi cần) | Bảng `attraction_provider_refs` | Theo lịch sync (đề xuất: khi admin bấm "Đồng bộ" thủ công trong CMS ở V1 — **không cron tự động** để giữ đơn giản, brief §XVII "không overengineering") |
| Động (giá, loại vé, ngày áp dụng, khả dụng, trạng thái booking, voucher) | OneInventory | **Không lưu lại** — gọi trực tiếp tại thời điểm cần qua Adapter, cache tầng ứng dụng rất ngắn hạn nếu cần (ví dụ React `cache()` trong 1 request) | Tại thời điểm truy vấn |
| Booking đã tạo | Minh Việt ghi nhận song song với OneInventory | Bảng `attraction_orders`/`attraction_order_items` (nguồn sự thật nội bộ) + `providerOrderId` tham chiếu | Ngay khi tạo/cập nhật trạng thái |

**Không import toàn bộ catalog định kỳ** (đúng §VII) — chỉ đồng bộ **ID mapping + trạng thái active** khi admin chủ động chọn "thêm khu vui chơi này vào Minh Việt", không tự động kéo hết dữ liệu OneInventory về.

**Lưu lịch sử lỗi sync**: bảng `attraction_sync_logs` (xem `03-database-design.md`).

## 7. Environment Variables

```
ONEINVENTORY_BASE_URL=
ONEINVENTORY_API_KEY=
ONEINVENTORY_SECRET=
ONEINVENTORY_MERCHANT_CODE=
ONEINVENTORY_ENV=sandbox
ONEINVENTORY_TIMEOUT_MS=10000
ONEINVENTORY_ENABLED=false
```

Theo đúng convention `shared/env.ts` đã có: đọc **lazy** qua hàm `getOneInventoryEnv()` (Zod schema riêng), không đọc `process.env` trực tiếp trong code nghiệp vụ, không prefix `NEXT_PUBLIC_` (toàn bộ server-only, khớp §I.4/§I.5 brief — không bao giờ gọi OneInventory từ browser). Thêm vào `.env.example` với comment trỏ tới file dùng nó, đúng convention đã thấy ở các biến hiện có.

## 8. URL redirect `/tickets` → `/ve-vui-choi`

Dùng bảng `redirect_rules` (đã có, thuộc module `seo`) nếu muốn quản lý qua CMS, hoặc `next.config.mjs` `redirects()` nếu muốn đơn giản/tĩnh cho V1. **Đề xuất V1: `next.config.mjs`** (đơn giản, không cần thêm thao tác CMS cho 1 redirect duy nhất) — ghi rõ TODO chuyển sang `redirect_rules` nếu sau này cần nhiều redirect động hơn.

## 9. Những gì KHÔNG xây (nhắc lại theo §I.7, §I.14 brief)

- Không Multi-provider Routing — `OneInventoryProvider` là implementation **duy nhất** được inject, không có registry/factory chọn provider.
- Không khôi phục bảng `integration_providers`/`integration_connections` trong V1 (theo đúng playbook: chỉ cần khi có ≥2 connection cần bật/tắt qua Admin UI).
