# TOUR AVAILABILITY AS LOGICAL SALES SIGNAL
### Homepage Tour Cards + Data Contract

## 1. Business rules

- Availability status belongs to a **Tour Departure**, never to the tour as a whole. A tour can have departures in every status at once (`Tour Nhật Bản: 25/07 Còn chỗ, 02/08 Sắp đủ chỗ, 09/08 Hết chỗ`).
- The Homepage card shows the status of the **primary departure** — the soonest upcoming, active date that can still take guests. If none can, it falls back to the soonest SOLD_OUT date; if everything left is CLOSED, the soonest CLOSED date is still shown (a legitimate terminal state, not an error).
- A past departure is never shown, never counted, never used as a fallback.
- Missing data is never guessed into a status — it resolves to CHECKING, honestly.
- A departure's sale window closing (`saleCloseAt` in the past) is authoritative and forces CLOSED, even if the stored raw status hasn't caught up.
- Full rules and code: `lib/tours/availability.ts` (`selectPrimaryDeparture`, `deriveDepartureAvailability`, `mapAvailabilityToCTA`, `buildTourCardViewModel`), unit-tested in `lib/tours/availability.test.ts`.

## 2. Status enum

`types/tour-availability.ts` — `TourAvailabilityStatus`:

```
AVAILABLE | LIMITED | CHECKING | SOLD_OUT | CLOSED
```

