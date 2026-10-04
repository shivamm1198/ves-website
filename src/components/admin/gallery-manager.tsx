"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Images,
  Loader2,
  Pencil,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { GalleryInput, GalleryItem } from "@/lib/content/schema";
import {
  addGalleryItems,
  deleteGalleryItems,
  updateGalleryItem,
} from "@/lib/admin/gallery-actions";
import { captionFromFilename, discardUpload, prepareImage, uploadImage } from "@/lib/admin/upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { ErrorNote } from "@/components/admin/events-manager";
import { ImageDropzone } from "@/components/admin/image-dropzone";

const DEFAULT_CATEGORIES = ["Events", "Moot Court", "Legal Aid", "Seminars", "Community"];

type Staged = {
  key: string;
  file: File;
  preview: string;
  title: string;
  category: string;
  status: "ready" | "uploading" | "done" | "error";
  error?: string;
};

export function GalleryManager({ items, loadError }: { items: GalleryItem[]; loadError?: string }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState("All");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [editing, setEditing] = React.useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const categories = React.useMemo(
    () => Array.from(new Set([...DEFAULT_CATEGORIES, ...items.map((i) => i.category)])),
    [items],
  );
  const used = Array.from(new Set(items.map((i) => i.category)));
  const visible = items.filter((i) => filter === "All" || i.category === filter);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const remove = async (ids: string[]) => {
    setDeleting(true);
    const res = await deleteGalleryItems(ids);
    setDeleting(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.data.count === 1 ? "Photo deleted" : `${res.data.count} photos deleted`);
    setSelected(new Set());
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Gallery"
        description="Upload photos in bulk, give each a caption and category, and remove ones you no longer need. The newest photos appear first on the website."
      />

      <div className="grid gap-8 p-5 sm:p-8">
        {loadError && <ErrorNote message={loadError} />}

        <Uploader
          categories={categories}
          onUploaded={() => {
            setFilter("All");
            router.refresh();
          }}
        />

        <section aria-labelledby="library-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="library-heading" className="text-3xl font-semibold text-ink">
                Library
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length} photos{selected.size > 0 && ` · ${selected.size} selected`}
              </p>
            </div>
            <AnimatePresence>
              {selected.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="flex gap-2"
                >
                  <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                    Clear selection
                  </Button>
                  <ConfirmAction
                    title={`Delete ${selected.size} ${selected.size === 1 ? "photo" : "photos"}?`}
                    description="They will be removed from the website and from storage. This can't be undone."
                    onConfirm={() => remove(Array.from(selected))}
                  >
                    <Button variant="destructive" size="sm" disabled={deleting}>
                      {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                      Delete selected
                    </Button>
                  </ConfirmAction>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {items.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {["All", ...used].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    filter === c
                      ? "border-ink bg-ink text-white"
                      : "border-foreground/15 bg-white text-foreground/70 hover:border-foreground/40",
                  )}
                >
                  {c}
                  <span
                    className={cn(
                      "ml-1.5 text-xs",
                      filter === c ? "text-gold-light" : "text-muted-foreground",
                    )}
                  >
                    {c === "All" ? items.length : items.filter((i) => i.category === c).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-14 text-center">
              <Images className="size-10 text-gold" strokeWidth={1.3} />
              <p className="mt-3 font-serif text-2xl text-ink">No photos yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the uploader above to add your first photos.
              </p>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border bg-white transition-shadow",
                      isSelected && "ring-2 ring-gold",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="relative block aspect-square w-full bg-muted"
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? "Deselect" : "Select"} ${item.title}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                      <img
                        src={item.src}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover"
                      />
                      <span
                        className={cn(
                          "absolute top-2 left-2 grid size-6 place-items-center rounded-full border-2 transition-all",
                          isSelected
                            ? "border-gold bg-gold text-ink"
                            : "border-white bg-black/20 text-transparent opacity-0 group-hover:opacity-100",
                        )}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    </button>
                    <div className="flex items-start gap-1 p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink" title={item.title}>
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7"
                        onClick={() => setEditing(item)}
                        aria-label={`Edit ${item.title}`}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <ConfirmAction
                        title="Delete this photo?"
                        description={`“${item.title}” will be removed from the website and from storage.`}
                        onConfirm={() => remove([item.id])}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </ConfirmAction>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <EditPhotoDialog
        item={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function Uploader({ categories, onUploaded }: { categories: string[]; onUploaded: () => void }) {
  const [staged, setStaged] = React.useState<Staged[]>([]);
  const [bulkCategory, setBulkCategory] = React.useState(categories[0]);
  const [uploading, setUploading] = React.useState(false);
  const stagedRef = React.useRef(staged);
  React.useEffect(() => {
    stagedRef.current = staged;
  });

  // Release preview URLs when the uploader unmounts.
  React.useEffect(() => () => stagedRef.current.forEach((s) => URL.revokeObjectURL(s.preview)), []);

  const add = (files: File[]) =>
    setStaged((s) => [
      ...s,
      ...files.slice(0, 50 - s.length).map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        title: captionFromFilename(file.name),
        category: bulkCategory,
        status: "ready" as const,
      })),
    ]);

  const update = (key: string, patch: Partial<Staged>) =>
    setStaged((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  const drop = (key: string) =>
    setStaged((s) => {
      const item = s.find((x) => x.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return s.filter((x) => x.key !== key);
    });

  const uploadAll = async () => {
    const queue = staged.filter((s) => s.status !== "done");
    if (queue.some((s) => !s.title.trim() || !s.category.trim())) {
      toast.error("Every photo needs a caption and a category.");
      return;
    }
    setUploading(true);
    const records: { key: string; input: GalleryInput }[] = [];

    // Three uploads at a time keeps things fast without overwhelming phones.
    let next = 0;
    const worker = async () => {
      while (next < queue.length) {
        const item = queue[next++];
        update(item.key, { status: "uploading", error: undefined });
        try {
          const image = await prepareImage(item.file);
          const path = await uploadImage("gallery", image);
          records.push({
            key: item.key,
            input: {
              title: item.title.trim(),
              category: item.category.trim(),
              image_url: path,
              width: image.width,
              height: image.height,
            },
          });
        } catch (err) {
          update(item.key, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);

    if (records.length > 0) {
      const res = await addGalleryItems(records.map((r) => r.input));
      if (!res.ok) {
        await Promise.all(records.map((r) => discardUpload(r.input.image_url)));
        records.forEach((r) => update(r.key, { status: "error", error: res.error }));
        toast.error(res.error);
      } else {
        toast.success(
          res.data.count === 1
            ? "1 photo added to the gallery"
            : `${res.data.count} photos added to the gallery`,
        );
        const done = new Set(records.map((r) => r.key));
        setStaged((s) => {
          s.filter((x) => done.has(x.key)).forEach((x) => URL.revokeObjectURL(x.preview));
          return s.filter((x) => !done.has(x.key));
        });
        onUploaded();
      }
    }
    setUploading(false);
  };

  return (
    <section aria-labelledby="upload-heading" className="rounded-xl border bg-white">
      <div className="flex flex-col gap-1 border-b px-5 py-4 sm:px-6">
        <h2 id="upload-heading" className="flex items-center gap-2 text-2xl font-semibold text-ink">
          <UploadCloud className="size-5 text-gold" /> Upload photos
        </h2>
        <p className="text-sm text-muted-foreground">
          Add up to 50 photos at a time. Large photos are resized automatically.
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:p-6">
        <ImageDropzone
          multiple
          onFiles={add}
          aspect="h-36"
          label="Drop photos here, or click to choose several"
        />

        {staged.length > 0 && (
          <>
            <div className="flex flex-col gap-3 rounded-lg bg-paper p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Label htmlFor="bulk-category" className="shrink-0">
                  Category for all
                </Label>
                <Input
                  id="bulk-category"
                  list="gallery-categories"
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="h-9 w-44 bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStaged((s) =>
                      s.map((x) => (x.status === "done" ? x : { ...x, category: bulkCategory })),
                    )
                  }
                >
                  Apply
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => {
                    staged.forEach((s) => URL.revokeObjectURL(s.preview));
                    setStaged([]);
                  }}
                >
                  Clear
                </Button>
                <Button size="sm" onClick={uploadAll} disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                  {uploading
                    ? "Uploading…"
                    : `Upload ${staged.length} ${staged.length === 1 ? "photo" : "photos"}`}
                </Button>
              </div>
            </div>

            <ul className="grid gap-3 md:grid-cols-2">
              {staged.map((s) => (
                <li key={s.key} className="flex gap-3 rounded-lg border p-2.5">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                    <img src={s.preview} alt="" className="size-full object-cover" />
                    {s.status !== "ready" && (
                      <span className="absolute inset-0 grid place-items-center bg-black/45 text-white">
                        {s.status === "uploading" && <Loader2 className="size-5 animate-spin" />}
                        {s.status === "done" && <CheckCircle2 className="size-5" />}
                        {s.status === "error" && <XCircle className="size-5" />}
                      </span>
                    )}
                  </div>
                  <div className="grid min-w-0 flex-1 gap-1.5">
                    <Input
                      value={s.title}
                      onChange={(e) => update(s.key, { title: e.target.value })}
                      placeholder="Caption"
                      aria-label="Caption"
                      className="h-8"
                      disabled={uploading}
                    />
                    <Input
                      value={s.category}
                      list="gallery-categories"
                      onChange={(e) => update(s.key, { category: e.target.value })}
                      placeholder="Category"
                      aria-label="Category"
                      className="h-8"
                      disabled={uploading}
                    />
                    {s.error && <p className="truncate text-xs text-destructive">{s.error}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    onClick={() => drop(s.key)}
                    disabled={uploading}
                    aria-label="Remove from upload"
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
        <datalist id="gallery-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </section>
  );
}

function EditPhotoDialog({
  item,
  categories,
  onClose,
  onSaved,
}: {
  item: GalleryItem | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {item && (
          <EditPhotoForm key={item.id} item={item} categories={categories} onSaved={onSaved} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditPhotoForm({
  item,
  categories,
  onSaved,
}: {
  item: GalleryItem;
  categories: string[];
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState(item.title);
  const [category, setCategory] = React.useState(item.category);
  const [saving, setSaving] = React.useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateGalleryItem(item.id, { title, category });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Photo updated");
    onSaved();
  };

  return (
    <form onSubmit={save} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Edit photo</DialogTitle>
        <DialogDescription>Update the caption and category shown on the website.</DialogDescription>
      </DialogHeader>
      <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
        <img src={item.src} alt="" className="absolute inset-0 size-full object-contain" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="photo-title">Caption</Label>
        <Input id="photo-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="photo-category">Category</Label>
        <Input
          id="photo-category"
          list="edit-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <datalist id="edit-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
