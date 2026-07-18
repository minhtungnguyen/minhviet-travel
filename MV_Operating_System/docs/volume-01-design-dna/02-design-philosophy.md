# 02 — DESIGN PHILOSOPHY

## 1. Purpose

This chapter defines how design decisions are made across Minh Việt Travel Platform.

It converts brand intent into durable rules that can guide websites, mobile applications, CMS, CRM, booking, AI and future digital products.

---

## 2. Governing Statement

> Minh Việt Travel does not merely display travel products. It guides people and organisations from uncertainty to a confident travel decision.

The interface must support that journey.

---

## 3. Design Is an Operating Capability

Design is not a final decorative layer.

Design determines:

- what information appears first;
- how choices are compared;
- when the system asks for customer data;
- how trust is established;
- how staff and customers understand booking status;
- how AI recommendations are explained;
- how brand quality remains consistent across channels.

Every design decision must serve a user, business or operational purpose.

---

## 4. The Seven Governing Philosophies

### 4.1 Editorial, not promotional

Pages should feel curated like a high-quality travel publication and structured like a modern digital product.

This means:

- fewer but stronger images;
- meaningful headlines;
- clear narrative flow;
- deliberate content order;
- restrained promotion;
- contextual calls to action.

This does not mean turning every page into a magazine. Transactional clarity remains mandatory.

### 4.2 Guided, not crowded

The platform must help the user progress through decisions.

Use progressive disclosure:

1. Present the essential choice.
2. Provide relevant comparison.
3. Reveal detail when needed.
4. Confirm the next step.

Do not place all filters, policies, promotions, destinations and support options at equal visual priority.

### 4.3 Precise, not sterile

Precision comes from alignment, hierarchy, states and language.

Human warmth comes from photography, stories, advisors and service tone.

The product must combine both.

### 4.4 Premium, not ornamental

A premium interface reduces unnecessary elements.

When choosing between adding decoration and improving spacing, typography, imagery or content quality, improve the fundamentals.

### 4.5 Intelligent, not futuristic

AI must appear where it provides measurable user value.

AI may:

- interpret travel needs;
- recommend suitable tours;
- summarise programmes;
- explain differences;
- generate an itinerary from approved data;
- assist staff operations.

AI must not:

- dominate every page;
- invent facts;
- appear as a robot mascot without purpose;
- replace essential human contact;
- create unexplained recommendations.

### 4.6 Enterprise-ready, not enterprise-old

Corporate, institutional and MICE users need evidence of capability, control and accountability.

Provide:

- structured service scopes;
- process visibility;
- clear responsibility;
- case evidence;
- formal enquiry paths;
- operational detail.

Avoid:

- dense government-style pages;
- excessive forms;
- spreadsheet aesthetics;
- small text and heavy borders;
- document-like layouts on every screen.

### 4.7 Systemic, not page-by-page

A page is not allowed to invent its own visual language.

All pages must share:

- semantic tokens;
- typography roles;
- spacing logic;
- interaction states;
- responsive behavior;
- accessibility rules;
- component principles.

Local variation is allowed only when required by content or user task.

---

## 5. Decision Framework

For every proposed visual element, ask in order:

1. What user problem does this solve?
2. What business or operational goal does it support?
3. Can the goal be achieved with an existing pattern?
4. Does the element improve hierarchy or create noise?
5. Does it preserve trust and accessibility?
6. Does it comply with the emotional direction?
7. Is it still effective on mobile?

If Questions 1 and 2 have no clear answer, remove the element.

---

## 6. Information Hierarchy Rules

Every screen must define:

- one page purpose;
- one primary user action;
- up to two secondary actions;
- one dominant content hierarchy;
- one clear path forward.

Within one viewport:

- only one element may visually behave as the primary CTA;
- major headings must not compete with promotional banners;
- badges must remain subordinate to content;
- support tools must not obscure the primary task;
- decorative content must never exceed functional content in prominence.

---

## 7. Restraint Rules

The following defaults apply unless a documented exception exists:

- no more than one dominant brand color in a viewport;
- no more than one major decorative treatment per section;
- no more than one strong shadow depth per page type;
- no more than one primary CTA style;
- no autoplay video with sound;
- no animation that delays reading or action;
- no decorative icon where text is clearer;
- no badge without useful meaning.

---

## 8. Authenticity Rules

The platform must use real, supportable claims.

Required:

- actual company information;
- approved tour data;
- real policies;
- real advisors or clearly labelled representative profiles;
- realistic availability status;
- authentic or properly licensed imagery;
- verifiable case studies.

Forbidden:

- invented reviews;
- fake booking counts;
- artificial scarcity;
- fabricated awards;
- unsupported “number one” claims;
- generated destination facts presented as verified data.

---

## 9. Responsive Philosophy

Mobile is not a reduced desktop layout.

On mobile:

- the primary action must remain clear;
- content order may change;
- sidebars become contextual drawers or sections;
- comparison may become progressive;
- sticky actions must not cover content;
- touch targets must remain usable;
- photography must retain meaningful crops;
- text must not be compressed to preserve desktop density.

---

## 10. Accessibility Philosophy

Accessibility is part of quality, not a compliance add-on.

The interface must support:

- sufficient contrast;
- keyboard navigation;
- visible focus states;
- semantic headings;
- meaningful labels;
- understandable errors;
- readable text sizing;
- reduced-motion preferences;
- screen-reader-compatible controls.

Brand color must never be used in a way that weakens readability.

---

## 11. Design Debt Policy

A temporary interface shortcut must be recorded as design debt when it:

- violates Volume 01;
- introduces a one-off component;
- duplicates an existing pattern;
- lacks a required state;
- fails mobile or accessibility requirements;
- uses placeholder content likely to affect layout.

Design debt records must include:

- location;
- reason;
- user impact;
- proposed resolution;
- priority;
- owner.

---

## 12. Claude Code Implementation Behavior

Claude Code must follow this sequence:

1. State the page purpose.
2. State the primary user action.
3. State the intended emotion.
4. Identify reusable components.
5. Identify current violations.
6. Propose the smallest compliant implementation.
7. Implement responsive and interaction states.
8. Run acceptance checks.
9. Report unresolved design debt.

Claude Code must not begin by selecting colors or creating a hero section before establishing hierarchy and page purpose.

---

## 13. Acceptance Criteria

A design philosophy implementation passes when:

- the page purpose is obvious within several seconds;
- the primary action is visually clear;
- the page does not rely on yellow as its visual identity;
- content hierarchy works without decorative effects;
- the page feels modern, calm and trustworthy;
- mobile behavior is intentionally designed;
- AI features have a clear user benefit;
- enterprise content feels structured but not outdated;
- no unsupported claims or fake urgency are present;
- existing components are reused where appropriate.
