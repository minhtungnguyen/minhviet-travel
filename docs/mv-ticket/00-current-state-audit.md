# 00 — Current State Audit

**Module:** Vé vui chơi (Attraction Tickets) — Phase 0
**Ngày:** 2026-07-27
**Phạm vi:** Audit-only. Không có code, migration, hay thay đổi database nào được thực hiện để tạo tài liệu này.

---

## 1. Stack công nghệ thực tế

| Layer | Thực tế |
|---|---|
| Framework | Next.js 16.2.6 (App Router), React 19 |
| Ngôn ngữ | TypeScript 5.7.3, `tsc --noEmit` strict |
| Styling | Tailwind CSS v4 (CSS-based `@theme`, không có `tailwind.config.ts`) |
| Component primitives | `@base-ui/react`, `class-variance-authority`, `lucide-react` |
| Animation | `framer-motion` |
| Validation | `zod` (v4) — dùng ở mọi boundary: route input, repository output, provider response tương lai |
| Database/Auth | Supabase (Postgres 17, project `mv-travel-os-dev`, region `ap-southeast-1`) qua `@supabase/ssr` + `@supabase/supabase-js` — **không có ORM** (Prisma/Drizzle) |
| Test runner | Vitest 4 — **chỉ chạy `*.test.ts`**, không chạy `*.test.tsx`, không có `@testing-library` |
| E2E | **Không tồn tại** — không có Playwright config, không có thư mục e2e nào được commit. Việc "browser-verify" trong các sprint trước dùng Chrome DevTools MCP thủ công, không phải test tự động trong CI |
| Deploy | Không tìm thấy pipeline CI/CD (không có `.github/workflows`, không có `vercel.json` tùy biến) — `@vercel/analytics` có mặt trong dependencies, gợi ý host trên Vercel, nhưng cấu hình deploy cụ thể không nằm trong repo này |
| Package manager | pnpm (`pnpm-lock.yaml`, `pnpm.overrides.hono`) |

**Lưu ý về override `hono`:** `package.json` có `pnpm.overrides.hono: 4.12.25` nhưng `hono` không phải dependency trực tiếp — đây là transitive dependency (có thể qua Supabase CLI hoặc một tool dev khác), không ảnh hưởng runtime của module Ticket. Không cần xử lý.

---

## 2. Kiến trúc backend đã tồn tại (quan trọng — phải tái sử dụng, không phát minh lại)

Repo đã có một backend admin/CMS platform khá hoàn chỉnh, theo kiến trúc DDD-lite nhất quán:

```
modules/<name>/
  domain/types.ts            Kiểu dữ liệu nội bộ (camelCase, mirror DB row)
  infrastructure/<name>.repository.ts   Interface + SupabaseXRepository implements — duy nhất nơi query DB
  application/<name>.service.ts         XService(repository, client, auditLogger) — authorization + business rule
  schemas/<name>.schema.ts              Zod input schema, dùng ở route handler

integrations/<domain>/
  contracts/<domain>-provider.ts        Interface thuần TypeScript — CHƯA có implementation thật nào (trừ Email có 1 bản Console dev-only)
```

10 module đã có: `organization`, `access-control`, `settings`, `master-data`, `media`, `cms`, `forms`, `seo`, `audit`, và namespace `navigation` (dùng chung schema với `cms`). 4 integration contract đã có: `flight`, `attraction-ticket`, `email`, `ai`.

**Route handler pattern** (mọi route dưới `app/api/v1/**` đều theo đúng 1 khuôn):
```
withRoute(async (req, requestId) => {
  const parsed = someSchema.safeParse(...)          // Zod validate input
  if (!parsed.success) throw AppError.validation(...)
  const actor = await resolveActor()                 // session + RBAC resolve
  const service = new XService(new SupabaseXRepository(await getServerSupabaseClient()), recordAuditLog)
  const result = await service.doSomething(actor, parsed.data)
  return ok(result, requestId)
})
```

