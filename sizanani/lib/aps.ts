import { StudentProfile, SubjectMark } from "./types";

// ---------------------------------------------------------------------------
// APS (Admission Point Score) estimation.
//
// IMPORTANT: universities in South Africa do NOT all calculate APS the same
// way. This implements the most common 7-point scale (used by UP, UJ and
// others) as a transparent DEFAULT. Institution-specific rules live in the
// opportunity record and can override this. We never present this as
// authoritative — the UI always labels it "estimated".
// ---------------------------------------------------------------------------

export interface ApsBand {
  min: number; // inclusive lower bound of the percentage band
  points: number;
}

// Standard 7-point APS bands.
export const DEFAULT_APS_BANDS: ApsBand[] = [
  { min: 80, points: 7 },
  { min: 70, points: 6 },
  { min: 60, points: 5 },
  { min: 50, points: 4 },
  { min: 40, points: 3 },
  { min: 30, points: 2 },
  { min: 0, points: 1 },
];

export function pointsForMark(mark: number, bands: ApsBand[] = DEFAULT_APS_BANDS): number {
  for (const band of bands) {
    if (mark >= band.min) return band.points;
  }
  return 0;
}

// Life Orientation is usually excluded or weighted differently; most APS
// calculations use the best 6 subjects excluding LO.
function isCounted(subject: string): boolean {
  return !/life orientation/i.test(subject.trim());
}

export interface ApsBreakdown {
  aps: number;
  countedSubjects: { subject: string; mark: number; points: number }[];
  note: string;
}

export function calculateAps(profile: StudentProfile): ApsBreakdown {
  // If the student told us their official APS, trust it but still show working.
  const all: SubjectMark[] = [...profile.subjects];

  // Ensure Maths and English are represented from the dedicated fields.
  if (profile.mathType === "Mathematics" && profile.mathMark != null) {
    if (!all.some((s) => /math/i.test(s.subject))) {
      all.push({ subject: "Mathematics", mark: profile.mathMark });
    }
  } else if (profile.mathType === "Mathematical Literacy" && profile.mathMark != null) {
    if (!all.some((s) => /math/i.test(s.subject))) {
      all.push({ subject: "Mathematical Literacy", mark: profile.mathMark });
    }
  }
  if (profile.englishMark != null && !all.some((s) => /english/i.test(s.subject))) {
    all.push({ subject: "English", mark: profile.englishMark });
  }

  const counted = all
    .filter((s) => isCounted(s.subject) && Number.isFinite(s.mark))
    .map((s) => ({ subject: s.subject, mark: s.mark, points: pointsForMark(s.mark) }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 6);

  const aps = counted.reduce((sum, s) => sum + s.points, 0);

  const note =
    profile.apsOverride != null
      ? `Using the APS you entered (${profile.apsOverride}). Estimated from marks: ${aps}.`
      : counted.length < 6
        ? `Estimated from ${counted.length} subject(s) — add more marks for an accurate score.`
        : "Estimated using the standard 7-point scale (best 6 subjects, excluding Life Orientation).";

  return {
    aps: profile.apsOverride != null ? profile.apsOverride : aps,
    countedSubjects: counted,
    note,
  };
}
