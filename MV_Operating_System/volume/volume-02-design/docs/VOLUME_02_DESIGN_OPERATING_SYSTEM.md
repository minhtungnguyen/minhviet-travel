# MV OPERATING SYSTEM

# VOLUME 02 — DESIGN OPERATING SYSTEM

**Version:** 1.0  
**Status:** Core Standard  
**Applies to:** Minh Việt Group, Minh Việt Travel, MIVIGO, Minh Việt Booking, Checkin platforms, AI products and future digital products.  
**Dependency:** Volume 01 — Brand Strategy

---

# Executive Summary

Volume 02 converts the brand strategy into a repeatable design system for websites, applications, dashboards, AI interfaces, marketing landing pages and internal operating software.

The objective is not to make every product look identical. The objective is to ensure that every product:

- feels trustworthy;
- communicates clearly;
- supports fast decisions;
- works consistently across devices;
- remains maintainable as the ecosystem grows;
- expresses the correct parent-brand and sub-brand relationship;
- can be implemented reliably by designers, developers and AI coding agents.

This volume is a **Design Operating System**, not merely a visual guideline.

It governs:

1. Design philosophy.
2. Experience principles.
3. Brand architecture in interfaces.
4. Design tokens.
5. Color.
6. Typography.
7. Spacing and grid.
8. Layout.
9. Components.
10. Content design.
11. Interaction and motion.
12. Responsive and mobile design.
13. Accessibility.
14. Conversion design.
15. Dashboard and enterprise UX.
16. AI UX.
17. Frontend implementation.
18. Design governance and QA.

---

# PART I — DESIGN FOUNDATION

# Chapter 1 — Design Philosophy

## 1.1 Design is a business operating capability

Design at Minh Việt is not decoration. It is the discipline of turning customer needs, business goals, data and technology into understandable experiences.

A successful interface must simultaneously serve four outcomes:

- **Customer outcome:** users can understand, decide and act with confidence.
- **Business outcome:** the interface supports qualified leads, conversion, service delivery and retention.
- **Operational outcome:** staff can manage content and workflows without unnecessary manual work.
- **Technical outcome:** the system remains modular, secure, scalable and maintainable.

## 1.2 Core design statement

> Minh Việt designs calm, intelligent and trustworthy experiences that help people make better decisions and complete important journeys with confidence.

## 1.3 Design priority order

```text
Clarity
↓
Trust
↓
Task Completion
↓
Accessibility
↓
Consistency
↓
Efficiency
↓
Visual Delight
```

Visual delight is valuable, but it must never reduce clarity, speed or trust.

## 1.4 Design must reduce uncertainty

Travel and business decisions contain uncertainty: price, availability, quality, timing, cancellation, documentation and operational risk.

Every interface should answer:

- What is this?
- Is it suitable for me?
- What is included?
- What will it cost?
- What happens next?
- Who is responsible?
- What should I be careful about?
- How do I get human help?

## 1.5 Non-goals

Minh Việt interfaces must not be designed primarily to:

- imitate current design trends;
- maximize visual effects;
- show that the company uses AI;
- increase clicks through manipulation;
- hide important conditions;
- create artificial urgency;
- present more features than users need.

---

# Chapter 2 — Experience Principles

## Principle 1 — Trust Before Conversion

Do not increase conversion by weakening transparency.

Required:

- show material conditions before commitment;
- distinguish estimated and confirmed information;
- make total cost understandable;
- display provider or operator information according to business policy;
- show clear contact and support channels.

Forbidden:

- fake scarcity;
- preselected paid options without clear consent;
- misleading crossed-out prices;
- hidden mandatory charges;
- fabricated ratings or testimonials.

## Principle 2 — One Primary Job Per Screen

Each important screen must have one primary user job.

Examples:

- Homepage: discover the right product category.
- Search results: compare and shortlist.
- Tour detail: understand suitability and submit an inquiry.
- Checkout/request page: provide required information.
- CRM lead page: determine and execute next action.
- Dashboard: identify what requires attention.

## Principle 3 — Progressive Disclosure

Show essential information first. Reveal complexity when users need it.

Use:

- summaries;
- tabs;
- accordions;
- expandable policy sections;
- comparison drawers;
- contextual help.

