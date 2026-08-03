# 01 — Current State Reconciliation

**Sprint:** Sprint 2 — Admin Operating System V1
**Phase:** 0 (Reconciliation)
**Phương pháp:** Đọc trực tiếp source code trong working tree + truy vấn trực tiếp Supabase MCP vào project `mv-travel-os-dev` (`otusjahkdjpxqayeeqqn`, ap-southeast-1) + chạy `pnpm typecheck`/`pnpm lint`/`pnpm test`/live smoke test qua `pnpm dev`. Không suy đoán từ tên file hay tài liệu cũ mà không đối chiếu lại.

---

## Kết luận đầu trang

**Đây không phải một sân chơi trống — và còn hơn thế nữa so với những gì brief mô tả.** Brief giả định "Auth/RBAC backend đã tồn tại", "Admin Shell, CMS foundation, Media và Settings đã có một phần" — điều đó đúng, nhưng thực tế còn tiến xa hơn nhiều:

1. Một sprint trước ("Backend Foundation — Auth, Login, Logout & RBAC") đã tự audit + thiết kế + cắm cờ gap, để lại 4 tài liệu sống trong `docs/backend/auth/` (`01-current-state-audit.md`, `02-auth-architecture.md`, `03-rbac-matrix.md`, `04-database-review-package.md`).
2. Commit `0a223b2` ("feat: real auth flow, RBAC-driven Admin Shell, and CMS/Media/Settings admin screens") đã **triển khai gần như toàn bộ** những gì 2 tài liệu đó thiết kế: `/login`, `/forgot-password`, `/reset-password`, `/auth/callback`, `proxy.ts` chặn `/admin/**`, `app/admin/layout.tsx` (lớp kiểm tra permission thứ 2), Admin Shell, CMS/Media/Settings admin screens — **đã pushed lên `origin/main`** (git đang đồng bộ 0 ahead/0 behind).
3. **Đang có một khối lượng lớn thay đổi CHƯA COMMIT** nằm sẵn trong working tree, chồng lấn trực tiếp với phạm vi Sprint 2: `app/admin/seo/`, `components/admin/media-picker-input.tsx`, `components/admin/seo-metadata-form.tsx`, `components/admin/blocks/`, `sections/ceo-section.tsx`, `lib/cms/news.ts`, `database/seeds/0012_homepage_cms_content.sql`, `database/seeds/0013_footer_navigation.sql`, `database/policies/0007_public_setting_definitions_read.sql`, `components/site/announcement-modal-loader.tsx`, `components/site/error-page-chrome.tsx`, cùng sửa đổi trong `app/admin/cms/actions.ts`, `components/admin/cms-page-editor.tsx`, `lib/admin/nav-config.ts`, `lib/cms/client.ts`, `lib/cms/schema.ts`, `types/homepage.ts`, `components/site/site-footer.tsx`, `components/site/announcement-modal.tsx`, và 6 file `error.tsx` dưới `ve-may-bay/*` (hợp nhất qua `error-page-chrome.tsx` mới). Xem §4.

→ **Khuyến nghị nền tảng cho toàn Sprint 2: KHÔNG viết lại — audit, hoàn thiện, và commit theo từng module những gì đã có.** Việc còn lại chủ yếu là: (a) verify các luồng đã build chạy đúng thật (không chỉ đọc code), (b) hoàn thiện các mảnh còn thiếu nhỏ, (c) commit khối lượng lớn thay đổi uncommitted theo từng phần rõ ràng như Git & Deployment Rules yêu cầu, (d) xây UI Homepage CMS section-based (Phase 8, phần thực sự mới).

---

## 1. Trạng thái Git

| Mục | Giá trị |
|---|---|
| Branch | `main`, đồng bộ hoàn toàn với `origin/main` (0 ahead / 0 behind) |
| Remote | `https://github.com/minhtungnguyen/minhviet-travel.git` |
| Commit mới nhất đã push | `0a223b2` — "feat: real auth flow, RBAC-driven Admin Shell, and CMS/Media/Settings admin screens" (2026-07-30 20:57 +07) |
| Working tree | **22 file đã tracked bị sửa** (chưa stage) + **~27 file/thư mục mới chưa track** (chưa `git add`) — xem §4 |
| CI/CD pipeline | Không có `.github/workflows/` — không có CI tự động chạy typecheck/lint/test/build trên PR. Ghi nhận, không tự thêm (ngoài phạm vi brief). |
| `gh` CLI | Không cài/không auth trong môi trường này — không kiểm tra được PR/issue qua `gh`. |

