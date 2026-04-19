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


-- ─── Professions (5 to start) ──────────────────────────────────────

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
