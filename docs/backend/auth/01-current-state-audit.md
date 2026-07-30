# 01 — Current State Audit: Auth, Login, Logout & RBAC

**Phase:** 0 (Current State Audit) — Sprint "Backend Foundation — Auth, Login, Logout & RBAC"
**Method:** Đọc trực tiếp source code + truy vấn trực tiếp Supabase MCP vào project `mv-travel-os-dev` (`otusjahkdjpxqayeeqqn`, ap-southeast-1). Không suy đoán từ tên file hay từ docs cũ mà không đối chiếu; mọi khẳng định về schema/RLS/dữ liệu bên dưới đều được xác nhận qua `list_tables`/`list_migrations`/`execute_sql` trực tiếp trên database thật, theo đúng yêu cầu §13 của brief ("database thực tế là nguồn sự thật").
**Không sửa code trong tài liệu này.** Chỉ audit.

---

## Kết luận đầu trang (đọc trước khi vào chi tiết)

Đây **không phải một sân chơi trống**. Sprint 1A/1B (`docs/backend/sprint-1b2-implementation-report.md` và các báo cáo trước đó) đã xây xong một **RBAC engine đầy đủ ở tầng backend**: `roles`/`permissions`/`role_permissions`/`user_roles`/`user_profiles`/`user_organization_memberships`/`user_website_access`/`audit_logs`/`security_events` đã tồn tại, có RLS, có test, và **đã deploy thật** lên `mv-travel-os-dev` — không phải chỉ có trên giấy. `resolveActor()`, `requirePermission()`, `requireWebsiteAccess()` đã chạy thật trong `/api/v1/*` (CMS, Media, Forms, SEO, Users...).

Cái **chưa có** là lớp con người tương tác trực tiếp: không có trang đăng nhập thật (form hiện tại là UI giả), không có `/admin`, không có `/auth/callback`, không có `/forgot-password`/`/reset-password`, không có middleware chặn route theo quyền, và audit log auth (login/logout) chưa được ghi ở đâu cả dù bảng đã sẵn sàng.

Nói cách khác: **Phase 2 và phần lớn Phase 3 của brief này (role model, bảng RBAC, RLS matrix, migration) về cơ bản đã xong** — việc còn lại tập trung ở **Phase 1 (wiring login/logout thật), Phase 4 (Login UI thật), Phase 5 (Admin Shell — chưa tồn tại), Phase 6 (User Management UI), Phase 7 (audit log cho sự kiện auth)**. Chính báo cáo Sprint 1B.2 cũng đã tự ghi nhận: *"Admin UI (any screen) — needs literally every module above — the natural first Sprint 2 deliverable, since the API surface is now complete"* (`docs/backend/sprint-1b2-implementation-report.md`, mục A.10). Sprint này đúng là bước đó.

---

## 1. Kiến trúc repository hiện tại

- Next.js App Router (`app/`), TypeScript strict.
- Kiến trúc theo module: `modules/<domain>/{domain,application,infrastructure,schemas}` (vd. `modules/access-control/`, `modules/audit/`, `modules/organization/`) — service layer nhận `ActorContext` làm tham số đầu tiên, gọi `requirePermission()` trước khi chạm repository.
- API nội bộ: `app/api/v1/**` — mọi route dùng `withRoute()` (`shared/http/handle-route.ts`) bọc lỗi thành `AppError`, trả về qua `ok()/fail()` (`shared/http/response.ts`).
- Public marketing site (`/`, `/ve-vui-choi`, `/combo`, `/tours`, ...) và "cổng khách hàng doanh nghiệp" (`/login`, `/register`) dùng chung `SiteChrome`/`SiteHeader` — đây là site công khai, **khác** với Admin Shell cần xây (Phase 5), dù cả hai cùng dùng Supabase Auth.
- Tài liệu kiến trúc/bảo mật đã có sẵn, chất lượng cao, và (phần lớn) khớp với database thật: `docs/security/security-model.md`, `docs/security/authorization-flow.md`, `docs/database/rls-policy-matrix.md`, `docs/database/erd.md`, `docs/database/migration-strategy.md`.

