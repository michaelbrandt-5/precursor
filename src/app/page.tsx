import Link from "next/link";
import { PublicNav } from "@/components/layout/Nav";
import { PublicFooter } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  PREVIEW_PROFESSIONS,
  bandColor,
  bandLabel,
} from "@/lib/previewData";

export default function Home() {
  return (
    <>
      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-parchment">
          <div className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
            <p className="eyebrow eyebrow-cobalt mb-6">
              Precursor · AI Exposure Index™
            </p>
            <h1 className="font-display text-[44px] sm:text-[56px] md:text-[72px] leading-[1.05] tracking-tight text-ink max-w-[900px]">
              How exposed is your
              <br />
              profession to AI?
            </h1>
            <p className="mt-8 max-w-[600px] text-[18px] leading-[1.6] text-dark-gray">
              Precursor scores every occupation 0–100 based on structured
              capability analysis — the share of a profession&apos;s work that
              can be automated or significantly augmented by artificial
              intelligence.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button href="/sign-in" variant="primary" size="md">
                Find your score
              </Button>
              <Button href="/methodology" variant="ghost" size="md">
                How it works
              </Button>
            </div>
          </div>
        </section>

        {/* Locked preview */}
        <section className="bg-white border-t border-hairline">
          <div className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 py-20 md:py-24">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <p className="eyebrow mb-3">Preview · launching soon</p>
                <h2 className="font-display text-[32px] md:text-[40px] leading-[1.15] text-ink max-w-[640px]">
                  A preview of the AI Exposure Index
                </h2>
                <p className="mt-4 text-[16px] text-dark-gray max-w-[520px]">
                  Sign in to see full scores, capability breakdowns, and
                  citations for every profession.
                </p>
              </div>
              <Link
                href="/sign-in"
                className="text-[14px] font-medium text-cobalt hover:text-cobalt-mid"
              >
                Unlock the full index →
              </Link>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PREVIEW_PROFESSIONS.map((p) => (
                <li
                  key={p.slug}
                  className="bg-white border border-hairline rounded-[var(--radius-brand-sm)] border-l-4 p-6 relative overflow-hidden"
                  style={{ borderLeftColor: bandColor(p.band) }}
                >
                  <p className="eyebrow text-[11px] text-mid-gray mb-3">
                    {p.sector}
                  </p>
                  <h3 className="font-sans font-medium text-[20px] text-ink">
                    {p.title}
                  </h3>

                  {/* Locked score */}
                  <div className="mt-6 flex items-baseline gap-2 select-none">
                    <span
                      className="font-mono font-medium text-[64px] leading-none blur-md"
                      aria-hidden="true"
                      style={{ color: bandColor(p.band) }}
                    >
                      ••
                    </span>
                    <span className="font-sans font-light text-[16px] text-light-gray">
                      /100
                    </span>
                  </div>

                  <p className="mt-3 text-[13px] text-mid-gray">
                    {bandLabel(p.band)}
                  </p>

                  <div className="mt-5 h-1 w-full bg-hairline rounded-[2px] overflow-hidden">
                    <div
                      className="h-full w-[60%] blur-sm"
                      style={{ background: bandColor(p.band) }}
                    />
                  </div>

                  <Link
                    href="/sign-in"
                    className="absolute inset-0"
                    aria-label={`Sign in to see ${p.title} score`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Methodology teaser */}
        <section className="bg-parchment border-t border-hairline">
          <div className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 py-20 md:py-24 grid md:grid-cols-2 gap-12">
            <div>
              <p className="eyebrow mb-3">Methodology</p>
              <h2 className="font-display text-[32px] md:text-[40px] leading-[1.15] text-ink">
                Grounded in structure,
                <br />
                not speculation.
              </h2>
            </div>
            <div className="text-[16px] text-dark-gray leading-[1.65] space-y-4">
              <p>
                Each profession is broken into a structured capability model —
                the core skills and tasks that define the role.
              </p>
              <p>
                We track emerging AI tools continuously, mapping their
                capabilities against each profession&apos;s skill set to
                produce the AI Exposure Score™.
              </p>
              <p>
                <Link
                  href="/methodology"
                  className="text-cobalt font-medium hover:text-cobalt-mid"
                >
                  Read the full methodology →
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
