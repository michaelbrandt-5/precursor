import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/layout/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense-in-depth: middleware also gates these routes, but this layout
  // refuses to render anything without a session.
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <AppNav user={user} />
      <main className="flex-1">{children}</main>
    </>
  );
}
