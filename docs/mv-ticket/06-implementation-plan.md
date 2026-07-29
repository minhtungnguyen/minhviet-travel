# 06 — Implementation Plan

UI và Backend chạy **song song** trong mỗi phase có thể — không chờ nhau tuần tự trừ khi có phụ thuộc kỹ thuật thật (đúng §XVI brief).

## Phase 0 — Audit & tài liệu (đang thực hiện)

Deliverable: 10 file `/docs/mv-ticket/*.md`. **Dừng lại, chờ phê duyệt trước khi viết code** (đúng yêu cầu hiện tại của chủ dự án).

## Phase 1 — Foundation

- Migration `0016_attraction_ticket_module.sql` + RLS policy (`03-database-design.md`).
- `modules/attraction-ticket/{domain,infrastructure,application,schemas}` — theo khuôn `modules/cms`.
- Mock/stub implementation của `AttractionTicketProvider` (trả dữ liệu cố định từ fixture, KHÔNG gọi mạng) để Phase 2 UI có dữ liệu chuẩn hoá làm việc ngay — đặt trong `integrations/attraction-ticket/providers/` cùng chỗ provider thật sau này, phân biệt rõ bằng tên file (`mock-provider.ts` vs `one-inventory-provider.ts`), **không để lẫn vào Production** (feature flag `ONEINVENTORY_ENABLED` quyết định dùng mock hay thật, không phải import nhầm).
- Thêm permission key mới (seed).

## Phase 2 — Premium UI bằng dữ liệu mock chuẩn hoá

- `app/ve-vui-choi/**` đầy đủ route (landing/listing/detail/checkout/result) chạy với mock provider từ Phase 1.
- CMS UI tối thiểu (Destinations/Attractions/Ticket Products/Content Overrides) — có thể admin UI dùng chung shell với các module CMS khác đã có, nếu tồn tại; nếu Admin UI (frontend) chưa tồn tại cho các module hiện có (chỉ có API), đây là **quyết định phạm vi lớn** — xem `09-open-questions.md` #8.
- Responsive đầy đủ 6 breakpoint, browser-verify (không chỉ code review).

## Phase 3 — OneInventory Adapter & Sandbox

**Điều kiện tiên quyết cứng: có tài liệu OneAPI đầy đủ hoặc sandbox/Postman collection** (xem `04-oneinventory-mapping.md` §0, `09-open-questions.md` #1). Không bắt đầu phần "gọi API thật" của phase này trước khi điều kiện này được giải quyết — có thể làm trước phần khung (HTTP client wrapper, retry, error mapping tổng quát) không phụ thuộc field cụ thể.

- `one-inventory-http-client.ts` (timeout/retry/correlation ID/logging/masking).
- Request/response Zod schema theo tài liệu đầy đủ.
- `OneInventoryProvider implements AttractionTicketProvider` (+ method mở rộng đã đề xuất, nếu được duyệt).
- Đồng bộ thủ công Destination/Attraction/Loại hình (API 3.1–3.3) qua nút "Đồng bộ" trong CMS.
- Toàn bộ test với Sandbox `ONEINVENTORY_ENV=sandbox`.

## Phase 4 — Checkout, Booking, Voucher

- Luồng 10 bước thật kết nối Sandbox.
- Idempotency (`idempotency_key` unique constraint + chống double-submit).
- Audit log mọi mutation booking (**cần `SUPABASE_SERVICE_ROLE_KEY` đã cấu hình** — kiểm tra trước khi bắt đầu phase này).
- Booking result UI đủ 6 trạng thái, polling trạng thái/voucher.
- Thông báo khách hàng (kênh cụ thể — email? SMS? — quyết định ở `09-open-questions.md` #9).

## Phase 5 — CMS, SEO, cross-sell cơ bản

- CMS đầy đủ theo `01-product-scope.md` §2 (Draft/Published/Archived, Featured, Sort order, Preview, lịch sử cập nhật cơ bản, phân quyền, khoá sửa Provider ID tuỳ tiện).
- SEO: JSON-LD, sitemap, robots, redirect `/tickets`→`/ve-vui-choi`, breadcrumb schema.
- Cross-sell nội bộ.

## Phase 6 — QA, responsive, security, performance

- Test plan đầy đủ (`07-test-plan.md`).
- Rate limiting cho endpoint nhạy cảm (checkout, cancel).
- Kiểm tra IDOR (không đoán được booking người khác qua URL).
- Kiểm tra ảnh tối ưu, lazy load, không N+1 query.

## Phase 7 — Production readiness & go-live

- `08-go-live-checklist.md` đầy đủ.
- Chuyển `ONEINVENTORY_ENV=production`, `ONEINVENTORY_ENABLED=true` sau khi có API key Production thật + duyệt thương mại với ezCloud/OneInventory (hợp đồng — ngoài phạm vi kỹ thuật, xem `09-open-questions.md` #10).

## Ghi chú tiến độ

Mỗi phase kết thúc, báo cáo theo đúng mẫu §XVIII brief (đã hoàn thành / file thay đổi / migration đã chạy / test / kết quả / UI / rủi ro / open question / việc tiếp theo / rollback) — không báo cáo chung chung.
