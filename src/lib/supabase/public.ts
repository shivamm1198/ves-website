import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseKey, supabaseUrl } from "./env";

/**
 * Anonymous, cookie-free client for reading public content. Safe to use inside
 * cached functions because it never touches request data.
 */
export function createPublicClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
