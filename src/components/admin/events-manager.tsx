"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, EyeOff, Loader2, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { EventItem } from "@/lib/content/schema";
import { deleteEvent, saveEvent, setEventPublished } from "@/lib/admin/event-actions";
import { discardUpload, prepareImage, uploadImage } from "@/lib/admin/upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { ImageDropzone } from "@/components/admin/image-dropzone";

export type AdminEvent = EventItem & { imagePath: string };

export function EventsManager({ events, loadError }: { events: AdminEvent[]; loadError?: string }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<AdminEvent | "new" | null>(null);
  const [query, setQuery] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const visible = events.filter(
    (e) => !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q),
  );

  const togglePublished = async (event: AdminEvent, published: boolean) => {
    setBusyId(event.id);
    const res = await setEventPublished(event.id, published);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(published ? "Event is visible on the site" : "Event hidden from the site");
    router.refresh();
  };

  const remove = async (event: AdminEvent) => {
    setBusyId(event.id);
    const res = await deleteEvent(event.id);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Deleted “${event.title}”`);
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Events"
        description="Events appear on the homepage (latest six) and on the gallery page, newest first. Hidden events stay here but aren't shown on the site."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus /> New event
          </Button>
        }
      />

      <div className="p-5 sm:p-8">
        {loadError && <ErrorNote message={loadError} />}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-ink">{events.length}</span> events ·{" "}
            {events.filter((e) => !e.published).length} hidden
          </p>
          <label className="relative sm:w-72">
            <span className="sr-only">Search events</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or place"
              className="h-10 bg-white pl-9"
            />
          </label>
        </div>

        {events.length === 0 ? (
          <EmptyState onCreate={() => setEditing("new")} />
        ) : (
          <ul className="grid gap-3">
            <AnimatePresence initial={false}>
              {visible.map((event) => (
                <motion.li
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "flex flex-col gap-4 rounded-lg border bg-white p-3 sm:flex-row sm:items-center",
                    busyId === event.id && "opacity-60",
                  )}
                >
                  <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-40">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img
                      src={event.image}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    {!event.published && (
                      <span className="absolute inset-0 grid place-items-center bg-white/70">
                        <EyeOff className="size-5 text-ink" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 sm:py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-serif text-xl font-semibold text-ink">
                        {event.title}
                      </h2>
                      {!event.published && <Badge variant="secondary">Hidden</Badge>}
                    </div>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-gold" /> {event.dateLabel}
                      </span>
                      {event.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-gold" /> {event.location}
                        </span>
                      )}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0 sm:pr-2">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Visible
                      <Switch
                        checked={event.published}
                        disabled={busyId === event.id}
                        onCheckedChange={(v) => togglePublished(event, v)}
                        aria-label={`Show “${event.title}” on the site`}
                      />
                    </label>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditing(event)}
                        aria-label={`Edit ${event.title}`}
                      >
                        <Pencil />
                      </Button>
                      <ConfirmAction
                        title="Delete this event?"
                        description={
                          <>“{event.title}” and its cover photo will be removed permanently.</>
                        }
                        onConfirm={() => remove(event)}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${event.title}`}
                        >
                          <Trash2 />
                        </Button>
                      </ConfirmAction>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {visible.length === 0 && (
              <li className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                No events match “{query}”.
              </li>
            )}
          </ul>
        )}
      </div>

      <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
          {editing !== null && (
            <EventForm
              key={editing === "new" ? "new" : editing.id}
              event={editing === "new" ? null : editing}
              onDone={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

type FormState = {
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  published: boolean;
};

function EventForm({ event, onDone }: { event: AdminEvent | null; onDone: () => void }) {
  const [form, setForm] = React.useState<FormState>({
    title: event?.title ?? "",
    location: event?.location ?? "",
    start_date: event?.startDate ?? "",
    end_date: event?.endDate ?? "",
    description: event?.description ?? "",
    published: event?.published ?? true,
  });
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const filePreview = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  React.useEffect(
    () => () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    },
    [filePreview],
  );
  const preview = filePreview ?? event?.image ?? "";

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file && !event?.imagePath) return setError("Add a cover image for the event.");

    setSaving(true);
    let uploaded: string | null = null;
    try {
      if (file) uploaded = await uploadImage("events", await prepareImage(file));
      const res = await saveEvent(event?.id ?? null, {
        ...form,
        image_url: uploaded ?? event!.imagePath,
      });
      if (!res.ok) {
        if (uploaded) await discardUpload(uploaded);
        setError(res.error);
        return;
      }
      toast.success(event ? "Event updated" : "Event published");
      onDone();
    } catch (err) {
      if (uploaded) await discardUpload(uploaded);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-col">
      <div className="h-[3px] gold-gradient" />
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle className="font-serif text-2xl">
          {event ? "Edit event" : "New event"}
        </SheetTitle>
        <SheetDescription>
          {event
            ? "Changes go live as soon as you save."
            : "Fill in the details and add a cover photo."}
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-5 px-6 py-6">
        <div className="grid gap-2">
          <Label>Cover image</Label>
          <ImageDropzone
            previewUrl={preview}
            onFile={(f) => {
              setFile(f);
              setError(null);
            }}
          />
        </div>
        <Field label="Title" required>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. National Moot Court Competition 2026"
            required
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Start date" required>
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              required
            />
          </Field>
          <Field label="End date" hint="Only for multi-day events">
            <Input
              type="date"
              value={form.end_date}
              min={form.start_date || undefined}
              onChange={(e) => set("end_date", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Location">
          <Input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. New Delhi, or Online"
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Two or three sentences about the event."
          />
        </Field>
        <label className="flex items-center justify-between gap-4 rounded-lg border bg-paper px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-ink">Show on the website</span>
            <span className="text-xs text-muted-foreground">
              Turn off to keep it as a hidden draft.
            </span>
          </span>
          <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
        </label>
        {error && <ErrorNote message={error} />}
      </div>

      <div className="sticky bottom-0 mt-auto flex justify-end gap-2 border-t bg-white px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {saving ? "Saving…" : event ? "Save changes" : "Create event"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>
        {label}
        {required && <span className="text-gold-dark">*</span>}
        {hint && <span className="font-normal text-muted-foreground">· {hint}</span>}
      </Label>
      {children}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-16 text-center">
      <CalendarDays className="size-10 text-gold" strokeWidth={1.3} />
      <h2 className="mt-4 text-2xl font-semibold text-ink">No events yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first event — it will appear on the homepage and gallery page straight away.
      </p>
      <Button className="mt-6" onClick={onCreate}>
        <Plus /> New event
      </Button>
    </div>
  );
}
