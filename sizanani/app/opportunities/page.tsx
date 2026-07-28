"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { OPPORTUNITIES } from "@/lib/seed";
import { matchAll, daysUntil, isOpen } from "@/lib/matching";
import { parseQuery } from "@/lib/nlsearch";
import { MatchCard } from "@/components/MatchCard";
import { EmptyState } from "@/components/ui";
import { FIELDS, OpportunityType, PROVINCES } from "@/lib/types";

const TYPES: OpportunityType[] = [
  "Bursary",
  "Scholarship",
  "University Programme",
  "TVET Programme",
  "Learnership",
  "Support Programme",
];

export default function Opportunities() {
  const { profile, loaded } = useStore();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OpportunityType[]>([]);
  const [fieldFilter, setFieldFilter] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [fullFundingOnly, setFullFundingOnly] = useState(false);
  const [noFeeOnly, setNoFeeOnly] = useState(false);

  const parsed = useMemo(() => (query.trim() ? parseQuery(query) : null), [query]);

  const allMatches = useMemo(() => matchAll(profile, OPPORTUNITIES), [profile]);

  const filtered = useMemo(() => {
    return allMatches.filter((m) => {
      const o = m.opportunity;
      // text/NL query
      if (parsed) {
        if (parsed.types.length && !parsed.types.includes(o.type)) return false;
        if (parsed.fields.length && !o.fields.some((f) => parsed.fields.includes(f))) return false;
        if (parsed.provinces.length && o.eligibility.provinces && !o.eligibility.provinces.some((p) => parsed.provinces.includes(p))) {
          // allow national opportunities (no province restriction) through
          if (o.eligibility.provinces.length) return false;
        }
        if (parsed.fullFunding && !o.funding.fullFunding) return false;
        if (parsed.noFee && o.applicationFee && o.applicationFee > 0) return false;
        if (parsed.onlineOnly && !/online|distance/i.test((o.campus || "") + o.description)) return false;
        // plain keyword fallback
        const hay = `${o.name} ${o.provider} ${o.description}`.toLowerCase();
        const wordMatch = query.toLowerCase().split(/\s+/).every((w) => w.length < 3 || hay.includes(w) || parsed.understood.length > 0);
        if (!wordMatch && parsed.understood.length === 0) return false;
      }
      if (typeFilter.length && !typeFilter.includes(o.type)) return false;
      if (fieldFilter.length && !o.fields.some((f) => fieldFilter.includes(f))) return false;
      if (province && o.eligibility.provinces?.length && !o.eligibility.provinces.includes(province as any)) return false;
      if (openOnly && !isOpen(o)) return false;
      if (verifiedOnly && !o.verification.startsWith("Verified")) return false;
      if (fullFundingOnly && !o.funding.fullFunding) return false;
      if (noFeeOnly && o.applicationFee && o.applicationFee > 0) return false;
      return true;
    });
  }, [allMatches, parsed, query, typeFilter, fieldFilter, province, openOnly, verifiedOnly, fullFundingOnly, noFeeOnly]);

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  if (!loaded) return <div className="container-x py-20 text-center text-ink/50">Loading…</div>;

  return (
    <div className="container-x py-8 sm:py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Opportunities</h1>
      <p className="mt-1 text-ink/60">
        {profile.fullName
          ? "Ranked by how well each one matches your profile."
          : "Build your profile to see personalised match scores."}
      </p>

      {/* Natural-language search */}
      <div className="mt-5">
        <label className="field-label">Search in your own words</label>
        <input
          className="input text-base"
          placeholder='e.g. "Grade 12, 68% for Maths, want to study IT in Gauteng and need full funding"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {parsed && parsed.understood.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink/50">We understood:</span>
            {parsed.understood.map((u) => (
              <span key={u} className="chip bg-veld/10 text-veld">
                {u}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* Filters */}
        <aside className="card h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Filters</h2>

          <FilterGroup title="Type">
            {TYPES.map((t) => (
              <FilterChip key={t} on={typeFilter.includes(t)} onClick={() => toggle(typeFilter, t, setTypeFilter)}>
                {t}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup title="Field of study">
            {FIELDS.map((f) => (
              <FilterChip key={f} on={fieldFilter.includes(f)} onClick={() => toggle(fieldFilter, f, setFieldFilter)}>
                {f}
              </FilterChip>
            ))}
          </FilterGroup>

          <div className="mt-4">
            <label className="field-label">Province</label>
            <select className="input" value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">Any</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-2">
            <Toggle checked={openOnly} onChange={setOpenOnly} label="Applications open only" />
            <Toggle checked={verifiedOnly} onChange={setVerifiedOnly} label="Verified only" />
            <Toggle checked={fullFundingOnly} onChange={setFullFundingOnly} label="Full funding only" />
            <Toggle checked={noFeeOnly} onChange={setNoFeeOnly} label="No application fee" />
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-3 text-sm text-ink/60">{filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}</p>
          {filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((m) => (
                <MatchCard key={m.opportunity.id} m={m} />
              ))}
            </div>
          ) : (
            <EmptyState title="No opportunities match those filters" body="Try removing a filter or broadening your search." />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`chip border text-[11px] ${on ? "border-ink bg-ink text-gold" : "border-black/15 bg-white text-ink/70"}`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-ink/80">
      <input type="checkbox" className="h-4 w-4 accent-ink" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
