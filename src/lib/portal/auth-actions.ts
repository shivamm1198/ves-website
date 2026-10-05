"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PortalAuthState = { error?: string; email?: string; notice?: string };

const credentials = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

/** Only relative portal paths are allowed as a post-login destination. */
function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  return next.startsWith("/portal") && !next.startsWith("//") ? next : "/portal";
}

export async function portalSignIn(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const email = String(form.get("email") ?? "").trim();
  if (!isSupabaseConfigured) return { email, error: "Supabase is not configured yet." };
  const parsed = credentials.safeParse({ email, password: form.get("password") });
  if (!parsed.success) return { email, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      email,
      error:
        error.code === "invalid_credentials"
          ? "Incorrect email or password."
          : `Couldn't sign in: ${error.message}`,
    };
  }
  const { data: access } = await supabase.rpc("has_portal_access");
  if (access !== true) {
    await supabase.auth.signOut();
    return {
      email,
      error:
        "This account isn't part of an internship yet. Open the invite link you were sent first.",
    };
  }
  redirect(safeNext(form.get("next")));
}

export async function portalSignOut() {
  if (isSupabaseConfigured) await (await createClient()).auth.signOut();
  redirect("/portal/login");
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters for your password"),
});

async function redeem(token: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_invite", {
    invite_token: token,
    display_name: name,
  });
  if (error) return { error: error.message };
  return { programId: data as string };
}

/** Join with the account that's already signed in. */
export async function joinAsCurrentUser(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const token = String(form.get("token") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const res = await redeem(token, name);
  if ("error" in res) return { error: res.error };
  redirect(`/portal/programs/${res.programId}`);
}

/** Create an account from an invite link, then join the programme. */
export async function joinWithNewAccount(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const token = String(form.get("token") ?? "");
  const email = String(form.get("email") ?? "").trim();
  const parsed = signupSchema.safeParse({
    name: form.get("name"),
    email,
    password: form.get("password"),
  });
  if (!parsed.success) return { email, error: parsed.error.issues[0].message };

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/portal/join/${token}`)}`,
    },
  });
  if (error) {
    return {
      email,
      error:
        error.code === "user_already_exists"
          ? "This email already has an account — use “I already have an account”."
          : error.code === "signup_disabled"
            ? "New accounts are switched off in Supabase. Ask the administrator to enable sign-ups."
            : error.message,
    };
  }
  // With "Confirm email" switched on, Supabase returns no session until the link is clicked.
  if (!data.session) {
    return {
      email,
      notice:
        "Almost there — we've emailed you a confirmation link. Open it and you'll come straight back here to finish joining.",
    };
  }
  const res = await redeem(token, parsed.data.name);
  if ("error" in res) return { email, error: res.error };
  redirect(`/portal/programs/${res.programId}`);
}

/** Sign in with an existing account from an invite link, then join. */
export async function joinWithExistingAccount(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const token = String(form.get("token") ?? "");
  const email = String(form.get("email") ?? "").trim();
  const parsed = credentials.safeParse({ email, password: form.get("password") });
  if (!parsed.success) return { email, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      email,
      error: error.code === "invalid_credentials" ? "Incorrect email or password." : error.message,
    };
  }
  const res = await redeem(token, String(form.get("name") ?? ""));
  if ("error" in res) return { email, error: res.error };
  redirect(`/portal/programs/${res.programId}`);
}
