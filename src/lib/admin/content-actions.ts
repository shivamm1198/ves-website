"use server";

import { updateTag } from "next/cache";

import { authorizeAction, type ActionResult } from "@/lib/content/admin";
import { TAGS } from "@/lib/content/queries";
import { contentSchemas, type ContentKey } from "@/lib/content/schema";
import { describeIssues } from "./errors";

/** Validates and stores one homepage section. */
export async function saveContentSection(
  key: ContentKey,
  data: unknown,
): Promise<ActionResult<{ updatedAt: string }>> {
  if (!(key in contentSchemas)) return { ok: false, error: "Unknown section." };
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const parsed = contentSchemas[key].safeParse(data);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };

  const { supabase, user } = auth.session;
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("site_content").upsert({
    key,
    data: parsed.data,
    updated_at: updatedAt,
    updated_by: user!.id,
  });
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.content);
  return { ok: true, data: { updatedAt } };
}

/** Deletes a section's saved row so the site falls back to the built-in default. */
export async function resetContentSection(key: ContentKey): Promise<ActionResult> {
  if (!(key in contentSchemas)) return { ok: false, error: "Unknown section." };
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const { error } = await auth.session.supabase.from("site_content").delete().eq("key", key);
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.content);
  return { ok: true };
}
