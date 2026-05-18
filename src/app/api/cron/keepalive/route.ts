import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase free tier pauses projects after 7 days without DB activity.
 * This route runs daily via Vercel Cron (see vercel.json) and executes a
 * trivial COUNT against `professions` to keep the project warm. It also
 * doubles as a basic health check — a non-200 response means the DB is
 * unreachable from the deployed app.
 *
 * Auth: Vercel auto-attaches `Authorization: Bearer ${CRON_SECRET}` to
 * cron-triggered requests when CRON_SECRET is set in the Vercel env vars.
 * Manual hits need the same header, e.g.:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        https://precursorindex.com/api/cron/keepalive
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  const { count, error } = await supabase
    .from("professions")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    professionsCount: count,
    timestamp: new Date().toISOString(),
  });
}
