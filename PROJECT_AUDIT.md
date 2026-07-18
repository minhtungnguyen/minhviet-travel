# PROJECT AUDIT — Minh Việt Travel Platform

**Ngày audit:** 2026-07-18
**Đối chiếu với:** `MV_Operating_System/docs/volume-00-foundation` (Volume 00 — Foundation) và `MV_Operating_System/docs/volume-01-design-dna` (Volume 01 — Design DNA)
**Phạm vi:** Toàn bộ source code hiện tại (`app/`, `components/`, `design-system/`, `sections/`, `lib/`, `hooks/`, `types/`, `constants/`, config gốc)
**Phương pháp:** Đọc trực tiếp từng file mã nguồn, không suy đoán. Không sửa code. Chỉ phân tích.

> **Ghi chú quan trọng:** Trong lúc đọc code, phát hiện một bộ tài liệu thứ ba — `MV_Operating_System/volume/volume-02-design` ("Volume 02 — Design Operating System") — mà nhiều đoạn code hiện tại trích dẫn trực tiếp (`Volume 02 Ch.5.1`, `Ch.5.3`, `Ch.17.7`, `Ch.18.2`, `Ch.2 Principle 4`...). Volume 02 không nằm trong phạm vi được giao đối chiếu lần này, nhưng sự tồn tại song song của nó — với token màu khác Volume 01 (`#0b1f3a` thay vì `#1F3863`, `#c7a86b` thay vì `#C89B3C`) và không có bản ghi thay đổi nào trong Volume 01 `MANIFEST.md` (mục "Change Control") — tự nó là một vi phạm quản trị tài liệu cần lãnh đạo quyết định volume nào là nguồn sự thật. Toàn bộ nhận định "sai" bên dưới được chấm theo Volume 01 vì đó là phạm vi được giao.

---

## 1. Kiến trúc hiện tại

### 1.1 Tech stack thực tế so với Volume 00 §04

| Thành phần | Volume 00 yêu cầu | Thực tế trong repo | Trạng thái |
|---|---|---|---|
| Next.js App Router | Bắt buộc | Next.js 16.2.6, App Router | ✅ Đúng |
| TypeScript strict | Bắt buộc | `tsconfig.json` có `strict: true`, nhưng `next.config.mjs` set `typescript.ignoreBuildErrors: true` | ⚠️ Vô hiệu hóa cổng chặn lỗi type ở build |
| Tailwind CSS | Bắt buộc | Tailwind v4 (`@tailwindcss/postcss`) | ✅ Đúng |
| shadcn/ui | Bắt buộc | `components.json` cấu hình shadcn (style `base-nova`), nhưng dùng `@base-ui/react` làm primitive thay vì Radix mặc định của shadcn | ⚠️ Biến thể không chuẩn, chấp nhận được nhưng cần ghi nhận |
| React Hook Form | Bắt buộc | **Không có trong `package.json`** | ❌ Thiếu |
| Zod | Bắt buộc | Có (`zod ^4.4.3`), dùng tốt trong `lib/cms/schema.ts` | ✅ Đúng, chất lượng cao |
| Supabase PostgreSQL | Bắt buộc | **Không có dependency, không có client, không có `.env`** | ❌ Hoàn toàn chưa triển khai |
| Supabase Auth | Bắt buộc | **Không tồn tại** — `login`/`register` chỉ là form tĩnh | ❌ Hoàn toàn chưa triển khai |
| Supabase Storage | Bắt buộc | **Không tồn tại** — không có upload thật nào | ❌ Hoàn toàn chưa triển khai |
| Vercel | Bắt buộc | Có `@vercel/analytics`, chưa xác nhận được deploy config | ⚠️ Không kiểm chứng được từ code |
| GitHub | Bắt buộc, "nguồn code chính" | **Thư mục không phải git repository** (`git status` báo `fatal: not a git repository`) | ❌ Vi phạm nghiêm trọng — không có version control |

### 1.2 Cấu trúc thư mục thực tế so với khuyến nghị Volume 00 §04

Volume 00 khuyến nghị `src/app/{(public),admin,api,auth}`, `features/{tours,crm,bookings,cms,ai-import}`, `services/`, `schemas/`.

Thực tế:

