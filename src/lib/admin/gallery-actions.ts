"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { authorizeAction, type ActionResult } from "@/lib/content/admin";
import { TAGS } from "@/lib/content/queries";
import { galleryInputSchema } from "@/lib/content/schema";
import { describeIssues } from "./errors";
import { removeMedia } from "./storage";

const batchSchema = z.array(galleryInputSchema).min(1).max(50);

/** Records photos that the browser has already uploaded to storage. */
export async function addGalleryItems(items: unknown): Promise<ActionResult<{ count: number }>> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const parsed = batchSchema.safeParse(items);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };

  const { error } = await auth.session.supabase.from("gallery_items").insert(parsed.data);
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.gallery);
  return { ok: true, data: { count: parsed.data.length } };
}

const detailsSchema = galleryInputSchema.pick({ title: true, category: true });

export async function updateGalleryItem(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };

  const { error } = await auth.session.supabase
    .from("gallery_items")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.gallery);
  return { ok: true };
}

export async function deleteGalleryItems(ids: string[]): Promise<ActionResult<{ count: number }>> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;
  if (!z.array(z.uuid()).min(1).safeParse(ids).success) {
    return { ok: false, error: "Nothing selected." };
  }
  const { supabase } = auth.session;

  const { data, error } = await supabase
    .from("gallery_items")
    .delete()
    .in("id", ids)
    .select("image_url");
  if (error) return { ok: false, error: error.message };
  await removeMedia(
    supabase,
    data.map((d) => d.image_url),
  );

  updateTag(TAGS.gallery);
  return { ok: true, data: { count: data.length } };
}
