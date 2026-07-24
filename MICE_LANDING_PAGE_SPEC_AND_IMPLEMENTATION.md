# SEO + Conversion MICE Landing Page

**Route:** `/mice` (replaces the previous, much shorter `/mice` page)
**Purpose:** explain MICE for SEO, establish Minh Việt as a design-and-operate partner (not just a venue/tour seller), and lead a convinced visitor into the shared consultation form — in that order.

---

## 1. Research summary from the reference page

Read `suoitien.vn/mice-la-gi` for **information architecture only** (no content, wording, images, numbers, or layout copied — verified by construction, since every sentence below was written fresh for Minh Việt's own positioning). The reference's structure: hero → definition/concept (bulleted) → benefits → 4 MICE types (each with overview + sub-categories + image) → 6-step implementation process → provider capability/differentiators → CTA. Overall pattern: **problem-solution, education → breakdown → process → provider recommendation**.

## 2. Điểm được kế thừa về cấu trúc

- The definition-first ordering (explain MICE before selling it).
- Presenting the 4 MICE types as parallel, image-backed cards rather than one paragraph each.
- A numbered, sequential implementation process as its own section.
- A dedicated provider-capability section right before the final CTA.

## 3. Điểm Minh Việt triển khai khác biệt

- **Objectives-first, not types-first**: a whole section (§VII) asks "what does the business want to achieve" *before* the 4 solution types, so the page reads as consultative rather than catalog-first — this section has no equivalent on the reference page.
- **Benefits are segmented by stakeholder value** (Con người / Kinh doanh / Thương hiệu / Vận hành), not a flat bullet list.
- **A CMS-ready typed content model** (`types/mice.ts` + `lib/mice/`) instead of hard-coded prose — every entity (solution, objective, program idea, case study, FAQ, media item) has the same editorial contract, ready for a real CMS swap.
- **Explicit anti-fabrication guardrails**: no invented attendee-count minimums, no named clients without clearance, no video embed until real footage exists (shows an honest "Video đang được cập nhật" state instead), and the pre-existing but unverified "300+ chương trình MICE" figure is deliberately *not* reused here (see §15).
- **Customizable components as grouped chips** (Travel / Event Production / Experience / Media / Operations), not a flat 26-icon grid.

## 4. Business goal

The page must let a visitor answer, within 5–10 seconds of landing: *"Minh Việt không chỉ cung cấp địa điểm hay tour — Minh Việt thiết kế và vận hành toàn bộ trải nghiệm doanh nghiệp."* Content is organized to answer, in order: what MICE is → who it fits → what it achieves → what Minh Việt can design → how the process works → what info is needed → why one coordinating point of contact → how to request it.

## 5. Information architecture

13 sections, one component per section, assembled in `app/mice/page.tsx`:

1. `MiceHero` — breadcrumb (Trang chủ → Sự kiện & MICE → MICE), headline, 2 CTAs
2. `MiceDefinitionSection` — "MICE là gì?", 4 compact terminology blocks
3. `MiceObjectivesSection` — 10 business objectives, each optionally linking to a related solution
4. `MiceSolutionsSection` — the 4 MICE types in full depth (objective, audience fit, applications, typical components, CTA)
5. `MiceBenefitsSection` — 4 stakeholder-value categories
6. `MiceProcessSection` — 6-step process, each with named outputs
7. `MiceComponentsSection` — 26 customizable components in 5 grouped chip blocks
8. `MiceProgramIdeasSection` — 6 illustrative sample programs + disclaimer
9. `MiceCaseStudySection` — 1 anonymized project story
10. `MiceMediaSection` — "Cảm xúc sau mỗi chương trình" gallery with honest no-video-yet state
11. `MiceCapabilitySection` — 9 operating-capability points + reused verified stats
12. `RelatedLinks` (inline in `page.tsx`) — internal links row
13. `MiceFaqSection` — 10-question accordion
14. `MiceFinalCta` + `MiceConsultationForm` — closing CTA and the reused form

## 6. CTA funnel

- Homepage's `enterpriseMice.cta` ("Yêu cầu thiết kế chương trình") now points to `/mice` instead of `/contact?intent=corporate` — `lib/cms/content/homepage.seed.ts:142`. This was the only CTA the brief asked to redirect; the Hero's own "Thiết kế chương trình riêng" (already routed to `/tour-thiet-ke` in a prior task) was left untouched.
- On `/mice`: primary CTA "Thiết kế chương trình MICE" (hero) and every "Yêu cầu tư vấn"/"Xem ý tưởng" card CTA anchor to `#mice-form`. Secondary CTA "Khám phá quy trình" anchors to `#quy-trinh-mice`. Final CTA: "Gửi yêu cầu MICE" (anchors to the form) + "Liên hệ chuyên gia" (`tel:`).
- No page navigation mid-funnel, no second form.

## 7. Component architecture

```
components/mice/
  mice-hero.tsx
  mice-definition-section.tsx
  mice-objectives-section.tsx
  mice-solutions-section.tsx
  mice-benefits-section.tsx
  mice-process-section.tsx
  mice-components-section.tsx
  mice-program-ideas-section.tsx
  mice-case-study-section.tsx
  mice-media-section.tsx           ('use client' — Play/coming-soon state)
  mice-capability-section.tsx
  mice-faq-section.tsx
  mice-final-cta.tsx
  mice-consultation-form.tsx
```

All reuse existing primitives (`SectionHeader`, `Reveal`, `MVButton`, `VerifiedStat`, `Accordion`) — no new dependency. Every section is a Server Component except `MiceMediaSection` (needs local click state) and the reused `ConsultationTabs` tree.

## 8. CMS-ready content model

`types/mice.ts` defines `MiceContentEntity` (the shared baseline: id, slug, title, subtitle, excerpt, content, coverImage, coverImageAlt, gallery, category, order, isActive, locale, seoTitle, metaDescription, ogImage, createdAt, updatedAt) plus 5 entities that extend it: `MiceSolution`, `MiceObjective`, `MiceProgramIdea`, `MiceCaseStudy`, `MiceFAQ`, `MiceMediaItem` — matching brief §XVIII exactly.

`lib/mice/mice-data.ts` is the mock repository (all content, written fresh — see §1/§3). `lib/mice/mice-repository.ts` exports `getMiceLandingContent()` — a `cache()`-wrapped async function mirroring `lib/cms/client.ts`'s `getHomepageContent()` seam. **A real CMS migration only needs to replace this one function's body**; no section component talks to the data file directly.

No zod validation schema was added for this content (unlike `lib/cms/schema.ts` for the homepage) — the TypeScript interfaces are the contract for now; adding a matching zod schema is straightforward follow-up work, not done here to keep scope bounded (see §15).

No database migration was created (not requested, per brief §XVIII).

## 9. SEO plan

- Title: "MICE là gì? Giải pháp tổ chức MICE trọn gói | Minh Việt Travel"
- Description: matches the brief exactly
- `alternates.canonical`: `/mice`
- OpenGraph title/description/url/locale/image set
- Exactly one `<h1>` (verified programmatically); `<h2>` per `SectionHeader`; `<h3>` for card titles
- Breadcrumb: Trang chủ → Sự kiện & MICE → MICE (in `MiceHero`)
- Internal links verified present: `/tour-thiet-ke`, `/hotels`, `/cruises`, `/contact`, `/about` (via the `RelatedLinks` row), plus solution-anchor links from the Objectives section (`#meeting`, `#incentive`, `#conference`, `#event`)
- No `Product` schema (no price, no direct purchase) — correctly omitted per brief §XIX
- **No `FAQPage`/`Article`/`Service` JSON-LD added** — brief §XVI/§XIX explicitly says only add it "khi phù hợp với kiến trúc SEO hiện tại"; this app has no existing JSON-LD generation pattern for landing pages to plug into yet (the homepage's `HomepageJsonLd` is homepage-specific). FAQ content is stored as plain `{question, answer}` strings specifically so schema can be layered on later without a data reshape.

## 10. Form integration

**Reuses the exact same `ConsultationTabs` → `LeadForm` → `useLeadForm` → `submitLeadAction` path** the Homepage and `/tour-thiet-ke` already use — no parallel form. Additive-only extensions (none change any other page's rendered output):

- `LeadForm` gained `audienceType` (new hidden field) and `showEventDetails` (boolean; renders 4 extra **optional** inputs — Số lượng khách dự kiến, Thời gian dự kiến, Địa điểm dự kiến, Ngân sách dự kiến — under a "Thông tin bổ sung (không bắt buộc)" group, satisfying brief §XVII's "không bắt buộc tất cả trường, có thể chia bắt buộc/bổ sung" without touching the Homepage's or `/tour-thiet-ke`'s form, since both leave `showEventDetails` unset).
- `submitLeadAction` reads `audienceType`, `eventGuestCount`, `eventDate`, `eventLocation`, `eventBudget` from `FormData` (all optional, all `undefined` when absent) and includes them in the CRM payload.
- `/mice`'s form (`MiceConsultationForm`) sets: `defaultTab="organization"`, `source="MICE_LANDING"`, `landingIntent="MICE_DESIGN"`, `serviceType="MICE"`, `audienceType="ORGANIZATION"`, `defaultServiceInterest="mice"` (reuses the Homepage's existing `coreServices` "MICE & Sự kiện" option rather than adding a duplicate).
- Confirmed end-to-end via Playwright: on load, the organization tab is active, the "Nhu cầu quan tâm" select value is `mice`, and all 5 hidden fields (`intent=corporate`, `source=MICE_LANDING`, `landingIntent=MICE_DESIGN`, `serviceType=MICE`, `audienceType=ORGANIZATION`) are present in the submitted `FormData`.
- **Known pre-existing limitation, not introduced here** (documented previously in `CUSTOM_TOUR_LANDING_PAGE.md`): the shared `Select`/`SelectValue` component shows the raw option value, not its label, before interaction — affects the Homepage's own form too. Submitted value is correct regardless.

## 11. Performance

- `next/image` throughout; only the hero background has `priority`.
- No video element anywhere — the "Cảm xúc sau mỗi chương trình" tiles are static cover images with a Play button; clicking reveals a text state, never fetches or embeds video. No `preload`, no autoplay.
- `sizes` set per image based on actual rendered column width at each breakpoint.
- No new npm dependency.

## 12. Accessibility

- Single `<h1>`; sequential `<h2>`/`<h3>` (verified via DOM query, count = 1).
- FAQ and consultation tabs both use existing Base UI primitives (`Accordion`, `Tabs`) — keyboard-operable and correctly `aria`-wired out of the box.
- All images carry descriptive `alt` text (verified: 0 images missing `alt` on the rendered page).
- Media section's Play button has `aria-label="Xem video: {title}"`.
- Respects `prefers-reduced-motion` via the same `Reveal` component already audited as motion-safe elsewhere in the app.
- **Inherits** the mega-menu keyboard-inaccessibility finding already on record in `HOMEPAGE_UI_AUDIT_100.md` (P0, header is shared and unchanged by this task — out of scope here).

## 13. Social/Customer Voice integration status

Per brief §XX: **not built**. No shared Social Sharing or Customer Voice component exists yet in this codebase (checked — no `components/shared/social-sharing*` or `components/shared/customer-voice*`), so nothing was integrated, and nothing was scaffolded from scratch (brief explicitly says only integrate if shared components already exist). Placeholder contract for future work:

- **Social Sharing**: a `<SocialShareBar links={{facebook, zalo, telegram, x}} onCopyLink />` slot would sit naturally directly under `MiceHero` or above `MiceFaqSection` — no SDK, just `share`-intent URLs + a copy-to-clipboard button.
- **Customer Voice**: a `<CustomerVoicePanel entityId="mice-landing" />` slot would sit between `MiceCaseStudySection` and `MiceMediaSection` — needs a review/comment backend that doesn't exist yet; out of scope per brief.

## 14. Files changed

New:
- `types/mice.ts`
- `lib/mice/mice-data.ts`, `lib/mice/mice-repository.ts`
- `components/mice/*.tsx` (14 files, listed in §7)
- `artifacts/mice-landing/*.png` (screenshots)
- `MICE_LANDING_PAGE_SPEC_AND_IMPLEMENTATION.md` (this file)

Modified:
- `app/mice/page.tsx` — fully replaced (previous 4-section page → new 13-section landing page)
- `lib/cms/content/homepage.seed.ts` — `enterpriseMice.cta.href` → `/mice`
- `components/homepage/lead-form.tsx` — additive `audienceType`, `showEventDetails` props
- `components/homepage/consultation-forms.tsx`, `components/homepage/consultation-tabs.tsx` — thread the same additive props through
- `lib/actions/lead-action.ts` — reads 5 additional optional `FormData` fields into the CRM payload

Not touched: `lib/site-data.ts`'s now-unused `enterpriseSolutions`/`miceClientSegments` exports were left in place (only `app/mice/page.tsx` imported them; removing unused exports elsewhere was out of scope).

## 15. Remaining backend/CMS tasks

- **"300+ chương trình MICE" needs verification.** This figure (`homepageContentSeed.enterpriseMice.proofStat`) is used on the Homepage and cited only by an internal ops report with no external audit trail. Per this task's explicit instruction, it was **not** propagated to `/mice` — the Capability section here cites only the 15+ years and 5.000+ doanh nghiệp figures (both already used identically on the Homepage). Recommend verifying the 300+ figure's source before it appears on any additional page.
- No CMS UI exists yet for the `mice-data.ts` content — a real migration replaces `getMiceLandingContent()`'s body only.
- No zod validation layer for `MiceLandingContent` (see §8) — straightforward to add, mirroring `lib/cms/schema.ts`.
- FAQ/Service/Article JSON-LD not wired (see §9) — needs an SEO architecture decision first.
- Social Sharing / Customer Voice not integrated (see §13) — needs those shared components built first.
- Case study is anonymized by design (no real, cleared case study data exists) — swap in a named project once legal/client clearance exists.
- No real MICE aftermovie footage exists — `MiceMediaSection` correctly shows a "Video đang được cập nhật" state; swap in real `videoSrc` values on `MiceMediaItem` once footage is ready.

## 16. Acceptance test results

| # | Criterion | Result |
|---|---|---|
| 1 | Homepage MICE CTA → `/mice` | ✅ verified (`href` = `/mice`) |
| 2 | SEO content + conversion funnel both present | ✅ 13 sections, content before form |
| 3 | "MICE là gì" section | ✅ `MiceDefinitionSection` |
| 4 | 4 loại hình/nhóm giải pháp | ✅ `MiceSolutionsSection` (Meeting/Incentive/Conference/Event) |
| 5 | Lợi ích doanh nghiệp | ✅ `MiceBenefitsSection` (4 categories) |
| 6 | Quy trình 6 bước | ✅ `MiceProcessSection` |
| 7 | Ý tưởng chương trình | ✅ `MiceProgramIdeasSection` (6 ideas) |
| 8 | Năng lực vận hành | ✅ `MiceCapabilitySection` |
| 9 | FAQ | ✅ `MiceFaqSection` (10 questions) |
| 10 | Form prefill đúng MICE | ✅ verified end-to-end (§10) |
| 11 | Không sao chép nội dung Suối Tiên | ✅ structure-only research (§1), all copy original |
| 12 | Không dùng số liệu/khách hàng giả | ✅ case study anonymized, no fabricated results; unverified 300+ stat excluded (§15) |
| 13 | Hình ảnh thật | ✅ existing project photography only, no AI/stock placeholders |
| 14 | Responsive hoàn chỉnh | ✅ 1440/768/390 tested, no horizontal overflow at any width |
| 15 | SEO metadata đầy đủ | ✅ §9 |
| 16 | lint, typecheck, build pass | ✅ all three clean |
| 17 | Không ảnh hưởng Homepage ngoài CTA route | ✅ all form/lead-form changes are additive/optional, unused by existing call sites |

One real bug found and fixed during QA: the hero's breadcrumb was rendering fully hidden behind the fixed header (`clearance` was negative) at the original `pt-28`/`pt-40` padding — increased to `pt-36`/`sm:pt-48`/`lg:pt-56` and reverified with a visible ~20–40px gap at all 3 breakpoints.

---

## Verification

- `pnpm exec tsc --noEmit` — pass
- `pnpm lint` — pass
- `pnpm build` — pass; `/mice` prerenders as a static route
- No test runner configured in this repo; the one existing test file (`lib/tours/availability.test.ts`) is unrelated and untouched
- Manual Playwright QA at 1440×1000, 768×1024, 390×844: no console errors introduced, no horizontal overflow, form prefill and the media "coming soon" interaction both verified working