Deliberately a **separate** type from `types/cms.ts`'s existing `AvailabilityStatus` (`'open'|'limited'|'almost-full'|'closed'|'pending-confirmation'`), which stays untouched because it's still load-bearing for Tour Detail (`components/site/tour-detail/*`, `lib/tours/tour-detail-content.ts`, `components/seo/json-ld.tsx`'s `TourDetailJsonLd`) and `lib/ai/match-engine.ts`/`types/ai-advisor.ts` — all out of scope for this task.

## 3. UI label mapping

| Status | Label |
|---|---|
| AVAILABLE | Còn chỗ |
| LIMITED | Sắp đủ chỗ |
| CHECKING | Đang kiểm tra chỗ |
| SOLD_OUT | Hết chỗ |
| CLOSED | Ngừng nhận khách |

The old labels ("Còn nhận khách", "Kín chỗ", "Gần kín", "Chờ xác nhận") are gone from the Homepage card — they belonged to the retired tour-level `AvailabilityStatus`.

## 4. CTA mapping

| Status | CTA label | Action | href |
|---|---|---|---|
| AVAILABLE | Khám phá tour | `view-detail` | tour detail (`journey.href`) |
| LIMITED | Giữ chỗ tư vấn | `prefill-inquiry` | `journey.href?departure={departureId}` |
| CHECKING | Kiểm tra chỗ | `check-availability` | `#lead-form` (existing Homepage consultation section — Sprint UI-03) |
| SOLD_OUT | Xem lịch khác | `view-alternate-dates` | `journey.href#departures` |
| CLOSED | Xem tour tương tự | `view-similar-tours` | `/tours?category={category}` |

None of these targets required modifying Tour Detail or `/tours` — they're links *to* existing routes with query/hash context those pages can read later, not new pages or new page logic.

## 5. Color mapping

Semantic tokens only (`app/globals.css`, "Tour availability status badge" block) — no hex hard-coded in components.

| Status | Background | Text/dot | Token source |
|---|---|---|---|
| AVAILABLE | `--mv-mist-blue` | `--mv-deep-navy` | reused from Sprint UI-02 (soft Blue Horizon blue) |
| LIMITED | `--mv-limited-bg` (`#FBF0DC`) | `--mv-limited-text` (`#92600C`) | new — muted amber, **not** `--mv-mice-gold` |
| CHECKING | `--mv-checking-bg` (`#E9EDF5`) | `--mv-slate-text` | new bg + reused slate text — neutral slate-blue |
| SOLD_OUT | `--mv-soldout-bg` (`#FBEAE8`) | `--mv-soldout-text` (`#9A2E24`) | new — muted deep red, **not** `--mv-offer-red` |
| CLOSED | `--secondary` | `--muted-foreground` | reused existing global neutral tokens |

No new tokens needed for AVAILABLE/CLOSED — both already had a correct semantic match in the existing palette. LIMITED/SOLD_OUT deliberately avoid the two reds/golds that already mean something else on the site (Ưu đãi red, MICE gold), per §6's explicit instruction.

## 6. Data contract

`types/tour-availability.ts`:

```ts
type TourAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'CHECKING' | 'SOLD_OUT' | 'CLOSED'

interface TourDeparture {
  id: string; tourId: string; departureDate: string; departurePoint: string
  availabilityStatus: TourAvailabilityStatus | null
  capacity: number | null; bookedSeats: number | null; availableSeats: number | null
  saleOpenAt: string | null; saleCloseAt: string | null
  price: number | null; currency: 'VND'; isActive: boolean
}

interface DerivedAvailability { status: TourAvailabilityStatus; label: string; availableSeats: number | null; isUrgent: boolean }
interface AvailabilityCta { label: string; action: AvailabilityCtaAction; href: string }
interface TourCardViewModel<TTour> { tour: TTour; primaryDeparture: TourDeparture | null; availability: DerivedAvailability; cta: AvailabilityCta }
interface AvailabilityConfig { limitedSeatsThreshold: number }
```

`types/homepage.ts`'s `JourneyContent` (Homepage-only, not shared with `/tours`) dropped its flat `availability`/`nextDeparture`/`departure` fields in favor of `departures: TourDeparture[]` — the departure *point* now lives per-departure too (`TourDeparture.departurePoint`), since different dates can plausibly leave from different cities. `lib/cms/schema.ts` validates the new shape at the same boundary as everything else (`homepageContentSchema`).

`DEFAULT_AVAILABILITY_CONFIG = { limitedSeatsThreshold: 5 }` in `lib/tours/availability.ts` — a single named, overridable value (every derivation function takes `config` as a parameter), not a magic number inline, per §10.

## 7. Selection logic

```
selectPrimaryDeparture(departures, now):
  eligible = departures.filter(isActive && departureDate >= now).sortByDateAsc()
  if eligible is empty → null
  acceptingGuests = eligible.filter(status not in {SOLD_OUT, CLOSED})
  if acceptingGuests not empty → return acceptingGuests[0]      // soonest that still sells
  soldOut = eligible.filter(status == SOLD_OUT)
  if soldOut not empty → return soldOut[0]                      // soonest honest "Hết chỗ"
  return eligible[0]                                            // everything left is CLOSED — surface it as-is

deriveDepartureAvailability(departure, now, config):
  if departure is null → CHECKING (no seats claimed)
  if departure.saleCloseAt < now → CLOSED (sale window ended overrides raw status)
  if departure.availabilityStatus is null → CHECKING (never guess)
  status = departure.availabilityStatus
  if status == AVAILABLE and availableSeats is a real number <= config.limitedSeatsThreshold → LIMITED
  return { status, label, availableSeats: departure.availableSeats, isUrgent: status == LIMITED }
```

`mapAvailabilityToCTA` and `buildTourCardViewModel` — see §4 and `lib/tours/availability.ts`.

## 8. Urgency ethics

- No "chỉ còn 1 chỗ" without a real `availableSeats` number behind it.
- No countdown, no fabricated view/booking counters.
- LIMITED only fires two ways, both real: (a) `availableSeats` is a real number at/under `limitedSeatsThreshold`, or (b) the backend/CMS set `availabilityStatus: 'LIMITED'` directly. Never inferred from anything else.
- A departure with `availabilityStatus: null` (unconfirmed data) is CHECKING, not AVAILABLE-by-default and not LIMITED-by-default — an honest "we don't know yet," matching §10's explicit prohibition on inventing urgency from missing data.
- Demonstrated live in the Homepage demo data: Korea's departure is raw `AVAILABLE` with `availableSeats: 3` and is *derived* into LIMITED by the seat count, not hand-set to LIMITED in the seed — proving the rule is real logic, not a label some content editor typed in.

## 9. Test cases

`lib/tours/availability.test.ts`, run with `npx tsx --test lib/tours/availability.test.ts` (Node's built-in `node:test` + `node:assert/strict` — no new test-framework dependency added). **14/14 passing.**

| # | Case | Covered by |
|---|---|---|
| 1 | AVAILABLE → Còn chỗ → Khám phá tour | ✓ |
| 2 | LIMITED → Sắp đủ chỗ → Giữ chỗ tư vấn | ✓ (2 tests: seat-threshold promotion + explicit backend LIMITED) |
| 3 | CHECKING → Đang kiểm tra chỗ → Kiểm tra chỗ | ✓ |
| 4 | SOLD_OUT → Hết chỗ → Xem lịch khác | ✓ |
| 5 | CLOSED → Ngừng nhận khách → Xem tour tương tự | ✓ (2 tests: explicit CLOSED + sale-window-passed override) |
| 6 | departure quá khứ bị bỏ qua | ✓ (+ inactive-departure variant) |
| 7 | chọn đúng ngày gần nhất | ✓ (2 tests: prefers soonest-that-sells over closer sold-out; falls back to soonest sold-out when nothing sells) |
| 8 | thiếu availability data → CHECKING | ✓ |
| 9 | không render badge sai khi tour không có departure | ✓ (`departures: []` — no throw, resolves CHECKING) |
| 10 | Tour Card Homepage không làm hỏng component dùng ở trang khác | Verified structurally (§10 below), not a unit test — see reasoning |

Test #10 isn't a pure-function unit test because it's a claim about code isolation, not logic: `components/site/tour-card.tsx` (the `/tours` listing card) and its `Tour` type (`lib/site-data.ts`) were **never touched** — confirmed by `git diff` scope and by `next build` still generating `/tours` and `/tour/[slug]` (Tour Detail) successfully with zero type errors.

## 10. Danh sách file sửa

**Thêm mới:**
```
types/tour-availability.ts
lib/tours/availability.ts
lib/tours/availability.test.ts
components/homepage/availability-badge.tsx
```

**Sửa:**
```
types/homepage.ts                     (JourneyContent: availability/nextDeparture/departure -> departures[])
lib/cms/schema.ts                     (journeyContentSchema updated; new tourDepartureSchema)
lib/cms/content/homepage.seed.ts      (6 journeys converted to departures[], one per status demonstrated)
components/homepage/journey-card.tsx  (consumes TourCardViewModel; renders AvailabilityBadge + status-driven CTA)
components/homepage/featured-journeys-grid.tsx  (builds view models via buildTourCardViewModel, filters on vm.tour.category)
components/seo/json-ld.tsx            (HomepageJsonLd's Offer.availability now derived, mapped to schema.org enum)
app/globals.css                       (5 new/reused semantic badge tokens)
```

**Không đụng tới (đúng phạm vi cấm):** `components/site/tour-card.tsx`, `lib/site-data.ts`, `components/site/tour-detail/*`, `lib/tours/tour-detail-content.ts`, `lib/ai/match-engine.ts`, `types/cms.ts`'s `AvailabilityStatus`, CMS Admin, Database, Booking Engine, Payment, CRM.

## 11. Việc cần làm ở Backend/CMS sprint sau

1. Real `TourDeparture` records from a booking/inventory system, replacing `lib/cms/content/homepage.seed.ts`'s mock array — `types/tour-availability.ts` is the contract to satisfy; the resolution functions in `lib/tours/availability.ts` don't need to change if the shape is honored.
2. `LIMITED`'s CTA (`prefill-inquiry`, `?departure={id}`) currently just appends a query param to the tour detail link — Tour Detail doesn't read it yet (out of scope here). A future sprint should have that page pick it up to actually prefill the inquiry form.
3. `SOLD_OUT`'s CTA links to `{href}#departures` — Tour Detail doesn't have a `#departures` anchor/section yet. Harmless today (scrolls to top), becomes fully functional once that page has a departures list.
4. `CHECKING`'s CTA reuses the Homepage's own `#lead-form` anchor (Sprint UI-03) rather than a dedicated "check availability" modal the brief offered as an alternative — revisit if product wants a lighter-weight, non-navigating check.
5. Config (`limitedSeatsThreshold: 5`) lives in code (`DEFAULT_AVAILABILITY_CONFIG`) since there's no settings system yet — move to CMS/admin-configurable settings when one exists, per §10's own instruction.
