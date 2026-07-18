# Sprint 1 — Task 01: Homepage Production Ready

**Ngày:** 2026-07-18
**Phạm vi:** Chỉ các hạng mục P0 cần thiết để Homepage (`/`) và hạ tầng dùng chung của Homepage (root layout, footer, build/lint/SEO pipeline) đạt trạng thái Production Ready — theo `PROJECT_AUDIT.md`.
**Ngoài phạm vi (cố ý không đụng vào):** `/contact`, `/tours`, `/tour/[slug]`, `/about`, `/hotels|/cruises|/flights|/tickets|/visa`, `/login`, `/register`, module CMS/CRM/Booking/AI Import/Enterprise, `design-system/` — các phần này không ảnh hưởng go-live của riêng Homepage và được để lại cho các Task/Sprint sau (xem "Còn tồn đọng" bên dưới).

---

## Đã sửa

### 1. Newsletter form ở Footer không hoạt động (bug thật, ảnh hưởng Homepage)
- **File:** `components/site/site-footer.tsx`
- **Trước:** `<form>` tĩnh không có `onSubmit`/`action` — bấm "Đăng ký" chỉ khiến trang reload (submit GET mặc định), không có gì được ghi nhận.
- **Sau:** Dùng lại component `NewsletterForm` (`components/homepage/newsletter-form.tsx`) — vốn đã được xây đúng chuẩn (Zod validate, gọi `subscribeNewsletterAction`, có trạng thái pending/error/success) nhưng trước đó chưa được gắn vào đâu cả.
- **Vì sao P0:** Footer nằm trong `SiteChrome`, xuất hiện trên Homepage — một CTA hiển thị nhưng không hoạt động là lỗi chức năng trực tiếp, không phải vấn đề thẩm mỹ.

### 2. `next.config.mjs` che giấu lỗi TypeScript khi build
- **Trước:** `typescript.ignoreBuildErrors: true`.
- **Sau:** Gỡ bỏ. Đã xác nhận `npx tsc --noEmit` sạch tuyệt đối trước và sau khi gỡ — không có lỗi nào bị lộ ra, cờ này trước đó không cần thiết nhưng là một quả bom hẹn giờ (Volume 00 `08-roadmap-v1.md`: "Cổng kiểm soát" yêu cầu không có lỗi typecheck).

### 3. Pipeline lint hoàn toàn không chạy được
- **Trước:** `package.json` có script `"lint": "eslint ."` nhưng **không có** `eslint` trong dependencies, **không có** file cấu hình `eslint.config.*` nào — chạy `pnpm lint` báo lỗi ngay lập tức, không kiểm tra được gì.
- **Sau:**
  - Thêm `eslint@^9`, `eslint-config-next@16.2.10` làm devDependencies (ghim ESLint ở major 9 vì `eslint-config-next` hiện chưa hỗ trợ chính thức ESLint 10 — cài đúng bản mới nhất theo audit sẽ gây cảnh báo peer-dependency).
  - Thêm `eslint.config.mjs` dùng trực tiếp flat config gốc của `eslint-config-next` (`core-web-vitals` + `typescript`), loại trừ `design-system/` khỏi phạm vi lint (hệ thống chưa được kết nối vào site, xem `PROJECT_AUDIT.md` §3.4 — không tốn effort của task này để dọn ~1.200 dòng code chưa dùng).
  - Chạy lint lần đầu phát hiện 1 lỗi + 3 cảnh báo thật, đã sửa cả 4 (mục 4–6 bên dưới). `pnpm lint` giờ chạy sạch (0 lỗi, 0 cảnh báo).

### 4. Lỗi React Hooks thật: `setState` đồng bộ trong effect
- **File:** `components/mv/count-up.tsx`
- **Lỗi lint:** `react-hooks/set-state-in-effect` — nhánh `prefers-reduced-motion` gọi `setDisplay(value)` trực tiếp trong effect, có thể gây cascading render.
- **Sửa:** Dùng lại hook có sẵn `useReducedMotionSafe()` (đã dùng ở `components/homepage/verified-stat.tsx`) thay vì tự gọi `window.matchMedia`; giá trị hiển thị được tính trực tiếp khi render (`prefersReducedMotion ? value : display`) thay vì set qua effect.

### 5–6. Dọn cảnh báo lint
- `components/seo/json-ld.tsx`: gỡ `// eslint-disable-next-line react/no-danger` không còn cần thiết (rule này không nằm trong bộ rule đang áp dụng).
- `lib/site-data.ts`: gỡ 2 import Lucide icon không dùng (`ShieldCheck`, `Car`).

### 7. Thiếu `sitemap.xml` / `robots.txt`
- **Thêm:** `app/sitemap.ts`, `app/robots.ts` (chuẩn Next.js App Router).
- **Vì sao P0:** Volume 00 `07-module-map.md` liệt kê "SEO metadata. Sitemap và robots." là một phần bắt buộc của module Public Website — hoàn toàn chưa tồn tại trước đó.
- **Lưu ý:** Sitemap chỉ liệt kê các route **đã thực sự tồn tại** (`/`, `/tours`, `/tour/[slug]` theo từng tour, `/mice`, `/hotels`, `/cruises`, `/flights`, `/tickets`, `/visa`, `/about`, `/contact`). Các link nav/footer trỏ tới trang chưa xây (`/services`, `/destinations`, `/faq`, `/careers`, `/brand/*`, `/policy/*`...) **cố ý không đưa vào sitemap** — submit URL 404 cho search engine còn tệ hơn không có sitemap. Xem "Còn tồn đọng" bên dưới.

