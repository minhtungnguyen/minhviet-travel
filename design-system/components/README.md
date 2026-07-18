# Components

All components consume the `ds`-prefixed token layer only — no hardcoded
hex values, no reference to the existing site's `--primary` / `--accent` /
`--gold` tokens. That isolation is what makes them safe to import into the
current app without changing anything that already renders.

## Button

```tsx
import { Button } from '@/design-system/components/button'

<Button variant="primary">Nhận tư vấn</Button>
<Button variant="secondary">Tìm hiểu thêm</Button>
<Button variant="ghost" size="sm">Hủy</Button>
<Button variant="text">Xem tất cả</Button>
<Button variant="danger">Xóa tài khoản</Button>
<Button variant="premium">Nâng cấp Enterprise</Button>
<Button loading>Đang xử lý…</Button>
<Button disabled>Không khả dụng</Button>
<Button href="/contact">Điều hướng như Link</Button>
```

Variants: `primary` (Enterprise Blue — the one interactive fill on a
screen), `secondary` (neutral outline), `ghost` (no border, subtle hover
fill), `text` (link-style, no box), `danger`, `premium` (Champagne Bronze —
use at most once per screen). Sizes: `sm` `md` `lg`.

## Input System

```tsx
import {
  TextInput, Textarea, SearchInput, Select,
  DateInput, PhoneInput, OtpInput, UploadInput,
} from '@/design-system/components/input'

<TextInput label="Họ và tên" required />
<Textarea label="Nội dung" rows={5} />
<SearchInput placeholder="Tìm kiếm…" onClear={() => {}} />
<Select label="Quốc gia" placeholder="Chọn quốc gia" options={[{ label: 'Việt Nam', value: 'vn' }]} />
<DateInput label="Ngày khởi hành" />
<PhoneInput label="Số điện thoại" />
<OtpInput length={6} value={otp} onChange={setOtp} />
<UploadInput label="Tài liệu đính kèm" accept=".pdf,.png,.jpg" />
```

Every control accepts `label`, `helperText`, `error`, `required`. Errors
render the danger token, not a browser default outline.

## Card System

```tsx
import {
  TourCard, DestinationCard, ServiceCard,
  PartnerCard, NewsCard, AICard, DashboardCard,
} from '@/design-system/components/card'

<TourCard href="/tour/tokyo" image="/tour-tokyo.webp" imageAlt="Tokyo"
  title="Tokyo — Núi Phú Sĩ — Hakone" price="27.900.000₫" badge="Bán chạy" />

<DestinationCard href="/destinations/japan" image="/dest-japan.webp" name="Nhật Bản" tagline="Tinh tế & bốn mùa" />

<ServiceCard href="/mice" icon={Briefcase} title="MICE & Sự kiện" description="Hội nghị, sự kiện quy mô lớn." />

<AICard title="Đà Nẵng · Bà Nà Hills" score={96} badge="Đề xuất AI" />

<DashboardCard label="Doanh thu tháng" value="₫1.2B" trend={{ value: '+12%', direction: 'up' }} />
```

All card props are generic (`image`/`title`/`href`/…) — no dependency on
any single product's data shape, so the same component works across Minh
Việt Travel, MIVIGO, Booking, and Checkin.

## Layout System

```tsx
import { Container, Section, Grid, PageShell, Header, Footer, Sidebar, SidebarItem } from '@/design-system/components/layout'

<PageShell header={<Header logo={<Logo />} nav={<MainNav />} actions={<Button>Đăng nhập</Button>} />}>
  <Section padding="lg" tone="subtle">
    <Grid cols={3} gap="lg">
      <ServiceCard ... />
      <ServiceCard ... />
      <ServiceCard ... />
    </Grid>
  </Section>
</PageShell>
```

`Section` owns vertical rhythm (`padding: sm|md|lg|xl`) and surface tone
(`base|subtle|inverse`) so spacing stays consistent without every page
re-deriving its own `py-*` values. `Sidebar` + `SidebarItem` are for
dashboard/admin shells (MIVIGO, Booking back-office, Checkin operator
console).
