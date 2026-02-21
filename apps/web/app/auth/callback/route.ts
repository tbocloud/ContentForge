import { createClient } from "@/lib/supabase/server";
import { syncUserToDatabase } from "@/lib/db/sync-user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        await syncUserToDatabase(data.user);
      } catch (e) {
        console.error("[auth/callback] Failed to sync user to DB:", e);
        // Don't block login if DB sync fails
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
