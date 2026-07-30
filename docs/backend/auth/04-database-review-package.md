# 04 — Database Review Package (Phase 1)

## Kết luận

**NO DATABASE MIGRATION REQUIRED.**

Toàn bộ bảng, cột, RLS policy, RPC helper (`auth_has_permission()`, `auth_user_organization_ids()`, `auth_user_website_ids()`) cần cho Phase 1 (login, logout, session, `/auth/callback`, forgot/reset password, bảo vệ `/admin`, audit log sự kiện auth) **đã tồn tại và đã deploy** trên `mv-travel-os-dev`, xác nhận trực tiếp qua Supabase MCP ở Phase 0 (`01-current-state-audit.md` §12) và đối chiếu lại chi tiết bên dưới. Điều này khớp với quyết định #6 của Founder: không tạo lại `roles`/`permissions`/`role_permissions`/`user_profiles`/`user_organization_memberships`/`user_website_access`/`audit_logs`.

Phần dưới đây trình bày đầy đủ theo khung Phase 3 của brief (ERD, bảng mới, RLS matrix, migration preview, seed, safety report, rollback) — **mỗi mục đều là "N/A — đã có sẵn"**, kèm bằng chứng, để không bỏ sót bước rà soát nào thay vì chỉ tuyên bố suông.

---

## 1. ERD

Không có bảng/quan hệ mới. ERD hiện có (`docs/database/erd.md`) đã mô tả đủ chuỗi quan hệ auth cần dùng:

```
auth.users (Supabase-managed)
  └─ user_profiles (1:1, PK = auth.users.id)
        ├─ user_organization_memberships (1:N, nullable — "chưa có org" là trạng thái hợp lệ)
        ├─ user_roles (N:M tới roles — ĐÃ hỗ trợ multi-role)
        │     └─ roles ── role_permissions ── permissions
        └─ user_website_access (N:M tới websites, optional narrower scope)
```

`audit_logs`/`audit_log_changes`/`security_events` đứng độc lập, tham chiếu `actor_user_id -> auth.users.id` (nullable), không phụ thuộc thay đổi gì ở trên.

## 2. Bảng mới hoặc cột mới

**Không có.** Rà soát từng nhu cầu Phase 1 và đối chiếu cột đã tồn tại:

| Nhu cầu Phase 1 | Cột/bảng đã có | Đủ dùng? |
|---|---|---|
| Biết session hết hạn / đã đăng nhập | `auth.users` + cookie Supabase (không phải bảng riêng) | Đủ |
| Biết tài khoản bị khoá | `user_profiles.account_status` (`INVITED`/`ACTIVE`/`SUSPENDED`/`DISABLED`/`TERMINATED`) | Đủ |
| Ghi login success/logout/password event | `audit_logs.action`, `.entity_type`, `.entity_id`, `.source`, `.success`, `.reason` | Đủ — không cần cột mới |
| Ghi login failed | `security_events.event_type` (đã có ví dụ `'LOGIN_FAILURE'` ngay trong migration gốc), `.metadata` jsonb, `.ip_address`, `.user_agent` | Đủ |
| `last_login_at` hiển thị trong Admin Shell (Phase 6 "Xem trạng thái tài khoản") | `user_profiles.last_login_at` đã có cột | Đủ — cần code cập nhật giá trị này khi login thành công (application-level, không phải migration) |

## 3. RLS matrix

Không đổi. Matrix đầy đủ đã có ở `docs/database/rls-policy-matrix.md` (vừa refresh trạng thái ở Phase 0) — riêng nhóm bảng auth/RBAC đã được đọc lại trực tiếp từ `pg_policies` ở Phase 0 audit và xác nhận khớp 100%: tự đọc/sửa hồ sơ của chính mình, staff có `user.manage` đọc/sửa toàn bộ, `roles`/`permissions`/`role_permissions` đọc được bởi mọi authenticated (không bí mật) nhưng ghi cần `role.manage`, `audit_logs`/`security_events` chỉ đọc được với `audit.read` và **không ai ghi được qua RLS** (chỉ service-role, có `forbid_mutation()` trigger chặn UPDATE/DELETE tuyệt đối).

## 4. Migration SQL preview

Không có SQL migration nào cần trình. (Nếu về sau Founder quyết định thêm role `ACCOUNTANT` hoặc cấp `attraction_ticket.*` cho `SUPER_ADMIN` — 2 điểm đã nêu ở `03-rbac-matrix.md` — đó sẽ là migration riêng, thuần additive, ở một sprint khác, không thuộc Phase 1 này.)

## 5. Seed roles và permissions

Không cần seed mới — 8 roles/33 permissions/111 role_permissions hiện tại đã đủ cho toàn bộ Phase 1 (login không cần permission gì cả, chỉ cần một `user_profiles` row tồn tại và `account_status` không nằm trong `DISABLED_ACCOUNT_STATUSES`).

## 6. Migration Safety Report

Không áp dụng — không có migration để đánh giá an toàn. Nếu tính cả 2 thay đổi code (không phải schema) ở `02-auth-architecture.md`:
- Đổi `redirectTo` trong `password-reset/route.ts`: không chạm DB, không ảnh hưởng dữ liệu, chỉ đổi URL đích của email link.
- Thêm `recordSecurityEvent()`: insert-only vào bảng đã tồn tại, dùng service-role client giống hệt `recordAuditLog()` đã chạy production — cùng mức rủi ro với pattern đã được Sprint 1B verify.

## 7. Rollback Plan

Không áp dụng (không có migration). Nếu 2 thay đổi code ở mục 6 cần revert: đảo ngược bằng git revert bình thường, không có bước dọn dữ liệu nào cần thiết (không có dữ liệu mới được ghi cho tới khi các route đó thực sự chạy trong Phase 1).

---

## Việc còn lại thuộc thẩm quyền vận hành (không phải migration, không phải code)

Nêu lại từ `02-auth-architecture.md` §8 để không bị bỏ sót khi lập kế hoạch: Supabase Dashboard → Authentication → URL Configuration cần có `Site URL` = `APP_URL` thật và `Redirect URLs` chứa `${APP_URL}/auth/callback` cho từng environment (local/preview/production). Đây là cấu hình Supabase project, không phải file trong repo, không phải migration — cần Founder hoặc người có quyền Dashboard access thực hiện trước khi test Phase 1 end-to-end.