**Database:** 13 migration file (`0001`–`0013`, raw SQL, không dùng migration-runner framework), 3 file RLS policy, 5 file seed. **Đã deploy thật lên `mv-travel-os-dev`** (Sprint 1B.1, xác nhận: 47/47 bảng có RLS, 98 policy, đã seed, đã test RLS với 5 kịch bản authorization). `resolveActor()` và `getServerSupabaseClient()` — trước đây (báo cáo Sprint 1B.1) còn là placeholder — **đã được triển khai thật** ở thời điểm audit này (đọc trực tiếp `shared/auth/session.ts`, `shared/supabase/server-client.ts`, không phải suy đoán từ báo cáo cũ).

**Đa tenant:** `organizations` → `brands` → `websites` (không denormalize `organization_id` xuống bảng con — join qua `brands`). Mọi bảng nội dung công khai đều có `website_id` FK trực tiếp, kiểm tra quyền qua `resolveWebsiteOrganizationId()` + `requireWebsiteAccess()`.

**Chưa tồn tại và quan trọng cho module Ticket:**
- **Không có domain Booking/Order nào** trong 13 migration. Module Flight (module thương mại phức tạp nhất hiện có) hoàn toàn không có booking backend thật — `FlightBookingDraft` chỉ lưu ở `sessionStorage` trình duyệt, tài liệu nội bộ (`types/flight.ts`) ghi rõ đây là quyết định có chủ đích vì "Booking domain (database, ownership, auth) nền tảng này chưa có." **Module Ticket sẽ là domain Booking/Order thật đầu tiên của toàn hệ thống** — không có precedent nội bộ để copy, phải thiết kế mới nhưng theo đúng convention layer/repository/service đã có.
- **Bảng `integration_providers`/`integration_connections`/`integration_sync_logs`** đã được thiết kế ở Sprint 1A rồi **chủ động bỏ** ở Sprint 1A.2 (chưa cần vì chưa có integration thật nào). Tài liệu `docs/playbooks/add-future-api-provider.md` mô tả rõ: khi có integration thật đầu tiên (= chính là OneInventory), có 2 lựa chọn — (a) inject provider trực tiếp qua constructor, dùng biến môi trường, không cần bảng registry; (b) khôi phục lại bảng registry nếu cần nhiều connection/toggle qua Admin UI. **Khuyến nghị: (a) cho V1** — xem `02-system-architecture.md`.
- **`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL` vẫn để trống** trong `.env.local` tại thời điểm audit (xác nhận trực tiếp, không lộ giá trị). Điều này có nghĩa: các luồng dùng session/anon-key (RLS) hoạt động được nếu có user đăng nhập thật, nhưng bất kỳ thao tác nào cần `admin-client.ts` (service-role, bypass RLS — hiện chỉdùng cho `modules/audit` và public form submission) **sẽ lỗi cho đến khi chủ dự án tự điền key này** (không có công cụ nào trong phiên làm việc lấy được key, đây là hành động chỉ chủ dự án làm được qua Supabase Dashboard).

---

## 3. Thành phần frontend có thể tái sử dụng

| Thành phần | Vị trí | Ghi chú |
|---|---|---|
| Layout dùng chung | `components/site/site-chrome.tsx`, `site-header.tsx`, `site-footer.tsx` | Nav item "Vé vui chơi" → `/tickets` **đã có sẵn** trong `site-header.tsx`, không cần sửa |
| Button system | `components/mv/mv-button.tsx` | `cva` variants: primary/accent/gold/secondary/outline/outline-gold/outline-light/ghost/danger — đủ dùng, không tạo variant mới |
| Section heading | `components/homepage/section-heading.tsx` | Dùng lại nguyên cho mọi section landing |
| Scroll-reveal | `components/homepage/reveal.tsx` | Framer Motion, tôn trọng `prefers-reduced-motion` |
| Card DNA | `components/combo/combo-card.tsx`, `components/homepage/destination-card.tsx` | Pattern ảnh + tiêu đề + giá + CTA đã chuẩn hóa, tái dùng tinh thần (không import chéo module) |
| SEO / JSON-LD | `components/seo/json-ld.tsx`, `constants/seo.ts` | Đã có `TourDetailJsonLd`, `FlightDetailJsonLd`... — thêm `TicketProductJsonLd` theo đúng pattern |
| `generateMetadata` pattern | mọi `app/*/page.tsx` hiện có | SEO fields nằm trong content schema (Zod), không hardcode |
| Placeholder hiện tại | `app/tickets/page.tsx` | Đang dùng `PlaceholderSection` — sẽ bị **thay thế hoàn toàn** bởi landing page thật (không phải sửa, mà là viết lại route này) |
| Design tokens | `app/globals.css` (`--mv-*` tokens) | Navy/Journey Blue/Sky Cyan là nền tảng; không có accent riêng cho Ticket — cần quyết định (xem `09-open-questions.md`) |
| Repository/schema pattern | `lib/flight/flight-repository.ts`, `lib/mice/*`, `lib/combo/*` | Pattern "seed local + Zod parse tại boundary" — dùng cho **nội dung biên tập/SEO** (Content Override), KHÔNG dùng cho dữ liệu động (giá, tồn) — dữ liệu động phải qua OneInventory Adapter thật |