```
app/                    → chỉ có route công khai (about, contact, cruises, flights,
                          hotels, login, mice, register, tickets, tour/[slug],
                          tours, visa) — KHÔNG có app/admin, app/api, app/auth
components/
  homepage/             → component riêng cho trang chủ (đã qua CMS seam)
  layout/, mv/, seo/    → tiện ích dùng chung
  site/                 → header/footer/form/card cho các trang còn lại
  ui/                   → primitive shadcn-style (Button, Input, Select...)
design-system/          → HỆ THỐNG THIẾT KẾ SONG SONG, độc lập, CHƯA được kết nối
                          vào site đang chạy (xem mục 3.4)
sections/               → 9 section lắp ráp trang chủ
lib/
  actions/              → 3 server action (lead, ai-advisor, newsletter)
  ai/match-engine.ts     → engine matching AI advisor (thuần function, không gọi LLM ngoài)
  cms/                  → seam CMS: client.ts + schema.ts + content/homepage.seed.ts
  site-data.ts          → dữ liệu tour/dịch vụ/đối tác HARDCODE cho phần còn lại của site
hooks/, types/, constants/, animations/  → hỗ trợ
```

**Không tồn tại:** `app/admin`, `app/api`, `app/auth`, `features/`, `services/`, `schemas/`, thư mục `supabase/` hay `migrations/`, thư mục test nào.

### 1.3 Kiến trúc dữ liệu — hai tầng không đồng nhất (phát hiện quan trọng nhất)

Codebase hiện có **hai tầng dữ liệu hoàn toàn khác triết lý**, tồn tại song song:

1. **Tầng CMS-seam (chỉ phục vụ trang chủ)** — `lib/cms/client.ts` gọi `getHomepageContent()`, dữ liệu đi qua `homepageContentSchema` (Zod) trong `lib/cms/schema.ts`, đọc từ `lib/cms/content/homepage.seed.ts`. Đây là một seam được thiết kế tốt, có chú thích rõ: "swap the body below for a Sanity/Contentful/Supabase fetch and nothing else needs to change." Mọi số liệu (`VerifiedStat`) bắt buộc có `source` và `asOf`. Cấu trúc này phục vụ 9 section trang chủ (`hero`, `trustStrip`, `coreServices`, `enterpriseMice`, `aiAdvisor`, `featuredJourneys`, `destinations`, `brandCenter`, `finalCta`).

2. **Tầng hardcode trực tiếp (mọi trang còn lại)** — `lib/site-data.ts` là một file TypeScript ~510 dòng chứa cứng toàn bộ tour, mega-menu, đối tác, số liệu thống kê, flash-deal. Không có Zod, không có nguồn trích dẫn, không có lớp truy cập nào ở giữa. `app/tours`, `app/tour/[slug]`, `components/site/why-choose.tsx`, `components/site/partners.tsx`, `components/homepage/lead-form` (menu) đều import trực tiếp từ file này.

Bản thân `types/cms.ts` (tầng 1) có chú thích minh thị cấm mẫu hình dùng trong tầng 2: *"Availability must be expressed as one of Volume 02's approved status labels... never as an invented countdown or seat counter."* — tức là đội ngũ trước đã tự nhận ra vấn đề của tầng 2 nhưng chưa migrate xong.

Nhiều đoạn code (comment trong `lib/actions/lead-action.ts`, `lib/ai/match-engine.ts`, `components/homepage/verified-stat.tsx`, `components/homepage/smart-search-bar.tsx`) trích dẫn trực tiếp "the audit flagged..." — bằng chứng rõ ràng đã có **ít nhất một đợt audit + fix trước đây**, nhưng chỉ áp dụng cho trang chủ, chưa lan ra các trang còn lại.

### 1.4 Theme thực tế đang chạy (`app/globals.css`)

Site đang chạy dùng token riêng (không phải Volume 01, cũng không phải `design-system/` — là tầng thứ ba):

- `--primary` / `--navy`: `#0b1f3a`
- `--gold`: `#c7a86b`, `--gold-soft`: `#e2d3b3`
- `--accent` / `--sky`: `#35a9e0` (xanh dương "Sky Accent")
- Nền trắng `#ffffff`, chữ `#1a1d21`

`design-system/css/tokens.css` được import thêm vào `app/globals.css` nhưng chỉ tạo ra các class `ds-*` phụ trợ, không ghi đè hay được bất kỳ trang nào tiêu thụ — tự file README của `design-system/` xác nhận: *"Nothing in `/design-system` is wired into the current Minh Việt Travel homepage or any existing route."*

---

## 2. Điểm đúng

Những phần này nên được giữ nguyên và dùng làm khuôn mẫu khi sửa các phần còn lại.

