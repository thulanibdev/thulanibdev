import { StudentProfile, MatchResult } from "./types";
import { calculateAps } from "./aps";
import { computeReadiness } from "./readiness";
import { daysUntil } from "./matching";

// ---------------------------------------------------------------------------
// Rule-based AI adviser.
//
// The spec requires the adviser to be GROUNDED in verified platform data and
// the student's own profile, to explain its reasoning, to admit uncertainty,
// and never to invent requirements or guarantee outcomes. A deterministic,
// rule-based responder satisfies those safety guarantees without an external
// model. In production this becomes the retrieval + guardrail layer that an
// LLM answers on top of — the LLM may only cite facts assembled here.
// ---------------------------------------------------------------------------

export interface AdviserReply {
  answer: string;
  citations: { label: string; href: string }[];
  disclaimer?: string;
}

const SAFETY =
  "Always confirm deadlines and requirements on the official website before applying — information can change.";

export function adviserRespond(
  question: string,
  profile: StudentProfile,
  matches: MatchResult[]
): AdviserReply {
  const q = question.toLowerCase();
  const citations: { label: string; href: string }[] = [];
  const eligible = matches.filter(
    (m) => m.tier === "Strong match" || m.tier === "Possible match"
  );
  const aspirational = matches.filter((m) => m.tier === "Aspirational match");

  // --- qualify / eligible ---------------------------------------------------
  if (/(qualify|eligible|which bursar|what.*apply|can i get)/.test(q)) {
    if (eligible.length === 0) {
      return {
        answer:
          "I can't confirm a strong match yet — that's usually because some of your profile is still missing rather than because you don't qualify. Add your subject marks, household income band and fields of interest, and I'll re-check every opportunity for you.",
        citations,
        disclaimer: SAFETY,
      };
    }
    const top = eligible.slice(0, 4);
    top.forEach((m) =>
      citations.push({ label: m.opportunity.name, href: m.opportunity.officialLink })
    );
    const lines = top
      .map(
        (m) =>
          `• ${m.opportunity.name} (${m.opportunity.provider}) — ${m.tier}, ${m.score}% fit. ${
            m.reasons.find((r) => r.kind === "met")?.label ?? "Meets the core criteria."
          }`
      )
      .join("\n");
    return {
      answer: `Based on your profile, here are opportunities you appear to qualify for:\n\n${lines}\n\nOpen any of them to see the exact requirements and start an application.`,
      citations,
      disclaimer: SAFETY,
    };
  }

  // --- what can I study with my marks / APS --------------------------------
  if (/(what.*study|which (course|programme|degree)|my aps|my marks|what can i do)/.test(q)) {
    const { aps, note } = calculateAps(profile);
    const programmes = matches.filter(
      (m) =>
        m.opportunity.type === "University Programme" ||
        m.opportunity.type === "TVET Programme"
    );
    const qualifyNow = programmes.filter(
      (m) => m.tier === "Strong match" || m.tier === "Possible match"
    );
    const stretch = programmes.filter((m) => m.tier === "Aspirational match");
    qualifyNow.slice(0, 3).forEach((m) =>
      citations.push({ label: m.opportunity.name, href: m.opportunity.officialLink })
    );
    let answer = `Your estimated APS is ${aps}. (${note})\n\n`;
    if (qualifyNow.length) {
      answer += `Programmes you appear to qualify for now:\n${qualifyNow
        .slice(0, 4)
        .map((m) => `• ${m.opportunity.name} — ${m.opportunity.provider}`)
        .join("\n")}\n\n`;
    }
    if (stretch.length) {
      answer += `Close, if you improve your marks slightly:\n${stretch
        .slice(0, 3)
        .map((m) => `• ${m.opportunity.name} — ${m.opportunity.provider}`)
        .join("\n")}\n\n`;
    }
    if (!qualifyNow.length && !stretch.length) {
      answer +=
        "Add more of your subject marks so I can check programmes accurately. There are also diploma, extended-programme and TVET pathways that accept a wide range of results.";
    }
    return { answer, citations, disclaimer: SAFETY };
  }

  // --- next deadline --------------------------------------------------------
  if (/(deadline|closing|due|when.*apply|time left)/.test(q)) {
    const upcoming = matches
      .filter((m) => {
        const d = daysUntil(m.opportunity.deadline);
        return d != null && d >= 0 && m.tier !== "Not currently eligible";
      })
      .sort(
        (a, b) =>
          (daysUntil(a.opportunity.deadline) ?? 0) - (daysUntil(b.opportunity.deadline) ?? 0)
      );
    if (!upcoming.length) {
      return { answer: "You have no matched opportunities with an upcoming deadline right now. Complete your profile to surface more matches.", citations, disclaimer: SAFETY };
    }
    const next = upcoming[0];
    citations.push({ label: next.opportunity.name, href: next.opportunity.officialLink });
    const list = upcoming
      .slice(0, 5)
      .map((m) => `• ${m.opportunity.name} — closes in ${daysUntil(m.opportunity.deadline)} day(s)`)
      .join("\n");
    return {
      answer: `Your nearest deadline is ${next.opportunity.name}, closing in ${daysUntil(
        next.opportunity.deadline
      )} day(s). Don't wait for the closing date — aim to submit a few days early.\n\nUpcoming deadlines:\n${list}`,
      citations,
      disclaimer: SAFETY,
    };
  }

  // --- documents ------------------------------------------------------------
  if (/(document|missing|need to upload|paperwork|certif)/.test(q)) {
    const needed = new Set<string>();
    eligible.slice(0, 6).forEach((m) =>
      m.opportunity.requiredDocuments.forEach((d) => {
        if (!profile.documents.some((have) => have.toLowerCase() === d.toLowerCase())) needed.add(d);
      })
    );
    if (needed.size === 0) {
      return { answer: "Great news — for your top matches you appear to have the documents you need. Keep certified copies ready.", citations, disclaimer: SAFETY };
    }
    return {
      answer: `Across your best matches, these documents come up most often and you haven't marked them as ready:\n${[
        ...needed,
      ]
        .map((d) => `• ${d}`)
        .join("\n")}\n\nGetting certified copies of these early will unblock several applications at once.`,
      citations,
      disclaimer: SAFETY,
    };
  }

  // --- backup / alternatives ------------------------------------------------
  if (/(backup|alternative|if i (don.t|do not)|plan b|not qualify|other option)/.test(q)) {
    const alts = matches.filter(
      (m) => m.tier === "Alternative opportunity" || m.opportunity.qualificationLevel === "Extended Degree" || m.opportunity.type === "TVET Programme"
    );
    alts.slice(0, 4).forEach((m) => citations.push({ label: m.opportunity.name, href: m.opportunity.officialLink }));
    const lines = alts
      .slice(0, 4)
      .map((m) => `• ${m.opportunity.name} — ${m.opportunity.provider}`)
      .join("\n");
    return {
      answer: `There are always alternative routes. Consider these realistic pathways${
        lines ? ":\n" + lines : " — diplomas, extended programmes, TVET and distance study."
      }\n\nA diploma or extended programme can lead to the same career, and you can often bridge into a degree later.`,
      citations,
      disclaimer: SAFETY,
    };
  }

  // --- motivational letter --------------------------------------------------
  if (/(motivation|letter|essay|personal statement|write)/.test(q)) {
    return {
      answer:
        "I can help you draft a motivational letter, but it must be truthful — I won't invent achievements or hardship. A strong letter answers: (1) who you are and where you're from, (2) why you chose this field, (3) a challenge you've overcome, (4) your goals, and (5) how this opportunity helps you reach them. Open any saved application to use the guided letter builder, which turns your own answers into an editable draft.",
      citations,
      disclaimer: SAFETY,
    };
  }

  // --- readiness / progress -------------------------------------------------
  if (/(ready|readiness|progress|how am i doing|next step|what.*do next)/.test(q)) {
    const r = computeReadiness(profile);
    return {
      answer: `Your application readiness is ${r.score}%. ${
        r.outstanding.length
          ? "Your next best steps:\n" + r.outstanding.slice(0, 4).map((o) => `• ${o}`).join("\n")
          : "You're application-ready — start submitting your matched opportunities."
      }`,
      citations,
      disclaimer: SAFETY,
    };
  }

  // --- fallback -------------------------------------------------------------
  return {
    answer:
      "I'm your Sizanani study adviser. I can only speak to verified opportunities on the platform and your own profile. Try asking:\n• Which bursaries do I qualify for?\n• What can I study with my marks?\n• What is my next deadline?\n• Which documents am I missing?\n• What are my backup options?",
    citations,
    disclaimer: SAFETY,
  };
}

export const SAMPLE_QUESTIONS = [
  "Which bursaries do I qualify for?",
  "What can I study with my marks?",
  "What is my next deadline?",
  "Which documents am I missing?",
  "What are my backup options if I don't qualify?",
  "How do I write my motivational letter?",
];
