"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { getOpportunity } from "@/lib/seed";
import { daysUntil } from "@/lib/matching";
import { DeadlinePill, EmptyState, Meter } from "@/components/ui";
import { ApplicationStage } from "@/lib/types";

const STAGE_ORDER: ApplicationStage[] = [
  "Saved",
  "Preparing",
  "Documents outstanding",
  "Ready to apply",
  "Application started",
  "Submitted",
  "Awaiting response",
  "Shortlisted",
  "Interview scheduled",
  "Accepted",
  "Funding awarded",
];

function stageProgress(stage: ApplicationStage): number {
  const i = STAGE_ORDER.indexOf(stage);
  if (i < 0) return 0;
  return Math.round(((i + 1) / STAGE_ORDER.length) * 100);
}

export default function Applications() {
  const { apps, loaded } = useStore();

  if (!loaded) return <div className="container-x py-20 text-center text-ink/50">Loading…</div>;

  const list = Object.values(apps).sort((a, b) => {
    const da = daysUntil(getOpportunity(a.opportunityId)?.deadline) ?? 9999;
    const db = daysUntil(getOpportunity(b.opportunityId)?.deadline) ?? 9999;
    return da - db;
  });

  if (list.length === 0) {
    return (
      <div className="container-x py-16">
        <h1 className="mb-6 font-display text-3xl font-semibold text-ink">My education journey</h1>
        <EmptyState
          title="Your journey starts here"
          body="Save opportunities from your matches and we'll track every deadline, document and step until you're enrolled."
          cta={<Link href="/opportunities" className="btn-gold">Find opportunities →</Link>}
        />
      </div>
    );
  }

  const submitted = list.filter((a) => STAGE_ORDER.indexOf(a.stage) >= STAGE_ORDER.indexOf("Submitted")).length;
  const overallProgress = Math.round(list.reduce((s, a) => s + stageProgress(a.stage), 0) / list.length);

  return (
    <div className="container-x py-8 sm:py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">My education journey</h1>
      <p className="mt-1 text-ink/60">One place to track every application through to enrolment.</p>

      {/* Journey overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-ink/50">Overall journey</p>
          <p className="font-display text-3xl font-bold text-ink">{overallProgress}%</p>
          <div className="mt-2">
            <Meter value={overallProgress} tone="veld" />
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-ink/50">Active applications</p>
          <p className="font-display text-3xl font-bold text-ink">{list.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-ink/50">Submitted</p>
          <p className="font-display text-3xl font-bold text-ink">{submitted}</p>
        </div>
      </div>

      {/* Application cards */}
      <div className="mt-8 space-y-4">
        {list.map((a) => {
          const o = getOpportunity(a.opportunityId);
          if (!o) return null;
          const doneTasks = a.tasks.filter((t) => t.done).length;
          const taskPct = Math.round((doneTasks / a.tasks.length) * 100);
          const nextTask = a.tasks.find((t) => !t.done && !(t.blockedBy && !a.tasks.find((x) => x.id === t.blockedBy)?.done));
          return (
            <article key={a.opportunityId} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="chip bg-ink text-gold">{o.type}</span>
                    <span className="chip bg-veld/10 text-veld">{a.stage}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    <Link href={`/opportunities/${o.id}`} className="hover:underline">
                      {o.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-ink/60">{o.provider}</p>
                </div>
                <DeadlinePill deadline={o.deadline} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr,auto] sm:items-center">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-ink/50">
                    <span>Checklist: {doneTasks}/{a.tasks.length} done</span>
                    <span>{taskPct}%</span>
                  </div>
                  <Meter value={taskPct} />
                  {nextTask && (
                    <p className="mt-2 text-sm text-ink/75">
                      <span className="font-semibold text-ink">Next: </span>
                      {nextTask.label}
                    </p>
                  )}
                </div>
                <Link href={`/opportunities/${o.id}`} className="btn-primary">
                  Open workspace →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
