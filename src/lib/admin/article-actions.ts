"use server";

import { updateTag } from "next/cache";

import { authorizeAction, type ActionResult } from "@/lib/content/admin";
import { slugify } from "@/lib/content/derive";
import { TAGS } from "@/lib/content/queries";
import { articleInputSchema } from "@/lib/content/schema";
import { describeIssues } from "./errors";
import { removeDocuments, removeMedia } from "./storage";

/** "My Paper: Part 1" → "my-paper-part-1-k3x9" (suffix keeps every link unique). */
function makeSlug(title: string) {
  const base =
    slugify(title)
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "article";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Creates an article, or updates it when `id` is given. Returns its slug. */
export async function saveArticle(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };
  const row = parsed.data;
  const { supabase } = auth.session;

  if (id) {
    const { data: existing, error: readError } = await supabase
      .from("articles")
      .select("slug, cover_url, document_url")
      .eq("id", id)
      .single();
    if (readError) return { ok: false, error: "That article no longer exists." };

    const { error } = await supabase.from("articles").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (existing.cover_url !== row.cover_url) await removeMedia(supabase, [existing.cover_url]);
    if (existing.document_url !== row.document_url) {
      await removeDocuments(supabase, [existing.document_url]);
    }

    updateTag(TAGS.articles);
    return { ok: true, data: { id, slug: existing.slug } };
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({ ...row, slug: makeSlug(row.title) })
    .select("id, slug")
    .single();
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.articles);
  return { ok: true, data: { id: data.id, slug: data.slug } };
}

export async function setArticlePublished(id: string, published: boolean): Promise<ActionResult> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;

  const { error } = await auth.session.supabase.from("articles").update({ published }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  updateTag(TAGS.articles);
  return { ok: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;
  const { supabase } = auth.session;

  const { data, error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id)
    .select("cover_url, document_url")
    .single();
  if (error) return { ok: false, error: error.message };
  await Promise.all([
    removeMedia(supabase, [data.cover_url]),
    removeDocuments(supabase, [data.document_url]),
  ]);

  updateTag(TAGS.articles);
  return { ok: true };
}
