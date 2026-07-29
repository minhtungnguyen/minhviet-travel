# Phase 2 Report — Premium UI (Mock Provider)

**Ngày:** 2026-07-27
**Phạm vi:** Toàn bộ UI khách hàng (`app/ve-vui-choi/**`) chạy trên `MockAttractionTicketProvider` của Phase 1 — landing, listing (tổng + theo điểm đến), chi tiết sản phẩm có booking panel thật, kết quả đặt vé. Không viết `OneInventoryProvider` thật (vẫn chờ tài liệu OneAPI đầy đủ — `09-open-questions.md` #1).

---

## 1. Đã hoàn thành

- 5 route công khai: `/ve-vui-choi`, `/ve-vui-choi/tat-ca`, `/ve-vui-choi/[destinationSlug]`, `/ve-vui-choi/[destinationSlug]/[productSlug]`, `/ve-vui-choi/ket-qua/[orderCode]`.
- 2 API route: `POST /api/v1/attraction-tickets/availability` (public, re-check giá/tồn), `POST /api/v1/attraction-tickets/bookings` (guest checkout).
- Booking panel thật: chọn ngày → chọn loại vé (3 loại, giá thật) → số lượng → kiểm tra khả dụng real-time → tổng tiền → form liên hệ → submit → redirect trang kết quả theo `orderCode` + email.
- Dữ liệu demo thật trong Supabase: 3 khu vui chơi, 5 sản phẩm vé, tại 2 điểm đến có sẵn trong `destinations` (Hạ Long, Cát Bà) — dùng ảnh thật đã có trong repo, không dùng placeholder xấu.
- SEO: `generateMetadata` động cho mọi trang, canonical, OG/Twitter card, sitemap.xml giờ tự động (async, đọc DB thật), redirect `/tickets` → `/ve-vui-choi` (301), xóa route placeholder cũ.
- Bổ sung ngoại lệ thứ 3 cho `admin-client.ts` (guest checkout) — quyết định kiến trúc đã hoãn ở Phase 1, nay thực hiện đúng như đã ghi chú.

## 2. File đã tạo hoặc sửa

**Tạo mới (chính):**
```
app/ve-vui-choi/page.tsx, tat-ca/page.tsx, [destinationSlug]/page.tsx, [destinationSlug]/[productSlug]/page.tsx, ket-qua/[orderCode]/page.tsx
app/api/v1/attraction-tickets/availability/route.ts, bookings/route.ts
components/attraction-ticket/*.tsx (9 file: hero, search-box, product-card, visual-tile, destination-section, featured-section, why-section, faq-section, final-cta, booking-panel, order-lookup-form)
lib/attraction-ticket/get-attraction-ticket-services.ts, build-catalog-view-models.ts, build-variant-options.ts
database/migrations/0017_attraction_ticket_images.sql
database/policies/0005_attraction_provider_ref_public_read.sql
database/seeds/0007_attraction_ticket_demo.sql
```

**Sửa:**
| File | Thay đổi |
|---|---|
| `modules/attraction-ticket/domain/types.ts`, `schemas/*.ts`, `infrastructure/*.ts` | Thêm `imageUrl`/`imageAlt` (khắc phục thiếu sót Phase 1 — xem §7), thêm `createGuestBooking`/`getBookingForCustomer`, thêm 2 method bulk tránh N+1, thêm `listProductVariantOptions`/`getPublishedVenueById` |
| `modules/attraction-ticket/application/attraction-catalog.service.ts` | Thêm dependency `AttractionTicketProvider` (chỉ đọc, không mutate) |
| `shared/supabase/admin-client.ts` | +1 ngoại lệ tài liệu hoá (guest booking route) |
| `components/site/site-header.tsx` | Nav href `/tickets` → `/ve-vui-choi` (1 dòng) |
| `next.config.mjs` | +redirect 301 |
| `app/sitemap.ts` | Đổi thành `async`, thêm route Ticket động từ DB thật |
| `.env.example` | +6 biến `ONEINVENTORY_*` (Phase 1, không đổi lại) |
| `shared/supabase/database.types.ts` | Regenerate qua Supabase MCP (2 lần, sau mỗi migration) |

**Xóa:** `app/tickets/page.tsx` (placeholder cũ, không còn route nào tới được do redirect ở `next.config.mjs`).

## 3. Migration đã chạy

Áp dụng thật lên `mv-travel-os-dev` qua Supabase MCP (không chỉ viết file):

| # | Tên | Nội dung |
|---|---|---|
| 1 | `0017_attraction_ticket_images` | +`image_url`/`image_alt` trên `attraction_venues`/`attraction_products` — **khắc phục thiếu sót thật của Phase 1** (bảng gốc quên cột ảnh), phát hiện ngay khi bắt đầu viết UI, xem §7 |
| 2 | `0005_attraction_provider_ref_public_read` | +1 RLS policy cho phép đọc công khai `attraction_provider_refs` khi sản phẩm/venue đang ACTIVE — **sửa lỗi thật phát hiện qua browser-verify** (trang chi tiết công khai không đọc được provider ref do RLS staff-only từ Phase 1), xem §6 |
| — | Seed `0007_attraction_ticket_demo` | 3 venue + 5 product + translations + FAQ + cross-sell — dữ liệu demo thật, không phải mock trong code |

Kết quả xác nhận qua `list_tables`: 5 sản phẩm hiển thị đúng với ảnh/giá/venue/destination khớp seed.

## 4. Test đã chạy

```
pnpm typecheck   ✅ 0 lỗi
pnpm lint        ✅ 0 lỗi (1 lỗi thật đã sửa trong lúc làm — xem §6)
pnpm test        ✅ 158/158 pass (không đổi so với Phase 1 — Phase 2 không thêm unit test mới vì đây là lớp UI, đã có test cho toàn bộ business logic bên dưới ở Phase 1)
pnpm build       ✅ Compiled successfully — 5 route mới đều xuất hiện, `/tickets` không còn, `/sitemap.xml` chuyển ƒ (dynamic, đúng vì giờ đọc DB thật)
```

## 5. Kết quả kiểm thử qua trình duyệt thật (không chỉ code review)

| Kiểm tra | Kết quả |
|---|---|
| Landing page render với dữ liệu Supabase thật | ✅ Hero, search box, featured card ("Vinpearl Cát Bà" + badge "Nổi bật") đều đúng |
| Trang chi tiết sản phẩm (`/ve-vui-choi/ha-long/ve-cap-treo-nu-hoang-ha-long`) | ✅ Xác nhận qua cả HTML server-render (curl) và screenshot: tiêu đề, breadcrumb, highlights, mô tả, hướng dẫn sử dụng, chính sách hủy đều đúng nội dung đã seed |
| Booking panel — chọn loại vé | ✅ 3 loại vé hiển thị đúng nhãn/giá ("Vé người lớn 890.000đ", "Vé trẻ em 590.000đ", "Vé ưu đãi (demo hết chỗ) 750.000đ"), tổng tiền cập nhật đúng theo lựa chọn |
| `POST /availability` — trường hợp còn vé | ✅ Trả đúng giá/currency |
| `POST /availability` — trường hợp hết vé (`mock-variant-soldout`) | ✅ Trả đúng `remaining: 0` — UI sẽ hiện đúng thông báo "hết vé" |
| `POST /bookings` — validate input sai | ✅ Trả `400 VALIDATION_ERROR` với chi tiết lỗi rõ ràng, không crash |
| `POST /bookings` — input hợp lệ, ghi DB thật | ⚠️ **Trả `500 INTERNAL_ERROR`** — nguyên nhân xác nhận qua log server: `SUPABASE_SERVICE_ROLE_KEY` chưa cấu hình (đúng như đã cảnh báo từ `00-current-state-audit.md` §2 và §5 Phase 0). Đây là hạn chế môi trường đã biết trước, không phải lỗi code — `withRoute` xử lý đúng (client chỉ thấy thông báo chung, log server có đầy đủ chi tiết + requestId để tra cứu) |
| Responsive 6 breakpoint | ⚠️ Không xác nhận được đầy đủ bằng ảnh chụp — công cụ `resize_window` không thay đổi viewport thật trong phiên này (giới hạn công cụ, không phải giới hạn code). Đã xác nhận `scrollWidth === clientWidth` (không tràn ngang) ở độ rộng thực tế render được. Class Tailwind responsive dùng đúng pattern đã kiểm chứng trực quan ở Combo/Flight trong cùng codebase (`sm:`/`lg:` breakpoint nhất quán) |

## 6. Lỗi thật phát hiện và đã sửa trong phiên này

1. **Hero bị cắt chữ ở đầu** — nội dung hero (breadcrumb + eyebrow + h1 2 dòng + subheadline + search box + trust signal) vượt quá chiều cao container `justify-end`, bị `overflow-hidden` cắt mất phần đầu tiêu đề. Sửa: tăng chiều cao hero (`70vh` → `85vh`), rút gọn 3 dòng trust-signal thành 1 dòng.
2. **`react-hooks/set-state-in-effect` lint error thật** (không phải warning) — gọi `setState` đồng bộ ngay trong `useEffect`. Sửa bằng cách chuyển toàn bộ logic fetch-on-change từ `useEffect` sang gọi trực tiếp trong `onChange` handler — đúng theo khuyến nghị của chính rule, không phải patch qua loa.
3. **RLS chặn nhầm đọc công khai `attraction_provider_refs`** — phát hiện khi browser-verify cho thấy trang chi tiết công khai báo "chưa có loại vé khả dụng" dù dữ liệu đã seed đúng. Nguyên nhân: policy Phase 1 chỉ cho staff đọc bảng này, nhưng trang public cần đọc `provider_product_id` để tra loại vé — và giá trị này vốn dĩ đã lộ ra client qua `providerVariantId` trong props rồi, nên việc chặn ở DB không tăng bảo mật, chỉ làm hỏng tính năng. Sửa bằng 1 policy mới, giới hạn đúng phạm vi (chỉ ref của sản phẩm/venue đang ACTIVE).
4. **Sitemap type error** — `flatMap` thay cho `map`+`filter` với type predicate không hợp lệ.
5. **`app/sitemap.ts` không tự làm sập nếu DB lỗi** — bọc phần đọc Ticket trong `try/catch`, fallback về danh sách route tĩnh nếu Supabase tạm thời không truy cập được (brief §XV không yêu cầu observability phức tạp, nhưng route quan trọng như sitemap không được phép 500 toàn trang chỉ vì 1 phần dữ liệu).

## 7. Thiếu sót Phase 1 được khắc phục trong Phase 2

`attraction_venues`/`attraction_products` ở Phase 1 **quên hoàn toàn cột ảnh** — chỉ phát hiện khi bắt đầu viết UI thật cần render ảnh. Đã sửa bằng migration `0017` (thêm cột, không ảnh hưởng dữ liệu vì 2 bảng còn rỗng lúc đó) và cập nhật toàn bộ domain/schema/repository liên quan. Ghi nhận công khai ở đây thay vì sửa âm thầm — đúng tinh thần báo cáo trung thực brief yêu cầu.

## 8. Rủi ro còn lại

- **Chưa live-test được write path thật của checkout** (tạo đơn hàng thật trong DB) — bị chặn bởi `SUPABASE_SERVICE_ROLE_KEY` chưa cấu hình, đúng như đã cảnh báo từ Phase 0. Cần chủ dự án điền key trước khi coi checkout là "đã kiểm thử đầy đủ".
- Booking panel giả định OneAPI hỗ trợ đúng luồng "tạo đơn → xác nhận ngay lập tức" (mock provider mô phỏng vậy) — luồng thật có thể cần bước xác nhận thanh toán riêng (đã ghi ở `02-system-architecture.md` §5, chờ duyệt mở rộng contract).
- Responsive 6 breakpoint chưa có ảnh chụp đầy đủ do giới hạn công cụ trong phiên này — khuyến nghị verify lại bằng công cụ/máy khác trước khi coi UI là hoàn thiện 100%.
- JSON-LD (breadcrumb schema, TouristAttraction/Product schema) chưa làm — đúng theo kế hoạch đã ghi ở `06-implementation-plan.md` (thuộc Phase 5), không phải bị bỏ sót.
- Rate limiting cho endpoint checkout chưa có — cũng đúng kế hoạch (Phase 6), không phải bỏ sót.

## 9. Open questions

Không phát sinh thêm mục mới ngoài các mục đã có ở `09-open-questions.md`. Mục #1 (tài liệu OneAPI thiếu) vẫn là block duy nhất cho Phase 3.

## 10. Việc tiếp theo

Chờ chủ dự án: (a) điền `SUPABASE_SERVICE_ROLE_KEY` để có thể live-test hoàn chỉnh luồng đặt vé, (b) xác nhận lại UI ở môi trường có công cụ resize viewport tin cậy hơn. Sau đó có thể tiếp Phase 5 (CMS tối giản, JSON-LD, cross-sell) hoặc chờ tài liệu OneAPI đầy đủ để làm Phase 3.

## 11. Cách rollback

- **Code:** toàn bộ nằm trong file/thư mục mới (`app/ve-vui-choi/**`, `app/api/v1/attraction-tickets/**`, `components/attraction-ticket/**`, `lib/attraction-ticket/**`) — xóa là an toàn tuyệt đối. `app/tickets/page.tsx` khôi phục bằng `git checkout` nếu muốn giữ route cũ song song (không khuyến nghị vì đã có redirect thay thế).
- **Các dòng sửa nhỏ trong file dùng chung** (`site-header.tsx` 1 dòng, `next.config.mjs` +redirect, `admin-client.ts` +comment, `sitemap.ts`) — revert riêng lẻ, không phụ thuộc lẫn nhau.
- **Database:**
```sql
alter table attraction_venues drop column image_url, drop column image_alt;
alter table attraction_products drop column image_url, drop column image_alt;
drop policy "public_read_attraction_provider_refs_for_published" on attraction_provider_refs;
delete from attraction_products; delete from attraction_venues; -- xóa dữ liệu demo Phase 2
```
(Rollback toàn bộ module về trạng thái trước Phase 1 xem `10-phase-1-report.md` §10.)
