# SOCIAL SHARING AND CUSTOMER VOICE ARCHITECTURE
### Platform-wide technical specification — Social Sharing Hub + Customer Voice & Community

**Status: SPEC ONLY.** No migration, no UI, no Homepage change in this task. This document exists to be reviewed and revised before any implementation sprint starts.

**Scope of applicability** (per brief): Tour thiết kế mẫu, Tour ghép, Khách sạn/Resort/Homestay, Du thuyền, Vé vui chơi, Bài viết, Video, Điểm đến, MICE case study, Travel Inspiration Hub — 10 content surfaces, unified by `entityType`/`entityId`.

---

## 0. Grounding in the current codebase (why this spec looks the way it does)

Read before anything else — the design choices below are deliberately continuations of patterns already live in this repo, not invented conventions:

- **Status enums are `UPPER_SNAKE_CASE` string unions**, not numeric or lowercase — matches `TourAvailabilityStatus` (`types/tour-availability.ts`) and `InspirationContentStatus` (`types/inspiration.ts`). This spec's `ModerationStatus` follows the same shape.
- **"Derive, never fabricate."** `lib/tours/availability.ts`'s `deriveDepartureAvailability()` falls back to `CHECKING` rather than guessing a status from missing data. `VerifiedStat` (`types/cms.ts`) requires a `source`/`asOf` pair on every number shown as proof. This is the same ethic behind §9's "no fake review generation" and §10's SEO rule that only approved + verified reviews may feed `aggregateRating`.
- **Content fetch pattern**: `'server-only'` + `react.cache()` wrapping a `zodSchema.parse(raw)` call (`lib/cms/client.ts`). New read endpoints in this spec follow the same shape.
- **User-submission pattern**: `'use server'` action + `zod.safeParse` + discriminated-union `ActionState` (`idle|error|success`) + `useActionState` hook, exactly like `lib/actions/lead-action.ts` / `hooks/use-lead-form.ts`. Review/comment submission actions reuse this shape verbatim.
- **Reality check on routing** (this materially affects the phased plan in §13): today, only **Tour Detail** (`app/tour/[slug]/page.tsx`) is a real per-entity page with `generateMetadata`. Hotels/cruises/tickets/MICE are single static list pages with **no `[slug]` detail route**. `/destinations/*` and `/brand/news/*` are hrefs referenced in seed data but have **no corresponding route** in `app/`. This means Social Sharing + Customer Voice cannot go live on most entity types until their detail pages exist — flagged explicitly as a blocking dependency per entity type in §13, not glossed over.
- **`JourneyContent.reviewScore`/`.reviewCount`** (`types/homepage.ts`, rendered in `journey-card.tsx`) are today two free-standing optional numbers with no source. Once `CustomerReview` ships, these two fields become **computed aggregates** (`AVG(rating)`, `COUNT(*)` over `status='APPROVED'` reviews for that tour) instead of CMS-editable numbers — see §2.4.

---

## 1. Business rules

### 1.1 Social Sharing
1. Every shareable entity gets exactly one canonical, share-safe URL and one Open Graph image — sharing never happens against a URL that doesn't resolve to a real page (see routing reality above).
2. A **card** (grid/list context — tour card, article card, inspiration card) shows exactly **one small share affordance**: an icon button that opens a compact channel picker. It never shows 5 separate channel icons inline on a card.
3. A **detail page** shows a **full share sheet**: all 5 channels + copy-link, each with a visible label, not icon-only.
4. No social SDK script (Facebook JS SDK, Zalo SDK, Twitter widgets.js) is ever loaded. Every channel is a plain "share-intent" URL opened in a new tab/window — see §7.2.
5. Sharing never requires the visitor to be logged in.
6. Copy-link always copies the canonical URL (never a URL with tracking-polluted query params visible to the user; UTM params, if used for internal attribution, are appended server-side to the *shared* link only when the channel is a direct-open URL, not shown in the visible "copy link" text field).

