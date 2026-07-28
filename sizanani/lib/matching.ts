import {
  Opportunity,
  StudentProfile,
  MatchResult,
  MatchReason,
  MatchTier,
  IncomeBand,
} from "./types";
import { calculateAps } from "./aps";

// ---------------------------------------------------------------------------
// Explainable matching engine.
//
// Design principles (from the product spec):
//  - Hard eligibility rules can DISQUALIFY. A student who fails a compulsory
//    requirement is never shown a misleading high score.
//  - Everything else contributes weighted points and, crucially, a human
//    readable REASON so the recommendation can always be explained.
//  - Missing information is treated as "uncertain", never as a fail.
// ---------------------------------------------------------------------------

const INCOME_ORDER: IncomeBand[] = [
  "0-50k",
  "50k-120k",
  "120k-350k",
  "350k-600k",
  "600k+",
];

// Returns true if the student's income band is at or below the ceiling.
function incomeWithin(studentBand: IncomeBand, ceiling: IncomeBand): boolean | null {
  if (studentBand === "prefer-not-to-say") return null; // uncertain
  const s = INCOME_ORDER.indexOf(studentBand);
  const c = INCOME_ORDER.indexOf(ceiling);
  if (s === -1 || c === -1) return null;
  return s <= c;
}

export function daysUntil(deadline?: string): number | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function isOpen(o: Opportunity): boolean {
  const d = daysUntil(o.deadline);
  if (o.verification === "Expired") return false;
  if (d == null) return true; // no deadline specified — treat as potentially open
  return d >= 0;
}

interface Weighted {
  points: number;
  max: number;
  reasons: MatchReason[];
  disqualifiers: string[];
  nextActions: string[];
}

