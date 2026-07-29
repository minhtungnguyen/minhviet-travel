# Phase 1 Report — Foundation & Mock Provider

**Ngày:** 2026-07-27
**Phạm vi:** Database migration, `modules/attraction-ticket`, mock `AttractionTicketProvider`, permission seed — đúng scope Phase 1 trong `06-implementation-plan.md`. Không động tới UI/route công khai (Phase 2), không viết `OneInventoryProvider` thật (Phase 3, đang chờ tài liệu OneAPI đầy đủ — `09-open-questions.md` #1).

---

## 1. Đã hoàn thành

- Database schema cho toàn bộ domain Attraction Ticket: 1 enum + 12 bảng, RLS đầy đủ, 7 permission key mới + gán quyền cho 5 role liên quan. **Đã áp dụng thật lên `mv-travel-os-dev`** (không chỉ viết file) sau khi được duyệt qua checklist an toàn.
- `modules/attraction-ticket/{domain,infrastructure,application,schemas}` — theo đúng khuôn `modules/cms` (interface + `Supabase*Repository`, `*Service(repository, client, auditLogger[, provider])`, Zod `.strict()` schema).
- `MockAttractionTicketProvider` implement nguyên contract `AttractionTicketProvider` đã có sẵn trong repo (không sửa contract) — không gọi mạng, dữ liệu tất định, có 1 biến thể "hết vé" dựng sẵn để test UI out-of-stock sau này.
- 17 unit test mới, toàn bộ pass.
- `.env.example` bổ sung 6 biến `ONEINVENTORY_*` (chưa được code nào đọc — đúng scope, sẽ dùng ở Phase 3).

## 2. File đã tạo hoặc sửa

**Tạo mới:**
```
database/migrations/0016_attraction_ticket_module.sql
database/policies/0004_attraction_ticket_policies.sql
database/seeds/0006_attraction_ticket.sql
modules/attraction-ticket/domain/types.ts
modules/attraction-ticket/schemas/attraction-ticket.schema.ts
modules/attraction-ticket/infrastructure/attraction-ticket.repository.ts
modules/attraction-ticket/application/attraction-catalog.service.ts
modules/attraction-ticket/application/attraction-booking.service.ts
modules/attraction-ticket/application/attraction-booking.service.test.ts
modules/attraction-ticket/application/attraction-sync.service.ts
modules/attraction-ticket/application/attraction-sync.service.test.ts
integrations/attraction-ticket/providers/mock-data.ts
integrations/attraction-ticket/providers/mock-provider.ts
integrations/attraction-ticket/providers/mock-provider.test.ts
integrations/attraction-ticket/providers/get-provider.ts
```

**Sửa (additive, không đổi hành vi hiện có):**
| File | Thay đổi |
|---|---|
| `.env.example` | +6 dòng biến `ONEINVENTORY_*`, không sửa biến cũ |
| `shared/supabase/database.types.ts` | Regenerate từ schema live (bắt buộc — file này auto-generate, quy ước "never hand-edit" đã tôn trọng: dùng đúng lệnh generate qua Supabase MCP, không tay sửa) |

Không file nào khác trong `app/`, `components/`, `lib/` bị đụng — `app/tickets/page.tsx` (placeholder hiện tại) vẫn nguyên vẹn, chưa cần đổi ở Phase 1.

## 3. Migration đã chạy (áp dụng thật lên `mv-travel-os-dev`, không chỉ viết file)

Đã trình bày checklist an toàn đầy đủ (bảng tạo mới, không ALTER/DROP/RENAME/DELETE bảng cũ) và được duyệt trước khi chạy. Kết quả xác nhận trực tiếp qua Supabase MCP sau khi áp dụng:

| Hạng mục | Trước | Sau |
|---|---|---|
| Tổng số bảng | 47 | 59 (+12, đúng số bảng migration 0016 tạo) |
| RLS enabled | 47/47 | 59/59 (12 bảng mới đều bật RLS) |
| `permissions` | 25 | 32 (+7, đúng số permission key mới) |
| `role_permissions` | 91 | 109 (+18 = MANAGER 7 + MARKETING 3 + BOOKING 2 + OPERATION 4 + VIEWER 2) |

Có 1 lỗi cú pháp SQL trong lần chạy đầu (`unique (website_id, lower(slug))` — Postgres không cho biểu thức trong constraint UNIQUE inline, phải dùng `create unique index` riêng, đúng pattern `destination_translations_locale_slug_idx` đã có sẵn trong `0007_master_data_extended.sql` mà tôi đọc nhưng áp dụng sai lúc đầu). Transaction tự rollback sạch, xác nhận lại bảng vẫn là 47 trước khi sửa và chạy lại — không để lại trạng thái dở dang.

**Security/Performance advisor sau khi áp dụng:** 0 phát hiện bảo mật mới liên quan bảng mới (6 warning hiện có đều là pre-existing, liên quan `auth_has_permission`/leaked-password-protection, không phải do migration này). 31 phát hiện performance liên quan bảng mới, toàn bộ thuộc 3 loại đã có tiền lệ chấp nhận được trong chính báo cáo Sprint 1B.1 của dự án ("expected on a zero-traffic dev database", "intentional architectural pattern"): 10 unindexed-FK trên cột ít truy vấn (locale, created_by/triggered_by), 14 unused-index (bảng rỗng), 7 multiple-permissive-policies (đúng pattern public+staff tách policy đã dùng toàn hệ thống). Không có phát hiện nào chỉ ra lỗi thật.

## 4. Test đã chạy

```
pnpm typecheck   ✅ 0 lỗi
pnpm lint        ✅ 0 lỗi
pnpm test        ✅ 154/154 pass (27 test file, +4 file/+17 test mới)
pnpm build       ✅ Compiled successfully — toàn bộ route hiện có không đổi, /tickets vẫn placeholder cũ
```

## 5. Kết quả test chi tiết (17 test mới)

- `mock-provider.test.ts` (7): tạo đơn thành công + xuất voucher; từ chối khi vượt tồn kho; `searchAvailability`/`revalidatePrice` nhất quán; lỗi `NOT_FOUND` cho variant không tồn tại; hủy đơn cập nhật đúng trạng thái; instance mới không nhớ đơn của instance cũ.
- `attraction-booking.service.test.ts` (6): tạo booking → CONFIRMED → tự động xuất voucher; idempotency (gọi lại cùng key không tạo đơn thứ 2); từ chối khi hết vé (CONFLICT); từ chối sản phẩm khác website (NOT_FOUND); hủy đơn gọi đúng provider + cập nhật trạng thái; từ chối actor thiếu quyền `booking.cancel` (FORBIDDEN).
- `attraction-sync.service.test.ts` (4): bỏ qua mapping provider không khớp sản phẩm nội bộ nào; từ chối actor thiếu quyền `sync.trigger`; yêu cầu sync sản phẩm trước khi sync variant; áp dụng variant mapping đầu tiên vào provider ref.

## 6. Screenshot/mô tả UI

Không áp dụng — Phase 1 không có UI, đúng scope (Phase 2 mới có UI dùng mock provider này).

## 7. Rủi ro còn lại

- **Đã sửa trong lúc làm, không còn tồn đọng:** phát hiện và loại bỏ 1 thiết kế không an toàn trước khi viết — method `getBookingForCustomer` (tra cứu đơn theo order_code+email cho khách vãng lai) ban đầu định thêm nhưng bị loại khỏi scope Phase 1 vì RLS hiện tại (`attraction_orders` chỉ staff đọc được) khiến nó không hoạt động đúng với session/anon client, và cách sửa đúng (dùng service-role client) là một quyết định kiến trúc cần cân nhắc riêng (thêm ngoại lệ thứ 3 cho `admin-client.ts`, hiện chỉ có 2 ngoại lệ đã duyệt). Repository method `findOrderByCodeForCustomer` vẫn còn (đã viết, đúng, chưa dùng) — sẵn sàng cho quyết định này ở Phase 4.
- V1 checkout giới hạn **đúng 1 dòng sản phẩm/đơn** (không phải giỏ hàng nhiều loại vé) — vì contract `AttractionTicketProvider.createOrder()` hiện tại chỉ nhận 1 variant/lần gọi. Ghi rõ trong `attraction-ticket.schema.ts`. Nếu cần giỏ hàng nhiều loại vé, phải mở rộng contract trước (đã đề xuất ở `02-system-architecture.md` §5, chờ duyệt).
- 10 cảnh báo unindexed-FK hiệu năng — chấp nhận được ở quy mô hiện tại (bảng rỗng), theo đúng tiền lệ đã được dự án chấp nhận trước đó; không cần xử lý trước khi có dữ liệu thật.

## 8. Open questions (không đổi so với Phase 0, nhắc lại các mục liên quan trực tiếp Phase 1-2)

Không phát sinh open question mới. Các mục cũ vẫn giữ nguyên mức ưu tiên — `09-open-questions.md` #1 (tài liệu OneAPI thiếu) vẫn là blocker duy nhất cho Phase 3.

## 9. Việc tiếp theo

**Phase 2** — UI premium (`app/ve-vui-choi/**`) dùng `getAttractionTicketProvider()` (hiện trả `MockAttractionTicketProvider`) để có dữ liệu chuẩn hoá ngay, không chờ OneAPI. Cần quyết định trước khi bắt đầu: cấu trúc URL listing (#7), phạm vi CMS admin UI (#8) — cả hai đã liệt kê ở `09-open-questions.md`.

## 10. Cách rollback

Toàn bộ thay đổi Phase 1 nằm trong các file/bảng mới, không đổi hành vi module nào đang chạy.

- **Code:** `git revert`/xoá `modules/attraction-ticket/`, `integrations/attraction-ticket/providers/`, và 3 dòng thêm trong `.env.example` — an toàn tuyệt đối vì không file nào khác import chúng.
- **Database (nếu cần rollback thật):**
```sql
drop table if exists attraction_api_error_logs, attraction_sync_logs, attraction_vouchers,
  attraction_order_items, attraction_orders, attraction_cross_sells, attraction_faqs,
  attraction_provider_refs, attraction_product_translations, attraction_products,
  attraction_venue_translations, attraction_venues;
drop type if exists attraction_order_status;
delete from role_permissions where permission_id in (select id from permissions where key like 'attraction_ticket.%');
delete from permissions where key like 'attraction_ticket.%';
```
Sau đó chạy lại `supabase gen types typescript --project-id otusjahkdjpxqayeeqqn > shared/supabase/database.types.ts` để đồng bộ lại type. Không ảnh hưởng 47 bảng gốc hay dữ liệu seed đã có từ trước.
