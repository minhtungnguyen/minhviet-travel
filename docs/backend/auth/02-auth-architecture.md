# 02 — Auth Architecture (Phase 1)

**Nguyên tắc nền:** tái sử dụng tối đa những gì Phase 0 đã xác nhận là live và đúng (`01-current-state-audit.md`). Tài liệu này **chỉ thiết kế phần còn thiếu**: login/logout thật, `/auth/callback`, `/forgot-password`, `/reset-password`, bảo vệ route bằng `proxy.ts`, và audit logging cho sự kiện auth. Không đề xuất đổi schema RBAC (đã chốt ở quyết định #6 của Founder).

---

## 1. Nguyên tắc Supabase Auth đang dùng

- `@supabase/ssr` (`^0.12.3`) — cookie-based session, không dùng `localStorage`. `getBrowserSupabaseClient()`/`getServerSupabaseClient()` không truyền option cookie thủ công cho browser client vì `createBrowserClient()` của `@supabase/ssr` tự quản lý qua `document.cookie` theo mặc định — **đã đúng yêu cầu "Không lưu access token trong localStorage" ngay từ thư viện, không cần code thêm**.
- Flow type: PKCE (mặc định của `@supabase/ssr` cho cả browser và server client từ các bản gần đây) — nghĩa là link trong email (invite/reset password) mang theo `?code=...`, phải "exchange" code đó lấy session qua `supabase.auth.exchangeCodeForSession(code)` ở phía server **trước khi** cookie session được set. Đây là lý do brief yêu cầu một `/auth/callback` route riêng (Phase 1-C) thay vì để mỗi trang tự xử lý.
- `proxy.ts` (tên mới của `middleware.ts` ở Next 16) đã refresh session mỗi request qua `updateSupabaseSession()` — giữ nguyên, chỉ bổ sung logic chặn route.

## 2. Login flow

```
User nhập email/password tại /login (Client Component, chỉ giữ state UI: loading/error/show-password)
  -> submit gọi 1 Server Action, vd. loginAction(email, password)
       -> chạy trên server, dùng getServerSupabaseClient() (cookie-bound) —
          Next.js Server Action ĐƯỢC PHÉP set cookie (khác Server Component render),
          nên supabase.auth.signInWithPassword() ở đây set session cookie thật,
          không cần round-trip riêng cho việc lưu cookie
       -> Thành công:
            -> ghi audit log 'auth.login.succeeded' NGAY TRONG action (đã có actor.userId)
            -> cập nhật user_profiles.last_login_at = now() (đã có cột, chỉ thêm 1 update)
            -> trả { ok: true, redirectTo } cho client (đã whitelist theo §"Open redirect protection")
       -> Thất bại:
            -> ghi security event 'LOGIN_FAILURE' NGAY TRONG action (actorUserId: null)
            -> trả { ok: false } — KHÔNG phân biệt lý do, client hiện đúng 1 câu:
               "Email hoặc mật khẩu không đúng."
  -> Client nhận kết quả: router.push(redirectTo) nếu ok, hiện lỗi nếu không
```

**Không cần route `POST /api/v1/auth/login` hay bất kỳ route mới nào cho login** — dùng Server Action (co-located với `app/login/`, ví dụ `app/login/actions.ts`) thay vì gọi `signInWithPassword()` trực tiếp từ Client Component. Lý do chọn Server Action thay vì client-call-thẳng-Supabase (khác với cách `password-reset`/`password-update` đã làm là những route JSON thuần):
1. Việc ghi `audit_logs`/`security_events` cho login **bắt buộc chạy server-side** (cần service-role client) — nếu login chạy ở client, vẫn phải có một round-trip server riêng để log, tức là vẫn cần "một route mới" như phương án ban đầu. Server Action gộp cả hai việc (đăng nhập + log) làm một, không cần thêm endpoint công khai nào.
2. Server Action vẫn dùng đúng `getServerSupabaseClient()` đã có, không cần client thứ 5 nào khác.
3. Đây là API surface *nhỏ hơn* route JSON — không lộ thêm route `POST` nào cho việc chỉ để ghi log.

`POST /api/v1/auth/logout`, `POST /api/v1/auth/password-reset`, `POST /api/v1/auth/password-update` **giữ nguyên là route JSON như hiện tại** (đã hoạt động, gọi từ Client Component qua `fetch`) — không đổi sang Server Action, tránh sửa những gì đang chạy đúng mà không cần thiết.

### Open redirect protection

`next` query param (đích điều hướng sau login) chỉ được chấp nhận nếu:
- Bắt đầu bằng đúng 1 dấu `/` (không phải `//` — trick giả dạng protocol-relative URL trỏ ra ngoài),
- Không chứa `://`,
- Không bắt đầu bằng `/\`.

Nếu không hợp lệ → bỏ qua, dùng mặc định `/admin`. Áp dụng logic này ở cả trang `/login` (khi build link "quay lại") và ở `proxy.ts` (khi tự thêm `?next=` lúc redirect user chưa đăng nhập ra khỏi `/admin`).

## 3. Logout flow

```
User bấm "Đăng xuất" trong Admin Shell
  -> Client gọi POST /api/v1/auth/logout (ĐÃ CÓ SẴN — shared/supabase/server-client.ts
     cookie-bound client, supabase.auth.signOut() xoá session ở Supabase + trả
     Set-Cookie xoá cookie local qua @supabase/ssr)
  -> Client thêm: ghi audit log 'auth.logout' (server route hiện tại chưa gọi
     recordAuditLog — cần thêm, xem §6)
  -> router.push('/login') + router.refresh() để xoá mọi state/cache phía client
```

`POST /api/v1/auth/logout` đã tồn tại và đúng — chỉ cần thêm 1 dòng gọi `recordAuditLog` vào route đó (biết được `actor.userId` bằng cách gọi `supabase.auth.getUser()` **trước** khi `signOut()`, vì sau khi sign-out sẽ không còn actor để log).

## 4. Password recovery flow

```
/forgot-password (trang mới)
  -> form nhập email -> POST /api/v1/auth/password-reset (ĐÃ CÓ SẴN, không đổi)
       - Luôn trả {sent:true} dù email có tồn tại hay không (đã đúng, giữ nguyên)
  -> hiện thông báo "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu."

Email tới, user bấm link:
  -> Supabase redirect tới redirectTo đã cấu hình + ?code=...

/auth/callback (route mới, GET)
  -> đọc ?code=...&next=...
  -> supabase.auth.exchangeCodeForSession(code)  [server client, set cookie session tạm]
  -> redirect tới `next` đã whitelist (mặc định /reset-password nếu không có next hợp lệ)
  -> Nếu exchange lỗi (code hết hạn/đã dùng) -> redirect /login?error=link_expired

/reset-password (trang mới)
  -> kiểm tra có session hợp lệ chưa (gọi GET /api/v1/auth/session)
       - Không có session -> hiện "Link đã hết hạn, yêu cầu link mới" + link tới /forgot-password
       - Có session -> hiện form mật khẩu mới (2 lần, hiện/ẩn)
  -> submit -> POST /api/v1/auth/password-update (ĐÃ CÓ SẴN, không đổi)
  -> thành công -> ghi audit log 'auth.password.updated' -> redirect /login?reset=success
```

### Điểm cần sửa trong code hiện có (không phải migration)

`app/api/v1/auth/password-reset/route.ts` hiện đang set:
```ts
const redirectTo = `${process.env.APP_URL ?? 'http://localhost:3000'}/auth/password-update`
```
`/auth/password-update` **không phải route brief yêu cầu** (brief muốn `/reset-password` ở top-level) và cũng không đi qua bước exchange-code tập trung. Phase 1 sẽ đổi dòng này thành:
```ts
const redirectTo = `${process.env.APP_URL ?? 'http://localhost:3000'}/auth/callback?next=/reset-password`
```
Đây là thay đổi 1 dòng, không đổi hợp đồng API (request/response body không đổi), không cần migration. `/auth/callback` dùng chung được cho cả luồng invite-user sau này (Supabase invite email cũng redirect qua cùng cơ chế code-exchange) — tái dùng, không phải xây riêng cho từng luồng.

## 5. Bảo vệ `/admin` bằng `proxy.ts`

```ts
// Thiết kế thêm vào proxy.ts, SAU khi updateSupabaseSession() đã refresh cookie
const PROTECTED_PREFIX = '/admin'

export async function proxy(request: NextRequest) {
  const response = await updateSupabaseSession(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const supabase = /* server client bound to request, đọc cookie vừa refresh */
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)  // whitelist theo §2 khi đọc lại ở /login
      return NextResponse.redirect(url)
    }
  }
  return response
}
```

**Chỉ kiểm tra "đã đăng nhập chưa" ở middleware** — không kiểm tra permission cụ thể ở đây, vì:
1. Middleware chạy trên Edge Runtime, không nên gánh nhiều DB query (`resolveActor()` gọi tới 5 bảng) trên mọi request.
2. Việc "trang nào cần permission gì" khác nhau theo từng trang con của `/admin` — permission check thật (theo đúng yêu cầu brief "Server-side permission check cho hành động ghi", "Không chỉ ẩn menu ở frontend") diễn ra ở **layout/page Server Component của từng khu vực Admin** (gọi `resolveActor()` + `requirePermission()`, giống hệt pattern các route `/api/v1/*` đã dùng) và **bắt buộc lại ở mọi Server Action/route xử lý ghi dữ liệu** — không dựa vào việc middleware đã cho qua.

Session hết hạn giữa chừng (refresh token cũng hết hạn, không chỉ access token): `updateSupabaseSession()` gọi `supabase.auth.getUser()` — nếu Supabase trả lỗi (refresh thất bại), `data.user` sẽ là `null`, middleware xử lý y hệt case "chưa đăng nhập" ở trên → redirect `/login?next=...&expired=1` để UI hiện thông báo "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" thay vì thông báo lỗi chung chung.

## 6. Audit logging cho sự kiện auth

Bảng `audit_logs` dùng cho **thay đổi có actor + entity rõ ràng**; bảng `security_events` (cột `event_type` đã có ví dụ sẵn `'LOGIN_FAILURE'`, `'PERMISSION_DENIED'`, `'SUSPICIOUS_ACTIVITY'` ngay trong migration gốc — `database/migrations/0013_audit.sql` dòng 54) dùng cho **sự kiện bảo mật không gắn với một actor đã xác thực**. Cả hai đã có RLS đúng (chỉ `audit.read` mới đọc được, không ai ghi được ngoài service-role) — không cần migration.

| Sự kiện (Phase 7 brief) | Bảng | `action` / `event_type` | Actor | Ghi chú |
|---|---|---|---|---|
| Login success | `audit_logs` | `auth.login.succeeded` | user vừa đăng nhập | `source:'admin-ui'` |
| Login failed | `security_events` | `LOGIN_FAILURE` | `null` (chưa xác thực được ai) | `metadata` chỉ chứa `{ reason: 'invalid_credentials' }` — **không lưu email đã nhập**, tránh biến audit log thành công cụ dò tài khoản dù chỉ `audit.read` mới đọc được |
| Logout | `audit_logs` | `auth.logout` | user vừa đăng xuất (lấy trước khi gọi `signOut()`) | |
| Password reset requested | `audit_logs` | `auth.password_reset.requested` | user nếu email khớp, ngược lại `null` | `success:true` luôn (không phản ánh ra response, chỉ để nội bộ biết) |
| Password updated | `audit_logs` | `auth.password.updated` | user | |
| User created / role assigned / permission changed / account disabled | `audit_logs` | **đã ghi log rồi** — `AccessControlService` (`modules/access-control/application/access-control.service.ts`) đã gọi `recordAuditLog` cho `role.assigned`, `role.revoked`, `user_profile.admin_updated` (bao gồm đổi `accountStatus`), `website_access.granted/revoked` | — | **Không cần thêm gì** cho các sự kiện này, chỉ cần Admin Shell (Phase 5/6) gọi đúng các API đã có |

### Việc cần thêm ở code (không phải schema)

`modules/audit/application/audit.service.ts` hiện chỉ có `recordAuditLog()`. Cần thêm 1 hàm mới cùng file hoặc file `security-event.service.ts` cạnh đó:

```ts
export type SecurityEventInput = {
  actorUserId: string | null
  eventType: 'LOGIN_FAILURE' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY'
  ipAddress?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown>
}
export async function recordSecurityEvent(input: SecurityEventInput): Promise<void> { /* same best-effort pattern as recordAuditLog, service-role client */ }
```

Đây là **code mới, không đổi bảng, không đổi RLS** — `security_events` và policy của nó đã tồn tại từ `0013_audit.sql`/`policies_0003_internal_tables_policies.sql`, chỉ chưa có nơi nào gọi tới.

## 7. Kiểm tra permission ở server cho mọi hành động ghi (Phase 1-G)

Không thiết kế cơ chế mới — tái dùng nguyên `resolveActor()` + `requirePermission()`/`requireAnyPermission()`/`requireWebsiteAccess()` (`shared/auth/`) đã chạy production cho toàn bộ `/api/v1/*`. Admin Shell (Phase 5) sẽ dùng Server Actions hoặc gọi lại các route `/api/v1/*` sẵn có — cả hai đường đều đi qua đúng 2 lớp đã có: service-layer permission check + RLS. Không có hành động ghi nào trong Admin Shell V1 được phép bỏ qua `requirePermission()`, kể cả khi menu đã ẩn mục đó theo permission (menu ẩn là UX, không phải authorization).

## 8. Cấu hình vận hành cần Founder/DevOps xác nhận trước khi test end-to-end (không phải code)

Supabase Dashboard → Authentication → URL Configuration cần có:
- **Site URL** = `APP_URL` thật (production/preview tương ứng).
- **Redirect URLs** whitelist phải gồm `${APP_URL}/auth/callback` (và tương ứng cho mỗi Preview URL nếu Vercel Preview có domain động — cần quyết định dùng 1 wildcard hay set thủ công từng preview).

Nếu thiếu bước này, `exchangeCodeForSession()` ở `/auth/callback` sẽ nhận lỗi "redirect not allowed" dù code đúng 100% — đây là lỗi cấu hình Supabase project, không phải bug code, nêu rõ để không mất thời gian debug sai hướng khi test Phase 1.

## 9. Rate limiting / brute-force

Theo `docs/security/security-checklist.md` (đã cập nhật ở Phase 0): brute-force protection **dựa vào giới hạn có sẵn của Supabase Auth** (Supabase áp dụng rate-limit theo IP/email ở tầng `signInWithPassword`/`resetPasswordForEmail` theo cấu hình plan của project), chưa có lớp application-level riêng. Phase 1 **không tự viết rate limiter mới** (ngoài scope, `RATE_LIMITED` vẫn là error code dự phòng chưa dùng) — chỉ đảm bảo lỗi rate-limit của Supabase (nếu có) hiển thị đúng UI "Thử lại sau" thay vì lỗi chung chung, và ghi `security_events` với `eventType: 'SUSPICIOUS_ACTIVITY'` nếu Supabase trả lỗi dạng rate-limit (best-effort, không chặn tính năng nếu Supabase chưa trả loại lỗi này rõ ràng).

## 10. Tổng hợp file mới/sửa cho Phase 1 (tham chiếu — chi tiết ở Implementation Plan)

**Route/page mới:** `app/auth/callback/route.ts`, `app/login/actions.ts` (Server Action), `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/admin/**` (Phase 5, Admin Shell).
**Sửa:** `proxy.ts` (chặn `/admin`), `components/site/login-form.tsx` (gọi Server Action thật thay vì `preventDefault()` giả), `app/api/v1/auth/logout/route.ts` (+1 dòng audit log), `app/api/v1/auth/password-reset/route.ts` (đổi `redirectTo`), `modules/audit/application/audit.service.ts` (+`recordSecurityEvent`).
**Không sửa:** mọi bảng RBAC, `resolveActor()`, `guards.ts`, các route `/api/v1/users/**` (dùng nguyên cho Phase 6).