1. **Seam CMS trang chủ (`lib/cms/client.ts`, `schema.ts`, `types/homepage.ts`, `types/cms.ts`)** — kiến trúc đúng chuẩn Volume 00 §03 "CMS-first" và §04 (service layer tách khỏi UI): một điểm swap duy nhất, Zod validate mọi output, sẵn sàng thay bằng Supabase mà không đổi UI.
2. **`VerifiedStat` + `components/homepage/verified-stat.tsx`** — mọi số liệu hiển thị đều bắt buộc có `source`/`asOf` và luôn hiển thị dòng "Nguồn: …" — đúng Volume 01 §8 Authenticity Rules ("verifiable case studies", cấm "unsupported claims").
3. **AI Advisor (`lib/ai/match-engine.ts`, `lib/actions/ai-advisor-action.ts`, `components/homepage/ai-advisor-result.tsx`)** — không bịa số phần trăm, giải thích rõ tiêu chí khớp/không khớp, luôn hiển thị "Đây là gợi ý từ AI, chuyên viên sẽ xác nhận trước khi triển khai" — đúng Volume 00 §05 (AI được phép gợi ý, không tự quyết) và Volume 01 §12 (AI minh bạch, có thể chỉnh sửa/xác nhận bởi người).
4. **`lib/actions/lead-action.ts` + `hooks/use-lead-form.ts` + `components/homepage/lead-form.tsx`** — server action thật, Zod validate server-side, log rõ ràng khi chưa cấu hình `LEADS_WEBHOOK_URL`, không giả vờ thành công khi không có backend — đúng Volume 00 §03 "CRM-by-default" và §06 (validate mọi input, error handling trung thực).
5. **`components/homepage/smart-search-bar.tsx`** — có submit handler thật, điều hướng sang `/tours` với query params thay vì chỉ là ô input trang trí.
6. **Design tokens trong `design-system/tokens/*.ts`** — chất lượng cao, có tài liệu rõ triết lý (màu = chức năng, không phải trang trí; xanh dương chỉ dùng cho trạng thái tương tác; đồng/vàng hiếm và có giới hạn 1 lần/màn hình) — đúng tinh thần Volume 01 §04 dù khác giá trị HEX cụ thể. Vấn đề duy nhất là chưa được kết nối (xem mục 3.4), không phải chất lượng token.
7. **Tour detail page (`app/tour/[slug]/page.tsx`)** — CTA chính là "Nhận tư vấn giải pháp" / gọi hotline, không có nút "Đặt ngay/Thanh toán" giả — đúng mô hình giao dịch V1 của Volume 00 §02 (khách gửi yêu cầu → CRM tạo lead → nhân viên xử lý, không tự động chốt giao dịch).
8. **Accessibility cơ bản** — có `SkipLink` (`components/layout/skip-link.tsx`), `aria-live`, `role="alert"` trên các state lỗi/kết quả AI, `prefers-reduced-motion` được tôn trọng trong `app/globals.css` và `use-reduced-motion-safe.ts`.
9. **Header/Footer (`site-header.tsx`, `site-footer.tsx`)** — nền chủ đạo trắng/navy, gold chỉ xuất hiện ở icon, heading nhỏ, và đúng 1 nút CTA gold ("Đăng ký") — tuân thủ tỷ lệ màu Volume 01 §04.

---

## 3. Điểm sai

Xếp theo mức độ nghiêm trọng: **Critical > High > Medium > Low.**

### 3.1 [Critical] Fake urgency — countdown giả trên Flash Deals

- **File:** `components/site/flash-deals.tsx`, `lib/site-data.ts` (`flashDeals`, field `endsInHours`)
- **Vi phạm:** Volume 01 `01-brand-emotion.md` §3.1 — liệt kê đích danh *"countdown timers without a real operational basis"* là ví dụ đầu tiên phá vỡ Trust. `types/cms.ts` (do chính team viết) cũng ghi rõ: *"never as an invented countdown."*
- **Chi tiết:** `useCountdown()` tính lại `Date.now() + hoursFromNow * 3600 * 1000` mỗi lần mount — nghĩa là mọi khách truy cập vào bất kỳ lúc nào cũng thấy "còn 7 giờ", "còn 15 giờ"... vĩnh viễn không hết hạn thật.
- **Hiện trạng render:** Component hiện **không được import ở bất kỳ page nào** (chỉ còn dấu vết trong `tsconfig.tsbuildinfo`) — tức là đã bị gỡ khỏi luồng hiển thị nhưng code vẫn còn trong repo, sẵn sàng bị vô tình bật lại.

### 3.2 [Critical] Giá gạch ngang + % giảm giá tràn lan — mô hình "OTA giá rẻ"

