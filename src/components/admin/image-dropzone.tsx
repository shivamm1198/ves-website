"use client";

import * as React from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGES } from "@/lib/admin/upload";

/**
 * Click-or-drop image picker with a preview. It only hands the chosen file
 * back; the caller decides when to upload it.
 */
export function ImageDropzone({
  previewUrl,
  onFile,
  onClear,
  aspect = "aspect-[3/2]",
  multiple = false,
  onFiles,
  label = "Drop an image here, or click to browse",
  hint = "JPG, PNG or WebP · large photos are resized automatically",
  className,
  round = false,
  fit = "cover",
}: {
  previewUrl?: string;
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  onClear?: () => void;
  aspect?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  className?: string;
  round?: boolean;
  fit?: "cover" | "contain";
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handle = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    if (multiple) onFiles?.(files);
    else onFile?.(files[0]);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      {previewUrl ? (
        <div
          className={cn(
            "group relative overflow-hidden border bg-muted",
            round ? "rounded-full" : "rounded-lg",
            aspect,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- previews are blob: or storage URLs */}
          <img
            src={previewUrl}
            alt=""
            className={cn(
              "absolute inset-0 size-full",
              fit === "contain" ? "bg-white object-contain p-3" : "object-cover",
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-ink"
            >
              <RefreshCw className="size-3.5" /> Replace
            </button>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handle(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed px-4 text-center transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
            round ? "rounded-full" : "rounded-lg",
            aspect,
            dragging
              ? "border-gold bg-gold/5"
              : "border-foreground/15 bg-white hover:border-foreground/35",
          )}
        >
          <ImagePlus className="size-7 text-gold" strokeWidth={1.4} />
          {!round && (
            <>
              <span className="text-sm font-medium text-ink">{label}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
