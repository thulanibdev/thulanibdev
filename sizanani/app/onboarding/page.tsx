"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Text, Select, ChipMulti, YesNo } from "@/components/forms";
import { Meter } from "@/components/ui";
import { calculateAps } from "@/lib/aps";
import {
  PROVINCES,
  FIELDS,
  INCOME_BANDS,
  Province,
  FieldOfStudy,
  QualificationLevel,
} from "@/lib/types";

const QUAL_LEVELS: QualificationLevel[] = [
  "Higher Certificate",
  "Diploma",
  "Bachelor's Degree",
  "Extended Degree",
  "TVET (NC(V))",
  "Learnership",
  "Apprenticeship",
];

const DOC_OPTIONS = [
  "SA ID",
  "Birth certificate",
  "Latest results",
  "Grade 11 results",
  "Matric certificate",
  "Proof of residence",
  "Proof of household income",
  "SASSA confirmation",
  "Affidavit of unemployment",
  "Disability documentation",
  "Motivational letter",
  "CV",
];

const SUPPORT_OPTIONS = [
  "Choosing a career",
  "Selecting subjects",
  "Calculating APS",
  "Finding funding",
  "Writing motivational letters",
  "Gathering documents",
  "Applying online",
  "Low-data / offline support",
];

const STEPS = [
  "Basics",
  "Academics",
  "Interests",
  "Financial",
  "Circumstances",
  "Achievements",
  "Documents",
  "Support",
];