## 2. Next.js version & routing model

- `next@16.2.6`, App Router, React 19.
- **Next.js 16 đổi tên `middleware.ts` thành `proxy.ts`** — file gốc là `proxy.ts` (không phải `middleware.ts`), export `proxy()` thay vì `middleware()`. Đây là điểm dễ nhầm nếu tra cứu theo tài liệu Next.js cũ hoặc theo thói quen; **Phase 1 phải sửa `proxy.ts`, không tạo `middleware.ts` mới**.
- `proxy.ts` hiện tại **chỉ refresh session cookie** (gọi `updateSupabaseSession()`), **không có logic chặn route theo trạng thái đăng nhập hay theo quyền**. Matcher hiện loại trừ static assets/ảnh, áp dụng cho toàn bộ path còn lại.

```ts
// proxy.ts — toàn bộ nội dung hiện tại
export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request)
}
export const config = { matcher: [...] }
```

→ Đây là **gap thật** cho Phase 1 ("Middleware bảo vệ route Admin"): chưa có gì cả, phải thêm.

## 3. Supabase client hiện có

Bốn client, tách biệt rõ ràng, đúng khuyến nghị `@supabase/ssr` và đúng yêu cầu bảo mật của brief:

| File | Dùng ở đâu | Key |
|---|---|---|
| `shared/supabase/browser-client.ts` | Client Components | anon key — RLS là lớp chặn duy nhất |
| `shared/supabase/server-client.ts` | Server Components / Route Handlers | anon key + cookie của session hiện tại (RLS áp dụng theo actor) |
| `shared/supabase/admin-client.ts` | 3 call site duy nhất, đã audit (xem bên dưới) | service-role key, `persistSession:false` |
| `shared/supabase/proxy-client.ts` | Gọi từ `proxy.ts` | anon key, chỉ để refresh cookie |

`getServerSupabaseClient()`/`getAdminSupabaseClient()` đều có `import 'server-only'` ở đầu file — build sẽ fail nếu một Client Component lỡ import. Không có `console.log`/nơi nào in ra service-role key.

**Service-role key hiện chỉ được dùng ở đúng 3 nơi** (đã verify lại bằng grep, khớp với claim trong `docs/security/authorization-flow.md`):
1. `modules/audit/application/audit.service.ts` (ghi `audit_logs` — bảng không có policy INSERT cho bất kỳ role nào, kể cả staff, theo thiết kế).
2. Route submit form public (`form_submissions` không có policy INSERT cho anon).
3. Route booking vé vui chơi guest checkout (`attraction_orders` không có policy INSERT cho anon).

→ **Không có service-role key nào lộ ra client bundle** — đã đúng yêu cầu brief ngay từ đầu, không cần sửa.

`shared/env.ts` validate qua Zod, lazy (không parse ở module top-level) — build vẫn pass dù chưa set env thật, đúng "Sprint 1A guarantee" đã ghi trong comment.

## 4. Auth tables và Supabase Auth hiện tại

Supabase Auth là authority duy nhất (`master-prompt §8.2`) — không có bảng password/token tự viết nào. `auth.users` hiện có **đúng 1 user thật**: `nguyen.minhtung@gmail.com` (id `8289c14e-f5f5-4b6b-99ae-8b7ac6b64c9d`), đã có `user_profiles` (`account_status = ACTIVE`), đã có `user_organization_memberships` (ACTIVE), đã được gán role `SUPER_ADMIN` qua `user_roles`. **`last_sign_in_at` = null** — tài khoản này chưa từng đăng nhập thật lần nào (khớp với việc chưa có login UI thật để đăng nhập bằng).

