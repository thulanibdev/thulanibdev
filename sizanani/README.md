# Sizanani — Student Opportunity Intelligence Platform

> **One student profile. Every suitable opportunity. One guided journey to education.**

A production-shaped MVP of the Sizanani platform: it helps South African
learners discover bursaries, universities, colleges and pathways matched to
their marks, interests and circumstances — and guides them from discovery all
the way to enrolment.

This directory is a self-contained **Next.js 15 + TypeScript** application. It
runs with no external services (the student profile is stored in the browser
and opportunities are seeded), so the entire experience is demonstrable
locally, while the code is structured so a real backend can drop in later.

## What's built (MVP)

| Area | Status |
| --- | --- |
| Guided 8-step student profile (save & continue) | ✅ |
| Transparent APS estimation | ✅ |
| **Explainable** rule-based matching engine (5 tiers, reasons, never inflates) | ✅ |
| Personalised dashboard / command centre | ✅ |
| Opportunity database (bursaries, universities, TVET, learnerships, support) | ✅ (seeded) |
| Advanced filters + natural-language search | ✅ |
| Application workspace: checklist, task dependencies, stages | ✅ |
| Deadline intelligence (risk, recommended submit date) | ✅ |
| Personalised document checklist | ✅ |
| Journey tracker with progress | ✅ |
| Grounded, safety-guarded AI adviser | ✅ |
| Application-readiness score (transparent) | ✅ |
| Accessibility: mobile-first, reduced-motion, text labels not colour-alone | ✅ |
| Unit tests for the matching engine | ✅ |

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for Phases 2–4 (mentorship, school &
provider portals, automated ingestion, analytics, pan-African expansion).

## Run it

```bash
cd sizanani
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm test           # matching-engine unit tests (node:test via tsx)
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Project layout

```
sizanani/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing / hero
│   ├── onboarding/         # 8-step guided profile
│   ├── dashboard/          # Student command centre
│   ├── opportunities/      # Search + detail/application workspace
│   ├── applications/       # Journey tracker
│   └── adviser/            # Grounded AI adviser
├── components/             # UI primitives (cards, rings, forms, nav)
├── lib/
│   ├── types.ts            # Domain model
│   ├── aps.ts              # APS estimation (institution-configurable)
│   ├── matching.ts         # Explainable matching engine  ← core IP
│   ├── matching.test.ts    # Unit tests
│   ├── readiness.ts        # Transparent readiness score
│   ├── adviser.ts          # Rule-based, safety-guarded adviser
│   ├── nlsearch.ts         # Natural-language query parser
│   ├── seed.ts             # Seeded opportunities
│   └── store.tsx           # Client store (localStorage)
└── docs/                   # PRD, schema, architecture, matching, roadmap
```

## Design principles (enforced in code)

- **Never invent a requirement.** Missing data is shown as *"Not specified by
  the provider"* and treated as *uncertain* in matching — never as a fail.
- **Never hide a disqualification behind a high score.** A learner who fails a
  compulsory requirement is capped and clearly told why (see `matching.ts`).
- **Always explain and always cite.** Every match and adviser answer lists its
  reasons and links to an official source.
- **Hopeful, never rejecting.** When a learner doesn't qualify, the platform
  surfaces realistic alternative pathways (diplomas, extended programmes, TVET).
- **Privacy first.** Sensitive indicators are optional, never public, and only
  ever used to *widen* access — never to exclude.

## Not in this MVP (by design)

Real authentication, Postgres/Prisma persistence, document uploads/vault,
live web scraping, SMS/WhatsApp, and the mentor/school/provider/admin portals
are specified in the docs and scoped into later phases. The MVP deliberately
proves the core value loop first.
