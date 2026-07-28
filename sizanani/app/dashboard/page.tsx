"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { OPPORTUNITIES } from "@/lib/seed";
import { matchAll, daysUntil } from "@/lib/matching";
import { computeReadiness } from "@/lib/readiness";
import { calculateAps } from "@/lib/aps";
import { MatchCard } from "@/components/MatchCard";
import { ProgressRing, DeadlinePill, Meter, EmptyState } from "@/components/ui";

export default function Dashboard() {
  const { profile, apps, loaded } = useStore();

  const matches = useMemo(() => matchAll(profile, OPPORTUNITIES), [profile]);
  const readiness = useMemo(() => computeReadiness(profile), [profile]);
  const aps = useMemo(() => calculateAps(profile), [profile]);

  if (!loaded) return <div className="container-x py-20 text-center text-ink/50">Loading…</div>;

  const hasProfile = Boolean(profile.fullName);
  if (!hasProfile) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Let's build your profile"
          body="Answer a few guided questions and we'll instantly show the bursaries, universities and pathways matched to you."
          cta={
            <Link href="/onboarding" className="btn-gold">
              Start my profile →
            </Link>
          }
        />
      </div>
    );
  }

  const eligible = matches.filter((m) => m.tier !== "Not currently eligible");
  const best = eligible.slice(0, 6);
  const withDeadline = eligible
    .filter((m) => daysUntil(m.opportunity.deadline) != null && (daysUntil(m.opportunity.deadline) ?? -1) >= 0)
    .sort((a, b) => (daysUntil(a.opportunity.deadline) ?? 0) - (daysUntil(b.opportunity.deadline) ?? 0));
  const nextDeadline = withDeadline[0];
  const submittedCount = Object.values(apps).filter((a) => ["Submitted", "Awaiting response", "Shortlisted", "Interview scheduled"].includes(a.stage)).length;

  // Missing documents aggregated across best matches
  const missingDocs = new Map<string, string[]>();
  best.forEach((m) =>
    m.opportunity.requiredDocuments.forEach((doc) => {
      if (!profile.documents.some((d) => d.toLowerCase() === doc.toLowerCase())) {
        missingDocs.set(doc, [...(missingDocs.get(doc) || []), m.opportunity.name]);
      }
    })
  );

  const name = profile.preferredName || profile.fullName.split(" ")[0];
  const priorityAction =
    nextDeadline?.nextActions[0] ||
    readiness.outstanding[0] ||
    "Browse your matched opportunities and save the ones you like.";

  return (
    <div className="container-x py-8 sm:py-10">
      {/* Welcome + command bar */}
      <div className="card overflow-hidden">
        <div className="grid gap-6 p-6 sm:grid-cols-[auto,1fr] sm:items-center">
          <div className="flex items-center gap-5">
            <ProgressRing value={readiness.score} label="ready" />
            <div>
              <p className="text-sm text-ink/50">Welcome back,</p>
              <h1 className="font-display text-3xl font-semibold text-ink">{name}</h1>
              <p className="text-sm text-ink/60">
                {profile.grade ? `Grade ${profile.grade} · ` : ""}Estimated APS {aps.aps}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-ink p-5 text-paper">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">Your priority action</p>
            <p className="mt-1 text-lg font-medium">{priorityAction}</p>
            {nextDeadline && (
              <div className="mt-3">
                <DeadlinePill deadline={nextDeadline.opportunity.deadline} />
              </div>
            )}
          </div>
        </div>
        {/* quick stats */}
        <div className="grid grid-cols-2 divide-x divide-black/5 border-t border-black/5 sm:grid-cols-4">
          <Stat value={eligible.length} label="Matched opportunities" />
          <Stat value={Object.keys(apps).length} label="Saved to journey" />
          <Stat value={submittedCount} label="Submitted" />
          <Stat value={withDeadline.length} label="Live deadlines" />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,340px]">
        {/* Best opportunities */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink">Your best opportunities</h2>
            <Link href="/opportunities" className="text-sm font-semibold text-veld hover:underline">
              See all →
            </Link>
          </div>
          {best.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {best.map((m) => (
                <MatchCard key={m.opportunity.id} m={m} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Let's find your matches"
              body="Add your marks and interests so we can check every opportunity for you."
              cta={<Link href="/onboarding" className="btn-gold">Complete my profile</Link>}
            />
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Readiness breakdown */}
          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold text-ink">Application readiness</h3>
            <p className="mt-1 text-sm text-ink/60">How your {readiness.score}% is calculated:</p>
            <ul className="mt-3 space-y-2">
              {readiness.factors.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  <span className={f.complete ? "text-veld" : "text-ink/30"}>{f.complete ? "✓" : "○"}</span>
                  <span className={f.complete ? "text-ink" : "text-ink/60"}>{f.label}</span>
                  <span className="ml-auto text-xs text-ink/40">{f.weight}%</span>
                </li>
              ))}
            </ul>
            <Link href="/onboarding" className="btn-ghost mt-4 w-full">
              Update my profile
            </Link>
          </div>

          {/* Recommended actions */}
          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold text-ink">Recommended next actions</h3>
            <ol className="mt-3 space-y-2.5">
              {readiness.outstanding.slice(0, 5).map((a, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink/80">
                  <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-gold/20 text-xs font-bold text-gold-dark">
                    {i + 1}
                  </span>
                  {a}
                </li>
              ))}
              {readiness.outstanding.length === 0 && (
                <li className="text-sm text-veld">✓ You're application-ready — start submitting!</li>
              )}
            </ol>
          </div>

          {/* Deadline calendar */}
          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold text-ink">Deadline calendar</h3>
            <div className="mt-3 space-y-3">
              {withDeadline.slice(0, 5).map((m) => (
                <Link key={m.opportunity.id} href={`/opportunities/${m.opportunity.id}`} className="block">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-ink">{m.opportunity.name}</span>
                    <DeadlinePill deadline={m.opportunity.deadline} />
                  </div>
                </Link>
              ))}
              {withDeadline.length === 0 && <p className="text-sm text-ink/50">No upcoming deadlines yet.</p>}
            </div>
          </div>

          {/* Missing documents */}
          {missingDocs.size > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-lg font-semibold text-ink">Missing documents</h3>
              <p className="mt-1 text-sm text-ink/60">Preparing these unlocks several applications.</p>
              <ul className="mt-3 space-y-2">
                {[...missingDocs.entries()].slice(0, 5).map(([doc, opps]) => (
                  <li key={doc} className="text-sm">
                    <span className="font-medium text-ink">{doc}</span>
                    <span className="block text-xs text-ink/50">Needed by {opps.length} opportunit{opps.length === 1 ? "y" : "ies"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="p-4 text-center">
      <div className="font-display text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs text-ink/55">{label}</div>
    </div>
  );
}