## 5. Các bảng `profiles`/`users`/`roles`/`permissions`/`user_roles`/`audit_logs`

Tên bảng thật khác tên brief nêu (không phải thiếu, chỉ là naming khác) — đối chiếu:

| Brief nói | Bảng thật đã tồn tại | Rows hiện tại |
|---|---|---|
| `profiles` | `user_profiles` (+ `employee_profiles` cho dữ liệu nhân sự mở rộng) | 1 |
| `users` | không có bảng riêng — `auth.users` (Supabase quản lý) | 1 |
| `roles` | `roles` | 8 |
| `permissions` | `permissions` | 33 |
| `user_roles` | `user_roles` (many-to-many user↔role, **đã hỗ trợ multi-role** — đúng yêu cầu Phase 2 "một user có nhiều role") | 1 |
| `audit_logs` | `audit_logs` (+ `audit_log_changes` cho field-level diff, + `security_events` riêng) | 0 |

Ngoài ra còn có `role_permissions` (111 rows — ma trận role↔permission), `user_organization_memberships` (1), `user_website_access` (0, đúng vì mặc định là org-wide), `role_scopes` (0 rows, cột đã có nhưng **chưa được enforce** — ghi chú thật trong DB: *"with one active organization/brand/website, a scope check can only ever resolve to organization-wide today"*).

