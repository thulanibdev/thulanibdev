"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { OPPORTUNITIES } from "@/lib/seed";
import { matchAll } from "@/lib/matching";
import { adviserRespond, SAMPLE_QUESTIONS, AdviserReply } from "@/lib/adviser";

interface Turn {
  role: "user" | "adviser";
  text: string;
  reply?: AdviserReply;
}

export default function Adviser() {
  const { profile, loaded } = useStore();
  const matches = useMemo(() => matchAll(profile, OPPORTUNITIES), [profile]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const ask = (question: string) => {
    if (!question.trim()) return;
    const reply = adviserRespond(question, profile, matches);
    setTurns((t) => [...t, { role: "user", text: question }, { role: "adviser", text: reply.answer, reply }]);
    setInput("");
  };

  if (!loaded) return <div className="container-x py-20 text-center text-ink/50">Loading…</div>;

  return (
    <div className="container-x max-w-3xl py-8 sm:py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-xl text-gold" aria-hidden>
          ✦
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Sizanani Adviser</h1>
          <p className="text-sm text-ink/60">Grounded in your profile and verified opportunities.</p>
        </div>
      </div>

      {!profile.fullName && (
        <div className="mt-5 rounded-xl bg-gold/10 p-4 text-sm text-ink/70">
          Tip: <Link href="/onboarding" className="font-semibold underline">build your profile</Link> so the adviser can answer with your marks, interests and matched opportunities.
        </div>
      )}

      {/* Conversation */}
      <div className="mt-6 space-y-4">
        {turns.length === 0 && (
          <div className="card p-6">
            <p className="text-ink/70">
              Hi{profile.preferredName ? ` ${profile.preferredName}` : ""}! I&apos;m your study adviser. I only use verified
              platform data and your own profile — I won&apos;t guess or invent requirements, and I&apos;ll always point you to
              official sources. Ask me anything, or start with one of these:
            </p>
          </div>
        )}

        {turns.map((t, i) => (
          <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {t.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-3 text-sm text-paper">{t.text}</div>
            ) : (
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white p-4 shadow-sm ring-1 ring-black/5">
                <p className="whitespace-pre-line text-sm text-ink/85">{t.text}</p>
                {t.reply?.citations && t.reply.citations.length > 0 && (
                  <div className="mt-3 border-t border-black/5 pt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Sources</p>
                    <ul className="space-y-1">
                      {t.reply.citations.map((c, j) => (
                        <li key={j}>
                          <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-sm text-veld hover:underline">
                            {c.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {t.reply?.disclaimer && <p className="mt-3 text-xs text-ink/45">⚠ {t.reply.disclaimer}</p>}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Suggested questions */}
      {turns.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q) => (
            <button key={q} onClick={() => ask(q)} className="chip border border-black/15 bg-white text-ink/75 hover:border-ink/40">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        className="sticky bottom-4 mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          className="input flex-1 shadow-lg"
          placeholder="Ask about bursaries, courses, deadlines, documents…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask the adviser"
        />
        <button type="submit" className="btn-primary shadow-lg">
          Ask
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-ink/40">
        The adviser gives guidance, not guarantees. Always confirm on official websites before applying.
      </p>
    </div>
  );
}
