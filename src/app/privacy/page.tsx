import type { Metadata } from "next";
import { PublicNav } from "@/components/layout/Nav";
import { PublicFooter } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <PublicNav />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-[var(--container-content)] px-6 md:px-10 py-20">
          <p className="eyebrow mb-4">Placeholder</p>
          <h1 className="font-display text-[40px] leading-[1.1] text-ink">
            Privacy Policy
          </h1>
          <p className="mt-6 text-[16px] leading-[1.65] text-dark-gray">
            This page is a placeholder. A full privacy policy will be published
            before launch, covering what data we collect, how it is used, how it
            is stored, and the controls you have over it.
          </p>
          <p className="mt-4 text-[16px] leading-[1.65] text-dark-gray">
            For questions, contact{" "}
            <a
              href="mailto:privacy@precursorindex.com"
              className="text-cobalt hover:text-cobalt-mid"
            >
              privacy@precursorindex.com
            </a>
            .
          </p>
        </article>
      </main>
      <PublicFooter />
    </>
  );
}
