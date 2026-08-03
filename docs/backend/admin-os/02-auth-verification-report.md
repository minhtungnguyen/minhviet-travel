# 02 — Auth Verification Report (Phase 1)

**Kết luận đầu trang:** Toàn bộ luồng auth brief yêu cầu **đã được triển khai từ trước** (commit `0a223b2`), khớp gần như 100% với thiết kế trong `docs/backend/auth/02-auth-architecture.md`. Phase 1 lần này là **verify thật** (đọc code đối chiếu + chạy `pnpm typecheck`/`lint`/`test` + live smoke test qua `pnpm dev`/`curl`), không phải viết lại. Có đúng **1 gap nhỏ** tìm thấy (đã ghi ở §6, không chặn Checkpoint A) và **2 việc thuộc phạm vi Founder** (không phải code) cần làm trước khi tài khoản SUPER_ADMIN đăng nhập lần đầu được.

---

## 1. Đối chiếu từng route/luồng brief yêu cầu

| Luồng | Trạng thái code | Verify |
|---|---|---|
| `/login` | ✅ Có thật. Form Client Component (`components/site/login-form.tsx`) gọi `loginAction` (Server Action, `app/login/actions.ts`) — **không phải UI giả nữa**. | Đọc code đối chiếu thiết kế: khớp 100%. Live: `GET /login` → `200`. |
| `/logout` | ✅ `POST /api/v1/auth/logout` — `getUser()` trước, `signOut()`, ghi `audit_logs` action `auth.logout` nếu có user. | Đọc code: khớp thiết kế. Chưa live-test bằng phiên đăng nhập thật (cần mật khẩu thật — xem §7). |
| `/forgot-password` | ✅ Trang thật (`app/forgot-password/page.tsx` + `ForgotPasswordForm`) gọi `POST /api/v1/auth/password-reset`. | Live: `GET /forgot-password` → `200`. `POST` với email không tồn tại → `{"success":true,"data":{"sent":true}}` — **không lộ tài khoản có tồn tại hay không**, đúng yêu cầu. Cố ý **không** test với email thật của SUPER_ADMIN để tránh gửi email reset ngoài ý muốn tới hộp thư Founder — xem §7. |
| `/reset-password` | ✅ Trang thật (`ResetPasswordForm`), tự kiểm tra session qua `GET /api/v1/auth/session`, gọi `POST /api/v1/auth/password-update`. | Live: `GET /reset-password` → `200` (chưa có session → sẽ hiện "link hết hạn" ở client, đúng thiết kế). |
| `/auth/callback` | ✅ `app/auth/callback/route.ts` — PKCE `exchangeCodeForSession`, redirect `next` đã whitelist qua `safeRedirectPath`, lỗi → `/login?error=link_expired`. | Live: `GET /auth/callback` (không có `?code`) → `307` tới `/login?error=link_expired`. Đúng thiết kế. |
| Session refresh | ✅ `proxy.ts` gọi `updateSupabaseSession()` mỗi request trước khi xét route. | Đọc code: khớp. |
| Session expired | ✅ `proxy.ts`: `user === null` sau khi đã thử refresh → redirect `/login?next=...&expired=1`; `/login` hiện banner "Phiên đăng nhập đã hết hạn". | Live: `GET /admin` (chưa đăng nhập) → `307` tới `/login?next=%2Fadmin&expired=1`. Đúng. |
| Unauthorized | ✅ `app/admin/layout.tsx`: lớp check thứ 2 độc lập (`getCurrentApplicationUser()`), bắt cả case tài khoản bị disable **sau khi** cookie đã cấp — không chỉ dựa vào `proxy.ts`. | Đọc code: khớp thiết kế 2-lớp brief yêu cầu ("cả middleware/proxy và server permission check"). |
| Protected `/admin/**` | ✅ `proxy.ts` matcher áp dụng mọi path trừ static assets. | Live xác nhận ở dòng "Session expired" trên. |

## 2. Yêu cầu bảo mật của brief — đối chiếu