- **File:** `lib/site-data.ts` (`Tour.originalPrice`, `Tour.discount` — 6/6 tour mẫu đều có discount 7–22%), `components/site/tour-card.tsx`, `app/tour/[slug]/page.tsx`
- **Vi phạm:** README `§8 Immediate Failure Conditions` — "the screen resembles a discount-tour landing page"; `01-brand-emotion.md` §7 "Cheap" — *"crossed-out prices everywhere"*. `types/cms.ts` cấm mẫu seat-counter kiểu `"Còn 8 chỗ"` mà `lib/site-data.ts` vẫn dùng cho mọi tour.
- **Đối chiếu nội bộ:** Đây chính xác là mẫu hình mà tầng CMS mới (`priceType: 'estimate' | 'confirmed'`, `availability: AvailabilityStatus`) được thiết kế ra để thay thế — nhưng `/tours` và `/tour/[slug]` chưa được migrate sang tầng đó.

### 3.3 [Critical] Số liệu không nguồn, không kiểm chứng được ("fabricated metrics")

- **File:** `lib/site-data.ts` (`stats`, `whyStats`), `components/site/why-choose.tsx`, `app/about/page.tsx` ("phục vụ hơn 5.000 tổ chức")
- **Vi phạm:** Volume 01 `02-design-philosophy.md` §8 Authenticity Rules — cấm *"invented customer counts"*, *"unsupported claims"*; BATCH_01 checklist mục E — "metrics are real or clearly marked as placeholders".
- **Đối chiếu nội bộ:** Trái ngược trực tiếp với `VerifiedStat`/`verifiedStatSchema` (bắt buộc `source` + `asOf`) đã áp dụng đúng ở trang chủ. "5000+ doanh nghiệp tin tưởng", "200K+ khách hàng hài lòng", "1000+ đối tác toàn cầu" không có nguồn, không có ngày xác minh.

### 3.4 [High] Hệ thống thiết kế song song, không kết nối (`design-system/`)

- **File:** toàn bộ `design-system/` (~1.183 dòng component + đầy đủ token)
- **Vi phạm:** Volume 01 §4 Principle 10 "Consistency before novelty"; Volume 00 §06 rule 9 "Không trừu tượng hóa quá sớm", rule 10 "Không thêm thư viện mới nếu thư viện hiện có giải quyết được".
- **Chi tiết:** README của chính thư mục này xác nhận đây là nền tảng multi-product (Minh Việt Travel, MIVIGO, Minh Việt Booking, Checkin Platform) ở "Phase 1", **chủ đích chưa kết nối vào site**. Đây không phải lỗi ngẫu nhiên mà là quyết định kiến trúc chưa có lộ trình migrate rõ ràng, khiến repo sản phẩm V1 gánh thêm ~1.200 dòng code không ai dùng — tăng chi phí bảo trì và nguy cơ lệch chuẩn (2 bộ Button, 2 bộ TourCard cùng tồn tại — xem 3.5).

### 3.5 [High] Ba hệ thống Button khác nhau cùng tồn tại

- **File:** `components/ui/button.tsx` (shadcn/base-ui, dùng ở `sections/hero-section.tsx`, `smart-search-bar.tsx`, `lead-form.tsx`), `components/mv/mv-button.tsx` (`MVButton`, dùng ở header/footer/tour-card/hầu hết page), `design-system/components/button/Button.tsx` (chưa dùng ở đâu)
- **Vi phạm:** Volume 01 `11-component-principles.md` — *"Không tạo component mới nếu component hiện có chỉ cần mở rộng"*; §4 Principle 10.
- **Hệ quả thực tế:** Hai bộ variant khác tên (`primary/gold/outline...` vs `default/gold/outline...`), hai style token khác nhau (`bg-primary` vs `bg-ds-interactive-default`) — nguy cơ trôi dạt hình ảnh (visual drift) giữa các trang khi có người mới thêm page.
- **Tương tự:** `TourCard` cũng tồn tại 2 bản (`components/site/tour-card.tsx` đang dùng, `design-system/components/card/TourCard.tsx` chưa dùng).

### 3.6 [High] Trang `/contact` KHÔNG tạo lead thật — vi phạm CRM-by-default

