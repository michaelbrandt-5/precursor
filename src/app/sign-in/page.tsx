import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { signInWithGoogle } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

type SearchParams = Promise<{ error?: string; next?: string }>;

function errorMessage(code?: string): string | null {
  if (!code) return null;
  if (code === "auth_callback_failed") return "Sign-in was interrupted. Please try again.";
  if (code === "oauth_failed") return "Couldn't reach Google. Please try again.";
  return code;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = errorMessage(params.error);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-parchment">
      <div className="w-full max-w-[420px] bg-white border border-hairline rounded-[var(--radius-brand-sm)] p-10">
        <div className="flex justify-center mb-8">
          <Logo variant="cobalt" size="md" href="/" />
        </div>

        <h1 className="font-display text-[28px] leading-[1.2] text-ink text-center">
          Sign in to Precursor
        </h1>
        <p className="mt-3 text-[14px] text-dark-gray text-center">
          Access your AI Exposure Score and the full index.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 text-[13px] text-score-high bg-score-high-bg px-3 py-2 rounded-[2px] text-center"
          >
            {error}
          </p>
        )}

        <form action={signInWithGoogle} className="mt-8">
          {params.next && <input type="hidden" name="next" value={params.next} />}
          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center gap-3 bg-white text-ink border border-hairline rounded-[var(--radius-brand-sm)] text-[14px] font-medium hover:border-light-gray transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        <p className="mt-10 text-[12px] text-mid-gray text-center leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-cobalt hover:text-cobalt-mid">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-cobalt hover:text-cobalt-mid">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 text-[13px] text-mid-gray hover:text-cobalt transition-colors"
      >
        ← Back to homepage
      </Link>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