Không có commit nào "ahead" chưa push — mọi thay đổi hiện tại đều nằm ở dạng uncommitted working-tree changes, chưa phải là rủi ro "push nhầm Production" theo nghĩa Git & Deployment Rules lo ngại.

## 2. Deployment Production

**Không thể xác minh trực tiếp từ môi trường này**: không có `.vercel/` link cục bộ trong repo, không có phiên đăng nhập `vercel` CLI, không có `gh` để tra GitHub Actions/Deployments. `vercel.json` không tồn tại (dùng cấu hình mặc định qua Vercel Dashboard/GitHub integration).

**Cần Founder xác nhận trước khi làm Phase 8+ (Homepage CMS publish) hoặc trước khi merge bất kỳ Preview nào:**
- Deployment Production mới nhất trên Vercel có đang chạy đúng commit `0a223b2` (bản mới nhất trên `origin/main`) hay không.
- Domain `minhviettravel.com` trỏ đúng project Vercel nào, và project đó build từ đúng repo `minhtungnguyen/minhviet-travel` này.

## 3. Supabase — trạng thái thực tế (qua Supabase MCP, không suy đoán từ file migration)

| Mục | Giá trị |
|---|---|
| Project | `mv-travel-os-dev` (id `otusjahkdjpxqayeeqqn`), region `ap-southeast-1`, status `ACTIVE_HEALTHY`, Postgres 17.6 |
| **⚠️ Chỉ có 1 project Supabase** khả kiến qua MCP (`list_projects`) | Không thấy project "prod" tách biệt. Tên project (`...-dev`) gợi ý đây là môi trường dev/staging, nhưng brief mô tả website đang chạy Production tại `minhviettravel.com` với Supabase đã kết nối. **Cần Founder xác nhận: đây có phải project Supabase mà Production thật sự đang dùng không, hay có 1 project "prod" khác không kết nối qua MCP session này?** Đây là điểm cần làm rõ **trước khi** bất kỳ thao tác Publish/Settings update nào ở các Phase sau có thể ảnh hưởng dữ liệu thật. |
| Migrations đã apply | 29 migration, từ `0001_extensions_and_helpers` (2026-07-25) đến `public_read_public_setting_definitions` (2026-07-30) — bao gồm đầy đủ: identity & RBAC, settings, media, CMS, navigation, forms, SEO, audit, security/performance hardening, và cụm `attraction_ticket_*` (module vé vui chơi, ngoài phạm vi Sprint 2). |
| Bảng public | 62 bảng, **100% `rls_enabled: true`**, không ngoại lệ. |
| RBAC data thật | 8 roles, 33 permissions, 111 role_permissions grants, 1 user_profile (SUPER_ADMIN/ACTIVE), 1 user_organization_membership (ACTIVE), 0 user_website_access (đúng thiết kế — mặc định org-wide khi chỉ có 1 website). |
| `audit_logs`/`security_events` | Schema + RLS sẵn sàng, **0 rows** — chưa có sự kiện auth nào được ghi thật (khớp với `last_sign_in_at = null` của SUPER_ADMIN, xem Phase 1). |
| `media_assets` | 0 rows — chưa có ảnh nào upload thật, dù UI Media đã tồn tại trong code. |
| Security advisors (`get_advisors`, type=security) | 6 cảnh báo mức WARN: 3 hàm `SECURITY DEFINER` (`auth_has_permission`, `auth_user_organization_ids`, `auth_user_website_ids`) gọi được bởi `anon`/`authenticated` qua RPC công khai (cần rà lại có chủ đích hay không — các hàm này là helper cho RLS, khả năng cao là an toàn vì luôn trả `false`/rỗng khi không có `auth.uid()`, nhưng **chưa tự ý kết luận**, để trong Security Review Phase 1). 1 cảnh báo: **"Leaked Password Protection" đang tắt** trên Supabase Auth — nên bật (cấu hình Dashboard, không phải code) trước khi cho phép đặt mật khẩu thật. |

## 4. Route/Component Admin đã tồn tại (không tạo trùng)

### Đã có, đã commit (`0a223b2`)

