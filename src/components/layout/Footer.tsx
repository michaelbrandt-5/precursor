import { LogoMark } from "@/components/brand/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <LogoMark variant="cobalt" size="sm" />
          <span className="text-[13px] text-mid-gray">
            © {new Date().getFullYear()} Precursor. AI Exposure Index™.
          </span>
        </div>
        <div className="flex items-center gap-6 text-[13px] text-mid-gray">
          <a href="/methodology" className="hover:text-cobalt transition-colors">
            Methodology
          </a>
          <a href="/privacy" className="hover:text-cobalt transition-colors">
            Privacy
          </a>
          <a href="/terms" className="hover:text-cobalt transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
