"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronDown, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/supabase/env";
import { prepareImage, uploadImage } from "@/lib/admin/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import type { FieldDef } from "./sections";

type Obj = Record<string, unknown>;

/** Renders a set of fields for one object value. */
export function FieldsGrid({
  fields,
  value,
  onChange,
  idPrefix,
}: {
  fields: FieldDef[];
  value: Obj;
  onChange: (next: Obj) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className={cn(field.wide && "sm:col-span-2")}>
          <FieldInput
            field={field}
            id={`${idPrefix}-${field.key}`}
            value={value[field.key]}
            onChange={(v) => onChange({ ...value, [field.key]: v })}
          />
        </div>
      ))}
    </div>
  );
}

function FieldInput({
  field,
  id,
  value,
  onChange,
}: {
  field: FieldDef;
  id: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = (
    <Label htmlFor={id} className="mb-2">
      {field.label}
    </Label>
  );
  const help = field.help && <p className="mt-1.5 text-xs text-muted-foreground">{field.help}</p>;
  const str = typeof value === "string" ? value : "";

  switch (field.kind) {
    case "text":
    case "email":
    case "url":
      return (
        <div>
          {label}
          <Input
            id={id}
            type={field.kind === "text" ? "text" : field.kind}
            value={str}
            placeholder={field.placeholder ?? (field.kind === "url" ? "https://" : undefined)}
            onChange={(e) =>
              onChange(field.transform ? field.transform(e.target.value) : e.target.value)
            }
            className="bg-white"
          />
          {help}
        </div>
      );
    case "textarea":
      return (
        <div>
          {label}
          <Textarea
            id={id}
            value={str}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-0 bg-white"
          />
          {help}
        </div>
      );
    case "number":
      return (
        <div>
          {label}
          <NumberInput
            id={id}
            value={typeof value === "number" ? value : 0}
            min={field.min}
            onChange={onChange}
          />
          {help}
        </div>
      );
    case "select":
      return (
        <div>
          {label}
          <select
            id={id}
            value={str}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {help}
        </div>
      );
    case "image":
      return (
        <div>
          {label}
          <ImageField value={str} onChange={onChange} shape={field.shape} />
          {help}
        </div>
      );
    case "strings":
      return (
        <div>
          <p className="mb-2 text-sm font-medium">{field.label}</p>
          <StringList
            id={id}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={onChange}
            itemLabel={field.itemLabel}
            multiline={field.multiline}
          />
          {help}
        </div>
      );
    case "group":
      return (
        <fieldset className="rounded-lg border bg-paper/60 p-4">
          <legend className="px-1 text-sm font-medium">{field.label}</legend>
          {field.help && <p className="mb-4 text-xs text-muted-foreground">{field.help}</p>}
          <FieldsGrid
            fields={field.fields}
            value={(value as Obj) ?? {}}
            onChange={onChange}
            idPrefix={id}
          />
        </fieldset>
      );
  }
}

/** Number input that lets the field be cleared while typing. */
export function NumberInput({
  value,
  onChange,
  min,
  id,
  className,
  ...props
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  id?: string;
  className?: string;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "min">) {
  const [text, setText] = React.useState(String(value));
  // Follow outside changes (discard, reset) unless the user is mid-edit.
  const shown =
    text === ""
      ? value === 0
        ? ""
        : String(value)
      : Number(text) === value
        ? text
        : String(value);

  return (
    <Input
      id={id}
      type="number"
      inputMode="numeric"
      min={min}
      value={shown}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseInt(e.target.value, 10);
        onChange(Number.isFinite(n) ? Math.max(min ?? -Infinity, n) : 0);
      }}
      className={cn("bg-white tabular-nums", className)}
      {...props}
    />
  );
}

function ImageField({
  value,
  onChange,
  shape,
}: {
  value: string;
  onChange: (v: string) => void;
  shape?: "round" | "wide";
}) {
  const [uploading, setUploading] = React.useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadImage("content", await prepareImage(file));
      onChange(path);
      toast.success("Image uploaded — remember to save this section.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("relative", shape === "round" ? "w-28" : "max-w-sm")}>
      <ImageDropzone
        previewUrl={value ? mediaUrl(value) : undefined}
        onFile={upload}
        onClear={() => onChange("")}
        round={shape === "round"}
        aspect={shape === "round" ? "aspect-square" : "aspect-video"}
        label="Upload an image"
      />
      {uploading && (
        <div
          className={cn(
            "absolute inset-0 grid place-items-center bg-white/80",
            shape === "round" ? "rounded-full" : "rounded-lg",
          )}
        >
          <Loader2 className="size-5 animate-spin text-ink" />
        </div>
      )}
    </div>
  );
}