Do not hide critical cost, safety or cancellation information behind obscure interaction.

## Principle 4 — Human Help Must Be Reachable

AI and self-service must not become barriers.

Every high-value or high-risk flow must provide:

- call;
- Zalo or approved messaging channel;
- request callback;
- assigned advisor when available;
- escalation from AI to staff.

## Principle 5 — Design for Real Data

Components must handle:

- long Vietnamese names;
- missing images;
- unknown availability;
- changing prices;
- multiple departure dates;
- large tables;
- empty states;
- loading states;
- permission restrictions;
- errors;
- expired promotions.

## Principle 6 — Mobile Is a Primary Environment

No desktop design is approved until its mobile behavior is defined.

## Principle 7 — Measure Outcomes, Not Opinions

Design decisions should be evaluated through:

- task completion;
- form completion;
- qualified lead rate;
- booking conversion;
- time to answer;
- error rate;
- support requests;
- customer satisfaction;
- operational efficiency.

---

# Chapter 3 — Design Architecture Across the Ecosystem

## 3.1 Parent brand and sub-brands

The ecosystem uses a shared design foundation with controlled sub-brand expression.

### Shared foundation

All products share:

- spacing scale;
- typography logic;
- accessibility rules;
- component behavior;
- form conventions;
- status semantics;
- data display rules;
- AI interaction rules;
- QA standards.

### Variable layer

Each sub-brand may define:

- primary and secondary colors;
- imagery;
- campaign accents;
- icon or mascot usage;
- category-specific visual tone;
- selected display typeface where approved.

## 3.2 Product profiles

### Minh Việt Travel

Tone: professional, dependable, refined.  
Priority use cases: corporate travel, MICE, groups, premium service.

### MIVIGO

Tone: intelligent, approachable, energetic but controlled.  
Priority use cases: tour discovery, comparison, matching, lead conversion.

### Minh Việt Booking

Tone: efficient, precise, transactional and supportive.  
Priority use cases: flight search, price comparison, booking request, post-booking support.

### Checkin platforms

Tone: local, inspiring, useful and knowledge-rich.  
Priority use cases: destination discovery, itinerary planning, maps and local stories.

### Internal operating systems

Tone: calm, dense but readable, action-oriented.  
Priority use cases: CRM, CMS, operations, finance, documents, analytics and AI control.

## 3.3 Shared shell requirement

Where practical, digital products should reuse:

- top navigation patterns;
- account patterns;
- form system;
- notification system;
- modal and drawer behavior;
- empty/loading/error states;
- admin table patterns;
- AI assistant patterns.

---

# PART II — DESIGN TOKENS

# Chapter 4 — Token Architecture

## 4.1 Token hierarchy

Use three layers:

1. **Primitive tokens** — raw values.
2. **Semantic tokens** — purpose-based values.
3. **Component tokens** — component-specific mappings.

Example:

```text
blue-800
→ color-brand-primary
→ button-primary-background
```

Do not place raw hex values repeatedly inside components.

## 4.2 Token categories

Required token categories:

- color;
- typography;
- spacing;
- size;
- radius;
- border;
- shadow;
- opacity;
- z-index;
- motion;
- breakpoint.

## 4.3 Naming convention

Use lowercase kebab-case for design documentation and CSS variable names.

Examples:

```text
--color-brand-primary
--color-text-primary
--space-4
--radius-md
--shadow-card
--duration-fast
```

## 4.4 Governance

A new token may be created only when:

- an existing token cannot represent the required semantic role;
- the need occurs in more than one component, or is expected to;
- its name describes purpose rather than a temporary visual;
- dark mode and accessibility implications have been reviewed.

---

# Chapter 5 — Color System

## 5.1 Color roles

The system must define:

- brand primary;
- brand secondary;
- accent;
- canvas;
- surface;
- elevated surface;
- text primary;
- text secondary;
- border;
- focus;
- success;
- warning;
- danger;
- information;
- disabled.

## 5.2 Default enterprise foundation

The default foundation uses navy as the trust anchor, with restrained warm accents.

Recommended base:

