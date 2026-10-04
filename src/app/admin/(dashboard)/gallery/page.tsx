import type { Metadata } from "next";

import { getAdminSession } from "@/lib/content/admin";
import { toGalleryItem, type GalleryRow } from "@/lib/content/queries";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, title, category, image_url, width, height")
    .order("created_at", { ascending: false });

  return (
    <GalleryManager
      items={((data ?? []) as GalleryRow[]).map(toGalleryItem)}
      loadError={error?.message}
    />
  );
}