function StringList({
  id,
  value,
  onChange,
  itemLabel,
  multiline,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  itemLabel: string;
  multiline?: boolean;
}) {
  const set = (i: number, v: string) => onChange(value.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <Textarea
              id={i === 0 ? id : undefined}
              value={item}
              rows={3}
              onChange={(e) => set(i, e.target.value)}
              aria-label={`${itemLabel} ${i + 1}`}
              className="min-h-0 bg-white"
            />
          ) : (
            <Input
              id={i === 0 ? id : undefined}
              value={item}
              onChange={(e) => set(i, e.target.value)}
              aria-label={`${itemLabel} ${i + 1}`}
              className="h-10 bg-white"
            />
          )}
          <RowButtons
            index={i}
            count={value.length}
            onMove={(d) => move(i, d)}
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
            noun={itemLabel}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit bg-white"
        onClick={() => onChange([...value, ""])}
      >
        <Plus /> Add {itemLabel}
      </Button>
    </div>
  );
}

function RowButtons({
  index,
  count,
  onMove,
  onRemove,
  noun,
}: {
  index: number;
  count: number;
  onMove: (d: -1 | 1) => void;
  onRemove?: () => void;
  noun: string;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label={`Move ${noun} up`}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        aria-label={`Move ${noun} down`}
      >
        <ArrowDown />
      </Button>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Remove ${noun}`}
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
}

/**
 * Editable list of objects: collapsible cards with reorder, remove and add.
 * Keeps a stable id per row so open/closed state survives reordering.
 */
export function ListEditor({
  items,
  onChange,
  fields,
  noun,
  title,
  subtitle,
  newItem,
  fixed,
  idPrefix,
}: {
  items: Obj[];
  onChange: (next: Obj[]) => void;
  fields: FieldDef[];
  noun: string;
  title: (item: Obj) => string;
  subtitle?: (item: Obj) => string;
  newItem: () => Obj;
  fixed?: boolean;
  idPrefix: string;
}) {
  const [ids, setIds] = React.useState(() => items.map(() => crypto.randomUUID()));
  const [open, setOpen] = React.useState<Set<string>>(() => new Set());
  const [query, setQuery] = React.useState("");

  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const move = (i: number, d: -1 | 1) => {
    const swap = <T,>(arr: T[]) => {
      const next = [...arr];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    };
    setIds(swap);
    onChange(swap(items));
  };

  const remove = (i: number) => {
    setIds((x) => x.filter((_, j) => j !== i));
    onChange(items.filter((_, j) => j !== i));
  };

  const add = () => {
    const id = crypto.randomUUID();
    setIds((x) => [...x, id]);
    setOpen((s) => new Set(s).add(id));
    setQuery("");
    onChange([...items, newItem()]);
  };

  const q = query.trim().toLowerCase();
  const matches = (item: Obj) =>
    !q || `${title(item)} ${subtitle?.(item) ?? ""}`.toLowerCase().includes(q);

  return (
    <div className="grid gap-3">
      {items.length > 8 && (
        <label className="relative">
          <span className="sr-only">Filter {noun}s</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Find a ${noun}…`}
            className="h-10 bg-white pl-9"
          />
        </label>
      )}

      {items.map((item, i) => {
        const id = ids[i] ?? String(i);
        if (!matches(item)) return null;
        const isOpen = open.has(id);
        const sub = subtitle?.(item);
        return (
          <div key={id} className={cn("rounded-lg border bg-white", isOpen && "shadow-sm")}>
            <div className="flex items-center gap-2 py-2 pr-2 pl-4">
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
              >
                <span className="w-6 shrink-0 font-serif text-sm text-gold-dark tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{title(item)}</span>
                  {sub && (
                    <span className="block truncate text-xs text-muted-foreground">{sub}</span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <RowButtons
                index={i}
                count={items.length}
                onMove={(d) => move(i, d)}
                onRemove={fixed ? undefined : () => remove(i)}
                noun={noun}
              />
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t bg-paper/50 p-4 sm:p-5">
                    <FieldsGrid
                      fields={fields}
                      value={item}
                      idPrefix={`${idPrefix}-${id}`}
                      onChange={(next) => onChange(items.map((x, j) => (j === i ? next : x)))}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed bg-white px-4 py-8 text-center text-sm text-muted-foreground">
          No {noun}s yet.
        </p>
      )}

      {!fixed && (
        <Button type="button" variant="outline" className="w-fit bg-white" onClick={add}>
          <Plus /> Add {noun}
        </Button>
      )}
    </div>
  );
}
