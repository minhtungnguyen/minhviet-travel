# Minh Việt Travel Platform

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 monolith for Minh Việt Travel's public-facing site.

## Cài đặt

```bash
pnpm install
```

## Chạy dự án

```bash
pnpm dev        # môi trường phát triển — http://localhost:3000
pnpm build      # build production
pnpm start      # chạy bản build production
pnpm lint       # ESLint
pnpm typecheck  # kiểm tra TypeScript (tsc --noEmit)
pnpm test       # chạy unit test (Vitest)
```

`npm run <script>` cũng chạy được tương đương nếu không dùng pnpm.

## EPIC-001 — Flight Homepage (`/ve-may-bay`)

Trang chủ Flight Module (B2C, chỉ dùng Mock Data) theo
`docs/PRD/Flight/EPIC-001-Flight-Homepage.md`.

- **Route:** `app/ve-may-bay/page.tsx` (+ `loading.tsx`, `error.tsx`)
- **Components:** `components/flight/*` — mỗi section/sub-component một file riêng
- **Types:** `types/flight.ts`
- **Mock data & validation:** `lib/flight/flight-data-seed.ts`, `lib/flight/flight-schema.ts` (Zod), `lib/flight/flight-repository.ts` (seam `getFlightHomeContent()` — điểm duy nhất cần thay khi tích hợp CMS/API thật)
- **SEO:** `FlightHomeJsonLd` trong `components/seo/json-ld.tsx` (Organization, WebSite + SearchAction, FAQPage, BreadcrumbList)

Lưu ý: `app/flights/page.tsx` (Vé máy bay doanh nghiệp — B2B) là module riêng, **không** thuộc phạm vi Epic này và không bị thay đổi.

## Cấu trúc thư mục (rút gọn)

```text
app/            Next.js App Router routes
components/     React components theo khu vực (site, flight, mice, mv, ui, seo...)
lib/            Data-access / domain logic theo tính năng
types/          Type definitions theo domain nội dung
constants/      Hằng số toàn ứng dụng (SEO, routes...)
docs/           Tài liệu kiến trúc, backend, PRD
MASTER-BIBLE/   Product Bible — quy chuẩn sản phẩm, thương hiệu, kỹ thuật
```
