"use client";

import { createClient } from "@/lib/supabase/client";
import type { Attachment } from "./types";

export const INTERN_FILE_TYPES =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,image/webp";
const MAX_BYTES = 25 * 1024 * 1024;

/** Uploads into the intern's private folder: "<program>/<user>/<uuid>-<name>". */
export async function uploadInternFile(
  programId: string,
  userId: string,
  file: File,
): Promise<Attachment> {
  if (!INTERN_FILE_TYPES.split(",").includes(file.type)) {
    throw new Error("Upload a PDF, Word, PowerPoint or image file.");
  }
  if (file.size > MAX_BYTES) throw new Error("Files must be smaller than 25 MB.");
  const safeName = file.name.replace(/[^\w.\- ]+/g, "").slice(-120) || "file";
  const path = `${programId}/${userId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await createClient()
    .storage.from("internship-files")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return { path, name: file.name, size: file.size };
}

export async function deleteInternFile(path: string) {
  await createClient().storage.from("internship-files").remove([path]);
}
