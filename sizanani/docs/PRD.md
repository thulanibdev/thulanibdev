# Sizanani — Product Requirements (condensed)

## 1. Mission
Ensure no learner misses an education or funding opportunity because they
didn't know it existed, didn't understand the requirements, missed a deadline,
applied for an unsuitable course, or lacked support. Move each learner through:
**Discovery → Eligibility → Preparation → Application → Follow-up → Outcome.**

Promise: *One student profile. Every suitable opportunity. One guided journey to education.*

## 2. Personas
- **Thabo, 17, Grade 12 (township, Gauteng)** — strong Maths, needs full
  funding, first-generation applicant. Wants to know what he qualifies for and
  what to do next, on a low-end phone with limited data.
- **Naledi, 18, matric complete (rural, Limpopo)** — unsure of career, no
  device. Needs alternative pathways (TVET, extended programmes) and guidance.
- **Mrs Dlamini — parent/guardian** — wants to help without taking over; needs
  to know deadlines and which documents to provide.
- **Mr Khumalo — Life Orientation teacher / counsellor** — supports 120
  learners; needs to see who is at risk of missing deadlines.
- **Zanele — Sizanani mentor** — assigned learners; reviews applications,
  documents and motivational letters; escalates urgent cases.
- **Sizanani admin** — curates & verifies opportunities, resolves conflicts,
  configures matching weights and APS rules, monitors impact.
- **Opportunity provider** — submits/updates verified opportunities.

## 3. Core user journeys
1. **Discover → Apply (student).** Onboard → see explainable matches → open an
   opportunity → save → work the checklist → submit → track outcome.
2. **Don't qualify → alternative.** Disqualified on APS → shown extended/diploma/
   TVET routes and what marks would unlock the first choice.
3. **Stay on track.** Dashboard surfaces the single highest-priority next action
   and the nearest at-risk deadline every visit.

## 4. Feature prioritisation (MoSCoW for MVP)
- **Must:** profile, academic capture, APS, opportunity DB, explainable
  matching, search, saved opportunities, application tracker, deadline
  reminders (in-app), document checklist, admin import (future-phase data
  model), verified source links, basic adviser, mobile-first, privacy posture.
- **Should:** natural-language search, readiness score, deadline-risk scoring.
- **Could:** gamified milestones, comparison view.
- **Won't (this release):** live scraping, mentorship/school/provider portals,
  document vault, SMS/WhatsApp — see roadmap.

## 5. Information architecture / sitemap
```
/                     Landing (hero, how-it-works, promise)
/onboarding           8-step guided profile (save & continue)
/dashboard            Command centre: readiness, next action, matches, deadlines
/opportunities        Search + filters + NL query
/opportunities/[id]   Detail + application workspace (checklist, stages, source)
/applications         Journey tracker (all saved applications + progress)
/adviser              Grounded AI adviser
```
Future: `/mentor`, `/school`, `/parent`, `/admin`, `/provider`.

## 6. MVP acceptance criteria (from the brief)
- ✅ A learner can complete a detailed profile on a mobile phone.
- ✅ The system recommends relevant bursaries and programmes.
- ✅ Every recommendation includes an understandable explanation.
- ✅ Every opportunity links to an official / clearly identified source.
- ✅ Deadlines are displayed clearly; expired items are not shown as open.
- ✅ Students can track applications and see missing documents.
- ✅ The platform does not invent eligibility requirements.
- ✅ Alternative pathways are provided when a learner does not qualify.
- ✅ Works on slow connections (static-rendered, ~120 kB first load).
- ⏳ Admin verification/correction UI, real persistence — scoped to Phase 2.

## 7. UX principles
Hopeful, intelligent, supportive language. Every screen answers *"what's my
next best action?"* Never "you failed" / "no options" / "impossible". Empty,
loading, error and success states everywhere.