**8 role hiện có:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MARKETING`, `SALES`, `BOOKING`, `OPERATION`, `VIEWER`.
**7 role brief đề xuất:** `super_admin`, `admin`, `content_editor`, `sales`, `booking`, `operator`, `accountant`.

Đối chiếu: `SUPER_ADMIN`/`ADMIN`/`SALES`/`BOOKING`/`OPERATION` khớp gần đúng (khác case, `operator`≈`OPERATION`). `content_editor` chưa có role tương ứng 1:1 — gần nhất là `MARKETING` ("Manages CMS content, SEO and campaign forms") hoặc `MANAGER` (rộng hơn, thêm cả master data). **`accountant` chưa tồn tại** — không có role, không có permission nào liên quan tài chính/kế toán trong 33 permission hiện có. `VIEWER` tồn tại trong DB nhưng không có trong đề xuất của brief. → **Đây là quyết định của Phase 2, không tự ý đổi tên/xoá/thêm role trong tài liệu audit này** — nêu ra để Founder chốt: giữ role cũ + thêm `ACCOUNTANT`, hay đổi tên hàng loạt?

**33 permission hiện có**, dạng `resource.action` đúng convention brief yêu cầu, theo module: `attraction_ticket.*` (8), `audit.read`, `cms.*` (9 — chi tiết hơn brief đề xuất: `cms.page.create/read/update/publish/delete`, `cms.template.manage`, `cms.navigation.update`, `cms.faq.update`, `cms.announcement.update`), `forms.*` (2), `master_data.*` (2), `media.asset.read`/`media.asset.upload` (brief chỉ ghi `media.manage`), `role.manage`, `seo.*` (2), `settings.*` (5), `user.manage`. **Chưa có** `tour.manage`, `lead.read`, `lead.assign`, hay `booking.manage` dạng chung — hợp lý vì Tour/CRM/Booking domain **chưa được xây** (đúng với chỉ định "Không xây CRM/Booking" của chính brief này). `attraction_ticket.booking.read`/`.cancel` là permission booking duy nhất tồn tại, scoped riêng cho module vé vui chơi.

## 6. RLS policies hiện có

**Xác nhận trực tiếp qua `list_tables`: cả 62 bảng public hiện tại đều có `rls_enabled: true`**, không có ngoại lệ. Đọc trực tiếp `pg_policies` cho nhóm bảng identity/RBAC — khớp chính xác với mô tả trong `docs/database/rls-policy-matrix.md`:

- `user_profiles`: đọc chính mình (`self_read_profile`) hoặc có `user.manage`; sửa chính mình hoặc `user.manage`.
- `user_roles`/`user_organization_memberships`/`user_website_access`: đọc chính mình hoặc `user.manage`; ghi cần `user.manage`.
- `roles`/`permissions`/`role_permissions`: đọc cho mọi authenticated (không bí mật), ghi cần `role.manage`.
- `audit_logs`/`security_events`: đọc cần `audit.read`, **không có policy INSERT/UPDATE/DELETE nào cho bất kỳ role nào** — ghi độc quyền qua service-role trong `recordAuditLog()`. Có trigger `forbid_mutation()` chặn UPDATE/DELETE ở tầng DB kể cả nếu ai đó lỡ có grant.

→ RLS ở nhóm bảng auth/RBAC **đã đúng như brief yêu cầu** ("RLS mặc định deny", "Không chỉ ẩn menu ở frontend"): mọi hành động ghi đã bị chặn ở DB, không chỉ ở service layer.

## 7. Routes `/login`, `/admin`, `/dashboard`, `/auth/callback`

| Route | Trạng thái |
|---|---|
| `/login` | **Tồn tại nhưng là UI giả.** `app/login/page.tsx` render `LoginForm` (`components/site/login-form.tsx`) — form có email/password, nhưng `onSubmit` chỉ `preventDefault()` rồi hiện thông báo tĩnh *"Cổng khách hàng đang được phát triển..."*. Không gọi `supabase.auth.signInWithPassword()`, không có state loading/error thật, không redirect đi đâu cả. |
| `/register` | Tương tự — `RegisterForm` cũng chỉ là UI giả, không tạo tài khoản (khớp đúng yêu cầu brief "Không cho đăng ký tài khoản công khai ở V1" — nhưng lý do hiện tại là *chưa làm xong*, không phải chủ đích chặn đăng ký). |
| `/admin` | **Không tồn tại.** Không có `app/admin/` nào trong repo. |
| `/dashboard` | **Không tồn tại.** |
| `/auth/callback` | **Không tồn tại.** Cần cho luồng invite/magic-link/password-recovery của Supabase Auth redirect về. |
| `/forgot-password`, `/reset-password` | **Không tồn tại như trang UI.** Nhưng **backend đã có**: `POST /api/v1/auth/password-reset` (nhận email, luôn trả `{sent:true}` dù email có tồn tại hay không — **đã đúng yêu cầu brief "Thông báo lỗi không làm lộ tài khoản có tồn tại hay không"**) và `POST /api/v1/auth/password-update` (đổi mật khẩu, yêu cầu session — kể cả session tạm Supabase tạo khi user bấm link trong email reset). Route reset hiện redirect cứng về `${APP_URL}/auth/password-update` — **trang đó chưa tồn tại**, cần tạo ở Phase 4. |

**API auth đã có sẵn** (không cần viết lại ở Phase 1, chỉ cần UI gọi vào):
- `GET /api/v1/auth/session` — kiểm tra đã đăng nhập chưa, không throw lỗi (dùng cho UI hiển thị trạng thái).
- `GET /api/v1/auth/me` — trả `ActorContext` đầy đủ (roles, permissions, websiteIds) + profile, throw `UNAUTHENTICATED`/`ACCOUNT_DISABLED` nếu không hợp lệ.
- `POST /api/v1/auth/logout` — gọi `supabase.auth.signOut()`.
- `POST /api/v1/auth/password-reset`, `POST /api/v1/auth/password-update` — như trên.
- **Không có `POST /api/v1/auth/login`** — đây là chủ đích, không phải thiếu: theo pattern `@supabase/ssr`, đăng nhập gọi thẳng `supabase.auth.signInWithPassword()` từ Client Component qua browser client (cookie session được `@supabase/ssr` set trực tiếp), không cần proxy qua route riêng của mình. Phase 1 nên giữ nguyên pattern này, không tự chế thêm route login.
- Tương tự **không có `POST /api/v1/users`** (tạo user) — cố ý, theo `docs/playbooks/invite-new-user.md`: user chỉ được tạo qua Supabase Auth Dashboard invite flow, để không có code path nào tự cấp session cho một identity chưa được duyệt. `GET /api/v1/users` (list, có phân trang) và các route `PATCH .../roles`, `.../website-access`, `.../membership` đã có sẵn — Phase 6 (User Management UI) chỉ cần build UI gọi vào API đã có, không cần thêm endpoint mới cho phần "gán role"/"xem danh sách"/"bật tắt truy cập".

## 8. Header public xử lý "Đăng nhập" thế nào

`components/site/site-header.tsx`: cả desktop nav (dòng 115-117) và mobile drawer (dòng 265-268) đều chỉ là `<Link href="/login">Đăng nhập</Link>` tĩnh — **không kiểm tra trạng thái đăng nhập**, luôn hiện "Đăng nhập"/"Đăng ký" dù user đã login hay chưa. Đây là header của **site công khai** (marketing), tách biệt hoàn toàn khỏi Admin Shell (Phase 5) — không cần và không nên thêm session-awareness vào đây trong sprint này (ngoài phạm vi: brief nói rõ "Không redesign public website").

## 9. Environment variables cần thiết

`.env.example` đã liệt kê đủ: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`, `APP_URL`, `ADMIN_APP_URL` (đã khai báo sẵn dù chưa dùng ở đâu — có thể dành cho việc Admin Shell chạy dưới domain/subdomain riêng, cần Founder xác nhận ý định), `DEFAULT_ORGANIZATION_ID`/`DEFAULT_BRAND_ID`/`DEFAULT_WEBSITE_ID`. Route `password-reset` đã phụ thuộc `APP_URL` để build redirect link — **cần set giá trị thật trong `.env.local`/Vercel trước khi Phase 4 test được luồng quên mật khẩu end-to-end**. Không cần thêm biến môi trường mới cho sprint này.

