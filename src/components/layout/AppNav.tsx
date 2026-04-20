import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/lib/actions/auth";

export function AppNav({ user }: { user: User }) {
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Account";

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-hairline">
      <div className="mx-auto h-full max-w-[var(--container-app)] px-6 md:px-10 flex items-center gap-10">
        <Logo variant="cobalt" size="md" />

        <nav className="flex-1 flex items-center gap-6 text-[14px]">
          <Link
            href="/dashboard"
            className="text-dark-gray hover:text-cobalt transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/index"
            className="text-dark-gray hover:text-cobalt transition-colors"
          >
            Index
          </Link>
          <Link
            href="/settings"
            className="text-dark-gray hover:text-cobalt transition-colors"
          >
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          <span
            className="hidden sm:inline-block text-[13px] text-dark-gray"
            title={user.email ?? undefined}
          >
            {displayName}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-[14px] text-dark-gray hover:text-cobalt transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