### 1.2 Customer Voice
7. **Review ≠ Comment.** A star rating can only be attached to a `CustomerReview`. A `CommunityComment` never carries a rating field — this is a hard schema-level separation (§3), not just a UI convention, so no future feature can accidentally average a comment into a rating.
8. A review's "verified experience" badge is only ever set by the system reconciling `linkedBookingId` against a real completed booking record — never by the reviewer's self-declaration and never by a moderator overriding it by hand outside that reconciliation.
9. `reviewScore`/`reviewCount` shown anywhere on the platform are always a live aggregate over `CustomerReview` rows where `moderationStatus = 'APPROVED'`. Nothing hand-types a rating number into content again after this ships (§2.4 migration note).
10. A `CommunityComment` marked as a question (`isQuestion: true`) is surfaced in a dedicated CMS "Questions awaiting reply" queue until either a staff member replies (`isOfficialReply: true`) or a moderator explicitly dismisses it — it does not silently age out.
11. Only one level of threading: a comment can have replies, but a reply cannot itself be replied to (matches the brief's "threaded reply" singular, keeps moderation and UI complexity bounded — see §7.3 for the UI consequence).
12. Reporting abuse never requires an account; it does require passing the same rate limit as posting (§9).
13. Nothing in this system generates, seeds, or synthesizes a review or comment. Every record in Phase 1+ traces to a real submitting party. (Demo/staging environments get realistic-looking but clearly-labeled fixture data, never mixed into production tables.)

---

## 2. Entity model

### 2.1 Polymorphic relation

Both `CustomerReview` and `CommunityComment` (and `ShareEvent`, for consistency) attach to content via a pair of columns rather than a foreign key per content table:

```
entityType: EntityType   (discriminant)
entityId:   string       (the referenced content's own primary key/slug, opaque to this module)
```

This is deliberate: Social Sharing and Customer Voice must not take a hard foreign-key dependency on 10 different content tables that live in different parts of the system (some in a future CMS, `TOUR`/`INSPIRATION` already partially modeled in this repo). `entityId` is validated for *shape* (non-empty string) at the API boundary, not for *existence* against another table — existence is the calling page's responsibility (it already loaded the entity to render the page).

### 2.2 `EntityType` enum

```ts
type EntityType =
  | 'TOUR'              // tour thiết kế mẫu + tour ghép — same entity type, distinguished by the tour's own `type` field, not a separate EntityType
  | 'HOTEL'
  | 'RESORT'
  | 'HOMESTAY'
  | 'CRUISE'
  | 'ATTRACTION'         // vé vui chơi
  | 'ARTICLE'             // bài viết
  | 'VIDEO'
  | 'DESTINATION'
  | 'MICE_CASE_STUDY'
  | 'INSPIRATION'         // Travel Inspiration Hub items (types/inspiration.ts's TravelInspirationItem)
```

`TOUR` deliberately covers both "tour thiết kế mẫu" and "tour ghép" from the brief — they're the same underlying content shape (a bookable itinerary), differing only in a `tourMode: 'CUSTOM' | 'GROUP'`-style field that belongs to the tour catalog itself, not to this module. Splitting them into two `EntityType` values would let the exact same tour accidentally accumulate reviews under two different buckets if its mode is ever reclassified.

### 2.3 Entity → canonical URL / OG mapping (current reality, not aspirational)

| EntityType | Canonical detail route | Status today |
|---|---|---|
| TOUR | `/tour/{slug}` | **Exists** — `app/tour/[slug]/page.tsx`, has `generateMetadata` |
| HOTEL | `/hotels/{slug}` | **Does not exist** — `/hotels` is a static list page only |
| RESORT | `/hotels/{slug}` (resorts modeled as a hotel subtype) | **Does not exist** |
| HOMESTAY | `/hotels/{slug}` (homestay subtype) | **Does not exist** |
| CRUISE | `/cruises/{slug}` | **Does not exist** — list page only |
| ATTRACTION | `/tickets/{slug}` | **Does not exist** — list page only |
| ARTICLE | `/brand/news/{slug}` | **Does not exist** — href referenced in seed data, no route |
| VIDEO | `/brand/news/{slug}` or a dedicated `/videos/{slug}` (TBD — depends on whether video gets its own listing or lives inside Articles) | **Does not exist** |
| DESTINATION | `/destinations/{slug}` | **Does not exist** — href referenced in seed data, no route |
| MICE_CASE_STUDY | `/mice/case-studies/{slug}` | **Does not exist** — `/mice` is a static page |
| INSPIRATION | `/inspiration/{slug}` (new) | **Does not exist** — items currently link *out* to other pages via `ctaUrl`, have no detail page of their own |

**Consequence:** Phase 1 of this module can only ship end-to-end (share + review + comment, with a real canonical URL and OG image) for `TOUR`. Every other `EntityType` needs its detail route built first — this is the actual gating factor for the phased plan (§13), not a Social-Sharing-module limitation.

### 2.4 Migration note: `reviewScore`/`reviewCount`

`types/homepage.ts`'s `JourneyContent.reviewScore?`/`.reviewCount?` and their rendering in `journey-card.tsx` stay exactly as-is through this spec (no Homepage change, per the task constraint). When `CustomerReview` ships for `EntityType: 'TOUR'`:

- A read model (`getEntityReviewSummary(entityType, entityId)`) computes `{ averageRating, reviewCount }` live from `APPROVED` reviews.
- A future (separate, out-of-scope-here) Homepage sprint swaps `journey.reviewScore`/`journey.reviewCount` for this computed summary, the same way `nextDeparture`/`availability` were swapped for `TourDeparture[]` + `buildTourCardViewModel()` in the tour-availability sprint.
- Until that swap happens, the two systems simply coexist unaware of each other — no shared table, no join, no risk of the old field silently changing meaning underneath existing pages.

---

## 3. TypeScript interfaces

Everything below is additive — new files, no edits to `types/homepage.ts`, `types/cms.ts`, `types/tour-availability.ts`, or `types/inspiration.ts`.

### 3.1 `types/social-sharing.ts`

```ts
export type ShareChannel = 'facebook' | 'zalo' | 'telegram' | 'x' | 'copy_link'

export interface ShareTarget {
  entityType: EntityType
  entityId: string
  /** Canonical, absolute URL — never a URL carrying visible tracking params. */
  url: string
  title: string
  /** Used as share-intent prefill text where the channel supports it (Telegram, X). Not used by Facebook/Zalo, which read Open Graph tags from `url` instead. */
  shareText?: string
}

export interface ShareEvent {
  id: string
  entityType: EntityType
  entityId: string
  channel: ShareChannel
  /** 'card' = compact single-button context, 'detail' = full share sheet. */
  surface: 'card' | 'detail'
  /** Anonymous session identifier, never a user identity — see §9.3. */
  sessionId: string
  createdAt: string
}
```

### 3.2 `types/customer-voice.ts`

```ts
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'HIDDEN' | 'SPAM' | 'REJECTED'

export type ReviewMediaType = 'image' | 'video'

export interface ReviewMedia {
  id: string
  type: ReviewMediaType
  url: string
  /** Required for images — never an empty/placeholder alt, same rule as every other image in this codebase. */
  alt: string
  thumbnailUrl?: string
}

/**
 * A. Customer Review — rating-bearing, never mixed with CommunityComment.
 */
export interface CustomerReview {
  id: string
  entityType: EntityType
  entityId: string
  authorDisplayName: string
  /** Internal only — never rendered, never included in any API response body sent to the browser. See §9.3. */
  authorContactRef: { userId: string | null; emailHash: string }
  rating: 1 | 2 | 3 | 4 | 5
  title: string
  content: string
  media: ReviewMedia[]
  /** True only when reconciled against `linkedBookingId` — see business rule #8. Never settable directly via the submission API. */
  verifiedExperience: boolean
  linkedBookingId: string | null
  travelDate: string | null
  moderationStatus: ModerationStatus
  /** Set by a CMS moderator action ("Feature review", §6). Featured reviews are eligible for homepage/detail-page highlight placement; independent of verifiedExperience. */
  featured: boolean
  moderatedBy: string | null
  moderatedAt: string | null
  moderationNote: string | null
  createdAt: string
  updatedAt: string
}

/**
 * B. Community Comment — no rating field, ever.
 */
export interface CommunityComment {
  id: string
  entityType: EntityType
  entityId: string
  authorDisplayName: string
  authorContactRef: { userId: string | null; emailHash: string }
  content: string
  /** Marks this as a question needing a reply, surfaced in the CMS "Questions awaiting reply" queue (business rule #10). */
  isQuestion: boolean
  /** Null for a top-level comment; set for a reply. One level deep only — a row where `parentCommentId` is itself non-null is rejected at the API boundary (business rule #11). */
  parentCommentId: string | null
  /** True when the reply/comment was authored by Minh Việt staff through the CMS reply tool, not a public submission. */
  isOfficialReply: boolean
  moderationStatus: ModerationStatus
  /** Set when a moderator locks the entity's comment section (§6) — new submissions to a locked thread are rejected at the API, existing comments stay visible. */
  locked: boolean
  moderatedBy: string | null
  moderatedAt: string | null
  moderationNote: string | null
  createdAt: string
  updatedAt: string
}

export type ReportReason = 'SPAM' | 'ABUSE' | 'OFF_TOPIC' | 'FAKE' | 'OTHER'

export interface ContentReport {
  id: string
  /** What's being reported — a review or a comment, never an entity itself. */
  targetType: 'REVIEW' | 'COMMENT'
  targetId: string
  reason: ReportReason
  note: string | null
  reporterSessionId: string
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  resolvedBy: string | null
  resolvedAt: string | null
}

export interface ModerationAuditLogEntry {
  id: string
  targetType: 'REVIEW' | 'COMMENT' | 'REPORT'
  targetId: string
  action: string // e.g. 'APPROVE' | 'HIDE' | 'MARK_SPAM' | 'REJECT' | 'FEATURE' | 'UNFEATURE' | 'LOCK_THREAD' | 'UNLOCK_THREAD' | 'MARK_VERIFIED' | 'REPLY'
  actorId: string
  actorName: string
  previousStatus: string | null
  newStatus: string | null
  note: string | null
  createdAt: string
}
```

### 3.3 Read/view models

```ts
export interface EntityReviewSummary {
  entityType: EntityType
  entityId: string
  averageRating: number | null // null, not 0, when reviewCount is 0 — never fabricate a rating
  reviewCount: number
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>
}

export interface PaginatedComments {
  items: CommunityComment[]
  nextCursor: string | null
  totalApproved: number
}
```

---

## 4. Database schema proposal

**Not implemented in this task.** Proposed as Postgres-flavored DDL (matches the rest of the platform's Supabase-oriented tooling already present in this workspace) for review, not to be applied.

```sql
-- Enums
create type moderation_status as enum ('PENDING','APPROVED','HIDDEN','SPAM','REJECTED');
create type entity_type as enum (
  'TOUR','HOTEL','RESORT','HOMESTAY','CRUISE','ATTRACTION',
  'ARTICLE','VIDEO','DESTINATION','MICE_CASE_STUDY','INSPIRATION'
);
create type share_channel as enum ('facebook','zalo','telegram','x','copy_link');
create type report_reason as enum ('SPAM','ABUSE','OFF_TOPIC','FAKE','OTHER');

-- Reviews
create table customer_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id text not null,
  author_display_name text not null,
  author_user_id uuid references auth_users(id),      -- nullable: guest reviews allowed if the business wants them; enforced at API layer, not DB
  author_email_hash text not null,                      -- sha256, never plaintext, never returned by any read API
  rating smallint not null check (rating between 1 and 5),
  title text not null,
  content text not null,
  verified_experience boolean not null default false,
  linked_booking_id uuid references bookings(id),
  travel_date date,
  moderation_status moderation_status not null default 'PENDING',
  featured boolean not null default false,
  moderated_by uuid references staff_users(id),
  moderated_at timestamptz,
  moderation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on customer_reviews (entity_type, entity_id, moderation_status);
create index on customer_reviews (moderation_status) where moderation_status = 'PENDING';

create table review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references customer_reviews(id) on delete cascade,
  type text not null check (type in ('image','video')),
  url text not null,
  alt text not null,
  thumbnail_url text,
  sort_order smallint not null default 0
);

-- Comments (self-referencing for one level of threading — see business rule #11)
create table community_comments (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id text not null,
  author_display_name text not null,
  author_user_id uuid references auth_users(id),
  author_email_hash text not null,
  content text not null,
  is_question boolean not null default false,
  parent_comment_id uuid references community_comments(id) on delete cascade,
  is_official_reply boolean not null default false,
  moderation_status moderation_status not null default 'PENDING',
  locked boolean not null default false,
  moderated_by uuid references staff_users(id),
  moderated_at timestamptz,
  moderation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint one_level_only check (
    parent_comment_id is null or
    not exists (select 1 from community_comments p where p.id = parent_comment_id and p.parent_comment_id is not null)
  )
);
create index on community_comments (entity_type, entity_id, moderation_status, created_at desc);
create index on community_comments (is_question, moderation_status) where is_question = true;

-- A lock applies per (entity_type, entity_id), not per comment — modeled as its own small table
-- rather than a boolean smeared across every comment row, so "lock this thread" is one write.
create table comment_thread_locks (
  entity_type entity_type not null,
  entity_id text not null,
  locked boolean not null default true,
  locked_by uuid references staff_users(id),
  locked_at timestamptz not null default now(),
  primary key (entity_type, entity_id)
);

-- Reports
create table content_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('REVIEW','COMMENT')),
  target_id uuid not null,
  reason report_reason not null,
  note text,
  reporter_session_id text not null,
  status text not null default 'OPEN' check (status in ('OPEN','RESOLVED','DISMISSED')),
  created_at timestamptz not null default now(),
  resolved_by uuid references staff_users(id),
  resolved_at timestamptz
);
create index on content_reports (status) where status = 'OPEN';

-- Moderation audit log — append-only, never updated/deleted
create table moderation_audit_log (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('REVIEW','COMMENT','REPORT')),
  target_id uuid not null,
  action text not null,
  actor_id uuid not null references staff_users(id),
  previous_status text,
  new_status text,
  note text,
  created_at timestamptz not null default now()
);
create index on moderation_audit_log (target_type, target_id, created_at desc);

-- Share events — high volume, append-only, short retention is acceptable (see §11)
create table share_events (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id text not null,
  channel share_channel not null,
  surface text not null check (surface in ('card','detail')),
  session_id text not null,
  created_at timestamptz not null default now()
);
create index on share_events (entity_type, entity_id, created_at desc);
```

**Row-Level Security note** (not implemented here, flagged for the DB-owning sprint): `customer_reviews`/`community_comments` need a policy so public reads only ever see `moderation_status = 'APPROVED'` rows (or the requester's own `PENDING` submission, if "show my review as pending" UX is wanted) — writes go exclusively through the server actions in §5, never direct client inserts.

---

## 5. API contract

All mutation endpoints follow the existing `'use server'` + Zod `safeParse` + discriminated `ActionState` pattern (`lib/actions/lead-action.ts`). Read endpoints follow the existing `'server-only'` + `react.cache()` pattern (`lib/cms/client.ts`).

### 5.1 Reads

| Function | Signature | Notes |
|---|---|---|
| `getEntityReviewSummary` | `(entityType, entityId) => Promise<EntityReviewSummary>` | Cached per request; only counts `APPROVED` rows. |
| `getEntityReviews` | `(entityType, entityId, { cursor?, limit? }) => Promise<{ items: CustomerReview[]; nextCursor: string \| null }>` | `APPROVED` only; `authorContactRef` stripped before serialization. |
| `getEntityComments` | `(entityType, entityId, { cursor?, limit? }) => Promise<PaginatedComments>` | `APPROVED` only, top-level first with nested first-level replies, `limit` default 10 per §11. |

### 5.2 Writes (server actions)

| Action | Input (Zod-validated) | Output | Side effects |
|---|---|---|---|
| `submitReviewAction` | entityType, entityId, rating, title, content, media[], travelDate?, authorDisplayName, authorEmail, honeypot field (§9.2) | `ActionState` (`idle\|error\|success`) | Insert `PENDING` review; rate-limit check (§9.1); fires `review_submitted` analytics event only on success. |
| `submitCommentAction` | entityType, entityId, content, isQuestion, authorDisplayName, authorEmail, honeypot | `ActionState` | Insert `PENDING` comment; rejects if `comment_thread_locks` row is `locked=true`; fires `comment_submitted`. |
| `submitReplyAction` | parentCommentId, content, authorDisplayName, authorEmail, honeypot | `ActionState` | Rejects if `parentCommentId` already has a non-null `parentCommentId` (business rule #11) or its thread is locked. |
| `reportContentAction` | targetType, targetId, reason, note? | `ActionState` | Insert `OPEN` report; rate-limited same as posting (business rule #12); fires `content_reported`. |
| `recordShareEventAction` | entityType, entityId, channel, surface | `{ ok: true }` (fire-and-forget, no field errors surfaced to UI) | Insert `share_events` row; also calls `@vercel/analytics`'s `track('share', {...})` client-side (§12) — the DB write and the Vercel Analytics event are both fired, serving different purposes (durable per-entity share counts vs. product-analytics dashboards). |

### 5.3 CMS moderation actions (staff-authenticated, out of this task's public API surface but specified for the CMS sprint)

| Action | Effect | Audit log entry |
|---|---|---|
| `moderateReviewAction(id, status, note?)` | Sets `moderationStatus`; if `APPROVED`, becomes eligible for `EntityReviewSummary`/structured data | `action: 'APPROVE'\|'HIDE'\|'MARK_SPAM'\|'REJECT'` |
| `markReviewVerifiedAction(id)` | System-only trigger (booking reconciliation job), not a manual CMS button — see business rule #8 | `action: 'MARK_VERIFIED'` |
| `featureReviewAction(id, featured: boolean)` | Toggles `featured` | `action: 'FEATURE'\|'UNFEATURE'` |
| `moderateCommentAction(id, status, note?)` | Sets `moderationStatus` | `action: 'APPROVE'\|'HIDE'\|'MARK_SPAM'\|'REJECT'` |
| `replyToCommentAction(parentId, content)` | Inserts a `CommunityComment` with `isOfficialReply: true`, authored as staff | `action: 'REPLY'` |
| `lockThreadAction(entityType, entityId, locked: boolean)` | Upserts `comment_thread_locks` | `action: 'LOCK_THREAD'\|'UNLOCK_THREAD'` |
| `resolveReportAction(id, status: 'RESOLVED'\|'DISMISSED')` | Updates `content_reports.status` | logged against the report, not the underlying content |
| `bulkModerateAction(targetType, ids[], status)` | Applies one status transition to many rows in one transaction | one audit log row per affected id, sharing a `batchId` note |

---

## 6. CMS screens

| Screen | Primary list | Key actions | Notes |
|---|---|---|---|
| **Review moderation queue** | `CustomerReview` where `status='PENDING'`, oldest first | Approve / Hide / Mark spam / Reject, view media, view linked booking | Media preview must lazy-load (§11); flag reviews with no `linkedBookingId` visually (not blocked, just visible, since guest reviews may be allowed by business policy) |
| **Comment moderation queue** | `CommunityComment` where `status='PENDING'` | Approve / Hide / Mark spam / Reject | Show `isQuestion` badge distinctly |
| **Questions awaiting reply** | `CommunityComment` where `isQuestion=true` and no reply with `isOfficialReply=true` exists in its reply set | Reply inline (creates `isOfficialReply` reply) | Separate from the moderation queue — a question can be `APPROVED` and still awaiting reply |
| **Reported content** | `ContentReport` where `status='OPEN'`, grouped by target | Resolve (apply a moderation action to the target) / Dismiss (report was invalid) | Each report shows reason + note + link to the review/comment |
| **Verified review marking** | Read-only view of `verifiedExperience` + the `linkedBookingId` it reconciled against | None (system-set, business rule #8) — a "re-run reconciliation" trigger only, not a manual override toggle | |
| **Official Minh Việt replies** | All `CommunityComment` where `isOfficialReply=true` | Edit / retract own reply | |
| **Feature review** | Toggle from within the Review moderation queue or a dedicated "Featured reviews" screen | Feature / unfeature, reorder featured set per entity | |
| **Lock comments** | Toggle from within an entity's comment view (accessed via the entity's CMS record, not a standalone queue) | Lock / unlock thread | |
| **Bulk moderation** | Multi-select on the Review/Comment queues | Apply one action to N selected rows | |
| **Moderation audit log** | `ModerationAuditLogEntry`, filterable by target/actor/date | Read-only | Append-only by design (§4) |

---

## 7. Frontend components

Additive only — no existing component is modified by this spec.

### 7.1 Social Sharing

| Component | File (proposed) | Used on |
|---|---|---|
| `ShareButton` | `components/social/share-button.tsx` | Cards (tour card, article card, inspiration card, destination card) — single icon button, opens `SharePopover` |
| `SharePopover` | `components/social/share-popover.tsx` | Compact channel list, opened by `ShareButton` |
| `ShareSheet` | `components/social/share-sheet.tsx` | Detail pages — full row of 5 labeled channel buttons + copy-link field, always visible (not hidden behind a trigger) |
| `useShare` | `hooks/use-share.ts` | Shared logic: builds each channel's share-intent URL from a `ShareTarget`, fires `recordShareEventAction` + Vercel Analytics `track()` on click, handles `navigator.clipboard` with a document-`execCommand` fallback only if actually needed for target browser support |

`ShareSheet` is dynamically imported (`next/dynamic`) on detail pages so its (tiny, SDK-free) code doesn't add to the initial bundle of pages that only show a `ShareButton` (§11).

### 7.2 Share-intent URL patterns (no SDK, confirmed low-weight)

```
Facebook: https://www.facebook.com/sharer/sharer.php?u={encodedUrl}
Zalo:     https://sp.zalo.me/share?u={encodedUrl}
Telegram: https://t.me/share/url?url={encodedUrl}&text={encodedText}
X:        https://twitter.com/intent/tweet?url={encodedUrl}&text={encodedText}
Copy link: navigator.clipboard.writeText(url) — no network request
```

Each opens in a small popup window (desktop) or a new tab (mobile, since popups aren't meaningfully different from tabs on mobile browsers) — never an in-page iframe, never a loaded SDK.

### 7.3 Customer Voice

| Component | File (proposed) | Notes |
|---|---|---|
| `ReviewSummary` | `components/reviews/review-summary.tsx` | Average rating + count + breakdown bars, reads `EntityReviewSummary` |
| `ReviewList` | `components/reviews/review-list.tsx` | Paginated, `APPROVED` only |
| `ReviewCard` | `components/reviews/review-card.tsx` | Shows verified badge only when `verifiedExperience`, media gallery, never shows `authorContactRef` |
| `ReviewForm` | `components/reviews/review-form.tsx` | Wraps `submitReviewAction` via `useActionState`, same shape as `LeadForm` |
| `CommentThread` | `components/comments/comment-thread.tsx` | Top-level comments + first-level replies only (business rule #11); "Load more" paginates top-level comments, 5–10 initial (§11) |
| `CommentComposer` | `components/comments/comment-composer.tsx` | Includes an "Ask a question" toggle mapping to `isQuestion` |
| `ReplyComposer` | `components/comments/reply-composer.tsx` | Only rendered under a top-level comment, never under a reply (enforces one-level threading in the UI, backstopped by the DB constraint) |
| `OfficialReplyBadge` | `components/comments/official-reply-badge.tsx` | Small "Minh Việt" badge on `isOfficialReply` comments |
| `ReportButton` | `components/moderation/report-button.tsx` | Opens a small reason picker, calls `reportContentAction` |
| `LockedThreadNotice` | `components/comments/locked-thread-notice.tsx` | Renders instead of `CommentComposer` when the thread is locked |

---

## 8. Moderation workflow

```
                 ┌────────────┐
   submit ──────►│  PENDING   │
                 └─────┬──────┘
                       │ moderator action
        ┌──────────────┼───────────────┬───────────────┐
        ▼              ▼               ▼               ▼
   ┌─────────┐   ┌───────────┐   ┌──────────┐   ┌────────────┐
   │APPROVED │   │  HIDDEN   │   │   SPAM   │   │  REJECTED  │
   └────┬────┘   └─────┬─────┘   └────┬─────┘   └─────┬──────┘
        │              │               │               │
        │  moderator may re-approve/re-hide (all transitions logged)
        └──────────────┴───────┬───────┴───────────────┘
                                ▼
                    moderation_audit_log entry
                    (previousStatus, newStatus, actor, note)
```

- `PENDING` is the only entry state — nothing is ever inserted as `APPROVED` directly, even an official staff reply (it's still logged the same way, just typically approved near-instantly by the same action that created it).
- `HIDDEN` vs `REJECTED`: `HIDDEN` is for content that was once fine and is being suppressed (e.g., outdated, superseded); `REJECTED` is for content that should never have been posted (policy violation short of spam). This distinction matters for reporting/trust metrics later, so it's kept even though both have the same visible effect (not shown publicly).
- `SPAM` is distinct from `REJECTED` so spam-detection accuracy can be measured separately from editorial rejection.
- Every transition — automatic (rate-limit/spam-filter driven) or manual (CMS) — writes one `moderation_audit_log` row. No status field is ever updated without a paired audit entry (enforced at the service-layer function that wraps every status change, not left to each call site to remember).
- A report resolution (`resolveReportAction`) does not itself change the target's `moderationStatus` — resolving a report is a separate act from moderating the content it points at; a moderator reviews the flagged content and decides independently, then the report is marked `RESOLVED`.

---

## 9. Security and anti-spam

### 9.1 Rate limiting
- Per-`sessionId` (anonymous, cookie-based) **and** per-IP, both enforced: e.g. 5 review/comment/report submissions per 10 minutes, 20 share-event records per minute (share events are cheap but still bounded against scripted abuse).
- Rate-limit rejections return a clear, honest error message (matching `lead-action.ts`'s existing pattern of never pretending success) — never a silent success that just doesn't persist.

### 9.2 Spam prevention
- Honeypot field on every public submission form (hidden field that must stay empty; bots that fill every field trip it).
- Server-side minimum time-since-form-render check (reject submissions faster than a human could plausibly type).
- Content-based spam heuristics (link density, repeated submission text) flag straight to `SPAM` status pending review rather than blocking outright — false positives get caught in the queue, not silently dropped.
- CAPTCHA is explicitly **not** proposed as a default gate (adds friction to every genuine reviewer) — held in reserve as a per-entity or global toggle if the heuristics above prove insufficient in practice.

### 9.3 No public email or phone
- `authorContactRef.emailHash` is a one-way hash, stored for spam/dedup correlation only, **never** returned by any read API (`getEntityReviews`/`getEntityComments` strip it at the serialization boundary, not just at the UI layer — so no accidental leak via a devtools network tab).
- `authorDisplayName` is the only public-facing identity; it is never validated against being an email or phone number pattern being *required*, but *is* checked to reject values that look like a raw email/phone being pasted in as a name (regex screen), so a reviewer doesn't accidentally publish their own contact info as their display name.
- Free-text `content`/`title`/`note` fields are scanned for embedded email/phone patterns and such matches are redacted (`[thông tin liên hệ đã được ẩn]`) before storage — protects other users' contact info from being pasted into a public comment as much as the author's own.

### 9.4 Sanitize user content
- All rich-text-adjacent fields (`content`, `title`, `note`) are stored and rendered as **plain text only** — no HTML, no Markdown rendering. This sidesteps the entire XSS-via-user-content class of bug: there is nothing to sanitize because nothing is ever interpreted as markup. Line breaks are the only formatting preserved (via `white-space: pre-wrap` at render, not stored HTML).
- If rich formatting is ever desired later, it goes through a strict allow-list sanitizer (e.g., `rehype-sanitize` with a minimal schema) applied server-side before storage, never client-side-only — but that's an explicit future decision, not part of this spec's default.

### 9.5 Upload validation
- Review media: file type allow-list (jpeg/png/webp for images, mp4/webm for video), max file size enforced both client-side (fast feedback) and server-side (authoritative), re-encoded/transcoded server-side rather than trusting the uploaded file's own metadata, stripped of EXIF location data before storage.
- Upload happens to a storage bucket via a signed URL the server action issues, not a direct unauthenticated public upload endpoint.

### 9.6 Abuse reporting
- Covered functionally in §5.2/§8; the security-relevant point is that reporting is rate-limited identically to posting (business rule #12) so the report queue itself can't be used as a DoS vector against moderators (mass-reporting legitimate content to bury the queue).

### 9.7 No fake review generation
- No code path in this system ever creates a `CustomerReview` or `CommunityComment` without a real submitting `sessionId`/`authorContactRef`. There is no "seed realistic reviews" utility shipped to production. Demo/staging fixtures (if needed for CMS screen development) live in a clearly-separate fixture module, never imported by production code paths, mirroring how `lib/inspiration/inspiration-demo-data.ts` is explicitly documented as the seam a real CMS replaces rather than something meant to reach production.

---

## 10. SEO

- **Structured data**: only `CustomerReview` rows with `moderationStatus = 'APPROVED'` **and** `verifiedExperience = true` contribute to `AggregateRating`/`Review` schema.org markup on an entity's detail page. Approved-but-unverified reviews are still shown to human visitors (§5.1's `getEntityReviews` doesn't filter on `verifiedExperience`) but excluded from structured data — this is stricter than the brief's literal wording ("only approved verified reviews may contribute to structured data") applied exactly as written, not loosened.
- If `EntityReviewSummary.reviewCount` (verified+approved subset) is 0, no `AggregateRating` node is emitted at all — never a fabricated `0`-based or default rating in JSON-LD.
- **Heading hierarchy**: Review/comment sections use `<h2>`/`<h3>` consistent with the entity page's existing hierarchy (mirrors how `TourDetailJsonLd`'s page already establishes its own H1/H2 structure) — this spec's components never introduce a second `<h1>`.
- **No duplicate/spam indexing**: comment pagination uses `rel="next"/"prev"` semantics or a `?page=` param excluded from canonical variants (canonical always points to the unpaginated, first-page URL); a `noindex` meta applies to any user-generated-content-only paginated view beyond page 1 if those ever get their own URL, so search engines don't index dozens of near-duplicate comment-page URLs per entity.
- **Open Graph per entity**: every entity type's detail page (once it exists, §2.3) implements its own `generateMetadata` following the exact pattern already in `app/tour/[slug]/page.tsx` — real `og:image` at 1200×630 from the entity's own cover asset, `alternates.canonical` set, no shared/generic OG image reused across entities.
- Share-intent URLs (§7.2) always point at the canonical entity URL, never a review- or comment-specific deep-link fragment as the primary shared URL — so shared links always land on a fully-indexable, canonical page.

---

## 11. Performance

- **Lazy-load social functions**: `ShareSheet` (detail page, all 5 channels) is `next/dynamic`-imported; `ShareButton`/`SharePopover` (card context) is small enough to ship directly but still defers building any channel URL until the popover is actually opened (no upfront work for a button 90% of visitors never click).
- **No large third-party SDKs, confirmed by design**: §7.2's URL-intent approach means the *only* JS shipped for sharing is our own small component code — zero Facebook/Zalo/Twitter SDK bytes, ever.
- **Paginate comments**: `getEntityComments` defaults to `limit: 10` (within the brief's 5–10 range), cursor-based pagination (not offset — stable under concurrent new comments), "Load more" is a manual user action, not infinite-scroll-on-mount (avoids loading comments below the fold before a visitor asks for them).
- **Optimized review media**: images through `next/image` (matches every other image in this codebase), thumbnails generated server-side at upload time for the review list view (full-resolution only loads in a lightbox on explicit click), videos get a poster frame and never autoplay (consistent with the existing `HeroVideoRotator`/`VideoModal` "no video loads before user intent" pattern from earlier sprints).
- **Avoid CLS**: `ReviewCard`/`CommentThread` reserve space via aspect-ratio boxes for media, matching the fixed-aspect-ratio card pattern already used platform-wide (`journey-card.tsx`, `inspiration-card.tsx`).
- **Bundle impact**: Customer Voice components (`ReviewForm`, `CommentComposer`) are client components only where interactivity is required (form state); `ReviewList`/`ReviewSummary` render server-side wherever the page itself is a Server Component, consistent with how `sections/*.tsx` are async Server Components today and only drop to `'use client'` at the leaf that needs it (e.g., `journey-card.tsx` stays server-renderable; `featured-journeys-grid.tsx` is the client boundary).
- **Share event writes are fire-and-forget** from the UI's perspective (§5.2) — the click action never blocks on the network round-trip before opening the share window.

---

## 12. Analytics events

Implemented via `@vercel/analytics`'s `track()` (already a dependency, currently unused beyond the `<Analytics />` mount in `app/layout.tsx` — this spec is the first real consumer). Every event also gets a durable row in `share_events`/equivalent where noted, since Vercel Analytics custom events are for dashboards/trends, not a queryable system of record for per-entity counts.

| Event name | Fired when | Payload |
|---|---|---|
| `share_intent_click` | Visitor clicks a channel in `SharePopover`/`ShareSheet`, before the share window opens | `{ entityType, entityId, channel, surface }` |
| `share_copy_link` | Copy-link action succeeds | `{ entityType, entityId, surface }` |
| `review_submitted` | `submitReviewAction` returns `success` | `{ entityType, entityId, rating }` (no PII) |
| `review_form_error` | `submitReviewAction` returns `error` (validation, not rate-limit) | `{ entityType, entityId, fieldCount: number }` |
| `comment_submitted` | `submitCommentAction`/`submitReplyAction` returns `success` | `{ entityType, entityId, isQuestion, isReply }` |
| `content_reported` | `reportContentAction` returns `success` | `{ targetType, reason }` |
| `review_helpful_view` *(reserved, not built this phase)* | placeholder for a possible future "was this review helpful" affordance — listed so the naming slot isn't collided with later | — |

Explicitly **not** tracked: a true "share completed" event (no channel in §7.2 provides a completion callback — Facebook/Zalo/Telegram/X share dialogs don't report back to the opener window). `share_intent_click` measures *intent to share*, and that distinction is documented in the component/analytics code comments so a future reader doesn't misinterpret the metric as a confirmed share count.

---

## 13. Phased implementation plan

**Phase 0 — this document.** Review and revise before writing any code.

**Phase 1 — data model + Social Sharing on `TOUR` only.**
Migrations for §4's tables; `ShareButton`/`SharePopover`/`ShareSheet` + `useShare` (§7.1); `recordShareEventAction`; Vercel Analytics events (§12). Ships on `/tour/[slug]` — the one entity type with a real detail page today (§2.3). No Customer Voice yet.

**Phase 2 — Customer Voice on `TOUR`, submission + read, no CMS yet.**
`CustomerReview`/`CommunityComment` tables live; `ReviewForm`/`CommentComposer`/`ReplyComposer` + server actions (§5.2); `ReviewList`/`ReviewSummary`/`CommentThread` read side (§5.1, §7.3). All submissions land as `PENDING` and are invisible publicly until Phase 3 ships moderation — i.e., Phase 2 can go live *behind* Phase 3 without showing unmoderated content, since `APPROVED`-only read filters are already the default.

**Phase 3 — CMS moderation.**
All screens in §6; audit log (§8) wired to every status-changing action from Phase 2's point onward (retroactively logging Phase 2-era transitions isn't possible/needed since nothing was approved before this phase exists). This is the phase that makes Phase 2's content actually visible to the public for the first time.

**Phase 4 — SEO + verified-review reconciliation.**
`TourDetailJsonLd` extended with `AggregateRating`/`Review` nodes per §10; the booking-reconciliation job that sets `verifiedExperience` (business rule #8); `getEntityReviewSummary` wired in to replace `journey.reviewScore`/`.reviewCount` on the Homepage tour card (§2.4) — this is the first point this spec touches the Homepage, explicitly called out as its own future sprint, not bundled here.

**Phase 5 — expand to remaining `EntityType`s, gated by each one's detail page shipping.**
Per §2.3, this is realistically several separate sprints (one per entity type, since each needs its own detail route built first by a different workstream): HOTEL/RESORT/HOMESTAY, CRUISE, ATTRACTION, ARTICLE, VIDEO, DESTINATION, MICE_CASE_STUDY, INSPIRATION. Social Sharing + Customer Voice components themselves don't change between phases — only which pages mount them.

---

## 14. Acceptance criteria

This spec is ready to move to implementation when:

1. Every `EntityType` in §2.2 has an explicit routing status in §2.3 (done in this document) and stakeholders have agreed on the Phase 5 ordering.
2. The `ModerationStatus` state machine (§8) and the "review ≠ comment" schema separation (§3.2, business rule #7) are confirmed as matching actual moderation team workflow expectations, not just this document's assumptions.
3. §9's security model (plain-text-only content, hashed email, honeypot + rate limiting, no CAPTCHA-by-default) is signed off by whoever owns platform security/legal — particularly the "redact contact info from free text" behavior (§9.3), which is a product decision as much as a technical one.
4. §10's SEO rule (verified **and** approved only feed structured data) is confirmed against current schema.org/Google guidance at implementation time (guidance in this space changes; the document's *principle* — never fabricate/inflate a public rating signal — is the durable part, the exact schema.org property usage should be re-verified when Phase 4 actually starts).
5. §12's analytics event names are checked against any existing/planned analytics taxonomy elsewhere in the org (this document assumes a greenfield, per the research in §0).
6. No part of this document has been treated as authorization to write migrations, ship UI, or touch the Homepage — per the task constraint, implementation starts only after an explicit follow-up request.
