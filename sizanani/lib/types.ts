// ---------------------------------------------------------------------------
// Sizanani — core domain types
// These mirror the platform's data model (see docs/DATABASE_SCHEMA.md).
// The MVP persists StudentProfile in the browser; opportunities are seeded.
// ---------------------------------------------------------------------------

export type Province =
  | "Eastern Cape"
  | "Free State"
  | "Gauteng"
  | "KwaZulu-Natal"
  | "Limpopo"
  | "Mpumalanga"
  | "North West"
  | "Northern Cape"
  | "Western Cape";

export const PROVINCES: Province[] = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

export type Grade = "9" | "10" | "11" | "12" | "Matric complete";

export type MathType = "Mathematics" | "Mathematical Literacy" | "None";

export interface SubjectMark {
  subject: string;
  mark: number; // percentage 0-100
}

// Household income bands used for bursary means-testing (annual, ZAR).
export type IncomeBand =
  | "0-50k"
  | "50k-120k"
  | "120k-350k"
  | "350k-600k"
  | "600k+"
  | "prefer-not-to-say";

export const INCOME_BANDS: { value: IncomeBand; label: string }[] = [
  { value: "0-50k", label: "Under R50,000" },
  { value: "50k-120k", label: "R50,000 – R120,000" },
  { value: "120k-350k", label: "R120,000 – R350,000" },
  { value: "350k-600k", label: "R350,000 – R600,000" },
  { value: "600k+", label: "Over R600,000" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export type FieldOfStudy =
  | "Information Technology"
  | "Engineering"
  | "Health Sciences"
  | "Commerce & Business"
  | "Education"
  | "Law"
  | "Natural & Physical Sciences"
  | "Humanities & Social Sciences"
  | "Agriculture"
  | "Arts & Design"
  | "Accounting & Finance";

export const FIELDS: FieldOfStudy[] = [
  "Information Technology",
  "Engineering",
  "Health Sciences",
  "Commerce & Business",
  "Accounting & Finance",
  "Education",
  "Law",
  "Natural & Physical Sciences",
  "Humanities & Social Sciences",
  "Agriculture",
  "Arts & Design",
];

export type QualificationLevel =
  | "Higher Certificate"
  | "Diploma"
  | "Bachelor's Degree"
  | "Extended Degree"
  | "TVET (NC(V))"
  | "Learnership"
  | "Apprenticeship";

// Voluntary eligibility indicators — always optional, never used to exclude.
export interface EligibilityIndicators {
  disability?: boolean;
  ruralBackground?: boolean;
  townshipBackground?: boolean;
  firstGeneration?: boolean;
  childHeadedHousehold?: boolean;
  orphanedOrVulnerable?: boolean;
  sassaBeneficiary?: boolean;
  socialGrant?: boolean;
}

export interface StudentProfile {
  // Step 1 — basics
  fullName: string;
  preferredName?: string;
  email?: string;
  mobile?: string;
  citizenship: "SA citizen" | "Permanent resident" | "Other" | "";
  province: Province | "";
  town?: string;
  schoolName?: string;
  grade: Grade | "";
  matricYear?: number;

  // Step 2 — academics
  mathType: MathType;
  mathMark?: number;
  englishMark?: number;
  homeLanguage?: string;
  subjects: SubjectMark[];
  apsOverride?: number; // if student already knows their APS

  // Step 3 — career & study interests
  fields: FieldOfStudy[];
  qualificationLevels: QualificationLevel[];
  preferredProvinces: Province[];
  willingToRelocate?: boolean;
  considerOnline?: boolean;
  considerTVET?: boolean;
  needsAccommodation?: boolean;

  // Step 4 — financial
  incomeBand: IncomeBand | "";
  needsFullFunding?: boolean;
  needsFeeWaiver?: boolean; // application fee assistance
  needsDeviceOrData?: boolean;

  // Step 5 — indicators (voluntary)
  indicators: EligibilityIndicators;

  // Step 6 — activities/achievements (free text tags)
  achievements: string[];

  // Step 7 — documents the learner already has
  documents: string[];

  // Step 8 — support needs
  supportNeeds: string[];
  wantsMentor?: boolean;

  // meta
  onboardingStep: number; // 0-8, how far they've progressed
  updatedAt: string;
}

export function emptyProfile(): StudentProfile {
  return {
    fullName: "",
    citizenship: "",
    province: "",
    grade: "",
    mathType: "None",
    subjects: [],
    fields: [],
    qualificationLevels: [],
    preferredProvinces: [],
    incomeBand: "",
    indicators: {},
    achievements: [],
    documents: [],
    supportNeeds: [],
    onboardingStep: 0,
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

export type OpportunityType =
  | "Bursary"
  | "Scholarship"
  | "University Programme"
  | "TVET Programme"
  | "Learnership"
  | "Apprenticeship"
  | "Support Programme";

export type VerificationStatus =
  | "Verified by Sizanani"
  | "Verified by provider"
  | "Automatically discovered"
  | "Awaiting verification"
  | "Information may have changed"
  | "Expired";

export interface FundingBenefits {
  tuition?: boolean;
  accommodation?: boolean;
  meals?: boolean;
  textbooks?: boolean;
  transport?: boolean;
  device?: boolean;
  stipend?: boolean;
  amountNote?: string; // free text, only if provider disclosed
  fullFunding?: boolean;
}

export interface Eligibility {
  citizenship?: ("SA citizen" | "Permanent resident")[];
  fields?: FieldOfStudy[];
  minAps?: number;
  minMathMark?: number; // requires Mathematics (not Maths Lit)
  requiresMathematics?: boolean;
  minEnglishMark?: number;
  provinces?: Province[]; // must live in one of these (empty = national)
  maxIncomeBand?: IncomeBand; // means-tested ceiling
  grades?: Grade[];
  qualificationLevels?: QualificationLevel[];
  requiresDisability?: boolean;
  notes?: string;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  name: string;
  provider: string;
  description: string;
  fields: FieldOfStudy[];
  funding: FundingBenefits;
  eligibility: Eligibility;
  requiredDocuments: string[];
  essayRequired?: boolean;
  interviewRequired?: boolean;
  workBackObligation?: boolean;
  applicationFee?: number; // ZAR, 0 = free
  opensOn?: string; // ISO date
  deadline?: string; // ISO date; undefined = not specified
  deadlineConfidence?: "high" | "medium" | "low";
  officialLink: string;
  sourceUrl: string;
  lastChecked: string;
  verification: VerificationStatus;
  // For university programmes:
  institution?: string;
  campus?: string;
  qualificationLevel?: QualificationLevel;
  durationYears?: number;
}

// ---------------------------------------------------------------------------
// Matching results
// ---------------------------------------------------------------------------

export type MatchTier =
  | "Strong match"
  | "Possible match"
  | "Aspirational match"
  | "Alternative opportunity"
  | "Not currently eligible";

export interface MatchReason {
  kind: "met" | "uncertain" | "missing" | "failed";
  label: string;
}

export interface MatchResult {
  opportunity: Opportunity;
  score: number; // 0-100
  tier: MatchTier;
  reasons: MatchReason[];
  nextActions: string[];
  disqualifiers: string[]; // hard-fail requirements
}

// ---------------------------------------------------------------------------
// Applications & tasks (journey tracking)
// ---------------------------------------------------------------------------

export type ApplicationStage =
  | "Saved"
  | "Preparing"
  | "Documents outstanding"
  | "Ready to apply"
  | "Application started"
  | "Submitted"
  | "Awaiting response"
  | "Shortlisted"
  | "Interview scheduled"
  | "Accepted"
  | "Funding awarded"
  | "Unsuccessful"
  | "Deferred";

export interface AppTask {
  id: string;
  label: string;
  done: boolean;
  blockedBy?: string; // id of a task this depends on
}

export interface TrackedApplication {
  opportunityId: string;
  stage: ApplicationStage;
  tasks: AppTask[];
  notes?: string;
  savedAt: string;
}
