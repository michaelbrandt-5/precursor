import Anthropic from "@anthropic-ai/sdk";

/**
 * Precursor uses Claude Opus 4.7 for resume parsing — highest accuracy on
 * structured extraction. For high-volume onboarding, swap to `claude-haiku-4-5`
 * (10x cheaper, still plenty accurate for this task). Model ID is per the
 * Anthropic SDK rules (no date suffix — use exact ID from the catalog).
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const RESUME_PARSER_MODEL = "claude-opus-4-7";