export function matchOne(profile: StudentProfile, o: Opportunity): MatchResult {
  const reasons: MatchReason[] = [];
  const disqualifiers: string[] = [];
  const nextActions: string[] = [];
  const el = o.eligibility;
  const aps = calculateAps(profile).aps;

  let points = 0;
  let max = 0;

  const add = (got: number, weight: number, reason?: MatchReason) => {
    points += got;
    max += weight;
    if (reason) reasons.push(reason);
  };

  // --- HARD RULE: citizenship ---------------------------------------------
  if (el.citizenship && el.citizenship.length) {
    if (!profile.citizenship) {
      reasons.push({ kind: "uncertain", label: "Confirm your citizenship status" });
    } else if (
      profile.citizenship === "SA citizen" ||
      profile.citizenship === "Permanent resident"
    ) {
      const ok = el.citizenship.includes(profile.citizenship as any);
      if (ok) {
        add(10, 10, { kind: "met", label: `You are a ${profile.citizenship}` });
      } else {
        disqualifiers.push(`Requires: ${el.citizenship.join(" or ")}`);
      }
    } else {
      disqualifiers.push(`Requires South African citizenship or residency`);
    }
  }

  // --- HARD RULE: minimum APS ---------------------------------------------
  if (el.minAps != null) {
    max += 20;
    if (profile.subjects.length === 0 && profile.mathMark == null) {
      reasons.push({ kind: "uncertain", label: `Add your marks to check the APS ${el.minAps} requirement` });
      nextActions.push("Capture your subject marks so we can verify your APS");
    } else if (aps >= el.minAps) {
      points += 20;
      reasons.push({ kind: "met", label: `Your estimated APS (${aps}) meets the minimum of ${el.minAps}` });
    } else if (aps >= el.minAps - 3) {
      points += 10;
      reasons.push({ kind: "uncertain", label: `Your APS (${aps}) is close to the minimum ${el.minAps} — improving marks could qualify you` });
      nextActions.push(`Aim to raise your APS by ${el.minAps - aps} point(s)`);
    } else {
      disqualifiers.push(`Minimum APS ${el.minAps} (your estimate: ${aps})`);
    }
  }

  // --- HARD RULE: requires Mathematics ------------------------------------
  if (el.requiresMathematics) {
    if (profile.mathType === "Mathematics") {
      add(6, 6, { kind: "met", label: "You take pure Mathematics" });
    } else if (profile.mathType === "None") {
      reasons.push({ kind: "uncertain", label: "Confirm whether you take Mathematics" });
    } else {
      disqualifiers.push("Requires Mathematics (not Mathematical Literacy)");
    }
  }

  // --- min Maths mark ------------------------------------------------------
  if (el.minMathMark != null) {
    max += 10;
    if (profile.mathMark == null) {
      reasons.push({ kind: "uncertain", label: `Add your Maths mark to check the ${el.minMathMark}% requirement` });
    } else if (profile.mathType !== "Mathematics") {
      disqualifiers.push(`Requires Mathematics at ${el.minMathMark}%`);
    } else if (profile.mathMark >= el.minMathMark) {
      points += 10;
      reasons.push({ kind: "met", label: `Your Maths mark (${profile.mathMark}%) exceeds the minimum ${el.minMathMark}%` });
    } else {
      disqualifiers.push(`Mathematics ${el.minMathMark}% (yours: ${profile.mathMark}%)`);
    }
  }

  // --- min English mark ----------------------------------------------------
  if (el.minEnglishMark != null) {
    max += 6;
    if (profile.englishMark == null) {
      reasons.push({ kind: "uncertain", label: `Add your English mark to check the ${el.minEnglishMark}% requirement` });
    } else if (profile.englishMark >= el.minEnglishMark) {
      points += 6;
      reasons.push({ kind: "met", label: `Your English mark (${profile.englishMark}%) meets the minimum ${el.minEnglishMark}%` });
    } else {
      disqualifiers.push(`English ${el.minEnglishMark}% (yours: ${profile.englishMark}%)`);
    }
  }

  // --- field of study alignment (preference, weighted) --------------------
  if (el.fields && el.fields.length) {
    max += 20;
    const overlap = el.fields.filter((f) => profile.fields.includes(f));
    if (profile.fields.length === 0) {
      reasons.push({ kind: "uncertain", label: "Tell us your fields of interest to improve this match" });
    } else if (overlap.length) {
      points += 20;
      reasons.push({ kind: "met", label: `Covers ${overlap.join(", ")}, which you're interested in` });
    } else {
      // Not a disqualifier, but a weak fit — surfaced as an alternative.
      reasons.push({ kind: "uncertain", label: `Funds ${el.fields.slice(0, 2).join(", ")} — different from your stated interests` });
    }
  }

  // --- income means-test (hard-ish) ---------------------------------------
  if (el.maxIncomeBand) {
    max += 15;
    if (!profile.incomeBand || profile.incomeBand === "prefer-not-to-say") {
      reasons.push({ kind: "uncertain", label: "Household income not provided — this bursary is means-tested" });
    } else {
      const within = incomeWithin(profile.incomeBand, el.maxIncomeBand);
      if (within === true) {
        points += 15;
        reasons.push({ kind: "met", label: "Your household income appears to meet the means test" });
      } else if (within === false) {
        disqualifiers.push("Household income above the means-test ceiling");
      }
    }
  }

  // --- province ------------------------------------------------------------
  if (el.provinces && el.provinces.length) {
    max += 8;
    if (!profile.province) {
      reasons.push({ kind: "uncertain", label: "Confirm your province" });
    } else if (el.provinces.includes(profile.province)) {
      points += 8;
      reasons.push({ kind: "met", label: `Open to learners in ${profile.province}` });
    } else if (profile.willingToRelocate) {
      points += 4;
      reasons.push({ kind: "uncertain", label: `Based in ${el.provinces.join(", ")} — you indicated willingness to relocate` });
    } else {
      disqualifiers.push(`Restricted to ${el.provinces.join(", ")}`);
    }
  }

  // --- disability requirement (voluntary, only where legitimate) ----------
  if (el.requiresDisability) {
    if (profile.indicators.disability) {
      add(8, 8, { kind: "met", label: "Reserved for learners with disabilities — you qualify" });
    } else {
      disqualifiers.push("Reserved for learners with a registered disability");
    }
  }

  // --- eligibility indicators BOOST access (never exclude) ----------------
  const ind = profile.indicators;
  if (ind.firstGeneration || ind.ruralBackground || ind.townshipBackground || ind.sassaBeneficiary) {
    // Many bursaries prioritise these groups; give a small positive nudge.
    add(4, 4, { kind: "met", label: "Your background may be prioritised by this provider" });
  }

  // --- deadline urgency & document readiness (advisory) -------------------
  const d = daysUntil(o.deadline);
  if (d != null && d >= 0 && d <= 45) {
    nextActions.push(`Apply soon — ${d} day(s) until the deadline`);
  }
  const missingDocs = o.requiredDocuments.filter(
    (doc) => !profile.documents.some((have) => have.toLowerCase() === doc.toLowerCase())
  );
  for (const doc of missingDocs.slice(0, 3)) {
    reasons.push({ kind: "missing", label: `Required document: ${doc}` });
    nextActions.push(`Prepare: ${doc}`);
  }
  if (o.essayRequired) nextActions.push("Write a motivational letter / essay");

  // If there were no scored criteria at all, base score on field fit.
  if (max === 0) {
    max = 10;
    if (o.fields.some((f) => profile.fields.includes(f))) points = 8;
    else points = 4;
  }

  const score = Math.round((points / max) * 100);
  const tier = classify(score, disqualifiers, reasons, o, profile);

  // Ensure "not eligible" never shows an inflated score.
  const finalScore = tier === "Not currently eligible" ? Math.min(score, 35) : score;

  if (nextActions.length === 0 && tier !== "Not currently eligible") {
    nextActions.push("Open the application workspace to get started");
  }

  return {
    opportunity: o,
    score: finalScore,
    tier,
    reasons: dedupeReasons(reasons),
    nextActions: [...new Set(nextActions)],
    disqualifiers,
  };
}

