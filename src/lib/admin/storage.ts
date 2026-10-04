import "server-only";

import type { AdminSession } from "@/lib/content/admin";
import { MEDIA_BUCKET, isStoragePath } from "@/lib/supabase/env";

/** Best-effort removal of uploaded files; a failure here never blocks the main action. */
export async function removeMedia(supabase: AdminSession["supabase"], paths: (string | null)[]) {
  const files = paths.filter(isStoragePath);
  if (files.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(files);
  if (error) console.warn("[media] Could not remove", files, error.message);
}