## 10. Có thể kế thừa gì từ backend MIVIGO

**Không tìm thấy source code MIVIGO nào trong workspace này** để đối chiếu trực tiếp — `.env.example` chỉ cảnh báo *"Never point these at minhviet-erp, mivigo, or any other former project"*, tức MIVIGO là một dự án cũ, tách biệt, không nằm trong repo hiện tại. Vì vậy audit này **không thể kết luận cụ thể "dùng lại đoạn code X của MIVIGO"** — cần Founder cung cấp repo/tài liệu MIVIGO nếu muốn đối chiếu ở mức code. Ở mức pattern/kiến trúc (không cần thấy code), những gì Minh Việt Travel OS đã tự có sẵn — và độc lập với MIVIGO — đã đủ tốt để dùng làm nền: Supabase Auth + RLS hai lớp, `ActorContext`/`resolveActor()`, permission dạng `resource.action`. Khuyến nghị: **không chờ MIVIGO** để bắt đầu Phase 1, vì nền tảng hiện tại đã tự đủ.

## 11. Những phần không được copy trực tiếp (vì khác nghiệp vụ)

- Bất kỳ role/permission cứng nào từng gắn với nghiệp vụ MIVIGO (nếu có, chưa thấy) — brief đã nói rõ "Không hard-code quyền trực tiếp theo email"; hệ thống hiện tại đã tuân thủ đúng điều này (permission hoàn toàn qua bảng, không có email nào hard-code trong `shared/auth/`).
- Model tổ chức/khách sạn của MIVIGO (nếu khác) không nên áp vào `organizations`/`brands`/`websites` hiện tại — schema hiện tại đã được thiết kế riêng cho multi-site Minh Việt Travel (`docs/architecture/multi-site-architecture.md`), không nên trộn mô hình khác vào.

## 12–13. Xác minh trạng thái database qua Supabase MCP (không dựa riêng vào migration files)

