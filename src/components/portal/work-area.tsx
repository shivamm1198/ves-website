"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquareText,
  Paperclip,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { completeTask, saveDraft } from "@/lib/portal/actions";
import { formatBytes, formatDateTime, relativeTo } from "@/lib/portal/format";
import { taskState } from "@/lib/portal/progress";
import { INTERN_FILE_TYPES, deleteInternFile, uploadInternFile } from "@/lib/portal/upload";
import {
  MAX_ATTACHMENTS,
  modeLabels,
  type Attachment,
  type Program,
  type Submission,
  type Task,
} from "@/lib/portal/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskStateBadge } from "@/components/portal/bits";
import { RichEditor, RichViewer } from "@/components/portal/rich-editor";

type SignedFile = Attachment & { url?: string };

type Props = {
  program: Program;
  task: Task;
  userId: string;
  submission: Submission | null;
  files: SignedFile[];
  remaining: number;
  now: number;
};

export function WorkArea(props: Props) {
  return props.submission?.status === "submitted" ? (
    <Completed {...props} />
  ) : (
    <Editor {...props} />
  );
}

function TaskBrief({ program, task, submission, remaining, now }: Props) {
  const state = taskState(task, submission ?? undefined, now);
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-3xl px-5 pt-6 pb-7 sm:px-8">
        <Link
          href={`/portal/programs/${program.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="size-4" /> {program.title}
        </Link>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-dark uppercase">
            {task.kind}
          </span>
          <TaskStateBadge state={state} />
        </div>
        <h1 className="mt-2 text-4xl font-semibold text-ink">{task.title}</h1>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-gold" />
            Due {formatDateTime(task.due_at)} · {relativeTo(task.due_at, now)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="size-4 text-gold" /> {modeLabels[task.mode]}
          </span>
          <span>
            <span className="font-semibold text-ink tabular-nums">{remaining}</span>{" "}
            {remaining === 1 ? "task" : "tasks"} remaining in this internship
          </span>
        </p>
        {task.instructions && (
          <div className="mt-5 rounded-lg border-l-2 border-gold bg-paper px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-foreground/80">
            {task.instructions}
          </div>
        )}
      </div>
    </header>
  );
}

function Feedback({ submission }: { submission: Submission | null }) {
  if (!submission?.feedback) return null;
  const returned = submission.status === "draft";
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        returned ? "border-gold/40 bg-gold/5" : "bg-white",
      )}
    >
      <MessageSquareText className="mt-0.5 size-4 shrink-0 text-gold-dark" />
      <div>
        <p className="font-medium text-ink">
          {returned ? "Your coordinator asked for changes" : "Feedback from your coordinator"}
        </p>
        <p className="mt-1 whitespace-pre-line text-muted-foreground">{submission.feedback}</p>
      </div>
    </div>
  );
}

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function Editor(props: Props) {
  const { program, task, userId, submission, now } = props;
  const router = useRouter();
  const writes = task.mode !== "file";
  const uploads = task.mode !== "text";

  const [title, setTitle] = React.useState(submission?.title ?? "");
  const [files, setFiles] = React.useState<SignedFile[]>(props.files);
  const [save, setSave] = React.useState<SaveState>(submission ? "saved" : "idle");
  const [savedAt, setSavedAt] = React.useState<string | null>(submission?.updated_at ?? null);
  const [uploading, setUploading] = React.useState(0);
  const [confirming, setConfirming] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);

  const body = React.useRef<{ json: unknown; text: string }>({
    json: submission?.content ?? null,
    text: submission?.content_text ?? "",
  });
  const latest = React.useRef({ title, files });
  React.useEffect(() => {
    latest.current = { title, files };
  });
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const inFlight = React.useRef<Promise<unknown>>(Promise.resolve());

  const payload = () => ({
    title: latest.current.title,
    content: body.current.json,
    content_text: body.current.text,
    attachments: latest.current.files.map(({ path, name, size }) => ({ path, name, size })),
  });

  const saveNow = React.useCallback(async () => {
    clearTimeout(timer.current);
    setSave("saving");
    const run = inFlight.current.catch(() => undefined).then(() => saveDraft(task.id, payload()));
    inFlight.current = run;
    const res = await run.catch(() => ({
      ok: false as const,
      error: "Couldn't reach the server. Check your connection.",
    }));
    if (!res.ok) {
      setSave("error");
      toast.error(res.error);
      return false;
    }
    setSavedAt(res.data.savedAt);
    setSave((s) => (s === "saving" ? "saved" : s));
    return true;
  }, [task.id]);

  const changed = React.useCallback(() => {
    setSave("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(saveNow, 1500);
  }, [saveNow]);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  // Warn before leaving with unsaved work; Ctrl/⌘+S saves.
  React.useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (save === "dirty" || save === "saving" || uploading > 0) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveNow();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("keydown", onKey);
    };
  }, [save, uploading, saveNow]);

  const addFiles = async (list: FileList | null) => {
    const picked = Array.from(list ?? []);
    if (picked.length === 0) return;
    const room = MAX_ATTACHMENTS - latest.current.files.length;
    if (room <= 0) return toast.error(`You can attach up to ${MAX_ATTACHMENTS} files.`);
    if (picked.length > room) toast.message(`Only the first ${room} file(s) were added.`);

    setUploading((n) => n + Math.min(room, picked.length));
    for (const file of picked.slice(0, room)) {
      try {
        const uploaded = await uploadInternFile(program.id, userId, file);
        latest.current = { ...latest.current, files: [...latest.current.files, uploaded] };
        setFiles(latest.current.files);
        if (!(await saveNow())) await deleteInternFile(uploaded.path);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const removeFile = async (file: SignedFile) => {
    latest.current = {
      ...latest.current,
      files: latest.current.files.filter((f) => f.path !== file.path),
    };
    setFiles(latest.current.files);
    if (await saveNow()) await deleteInternFile(file.path);
  };

  const complete = async () => {
    clearTimeout(timer.current);
    setCompleting(true);
    await inFlight.current.catch(() => undefined);
    const res = await completeTask(task.id, payload()).catch(() => ({
      ok: false as const,
      error: "Couldn't reach the server. Check your connection and try again.",
    }));
    setCompleting(false);
    setConfirming(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Task completed. Well done!");
    router.refresh();
  };

  const late = new Date(task.due_at).getTime() < now;
  const busy = uploading > 0 || completing;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <TaskBrief {...props} />

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8">
        <div className="grid gap-6">
          <Feedback submission={submission} />

          {writes && (
            <div>
              <label htmlFor="work-title" className="sr-only">
                Title
              </label>
              <textarea
                id="work-title"
                value={title}
                rows={1}
                maxLength={250}
                onChange={(e) => {
                  setTitle(e.target.value.replace(/\n/g, " "));
                  changed();
                }}
                placeholder="Title"
                className="field-sizing-content w-full resize-none bg-transparent font-serif text-4xl leading-tight font-semibold text-ink outline-none placeholder:text-foreground/25 sm:text-5xl"
              />
              <div className="mt-4">
                <RichEditor
                  initial={submission?.content ?? null}
                  placeholder="Tell your story… Use the toolbar for headings, lists, quotes and links."
                  onChange={(value) => {
                    body.current = value;
                    changed();
                  }}
                />
              </div>
            </div>
          )}

          {uploads && (
            <section aria-labelledby="files-title" className={cn(writes && "border-t pt-6")}>
              <h2
                id="files-title"
                className="flex items-center gap-2 font-sans text-sm font-medium text-ink"
              >
                <Paperclip className="size-4 text-gold" />
                {task.mode === "file" ? "Upload your work" : "Attachments"}
                <span className="font-normal text-muted-foreground">
                  · up to {MAX_ATTACHMENTS} files, 25 MB each
                </span>
              </h2>
              <FileDrop
                onFiles={addFiles}
                disabled={busy || files.length >= MAX_ATTACHMENTS}
                uploading={uploading > 0}
              />
              <ul className="mt-3 grid grid-cols-1 gap-2">
                <AnimatePresence initial={false}>
                  {files.map((f) => (
                    <motion.li
                      key={f.path}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 rounded-lg border bg-paper px-3 py-2.5"
                    >
                      <FileText className="size-5 shrink-0 text-gold-dark" />
                      <span className="min-w-0 flex-1">
                        {f.url ? (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-sm font-medium text-ink hover:underline"
                          >
                            {f.name}
                          </a>
                        ) : (
                          <span className="block truncate text-sm font-medium text-ink">
                            {f.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFile(f)}
                        disabled={busy}
                        aria-label={`Remove ${f.name}`}
                      >
                        <X />
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <SaveStatus state={save} savedAt={savedAt} />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => saveNow()}
              disabled={busy || save === "saving"}
              className="hidden sm:inline-flex"
            >
              Save draft
            </Button>
            <Button onClick={() => setConfirming(true)} disabled={busy}>
              <CheckCircle2 /> Complete task
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={(o) => !completing && setConfirming(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              Your work is sent to your coordinator and can&apos;t be edited afterwards, unless they
              return it for changes.
              {late && " The deadline has passed, so it will be marked as late."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completing}>Keep working</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void complete();
              }}
              disabled={completing}
            >
              {completing ? <Loader2 className="animate-spin" /> : <Send />}
              Complete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SaveStatus({ state, savedAt }: { state: SaveState; savedAt: string | null }) {
  const text =
    state === "saving"
      ? "Saving…"
      : state === "dirty"
        ? "Unsaved changes"
        : state === "error"
          ? "Couldn't save. Retrying when you type."
          : savedAt
            ? `Draft saved · ${formatDateTime(savedAt)}`
            : "Your work saves automatically";
  return (
    <p
      aria-live="polite"
      className={cn(
        "flex min-w-0 items-center gap-2 text-xs text-muted-foreground",
        state === "error" && "text-destructive",
      )}
    >
      {state === "saving" ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            state === "dirty" ? "bg-gold" : state === "error" ? "bg-destructive" : "bg-emerald-500",
          )}
        />
      )}
      <span className="truncate">{text}</span>
    </p>
  );
}

function FileDrop({
  onFiles,
  disabled,
  uploading,
}: {
  onFiles: (files: FileList | null) => void;
  disabled: boolean;
  uploading: boolean;
}) {
  const input = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "mt-3 rounded-lg border border-dashed transition-colors",
        over ? "border-gold bg-gold/5" : "bg-white",
        disabled && "opacity-60",
      )}
    >
      <input
        ref={input}
        type="file"
        multiple
        accept={INTERN_FILE_TYPES}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className="flex w-full flex-col items-center gap-1.5 px-4 py-7 text-center"
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-gold-dark" />
        ) : (
          <UploadCloud className="size-6 text-gold-dark" />
        )}
        <span className="text-sm font-medium text-ink">
          {uploading ? "Uploading…" : "Drop files here, or click to browse"}
        </span>
        <span className="text-xs text-muted-foreground">PDF, Word, PowerPoint or images</span>
      </button>
    </div>
  );
}

/** Read-only view once the task is completed. */
function Completed(props: Props) {
  const { program, task, submission, files, remaining } = props;
  const s = submission!;
  const onTime = new Date(s.submitted_at!).getTime() <= new Date(task.due_at).getTime();
  return (
    <div className="min-h-dvh bg-white">
      <TaskBrief {...props} />
      <div className="mx-auto grid max-w-3xl gap-6 px-5 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-xl border bg-paper p-5 sm:flex-row sm:items-center"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-gold-light">
            <CheckCircle2 className="size-6" />
          </span>
          <div className="flex-1">
            <p className="font-serif text-2xl font-semibold text-ink">Task completed</p>
            <p className="text-sm text-muted-foreground">
              Submitted {formatDateTime(s.submitted_at!)} ·{" "}
              {onTime ? "on time" : "after the deadline"}
              {" · "}
              {remaining === 0
                ? "you've finished every task so far"
                : `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/portal/programs/${program.id}`}>Back to my tasks</Link>
          </Button>
        </motion.div>

        <Feedback submission={s} />

        {s.title && <h2 className="font-serif text-4xl font-semibold text-ink">{s.title}</h2>}
        {s.content_text.trim() && <RichViewer content={s.content} />}

        {files.length > 0 && (
          <section className="border-t pt-6">
            <h3 className="flex items-center gap-2 font-sans text-sm font-medium text-ink">
              <Paperclip className="size-4 text-gold" /> Attachments
            </h3>
            <ul className="mt-3 grid grid-cols-1 gap-2">
              {files.map((f) => (
                <li key={f.path}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border bg-paper px-3 py-2.5 hover:border-foreground/25"
                  >
                    <FileText className="size-5 text-gold-dark" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {f.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