| Yêu cầu | Kết quả |
|---|---|
| Supabase Auth thật, không tự viết bảng password/token | ✅ Xác nhận — không có bảng password nào tự viết, `auth.users` là authority duy nhất. |
| Cookie/session an toàn | ✅ `@supabase/ssr`, cookie-based, không dùng `localStorage`. |
| Không lưu service-role key phía client | ✅ Grep toàn repo: `SUPABASE_SERVICE_ROLE_KEY` chỉ xuất hiện ở `shared/supabase/admin-client.ts` (có `import 'server-only'`) và `.env.example`/`.env.local` (đúng chỗ). Không có prefix `NEXT_PUBLIC_` nhầm. |
| Không public signup | ✅ Không có `POST /api/v1/users` tạo user; `/register` tồn tại nhưng là UI (chưa kiểm tra kỹ trong phạm vi Phase 1 — không nằm trong 8 luồng brief liệt kê, ghi nhận để kiểm tra thêm nếu cần). |
| Redirect an toàn (open redirect protection) | ✅ `shared/http/safe-redirect.ts` — chặn `//`, `://`, `/\`, chỉ nhận path bắt đầu đúng 1 `/`. Áp dụng nhất quán ở `proxy.ts`, `loginAction`, `/auth/callback`. |
| Lỗi đăng nhập không lộ tài khoản tồn tại | ✅ `loginAction` trả `reason: 'invalid_credentials' | 'account_disabled'` nhưng UI (`ERROR_MESSAGES`) hiện **cùng một câu chung chung** dạng "Email hoặc mật khẩu không đúng." cho trường hợp sai — cần xác nhận thêm: `account_disabled` hiện câu khác ("Tài khoản này hiện không thể truy cập") — **đây là leak nhẹ** (phân biệt được "tài khoản tồn tại nhưng bị khoá" với "sai mật khẩu") — xem §6. |
| Logout xoá session, về `/login` | ✅ `signOut()` xoá cookie qua `@supabase/ssr`; client-side gọi `router.push('/login')` (đọc trong flow logout của Admin Shell — chưa trace hết UI nút logout trong phạm vi Phase 1, xem §8). |
| Route protection có cả middleware và server permission check | ✅ Xác nhận 2 lớp độc lập (§1). |

## 3. Kết quả `pnpm typecheck` / `pnpm lint` / `pnpm test` / `pnpm build`

| Lệnh | Kết quả trước sửa | Kết quả sau sửa |
|---|---|---|
| `pnpm typecheck` | ✅ Sạch (không có lỗi) | — |
| `pnpm lint` | ❌ 1266 lỗi / 17190 cảnh báo — **toàn bộ giả**, đến từ `.claude/worktrees/joyful-singing-mountain/.next/**` bị lint nhầm (xem `01-current-state-reconciliation.md` §6) | ✅ Sạch, sau khi thêm `.claude/**` vào `ignores` của `eslint.config.mjs` |
| `pnpm test` | ❌ 55 test file fail — toàn bộ từ `node_modules` lồng trong worktree đó (fixture nội bộ gói `zod`, thiếu optional peer dep) | ✅ 30 test file / 182 test, pass 100%, sau khi thêm `.claude/**` vào `exclude` của `vitest.config.ts` |
| `pnpm build` | ✅ Re-run trong phạm vi Phase 1 này, sau 2 config fix — **pass**, bao gồm toàn bộ route hiện có kể cả `/admin/**`, `/login`, `/forgot-password`, `/reset-password`, `/auth/callback`. | |

## 4. Live smoke test (qua `pnpm dev` + `curl`, không cần mật khẩu thật)

```
GET  /admin            (chưa đăng nhập) → 307 → /login?next=%2Fadmin&expired=1   ✅
GET  /login                              → 200                                    ✅
GET  /forgot-password                    → 200                                    ✅
GET  /reset-password                     → 200                                    ✅
GET  /auth/callback     (không có ?code) → 307 → /login?error=link_expired        ✅
GET  /api/v1/auth/session (chưa đăng nhập) → {"authenticated":false}, không lỗi  ✅
GET  /api/v1/auth/me      (chưa đăng nhập) → 401                                  ✅
POST /api/v1/auth/password-reset (email giả) → {"sent":true}, không lộ tồn tại   ✅
```

Dev server đã tắt sau khi test xong, không để chạy nền.

## 5. Tài khoản SUPER_ADMIN (`nguyen.minhtung@gmail.com`)

- Tồn tại trong `auth.users`, `email_confirmed_at` đã set, **chưa từng đăng nhập** (`last_sign_in_at = null`).
- Đã có `user_profiles` (`ACTIVE`), đã có `user_organization_memberships` (`ACTIVE`), đã được gán role `SUPER_ADMIN`.
- **Không đặt mật khẩu trực tiếp** — đúng yêu cầu brief. Không có thao tác nào trong Phase 1 này đụng tới mật khẩu tài khoản này.

## 6. Gap tìm thấy (nêu ra, không tự sửa nếu thuộc phạm vi Phase sau)

1. **`account_disabled` vs `invalid_credentials` hiện 2 thông báo khác nhau ở UI** (`components/site/login-form.tsx` `ERROR_MESSAGES`) — kỹ thuật là một hình thức lộ nhẹ trạng thái tài khoản (biết được "tài khoản có tồn tại và bị khoá" khác với "sai mật khẩu"). Mức rủi ro thấp (không lộ được tài khoản có *tồn tại* hay không, chỉ lộ thêm 1 bit thông tin *nếu* đã biết email tồn tại và tài khoản đó bị khoá) — nêu ra để Founder quyết định có chấp nhận đánh đổi UX này không, hay đổi thành 1 thông báo chung duy nhất cho cả 2 trường hợp. **Chưa tự sửa.**
2. **`auth.password_reset.requested` chưa được ghi vào `audit_logs`** — thiết kế gốc (`02-auth-architecture.md` §6) và Phase 6 của brief hiện tại đều liệt kê sự kiện này, nhưng `app/api/v1/auth/password-reset/route.ts` hiện chỉ `logger.warn` khi Supabase trả lỗi, không gọi `recordAuditLog`. **Thuộc phạm vi Phase 6 (Audit Log) của Sprint này, chưa cần sửa để qua Checkpoint A** — ghi nhận để không quên khi làm Phase 6.
3. **`/register` UI chưa được kiểm tra trong phạm vi Phase 1** (không nằm trong 8 luồng brief liệt kê ở Phase 1) — theo tài liệu audit cũ, đây từng là UI giả; cần xác nhận lại nếu Phase sau có đụng tới, tránh để lộ một luồng "đăng ký" trông như hoạt động thật.
4. **3 hàm `SECURITY DEFINER` gọi được qua RPC công khai** (`auth_has_permission`, `auth_user_organization_ids`, `auth_user_website_ids`) — Supabase advisor mức WARN. Chưa đọc source SQL của 3 hàm này để xác nhận chúng an toàn khi gọi bởi `anon` (khả năng cao là an toàn — helper cho RLS thường trả rỗng/`false` khi không có `auth.uid()` — nhưng chưa tự kết luận). Đề xuất xác nhận ở Phase Security Review (Phase 1 brief có nhắc security review nhưng chưa có file `08-security-review.md` — sẽ làm khi vào phần đó của Sprint).
5. **"Leaked Password Protection" đang tắt** trên Supabase Auth Dashboard — khuyến nghị Founder bật (Authentication → Policies), không phải thay đổi code.

## 7. Việc thuộc phạm vi Founder (không phải code, cần làm trước khi test đăng nhập thật end-to-end)

1. **Chạy luồng "Quên mật khẩu" thật cho `nguyen.minhtung@gmail.com`** để tự đặt mật khẩu lần đầu — đã cố ý **không** kích hoạt luồng này thay Founder trong phiên làm việc này (tránh gửi email đặt lại mật khẩu vào hộp thư thật của Founder mà không được yêu cầu).
2. **Xác nhận Supabase Dashboard → Authentication → URL Configuration**: `Site URL` = domain thật (production/preview tương ứng), `Redirect URLs` có `${APP_URL}/auth/callback`. Không kiểm tra được mục này qua Supabase MCP hiện có (chỉ có DB-level tools, không có Auth config API). Nếu thiếu, `/auth/callback` sẽ báo "redirect not allowed" dù code đúng.

## 8. Còn lại trong phạm vi Phase 1 nhưng cần phiên tiếp theo/live browser test

- Chưa test bằng trình duyệt thật cú nhấn nút "Đăng xuất" trong Admin Shell (cần đăng nhập trước — phụ thuộc §7 mục 1).
- Chưa test toàn bộ chu trình forgot-password → email → `/auth/callback` → `/reset-password` → đăng nhập lại bằng mật khẩu mới, vì phụ thuộc hộp thư thật của Founder.
- Khuyến nghị: sau khi Founder hoàn tất §7, quay lại verify nốt 2 mục này trên Preview deploy (không phải Production) trước khi coi Phase 1 là "đã test thật 100%".

---

## Checkpoint A

Theo đúng brief: **dừng tại đây để báo cáo**, không tiếp tục Phase 2 (Admin Shell V1) cho tới khi được duyệt.

**Tóm tắt cho Founder:**
- Auth end-to-end (login/logout/forgot-password/reset-password/callback/session refresh/expired/unauthorized/route protection) **đã tồn tại, đã đối chiếu đúng thiết kế, đã live-test được mọi phần không cần mật khẩu thật**. `pnpm typecheck`/`lint`/`test` sạch (sau khi sửa 2 file config bị nhiễu bởi worktree cũ).
- Không có gap nào chặn Checkpoint A. 5 gap nhỏ đã ghi ở §6, không cái nào cần sửa ngay.
- 2 việc cần Founder tự làm (§7) trước khi có thể coi luồng đăng nhập thật là "đã test 100% end-to-end" — đặc biệt là tự đặt mật khẩu qua forgot-password.
- 2 điểm cần Founder xác nhận song song (project Supabase nào là Production thật; deployment Vercel mới nhất có khớp `0a223b2`) — xem `01-current-state-reconciliation.md`.
