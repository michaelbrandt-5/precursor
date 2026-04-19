import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfessionBySlug } from "@/lib/data/professions";
import {
  ScoreNumber,
  ScoreBar,
  ScoreBandLabel,
  ScoreBadge,
} from "@/components/score/ScoreNumber";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProfessionBySlug(slug);
  if (!detail) return { title: "Not found" };
  return {
    title: detail.profession.title,
    description: detail.profession.summary ?? undefined,
  };
}

export default async function ProfessionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const detail = await getProfessionBySlug(slug);
  if (!detail) notFound();

  const { profession, capabilities } = detail;

  return (
    <article className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 py-12">
      <Link
        href="/index"
        className="inline-flex items-center gap-1 text-[13px] text-mid-gray hover:text-cobalt transition-colors"
      >
        ← The AI Exposure Index
      </Link>

      {/* Header */}
      <header className="mt-8 grid md:grid-cols-[1fr_auto] gap-10 items-start">
        <div>
          <p className="eyebrow mb-3">
            {profession.sector}
            {profession.category && ` · ${profession.category}`}
          </p>
          <h1 className="font-display text-[48px] md:text-[64px] leading-[1.05] text-ink">
            {profession.title}
          </h1>
          {profession.summary && (
            <p className="mt-5 text-[18px] text-dark-gray leading-[1.55] max-w-[640px]">
              {profession.summary}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <p className="eyebrow">AI Exposure Score™</p>
          <ScoreNumber
            value={profession.baseline_score}
            size="xl"
            showDenominator
          />
          <ScoreBandLabel value={profession.baseline_score} />
        </div>
      </header>

      {/* Narrative */}
      {profession.body_md && (
        <section className="mt-16 max-w-[var(--container-content)]">
          <ProseMarkdown source={profession.body_md} />
        </section>
      )}

      {/* Capability breakdown */}
      <section className="mt-20">
        <p className="eyebrow mb-3">Capability breakdown</p>
        <h2 className="font-display text-[32px] leading-[1.15] text-ink">
          How AI intersects with this role
        </h2>
        <p className="mt-4 text-[15px] text-dark-gray max-w-[600px] leading-[1.65]">
          The exposure score for each capability is weighted by how central that
          capability is to the profession. Higher bars mean more of that work is
          already being done — or could be done — by AI.
        </p>

        <ul className="mt-10 space-y-8">
          {capabilities.map((row) => (
            <li
              key={row.capability_id}
              className="border-b border-hairline pb-8 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-sans font-medium text-[18px] text-ink">
                      {row.capability.name}
                    </h3>
                    <ScoreBadge value={row.exposure_score} />
                    <span className="text-[12px] text-mid-gray">
                      weight {row.weight}
                    </span>
                  </div>
                  {row.capability.description && (
                    <p className="mt-2 text-[13px] text-mid-gray">
                      {row.capability.description}
                    </p>
                  )}
                  {row.narrative_md && (
                    <p className="mt-4 text-[15px] text-dark-gray leading-[1.6] max-w-[680px]">
                      {row.narrative_md}
                    </p>
                  )}
                </div>
              </div>
              <ScoreBar value={row.exposure_score} className="mt-4" />
            </li>
          ))}
        </ul>
      </section>

      {/* Methodology link */}
      <section className="mt-20 pt-10 border-t border-hairline">
        <p className="text-[13px] text-mid-gray">
          Scores update weekly.{" "}
          <Link
            href="/methodology"
            className="text-cobalt hover:text-cobalt-mid"
          >
            Read the methodology →
          </Link>
        </p>
      </section>
    </article>
  );
}

// Minimal markdown-ish renderer: splits on ### headings and paragraphs.
// Keeps zero dependencies; swap for a real MD renderer (react-markdown) later.
function ProseMarkdown({ source }: { source: string }) {
  const blocks = source.split(/\n\s*\n/);
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="font-display text-[24px] leading-[1.2] text-ink mt-6"
            >
              {trimmed.replace(/^###\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-display text-[32px] leading-[1.15] text-ink mt-8"
            >
              {trimmed.replace(/^##\s+/, "")}
            </h2>
          );
        }
        return (
          <p
            key={i}
            className="text-[17px] text-dark-gray leading-[1.65]"
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