- **File:** `components/site/contact-form.tsx`
- **Vi phạm:** Volume 00 `03-product-principles.md` §2 "CRM-by-default: Mọi hành động có giá trị bán hàng phải tạo hoặc cập nhật lead, bao gồm: Gửi form"; `06-development-rules.md` — "Mọi input phải được kiểm tra bằng Zod" (form công khai).
- **Chi tiết:** `onSubmit` chỉ gọi `e.preventDefault(); setSubmitted(true)` — không gọi `submitLeadAction`, không có Zod, không log, không gửi webhook. Đây là **trang Liên hệ chính thức** của site (module P0 "Form tư vấn" theo Volume 00 §07) nhưng không tạo ra lead nào trong thực tế — trong khi `components/homepage/lead-form.tsx` (dùng trên trang chủ) đã làm đúng việc này thông qua `useLeadForm` + `submitLeadAction`. Đây là một bản vá chưa hoàn tất, không phải thiếu hiểu biết — hai component chỉ cần hợp nhất.

### 3.7 [High] `LoginForm`/`RegisterForm` không có xác thực thật, không Zod

- **File:** `components/site/login-form.tsx`, `components/site/register-form.tsx`
- **Vi phạm:** Volume 00 §04 (Supabase Auth bắt buộc), §06 (Zod cho mọi form công khai/admin)
- **Ghi nhận tích cực:** Không giả vờ đăng nhập thành công — hiển thị thông báo trung thực "Cổng khách hàng đang được phát triển". Đây là cách xử lý đúng tinh thần "no dead-end / no fake success" nhưng về bản chất **toàn bộ module Users & Roles (Volume 00 §07 mục 6) chưa tồn tại**, xem mục 6.

### 3.8 [Medium] Chuyển động liên tục vi phạm Motion DNA

- **File:** `app/globals.css` (`.animate-kenburns` 20s, `.animate-marquee` 45s, `.animate-float` 6s, `.animate-gradient` 8s, `.animate-glow` 2.4s infinite, `.animate-soft-ping` 1.6s infinite), `sections/hero-section.tsx` (dùng `animate-kenburns` trên ảnh nền hero)
- **Vi phạm:** Volume 01 `10-motion.md` — Forbidden liệt kê rõ *"Hiệu ứng liên tục"* (continuous effect); Duration chuẩn chỉ quy định hover 150–200ms, dialog 200–250ms, page transition 250–300ms — không có hạng mục nào cho animation lặp vô hạn.
- **Ghi chú:** Ken Burns nền hero là hiệu ứng phổ biến ở sản phẩm cao cấp và không nhất thiết phải bỏ, nhưng cần được ghi nhận là **ngoại lệ có tài liệu** (Design Debt record theo Volume 01 §11) thay vì mặc nhiên tồn tại; `animate-marquee`/`animate-glow`/`animate-soft-ping`/`animate-float` hiện không thấy được gọi ở page nào đã đọc — cần rà soát toàn repo trước khi quyết định giữ hay xóa.

### 3.9 [Medium] Hiệu ứng "shine"/"luxury-ring"/gradient text — thiên về trang trí

- **File:** `app/globals.css` (`.shine`, `.luxury-ring`, `.text-gradient-gold`, `.text-gradient-brand`, `.hover-lift` với `translateY(-6px)` + shadow lớn)
- **Vi phạm:** Volume 01 `02-design-philosophy.md` §4.4 "Premium, not ornamental"; `01-brand-emotion.md` §7 "Outdated" liệt kê *"glossy buttons"*; README §3.3 cấm "excessive gradients", "heavy shadows".
- **Ghi chú:** Cần audit từng nơi các class này thực sự được áp dụng để đánh giá mức độ — không phải mọi gradient đều sai (Volume 01 chỉ cấm gradient "không có mục đích rõ ràng" — 04-color-philosophy.md), nhưng số lượng hiệu ứng trang trí được định nghĩa sẵn (6+ loại) cho thấy xu hướng lệch khỏi "restraint rules" của §7 Volume 01 design-philosophy (tối đa 1 decorative treatment/section).

### 3.10 [Medium] Đối tác/nhà cung cấp hiển thị công khai chưa rõ đã phê duyệt

- **File:** `lib/site-data.ts` (`partners`, `airlinePartners`, `hotelPartners`), `components/site/partners.tsx`, `app/hotels/page.tsx` (liệt kê "Marriott, Accor, InterContinental, Vinpearl" trong copy)
- **Vi phạm:** Volume 00 `02-business-scope.md` — "Nguyên tắc nhà cung cấp: Không hiển thị nhà cung cấp trên frontend nếu không có phê duyệt."
- **Cần xác minh nghiệp vụ:** Không thể kết luận từ code liệu các quan hệ đối tác này đã được xác nhận hợp đồng/phê duyệt hay là dữ liệu placeholder từ template gốc — cần chủ sở hữu nghiệp vụ xác nhận trước go-live.