Đã dùng `mcp__supabase__list_tables`, `list_migrations`, `execute_sql` trực tiếp — không suy đoán từ file `.sql`. Kết quả:

- **27 migration đã apply** thật lên `mv-travel-os-dev` (`0001_extensions_and_helpers` → `0019_attraction_ticket_gallery`, bao gồm `0005_identity_and_rbac`, `0014_security_hardening...`, `0015_performance_hardening_wrap_auth_uid_in_rls`, và toàn bộ policies).
- **62 bảng public, tất cả `rls_enabled = true`.**
- Dữ liệu RBAC thật đang tồn tại: 8 roles, 33 permissions, 111 role_permissions, 1 user_profile (SUPER_ADMIN, ACTIVE), 1 user_organization_membership (ACTIVE), 0 user_website_access (đúng — mặc định org-wide).
- `audit_logs`/`security_events`: **0 rows** — bảng đã sẵn sàng (schema, RLS, trigger chống sửa/xoá) nhưng **chưa từng được ghi**, vì chưa có sự kiện login/logout nào gọi `recordAuditLog()`.

### Phát hiện quan trọng: tài liệu cũ bị lệch so với thực tế (documentation drift)

Hai tài liệu trong repo **mô tả sai trạng thái hiện tại**, vì được viết ở Sprint 1A (trước khi deploy) và **chưa được cập nhật lại** sau Sprint 1B:

- `docs/security/security-checklist.md`: ghi *"Row Level Security — Written..., not yet applied to any project"*, *"Supabase Auth session validation — Contract defined..., not implemented — no live project"*. **Sai** — đã apply và đã có 1 user thật đăng nhập được (dù chưa từng đăng nhập thực tế).
- `docs/database/rls-policy-matrix.md` dòng 3: *"Not yet applied to any project."* **Sai theo cùng lý do.**

Hai tài liệu còn sống và **đúng với thực tế** (nên dùng làm nguồn tham chiếu chính cho Phase 1+): `docs/security/security-model.md`, `docs/security/authorization-flow.md` — cả hai đều ghi rõ "Live-verified in Sprint 1B.1" và khớp với những gì audit này vừa xác nhận lại độc lập.

→ **Khuyến nghị:** khi làm Phase 1 trở đi, trích dẫn `security-model.md`/`authorization-flow.md`, không trích `security-checklist.md`/`rls-policy-matrix.md` dòng mở đầu mà không kiểm tra lại — hai file này nên được refresh (ngoài phạm vi audit, nêu ra để Founder quyết có làm luôn không).

---

## Kết luận

### Có thể tái sử dụng (không cần viết lại)

