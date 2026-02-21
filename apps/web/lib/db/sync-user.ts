import { prisma } from "@contentforge/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export async function syncUserToDatabase(supabaseUser: SupabaseUser) {
  return prisma.user.upsert({
    where: { email: supabaseUser.email! },
    update: {
      name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name,
    },
    create: {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name,
    },
  });
}