```
app/admin/layout.tsx              — lớp check permission thứ 2 (getCurrentApplicationUser + redirect)
app/admin/page.tsx                — Dashboard
app/admin/users/{page,[id]/page,actions}.tsx
app/admin/roles/page.tsx
app/admin/cms/{page,[id]/page,actions}.tsx
app/admin/cms/announcements/{page,actions}.tsx
app/admin/products/page.tsx       — placeholder "Sắp triển khai"
app/admin/leads/page.tsx          — placeholder "Sắp triển khai"
app/admin/bookings/page.tsx       — placeholder "Sắp triển khai"
app/admin/audit-logs/page.tsx
app/admin/media/{page,actions}.tsx
app/admin/settings/page.tsx
app/login/{page,actions}.tsx, app/forgot-password/page.tsx, app/reset-password/page.tsx, app/auth/callback/route.ts
proxy.ts                          — chặn /admin/** theo session (Next 16 đổi tên middleware.ts -> proxy.ts)
modules/{access-control,audit,cms,media,settings,navigation,seo,forms,faq,organization,master-data}/**
shared/auth/{session,guards}.ts, shared/http/safe-redirect.ts
```

### Chưa commit — nằm sẵn trong working tree, **chồng lấn trực tiếp Sprint 2**

| File/thư mục | Liên quan Phase Sprint 2 |
|---|---|
| `app/admin/seo/{page,actions}.tsx` (mới) | Không nằm trong Menu V1 của brief, nhưng là phần mở rộng CMS/SEO tự nhiên — giữ nguyên, không xoá |
| `components/admin/media-picker-input.tsx`, `components/admin/seo-metadata-form.tsx`, `components/admin/blocks/` (mới) | Phase 7 (Media), Phase 8 (Homepage CMS section editor) |
| `components/admin/cms-page-editor.tsx` (sửa, +33 dòng) | Phase 8 |
| `lib/admin/nav-config.ts` (sửa, +4 dòng) | Phase 2 (Admin Shell menu) |
| `lib/cms/news.ts` (mới), `lib/cms/client.ts` (sửa, +109 dòng), `lib/cms/schema.ts` (sửa) | Phase 8 — nguồn dữ liệu `brandCenter.stories` đọc từ News thật thay vì fabricate |
| `sections/ceo-section.tsx` (mới) | Phase 8 (section "CEO/Lãnh đạo") — có chủ đích **không** render placeholder giả nếu CMS chưa có quote/tên thật (đã đọc code, xem ghi chú trong file) |
| `components/site/announcement-modal.tsx` (sửa), `components/site/announcement-modal-loader.tsx` (mới) | Phase 8 (section "Popup thông báo nâng cấp") |
| `components/site/error-page-chrome.tsx` (mới) + 6 file `error.tsx` dưới `ve-may-bay/*` (sửa) | Không thuộc phạm vi Sprint 2 trực tiếp — hợp nhất UI trang lỗi, giữ nguyên |
| `components/site/site-footer.tsx` (sửa, +127/-...) + `database/seeds/0013_footer_navigation.sql` (mới) | Footer đọc navigation menu thật từ DB — hỗ trợ Phase 8 mục 10 (Footer) |
| `database/policies/0007_public_setting_definitions_read.sql` (mới) | **Đã áp dụng thật lên `mv-travel-os-dev`** (khớp `public_read_public_setting_definitions` trong `list_migrations`) — file SQL mô tả migration này **chưa commit vào git**, chỉ là gap đồng bộ git↔DB, không phải rủi ro trùng migration |
| `database/seeds/0012_homepage_cms_content.sql` (mới) | Đã sửa lại trong phiên làm việc trước (session hiện tại) để đồng bộ với `lib/cms/content/homepage.seed.ts` — xem `app/ho-so-nang-luc/` (ngoài phạm vi Sprint 2, việc của phiên trước) |

**Không phát hiện bảng hoặc migration nào bị trùng chức năng.** File SQL uncommitted duy nhất (`0007_public_setting_definitions_read.sql`) mô tả một migration **đã** chạy — cần `git add` để đồng bộ, không cần chạy lại.

## 5. Tài liệu — documentation drift