---

## 4. Thành phần KHÔNG được đụng tới

- `components/site/site-header.tsx`, `site-footer.tsx` — dùng chung toàn site, chỉ đọc `href: '/tickets'` đã có sẵn, không sửa file.
- Mọi module đã hoàn thiện: `app/combo/**`, `app/mice/**`, `app/ve-may-bay/**`, `app/tour/**` — không có lý do kỹ thuật để đụng vào các route/component này.
- `modules/{organization,access-control,cms,media,seo,forms,settings,audit}` và migration `0001`–`0013` — không sửa cấu trúc bảng hiện có; chỉ **thêm** migration mới (`0016+`), không bao giờ `ALTER`/`DROP` bảng đang chạy production mà không có kế hoạch riêng.
- `shared/auth/*`, `shared/supabase/*` — đây là lớp nền auth/RBAC toàn hệ thống; module Ticket **dùng** `resolveActor()`/`requirePermission()` có sẵn, không viết lại.
- `integrations/attraction-ticket/contracts/attraction-ticket-provider.ts` — **không sửa file này để "vừa" với OneInventory một cách chắp vá**. Theo đúng nguyên tắc đã ghi trong `docs/playbooks/add-future-api-provider.md`: nếu contract chưa đủ, đó là dấu hiệu cần *bàn bạc mở rộng có chủ đích* (áp dụng cho mọi provider tương lai), không phải sửa ngầm cho riêng OneInventory. Xem đề xuất mở rộng ở `02-system-architecture.md`/`04-oneinventory-mapping.md`.

---

## 5. Rủi ro phá vỡ hệ thống

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| Module Ticket là domain Booking/Order **đầu tiên** — không có precedent để so sánh đúng/sai | Trung bình | Thiết kế mới nhưng bám sát convention layer/repository/service đã kiểm chứng ở `cms`/`organization` |
| `SUPABASE_SERVICE_ROLE_KEY` chưa cấu hình | Cao (block go-live, không phải block dev) | Cần chủ dự án điền trước Phase 4 (booking cần ghi audit log — audit chỉ ghi được qua service-role) |
| Chưa có E2E test framework | Trung bình | Thêm Playwright là quyết định công cụ mới — cần approve trước (xem `09-open-questions.md`), không tự ý thêm dependency lớn |
| Trang `/tickets` hiện tại đã được index trong `app/sitemap.ts` (priority 0.6) | Thấp | Giữ nguyên URL `/tickets`, thay nội dung — không đổi URL, không cần redirect |
| PDF đặc tả OneAPI trong repo **chỉ có 7/50 trang** (thiếu toàn bộ phần III — chi tiết endpoint) | **Cao — blocker cho Phase 3** | Xem `09-open-questions.md` mục #1 — cần tài liệu đầy đủ hoặc Postman collection/sandbox từ ezCloud/OneInventory trước khi viết Adapter thật |
| RLS mới cho bảng Ticket phải test kỹ (mô hình đa tenant đã có nhưng chưa test 2-tenant thật) | Trung bình | Sprint 1B.1 tự ghi nhận: "cross-tenant leak chưa test thực nghiệm vì mới có 1 tổ chức" — áp dụng cảnh báo này cho bảng mới |

