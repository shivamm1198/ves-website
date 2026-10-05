import type { Metadata } from "next";

import { getAdminSession } from "@/lib/content/admin";
import { toArticleItem, type ArticleRow } from "@/lib/content/queries";
import { JournalManager } from "@/components/admin/journal-manager";

export const metadata: Metadata = { title: "Student Journal" };

export default async function AdminJournalPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, slug, title, author_name, author_detail, category, summary, body, cover_url, document_url, document_name, published, published_on",
    )
    .order("published_on", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as ArticleRow[];
  const articles = rows.map((row) => ({
    ...toArticleItem(row),
    coverPath: row.cover_url,
    documentPath: row.document_url,
  }));

  return <JournalManager articles={articles} loadError={error?.message} />;
}
