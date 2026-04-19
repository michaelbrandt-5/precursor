import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-hairline">
      <div className="mx-auto h-full max-w-[var(--container-app)] px-6 md:px-10 flex items-center justify-between">
        <Logo variant="cobalt" size="md" />
        <nav className="flex items-center gap-6">
          <a
            href="/methodology"
            className="hidden sm:inline-block text-[14px] text-dark-gray hover:text-cobalt transition-colors"
          >
            Methodology
          </a>
          <Button href="/sign-in" variant="primary" size="md">
            Sign in
          </Button>
        </nav>
      </div>
    </header>
  );
}
