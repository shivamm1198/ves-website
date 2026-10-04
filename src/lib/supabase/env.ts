export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until the two Supabase env vars are set; the site then runs on default content. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Public storage bucket that holds every uploaded image. */
export const MEDIA_BUCKET = "media";

/**
 * Turns a stored image reference into a URL. Values are either a path inside
 * the media bucket ("gallery/abc.jpg"), a site path ("/images/…") or a full URL.
 */
export function mediaUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("/") || /^https?:\/\//.test(path)) return path;
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/** True when the reference points at a file we uploaded to the media bucket. */
export function isStoragePath(path: string | null | undefined): path is string {
  return Boolean(path) && !path!.startsWith("/") && !/^https?:\/\//.test(path!);
}
