import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, RESUME_PARSER_MODEL } from "./client";

// Keep this list in sync with the `supabase/seed.sql` professions block and
// the JSON_SCHEMA enum below. Adding or removing a profession requires all
// three to agree or the resume parser will return slugs that don't exist in
// the DB (causing onboarding to fail downstream).
export const PROFESSION_SLUGS = [
  "software-engineer",
  "financial-analyst",
  "marketer",
  "lawyer",
  "designer",
  "translator",
  "copywriter",
  "paralegal",
  "tax-preparer",
  "accountant",
  "data-analyst",
  "sales-development-rep",
  "journalist",
  "executive-assistant",
  "recruiter",
  "product-marketing-manager",
  "management-consultant",
  "hr-generalist",
  "product-manager",
  "customer-success-manager",
  "project-manager",
  "ux-researcher",
  "architect",
  "teacher",
  "therapist",
] as const;

export type ProfessionSlug = (typeof PROFESSION_SLUGS)[number];

export type ParsedProfile = {
  profession_slug: ProfessionSlug | null;
  years_experience: number | null;
  seniority: "ic" | "manager" | "director" | "exec" | null;
  industry_vertical: string | null;
  ai_familiarity: "never" | "occasional" | "daily_power" | null;
  confidence: "high" | "medium" | "low";
  summary: string;
};

const SYSTEM_PROMPT = `You extract structured career data from a professional's LinkedIn profile or resume — supplied either as text or as a PDF document.

─── Precursor Profession Taxonomy ───────────────────────────

Precursor tracks the following 25 professions. Match the user to the closest one. If none is a reasonable fit (e.g., Nurse, Electrician, Police Officer, Chef), return null.

- software-engineer · Software Engineer — designs, builds, and maintains software systems; titles include SWE, Developer, Engineering Manager, Staff Engineer
- financial-analyst · Financial Analyst — builds financial models, analyzes performance, advises on investment decisions; titles include FP&A, Investment Banker, Equity Research, Credit Analyst
- marketer · Marketer — plans and executes campaigns to reach target audiences; titles include Marketing Manager, Growth, Brand, Demand Gen, Content. Use product-marketing-manager if they specifically own product positioning/launches.
- product-marketing-manager · Product Marketing Manager — positions products, launches features, equips sales; titles include PMM, Product Marketing
- copywriter · Copywriter — writes marketing, advertising, and brand copy; titles include Copywriter, Brand Writer, Senior Writer (for marketing orgs)
- journalist · Journalist — investigates, reports, and writes news/feature stories; titles include Reporter, Staff Writer, Editor (for news orgs), Correspondent
- lawyer · Lawyer — practices law across drafting, counsel, and litigation; titles include Attorney, Associate, Counsel, Partner, General Counsel
- paralegal · Paralegal — supports attorneys with research, review, case prep; titles include Paralegal, Legal Assistant, Legal Specialist
- designer · Designer — creates visual/interactive product and brand experiences; titles include Product Designer, UX Designer, Visual Designer, Creative Director
- ux-researcher · UX Researcher — studies user behavior to inform product decisions; titles include User Researcher, UXR, Design Researcher
- product-manager · Product Manager — sets product direction aligning users, business, engineering; titles include PM, Product Lead, Group PM
- data-analyst · Data Analyst — turns data into insights via querying, modeling, viz; titles include Data Analyst, BI Analyst, Analytics Engineer (if primarily analysis-focused)
- accountant · Accountant — records transactions, prepares statements, ensures compliance; titles include Accountant, Bookkeeper, Staff Accountant, Controller (for smaller entities)
- tax-preparer · Tax Preparer — prepares tax returns and advises on compliance; titles include Tax Preparer, Tax Associate, Enrolled Agent
- management-consultant · Management Consultant — advises on strategy, operations, change; titles include Consultant, Senior Consultant, Engagement Manager, Principal
- recruiter · Recruiter — sources, screens, and manages candidates; titles include Recruiter, Talent Acquisition, Technical Recruiter, Sourcer
- hr-generalist · HR Generalist — handles policy, employee relations, benefits, onboarding; titles include HR Generalist, HR Manager, HRBP, People Operations
- sales-development-rep · Sales Development Rep — prospects and qualifies leads for AEs; titles include SDR, BDR, Sales Development, Inside Sales (prospecting-focused)
- customer-success-manager · Customer Success Manager — drives retention, expansion, adoption post-sale; titles include CSM, Customer Success, Account Manager (if post-sale focused)
- project-manager · Project Manager — plans and drives projects to completion; titles include Project Manager, Program Manager, Delivery Manager, Scrum Master
- executive-assistant · Executive Assistant — manages schedules, communications, logistics for execs; titles include EA, Executive Assistant, Chief of Staff (for junior-level)
- translator · Translator — converts text/speech between languages; titles include Translator, Interpreter, Localization Specialist
- architect · Architect — designs buildings and physical spaces; titles include Architect, Licensed Architect, Project Architect. Note: ONLY building architects — do NOT match software "architects" (those are software-engineer).
- teacher · Teacher — instructs K-12 students in schools; titles include Teacher, K-12 Educator, Elementary/Middle/High School Teacher
- therapist · Therapist / Counselor — provides talk therapy and mental health counseling; titles include Therapist, Counselor, LCSW, LMFT, Psychologist (clinical practice)

─── Extraction Rules ────────────────────────────────────────

- years_experience: total years of professional experience. Integer. If unclear, estimate conservatively. Use 0 for students/new grads.
- seniority:
    · ic = individual contributor, no direct reports
    · manager = team lead with direct reports
    · director = leads multiple teams / a function
    · exec = VP, C-suite, Partner, Founder
- industry_vertical: one short label — Technology, Finance, Healthcare, Legal, Consulting, Media, Retail, Energy, Education, Government, Non-profit, Real Estate, Manufacturing, Creative, or Other
- ai_familiarity:
    · never = no mention of AI tools or AI work
    · occasional = uses AI tools casually; one-off mentions
    · daily_power = AI is core to their workflow, builds AI products, references specific AI tools or models in depth
- confidence:
    · high = source is detailed and unambiguous
    · medium = some inference required
    · low = source is brief or vague; many fields are guesses
- summary: ONE sentence describing their background, grounded in the source. No flattery, no marketing language.

Return ONLY the JSON object matching the provided schema. No prose, no preamble.`;

const JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    profession_slug: {
      anyOf: [
        {
          type: "string",
          enum: [...PROFESSION_SLUGS],
        },
        { type: "null" },
      ],
    },
    years_experience: {
      anyOf: [{ type: "integer" }, { type: "null" }],
    },
    seniority: {
      anyOf: [
        { type: "string", enum: ["ic", "manager", "director", "exec"] },
        { type: "null" },
      ],
    },
    industry_vertical: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    ai_familiarity: {
      anyOf: [
        { type: "string", enum: ["never", "occasional", "daily_power"] },
        { type: "null" },
      ],
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
    },
    summary: { type: "string" },
  },
  required: [
    "profession_slug",
    "years_experience",
    "seniority",
    "industry_vertical",
    "ai_familiarity",
    "confidence",
    "summary",
  ],
  additionalProperties: false,
};

const MIN_INPUT_CHARS = 50;
const MAX_INPUT_CHARS = 25_000;
const MAX_PDF_BYTES = 5_000_000;

async function extractProfile(
  userContent: string | Anthropic.Messages.ContentBlockParam[],
): Promise<ParsedProfile> {
  const response = await anthropic.messages.create({
    model: RESUME_PARSER_MODEL,
    max_tokens: 1024,
    // Cache the (stable) taxonomy + instructions. The variable part is the
    // user-supplied content. Cache minimum is 4096 tokens on Opus 4.7 — this
    // prompt is under threshold today, but will kick in automatically once
    // the taxonomy grows past it.
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: JSON_SCHEMA,
      },
    },
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return a text block.");
  }

  try {
    return JSON.parse(textBlock.text) as ParsedProfile;
  } catch {
    throw new Error("Claude returned malformed JSON.");
  }
}

export async function parseResume(text: string): Promise<ParsedProfile> {
  const trimmed = text.trim();

  if (trimmed.length < MIN_INPUT_CHARS) {
    throw new Error(
      "Text is too short to analyze. Paste a fuller LinkedIn profile or resume.",
    );
  }
  if (trimmed.length > MAX_INPUT_CHARS) {
    throw new Error(
      `Text is too long (${trimmed.length.toLocaleString()} chars). Keep it under ${MAX_INPUT_CHARS.toLocaleString()}.`,
    );
  }

  return extractProfile(`Analyze this text:\n\n${trimmed}`);
}

export async function parseResumeFromPdf(
  base64: string,
): Promise<ParsedProfile> {
  // base64 → bytes conversion ratio is ~0.75
  const estimatedBytes = Math.floor(base64.length * 0.75);
  if (estimatedBytes > MAX_PDF_BYTES) {
    throw new Error(
      `PDF is too large (${(estimatedBytes / 1_000_000).toFixed(1)} MB). Keep it under ${MAX_PDF_BYTES / 1_000_000} MB.`,
    );
  }

  return extractProfile([
    {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: base64,
      },
    },
    {
      type: "text",
      text: "Analyze this resume or LinkedIn profile PDF and extract the structured data.",
    },
  ]);
}