### 3.11 [Medium] `next.config.mjs` tắt kiểm tra TypeScript khi build

- **File:** `next.config.mjs` (`typescript: { ignoreBuildErrors: true }`)
- **Vi phạm:** Volume 00 `08-roadmap-v1.md` "Cổng kiểm soát" — *"Chỉ chuyển Sprint khi: Không có lỗi typecheck"*; `06-development-rules.md` rule 7 "Không dùng `any` nếu có thể định nghĩa kiểu" — cờ này che giấu chính xác loại lỗi mà rule đó muốn ngăn.
- **Rủi ro:** Lỗi type có thể lọt qua build production mà không ai biết cho đến khi runtime crash.

### 3.12 [Medium] Không có test nào trong repo

- **Vi phạm:** Volume 00 `09-definition-of-done.md` mục "Kiểm thử" — yêu cầu typecheck/lint/test pass, kiểm thử quyền truy cập, kiểm thử lỗi.
- **Hiện trạng:** `find` toàn repo cho `*.test.*` / `*.spec.*` trả về rỗng. Không một module nào (kể cả `lib/ai/match-engine.ts` — logic thuần, dễ test nhất) có unit test.

### 3.13 [Low] Repo không phải Git repository

- **Vi phạm:** Volume 00 `04-technical-stack.md` "GitHub làm nguồn code chính"; `06-development-rules.md` mục Git (nhánh `main/develop/feature/*`).
- **Xếp Low về mã nguồn nhưng Critical về vận hành** — không thể code review, không thể rollback, không thể deploy an toàn qua Vercel+GitHub cho đến khi khởi tạo git và đẩy lên remote. Xem thêm mục 7 (đây là việc đầu tiên phải làm, không tính vào effort Sprint).

### 3.14 [Low] Không có `.env`/`.env.example`

- **Hệ quả:** `LEADS_WEBHOOK_URL` (đã được code tham chiếu trong `lead-action.ts`) không có nơi khai báo mẫu; không dev nào mới vào có thể biết cần cấu hình biến môi trường nào.

---

## 4. File cần sửa

| File | Vấn đề | Việc cần làm |
|---|---|---|
| `components/site/contact-form.tsx` | Không gọi server action, không Zod, không tạo lead | Thay bằng logic giống `components/homepage/lead-form.tsx` (`useLeadForm` + `submitLeadAction`); xóa state `submitted` cục bộ |
| `lib/site-data.ts` | Chứa cứng discount, giá gạch ngang, số liệu không nguồn, seat-counter, partner chưa rõ phê duyệt | Tách theo từng domain, chuyển sang schema kiểu `journeyContentSchema` đã có sẵn (bỏ `discount`/`originalPrice` mặc định, dùng `priceType`/`availability` như tầng CMS mới); mọi số liệu thống kê phải có `source`/`asOf` |
| `components/site/tour-card.tsx` | Hiển thị giá gạch ngang + badge giảm giá | Đồng bộ với `journeyContentSchema`/`AvailabilityStatus`; bỏ mẫu OTA-giảm-giá |
| `app/tour/[slug]/page.tsx` | Cùng lỗi giá gạch ngang; nội dung lịch trình là placeholder tĩnh "đang được biên soạn" | Sửa hiển thị giá theo chuẩn mới; kết nối dữ liệu lịch trình thật khi có CMS |
| `components/site/why-choose.tsx` | Dùng `whyStats` không nguồn | Chuyển sang dùng `VerifiedStat`/`verifiedStatSchema` như trang chủ, hoặc gắn `source`/`asOf` thật |
| `components/site/partners.tsx`, `app/hotels/page.tsx` | Tên đối tác cụ thể chưa rõ đã phê duyệt hiển thị công khai | Xác nhận với chủ sở hữu nghiệp vụ; nếu chưa phê duyệt, thay bằng mô tả chung ("hệ thống khách sạn 4–5 sao toàn cầu") |
| `components/site/login-form.tsx`, `components/site/register-form.tsx` | Không Zod, không backend | Khi triển khai Supabase Auth: thêm Zod schema, nối Supabase Auth thật, giữ nguyên cách báo lỗi trung thực hiện có |
| `next.config.mjs` | `ignoreBuildErrors: true` che lỗi type | Gỡ cờ này sau khi dọn lỗi type tồn đọng (nếu có); nếu hiện có lỗi ẩn, liệt kê và sửa trước |
| `app/globals.css` | Nhiều hiệu ứng animation liên tục/trang trí (`marquee`, `glow-pulse`, `soft-ping`, `float`, `shine`) chưa rõ nơi sử dụng | Audit từng class đang thực sự được dùng ở đâu; xóa class không dùng, ghi Design Debt cho class còn giữ nhưng vi phạm `10-motion.md` |
| `components.json` | `"config": ""` — không trỏ tới file Tailwind config nào tường minh | Xác nhận đây có phải hành vi đúng của Tailwind v4 CSS-first hay là cấu hình sót |
| `design-system/*` (toàn bộ) | Song song, không kết nối, gây trùng lặp Button/TourCard | Xem quyết định kiến trúc ở mục 5 — hoặc lên lộ trình migrate chính thức (Sprint riêng, ngoài phạm vi V1 hẹp), hoặc tách khỏi repo V1 |

