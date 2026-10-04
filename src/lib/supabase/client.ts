import { createBrowserClient } from "@supabase/ssr";

import { supabaseKey, supabaseUrl } from "./env";

/** Supabase client for Client Components (used for direct image uploads). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
