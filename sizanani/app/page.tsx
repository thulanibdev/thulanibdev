import Link from "next/link";
import { OPPORTUNITIES } from "@/lib/seed";

const STATS = [
  { value: `${OPPORTUNITIES.length}`, label: "Verified opportunities seeded" },
  { value: "9", label: "Provinces on the roadmap" },
  { value: "8-step", label: "Guided student profile" },
];

const STEPS = [
  {
    n: "01",
    title: "Build your profile once",
    body: "A guided, mobile-first profile captures your marks, interests, finances and documents — saved as you go.",
  },
  {
    n: "02",
    title: "See what you qualify for",
    body: "An explainable engine checks every opportunity against your profile and tells you exactly why each one matches.",
  },
  {
    n: "03",
    title: "Get guided to enrolment",
    body: "Track applications, deadlines and documents in one place — with an adviser and clear next-best actions at every stage.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 10%, rgba(201,168,76,0.35), transparent), radial-gradient(50% 50% at 10% 90%, rgba(31,111,84,0.35), transparent)",
          }}
          aria-hidden
        />
        <div className="container-x relative py-20 sm:py-28">
          <span className="chip bg-white/10 text-gold-light">Sizanani Foundation · South Africa 🇿🇦</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            One student profile.
            <br />
            <span className="text-gold">Every suitable opportunity.</span>
            <br />
            One guided journey to education.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-paper/80">
            Sizanani helps learners discover bursaries, universities, colleges and pathways matched to
            their marks, interests and circumstances — and guides them all the way to enrolment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="btn-gold text-base">
              Build my profile →
            </Link>
            <Link href="/opportunities" className="btn-ghost border-white/20 bg-white/5 text-paper text-base hover:bg-white/10">
              Browse opportunities
            </Link>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-bold text-gold">{s.value}</dt>
                <dd className="mt-1 text-sm text-paper/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold text-ink">How Sizanani works</h2>
        <p className="mt-2 max-w-xl text-ink/60">
          From uncertainty to successful enrolment — you are never left guessing what to do next.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="font-display text-4xl font-bold text-gold/60">{s.n}</div>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink/65">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promise band */}
      <section className="bg-veld text-white">
        <div className="container-x grid gap-6 py-14 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">Built for every learner</h2>
            <p className="mt-2 text-white/85">
              Works on low-end phones and slow connections. Explains every recommendation. Never
              invents a requirement, and always shows an official source. When you don&apos;t qualify for
              your first choice, it shows you realistic alternative pathways.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3 text-sm">
            {[
              "Explainable matching",
              "Deadline intelligence",
              "Document checklists",
              "Application tracking",
              "Grounded AI adviser",
              "Alternative pathways",
            ].map((f) => (
              <li key={f} className="rounded-xl bg-white/10 px-4 py-3 font-medium">
                ✓ {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x py-16 text-center">
        <h2 className="font-display text-3xl font-semibold text-ink">Ready to find your opportunities?</h2>
        <p className="mx-auto mt-2 max-w-md text-ink/60">
          Build your profile once and let Sizanani find the opportunities that match you.
        </p>
        <Link href="/onboarding" className="btn-primary mt-6 text-base">
          Start now — it&apos;s free
        </Link>
      </section>
    </div>
  );
}
