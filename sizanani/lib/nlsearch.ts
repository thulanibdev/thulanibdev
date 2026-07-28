import { FieldOfStudy, Province, OpportunityType, PROVINCES, FIELDS } from "./types";

// ---------------------------------------------------------------------------
// Lightweight natural-language query parser.
// Converts a phrase like:
//   "Grade 12, 68% for Maths, want to study IT in Gauteng and need full funding"
// into structured filters the search page can apply. Deterministic and
// explainable — it shows the user exactly what it understood.
// ---------------------------------------------------------------------------

export interface ParsedQuery {
  fields: FieldOfStudy[];
  provinces: Province[];
  types: OpportunityType[];
  mathMark?: number;
  fullFunding?: boolean;
  noFee?: boolean;
  onlineOnly?: boolean;
  understood: string[]; // human-readable summary of what was parsed
}

const FIELD_KEYWORDS: Record<string, FieldOfStudy> = {
  "it": "Information Technology",
  "information technology": "Information Technology",
  "computer": "Information Technology",
  "software": "Information Technology",
  "coding": "Information Technology",
  "programming": "Information Technology",
  "engineer": "Engineering",
  "engineering": "Engineering",
  "medic": "Health Sciences",
  "health": "Health Sciences",
  "nursing": "Health Sciences",
  "doctor": "Health Sciences",
  "account": "Accounting & Finance",
  "finance": "Accounting & Finance",
  "commerce": "Commerce & Business",
  "business": "Commerce & Business",
  "teach": "Education",
  "education": "Education",
  "law": "Law",
  "science": "Natural & Physical Sciences",
  "agricultur": "Agriculture",
  "farming": "Agriculture",
  "art": "Arts & Design",
  "design": "Arts & Design",
};

const TYPE_KEYWORDS: Record<string, OpportunityType> = {
  "bursar": "Bursary",
  "scholarship": "Scholarship",
  "university": "University Programme",
  "degree": "University Programme",
  "tvet": "TVET Programme",
  "college": "TVET Programme",
  "learnership": "Learnership",
  "apprentice": "Apprenticeship",
};

export function parseQuery(input: string): ParsedQuery {
  const q = input.toLowerCase();
  const understood: string[] = [];
  const fields = new Set<FieldOfStudy>();
  const provinces = new Set<Province>();
  const types = new Set<OpportunityType>();

  for (const [kw, field] of Object.entries(FIELD_KEYWORDS)) {
    if (q.includes(kw)) fields.add(field);
  }
  for (const [kw, type] of Object.entries(TYPE_KEYWORDS)) {
    if (q.includes(kw)) types.add(type);
  }
  for (const p of PROVINCES) {
    if (q.includes(p.toLowerCase())) provinces.add(p);
  }
  // common informal province names
  if (q.includes("joburg") || q.includes("johannesburg") || q.includes("pretoria") || q.includes("gauteng"))
    provinces.add("Gauteng");
  if (q.includes("cape town") || q.includes("western cape")) provinces.add("Western Cape");
  if (q.includes("durban") || q.includes("kzn")) provinces.add("KwaZulu-Natal");

  const mathMatch = q.match(/(\d{2,3})\s*%?\s*(for\s+)?(maths|mathematics|math)/);
  let mathMark: number | undefined;
  if (mathMatch) {
    const n = parseInt(mathMatch[1], 10);
    if (n >= 0 && n <= 100) mathMark = n;
  }

  const fullFunding = /full funding|fully funded|full cost|need money|can.?t (pay|afford)/.test(q);
  const noFee = /no (application )?fee|free to apply|can.?t pay.*fee/.test(q);
  const onlineOnly = /online|distance|remote|from home/.test(q);

  if (fields.size) understood.push(`Field: ${[...fields].join(", ")}`);
  if (types.size) understood.push(`Type: ${[...types].join(", ")}`);
  if (provinces.size) understood.push(`Province: ${[...provinces].join(", ")}`);
  if (mathMark != null) understood.push(`Maths mark: ${mathMark}%`);
  if (fullFunding) understood.push("Needs full funding");
  if (noFee) understood.push("No application fee");
  if (onlineOnly) understood.push("Online / distance study");

  return {
    fields: [...fields],
    provinces: [...provinces],
    types: [...types],
    mathMark,
    fullFunding: fullFunding || undefined,
    noFee: noFee || undefined,
    onlineOnly: onlineOnly || undefined,
    understood,
  };
}