---

## 5. File cần xoá

| File/Thư mục | Lý do |
|---|---|
| `components/site/flash-deals.tsx` | Không còn được import ở bất kỳ page nào; chứa pattern countdown giả bị cấm minh thị bởi Volume 01 và bởi chính `types/cms.ts` nội bộ. Giữ lại chỉ tạo rủi ro bị vô tình bật lại. |
| `design-system/components/button/Button.tsx` | Trùng chức năng với `components/ui/button.tsx` và `components/mv/mv-button.tsx`, chưa được dùng ở đâu — **nếu** quyết định không theo lộ trình migrate `design-system/` (xem mục 4) |
| `design-system/components/card/TourCard.tsx` | Trùng với `components/site/tour-card.tsx`, chưa được dùng — cùng điều kiện như trên |
| `public/placeholder-logo.png`, `public/placeholder-logo.svg`, `public/placeholder-user.jpg`, `public/placeholder.jpg`, `public/placeholder.svg` | Ảnh placeholder mặc định của template khởi tạo (v0.app) — cần xác nhận không còn tham chiếu ở đâu rồi xóa để tránh vô tình xuất bản ảnh giữ chỗ generic (vi phạm Volume 01 `08-photography.md` "Không sử dụng stock photo cũ/generic") |
| `tsconfig.tsbuildinfo` | File cache build, không nên nằm trong version control một khi khởi tạo git (thêm vào `.gitignore`, không phải "xóa" theo nghĩa mã nguồn) |

**Không đề xuất xóa toàn bộ `design-system/`** — chất lượng token/tài liệu tốt và có giá trị chiến lược multi-product theo README của chính nó. Quyết định giữ/xóa/migrate cần chủ sở hữu sản phẩm quyết định vì vượt phạm vi kỹ thuật thuần túy (ảnh hưởng MIVIGO, Minh Việt Booking, Checkin Platform ngoài phạm vi Volume 00).

---

## 6. Module thiếu

Đối chiếu với `07-module-map.md` (P0 — bắt buộc để go-live):

| # | Module P0 | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Public Website | 🟡 Một phần | Trang chủ (9 section) hoàn chỉnh và chất lượng cao. Tour có listing+detail nhưng dữ liệu hardcode, lịch trình placeholder. Hotels/Cruises/Flights/Tickets/Visa chỉ có 1 trang marketing tĩnh (`PlaceholderSection`), **không có listing/detail thật**. Không có trang Điểm đến, Bài viết/Tin tức, FAQ, sitemap/robots chưa xác nhận. |
| 2 | CMS (quản trị) | ❌ Thiếu hoàn toàn | Không có `app/admin`, không có giao diện quản trị nào. Chỉ có seam đọc dữ liệu (`lib/cms/client.ts`) — chưa có nơi *ghi* dữ liệu. |
| 3 | CRM | ❌ Thiếu hoàn toàn | Không có danh sách lead, chi tiết lead, gán nhân viên, trạng thái, ghi chú, lịch sử. Chỉ có nơi *nhận* lead qua webhook (`LEADS_WEBHOOK_URL`) — chưa cấu hình, chưa có hệ thống phía sau webhook. |
| 4 | Booking Request | ❌ Thiếu hoàn toàn | Không có form booking request riêng (số người lớn/trẻ em, ngày dự kiến, liên kết lead, trạng thái, cọc). Hiện chỉ có form tư vấn chung. |
| 5 | AI Import | ❌ Thiếu hoàn toàn | Không có upload file, extract, mapping, preview. `lib/ai/match-engine.ts` là AI Sales Assistant (gợi ý tour), không phải AI Import tour. |
| 6 | Users & Roles | ❌ Thiếu hoàn toàn | Login/Register chỉ là UI tĩnh, không có Supabase Auth, không có vai trò/phân quyền server-side, không có audit log. |
| 7 | Notifications | ❌ Thiếu hoàn toàn | Không có in-app notification, không có email/Telegram integration. |
| 8 | Analytics | 🟡 Một phần | Có `@vercel/analytics` (page-level), nhưng không có UTM attribution, CTA event tracking, nguồn lead, báo cáo theo trạng thái như Volume 00 §07 mô tả. |

