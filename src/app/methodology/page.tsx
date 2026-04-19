import type { Metadata } from "next";
import { PublicNav } from "@/components/layout/Nav";
import { PublicFooter } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the AI Exposure Score™ is calculated — capability modeling, AI capability tracking, and capability mapping.",
};

export default function MethodologyPage() {
  return (
    <>
      <PublicNav />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-[var(--container-content)] px-6 md:px-10 py-20">
          <p className="eyebrow eyebrow-cobalt mb-4">Methodology</p>
          <h1 className="font-display text-[48px] leading-[1.1] text-ink">
            How we calculate the AI Exposure Score™
          </h1>
          <p className="mt-6 text-[18px] leading-[1.6] text-dark-gray">
            The AI Exposure Score is a 0–100 metric quantifying how much of a
            profession&apos;s core work can be automated or significantly
            augmented by artificial intelligence. Every score is produced
            through a three-stage research process.
          </p>

          <section className="mt-16">
            <p className="eyebrow mb-3">Stage 1</p>
            <h2 className="font-display text-[28px] text-ink">
              Capability modeling
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-dark-gray">
              Each profession is broken into a structured capability model — the
              core skills and tasks that define the role. We begin from the
              O*NET occupational taxonomy maintained by the U.S. Department of
              Labor and refine it with editorial review.
            </p>
          </section>

          <section className="mt-14">
            <p className="eyebrow mb-3">Stage 2</p>
            <h2 className="font-display text-[28px] text-ink">
              AI capability tracking
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-dark-gray">
              We maintain a curated library of emerging AI tools, models, and
              platforms, each tagged with the capabilities they can perform. The
              library updates continuously as new systems launch.
            </p>
          </section>

          <section className="mt-14">
            <p className="eyebrow mb-3">Stage 3</p>
            <h2 className="font-display text-[28px] text-ink">
              Capability mapping
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-dark-gray">
              AI capabilities are mapped against professional capabilities. The
              weighted result — reflecting importance, exposure, and evidence
              strength — produces the AI Exposure Score for the profession. Each
              mapping cites the specific tools and models that drive it.
            </p>
          </section>

          <p className="mt-16 text-[14px] text-mid-gray">
            Scores update weekly. Major recalibrations occur when significant
            new AI capabilities emerge.
          </p>
        </article>
      </main>
      <PublicFooter />
    </>
  );
}
