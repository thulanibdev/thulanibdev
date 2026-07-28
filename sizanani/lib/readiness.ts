import { StudentProfile } from "./types";

// ---------------------------------------------------------------------------
// Application-readiness score (0-100), transparent by construction.
// Each factor is worth a fixed weight and reports whether it is complete,
// so the UI can explain exactly how the number was reached.
// ---------------------------------------------------------------------------

export interface ReadinessFactor {
  label: string;
  weight: number;
  complete: boolean;
  hint?: string;
}

export interface Readiness {
  score: number;
  factors: ReadinessFactor[];
  completed: string[];
  outstanding: string[];
}

export function computeReadiness(profile: StudentProfile): Readiness {
  const factors: ReadinessFactor[] = [
    {
      label: "Personal profile",
      weight: 15,
      complete: Boolean(profile.fullName && profile.province && profile.citizenship),
      hint: "Add your name, province and citizenship",
    },
    {
      label: "Academic results",
      weight: 20,
      complete: profile.subjects.length >= 4 || profile.mathMark != null,
      hint: "Capture your subject marks",
    },
    {
      label: "Career & study interests",
      weight: 15,
      complete: profile.fields.length > 0,
      hint: "Choose the fields you want to study",
    },
    {
      label: "Financial profile",
      weight: 10,
      complete: Boolean(profile.incomeBand),
      hint: "Add your household income band (helps bursary matching)",
    },
    {
      label: "Identity document",
      weight: 10,
      complete: profile.documents.some((d) => /id|identity|birth/i.test(d)),
      hint: "Confirm you have your SA ID or birth certificate",
    },
    {
      label: "Latest school report",
      weight: 10,
      complete: profile.documents.some((d) => /report|results|transcript/i.test(d)),
      hint: "Get a certified copy of your latest report",
    },
    {
      label: "Proof of income",
      weight: 8,
      complete: profile.documents.some((d) => /income|payslip|affidavit|sassa/i.test(d)),
      hint: "Bursaries usually need proof of household income",
    },
    {
      label: "Motivational letter",
      weight: 7,
      complete: profile.documents.some((d) => /motivation|letter|essay/i.test(d)),
      hint: "Draft a motivational letter you can reuse",
    },
    {
      label: "Two programme selections",
      weight: 5,
      complete: profile.qualificationLevels.length > 0,
      hint: "Pick the qualification levels you'd consider",
    },
  ];

  const earned = factors.filter((f) => f.complete).reduce((s, f) => s + f.weight, 0);
  const total = factors.reduce((s, f) => s + f.weight, 0);
  const score = Math.round((earned / total) * 100);

  return {
    score,
    factors,
    completed: factors.filter((f) => f.complete).map((f) => f.label),
    outstanding: factors.filter((f) => !f.complete).map((f) => f.hint || f.label),
  };
}
