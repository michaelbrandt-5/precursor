import type { Metadata } from "next";
import { PublicNav } from "@/components/layout/Nav";
import { PublicFooter } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <>
      <PublicNav />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-[var(--container-content)] px-6 md:px-10 py-20">
          <p className="eyebrow mb-4">Placeholder</p>
          <h1 className="font-display text-[40px] leading-[1.1] text-ink">
            Terms of Service
          </h1>
          <p className="mt-6 text-[16px] leading-[1.65] text-dark-gray">
            This page is a placeholder. Full Terms of Service will be published
            before launch.
          </p>
        </article>
      </main>
      <PublicFooter />
    </>
  );
}
