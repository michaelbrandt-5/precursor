/**
 * Curated profession adjacency map. Each key is a profession slug; each
 * value is a list of slugs editorially considered "lateral moves" — roles
 * with overlapping skills/capabilities the user is plausibly partway
 * qualified for, regardless of baseline exposure score.
 *
 * The dashboard then filters this list down to *lower-exposure* adjacents
 * to surface as actionable career considerations. Curation should be
 * generous (4-5 candidates) since we filter aggressively at render time.
 *
 * Edit this file rather than the DB — these are editorial decisions, not
 * end-user data, and live alongside the parseResume taxonomy.
 */
export const ADJACENCIES: Record<string, readonly string[]> = {
  "software-engineer": [
    "product-manager",
    "ux-researcher",
    "data-analyst",
    "management-consultant",
  ],
  "financial-analyst": [
    "accountant",
    "tax-preparer",
    "management-consultant",
    "product-manager",
  ],
  marketer: [
    "product-marketing-manager",
    "management-consultant",
    "journalist",
    "ux-researcher",
  ],
  lawyer: ["paralegal", "management-consultant", "hr-generalist"],
  designer: ["ux-researcher", "product-manager", "architect"],
  translator: ["copywriter", "journalist"],
  copywriter: [
    "product-marketing-manager",
    "journalist",
    "marketer",
    "ux-researcher",
  ],
  paralegal: ["executive-assistant", "hr-generalist", "recruiter"],
  "tax-preparer": ["accountant", "financial-analyst"],
  accountant: ["financial-analyst", "tax-preparer", "management-consultant"],
  "data-analyst": [
    "ux-researcher",
    "product-manager",
    "software-engineer",
    "management-consultant",
  ],
  "sales-development-rep": [
    "customer-success-manager",
    "recruiter",
    "marketer",
  ],
  journalist: ["copywriter", "marketer", "ux-researcher"],
  "executive-assistant": [
    "project-manager",
    "hr-generalist",
    "recruiter",
    "customer-success-manager",
  ],
  recruiter: [
    "hr-generalist",
    "sales-development-rep",
    "customer-success-manager",
    "project-manager",
  ],
  "product-marketing-manager": [
    "marketer",
    "product-manager",
    "copywriter",
    "management-consultant",
  ],
  "management-consultant": [
    "product-manager",
    "financial-analyst",
    "marketer",
    "ux-researcher",
  ],
  "hr-generalist": [
    "recruiter",
    "executive-assistant",
    "project-manager",
    "therapist",
  ],
  "product-manager": [
    "ux-researcher",
    "product-marketing-manager",
    "management-consultant",
    "designer",
  ],
  "customer-success-manager": [
    "sales-development-rep",
    "recruiter",
    "project-manager",
    "product-manager",
  ],
  "project-manager": [
    "product-manager",
    "executive-assistant",
    "management-consultant",
    "hr-generalist",
  ],
  "ux-researcher": [
    "product-manager",
    "data-analyst",
    "designer",
    "management-consultant",
  ],
  architect: ["designer", "project-manager", "ux-researcher"],
  teacher: ["therapist", "ux-researcher", "hr-generalist"],
  therapist: ["teacher", "hr-generalist"],
};
