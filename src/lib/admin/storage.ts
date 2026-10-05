import "server-only";

import type { AdminSession } from "@/lib/content/admin";
import { DOCUMENTS_BUCKET, MEDIA_BUCKET, isStoragePath } from "@/lib/supabase/env";

/** Best-effort removal of uploaded files; a failure here never blocks the main action. */
export async function removeMedia(supabase: AdminSession["supabase"], paths: (string | null)[]) {
  const files = paths.filter(isStoragePath);
  if (files.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(files);
  if (error) console.warn("[media] Could not remove", files, error.message);
}

/** Best-effort removal of journal documents. */
export async function removeDocuments(
  supabase: AdminSession["supabase"],
  paths: (string | null)[],
) {
  const files = paths.filter(isStoragePath);
  if (files.length === 0) return;
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).remove(files);
  if (error) console.warn("[documents] Could not remove", files, error.message);
}
