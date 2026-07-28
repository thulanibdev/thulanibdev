"use client";

import Link from "next/link";
import { MatchResult } from "@/lib/types";
import { useStore } from "@/lib/store";
import { DeadlinePill, TierBadge, VerificationBadge, Meter } from "./ui";

function fundingSummary(m: MatchResult): string {
  const f = m.opportunity.funding;
  if (f.fullFunding) return "Full funding";
  const parts: string[] = [];
  if (f.tuition) parts.push("Tuition");
  if (f.accommodation) parts.push("Accommodation");
  if (f.stipend) parts.push("Stipend");
  if (f.device) parts.push("Device");
  if (f.amountNote) return f.amountNote;
  return parts.length ? parts.join(" · ") : m.opportunity.type;
}

export function MatchCard({ m }: { m: MatchResult }) {
  const { apps, saveOpportunity, removeOpportunity } = useStore();
  const saved = Boolean(apps[m.opportunity.id]);
  const o = m.opportunity;
  const metReason = m.reasons.find((r) => r.kind === "met");

  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="chip bg-ink text-gold">{o.type}</span>
            <TierBadge tier={m.tier} />
          </div>
          <h3 className="font-display text-xl font-semibold leading-tight text-ink">
            <Link href={`/opportunities/${o.id}`} className="hover:underline">
              {o.name}
            </Link>
          </h3>
          <p className="text-sm text-ink/60">{o.provider}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold text-ink">{m.score}%</div>
          <div className="text-[11px] font-medium text-ink/50">fit</div>
        </div>
      </div>

      <div className="mt-3">
        <Meter value={m.score} tone={m.tier === "Strong match" ? "veld" : "gold"} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="chip bg-gold/15 text-gold-dark">{fundingSummary(m)}</span>
        <DeadlinePill deadline={o.deadline} />
      </div>

      {metReason && (
        <p className="mt-3 text-sm text-ink/75">
          <span className="font-semibold text-veld">Why you match: </span>
          {metReason.label}
        </p>
      )}

      {m.disqualifiers.length > 0 && (
        <p className="mt-2 text-sm text-ink/60">
          <span className="font-semibold text-clay">Not yet: </span>
          {m.disqualifiers[0]}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-black/5 pt-4">
        <Link href={`/opportunities/${o.id}`} className="btn-primary flex-1">
          View & apply
        </Link>
        {saved ? (
          <button className="btn-ghost" onClick={() => removeOpportunity(o.id)} aria-label="Remove from journey">
            ★ Saved
          </button>
        ) : (
          <button className="btn-ghost" onClick={() => saveOpportunity(o.id)} aria-label="Save to journey">
            ☆ Save
          </button>
        )}
      </div>
    </article>
  );
}
