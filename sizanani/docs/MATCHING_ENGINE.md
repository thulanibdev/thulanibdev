# Matching Engine

The matching engine (`lib/matching.ts`) is the platform's core intellectual
property. It is **explainable and rule-based by design** — never a black box —
because eligibility decisions affect real learners' futures.

## Inputs
- `StudentProfile` (marks, APS, fields, finances, province, indicators, documents)
- An `Opportunity` with structured `Eligibility` criteria

## How a score is produced
Each opportunity defines criteria. Every criterion contributes to two running
totals — `points` earned and `max` possible — and, crucially, a human-readable
**reason** tagged as one of:

| kind | meaning | effect |
| --- | --- | --- |
| `met` | requirement satisfied | adds points |
| `uncertain` | data missing / needs confirmation | no penalty, flagged |
| `missing` | a required document isn't ready | advisory + next action |
| `failed` | a **hard** requirement is not met | becomes a *disqualifier* |

`score = round(points / max * 100)`.

### Hard rules (can disqualify)
Citizenship, minimum APS, Mathematics-required, minimum Maths/English marks,
income means-test ceiling, province restriction, disability-reserved awards.
A failed hard rule is pushed to `disqualifiers[]`.

### Weighted preferences (never disqualify)
Field-of-study alignment, willingness to relocate, and priority-group
indicators (first-generation, rural/township, SASSA) which only ever **widen**
access.

## Classification (5 tiers)
```
disqualifiers > 0 ?
   └── only failing on APS by a little  → "Aspirational match"
   └── otherwise                        → "Not currently eligible"
score ≥ 80 and no uncertainty          → "Strong match"
score ≥ 65                             → "Strong / Possible match"
score ≥ 45                             → "Possible / Alternative"
else                                   → "Alternative opportunity"
```

## Two guarantees enforced in code
1. **No inflated scores for the ineligible.** A `Not currently eligible` result
   is capped at 35% so a compulsory disqualification can never masquerade as a
   high match. (Test: *"Maths Literacy student is disqualified…"*)
2. **Missing information is never a failure.** Absent marks/income produce
   `uncertain` reasons and a next action, not a rejection. (Test: *"missing info
   produces uncertain reasons, never a fail"*.)

## Output (`MatchResult`)
```ts
{ opportunity, score, tier, reasons[], nextActions[], disqualifiers[] }
```
`matchAll()` ranks results by tier, then score, so strong matches always sort
ahead of not-eligible ones (asserted in tests).

## Extending it
- **APS rules are institution-configurable** (`lib/aps.ts`, `DEFAULT_APS_BANDS`)
  because SA universities calculate APS differently.
- Weights are constants today; the admin "matching weights" config in the
  roadmap externalises them without touching the classification logic.
- An LLM layer may sit *on top* of this to phrase answers, but may only cite
  facts this engine produced — it must never override a disqualifier.
