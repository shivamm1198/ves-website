import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { defaultContent, sampleEvents, sampleGallery } from "@/data/site";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured, mediaUrl } from "@/lib/supabase/env";
import { formatEventDate } from "./derive";
import {
  contentKeys,
  contentSchemas,
  type ContentKey,
  type EventItem,
  type GalleryItem,
  type SiteContent,
} from "./schema";

/** Cache tags invalidated by the dashboards after every save. */
export const TAGS = { content: "content", events: "events", gallery: "gallery" } as const;

export type ContentRow = { key: string; data: unknown; updated_at?: string };

/** Validates each stored section, falling back to the default for anything missing or invalid. */
export function mergeContent(rows: ContentRow[]): SiteContent {
  const byKey = new Map(rows.map((r) => [r.key, r.data]));
  const out = {} as Record<ContentKey, unknown>;
  for (const key of contentKeys) {
    const stored = byKey.get(key);
    const parsed = stored === undefined ? null : contentSchemas[key].safeParse(stored);
    if (parsed && !parsed.success) {
      console.warn(`[content] "${key}" in the database is invalid; using the default.`);
    }
    out[key] = parsed?.success ? parsed.data : defaultContent[key];
  }
  return out as SiteContent;
}

export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(TAGS.content);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return defaultContent;
  const { data, error } = await createPublicClient().from("site_content").select("key, data");
  if (error) {
    console.error("[content] Could not load site content:", error.message);
    return defaultContent;
  }
  return mergeContent(data ?? []);
}

export type EventRow = {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  image_url: string;
  published: boolean;
};

export function toEventItem(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    dateLabel: formatEventDate(row.start_date, row.end_date),
    description: row.description,
    image: mediaUrl(row.image_url),
    published: row.published,
  };
}

/** Published events, newest first. */
export async function getEvents(): Promise<EventItem[]> {
  "use cache";
  cacheTag(TAGS.events);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return sampleEvents;
  const { data, error } = await createPublicClient()
    .from("events")
    .select("id, title, location, start_date, end_date, description, image_url, published")
    .eq("published", true)
    .order("start_date", { ascending: false });
  if (error) {
    console.error("[events] Could not load events:", error.message);
    return [];
  }
  return (data as EventRow[]).map(toEventItem);
}

export type GalleryRow = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  width: number;
  height: number;
};

export function toGalleryItem(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    src: mediaUrl(row.image_url),
    title: row.title,
    category: row.category,
    w: row.width,
    h: row.height,
  };
}

/** Gallery photos, newest first. */
export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  cacheTag(TAGS.gallery);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return sampleGallery;
  const { data, error } = await createPublicClient()
    .from("gallery_items")
    .select("id, title, category, image_url, width, height")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[gallery] Could not load gallery:", error.message);
    return [];
  }
  return (data as GalleryRow[]).map(toGalleryItem);
}
