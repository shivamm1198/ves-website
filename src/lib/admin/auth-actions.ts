"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SignInState = { error?: string; email?: string };

const credentials = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!isSupabaseConfigured) return { email, error: "Supabase is not configured yet." };

  const parsed = credentials.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { email, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "invalid_credentials") {
      return { email, error: "Incorrect email or password." };
    }
    if (error.code === "email_not_confirmed") {
      return {
        email,
        error: "This email isn't confirmed yet. Confirm the user in Supabase first.",
      };
    }
    return { email, error: `Couldn't sign in: ${error.message}` };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return {
      email,
      error: "This account doesn't have dashboard access. Ask the site administrator to add it.",
    };
  }

  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