### 8. Thiếu `metadataBase` — cảnh báo Next.js khi resolve OG image
- **File:** `app/layout.tsx`
- **Thêm:** `metadataBase: new URL(SITE_URL)` trong `metadata` gốc, dùng lại hằng số `SITE_URL` đã có sẵn ở `constants/seo.ts`.
- Đồng thời gỡ field `generator: 'v0.app'` — dấu vết công cụ scaffold nội bộ, không nên lộ ra `<meta name="generator">` của một site production.

### 9. Thiếu tài liệu biến môi trường
- **Thêm:** `.env.example`, liệt kê `LEADS_WEBHOOK_URL` và `NEWSLETTER_WEBHOOK_URL` — hai biến mà `lib/actions/lead-action.ts` và `lib/actions/newsletter-action.ts` (được dùng bởi form trên Homepage) đã tham chiếu nhưng chưa từng được khai báo mẫu ở đâu.

### 10. `.gitignore` chưa đủ chặt
- Thêm `.env`, `.env.local`, `*.tsbuildinfo` — tránh commit nhầm secret hoặc cache build khi repo bắt đầu được version-control (xem mục "Hạ tầng Git" bên dưới).

### 11. Khởi tạo Git repository
- Repo trước đó **không phải git repository** (`git status` báo lỗi) — vi phạm Volume 00 `04-technical-stack.md` ("GitHub làm nguồn code chính").
- Đã chạy `git init`. Lịch sử được chia làm 2 commit để review rõ ràng:
  1. `chore: initial import of existing Minh Viet Travel Platform codebase` — snapshot nguyên trạng trước khi sửa (mọi file không nằm trong danh sách ở trên).
  2. Commit chứa toàn bộ thay đổi của Task này (danh sách file ở trên).

---

## Đã xác minh (không chỉ "code compile")

- `npx tsc --noEmit` → sạch, không lỗi.
- `npx eslint .` → sạch, 0 lỗi/0 cảnh báo.
- `npx next build` → build production thành công, toàn bộ 22 route (bao gồm `/`, `/sitemap.xml`, `/robots.txt`) được generate không lỗi.
- `npx next start` + `curl`: xác nhận `/robots.txt` và `/sitemap.xml` trả nội dung đúng; xác nhận HTML trang chủ chứa form newsletter đã sửa (placeholder "Nhập email của bạn" render đúng vị trí trong footer).
- Không thực hiện được click-through tương tác qua trình duyệt thật trong phiên này do xung đột cổng/mạng với tiến trình dev server khác đang chạy sẵn trên máy (cổng 3000, 3005) — **khuyến nghị QA thủ công**: mở `/`, cuộn xuống footer, nhập email, bấm "Đăng ký", xác nhận thấy thông báo "Cảm ơn bạn đã đăng ký nhận bản tin." (trạng thái thành công trung thực vì `NEWSLETTER_WEBHOOK_URL` chưa cấu hình — xem `.env.example`).

---

## Không đụng tới (đúng như yêu cầu phạm vi)

- Không sửa `/contact`, `/tours`, `/tour/[slug]`, `/about`, `/hotels|/cruises|/flights|/tickets|/visa`, `/login`, `/register` — các lỗi P0 của những trang này (giá gạch ngang, countdown giả, số liệu không nguồn, form không tạo lead...) đã được ghi trong `PROJECT_AUDIT.md` §3 nhưng không thuộc Homepage.
- Không xoá `components/site/flash-deals.tsx` dù đã xác nhận là dead code chứa pattern bị cấm — không nằm trong route nào của Homepage nên để lại cho Task dọn dẹp riêng.
- Không hợp nhất 3 hệ Button (`components/ui`, `components/mv`, `design-system/`) — đây là nợ kiến trúc, không phải lỗi chặn go-live.
- Không đụng tới `design-system/` (loại khỏi phạm vi lint, không sửa/xoá) — quyết định giữ/xoá/migrate cần chủ sản phẩm quyết định (ảnh hưởng nhiều sản phẩm khác ngoài Volume 00).
- Không thêm module Enterprise/CRM/CMS/Auth nào — đúng yêu cầu "không thêm tính năng mới" và "không tạo module Enterprise".
- Không viết test tự động (chưa có test runner nào trong repo) — nằm ngoài phạm vi hẹp của Task 01, cần một task riêng để chọn và cài test runner.

## Còn tồn đọng (đề xuất cho Task/Sprint kế tiếp)

1. Nav/footer trên Homepage trỏ tới các trang chưa tồn tại (`/services`, `/destinations`, `/faq`, `/careers`, `/brand/leadership`, `/brand/news`, `/policy/terms`, `/policy/privacy`, `/policy/payment`) — cần xây các trang này hoặc tạm ẩn link khỏi menu/footer trước khi go-live thật, nếu không người dùng từ Homepage sẽ gặp 404.
2. Hero section dùng `.animate-kenburns` (zoom nền liên tục 20s) — vi phạm kỹ thuật Volume 01 `10-motion.md` ("Hiệu ứng liên tục" bị cấm) nhưng là quyết định thương hiệu/thẩm mỹ, không phải bug — cần chủ sản phẩm quyết định giữ (và ghi Design Debt chính thức) hay bỏ, không tự ý đổi trong task này.
3. `LEADS_WEBHOOK_URL` / `NEWSLETTER_WEBHOOK_URL` chưa có giá trị thật trong môi trường production — Homepage sẽ chạy đúng và trung thực (không giả vờ thành công sai) nhưng sẽ không có lead/subscriber nào thực sự tới tay đội Sales/Marketing cho đến khi 2 webhook này được cấu hình.
4. Chưa có test tự động nào trong repo (kể cả cho `lib/ai/match-engine.ts` — logic thuần, dễ test nhất) — Volume 00 `09-definition-of-done.md` yêu cầu "Test quan trọng pass".
