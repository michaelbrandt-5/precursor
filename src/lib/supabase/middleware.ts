import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const GATED_PREFIXES = [
  "/dashboard",
  "/index",
  "/profession",
  "/compare",
  "/settings",
  "/admin",
  "/onboarding",
];

const AUTH_ONLY_PATHS = ["/sign-in"];

// Paths that authed users can hit before they've completed onboarding.
// Everything else in (app) redirects to /onboarding.
const PRE_ONBOARDING_ALLOWED = [
  "/onboarding",
  "/auth/callback",
  "/settings", // let users sign out / manage account even mid-onboarding
];

function isGated(pathname: string): boolean {
  return GATED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_PATHS.includes(pathname);
}

function isPreOnboardingOK(pathname: string): boolean {
  return PRE_ONBOARDING_ALLOWED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not place any code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isGated(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnly(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Onboarding gate — authed users who haven't completed onboarding get sent
  // to /onboarding when accessing the rest of the app.
  if (user && isGated(pathname) && !isPreOnboardingOK(pathname)) {
    const { data: userRow } = await supabase
      .from("users")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!userRow?.onboarded_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