- Toàn bộ RBAC engine: `roles`/`permissions`/`role_permissions`/`user_roles`/`user_profiles`/`user_organization_memberships`/`user_website_access`, `resolveActor()`, `requirePermission()`/`requireAnyPermission()`/`requireWebsiteAccess()` (`shared/auth/`).
- `GET /api/v1/auth/session`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/password-reset`, `POST /api/v1/auth/password-update`.
- `GET /api/v1/users` + `PATCH .../roles`, `.../website-access`, `.../membership` (đủ cho Phase 6 User Management UI, chỉ cần build màn hình).
- `recordAuditLog()`/`audit_logs` schema — chỉ cần thêm call site cho sự kiện auth.
- 4 Supabase client (browser/server/admin/proxy) — đúng chuẩn bảo mật brief yêu cầu, không sửa.
- Quy ước migration additive-only, rollback, staging/production tách project (`docs/database/migration-strategy.md`) — đã khớp 100% với yêu cầu Phase 3 của brief, dùng lại nguyên.

### Phải refactor

- `proxy.ts`: thêm logic chặn `/admin/**` theo session + (tuỳ chọn) theo permission cơ bản, hiện chỉ refresh cookie.
- `components/site/login-form.tsx`/`register-form.tsx`: hiện là UI giả (`preventDefault` + thông báo tĩnh), cần thay bằng gọi Supabase Auth thật + loading/error/success state.
- Route reset password redirect (`${APP_URL}/auth/password-update`) cần một trang thật ở đích đến.

### Còn thiếu (chưa tồn tại, phải xây mới)

- `/admin` (toàn bộ Admin Shell — Phase 5).
- `/auth/callback`.
- `/forgot-password`, `/reset-password` (UI — API đã có).
- Middleware bảo vệ route theo session/quyền.
- Audit log call site cho: login success, login failed, logout, password reset requested — bảng đã sẵn, chỉ chưa có nơi gọi.
- Role `ACCOUNTANT`/permission tài chính nếu Founder muốn giữ đúng 7 role đề xuất trong brief (quyết định Phase 2, chưa tự làm).
- Rate limiting cho login (checklist cũ ghi "deferred to Supabase Auth's own rate limiting" — cần xác nhận lại đây có đủ hay cần thêm lớp application-level, tuỳ giới hạn thật của Supabase Auth plan đang dùng).

### Rủi ro

- **Tài khoản SUPER_ADMIN duy nhất hiện có chưa từng đăng nhập** (`last_sign_in_at = null`) — nếu Phase 1 có lỗi trong luồng login mà không test kỹ, có thể tự khoá lối vào admin đầu tiên. Nên test kỹ trên Preview trước khi merge, và giữ quyền truy cập Supabase Dashboard (Auth > Users) làm phương án dự phòng để reset thủ công.
- `role_scopes` tồn tại nhưng không được enforce (chỉ có 1 tổ chức/thương hiệu/website đang hoạt động) — nếu Phase 1+ code dựa vào giả định "org-wide access = an toàn" mà sau này có multi-brand thật, cần rà lại, không phải rủi ro ngay bây giờ.
- Tài liệu `security-checklist.md`/`rls-policy-matrix.md` lỗi thời có thể khiến người đọc sau này (kể cả AI agent) hiểu sai là "RLS chưa áp dụng" — nên gắn cảnh báo hoặc cập nhật trước khi dựa vào chúng.
- Naming lệch giữa role đề xuất trong brief và role thật trong DB — nếu Phase 2 không chốt rõ, có nguy cơ tạo ra 2 bộ role song song (vd. thêm `content_editor` mới thay vì tái dùng `MARKETING`).

### Có cần migration không?

**Không cần migration bắt buộc để bắt đầu Phase 1** (login/logout/session/middleware) — toàn bộ bảng, RLS, API cần thiết đã tồn tại. Migration **có thể cần** ở Phase 2/3 tuỳ quyết định của Founder, cụ thể:
1. Nếu giữ nguyên 8 role hiện có (không thêm `ACCOUNTANT`) → **không cần migration**, chỉ cần UI/docs dùng đúng tên role thật.
2. Nếu muốn thêm role `ACCOUNTANT` + permission tài chính tương ứng → cần 1 migration nhỏ, thuần additive (`insert into roles...`, `insert into permissions...`, `insert into role_permissions...`) — không đụng bảng đã có dữ liệu, rủi ro thấp.
3. Nếu muốn audit log auth có thêm cột riêng ngoài `action`/`entity_type`/`success`/`reason`/`ip_address`/`user_agent` hiện có (vd. tách cột `resource_type`/`resource_id` như brief đặt tên) — **không cần**, cột hiện có (`entity_type`/`entity_id`) đã đủ nghĩa tương đương, chỉ là khác tên; khuyến nghị dùng tên đã có thay vì đổi tên cột (đổi tên là breaking, không additive).

→ Theo đúng quy trình brief yêu cầu, **dừng ở đây để Founder duyệt Phase 0** trước khi sang Phase 1 (thiết kế kiến trúc chi tiết + migration preview nếu Founder chọn phương án 2 ở trên).