export default function Onboarding() {
  const { profile, setProfile, loaded } = useStore();
  const [step, setStep] = useState(profile.onboardingStep || 0);
  const [subjectDraft, setSubjectDraft] = useState({ subject: "", mark: "" });

  if (!loaded) {
    return <div className="container-x py-20 text-center text-ink/50">Loading your profile…</div>;
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const next = () => {
    setProfile((p) => ({ ...p, onboardingStep: Math.max(p.onboardingStep, step + 1) }));
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0 });
  };
  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0 });
  };

  const aps = calculateAps(profile);

  return (
    <div className="container-x max-w-3xl py-8 sm:py-12">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          <span className="text-ink/50">{pct}% complete</span>
        </div>
        <Meter value={pct} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`chip text-[11px] ${
                i === step ? "bg-ink text-gold" : i < step ? "bg-veld/15 text-veld" : "bg-black/5 text-ink/50"
              }`}
            >
              {i < step ? "✓ " : ""}
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        {/* STEP 0 — Basics */}
        {step === 0 && (
          <div className="grid gap-5">
            <Header title="Let's start with the basics" sub="This helps us personalise everything. You can save and continue anytime." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Text label="Full name" value={profile.fullName} onChange={(v) => setProfile((p) => ({ ...p, fullName: v }))} />
              <Text label="Preferred name" value={profile.preferredName} onChange={(v) => setProfile((p) => ({ ...p, preferredName: v }))} />
              <Text label="Email" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
              <Text label="Mobile number" value={profile.mobile} onChange={(v) => setProfile((p) => ({ ...p, mobile: v }))} />
              <Select
                label="Citizenship status"
                value={profile.citizenship}
                onChange={(v) => setProfile((p) => ({ ...p, citizenship: v as any }))}
                options={[
                  { value: "SA citizen", label: "South African citizen" },
                  { value: "Permanent resident", label: "Permanent resident" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <Select
                label="Province"
                value={profile.province}
                onChange={(v) => setProfile((p) => ({ ...p, province: v as Province }))}
                options={PROVINCES.map((p) => ({ value: p, label: p }))}
              />
              <Text label="Town / city" value={profile.town} onChange={(v) => setProfile((p) => ({ ...p, town: v }))} />
              <Text label="School name" value={profile.schoolName} onChange={(v) => setProfile((p) => ({ ...p, schoolName: v }))} />
              <Select
                label="Current grade"
                value={profile.grade}
                onChange={(v) => setProfile((p) => ({ ...p, grade: v as any }))}
                options={["9", "10", "11", "12", "Matric complete"].map((g) => ({ value: g, label: g === "Matric complete" ? g : `Grade ${g}` }))}
              />
              <Text label="Expected matric year" type="number" value={profile.matricYear} onChange={(v) => setProfile((p) => ({ ...p, matricYear: Number(v) || undefined }))} />
            </div>
          </div>
        )}

        {/* STEP 1 — Academics */}
        {step === 1 && (
          <div className="grid gap-5">
            <Header title="Your academic results" sub="Marks let us calculate your APS and check programme requirements. Enter what you have — you can update later." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Mathematics type"
                value={profile.mathType}
                onChange={(v) => setProfile((p) => ({ ...p, mathType: v as any }))}
                options={[
                  { value: "Mathematics", label: "Mathematics" },
                  { value: "Mathematical Literacy", label: "Mathematical Literacy" },
                  { value: "None", label: "Not sure yet" },
                ]}
                hint="Many bursaries and degrees require pure Mathematics."
              />
              <Text label="Maths mark (%)" type="number" value={profile.mathMark} onChange={(v) => setProfile((p) => ({ ...p, mathMark: Number(v) || undefined }))} />
              <Text label="English mark (%)" type="number" value={profile.englishMark} onChange={(v) => setProfile((p) => ({ ...p, englishMark: Number(v) || undefined }))} />
              <Text label="Home language" value={profile.homeLanguage} onChange={(v) => setProfile((p) => ({ ...p, homeLanguage: v }))} />
            </div>

            <div>
              <span className="field-label">Other subjects & marks</span>
              <div className="flex flex-wrap gap-2">
                <input
                  className="input flex-1"
                  placeholder="Subject e.g. Physical Sciences"
                  value={subjectDraft.subject}
                  onChange={(e) => setSubjectDraft((s) => ({ ...s, subject: e.target.value }))}
                />
                <input
                  className="input w-24"
                  placeholder="%"
                  type="number"
                  value={subjectDraft.mark}
                  onChange={(e) => setSubjectDraft((s) => ({ ...s, mark: e.target.value }))}
                />
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    if (!subjectDraft.subject || !subjectDraft.mark) return;
                    setProfile((p) => ({
                      ...p,
                      subjects: [...p.subjects, { subject: subjectDraft.subject, mark: Number(subjectDraft.mark) }],
                    }));
                    setSubjectDraft({ subject: "", mark: "" });
                  }}
                >
                  + Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.subjects.map((s, i) => (
                  <span key={i} className="chip bg-black/5 text-ink">
                    {s.subject}: {s.mark}%
                    <button
                      className="ml-1 text-ink/40 hover:text-red-600"
                      aria-label={`Remove ${s.subject}`}
                      onClick={() => setProfile((p) => ({ ...p, subjects: p.subjects.filter((_, j) => j !== i) }))}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gold/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Estimated APS</span>
                <span className="font-display text-2xl font-bold text-gold-dark">{aps.aps}</span>
              </div>
              <p className="mt-1 text-xs text-ink/60">{aps.note}</p>
            </div>
          </div>
        )}

        {/* STEP 2 — Interests */}
        {step === 2 && (
          <div className="grid gap-6">
            <Header title="Career & study interests" sub="We use these to recommend careers, qualifications and institutions." />
            <ChipMulti<FieldOfStudy>
              label="Which fields interest you?"
              options={FIELDS}
              selected={profile.fields}
              onToggle={(v) => setProfile((p) => ({ ...p, fields: toggle(p.fields, v) }))}
            />
            <ChipMulti<QualificationLevel>
              label="Which qualification levels would you consider?"
              options={QUAL_LEVELS}
              selected={profile.qualificationLevels}
              onToggle={(v) => setProfile((p) => ({ ...p, qualificationLevels: toggle(p.qualificationLevels, v) }))}
              hint="Considering diplomas, TVET and learnerships opens up more pathways."
            />
            <ChipMulti<Province>
              label="Which provinces would you study in?"
              options={[...PROVINCES]}
              selected={profile.preferredProvinces}
              onToggle={(v) => setProfile((p) => ({ ...p, preferredProvinces: toggle(p.preferredProvinces, v) }))}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <YesNo label="Willing to relocate?" value={profile.willingToRelocate} onChange={(v) => setProfile((p) => ({ ...p, willingToRelocate: v }))} />
              <YesNo label="Consider online study?" value={profile.considerOnline} onChange={(v) => setProfile((p) => ({ ...p, considerOnline: v }))} />
              <YesNo label="Need accommodation?" value={profile.needsAccommodation} onChange={(v) => setProfile((p) => ({ ...p, needsAccommodation: v }))} />
            </div>
          </div>
        )}

        {/* STEP 3 — Financial */}
        {step === 3 && (
          <div className="grid gap-6">
            <Header title="Financial profile" sub="We only ask what helps match you to funding. This is private and never shared without your consent." />
            <Select
              label="Approximate annual household income"
              value={profile.incomeBand}
              onChange={(v) => setProfile((p) => ({ ...p, incomeBand: v as any }))}
              options={INCOME_BANDS}
              hint="Used to check bursary means tests. NSFAS supports households under R350,000."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <YesNo label="Need full funding?" value={profile.needsFullFunding} onChange={(v) => setProfile((p) => ({ ...p, needsFullFunding: v }))} />
              <YesNo label="Need application-fee help?" value={profile.needsFeeWaiver} onChange={(v) => setProfile((p) => ({ ...p, needsFeeWaiver: v }))} />
              <YesNo label="Need a device or data?" value={profile.needsDeviceOrData} onChange={(v) => setProfile((p) => ({ ...p, needsDeviceOrData: v }))} />
            </div>
          </div>
        )}

        {/* STEP 4 — Circumstances */}
        {step === 4 && (
          <div className="grid gap-4">
            <Header title="Personal circumstances" sub="All optional. Sharing these can unlock bursaries reserved for specific groups. They are never used to exclude you, and never shown publicly." />
            {(
              [
                ["disability", "I have a disability"],
                ["ruralBackground", "I come from a rural community"],
                ["townshipBackground", "I come from a township community"],
                ["firstGeneration", "I would be the first in my family at university"],
                ["childHeadedHousehold", "I live in a child-headed household"],
                ["orphanedOrVulnerable", "I am an orphan or vulnerable child"],
                ["sassaBeneficiary", "I am a SASSA beneficiary"],
                ["socialGrant", "My household receives a social grant"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-black/10 p-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-veld"
                  checked={Boolean(profile.indicators[key])}
                  onChange={(e) => setProfile((p) => ({ ...p, indicators: { ...p.indicators, [key]: e.target.checked } }))}
                />
                <span className="text-sm text-ink">{label}</span>
              </label>
            ))}
          </div>
        )}

        {/* STEP 5 — Achievements */}
        {step === 5 && (
          <div className="grid gap-4">
            <Header title="Achievements & activities" sub="These strengthen bursary and university applications. Add anything you're proud of." />
            <TagInput
              value={profile.achievements}
              onChange={(v) => setProfile((p) => ({ ...p, achievements: v }))}
              placeholder="e.g. Head prefect, coding club, soccer captain, community volunteer"
            />
          </div>
        )}

        {/* STEP 6 — Documents */}
        {step === 6 && (
          <div className="grid gap-4">
            <Header title="Which documents do you already have?" sub="We'll build a personalised checklist and tell you what each opportunity still needs." />
            <ChipMulti
              label="Documents ready"
              options={DOC_OPTIONS}
              selected={profile.documents}
              onToggle={(v) => setProfile((p) => ({ ...p, documents: toggle(p.documents, v) }))}
            />
          </div>
        )}

        {/* STEP 7 — Support */}
        {step === 7 && (
          <div className="grid gap-5">
            <Header title="How can we support you?" sub="This helps us and your mentor prioritise the right help." />
            <ChipMulti
              label="I'd like help with…"
              options={SUPPORT_OPTIONS}
              selected={profile.supportNeeds}
              onToggle={(v) => setProfile((p) => ({ ...p, supportNeeds: toggle(p.supportNeeds, v) }))}
            />
            <YesNo label="Would you like a Sizanani mentor?" value={profile.wantsMentor} onChange={(v) => setProfile((p) => ({ ...p, wantsMentor: v }))} />
          </div>
        )}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
          <button className="btn-ghost" onClick={back} disabled={step === 0}>
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={next}>
              Save & continue →
            </button>
          ) : (
            <Link href="/dashboard" className="btn-gold" onClick={() => setProfile((p) => ({ ...p, onboardingStep: STEPS.length }))}>
              See my matches →
            </Link>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink/50">
        Your answers are saved automatically on this device.{" "}
        <Link href="/dashboard" className="underline">
          Skip to dashboard
        </Link>
      </p>
    </div>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-ink/60">{sub}</p>
    </div>
  );
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...value, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <button
          className="btn-ghost"
          type="button"
          onClick={() => {
            if (draft.trim()) {
              onChange([...value, draft.trim()]);
              setDraft("");
            }
          }}
        >
          + Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((t, i) => (
          <span key={i} className="chip bg-black/5 text-ink">
            {t}
            <button className="ml-1 text-ink/40 hover:text-red-600" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}>
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
