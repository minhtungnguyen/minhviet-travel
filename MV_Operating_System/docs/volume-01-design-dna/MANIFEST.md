# VOLUME 01 — MANIFEST

## Package Information

- **Name:** Volume 01 — Design DNA
- **Package:** Batch 01 — Foundation
- **Version:** 1.0
- **Language:** English specifications with Vietnamese project context
- **Target users:** Product owner, UI/UX designer, frontend developer, Claude Code and QA

---

## Included Files

| File | Purpose | Mandatory |
|---|---|---:|
| `README.md` | Governing design constitution and usage rules | Yes |
| `MANIFEST.md` | Reading order, scope and document control | Yes |
| `01-brand-emotion.md` | Defines the emotional outcome of the product interface | Yes |
| `02-design-philosophy.md` | Defines decision principles and implementation behavior | Yes |
| `CLAUDE_CODE_INSTRUCTION.md` | Operational prompt for repository analysis and UI alignment | Yes for Claude Code |
| `BATCH_01_ACCEPTANCE_CHECKLIST.md` | Review checklist for validating current and future UI | Yes for review |

---

## Required Reading Order

1. `README.md`
2. `01-brand-emotion.md`
3. `02-design-philosophy.md`
4. `BATCH_01_ACCEPTANCE_CHECKLIST.md`
5. `CLAUDE_CODE_INSTRUCTION.md`

Claude Code must not read only the prompt file and ignore the governing chapters.

---

## Scope of Batch 01

Batch 01 defines:

- the intended emotional position;
- the design worldview;
- mandatory design behavior;
- the distinction between premium travel technology and traditional travel-agency design;
- initial review criteria;
- instructions for auditing current code.

Batch 01 does not define:

- final HEX color tokens;
- typography scale;
- spacing scale;
- responsive breakpoints;
- component variants;
- animation duration tokens;
- final photography library;
- Tailwind implementation.

Those items belong to later Batch 02 and Batch 03 documents.

---

## Change Control

Any future revision must include:

- version number;
- date;
- reason for change;
- affected files;
- affected components or pages;
- required migration tasks.

No design rule may be silently changed only in code.

---

## Source of Truth Rule

When UI screenshots, existing code, old prompts or previous documents conflict with this package, this package takes precedence unless the product owner explicitly approves an exception.
