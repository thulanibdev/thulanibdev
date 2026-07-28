"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { getOpportunity } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { matchOne, daysUntil } from "@/lib/matching";
import { DeadlinePill, TierBadge, VerificationBadge, Meter, EmptyState } from "@/components/ui";
import { ApplicationStage } from "@/lib/types";

const STAGES: ApplicationStage[] = [
  "Saved",
  "Preparing",
  "Ready to apply",
  "Submitted",
  "Awaiting response",
  "Shortlisted",
  "Interview scheduled",
  "Accepted",
  "Funding awarded",
];

export default function OpportunityDetail() {
  const params = useParams<{ id: string }>();
  const o = getOpportunity(params.id);
  const { profile, apps, saveOpportunity, removeOpportunity, setStage, toggleTask, loaded } = useStore();

  const match = useMemo(() => (o ? matchOne(profile, o) : null), [o, profile]);

  if (!o) {
    return (
      <div className="container-x py-16">
        <EmptyState title="Opportunity not found" body="It may have been archived." cta={<Link href="/opportunities" className="btn-gold">Back to opportunities</Link>} />
      </div>
    );
  }
  if (!loaded || !match) return <div className="container-x py-20 text-center text-ink/50">Loading…</div>;

  const app = apps[o.id];
  const saved = Boolean(app);
  const funding = o.funding;
  const fundingItems = [
    funding.fullFunding && "Full funding",
    funding.tuition && "Tuition",
    funding.accommodation && "Accommodation",
    funding.meals && "Meals",
    funding.transport && "Transport",
    funding.textbooks && "Textbooks",
    funding.device && "Device / laptop",
    funding.stipend && "Monthly stipend",
  ].filter(Boolean) as string[];

  const dLeft = daysUntil(o.deadline);
  // Deadline intelligence: recommend submitting early based on complexity.
  const prepDays = (o.essayRequired ? 4 : 1) + (o.interviewRequired ? 3 : 0) + Math.min(3, o.requiredDocuments.length);
  const recommendedBuffer = prepDays + 3;
  const risk =
    dLeft == null ? "Unknown" : dLeft < 0 ? "Missed" : dLeft <= 3 ? "Critical" : dLeft <= recommendedBuffer ? "High risk" : dLeft <= 21 ? "Attention required" : "Safe";

  return (
    <div className="container-x py-8 sm:py-10">
      <Link href="/opportunities" className="text-sm text-ink/50 hover:underline">
        ← All opportunities
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr,360px]">
        {/* Main */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="chip bg-ink text-gold">{o.type}</span>
            <TierBadge tier={match.tier} />
            <VerificationBadge status={o.verification} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{o.name}</h1>
          <p className="mt-1 text-lg text-ink/60">{o.provider}</p>
          {o.campus && <p className="text-sm text-ink/50">{o.institution} · {o.campus}</p>}

          <p className="mt-4 text-ink/80">{o.description}</p>

          {/* Why you match */}
          <section className="card mt-6 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">Why this matches you</h2>
              <span className="font-display text-2xl font-bold text-ink">{match.score}%</span>
            </div>
            <Meter value={match.score} tone={match.tier === "Strong match" ? "veld" : "gold"} />
            <ul className="mt-4 space-y-2">
              {match.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span aria-hidden>
                    {r.kind === "met" ? "✅" : r.kind === "uncertain" ? "❓" : r.kind === "missing" ? "📄" : "⛔"}
                  </span>
                  <span className={r.kind === "met" ? "text-ink" : "text-ink/70"}>{r.label}</span>
                </li>
              ))}
            </ul>
            {match.disqualifiers.length > 0 && (
              <div className="mt-4 rounded-xl bg-clay/10 p-4">
                <p className="text-sm font-semibold text-clay">You don&apos;t meet these essential requirements yet:</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-ink/70">
                  {match.disqualifiers.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-ink/60">
                  That&apos;s okay — check the{" "}
                  <Link href="/opportunities" className="underline">
                    alternative pathways
                  </Link>{" "}
                  that may suit you.
                </p>
              </div>
            )}
          </section>

          {/* Requirements & funding */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section className="card p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Requirements</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/80">
                <Req label="Fields" value={o.eligibility.fields?.join(", ")} fallback="Open to multiple fields" />
                <Req label="Minimum APS" value={o.eligibility.minAps != null ? String(o.eligibility.minAps) : undefined} />
                <Req label="Mathematics" value={o.eligibility.requiresMathematics ? `Required${o.eligibility.minMathMark ? ` (${o.eligibility.minMathMark}%)` : ""}` : undefined} />
                <Req label="English" value={o.eligibility.minEnglishMark ? `${o.eligibility.minEnglishMark}%` : undefined} />
                <Req label="Citizenship" value={o.eligibility.citizenship?.join(" / ")} />
                <Req label="Income ceiling" value={o.eligibility.maxIncomeBand ? "Means-tested" : undefined} />
                <Req label="Work-back" value={o.workBackObligation ? "Yes" : undefined} />
                <Req label="Application fee" value={o.applicationFee ? `R${o.applicationFee}` : "Free"} />
              </ul>
            </section>
            <section className="card p-5">
              <h2 className="font-display text-lg font-semibold text-ink">What it covers</h2>
              {fundingItems.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {fundingItems.map((f) => (
                    <span key={f} className="chip bg-veld/10 text-veld">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink/50">This is a study programme (not funding). Pair it with a bursary.</p>
              )}
              {funding.amountNote && <p className="mt-3 text-sm text-ink/70">{funding.amountNote}</p>}
            </section>
          </div>

          {/* Application workspace */}
          {saved ? (
            <section className="card mt-6 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-ink">Application workspace</h2>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-ink/60">Stage:</span>
                  <select
                    className="input w-auto py-1.5"
                    value={app.stage}
                    onChange={(e) => setStage(o.id, e.target.value as ApplicationStage)}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-ink">Your checklist</p>
                <ul className="space-y-2">
                  {app.tasks.map((t) => {
                    const blocker = t.blockedBy && !app.tasks.find((x) => x.id === t.blockedBy)?.done;
                    return (
                      <li key={t.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-veld disabled:opacity-40"
                          checked={t.done}
                          disabled={Boolean(blocker)}
                          onChange={() => toggleTask(o.id, t.id)}
                        />
                        <span className={`text-sm ${t.done ? "text-ink/40 line-through" : "text-ink"}`}>
                          {t.label}
                          {blocker && <span className="ml-2 text-xs text-clay">🔒 complete the submission step first</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-black/5 pt-4">
                <a href={o.officialLink} target="_blank" rel="noopener noreferrer" className="btn-gold">
                  Open official application ↗
                </a>
                <button className="btn-ghost" onClick={() => removeOpportunity(o.id)}>
                  Remove from journey
                </button>
              </div>
            </section>
          ) : (
            <section className="card mt-6 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">Add to your journey</h2>
                <p className="text-sm text-ink/60">We&apos;ll build your document checklist and track deadlines for you.</p>
              </div>
              <button className="btn-primary" onClick={() => saveOpportunity(o.id)}>
                ☆ Save & start applying
              </button>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold text-ink">Deadline intelligence</h3>
            <div className="mt-3">
              <DeadlinePill deadline={o.deadline} />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Official deadline" v={o.deadline ? new Date(o.deadline).toLocaleDateString("en-ZA", { day: "numeric", month: "long" }) : "Not specified"} />
              <Row k="Recommended by" v={dLeft != null && dLeft >= 0 ? `${Math.max(0, dLeft - 3)} day(s) from now` : "—"} />
              <Row k="Est. prep time" v={`${prepDays} day(s)`} />
              <Row k="Risk" v={risk} tone={risk === "Critical" || risk === "High risk" ? "warn" : risk === "Safe" ? "good" : "neutral"} />
              <Row k="Confidence" v={o.deadlineConfidence ? `${o.deadlineConfidence} confidence` : "—"} />
            </dl>
            {dLeft != null && dLeft >= 0 && (
              <p className="mt-3 rounded-lg bg-gold/10 p-3 text-xs text-ink/70">
                Don&apos;t wait for the closing date — aim to submit a few days early in case documents take time.
              </p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold text-ink">Required documents</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {o.requiredDocuments.map((doc) => {
                const have = profile.documents.some((d) => d.toLowerCase() === doc.toLowerCase());
                return (
                  <li key={doc} className="flex items-center gap-2">
                    <span className={have ? "text-veld" : "text-clay"}>{have ? "✓" : "○"}</span>
                    <span className={have ? "text-ink" : "text-ink/70"}>{doc}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold text-ink">Source & trust</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Verification" v={o.verification} />
              <Row k="Last checked" v={new Date(o.lastChecked).toLocaleDateString("en-ZA")} />
            </dl>
            <a href={o.officialLink} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm font-semibold text-veld hover:underline">
              Official information ↗
            </a>
            <Link href={`/opportunities?report=${o.id}`} className="mt-1 block text-xs text-ink/40 hover:underline">
              ⚑ Report this opportunity
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Req({ label, value, fallback }: { label: string; value?: string; fallback?: string }) {
  return (
    <li className="flex justify-between gap-4">
      <span className="text-ink/50">{label}</span>
      <span className="text-right font-medium text-ink">{value || fallback || <span className="text-ink/40">Not specified</span>}</span>
    </li>
  );
}

function Row({ k, v, tone = "neutral" }: { k: string; v: string; tone?: "neutral" | "good" | "warn" }) {
  const cls = tone === "good" ? "text-veld" : tone === "warn" ? "text-clay" : "text-ink";
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/50">{k}</dt>
      <dd className={`text-right font-medium ${cls}`}>{v}</dd>
    </div>
  );
}
