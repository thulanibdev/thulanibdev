import { MatchTier, VerificationStatus } from "@/lib/types";
import { daysUntil } from "@/lib/matching";

// --- Circular progress ring (readiness / journey) --------------------------
export function ProgressRing({
  value,
  size = 120,
  label,
  sub,
}: {
  value: number;
  size?: number;
  label?: string;
  sub?: string;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${clamped}% complete`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#00000012" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#c9a84c"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold text-ink">{clamped}%</div>
        {label && <div className="text-[11px] font-medium text-ink/60">{label}</div>}
      </div>
      {sub && <span className="sr-only">{sub}</span>}
    </div>
  );
}

// --- Deadline pill with colour + text label (not colour alone) -------------
export function DeadlinePill({ deadline }: { deadline?: string }) {
  const d = daysUntil(deadline);
  if (d == null) {
    return <span className="chip bg-black/5 text-ink/70">Deadline not specified</span>;
  }
  if (d < 0) return <span className="chip bg-black/10 text-ink/60">◷ Closed</span>;
  let cls = "bg-veld/10 text-veld";
  let icon = "🟢";
  let text = `${d} days left`;
  if (d <= 7) {
    cls = "bg-red-100 text-red-700";
    icon = "🔴";
    text = `Closes in ${d} day${d === 1 ? "" : "s"}`;
  } else if (d <= 21) {
    cls = "bg-orange-100 text-orange-700";
    icon = "🟠";
  } else if (d <= 45) {
    cls = "bg-amber-100 text-amber-800";
    icon = "🟡";
  }
  return (
    <span className={`chip ${cls}`}>
      <span aria-hidden>{icon}</span> {text}
    </span>
  );
}

const TIER_STYLE: Record<MatchTier, string> = {
  "Strong match": "bg-veld text-white",
  "Possible match": "bg-veld/15 text-veld",
  "Aspirational match": "bg-gold/20 text-gold-dark",
  "Alternative opportunity": "bg-clay/15 text-clay",
  "Not currently eligible": "bg-black/8 text-ink/55",
};

export function TierBadge({ tier }: { tier: MatchTier }) {
  return <span className={`chip font-semibold ${TIER_STYLE[tier]}`}>{tier}</span>;
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const verified = status.startsWith("Verified");
  const warn = status === "Information may have changed" || status === "Expired";
  const cls = verified
    ? "bg-veld/10 text-veld"
    : warn
      ? "bg-orange-100 text-orange-700"
      : "bg-black/5 text-ink/60";
  return (
    <span className={`chip ${cls}`} title="Verification status">
      {verified ? "✓ " : "○ "}
      {status}
    </span>
  );
}

export function Meter({ value, tone = "gold" }: { value: number; tone?: "gold" | "veld" }) {
  const color = tone === "veld" ? "bg-veld" : "bg-gold";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/8" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full ${color} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function EmptyState({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-2xl" aria-hidden>
        ✦
      </div>
      <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-ink/60">{body}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}
