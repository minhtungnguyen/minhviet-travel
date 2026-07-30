# 03 — Admin Shell V1 Report (Phase 2)

**Trạng thái:** Hoàn thành phạm vi Phase 2. **Chưa push Production** — dừng để Founder review theo đúng yêu cầu.

---

## Phát hiện quan trọng nhất: bug runtime nghiêm trọng, đã sửa

`lib/admin/nav-config.ts` (`ADMIN_NAV`) từng lưu **component icon thật** (`LayoutDashboard`, `FileText`, ... từ `lucide-react`) làm giá trị của trường `icon`. `app/admin/layout.tsx` (Server Component) đọc mảng này rồi truyền làm prop cho `AdminShell` (`'use client'`). React Server Components **không cho phép truyền function/component reference qua ranh giới server→client** như dữ liệu prop — chỉ được phép *render* nó bên server. Kết quả: **mọi request thật vào bất kỳ trang `/admin/**` nào (đã đăng nhập) sẽ crash 500** với lỗi `"Functions cannot be passed directly to Client Components..."`.

- **Vì sao chưa ai phát hiện:** `pnpm build` không chạy code của route "Dynamic" (`ƒ`, server-rendered on demand) — nó chỉ compile/type-check, không thực thi Server Component với dữ liệu thật. Lỗi này chỉ lộ ra ở **runtime thật**, khi có người dùng đã đăng nhập tải trang `/admin`. Đối chiếu với Phase 0: tài khoản SUPER_ADMIN **chưa từng đăng nhập** (`last_sign_in_at = null`) — nên không ai từng chạm vào lỗi này kể từ khi Admin Shell được viết.
- **Cách phát hiện:** dựng route QA tạm thời (`app/dev-admin-shell-preview`, render thẳng `<AdminShell>` với props giả để chụp responsive — không đụng auth/DB) → gặp lỗi 500 ngay lập tức.
- **Cách sửa** (theo đúng pattern đã có sẵn trong repo, `components/homepage/icon-map.ts`): đổi `AdminNavItem.icon` từ component reference thành **string key** (`AdminIconKey`), tạo `components/admin/admin-icon-map.ts` map key → component, resolve icon *bên trong* component nào thực sự render nó (`admin-shell.tsx` — client; `app/admin/page.tsx` — server, render trực tiếp không qua boundary).
- **Verify lại:** route QA tạm render 200 sau khi sửa, `/admin` (chưa đăng nhập) vẫn redirect đúng `307` như trước. Route QA + toàn bộ file/ảnh chụp màn hình tạm đã **xoá sạch** sau khi dùng xong — không phải deliverable.

## Checklist Phase 2 so với brief

| Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|
| Hoàn thiện `/admin` layout | ✅ | `app/admin/layout.tsx` đã có 2 lớp check (proxy + `getCurrentApplicationUser()`), redirect `/login?next=/admin&expired=1` khi lỗi — giữ nguyên, không sửa (đã đúng từ trước). |
| Sidebar responsive | ✅ | Cố định bên trái ở `lg:` (≥1024px), overlay drawer + backdrop dưới `lg:`. Verify trực quan ở 1440/768/390 (xem bên dưới). |
| Topbar | ✅ | Sticky, hamburger (mobile), breadcrumb (`sm:`+), tên người dùng + role badge + nút đăng xuất. |
| User profile | ✅ | Tên hiển thị (`displayName`) ở topbar. |
| Role badge | ✅ **mới thêm** | Trước đây chỉ là text thường (`roles.join(', ')`) — đã đổi thành pill badge riêng cho từng role (hỗ trợ multi-role thật). |
| Logout | ✅ | `LogoutButton` gọi `POST /api/v1/auth/logout` thật, `router.push('/login')` + `router.refresh()`. Không sửa (đã đúng). |
| Breadcrumb | ✅ | Suy ra từ nav item đang active (top-level). Không làm breadcrumb đa cấp cho trang `[id]` — ngoài phạm vi V1. |
| Mobile navigation | ✅ | Drawer trượt từ trái, đóng khi bấm backdrop / nút X / chọn 1 link. |
| Unauthorized state (403) | ✅ **nâng cấp** | `AdminUnauthorized` đã tồn tại, đã được dùng nhất quán ở **10/10 trang admin cần permission** (đã grep xác nhận). Thêm nhãn "Lỗi 403 — Không đủ quyền" + link "Về Dashboard" cho rõ ràng hơn theo đúng yêu cầu "403 rõ ràng". |
| Session-expired state | ✅ | Đã verify live ở Phase 1 (`proxy.ts` → `/login?expired=1` → banner "Phiên đăng nhập đã hết hạn"). Không cần sửa thêm ở Phase 2. |
| Menu sinh từ permission thật | ✅ | `visibleNavItems(actor.permissions)` — filter theo `Set<string>` permission thật từ DB, gọi trong `app/admin/layout.tsx`. |
| Không hardcode theo email | ✅ | Grep `shared/auth/` và `lib/admin/nav-config.ts`: không có email nào hard-code. |
| Không fake data | ✅ | Dashboard (`app/admin/page.tsx`) hiển thị tên/role/last-login thật + quick links lọc theo permission thật, không có số liệu giả. |
| Route không đủ quyền → 403 rõ ràng | ✅ | Xác nhận qua code (mọi page gọi `hasPermission()` + `return <AdminUnauthorized />` trước khi render dữ liệu) — xem danh sách 10 file ở trên. |
| Mọi write action kiểm tra `requirePermission()` server-side | ✅ | Spot-check `app/admin/users/actions.ts` → `AccessControlService`: mọi method ghi đều gọi `requirePermission(actor, 'user.manage')` trước khi chạm repository. Đây là pattern kiến trúc chung cho mọi module (đã xác nhận ở Phase 0), không cần sửa. |
| Module chưa triển khai → "Sắp triển khai", không fake data | ✅ **sửa 1 gap** | "Tin tức" trỏ tới `/admin/news` — route này **không tồn tại** (404 thật nếu bấm vào), nhưng lại KHÔNG được đánh dấu `comingSoon` như Products/Leads/Bookings. Đã sửa: thêm `comingSoon: true`. Đồng thời đổi text badge từ "Sắp ra mắt" → **"Sắp triển khai"** để khớp đúng từ brief. |
| Desktop 1440 / Tablet 768 / Mobile 390 | ✅ | Verify bằng Playwright, chụp màn hình thật (đã xoá sau khi xong, không phải deliverable) — xem mô tả bên dưới. |
| `typecheck`/`lint`/`test`/`build` | ✅ | Cả 4 lệnh sạch — xem bảng dưới. |

## Verify responsive (Playwright, route QA tạm — đã xoá)

| Viewport | Kết quả |
|---|---|
| 1440×900 (desktop) | Sidebar cố định bên trái, đầy đủ 13 mục nav (kể cả các mục ngoài Menu V1 — xem mục "Quyết định cần Founder" bên dưới), badge "Sắp triển khai" đúng chỗ, role badge SUPER_ADMIN hiện rõ, breadcrumb "Admin" top-left. Không lỗi console (ngoại trừ 1 lỗi 404 favicon.ico — không liên quan, không sửa). |
| 768×1024 (tablet) | Sidebar thu về hamburger (breakpoint hiện tại là `lg:` = 1024px, nên tablet dùng chế độ mobile-nav — hợp lý, phổ biến với admin dashboard). Bấm hamburger → drawer trượt ra đúng, đầy đủ nav, nút đóng hoạt động. Topbar vẫn hiện tên + role badge + đăng xuất. |
| 390×844 (mobile) | Hamburger + đăng xuất ở topbar, tên/role badge ẩn đúng thiết kế (`sm:` = 640px). Quick action cards xếp 1 cột, không tràn/vỡ layout. Drawer hoạt động giống tablet. |

Không phát hiện lỗi vỡ layout ở bất kỳ breakpoint nào.

## Kết quả `pnpm typecheck` / `lint` / `test` / `build`

| Lệnh | Kết quả |
|---|---|
| `pnpm typecheck` | ✅ Sạch |
| `pnpm lint` | ✅ Sạch |
| `pnpm test` | ✅ 30 test file / 182 test, pass 100% |
| `pnpm build` | ✅ Pass (exit code 0), toàn bộ route build thành công |

## Quyết định cần Founder xác nhận: Menu vượt phạm vi "Menu V1"

Brief liệt kê Menu V1 gồm đúng 7 mục: Dashboard, Website CMS, Media, Users, Roles & Permissions, Settings, Audit Logs. `lib/admin/nav-config.ts` (đã tồn tại từ trước, không phải tôi thêm) có **thêm 6 mục ngoài danh sách này**:

