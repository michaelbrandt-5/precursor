-- ═══════════════════════════════════════════════════════════════════
-- Precursor · Seed data
-- Run AFTER the initial schema migration.
-- Idempotent: uses ON CONFLICT DO NOTHING on slug/name.
-- ═══════════════════════════════════════════════════════════════════


-- ─── Capabilities (canonical taxonomy) ─────────────────────────────

insert into public.capabilities (slug, name, description, category) values
  ('writing-communication',   'Writing & Communication',     'Drafting prose, emails, summaries, and structured written content.',                 'Cognitive'),
  ('data-analysis',           'Data Analysis & Reasoning',   'Quantitative analysis, pattern recognition, and drawing conclusions from data.',     'Cognitive'),
  ('creative-ideation',       'Creative Ideation',           'Generating novel concepts, designs, and original creative work.',                    'Creative'),
  ('strategic-decision',      'Strategic Decision-Making',   'High-stakes judgment calls under ambiguity, weighing tradeoffs.',                    'Judgment'),
  ('stakeholder-coordination','Stakeholder Coordination',    'Managing relationships, negotiation, alignment across humans.',                      'Social'),
  ('technical-execution',     'Technical Execution',         'Building, coding, implementing technical systems and deliverables.',                 'Technical'),
  ('quantitative-modeling',   'Quantitative Modeling',       'Building financial, statistical, or domain-specific numerical models.',              'Technical'),
  ('visual-design',           'Visual Design',               'Composition, layout, color, typography, visual aesthetics.',                         'Creative'),
  ('research-synthesis',      'Research & Synthesis',        'Gathering information from many sources and condensing it into insight.',            'Cognitive'),
  ('legal-regulatory',        'Legal & Regulatory Analysis', 'Interpreting law, regulation, precedent, and compliance requirements.',              'Domain'),
  ('teaching-explaining',     'Teaching & Explaining',       'Breaking down complex ideas clearly for specific audiences.',                         'Cognitive'),
  ('persuasion-negotiation',  'Persuasion & Negotiation',    'Influencing decisions, closing deals, resolving conflicts.',                         'Social')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category;


-- ─── AI Tools (citation library) ───────────────────────────────────

insert into public.ai_tools (name, vendor, url, description, capabilities_affected, first_seen) values
  ('Claude Opus 4.7',     'Anthropic', 'https://claude.ai',        'Frontier general-purpose reasoning and writing model.',         array['writing-communication','data-analysis','research-synthesis','strategic-decision','teaching-explaining','legal-regulatory'], '2026-01-15'),
  ('GPT-5',               'OpenAI',    'https://chatgpt.com',      'Frontier general-purpose reasoning and writing model.',         array['writing-communication','data-analysis','research-synthesis','creative-ideation','teaching-explaining'],  '2025-08-10'),
  ('Cursor',              'Anysphere', 'https://cursor.com',       'AI-first IDE for code generation and refactoring.',             array['technical-execution'],                                                  '2023-03-14'),
  ('Claude Code',         'Anthropic', 'https://claude.com/code',  'AI coding agent for the terminal and IDE.',                     array['technical-execution','research-synthesis'],                             '2025-02-24'),
  ('Midjourney v7',       'Midjourney','https://midjourney.com',   'Image generation model.',                                       array['visual-design','creative-ideation'],                                    '2025-06-01'),
  ('Figma Make',          'Figma',     'https://figma.com',        'AI-assisted design and prototyping.',                           array['visual-design','creative-ideation'],                                    '2024-11-01'),
  ('Harvey',              'Harvey AI', 'https://harvey.ai',        'AI legal research and drafting platform.',                      array['legal-regulatory','research-synthesis','writing-communication'],        '2023-07-01'),
  ('Perplexity Pro',      'Perplexity','https://perplexity.ai',    'AI research assistant for factual queries.',                    array['research-synthesis','data-analysis'],                                   '2022-12-07')
on conflict do nothing;


-- ─── Professions (25 total) ────────────────────────────────────────