| Tài liệu | Trạng thái |
|---|---|
| `docs/backend/auth/01-current-state-audit.md` | **Lệch thực tế theo hướng "lạc hậu tích cực"**: mô tả `/login` là "UI giả", `/admin` "không tồn tại", `proxy.ts` "chỉ refresh session" — đúng tại thời điểm viết (trước `0a223b2`), **sai ở hiện tại** vì các phần đó đã được build đúng như tài liệu `02-auth-architecture.md` thiết kế. Phần phân tích RBAC/permission/RLS trong tài liệu này (mục 4–9) **vẫn đúng và nên tiếp tục dùng làm nguồn tham chiếu**. |
| `docs/backend/auth/02-auth-architecture.md` | Bản thiết kế — đã đối chiếu trực tiếp với code thật ở Phase 1 (xem `02-auth-verification-report.md`): **khớp gần như 100%** với những gì đã triển khai. |
| `docs/backend/auth/03-rbac-matrix.md` | **Vẫn đúng, đã re-verify lại độc lập qua SQL trực tiếp** (xem §Phase 5 sơ bộ bên dưới) — không cần viết lại. |
| `docs/backend/auth/04-database-review-package.md`, `docs/database/rls-policy-matrix.md` | Chưa đọc kỹ trong phạm vi Phase 0 này (không chặn Phase 1) — khuyến nghị rà lại khi vào Phase 9 (Settings) / Phase 6 (Audit Log) nếu cần đối chiếu RLS chi tiết hơn. |

## 6. Rà soát công cụ (phát hiện phụ, đã tự sửa vì rủi ro thấp)

Phát hiện một **git worktree cô lập còn sót lại** tại `.claude/worktrees/joyful-singing-mountain/` (được `git worktree list` xác nhận là worktree hợp lệ, branch `worktree-joyful-singing-mountain`, đã gitignore qua `.git/info/exclude` — không phải rác không rõ nguồn gốc, nhiều khả năng là workspace của một phiên agent trước chưa được dọn). Thư mục này chứa `node_modules`/`.next` build cache đầy đủ riêng, khiến:
- `pnpm lint` báo **18.456 lỗi/cảnh báo giả** (toàn bộ đến từ `.next/build/**` bị lint nhầm) vì `eslint.config.mjs` chỉ ignore `.next/**` ở root, không match nested path.
- `pnpm test` chạy nhầm **55 file test vendor** (fixture nội bộ của gói `zod` trong `node_modules` lồng bên trong worktree đó) và báo fail vì thiếu optional peer dependency, che mất kết quả test thật.

**Đã sửa** (thay đổi cấu hình, không đụng code nghiệp vụ, rủi ro thấp): thêm `.claude/**` vào `ignores` của `eslint.config.mjs` và vào `exclude` của `vitest.config.ts`. Sau khi sửa: `pnpm lint` sạch, `pnpm test` → 30 test file / 182 test thật, pass 100%. **Không xoá thư mục worktree đó** — có thể vẫn chứa việc dở dang của phiên khác; nêu ra để Founder quyết định dọn hay giữ.

## 7. Không tạo bảng/migration trùng chức năng

Xác nhận: mọi bảng cần cho Sprint 2 (users/roles/permissions, audit_logs/security_events, media_assets/media_folders, cms_pages/cms_sections/cms_blocks, setting_definitions/setting_values, navigation_menus/items) **đã tồn tại và đã deploy thật**. Sprint 2 không cần migration mới cho phạm vi Phase 1–9, trừ khi Phase 5 (RBAC gap) hoặc Phase 7 (Media used-by/tags) cần một migration nhỏ additive — cả hai đều sẽ được trình preview riêng, chưa tự áp dụng, đúng quy trình brief yêu cầu.

---

## Có mâu thuẫn nghiêm trọng nào chặn Phase 1 không?

**Không.** Không có gì trong repo/database mâu thuẫn với brief đến mức phải dừng hẳn. Có 2 điểm **cần Founder xác nhận song song trong khi Phase 1 tiếp tục** (không phải blocker cứng, vì Phase 1 auth code hoạt động độc lập với việc xác nhận này):

1. **Project Supabase duy nhất khả kiến (`mv-travel-os-dev`) có đúng là project Production thật không?** (§2, §3)
2. **Deployment Vercel Production mới nhất có khớp commit `0a223b2` không?** (§2)

→ Tiến hành Phase 1 (đã thực hiện — xem `02-auth-verification-report.md`), dừng tại Checkpoint A để báo cáo theo đúng brief.
