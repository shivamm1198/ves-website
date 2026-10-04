"use server";

import { updateTag } from "next/cache";

import { authorizeAction, type ActionResult } from "@/lib/content/admin";
import { TAGS } from "@/lib/content/queries";
import { eventInputSchema } from "@/lib/content/schema";
import { describeIssues } from "./errors";
import { removeMedia } from "./storage";

/** Creates an event, or updates it when `id` is given. */
export async function saveEvent(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };
  const row = { ...parsed.data, end_date: parsed.data.end_date || null };
  const { supabase } = auth.session;

  if (id) {
    const { data: existing, error: readError } = await supabase
      .from("events")
      .select("image_url")
      .eq("id", id)
      .single();
    if (readError) return { ok: false, error: "That event no longer exists." };

    const { error } = await supabase.from("events").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (existing.image_url !== row.image_url) await removeMedia(supabase, [existing.image_url]);

    updateTag(TAGS.events);
    return { ok: true, data: { id } };
  }

  const { data, error } = await supabase.from("events").insert(row).select("id").single();
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.events);
  return { ok: true, data: { id: data.id } };
}

export async function setEventPublished(id: string, published: boolean): Promise<ActionResult> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const { error } = await auth.session.supabase.from("events").update({ published }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.events);
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;
  const { supabase } = auth.session;

  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("image_url")
    .single();
  if (error) return { ok: false, error: error.message };
  await removeMedia(supabase, [data.image_url]);

  updateTag(TAGS.events);
  return { ok: true };
}
