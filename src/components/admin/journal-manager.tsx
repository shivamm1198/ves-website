"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  EyeOff,
  FileText,
  Loader2,
  NotebookPen,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { ArticleItem } from "@/lib/content/schema";
import { deleteArticle, saveArticle, setArticlePublished } from "@/lib/admin/article-actions";
import {
  ACCEPTED_DOCUMENTS,
  discardDocument,
  discardUpload,
  prepareImage,
  uploadDocument,
  uploadImage,
} from "@/lib/admin/upload";
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
import { ErrorNote } from "@/components/admin/events-manager";
import { ImageDropzone } from "@/components/admin/image-dropzone";

export type AdminArticle = ArticleItem & { coverPath: string; documentPath: string };

const DEFAULT_CATEGORIES = [
  "Constitutional Law",
  "Criminal Law",
  "Corporate Law",
  "Case Comment",
  "Research Paper",
  "Opinion",
];

export function JournalManager({
  articles,
  loadError,
}: {
  articles: AdminArticle[];
  loadError?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<AdminArticle | "new" | null>(null);
  const [query, setQuery] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const categories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...articles.map((a) => a.category).filter(Boolean)]),
  );
  const q = query.trim().toLowerCase();
  const visible = articles.filter(
    (a) => !q || `${a.title} ${a.author} ${a.category}`.toLowerCase().includes(q),
  );

  const togglePublished = async (article: AdminArticle, published: boolean) => {
    setBusyId(article.id);
    const res = await setArticlePublished(article.id, published);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(published ? "Article is live on the site" : "Article hidden from the site");
    router.refresh();
  };

  const remove = async (article: AdminArticle) => {
    setBusyId(article.id);
    const res = await deleteArticle(article.id);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Deleted “${article.title}”`);
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Student Journal"
        description="Publish articles by law students. Each one gets its own page; attach the full paper as a PDF or Word file for readers to download. The latest three also appear on the homepage."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus /> New article
          </Button>
        }
      />

      <div className="p-5 sm:p-8">
        {loadError && <ErrorNote message={loadError} />}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-ink">{articles.length}</span> articles ·{" "}
            {articles.filter((a) => !a.published).length} hidden
          </p>
          <label className="relative sm:w-72">
            <span className="sr-only">Search articles</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author or category"
              className="h-10 bg-white pl-9"
            />
          </label>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-16 text-center">
            <NotebookPen className="size-10 text-gold" strokeWidth={1.3} />
            <h2 className="mt-4 text-2xl font-semibold text-ink">No articles yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Publish the first student article. The journal section appears on the homepage as soon
              as one is live.
            </p>
            <Button className="mt-6" onClick={() => setEditing("new")}>
              <Plus /> New article
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3">
            <AnimatePresence initial={false}>
              {visible.map((article) => (
                <motion.li
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center",
                    busyId === article.id && "opacity-60",
                  )}
                >
                  <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-paper">
                    {article.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                      <img
                        src={article.cover}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : (
                      <FileText className="size-6 text-gold" strokeWidth={1.4} />
                    )}
                    {!article.published && (
                      <span className="absolute inset-0 grid place-items-center bg-white/70">
                        <EyeOff className="size-4 text-ink" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-serif text-xl font-semibold text-ink">
                        {article.title}
                      </h2>
                      {!article.published && <Badge variant="secondary">Hidden</Badge>}
                      {article.documentPath && (
                        <Badge variant="gold">
                          <Paperclip /> Document
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[article.author, article.category, article.dateLabel]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t pt-3 sm:border-0 sm:pt-0">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Visible
                      <Switch
                        checked={article.published}
                        disabled={busyId === article.id}
                        onCheckedChange={(v) => togglePublished(article, v)}
                        aria-label={`Show “${article.title}” on the site`}
                      />
                    </label>
                    <div className="flex gap-1">
                      {article.published && (
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Open on the site"
                        >
                          <a href={`/journal/${article.slug}`} target="_blank" rel="noreferrer">
                            <ArrowUpRight />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditing(article)}
                        aria-label={`Edit ${article.title}`}
                      >
                        <Pencil />
                      </Button>
                      <ConfirmAction
                        title="Delete this article?"
                        description={
                          <>“{article.title}” and its attached files will be removed permanently.</>
                        }
                        onConfirm={() => remove(article)}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${article.title}`}
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
                No articles match “{query}”.
              </li>
            )}
          </ul>
        )}
      </div>

      <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          {editing !== null && (
            <ArticleForm
              key={editing === "new" ? "new" : editing.id}
              article={editing === "new" ? null : editing}
              categories={categories}
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
  author_name: string;
  author_detail: string;
  category: string;
  published_on: string;
  summary: string;
  body: string;
  published: boolean;
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ArticleForm({
  article,
  categories,
  onDone,
}: {
  article: AdminArticle | null;
  categories: string[];
  onDone: () => void;
}) {
  const [form, setForm] = React.useState<FormState>(() => ({
    title: article?.title ?? "",
    author_name: article?.author ?? "",
    author_detail: article?.authorDetail ?? "",
    category: article?.category ?? "",
    published_on: article?.date ?? todayIso(),
    summary: article?.summary ?? "",
    body: article?.body ?? "",
    published: article?.published ?? true,
  }));

  // Cover image: keep the stored one, replace it with a new file, or remove it.
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [keepCover, setKeepCover] = React.useState(Boolean(article?.coverPath));
  const coverPreview = React.useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );
  React.useEffect(
    () => () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    },
    [coverPreview],
  );

  // Attached document, same three states.
  const [docFile, setDocFile] = React.useState<File | null>(null);
  const [keepDoc, setKeepDoc] = React.useState(Boolean(article?.documentPath));
  const docInput = React.useRef<HTMLInputElement>(null);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const uploaded: { cover?: string; doc?: string } = {};
    try {
      if (coverFile) uploaded.cover = await uploadImage("content", await prepareImage(coverFile));
      if (docFile) uploaded.doc = await uploadDocument(docFile);

      const res = await saveArticle(article?.id ?? null, {
        ...form,
        cover_url: uploaded.cover ?? (keepCover ? (article?.coverPath ?? "") : ""),
        document_url: uploaded.doc ?? (keepDoc ? (article?.documentPath ?? "") : ""),
        document_name: docFile ? docFile.name : keepDoc ? (article?.documentName ?? "") : "",
      });
      if (!res.ok) {
        await cleanup(uploaded);
        setError(res.error);
        return;
      }
      toast.success(article ? "Article updated" : "Article published");
      onDone();
    } catch (err) {
      await cleanup(uploaded);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const shownCover = coverPreview ?? (keepCover ? article?.cover : undefined);
  const shownDocName = docFile
    ? docFile.name
    : keepDoc
      ? article?.documentName || "Attached document"
      : null;

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-col">
      <div className="h-[3px] gold-gradient" />
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle className="font-serif text-2xl">
          {article ? "Edit article" : "New article"}
        </SheetTitle>
        <SheetDescription>
          {article
            ? "Changes go live as soon as you save."
            : "Fill in the details, then attach the paper if there is one."}
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-5 px-6 py-6">
        <Field label="Title" required>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. The Right to Privacy in the Age of Facial Recognition"
            required
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Author">
            <Input
              value={form.author_name}
              onChange={(e) => set("author_name", e.target.value)}
              placeholder="Student's name"
            />
          </Field>
          <Field label="About the author">
            <Input
              value={form.author_detail}
              onChange={(e) => set("author_detail", e.target.value)}
              placeholder="e.g. 3rd year, NLU Delhi"
            />
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              list="journal-categories"
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Case Comment"
            />
            <datalist id="journal-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Publication date" required>
            <Input
              type="date"
              value={form.published_on}
              onChange={(e) => set("published_on", e.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Summary" hint="Shown on cards — two or three sentences">
          <Textarea
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            rows={3}
          />
        </Field>
        <Field label="Article text" hint="Leave a blank line between paragraphs">
          <Textarea
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            rows={12}
            placeholder="Paste the article here. You can also just attach the paper below and keep this short."
            className="font-serif text-base leading-relaxed"
          />
        </Field>

        <div className="grid gap-2">
          <Label>
            Attached paper{" "}
            <span className="font-normal text-muted-foreground">· PDF or Word, up to 20 MB</span>
          </Label>
          <input
            ref={docInput}
            type="file"
            accept={ACCEPTED_DOCUMENTS}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setDocFile(f);
              e.target.value = "";
            }}
          />
          {shownDocName ? (
            <div className="flex items-center gap-3 rounded-lg border bg-paper px-4 py-3">
              <FileText className="size-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {shownDocName}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => docInput.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove document"
                onClick={() => {
                  setDocFile(null);
                  setKeepDoc(false);
                }}
              >
                <X />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => docInput.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-foreground/15 bg-white px-4 py-5 text-sm font-medium text-ink transition-colors hover:border-foreground/35"
            >
              <Paperclip className="size-4 text-gold" /> Attach the paper
            </button>
          )}
        </div>

        <div className="grid gap-2">
          <Label>
            Cover image <span className="font-normal text-muted-foreground">· optional</span>
          </Label>
          <ImageDropzone
            previewUrl={shownCover}
            onFile={(f) => setCoverFile(f)}
            onClear={() => {
              setCoverFile(null);
              setKeepCover(false);
            }}
            aspect="aspect-[16/9]"
          />
        </div>

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
          {saving ? "Saving…" : article ? "Save changes" : "Publish article"}
        </Button>
      </div>
    </form>
  );
}

async function cleanup(uploaded: { cover?: string; doc?: string }) {
  await Promise.all([
    uploaded.cover ? discardUpload(uploaded.cover) : null,
    uploaded.doc ? discardDocument(uploaded.doc) : null,
  ]);
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