function classify(
  score: number,
  disqualifiers: string[],
  reasons: MatchReason[],
  o: Opportunity,
  profile: StudentProfile
): MatchTier {
  if (disqualifiers.length > 0) {
    // Close-but-failing on APS only → aspirational.
    const onlyApsGap =
      disqualifiers.length === 1 && /Minimum APS/.test(disqualifiers[0]);
    return onlyApsGap ? "Aspirational match" : "Not currently eligible";
  }
  const hasUncertain = reasons.some((r) => r.kind === "uncertain");
  const fieldFit = o.fields.some((f) => profile.fields.includes(f));

  if (score >= 80 && !hasUncertain) return "Strong match";
  if (score >= 65) return hasUncertain ? "Possible match" : "Strong match";
  if (score >= 45) return fieldFit ? "Possible match" : "Alternative opportunity";
  return "Alternative opportunity";
}

function dedupeReasons(reasons: MatchReason[]): MatchReason[] {
  const seen = new Set<string>();
  return reasons.filter((r) => {
    const key = r.kind + "|" + r.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const TIER_RANK: Record<MatchTier, number> = {
  "Strong match": 0,
  "Possible match": 1,
  "Aspirational match": 2,
  "Alternative opportunity": 3,
  "Not currently eligible": 4,
};

export function matchAll(
  profile: StudentProfile,
  opportunities: Opportunity[]
): MatchResult[] {
  return opportunities
    .map((o) => matchOne(profile, o))
    .sort((a, b) => {
      if (TIER_RANK[a.tier] !== TIER_RANK[b.tier]) {
        return TIER_RANK[a.tier] - TIER_RANK[b.tier];
      }
      return b.score - a.score;
    });
}
