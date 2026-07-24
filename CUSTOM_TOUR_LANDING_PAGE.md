# "Thiết kế chương trình riêng" Landing Page

**Route:** `/tour-thiet-ke`
**Purpose:** conversion landing page the Homepage Hero's "Thiết kế chương trình riêng" CTA now points to, instead of opening the consultation form directly — content-first, form last.

---

## 1. Business goal

The page has to convince a visitor — before they ever see a form — that Minh Việt:

- doesn't just sell ready-made tours; it **designs** journeys,
- builds every program around **mục tiêu, ngân sách, số lượng khách, thời gian, đối tượng, yêu cầu đặc biệt**,
- can run the whole thing **trọn gói, từ ý tưởng đến vận hành**,
- and that the only thing the visitor has to do is describe what they need.

It targets 10 audience types (doanh nghiệp, cơ quan/tổ chức, gia đình, nhóm bạn, đoàn khách riêng, trường học, hiệp hội, khách VIP, FDI, đoàn MICE/hội nghị) — reflected directly in `AudienceSection`'s 7 visual groups (FDI and MICE/hội nghị audiences are folded into "Doanh nghiệp" / "Cơ quan / Tổ chức" rather than given redundant duplicate cards).

## 2. Page structure

Implemented in the exact order specified, one section = one component, assembled in `app/tour-thiet-ke/page.tsx`:

1. `CustomTourHero` — emotional hero
2. `AudienceSection` — "Thiết kế cho ai"
3. `ProgramTypesSection` — 12 program types
4. `ProcessSection` — 6-step process (`id="quy-trinh"`, the Hero's secondary CTA target)
5. `CustomizationSection` — 17 customizable elements, grouped into 3 visual chip blocks
6. `InspirationProgramsSection` — 6 sample itineraries
7. `CapabilitySection` — organizational capability + reused verified stats
8. `CaseStudyGallery` — real-photo gallery
9. `CustomTourFAQ` — 9-question accordion
10. `CustomTourFinalCta` — closing headline + 2 CTAs
11. `CustomTourConsultationForm` — the reused form (`id="custom-tour-form"`, every CTA above scrolls here)

## 3. Component architecture

All new components live in `components/custom-tour/` (flat, one file per section — no sub-splitting):

```
components/custom-tour/
  custom-tour-hero.tsx
  audience-section.tsx
  program-types-section.tsx
  process-section.tsx
  customization-section.tsx
  inspiration-programs-section.tsx
  capability-section.tsx
  case-study-gallery.tsx
  custom-tour-faq.tsx
  custom-tour-final-cta.tsx
  custom-tour-consultation-form.tsx
```

Every component reuses existing primitives — `SectionHeader`/`Reveal` (`components/mv/section.tsx`), `MVButton`, `VerifiedStat`, `Accordion` (`components/ui/accordion.tsx`) — the same set `/mice` and the homepage already use. No new dependency was added.

`CapabilitySection` and `CustomTourConsultationForm` are `async` Server Components (they call `getHomepageContent()`); everything else is a static Server Component. The only Client Component on the page is the reused `ConsultationTabs` tree (unchanged interactivity).

## 4. Content model

No CMS entry for this page yet — copy lives as local `const` arrays inside each component (same pattern `app/mice/page.tsx` already uses for its process/solutions data). See §12 for what a CMS migration would need to pick up.

Images: **all real project photography**, no AI-generated or stock-placeholder imagery — `enterprise-mice.webp`, `editorial-mice.webp`, `brand-group.webp`, `brand-signing.webp`, `brand-flatlay.webp`, `brand-leadership.webp`, `dest-vietnam.webp`, `dest-japan.webp`, `dest-thailand.webp`, `tour-bali.webp`, and the hero drone photos (`ha-long-bay.jpg`, `sapa-terraces.jpg`, `ninh-binh.jpg`). No price is shown anywhere on the page. Sample itineraries carry the required disclaimer: *"Chương trình mẫu có thể điều chỉnh theo nhu cầu thực tế."*

Verified stats in `CapabilitySection` (15+ năm kinh nghiệm, 300+ chương trình MICE, 5.000+ doanh nghiệp) are **pulled live from the same `getHomepageContent()` the Homepage renders** (`hero.proofStat`, `enterpriseMice.proofStat`, `trustStrip.stats[0]`) — not duplicated/hardcoded, so there's exactly one source of truth and no risk of this page quietly drifting from the Homepage's cited figures.

## 5. CTA flow

- Homepage Hero primary CTA ("Thiết kế chương trình riêng") now points to `/tour-thiet-ke` instead of `/contact?intent=corporate` — `lib/cms/content/homepage.seed.ts:21`.
- Every CTA on the new page (`Bắt đầu thiết kế hành trình`, all 12 "Yêu cầu thiết kế" cards, all 6 "Xem ý tưởng chương trình" cards, the final "Gửi yêu cầu thiết kế chương trình") is a same-page anchor to `#custom-tour-form` — no page navigation, no second form.
- The Hero's secondary CTA ("Xem quy trình") anchors to `#quy-trinh`.
- The MICE hero's own CTA on the Homepage ("Yêu cầu thiết kế chương trình", still `/contact?intent=corporate`) was **left untouched** — the brief only asked to redirect the Hero's CTA, not every CTA site-wide.

## 6. Form integration

**No new form or submit path was created.** `CustomTourConsultationForm` renders the exact same `ConsultationTabs` → `LeadForm` → `useLeadForm` → `submitLeadAction` tree the Homepage already uses, with additive-only extensions:

- `ConsultationTabs` gained optional `defaultTab` (used here as `"organization"`, i.e. Doanh nghiệp/Tổ chức — matches brief §14) and `prefill` props. The Homepage's existing call site passes neither, so its behavior is unchanged.
- `LeadForm` gained optional `source`, `landingIntent`, `serviceType`, `defaultServiceInterest` props, each rendered as a hidden input only when provided.
- `submitLeadAction` (`lib/actions/lead-action.ts`) now also reads `landingIntent`/`serviceType` from the submitted `FormData` and includes them in the outbound payload — **not** by overloading the existing `intent` field (`'corporate' | 'individual'`, which is the tab/panel choice and is validated by `leadFormSchema`), since conflating the two would break that enum. The landing page instead sends:
  - `source = "CUSTOM_TOUR_LANDING"`
  - `landingIntent = "CUSTOM_DESIGN"` (the brief's `intent=CUSTOM_DESIGN`, under a name that doesn't collide with the form-panel `intent`)
  - `serviceType = "GROUP_TOUR"`
- The visible "Nhu cầu quan tâm" select is prefilled to a landing-specific option, `custom-tour-design` / "Thiết kế chương trình riêng", prepended to the normal service list.

**Known pre-existing limitation, not introduced by this change:** the shared `Select`/`SelectValue` component (`components/ui/select.tsx`) renders the raw option *value* instead of its *label* in the trigger before the user interacts with it — confirmed on the Homepage's own form too (`group-tours` shows instead of "Tour đoàn"). On this page it shows `custom-tour-design` instead of "Thiết kế chương trình riêng". The **submitted value is correct** either way; this is a cosmetic display bug in a component both pages share, out of this task's scope to fix (touching it risks the Homepage's already-shipped form).

## 7. SEO

- `title`: "Tour thiết kế trọn gói theo yêu cầu | Minh Việt Travel"
- `description`: matches the brief exactly
- `alternates.canonical`: `/tour-thiet-ke`
- `openGraph` set (title/description/url/locale/image)
- Exactly one `<h1>` (Hero only); every section header renders `<h2>` via `SectionHeader`; card titles render `<h3>`
- Internal links present: `/mice` (Case Study Gallery CTA + FAQ answer), `/tours` and `/tours?type=group` (FAQ answer)
- All images carry descriptive, non-keyword-stuffed `alt` text
- FAQ content is a flat `{question, answer, answerText}` array (`custom-tour-faq.tsx`) — `answerText` is plain text for the 2 answers that contain an inline link, so a `FAQPage` JSON-LD block can be generated later without reshaping the component. **Schema markup itself was not added** (per brief §12: don't wire it until the backend/CMS decision is ready).

## 8. Performance

- `next/image` used throughout; only the Hero background has `priority` — every other image (12 program cards, 6 inspiration cards, 5 gallery tiles) lazy-loads by default.
- No video, no autoplay, no new client-side library.
- `sizes` set per image based on its actual rendered column width at each breakpoint (matches the pattern already used by `TourCard`).

## 9. Responsive

Verified via Playwright at all 4 required widths (1440 / 1280 covered by the same `lg:` breakpoint styles, 768, 390) — full-page screenshots in `artifacts/custom-tour-landing/`:

- No horizontal overflow at any width (checked programmatically: `document.documentElement.scrollWidth` never exceeds `window.innerWidth`).
- Grids collapse cleanly: 12 program cards / 6 inspiration cards go 3→2→1 columns; the 7 audience cards go 4→2→1; the 6-step process goes 3→2 with the connecting line hidden below `lg:`.
- The mobile page is long (~22,000px) — a direct, expected consequence of single-column-stacking 31 image cards (12 program types + 6 inspiration samples + 7 audience tiles + 5 gallery tiles) exactly as the brief specified content-wise, not a rendering bug (verified: exactly one `<h1>`, 11 `<section>` elements, every section heading appears exactly once in the DOM). Worth a product conversation before Go-Live about whether Program Types/Inspiration should become a horizontal scroll-rail on mobile — out of this task's scope to decide unilaterally.

## 10. Accessibility

- Single `<h1>`, sequential `<h2>`/`<h3>`.
- FAQ uses the existing Base UI `Accordion` (keyboard-operable, correct `aria` wiring out of the box).
- Consultation form tabs reuse Base UI `Tabs` (same accessible primitive as the Homepage).
- All images have descriptive `alt`.
- Respects `prefers-reduced-motion` via the same `Reveal` component (`components/mv/reveal.tsx`) already audited as motion-safe.
- **Inherits** the mega-menu keyboard-inaccessibility finding from `HOMEPAGE_UI_AUDIT_100.md` (P0) — the header is shared (`SiteChrome`/`SiteHeader`), unchanged by this task, and out of scope here.

## 11. Files changed

New:
- `app/tour-thiet-ke/page.tsx`
- `components/custom-tour/*.tsx` (11 files, listed in §3)
- `artifacts/custom-tour-landing/*.png` (screenshots)
- `CUSTOM_TOUR_LANDING_PAGE.md` (this file)

Modified (all additive/optional changes — no existing call site's behavior changed):
- `lib/cms/content/homepage.seed.ts` — Hero `primaryCta.href` → `/tour-thiet-ke`
- `components/homepage/lead-form.tsx` — optional `source`/`landingIntent`/`serviceType`/`defaultServiceInterest` props
- `components/homepage/consultation-forms.tsx` — threads an optional `prefill` object through to `LeadForm`
- `components/homepage/consultation-tabs.tsx` — optional `defaultTab`/`prefill` props
- `lib/actions/lead-action.ts` — reads two additional optional `FormData` fields into the CRM payload

## 12. Remaining CMS/backend work

- No CMS content model exists for `/tour-thiet-ke` yet — all copy is local `const` data in the component files, same stopgap pattern as `/mice`. A future CMS migration should give this its own typed content seam (mirroring `lib/cms/content/homepage.seed.ts` + `types/homepage.ts`).
- FAQ content is schema-ready (`answerText` plain-text field) but `FAQPage` JSON-LD is **not wired** — needs a decision on where structured data is generated (page-level `generateMetadata`/JSON-LD script) before adding it.
- Case Study Gallery captions are intentionally generic ("Gala dinner doanh nghiệp", etc.) — no client names/logos are shown since none are cleared for publication; swap in real case studies once approved.
- The `Select`/`SelectValue` "shows raw value, not label" bug (§6) affects both this page and the Homepage — worth its own small, isolated fix in `components/ui/select.tsx` rather than folding into this task.
- `submitLeadAction`'s CRM webhook target (`LEADS_WEBHOOK_URL`) is still unconfigured in this environment (pre-existing, unrelated to this task) — leads including the new `landingIntent`/`serviceType` tags are logged server-side only until it's set.

---

## Verification

- `pnpm exec tsc --noEmit` — pass, no errors
- `pnpm lint` — pass, no errors/warnings
- `pnpm build` — pass; `/tour-thiet-ke` prerenders as a static route
- No test runner is configured in this repo (no `test` script in `package.json`); the one existing test file (`lib/tours/availability.test.ts`) is unrelated to this change and wasn't touched
- Manual QA via Playwright at 1440×1000, 768×1024, 390×844: no console errors, no horizontal overflow, form prefill confirmed end-to-end (tab defaults to Doanh nghiệp/Tổ chức, "Nhu cầu quan tâm" submits `custom-tour-design`)
