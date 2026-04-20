import { anthropic, RESUME_PARSER_MODEL } from "./client";

export type ParsedProfile = {
  profession_slug:
    | "software-engineer"
    | "financial-analyst"
    | "marketer"
    | "lawyer"
    | "designer"
    | null;
  years_experience: number | null;
  seniority: "ic" | "manager" | "director" | "exec" | null;
  industry_vertical: string | null;
  ai_familiarity: "never" | "occasional" | "daily_power" | null;
  confidence: "high" | "medium" | "low";
  summary: string;
};

const SYSTEM_PROMPT = `You extract structured career data from a professional's LinkedIn profile or resume text.

─── Precursor Profession Taxonomy ───────────────────────────

Precursor tracks the following five professions at launch:

- software-engineer · Software Engineer — designs, builds, and maintains software systems; titles include SWE, Developer, Engineering Manager, Staff Engineer
- financial-analyst · Financial Analyst — builds financial models, analyzes performance, advises on investment decisions; titles include FP&A, Investment Banker, Equity Research, Credit Analyst
- marketer · Marketer — plans and executes campaigns to reach target audiences; titles include Marketing Manager, Growth, Brand, Demand Gen, Content, Product Marketing
- lawyer · Lawyer — advises clients on legal matters, drafts documents, represents in disputes; titles include Attorney, Associate, Counsel, Partner, General Counsel
- designer · Designer — creates visual and interactive experiences across digital and physical products; titles include Product Designer, UX Designer, Visual Designer, Creative Director

Match the user to the closest profession from this list. If none is a reasonable fit (e.g., Nurse, Teacher, Electrician), return null.

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
    · high = text is detailed and unambiguous
    · medium = some inference required
    · low = text is brief or vague; many fields are guesses
- summary: ONE sentence describing their background, grounded in the source text. No flattery, no marketing language.

Return ONLY the JSON object matching the provided schema. No prose, no preamble.`;

const JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    profession_slug: {
      anyOf: [
        {
          type: "string",
          enum: [
            "software-engineer",
            "financial-analyst",
            "marketer",
            "lawyer",
            "designer",
          ],
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

  const response = await anthropic.messages.create({
    model: RESUME_PARSER_MODEL,
    max_tokens: 1024,
    // Cache the (stable) taxonomy + instructions. User-pasted text is the only
    // variable part. Cache minimum is 4096 tokens on Opus 4.7 — this prompt is
    // under that threshold, so the cache is currently a no-op but costs nothing
    // and will kick in automatically if the taxonomy grows past the threshold.
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
    messages: [
      {
        role: "user",
        content: `Analyze this text:\n\n${trimmed}`,
      },
    ],
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