| Mục thêm | Trạng thái thật | Đề xuất |
|---|---|---|
| Popup / Thông báo | Có trang thật (`/admin/cms/announcements`), permission thật (`cms.announcement.update`) | Giữ — đây là chức năng đã build xong, ẩn nó nghĩa là giấu một tính năng thật đã hoạt động |
| SEO | Có trang thật (`/admin/seo`), permission thật (`seo.metadata.update`) | Giữ — tương tự trên |
| Tin tức | Route chưa tồn tại | Đã đánh dấu `comingSoon: true` (sửa ở Phase 2 này) |
| Products / Leads / Bookings | `comingSoon: true` sẵn, không có route thật | Giữ nguyên — đúng tinh thần "Sắp triển khai", không phải mục cần ẩn |

**Không tự ý xoá** các mục "Popup / Thông báo" và "SEO" khỏi menu vì chúng là chức năng thật, đã hoạt động, đã permission-gated — xoá đi nghĩa là ẩn công việc đã hoàn thành mà không được yêu cầu. Nêu ra để Founder xác nhận: giữ nguyên (khuyến nghị) hay thu gọn đúng 7 mục Menu V1 cho tới khi các Phase liên quan (8, 9) chính thức "mở khoá" chúng.

## Danh sách file thay đổi

### File Phase 2 đã sửa/thêm trong phiên này

| File | Loại | Nội dung |
|---|---|---|
| `components/admin/admin-icon-map.ts` | **Mới** | Map icon key → component Lucide, sửa bug RSC serialization |
| `lib/admin/nav-config.ts` | Sửa | Icon → string key; "Tin tức" → `comingSoon: true` |
| `components/admin/admin-shell.tsx` | Sửa | Resolve icon qua map; role hiển thị dạng badge; "Sắp ra mắt" → "Sắp triển khai" |
| `components/admin/admin-unauthorized.tsx` | Sửa | Thêm nhãn "Lỗi 403", link "Về Dashboard" |
| `app/admin/page.tsx` | Sửa | Resolve icon qua map (đồng bộ với fix trên) |
| `docs/backend/admin-os/03-admin-shell-report.md` | Mới | Báo cáo này |

**Không có gì trong danh sách trên đã push hoặc commit.** Toàn bộ vẫn ở dạng uncommitted working-tree changes, chờ review.

### Toàn bộ working tree hiện tại (đối chiếu lại theo phân loại Phase 0)

Không có gì ngoài 6 file trên bị đụng vào trong phiên Phase 2 này. Các file khác (đã liệt kê phân loại đầy đủ trong `01-current-state-reconciliation.md` §4) **giữ nguyên, không sửa thêm**, gồm: công việc Sprint 2 khác đang chờ Phase 8/9 (`app/admin/seo/`, `components/admin/blocks/`, `components/admin/media-picker-input.tsx`, `components/admin/seo-metadata-form.tsx`, `lib/cms/*`, `sections/ceo-section.tsx`, `database/seeds/0013_footer_navigation.sql`, `database/policies/0007_*`, `components/site/announcement-modal*`, `components/site/site-footer*`, `types/homepage.ts`) và công việc ngoài Sprint 2 từ phiên trước (`app/ho-so-nang-luc/`, `app/about/page.tsx`, `app/page.tsx`, `lib/cms/content/homepage.seed.ts`, `lib/site-data.ts`, `components/site/error-page-chrome.tsx` + 6 file `error.tsx`, `components/homepage/logo-grid.tsx`, ảnh `public/hsnl-*`/`public/ho-so-nang-luc-minh-viet.pdf`, `docs/database/rls-policy-matrix.md`, `sprintb-*.png`).

Đã commit riêng trước Phase 2 (theo yêu cầu #6 của Founder): `dbcfc44 chore: exclude Claude worktrees from lint and tests`.

---

## Chưa làm / để Phase sau

- Chưa build Dashboard V1 đầy đủ theo Phase 3 (block trạng thái website/Supabase/storage/audit gần đây/CMS drafts/media mới) — `app/admin/page.tsx` hiện tại chỉ có tên/role/quick-links, đủ cho Phase 2 nhưng chưa phải Phase 3.
- Chưa test bằng tài khoản đăng nhập thật (phụ thuộc Founder tự đặt mật khẩu qua `/forgot-password` — xem `02-auth-verification-report.md` §7).

## Không push Production

Đúng theo Git & Deployment Rules: chưa commit, chưa push, chưa tạo Preview deploy. Dừng tại đây để Founder review Admin Shell.
