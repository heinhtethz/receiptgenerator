"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/drizzle";
import { invoices } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function deleteMyAccount() {
  const cookieStore = await cookies();

  // 1. Authenticate the user making the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const { data, error: authError } = await supabase.auth.getUser();
  const user = data?.user;

  if (authError || !user) {
    throw new Error("You must be logged in to delete your account.");
  }

  try {
    await db.delete(invoices).where(eq(invoices.userId, user.id));
  } catch (dbError) {
    console.error("Error deleting user data from database:", dbError);
    throw new Error("Failed to delete user data. Aborting account deletion.");
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    console.error("Error deleting user:", deleteError);
    throw new Error("Failed to delete account. Please try again.");
  }

  return { success: true };
}