---

## 6. Technical debt hiện tại (liên quan trực tiếp module Ticket)

1. **Hai tầng dữ liệu song song chưa hợp nhất**: `modules/cms` (backend thật, có RLS, chưa được frontend dùng) vs. `lib/cms/client.ts` (seed file tĩnh, frontend đang dùng). Không phải lỗi của module Ticket, nhưng nếu Ticket đi theo đúng kiến trúc mới (gọi API thật), nó sẽ là module đầu tiên "đóng" khoảng cách này — cần nhất quán, không lặp lại pattern seed-tĩnh cho phần **nội dung biên tập** nếu muốn CMS thật quản lý được (xem `01-product-scope.md`).
2. **3 nguồn "màu sắc/token" cạnh tranh** (`MASTER-BIBLE`, `MV_Operating_System`, `design-system/` chưa wire) — đã ghi nhận từ trước, không phải vấn đề mới do Ticket tạo ra; landing page Ticket sẽ theo đúng `app/globals.css` (nguồn chuẩn thật) như mọi module gần đây (Combo, Flight).
3. **`role_scopes` chưa được enforce** (ghi nhận trong Sprint 1B.1 §14) — chấp nhận được cho V1 vì hiện chỉ có 1 website hoạt động thật.

---

## 7. Database hiện tại có đáp ứng không?

**Có, làm nền tảng tốt — nhưng cần migration mới, không đủ để dùng ngay:**

- Tái dùng được: `destinations` (đã có `destination_type = 'ATTRACTION'`), `product_types` (đã seed sẵn giá trị `ATTRACTION_TICKET`), `media_assets`, `seo_metadata` (polymorphic theo `entity_type`/`entity_id`), `websites`/`organizations` (multi-tenant scoping), toàn bộ RBAC (`roles`/`permissions` — cần thêm permission key mới dạng `attraction_ticket.*`, không cần đổi cấu trúc bảng).
- Cần tạo mới: toàn bộ domain Booking/Order (chưa tồn tại ở đâu), bảng sản phẩm vé (`TicketProduct`/`TicketVariant`), bảng tham chiếu provider, bảng voucher. Chi tiết đầy đủ ở `03-database-design.md`.

## 8. Cần migration mới?

**Có.** Ít nhất 1 migration file mới (`0016_attraction_ticket_module.sql` hoặc tương đương) cho bảng lõi, cộng RLS policy đi kèm. Không đổi bất kỳ migration `0001`–`0013` nào đã deploy.

## 9. Cơ chế deploy hiện tại

Không tìm thấy pipeline CI/CD trong repo (không `.github/workflows`). Deploy thực tế (theo dấu vết `@vercel/analytics` + cấu trúc Next.js chuẩn) nhiều khả năng qua Vercel git-integration thủ công/tự động ngoài phạm vi repo này. **Cần xác nhận với chủ dự án** — xem `09-open-questions.md`. Database deploy qua Supabase MCP/CLI thủ công theo từng migration (đã có tiền lệ ở Sprint 1B.1), không tự động hoá trong CI.

## 10. Cách rollback

- **Code:** mọi thay đổi nằm trong file/thư mục mới (`modules/attraction-ticket/**`, `integrations/attraction-ticket/providers/**`, `app/tickets/**`, `app/api/v1/attraction-tickets/**`) — rollback bằng `git revert`/xóa các file mới, không ảnh hưởng module khác vì không sửa file dùng chung.
- **Database:** mỗi migration mới có thể viết kèm khối rollback tương ứng (drop table theo thứ tự ngược FK) — theo đúng tinh thần thận trọng của Sprint 1B.1 (không migration nào từng phải rollback thật, nhưng mọi thay đổi đều review trước khi apply).
- **Feature flag:** `ONEINVENTORY_ENABLED=false` cho phép tắt hoàn toàn lời gọi ra ngoài (fallback về trạng thái "đang chuẩn bị dữ liệu") mà không cần rollback code — xem `02-system-architecture.md`.
