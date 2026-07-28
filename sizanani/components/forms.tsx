"use client";

// Small accessible form primitives used across onboarding.

export function Text({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="input"
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function ChipMulti<T extends string>({
  label,
  options,
  selected,
  onToggle,
  hint,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      {hint && <p className="mb-2 text-xs text-ink/50">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o)}
              className={`chip border transition ${
                on ? "border-ink bg-ink text-gold" : "border-black/15 bg-white text-ink/70 hover:border-ink/40"
              }`}
            >
              {on ? "✓ " : ""}
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function YesNo({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      {hint && <p className="mb-1.5 text-xs text-ink/50">{hint}</p>}
      <div className="flex gap-2">
        {[
          { v: true, l: "Yes" },
          { v: false, l: "No" },
        ].map((opt) => (
          <button
            key={opt.l}
            type="button"
            aria-pressed={value === opt.v}
            onClick={() => onChange(opt.v)}
            className={`chip border px-4 py-1.5 ${
              value === opt.v ? "border-ink bg-ink text-gold" : "border-black/15 bg-white text-ink/70"
            }`}
          >
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}