**Tóm tắt:** Trong 8 module P0, chỉ Module 1 (Public Website) có tiến độ đáng kể (và chỉ một phần — tour), 1 module (Analytics) có nền tảng tối thiểu, **6/8 module P0 chưa tồn tại**. Toàn bộ hệ thống hiện tại là **frontend marketing site**, chưa có backend/CMS/CRM/Auth nào — đúng như phát hiện ở mục 1.1 (không có Supabase, không có `app/admin|api|auth`).

---

## 7. Ước lượng thời gian hoàn thành V1

**Giả định:** Nhóm phát triển 2 kỹ sư full-stack tương đương (hoặc 1 kỹ sư + Claude Code hỗ trợ mạnh), làm việc theo `08-roadmap-v1.md`. Không tính thời gian chờ phê duyệt nội dung/pháp lý từ phía Minh Việt Travel (đối tác, chính sách, hình ảnh thật).

| Sprint (theo Volume 00) | Nội dung | Trạng thái hiện tại | Ước lượng còn lại |
|---|---|---|---|
| **Sprint 0** — Audit & nền móng | Kiểm tra code, chốt env, schema, auth, backlog lỗi, migration baseline | Audit này = một phần Sprint 0. **Chưa có git repo, chưa có Supabase project, chưa có migration nào.** | **0.5–1 tuần** (chủ yếu: khởi tạo git, tạo Supabase project, chốt schema) |
| **Sprint 1** — CMS sản phẩm | Tour CRUD, Destination CRUD, media upload, publish workflow, listing/detail lấy dữ liệu thật | 0% (chỉ có seam đọc, chưa có ghi; chưa có admin UI nào) | **2.5–3.5 tuần** |
| **Sprint 2** — Lead & CRM | Form công khai, lead creation, list/detail, assignment, status, notes, thông báo lead mới | Form công khai ~70% xong (trang chủ đúng, `/contact` cần sửa theo mục 3.6/4); CRM backend 0% | **2.5–3 tuần** |
| **Sprint 3** — Booking Request | Form yêu cầu booking, liên kết lead, trạng thái, dữ liệu hành khách, theo dõi cọc | 0% | **1.5–2 tuần** |
| **Sprint 4** — AI Import | Upload, extract, structured output, validation, human review, save draft, audit log | 0% (AI hiện có là Sales Assistant, không phải Import) | **2–3 tuần** (phụ thuộc nhà cung cấp OCR/LLM được chọn) |
| **Sprint 5** — Hoàn thiện website & đo lường | Search/filter cho mọi sản phẩm (không chỉ tour), SEO, analytics events, UTM, responsive QA, accessibility | Trang chủ + Tour ~60–70%; Hotels/Cruises/Flights/Tickets/Visa cần xây listing/detail thật từ đầu (hiện là trang tĩnh) | **2.5–3.5 tuần** |
| **Sprint 6** — Go-live hardening | Security review, RLS review, backup, error monitoring, seed/config production, redirect, domain, runbook | Chưa bắt đầu (phụ thuộc Supabase đã tồn tại) | **1.5–2 tuần** |

**Tổng ước lượng còn lại: khoảng 13–18 tuần làm việc (≈ 3–4.5 tháng)** kể từ audit này, với điều kiện:

- Bắt đầu ngay việc sửa các lỗi Critical ở mục 3 song song với Sprint 1 (không tốn thêm nhiều thời gian riêng vì đa số là sửa dữ liệu/component đã có, không phải xây mới).
- `design-system/` không được đưa vào lộ trình V1 (giữ nguyên trạng thái "chưa kết nối" — quyết định đúng theo Scope Lock, vì đây là hạng mục "trông hiện đại hơn nhưng không ảnh hưởng luồng chính").
- Không phát sinh yêu cầu tích hợp phức tạp ngoài dự kiến (ví dụ nhà cung cấp OCR cho AI Import).

**Rủi ro tiến độ lớn nhất:** Sprint 1 (CMS) là Sprint dài nhất và mọi Sprint sau đều phụ thuộc vào nó (Booking Request cần Tour thật, AI Import ghi vào bảng Tour thật) — nên đây là hạng mục cần ưu tiên tuyệt đối ngay sau khi dọn xong Sprint 0.