```text
Brand Navy:        #1F3863
Brand Navy Dark:   #13233F
Brand Navy Light:  #E9EEF6
Warm Gold:         #C8A45D
Warm Gold Light:   #F6F0E4
Canvas:            #F7F8FA
Surface:           #FFFFFF
Text Primary:      #172033
Text Secondary:    #5C667A
Border:            #D9DEE8
Success:           #1F7A4D
Warning:           #A86500
Danger:            #B42318
Information:       #1769AA
Focus:             #2F6FED
```

These values are defaults, not permission to ignore product-specific brand palettes.

## 5.3 Semantic use

- Navy: trust, navigation, primary action, enterprise emphasis.
- Gold: premium emphasis, selective highlights, not large text blocks.
- Green: confirmed, available, success.
- Amber: attention, limited availability, pending.
- Red: error, blocked, urgent risk; never use merely for visual excitement.
- Gray: hierarchy and neutral structure.

## 5.4 Contrast

Minimum requirements:

- normal text: WCAG AA contrast;
- large text: WCAG AA contrast;
- focus indicators must be visible;
- color must not be the only carrier of meaning.

## 5.5 Status color mapping

```text
Available / Confirmed  → Success
Pending / Limited      → Warning
Unavailable / Error    → Danger
Informational          → Information
Draft / Inactive       → Neutral
```

The meaning of status colors must remain consistent across all products.

---

# Chapter 6 — Typography

## 6.1 Typography objective

Typography must make Vietnamese content highly readable and support long-form travel information, pricing, forms and data-heavy dashboards.

## 6.2 Default typeface strategy

Use a high-quality sans-serif with full Vietnamese support.

Recommended web stack:

```css
font-family: Inter, "Be Vietnam Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Do not introduce additional fonts without a documented reason.

## 6.3 Type scale

Recommended semantic scale:

| Token | Size | Line height | Typical use |
|---|---:|---:|---|
| display-xl | 56px | 64px | major campaign hero |
| display-lg | 48px | 56px | homepage hero |
| heading-1 | 40px | 48px | page title |
| heading-2 | 32px | 40px | major section |
| heading-3 | 24px | 32px | section title |
| heading-4 | 20px | 28px | card or panel title |
| body-lg | 18px | 30px | lead text |
| body | 16px | 26px | standard content |
| body-sm | 14px | 22px | supporting text |
| caption | 12px | 18px | metadata |

Mobile sizes should reduce display and heading sizes while preserving hierarchy.

## 6.4 Typography rules

- Body copy must not be smaller than 16px for public consumer pages except supporting metadata.
- Avoid long lines; target 55–80 characters for reading content.
- Use sentence case for buttons and headings.
- Do not use all caps for long text.
- Prices require clear numeric hierarchy.
- Terms, dates and conditions require legibility, not visual hiding.
- Use tabular numerals in financial and operational tables where supported.

---

# Chapter 7 — Spacing, Grid and Layout

## 7.1 Spacing scale

Use a 4px base unit.

```text
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
```

Avoid arbitrary spacing unless required by a documented exceptional layout.

## 7.2 Public website grid

Recommended:

- mobile: 4 columns;
- tablet: 8 columns;
- desktop: 12 columns;
- max content width: 1280px;
- reading content max width: 760px;
- page gutters: 16px mobile, 24px tablet, 32px desktop.

## 7.3 Admin grid

Admin interfaces may use:

- persistent sidebar;
- 12-column content grid;
- responsive detail drawer;
- dense mode where justified;
- sticky actions for long forms.

## 7.4 Vertical rhythm

Section spacing should communicate hierarchy:

- related controls: 8–16px;
- card internal groups: 16–24px;
- major content sections: 48–80px;
- homepage sections: 64–96px.

## 7.5 Layout rule

Whitespace is not empty decoration. It separates decisions and reduces cognitive load.

---

# PART III — COMPONENT SYSTEM

# Chapter 8 — Component Principles

## 8.1 Component anatomy

Every reusable component must define:

- purpose;
- anatomy;
- variants;
- states;
- behavior;
- accessibility;
- content rules;
- responsive behavior;
- analytics events where relevant.

## 8.2 Required states

Interactive components must support:

- default;
- hover;
- focus;
- active;
- disabled;
- loading;
- error;
- success where relevant.

## 8.3 Composition

Prefer small composable primitives over large one-off components.

Do not create a separate component only because copy or image differs.

## 8.4 Component tiers

### Tier 1 — Primitives

Button, input, label, icon, badge, divider, avatar.

### Tier 2 — Patterns

Search bar, filter group, date selector, price block, status group, form section.

### Tier 3 — Domain components

Tour card, departure table, itinerary timeline, booking request, vendor scorecard, lead panel.

### Tier 4 — Page templates

Tour detail, search results, destination page, CRM lead detail, admin list, analytics dashboard.

---

# Chapter 9 — Core Components

## 9.1 Buttons

Required variants:

- primary;
- secondary;
- tertiary/ghost;
- destructive;
- text/link;
- icon-only.

Rules:

- one dominant primary action per decision area;
- labels must describe the action;
- avoid generic “OK” where a specific verb is possible;
- destructive actions require explicit styling and, where material, confirmation.

## 9.2 Forms

Forms must:

- use visible labels;
- provide examples only as supporting text;
- validate near the field;
- preserve entered data after recoverable errors;
- identify required fields;
- explain why sensitive data is needed;
- group related fields;
- minimize initial requirements.

## 9.3 Cards

Cards are for grouped, comparable information.

A product card should include only information needed to decide whether to open details:

- product name;
- destination or category;
- duration;
- starting price or price status;
- next departure or availability;
- one to three differentiators;
- clear CTA;
- relevant status.

## 9.4 Navigation

Public navigation should prioritize user goals, not internal departments.

Admin navigation should reflect operational domains and user permissions.

## 9.5 Tables

Tables must support:

- readable headers;
- sorting where useful;
- filtering;
- empty state;
- loading;
- pagination or virtualization;
- responsive fallback;
- row action consistency;
- status visibility;
- keyboard access where feasible.

## 9.6 Modals and drawers

Use modals for focused decisions.  
Use drawers for supplementary detail or editing while preserving context.  
Do not place complex multi-step workflows in small modals.

---

# Chapter 10 — Domain Components for Travel

## 10.1 Tour Card

Required fields:

- hero image;
- tour title;
- destination;
- duration;
- transport indicator where useful;
- price;
- departure date or frequency;
- availability status;
- short suitability cue;
- CTA.

Optional:

- AI match score, only with explainable criteria;
- promotion badge, only when verified;
- review score, only from real data.

## 10.2 Tour Detail

Required information architecture:

1. Hero and core summary.
2. Price and booking/request CTA.
3. Departure options.
4. Why this tour may suit the customer.
5. Itinerary by day and time.
6. Accommodation.
7. Meals.
8. Transport.
9. Included.
10. Not included.
11. Surcharges.
12. Child policy.
13. Payment and cancellation.
14. Visa or documentation.
15. Important notes.
16. Reviews and proof.
17. Similar products.
18. Human support.

## 10.3 Availability status

Approved labels:

- Còn nhận khách.
- Sắp hết chỗ.
- Gần kín.
- Hết chỗ.
- Chờ xác nhận.

These statuses must come from defined business rules or verified staff updates.

## 10.4 Itinerary timeline

- time is the primary anchor when available;
- do not add redundant numbering when precise time is present;
- separate travel, meal, activity, rest and accommodation;
- show optional activities explicitly;
- support notes and accessibility considerations.

## 10.5 Price presentation

Show:

- starting price versus fixed price;
- applicable date;
- room basis;
- taxes and mandatory charges;
- surcharge conditions;
- child price;
- single supplement where relevant;
- when staff confirmation is required.

---

# PART IV — CONTENT AND INTERACTION

# Chapter 11 — Content Design

## 11.1 Content hierarchy

Each page should communicate:

1. What the user is looking at.
2. Why it matters.
3. What the user needs to know.
4. What action is available.
5. What happens after the action.

## 11.2 Microcopy

Good microcopy is:

- specific;
- calm;
- honest;
- action-oriented;
- consistent with Volume 01.

Examples:

Use:

- “Gửi yêu cầu tư vấn”.
- “Kiểm tra tình trạng chỗ”.
- “Xem điều kiện hoàn hủy”.
- “Chúng tôi sẽ xác nhận trước khi giữ chỗ.”

Avoid:

- “Chốt ngay”.
- “Không mua sẽ tiếc”.
- “Chắc chắn đậu visa”.
- “Giá rẻ nhất thị trường”.

## 11.3 Empty states

Every empty state should explain:

- why nothing is shown;
- whether this is normal;
- what the user can do next.

## 11.4 Error messages

Error messages must:

- state what happened;
- avoid blaming the user;
- preserve entered work;
- provide recovery action;
- provide support when recovery fails.

---

# Chapter 12 — Interaction and Motion

## 12.1 Interaction objective

Interaction should confirm cause and effect.

Users must always understand:

- what is interactive;
- what changed;
- whether an action succeeded;
- what is happening during waiting;
- how to undo or recover.

## 12.2 Motion principles

Motion must be:

- purposeful;
- restrained;
- fast;
- accessible;
- interruptible where possible.

Recommended durations:

```text
Fast:     120–160ms
Standard: 180–240ms
Slow:     280–400ms
```

## 12.3 Approved motion uses

- focus transitions;
- dropdown and drawer appearance;
- loading progress;
- content hierarchy change;
- confirmation;
- spatial relationship.

## 12.4 Forbidden motion

- excessive parallax;
- long blocking intro animation;
- constant decorative movement;
- flashing;
- motion that delays task completion;
- animation that hides system state.

Respect reduced-motion preferences.

---

# Chapter 13 — Responsive and Mobile Design

## 13.1 Breakpoint strategy

Suggested breakpoints:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Breakpoints must follow content needs, not devices alone.

## 13.2 Mobile priorities

On mobile:

- primary CTA may be sticky when appropriate;
- contact options remain visible;
- filters use a drawer;
- tables transform into cards or horizontal scroll with clear context;
- forms use appropriate keyboards;
- touch targets are at least 44×44px;
- important content is not hidden solely to shorten the page.

## 13.3 Mobile booking request

The request flow should be divided into logical steps:

1. Trip selection.
2. Date and group size.
3. Contact.
4. Special requirements.
5. Review.
6. Submission confirmation.

Do not require full passenger documents during early inquiry unless operationally necessary.

---

# Chapter 14 — Accessibility

## 14.1 Accessibility is a quality standard

Accessibility supports:

- older travelers;
- users with temporary limitations;
- users in bright sunlight;
- users with slow connections;
- keyboard users;
- screen-reader users;
- users with limited digital literacy.

## 14.2 Minimum requirements

- semantic HTML;
- keyboard navigation;
- visible focus;
- accessible labels;
- sufficient color contrast;
- alt text for meaningful images;
- captions/transcripts for important media;
- error identification;
- no color-only meaning;
- reduced-motion support;
- logical heading hierarchy.

## 14.3 Accessibility acceptance

No critical public flow is approved if it cannot be completed using keyboard only, unless a documented technical exception is approved.

---

# PART V — BUSINESS AND OPERATING UX

# Chapter 15 — Conversion Design

## 15.1 Conversion is completion of a suitable next step

Not every visitor should be pushed directly to payment.

Approved conversion goals include:

- view product detail;
- compare;
- ask AI;
- call;
- message;
- request consultation;
- submit booking request;
- upload required information;
- pay after confirmation.

## 15.2 CTA hierarchy

Each page may have:

- one primary CTA;
- one or two secondary actions;
- support actions.

Too many equally styled CTAs weaken decision clarity.

## 15.3 Proof architecture

Use real proof:

- customer testimonials;
- project photos;
- partner information;
- service process;
- case studies;
- certifications;
- transparent policy;
- response commitment;
- operating history.

All proof assets should come from the Trust Library defined in Volume 01.

## 15.4 Form optimization

Optimize for qualified completion, not merely maximum submissions.

Capture:

- source;
- product;
- date;
- group size;
- contact;
- intent;
- budget when appropriate;
- consent where required.

---

# Chapter 16 — Dashboard and Enterprise UX

## 16.1 Dashboard purpose

A dashboard should help a user decide what to do next.

It must not become a collection of decorative charts.

## 16.2 Information priority

```text
Exceptions and urgent risks
↓
Tasks requiring action
↓
Performance versus target
↓
Trends
↓
Detailed exploration
```

## 16.3 Founder dashboard

A founder-facing dashboard should answer:

- What requires attention today?
- Where is revenue at risk?
- Which leads or deals are significant?
- Which operations are delayed?
- Which projects are off-track?
- What changed since yesterday or last week?
- Why does it matter?
- What decision is recommended?

## 16.4 Admin standards

- role-based navigation;
- clear ownership;
- consistent status;
- bulk actions with safeguards;
- audit history;
- saved filters;
- export permissions;
- clear distinction between draft and published data;
- destructive action confirmation;
- optimistic update only where safe.

## 16.5 Data visualization

Charts must:

- answer a stated question;
- label units;
- display time range;
- avoid misleading axes;
- use semantic color;
- provide tabular access where appropriate;
- support empty and insufficient-data states.

---

# PART VI — AI EXPERIENCE

# Chapter 17 — AI UX

## 17.1 AI must be presented as a capability

The interface must not exaggerate AI.

AI should help users:

- clarify needs;
- compare options;
- understand complex information;
- generate an initial itinerary;
- retrieve knowledge;
- summarize;
- recommend next actions.

## 17.2 AI entry points

Approved patterns:

- contextual assistant on product pages;
- guided matching questionnaire;
- AI search;
- itinerary planner;
- staff copilot;
- dashboard insight panel;
- document import assistant.

Avoid placing an AI chat bubble on every screen without a defined job.

## 17.3 AI disclosure

Users should understand:

- they are interacting with AI;
- what data the AI uses;
- what it can and cannot confirm;
- when a human will review;
- how to contact a person.

## 17.4 Confidence and source display

For important recommendations, show:

- source or data basis;
- confirmed versus estimated status;
- last updated time where relevant;
- explanation of fit;
- limitations.

## 17.5 Human handoff

A handoff must transfer:

- conversation summary;
- user needs;
- selected products;
- unresolved questions;
- urgency;
- contact information with consent;
- suggested next action.

The customer must not repeat the entire conversation.

## 17.6 AI failure states

The interface must handle:

- insufficient data;
- conflicting data;
- model unavailable;
- slow response;
- unsafe or out-of-scope request;
- human review required.

Approved response pattern:

1. State the limitation.
2. Preserve useful context.
3. Offer a safe next step.
4. Escalate when required.

## 17.7 AI matching

A match score must be explainable.

Display:

- matching criteria;
- positive factors;
- conflicts;
- missing information;
- confidence;
- ability to adjust preferences.

Never display a fabricated precision score.

---

# PART VII — IMPLEMENTATION AND GOVERNANCE

# Chapter 18 — Frontend Engineering Rules

## 18.1 Default stack alignment

Unless a project specifies otherwise:

- Next.js;
- TypeScript;
- Tailwind CSS;
- accessible component primitives;
- Supabase or approved backend;
- Vercel or approved deployment;
- server-side data fetching where appropriate;
- schema validation;
- analytics and error monitoring.

## 18.2 Implementation rules

- use semantic tokens;
- do not hard-code repeated colors and spacing;
- use TypeScript strict mode;
- validate external and form data;
- separate content from component code;
- use CMS for frequently changing product content;
- support loading, empty, error and success states;
- implement responsive behavior explicitly;
- maintain accessibility;
- avoid unreviewed third-party UI kits;
- prevent component duplication.

## 18.3 Component documentation

Each domain component should include:

- props;
- variants;
- states;
- examples;
- accessibility notes;
- analytics events;
- owner;
- change history where material.

## 18.4 Performance targets

Public pages should aim for:

- fast first content;
- optimized images;
- limited client-side JavaScript;
- lazy loading below the fold;
- stable layout;
- caching appropriate to data freshness;
- no blocking decorative animation.

## 18.5 Security and privacy in UI

- never expose secrets client-side;
- mask sensitive data;
- apply role checks on server and UI;
- confirm destructive actions;
- avoid logging personal data unnecessarily;
- define upload limits and file validation;
- show consent and purpose for sensitive information.

---

# Chapter 19 — Design QA

## 19.1 QA layers

Every release should be checked at five layers:

1. Brand.
2. UX.
3. Visual.
4. Accessibility.
5. Technical behavior.

## 19.2 Required viewport checks

At minimum:

- 360px;
- 390px;
- 768px;
- 1024px;
- 1280px;
- 1440px.

## 19.3 Required state checks

- loading;
- empty;
- one item;
- many items;
- long text;
- missing image;
- error;
- success;
- disabled;
- permission denied;
- slow network;
- expired data.

## 19.4 Content QA

Confirm:

- price;
- dates;
- spelling;
- product terms;
- CTA;
- support contact;
- legal/policy links;
- image truthfulness;
- no placeholder text.

## 19.5 Release rule

No interface is complete merely because it matches a screenshot.

It is complete when:

- it works with real data;
- it handles states;
- it is responsive;
- it is accessible;
- it supports analytics;
- it meets brand and business requirements.

---

# Chapter 20 — Design Governance

## 20.1 Ownership

Required roles:

- Design System Owner.
- Product Owner.
- Frontend Owner.
- Brand Approver.
- Accessibility Reviewer for critical flows.
- Data Owner for data-heavy components.

One person may hold multiple roles in early stages, but responsibilities must remain explicit.

## 20.2 Change process

A material design-system change requires:

1. Problem statement.
2. Current limitation.
3. Proposed solution.
4. Affected products.
5. Accessibility impact.
6. Engineering impact.
7. Migration plan.
8. Approval.
9. Version update.
10. Communication.

## 20.3 Decision record

Use a Design Decision Record for:

- new global component;
- token changes;
- navigation architecture changes;
- major pattern changes;
- accessibility exceptions;
- third-party design dependency;
- brand-specific divergence.

## 20.4 Versioning

Use semantic versioning:

- patch: correction without behavior change;
- minor: backward-compatible token/component addition;
- major: breaking change or broad redesign.

## 20.5 Exception policy

An exception must include:

- reason;
- scope;
- owner;
- expiration or review date;
- risk;
- approved alternative.

Temporary exceptions must not silently become permanent standards.

---

# Executive Design Checklist

Before approval, confirm:

## Strategy

- [ ] The screen supports a clear business and customer outcome.
- [ ] The primary user and job are defined.
- [ ] The design aligns with Volume 01.

## Trust

- [ ] Material terms are visible.
- [ ] Data status is clear.
- [ ] No fake urgency or proof is used.
- [ ] Human support is reachable.

## UX

- [ ] One primary action is clear.
- [ ] Navigation reflects user goals.
- [ ] Forms ask only necessary information.
- [ ] Loading, empty, error and success states exist.

## Visual System

- [ ] Approved tokens are used.
- [ ] Typography hierarchy is consistent.
- [ ] Spacing uses the defined scale.
- [ ] Status colors preserve semantic meaning.

## Mobile and Accessibility

- [ ] Mobile behavior is intentional.
- [ ] Touch targets are usable.
- [ ] Keyboard flow works.
- [ ] Contrast and focus are sufficient.
- [ ] Meaning is not conveyed by color alone.

## Content

- [ ] Copy is clear and honest.
- [ ] Prices, dates and conditions are verified.
- [ ] CTA labels describe actions.
- [ ] AI-generated content has been reviewed when required.

## Engineering

- [ ] Real data has been tested.
- [ ] Reusable components are used.
- [ ] Sensitive data is protected.
- [ ] Analytics and error monitoring are present.
- [ ] Performance is acceptable.

## AI

- [ ] AI has a defined purpose.
- [ ] Sources and confidence are handled.
- [ ] Human handoff exists.
- [ ] The AI Constitution is followed.

---

# Design Definition of Done

A design is done only when:

```text
Customer value is clear
AND
Brand rules are satisfied
AND
All core states are designed
AND
Mobile behavior is defined
AND
Accessibility is reviewed
AND
Content is verified
AND
Engineering can implement without guessing
AND
Success can be measured
```

---

# Closing Statement

Volume 01 defines what Minh Việt stands for.

Volume 02 defines how that belief becomes visible, usable and operational.

The purpose of the Design Operating System is not visual uniformity. It is consistent quality: every interaction should feel prepared, trustworthy, intelligent and human-centered.
