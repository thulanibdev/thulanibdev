# Architecture, Ingestion, Privacy & API

## Target stack
- **Frontend:** Next.js (App Router) + TypeScript, mobile-first, PWA + low-data
  mode, server-side rendering for opportunity pages. *(This MVP is exactly
  this, minus PWA offline caching.)*
- **Backend:** Node.js (NestJS) modular services; REST with strict authЗ;
  background workers (BullMQ/Redis) for ingestion & notifications.
- **Data:** PostgreSQL + Prisma; Redis (cache/queues/rate-limit); object
  storage (S3-compatible) for encrypted documents; Meilisearch/OpenSearch for
  opportunity search.
- **Ingestion:** Python workers (Scrapy/Playwright), scheduled crawling,
  structured extraction, validation pipelines, manual-review queues.
- **AI (only where it adds value):** requirement extraction, summarisation,
  duplicate detection, NL search, adviser phrasing — always on top of the
  rule-based engine, never overriding official requirements.
- **Infra:** containerised, environment separation, backups, monitoring, error
  tracking, centralised logging, secret management, CI/CD, security scanning.

## Data ingestion & verification pipeline
```
Sources (provider sites, university/TVET sites, gov portals, APIs, RSS,
         provider submissions, spreadsheet import, email, manual entry)
   │  (respect robots.txt, terms, rate limits; no auth bypass; store facts +
   │   short summaries + official link, not full copyrighted pages)
   ▼
Extract → Normalise → Validate → Deduplicate → Confidence score
   ▼
Change detection (deadline/open/close/requirement/link/funding/removal)
   ▼
Review queue  ──►  VerificationReview  ──►  status:
   Verified by Sizanani | Verified by provider | Automatically discovered |
   Awaiting verification | Possible duplicate | Information may have changed |
   Expired | Archived
```
Rules enforced platform-wide (mirrored in the MVP UI):
- **Never invent** a deadline, requirement or amount → show *"Not specified by
  the provider."*
- Conflicting sources are flagged, prefer the latest official source, require
  review before "verified".
- Every record keeps `sourceUrl`, `lastChecked`, `verification`, and a
  change history; broken-link and duplicate detection run continuously.

## Privacy, consent & security (POPIA-aligned)
- Processing minors' data → age-appropriate consent, parent/guardian consent
  where required, versioned `ConsentRecord`.
- Data minimisation & purpose limitation; sensitive indicators are optional,
  never public, and only widen access.
- RBAC; MFA for admins; encryption in transit & at rest; secure password
  hashing (argon2/bcrypt); login rate-limiting; session management; audit &
  document-access logs; data-export & account-deletion tools; breach response.
- No selling of student data; no unrelated advertising; no sharing with
  providers without informed consent.

## Trust & safety
Scam heuristics flag unofficial payment requests, personal bank accounts,
suspicious domains, missing provider identity, unrealistic guarantees, and
password/PII requests. Verification badge shown **only** after verification.
"Report this opportunity" on every detail page.

## API specification (representative)
All endpoints: authenticated (JWT/session), authorised by role, validated,
rate-limited, audited on writes. Errors use RFC-7807 problem+json.

| Method & path | Auth | Role | Notes |
| --- | --- | --- | --- |
| `POST /auth/register`, `POST /auth/login` | public | — | rate-limited, MFA for admins |
| `GET/PUT /me/profile` | ✔ | student | onboarding autosave |
| `POST /me/results` | ✔ | student | recompute APS & matches |
| `GET /opportunities` | ✔ | any | filters + NL query → structured |
| `GET /opportunities/:id` | ✔ | any | detail + verification/source |
| `GET /me/recommendations` | ✔ | student | explainable `MatchResult[]` |
| `POST /me/saved` / `DELETE /me/saved/:id` | ✔ | student | journey |
| `GET/POST /me/applications` `PATCH /:id` | ✔ | student | stage, tasks |
| `POST /me/documents` | ✔ | student | encrypted upload (Phase 2) |
| `GET /me/notifications` | ✔ | student | preferences honoured |
| `POST /adviser/ask` | ✔ | student | grounded, cited, guard-railed |
| `POST /providers/opportunities` | ✔ | provider | high-impact fields → review |
| `POST /admin/opportunities` `POST /admin/verify/:id` | ✔ | admin | audited |
| `POST /ingest/scrape-result` | ✔ (service) | worker | into review queue |
| `GET /school/overview`, `GET /mentor/caseload` | ✔ | school/mentor | consented, k-anon |

## How the MVP maps to this
The browser store (`lib/store.tsx`) stands in for `/me/*` endpoints and uses
the identical types, so replacing it with `fetch` calls is a localised change.
The matching engine, readiness score, adviser and NL parser are already pure
server-portable modules.
