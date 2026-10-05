"use client";

import { createClient } from "@/lib/supabase/client";
import { DOCUMENTS_BUCKET, MEDIA_BUCKET } from "@/lib/supabase/env";

export const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/gif,image/avif";
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_EDGE = 2400;

export type PreparedImage = { blob: Blob; width: number; height: number; ext: string };

function loadImage(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file couldn't be read as an image."));
    };
    img.src = url;
  });
}

/**
 * Reads an image's size and, when it's large, scales it down and re-encodes it
 * as WebP so phone photos upload quickly and load fast on the site.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!ACCEPTED_IMAGES.split(",").includes(file.type)) {
    throw new Error("Please choose a JPG, PNG, WebP, GIF or AVIF image.");
  }
  if (file.size > MAX_INPUT_BYTES) throw new Error("Images must be smaller than 25 MB.");

  const img = await loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");

  // GIFs would lose their animation, and small images are already fine.
  const longest = Math.max(w, h);
  if (file.type === "image/gif" || (longest <= MAX_EDGE && file.size <= 1.5 * 1024 * 1024)) {
    return { blob: file, width: w, height: h, ext };
  }

  const scale = Math.min(1, MAX_EDGE / longest);
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );
  if (!blob) return { blob: file, width: w, height: h, ext };
  return { blob, width, height, ext: "webp" };
}

/** Uploads to the media bucket under `folder/` and returns the stored path. */
export async function uploadImage(folder: "gallery" | "events" | "content", image: PreparedImage) {
  const path = `${folder}/${crypto.randomUUID()}.${image.ext}`;
  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .upload(path, image.blob, {
      contentType: image.blob.type || `image/${image.ext}`,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

/** Cleans up a file whose database record could not be saved. */
export async function discardUpload(path: string) {
  await createClient().storage.from(MEDIA_BUCKET).remove([path]);
}

/** "IMG_2034-final_v2.jpg" → "Img 2034 final v2" */
export function captionFromFilename(name: string) {
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Untitled";
}

export const ACCEPTED_DOCUMENTS =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/** Uploads a PDF or Word file for a journal article and returns its stored path. */
export async function uploadDocument(file: File) {
  if (!ACCEPTED_DOCUMENTS.split(",").includes(file.type)) {
    throw new Error("Please attach a PDF or Word document (.pdf, .doc, .docx).");
  }
  if (file.size > MAX_DOCUMENT_BYTES) throw new Error("Documents must be smaller than 20 MB.");

  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `articles/${crypto.randomUUID()}.${ext}`;
  const { error } = await createClient()
    .storage.from(DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

export async function discardDocument(path: string) {
  await createClient().storage.from(DOCUMENTS_BUCKET).remove([path]);
}
