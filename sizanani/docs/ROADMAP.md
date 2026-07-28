# Roadmap, Testing, Deployment & Risks

## Delivery phases

### MVP (this build)
Student registration model, deep profile, academic capture + APS, opportunity
DB (seeded), explainable matching, search + NL query, saved opportunities,
application tracker, deadline intelligence, document checklist, grounded
adviser, readiness score, mobile-first accessible UI, privacy posture.

### Phase 2
Real auth + Postgres/Prisma persistence; **document vault** (encrypted uploads,
certification/expiry tracking, mentor access with student revocation);
mentorship module + mentor dashboard; school dashboards; parent accounts;
provider portal; **automated web ingestion + verification queue** (admin UI);
motivational-letter assistant & CV builder; email + SMS/WhatsApp notifications;
admin dashboard (verify/correct/merge/import, matching-weight & APS config).

### Phase 3
Predictive deadline discovery; advanced career/psychometric assessment;
university application integrations; outcome tracking end-to-end;
provincial/national analytics & provider analytics; multilingual support;
full low-data/offline PWA.

### Phase 4
Roll-out across all nine provinces; pan-African opportunity database with
country-specific eligibility engines; international scholarships; cross-border
institution discovery; regional education-data partnerships.

## Testing strategy
- **Unit:** matching engine (present — 8 tests), APS, readiness, NL parser,
  adviser guardrails. Property tests: "no disqualified opportunity scores >35",
  "missing data never disqualifies".
- **Integration:** API auth/authz, ingestion validation, change detection.
- **E2E (Playwright):** onboarding on a throttled mobile profile, save/continue,
  match → save → submit journey, adviser Q&A.
- **Accessibility:** axe-core in CI, keyboard-only pass, screen-reader smoke,
  contrast checks, "colour never the only signal" audit.
- **Data-integrity:** golden tests that no deadline/requirement is fabricated;
  expired items never render as open.

## Deployment plan
Containerised (Docker) → managed Kubernetes or a PaaS (e.g. Vercel for the
Next.js frontend + a Node API service). Environments: dev / staging / prod with
separate data. CI: typecheck → lint → unit → build → E2E → security scan →
deploy. Automated Postgres backups (PITR), object-storage versioning, uptime &
error monitoring, centralised logs, secret manager, documented DR runbook.

## Estimated infrastructure (early production)
- App: 2× small Next.js instances behind a CDN.
- API/workers: 2× small Node services + 1 worker pool.
- Postgres (managed, ~2 vCPU/8 GB + PITR), Redis (small), object storage,
  Meilisearch (single node). Comfortably serves the initial provincial cohort;
  scales horizontally per tier.

## Risk register (top items)
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Fabricated/stale opportunity data misleads a learner | High | Verification pipeline, `lastChecked`, "info may have changed", golden data-integrity tests, official-source links |
| Scraping breaches a site's terms / robots.txt | High | Respect robots/terms/rate-limits, store facts+summaries not full pages, provider opt-out & correction |
| Mishandling minors' personal data | High | POPIA-aligned consent, encryption, RBAC, audit logs, deletion tools |
| Bursary scams impersonating providers | High | Scam heuristics, verification badges, report flow, safety notices |
| Over-reliance on AI for eligibility | Med | Rule-based engine is authoritative; AI may only cite engine facts |
| Digital divide (low-end phones, data cost) | Med | Low-data mode, offline PWA, small JS payloads, plain language |
| Matching perceived as unfair/opaque | Med | Every decision explained; indicators only widen access |
