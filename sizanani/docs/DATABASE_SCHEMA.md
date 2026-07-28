# Database Schema (target: PostgreSQL + Prisma)

The MVP persists the student profile in the browser, but the domain model in
`lib/types.ts` is the same shape as the production schema below. Relational
design, retention and privacy notes included.

## Conventions
- All tables have `id (uuid pk)`, `created_at`, `updated_at`.
- Soft-delete via `deleted_at` on user-owned records; hard-delete honoured for
  account deletion (POPIA data-subject rights).
- Sensitive columns (marks, income band, indicators, documents) are encrypted
  at rest and access-logged.

## Core entities & key relationships

```
User (role: student|parent|teacher|mentor|school_admin|sizanani_admin|provider)
 └─1:1 StudentProfile
        ├─1:N AcademicResult ─N:1 Subject
        ├─1:N CareerInterest
        ├─1:N Document ─N:1 DocumentRequirement
        ├─1:N ConsentRecord            (versioned; parent/guardian consent)
        ├─1:N SavedOpportunity ─N:1 Opportunity
        ├─1:N Application
        │      ├─1:N ApplicationTask   (supports blockedBy dependency)
        │      └─1:1 Outcome
        ├─1:N StudentOpportunityMatch ─N:1 Opportunity   (cached, explainable)
        ├─1:N Notification
        └─N:1 School, N:1 MentorAssignment ─N:1 Mentor

Opportunity ─N:1 OpportunityProvider
 ├─1:N OpportunityRequirement / EligibilityRule
 ├─1:1 FundingBenefit
 ├─1:N ApplicationDeadline (historical opening/closing patterns)
 ├─N:1 DataSource ─1:N ScrapeJob
 ├─1:N VerificationReview
 ├─1:N ChangeHistory        (audit of field-level changes)
 └─1:N ReportedOpportunity  (scam/trust reports)

Institution ─1:N Campus ─1:N Qualification ─1:N ProgrammeRequirement
Appointment, MentorNote, AuditLog (global, append-only)
```

## Enumerations (see `lib/types.ts` for the live source of truth)
- `Province` (9), `Grade`, `MathType`, `IncomeBand`, `FieldOfStudy`,
  `QualificationLevel`, `OpportunityType`, `VerificationStatus`,
  `MatchTier`, `ApplicationStage`.

## Selected indexes / constraints
- `Opportunity(type, deadline)` — dashboard "closing soon" queries.
- `Opportunity(verification)` partial index for the review queue.
- `StudentOpportunityMatch(studentId, tier, score desc)` — ranked feeds.
- `Application(studentId, stage)` — journey tracker & risk detection.
- `Document(studentId, category)`; unique `(studentId, opportunityId)` on
  `SavedOpportunity`.
- FK `ApplicationTask.blockedBy → ApplicationTask.id` (nullable) for the
  dependency graph.

## Retention rules
| Data | Retention |
| --- | --- |
| Student profile & documents | Until account deletion or 24 months after last activity; deletion is honoured immediately |
| Consent records | 5 years (audit) |
| Audit / access logs | 3 years, append-only |
| Archived opportunity versions | Indefinite (auditability), no personal data |
| Notifications | 12 months |

Small-group analytics are suppressed (k-anonymity) so no individual learner is
identifiable in aggregate dashboards.
