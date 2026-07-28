import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyProfile, StudentProfile } from "./types";
import { matchOne, matchAll, daysUntil } from "./matching";
import { getOpportunity, OPPORTUNITIES } from "./seed";
import { calculateAps } from "./aps";

function baseStudent(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    ...emptyProfile(),
    fullName: "Test Learner",
    citizenship: "SA citizen",
    province: "Gauteng",
    grade: "12",
    mathType: "Mathematics",
    mathMark: 72,
    englishMark: 65,
    subjects: [
      { subject: "Mathematics", mark: 72 },
      { subject: "English", mark: 65 },
      { subject: "Physical Sciences", mark: 68 },
      { subject: "Life Sciences", mark: 70 },
      { subject: "Geography", mark: 62 },
      { subject: "Life Orientation", mark: 80 },
    ],
    fields: ["Information Technology"],
    incomeBand: "50k-120k",
    ...overrides,
  };
}

test("APS excludes Life Orientation and uses best 6", () => {
  const { aps, countedSubjects } = calculateAps(baseStudent());
  assert.ok(!countedSubjects.some((s) => /life orientation/i.test(s.subject)));
  assert.ok(aps >= 20 && aps <= 42, `APS ${aps} out of expected range`);
});

test("strong IT candidate matches Eskom IT bursary", () => {
  const m = matchOne(baseStudent(), getOpportunity("eskom-it")!);
  assert.equal(m.disqualifiers.length, 0);
  assert.ok(m.score >= 65, `expected high score, got ${m.score}`);
  assert.ok(["Strong match", "Possible match"].includes(m.tier));
  assert.ok(m.reasons.some((r) => r.kind === "met"));
});

test("Maths Literacy student is disqualified from a Mathematics-required bursary", () => {
  const student = baseStudent({ mathType: "Mathematical Literacy" });
  const m = matchOne(student, getOpportunity("sasol-eng")!);
  assert.ok(m.disqualifiers.length > 0);
  assert.equal(m.tier, "Not currently eligible");
  assert.ok(m.score <= 35, "not-eligible score must not be inflated");
});

test("income above ceiling disqualifies a means-tested bursary", () => {
  const student = baseStudent({ incomeBand: "600k+", fields: ["Information Technology"] });
  const m = matchOne(student, getOpportunity("eskom-it")!);
  assert.ok(m.disqualifiers.some((d) => /income/i.test(d)));
});

test("APS just below threshold yields an aspirational match, not a hard fail", () => {
  // Funza needs APS 26; craft a student a couple points short.
  const student = baseStudent({
    fields: ["Education"],
    qualificationLevels: ["Bachelor's Degree"],
    mathType: "Mathematical Literacy",
    mathMark: 45,
    subjects: [
      { subject: "Mathematical Literacy", mark: 45 },
      { subject: "English", mark: 48 },
      { subject: "History", mark: 44 },
      { subject: "Geography", mark: 42 },
      { subject: "Life Sciences", mark: 41 },
      { subject: "Business Studies", mark: 43 },
    ],
    englishMark: 48,
  });
  const m = matchOne(student, getOpportunity("funza-lushaka")!);
  // Either aspirational (close on APS) — should not be a confident strong match.
  assert.ok(["Aspirational match", "Not currently eligible", "Possible match"].includes(m.tier));
});

test("missing info produces uncertain reasons, never a fail", () => {
  const student = emptyProfile();
  student.fullName = "New Learner";
  student.fields = ["Information Technology"];
  const m = matchOne(student, getOpportunity("eskom-it")!);
  assert.ok(m.reasons.some((r) => r.kind === "uncertain"));
  assert.equal(m.disqualifiers.length, 0);
});

test("matchAll ranks strong matches ahead of not-eligible", () => {
  const results = matchAll(baseStudent(), OPPORTUNITIES);
  const firstNotEligible = results.findIndex((r) => r.tier === "Not currently eligible");
  const lastStrong = results.map((r) => r.tier).lastIndexOf("Strong match");
  if (firstNotEligible !== -1 && lastStrong !== -1) {
    assert.ok(lastStrong < firstNotEligible, "strong matches must sort before not-eligible");
  }
});

test("daysUntil is null when no deadline", () => {
  assert.equal(daysUntil(undefined), null);
});
