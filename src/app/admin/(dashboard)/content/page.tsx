import type { Metadata } from "next";

import { getAdminSession } from "@/lib/content/admin";
import { mergeContent, type ContentRow } from "@/lib/content/queries";
import type { ContentKey } from "@/lib/content/schema";
import { ContentEditor } from "@/components/admin/content/content-editor";

export const metadata: Metadata = { title: "Homepage editor" };

export default async function AdminContentPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.from("site_content").select("key, data, updated_at");

  const rows = (data ?? []) as ContentRow[];
  const updatedAt = Object.fromEntries(rows.map((r) => [r.key, r.updated_at])) as Partial<
    Record<ContentKey, string>
  >;

  return (
    <ContentEditor initial={mergeContent(rows)} updatedAt={updatedAt} loadError={error?.message} />
  );
}