insert into public.professions (slug, title, sector, category, summary, body_md, baseline_score, published)
values
  (
    'software-engineer',
    'Software Engineer',
    'Technology',
    'Engineering',
    'Designs, builds, and maintains software systems.',
    '### Overview

Software engineering sits at the leading edge of AI augmentation. Code generation models can now produce working implementations from natural-language descriptions, refactor legacy systems, and operate agentically inside codebases. Roles concentrated in greenfield implementation are highly exposed. Architecture, debugging production incidents, and cross-team technical leadership remain substantially human.',
    72,
    true
  ),
  (
    'financial-analyst',
    'Financial Analyst',
    'Finance',
    'Analysis',
    'Builds financial models, analyzes performance, and advises on investment decisions.',
    '### Overview

Financial analysis is among the most AI-exposed knowledge-work roles. LLMs draft memos, extract figures from filings, build DCF frameworks, and execute pattern recognition across large datasets. Roles relying heavily on spreadsheet mechanics and report formatting are most exposed. Stakeholder judgment, counterparty negotiation, and client relationship management remain human.',
    84,
    true
  ),
  (
    'marketer',
    'Marketer',
    'Marketing',
    'Strategy',
    'Plans and executes campaigns to reach target audiences.',
    '### Overview

Marketing has seen one of the largest shifts in day-to-day workflow from generative AI. Copywriting, first-pass creative, audience research, and performance-analysis summarization are heavily augmented. Brand strategy, positioning judgment, and creative direction remain substantially human — but the ratio of output that starts as AI-generated is rising fast.',
    76,
    true
  ),
  (
    'lawyer',
    'Lawyer',
    'Legal',
    'Professional Services',
    'Advises clients on legal matters, drafts documents, and represents in disputes.',
    '### Overview

Legal work is being transformed by AI more deeply than the headlines suggest. Contract drafting, due diligence, legal research, and document review — the bulk of associate-level billable hours — are increasingly AI-augmented. Judgment-heavy work (litigation strategy, client counsel, oral advocacy) remains human. The exposure score reflects a structural shift in where lawyers add value, not obsolescence.',
    61,
    true
  ),
  (
    'designer',
    'Designer',
    'Creative',
    'Product & Brand',
    'Creates visual and interactive experiences across digital and physical products.',
    '### Overview

Design is undergoing rapid change. First-pass UI mockups, iteration on brand directions, image generation, and pattern-matching against competitors can all be AI-augmented. Taste, judgment about user needs, and cross-functional leadership in product decisions remain deeply human. Roles concentrated in production work are most exposed; roles that shape product direction are less so.',
    68,
    true
  ),
  (
    'translator',
    'Translator',
    'Professional Services',
    'Language',
    'Converts text and speech between languages for business, legal, and media contexts.',
    '### Overview

Translation is among the most AI-exposed professions. Modern LLMs produce fluent translations across major language pairs, often at near-human quality for general business content. Specialized domains (legal filings, literary translation, simultaneous interpretation) retain more human value, but the volume of routine translation work has shifted decisively toward AI pipelines with human review.',
    88,
    true
  ),
  (
    'copywriter',
    'Copywriter',
    'Creative',
    'Writing',
    'Writes marketing, advertising, and brand copy to persuade specific audiences.',
    '### Overview

Copywriting is one of the most transformed professions. Email sequences, ad copy, social posts, and web copy are now overwhelmingly AI-drafted with human editing. Brand voice judgment, strategy, and concepting remain human-led, but the pure output of words-on-page is heavily augmented.',
    86,
    true
  ),
  (
    'paralegal',
    'Paralegal',
    'Legal',
    'Professional Services',
    'Supports attorneys with document review, legal research, and case preparation.',
    '### Overview

Paralegal work — historically focused on document review, discovery production, and drafting routine filings — is deeply AI-exposed. Harvey, contract analyzers, and general LLMs handle much of the volume work. Client-facing coordination and complex case management remain human.',
    82,
    true
  ),
  (
    'tax-preparer',
    'Tax Preparer',
    'Finance',
    'Tax',
    'Prepares individual and business tax returns and advises on compliance.',
    '### Overview

Routine tax preparation is highly AI-exposed: return logic is well-defined and machine-readable, and AI can surface deductions and flag inconsistencies at scale. Complex multi-entity planning, audit representation, and client advisory retain human value.',
    82,
    true
  ),
  (
    'accountant',
    'Accountant',
    'Finance',
    'Accounting',
    'Records financial transactions, prepares statements, and ensures reporting compliance.',
    '### Overview

Bookkeeping, reconciliations, and financial statement drafting are strongly augmented by AI. Audit judgment, GAAP/IFRS edge cases, and forensic accounting retain more human value. Roles concentrated in transaction processing are most exposed.',
    78,
    true
  ),
  (
    'data-analyst',
    'Data Analyst',
    'Technology',
    'Analytics',
    'Turns raw data into insights through querying, modeling, and visualization.',
    '### Overview

SQL generation, dashboard building, and pattern identification are now AI-first workflows. Data storytelling — framing what matters and why, for a specific decision — remains the harder human skill. Routine analyst work is heavily augmented; principal/staff analyst judgment less so.',
    78,
    true
  ),
  (
    'sales-development-rep',
    'Sales Development Rep',
    'Sales',
    'SDR',
    'Prospects and qualifies inbound and outbound leads for account executives.',
    '### Overview

SDR work — personalized outreach, objection handling, discovery-call summaries — is heavily AI-augmented. Personalization at scale and CRM hygiene are effectively machine-driven. Tonal judgment and deep qualifying conversations remain human.',
    76,
    true
  ),
  (
    'journalist',
    'Journalist',
    'Media',
    'Editorial',
    'Investigates, reports, and writes news and feature stories for an audience.',
    '### Overview

AI speeds research, transcription, and first-draft writing significantly. Investigative journalism, source cultivation, and editorial judgment remain strongly human. Beat reporting and aggregation-heavy work are most exposed.',
    72,
    true
  ),
  (
    'executive-assistant',
    'Executive Assistant',
    'Operations',
    'Administrative',
    'Manages schedules, communications, and logistics for senior executives.',
    '### Overview

Calendar management, email triage, meeting prep, and travel coordination are increasingly AI-handled. Trusted judgment, discretion with sensitive information, and relationship management with stakeholders remain human.',
    72,
    true
  ),
  (
    'recruiter',
    'Recruiter',
    'Human Resources',
    'Talent Acquisition',
    'Sources, screens, and manages candidates through hiring pipelines.',
    '### Overview

Sourcing, resume screening, scheduling, and candidate outreach are strongly AI-augmented. Closing judgment, candidate experience nuance, and hiring manager partnership remain human. High-volume agency work is most exposed.',
    70,
    true
  ),
  (
    'product-marketing-manager',
    'Product Marketing Manager',
    'Marketing',
    'Product',
    'Positions products, launches features, and equips sales and marketing teams.',
    '### Overview

Positioning drafts, competitive analysis, sales enablement collateral, and launch content are heavily AI-augmented. Strategic positioning calls, customer research synthesis, and cross-functional orchestration remain human.',
    68,
    true
  ),
  (
    'management-consultant',
    'Management Consultant',
    'Consulting',
    'Strategy',
    'Advises organizations on strategy, operations, and organizational change.',
    '### Overview

Slide production, research synthesis, and framework application are heavily AI-augmented. Client relationships, executive-level judgment, and change management remain human. Junior consulting work is significantly more exposed than partner/director work.',
    68,
    true
  ),
  (
    'hr-generalist',
    'HR Generalist',
    'Human Resources',
    'People Operations',
    'Handles day-to-day HR operations: policy, onboarding, employee relations, benefits.',
    '### Overview

Policy drafting, onboarding flows, and routine employee inquiries are strongly AI-augmented. Employee relations judgment, sensitive investigations, and culture work remain human.',
    58,
    true
  ),
  (
    'product-manager',
    'Product Manager',
    'Technology',
    'Product',
    'Sets product direction by aligning user needs, business goals, and engineering capacity.',
    '### Overview

PRDs, user research synthesis, and roadmap communication are significantly AI-augmented. Prioritization judgment under uncertainty, stakeholder alignment, and product intuition remain human.',
    58,
    true
  ),
  (
    'customer-success-manager',
    'Customer Success Manager',
    'Technology',
    'Post-Sales',
    'Drives customer retention, expansion, and product adoption post-sale.',
    '### Overview

Account health monitoring, QBR prep, and email communication are strongly augmented. Customer relationships, empathy-led conversations, and nuanced escalations remain human.',
    56,
    true
  ),
  (
    'project-manager',
    'Project Manager',
    'Operations',
    'Delivery',
    'Plans, coordinates, and drives projects to on-time, on-scope completion.',
    '### Overview

Status reporting, risk tracking, and meeting documentation are heavily augmented. Stakeholder politics, unblocking judgment, and team motivation remain human.',
    56,
    true
  ),
  (
    'ux-researcher',
    'UX Researcher',
    'Technology',
    'Research',
    'Studies user behavior and needs to inform product and design decisions.',
    '### Overview

Interview transcription, theme synthesis, and study summaries are strongly augmented. Research design, interview facilitation, and stakeholder influence remain human.',
    50,
    true
  ),
  (
    'architect',
    'Architect',
    'Architecture',
    'Design',
    'Designs buildings and spaces for functional, structural, and aesthetic use.',
    '### Overview

Drafting, renderings, and code research are increasingly AI-augmented. Site visits, client relationships, permitting negotiations, and creative vision remain human. Licensed work with structural liability is structurally less exposed.',
    42,
    true
  ),
  (
    'teacher',
    'Teacher',
    'Education',
    'K-12',
    'Instructs students, designs curriculum, and supports learning in school settings.',
    '### Overview

Lesson planning, worksheets, and grading assistance are augmented. Classroom management, student mentorship, and in-person pedagogy remain deeply human.',
    36,
    true
  ),
  (
    'therapist',
    'Therapist / Counselor',
    'Healthcare',
    'Mental Health',
    'Provides talk therapy and counseling to support mental health and wellbeing.',
    '### Overview

Notes, session summaries, and administrative work are augmented. The core therapeutic relationship, empathy, and clinical judgment remain deeply human and heavily regulated.',
    26,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  sector = excluded.sector,
  category = excluded.category,
  summary = excluded.summary,
  body_md = excluded.body_md,
  baseline_score = excluded.baseline_score,
  published = excluded.published;


-- ─── Profession ↔ Capability mappings ──────────────────────────────
-- Weights represent importance (0–100) of the capability to the profession.
-- Exposure scores (0–100) represent how much AI can automate/augment that
-- capability for this profession. Narratives give one-line editorial context.

-- Helper: delete any existing mappings for these 5 professions, so we can
-- re-run seed cleanly.
delete from public.profession_capabilities
where profession_id in (
  select id from public.professions where slug in
    ('software-engineer','financial-analyst','marketer','lawyer','designer')
);

-- Software Engineer
insert into public.profession_capabilities (profession_id, capability_id, weight, exposure_score, narrative_md)
select p.id, c.id, v.weight, v.exposure, v.narrative
from (values
  ('software-engineer', 'technical-execution',      95, 88, 'Code generation tools (Cursor, Claude Code) now write substantial portions of production code with developer review.'),
  ('software-engineer', 'research-synthesis',       55, 78, 'Understanding unfamiliar codebases, APIs, and libraries is increasingly AI-assisted.'),
  ('software-engineer', 'writing-communication',    45, 80, 'Documentation, code comments, and commit messages are well-handled by LLMs.'),
  ('software-engineer', 'data-analysis',            55, 72, 'Debugging, log analysis, and performance investigation are significantly augmented.'),
  ('software-engineer', 'strategic-decision',       45, 42, 'Architectural tradeoffs and system design remain grounded in human judgment about constraints AI cannot observe.'),
  ('software-engineer', 'stakeholder-coordination', 50, 28, 'Translating ambiguous product requirements into technical plans requires human collaboration.')
) as v(profession_slug, capability_slug, weight, exposure, narrative)
join public.professions p on p.slug = v.profession_slug
join public.capabilities c on c.slug = v.capability_slug;

-- Financial Analyst
insert into public.profession_capabilities (profession_id, capability_id, weight, exposure_score, narrative_md)
select p.id, c.id, v.weight, v.exposure, v.narrative
from (values
  ('financial-analyst', 'quantitative-modeling',    90, 88, 'DCF, LBO, and financial-statement models can be scaffolded by AI from natural-language descriptions and public filings.'),
  ('financial-analyst', 'data-analysis',            85, 86, 'Trend analysis, variance explanations, and ratio deep-dives are heavily augmented.'),
  ('financial-analyst', 'writing-communication',    75, 85, 'Investment memos, management discussions, and research reports are extensively AI-drafted.'),
  ('financial-analyst', 'research-synthesis',       70, 84, 'SEC filings, earnings calls, and analyst reports are now searchable and summarizable at scale.'),
  ('financial-analyst', 'strategic-decision',       55, 55, 'Actual investment recommendations still rest on human judgment about market context and counterparty motivation.'),
  ('financial-analyst', 'stakeholder-coordination', 45, 35, 'Client-facing work and counterparty negotiation remain predominantly human.')
) as v(profession_slug, capability_slug, weight, exposure, narrative)
join public.professions p on p.slug = v.profession_slug
join public.capabilities c on c.slug = v.capability_slug;

-- Marketer
insert into public.profession_capabilities (profession_id, capability_id, weight, exposure_score, narrative_md)
select p.id, c.id, v.weight, v.exposure, v.narrative
from (values
  ('marketer',          'writing-communication',    90, 88, 'Copywriting, social posts, email sequences, and ad copy are heavily AI-drafted across the industry.'),
  ('marketer',          'creative-ideation',        75, 72, 'Campaign concepts, taglines, and first-pass creative are increasingly AI-assisted.'),
  ('marketer',          'data-analysis',            65, 78, 'Performance analysis, segmentation, and attribution explanations are augmented.'),
  ('marketer',          'research-synthesis',       60, 82, 'Customer interviews, competitor analysis, and market scans are highly summarizable.'),
  ('marketer',          'strategic-decision',       60, 48, 'Positioning, pricing, and brand strategy rest on contextual judgment AI cannot fully supply.'),
  ('marketer',          'visual-design',            55, 70, 'First-pass design, image generation, and creative iteration are significantly augmented.'),
  ('marketer',          'stakeholder-coordination', 45, 30, 'Cross-functional alignment with sales, product, and leadership remains human.')
) as v(profession_slug, capability_slug, weight, exposure, narrative)
join public.professions p on p.slug = v.profession_slug
join public.capabilities c on c.slug = v.capability_slug;

-- Lawyer
insert into public.profession_capabilities (profession_id, capability_id, weight, exposure_score, narrative_md)
select p.id, c.id, v.weight, v.exposure, v.narrative
from (values
  ('lawyer',            'legal-regulatory',         95, 68, 'Legal research, statute/case lookup, and regulatory analysis are strongly AI-assisted via Harvey and general LLMs.'),
  ('lawyer',            'writing-communication',    85, 75, 'Contract drafting, brief preparation, and discovery production are increasingly AI-augmented.'),
  ('lawyer',            'research-synthesis',       80, 80, 'Document review and case law synthesis — historically associate-heavy — are deeply augmented.'),
  ('lawyer',            'strategic-decision',       70, 38, 'Case strategy and client counsel rest on judgment, context, and risk appetite AI cannot supply.'),
  ('lawyer',            'persuasion-negotiation',   65, 32, 'Oral advocacy, negotiation dynamics, and reading counterparties remain substantially human.'),
  ('lawyer',            'stakeholder-coordination', 55, 25, 'Client relationships and internal firm politics remain human-driven.')
) as v(profession_slug, capability_slug, weight, exposure, narrative)
join public.professions p on p.slug = v.profession_slug
join public.capabilities c on c.slug = v.capability_slug;

-- Designer
insert into public.profession_capabilities (profession_id, capability_id, weight, exposure_score, narrative_md)
select p.id, c.id, v.weight, v.exposure, v.narrative
from (values
  ('designer',          'visual-design',            90, 72, 'UI generation (Figma Make) and image models (Midjourney) are producing useful first-pass outputs at scale.'),
  ('designer',          'creative-ideation',        80, 68, 'Concept exploration, mood boarding, and iteration are augmented, though taste remains human.'),
  ('designer',          'writing-communication',    55, 80, 'UX copy, documentation, and case studies are well-handled by LLMs.'),
  ('designer',          'research-synthesis',       60, 70, 'Competitor teardowns and pattern libraries are increasingly AI-searchable.'),
  ('designer',          'strategic-decision',       55, 40, 'Product direction decisions and user-needs judgment remain deeply human.'),
  ('designer',          'stakeholder-coordination', 55, 28, 'Cross-functional alignment with product and engineering is human-centered work.')
) as v(profession_slug, capability_slug, weight, exposure, narrative)
join public.professions p on p.slug = v.profession_slug
join public.capabilities c on c.slug = v.capability_slug;
