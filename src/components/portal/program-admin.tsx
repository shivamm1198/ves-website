"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Link2,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserMinus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  createInvite,
  deleteTask,
  removeMember,
  revokeInvite,
  saveTask,
} from "@/lib/portal/actions";
import { formatDate, formatDateTime, relativeTo } from "@/lib/portal/format";
import { performanceFor, programStatus, taskState, tasksFor } from "@/lib/portal/progress";
import {
  TASK_KINDS,
  modeLabels,
  type Access,
  type Invite,
  type Member,
  type Program,
  type Submission,
  type Task,
  type TaskMode,
} from "@/lib/portal/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { ErrorNote } from "@/components/admin/events-manager";
import {
  PerformanceSummary,
  ProgramStatusBadge,
  ProgressBar,
  Stat,
  TaskStateBadge,
  selectClass,
} from "@/components/portal/bits";
import { ProgramCardMenu } from "@/components/portal/program-actions";

type Props = {
  program: Program;
  access: Access;
  currentUserId: string;
  origin: string;
  now: number;
  members: Member[];
  tasks: Task[];
  submissions: Submission[];
  invites: Invite[];
};

/** Coordinator / president dashboard for one programme. */
export function ProgramAdmin(props: Props) {
  const { program, access, now, members, tasks, submissions } = props;
  const [tab, setTab] = React.useState("tasks");
  const [editing, setEditing] = React.useState<Task | "new" | null>(null);

  const interns = members.filter((m) => m.role === "intern");
  const status = programStatus(program.start_date, program.end_date, now);
  const toReview = submissions.filter((s) => s.status === "submitted" && !s.reviewed_at).length;
  const rates = interns.map(
    (m) =>
      performanceFor(
        tasksFor(tasks, m.user_id),
        submissions.filter((s) => s.user_id === m.user_id),
        now,
      ).rate,
  );
  const average = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;

  return (
    <>
      <AdminPageHeader
        eyebrow={access === "president" ? "Internship · President" : "Internship · Coordinator"}
        title={program.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <ProgramStatusBadge status={status} />
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-gold" />
              {formatDate(program.start_date)} – {formatDate(program.end_date)}
            </span>
          </span>
        }
        actions={
          <>
            {access === "president" && <ProgramCardMenu program={program} compact={false} />}
            <Button
              onClick={() => {
                setTab("tasks");
                setEditing("new");
              }}
            >
              <Plus /> New task
            </Button>
          </>
        }
      />

      <div className="p-5 sm:p-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Interns" value={interns.length} />
          <Stat label="Tasks" value={tasks.length} />
          <Stat label="Awaiting review" value={toReview} hint="Completed, no feedback yet" />
          <Stat label="Average completion" value={`${average}%`} />
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-8 gap-5">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="invites">Invite links</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">
            <TasksTab {...props} interns={interns} onEdit={setEditing} />
          </TabsContent>
          <TabsContent value="people">
            <PeopleTab {...props} onInvite={() => setTab("invites")} />
          </TabsContent>
          <TabsContent value="invites">
            <InvitesTab {...props} />
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
          {editing !== null && (
            <TaskForm
              key={editing === "new" ? "new" : editing.id}
              programId={program.id}
              task={editing === "new" ? null : editing}
              interns={interns}
              onDone={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ---------------- Tasks ---------------- */

function assignedInterns(task: Task, interns: Member[]) {
  return task.assignees ? interns.filter((m) => task.assignees!.includes(m.user_id)) : interns;
}

function TasksTab({
  program,
  tasks,
  submissions,
  interns,
  now,
  onEdit,
}: Props & { interns: Member[]; onEdit: (task: Task | "new") => void }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  const remove = async (task: Task) => {
    setBusy(task.id);
    const res = await deleteTask(task.id);
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Deleted “${task.title}”`);
    router.refresh();
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white px-6 py-14 text-center">
        <h2 className="font-serif text-2xl font-semibold text-ink">No tasks yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Give interns their first assignment: an article, a research paper, a case comment… with a
          deadline.
        </p>
        <Button className="mt-6" onClick={() => onEdit("new")}>
          <Plus /> New task
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3">
      <AnimatePresence initial={false}>
        {tasks.map((task) => {
          const assigned = assignedInterns(task, interns);
          const subs = submissions.filter(
            (s) => s.task_id === task.id && assigned.some((m) => m.user_id === s.user_id),
          );
          const completed = subs.filter((s) => s.status === "submitted").length;
          const pending = subs.filter((s) => s.status === "submitted" && !s.reviewed_at).length;
          const past = new Date(task.due_at).getTime() < now;

          return (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "flex flex-col gap-4 rounded-lg border bg-white p-5 lg:flex-row lg:items-center",
                busy === task.id && "opacity-60",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-semibold tracking-[0.14em] text-gold-dark uppercase">
                    {task.kind}
                  </span>
                  <span className="text-muted-foreground">· {modeLabels[task.mode]}</span>
                  {pending > 0 && (
                    <span className="rounded-full bg-ink px-2 py-0.5 font-medium text-white">
                      {pending} to review
                    </span>
                  )}
                </div>
                <Link
                  href={`/portal/programs/${program.id}/tasks/${task.id}`}
                  className="mt-1 block truncate font-serif text-xl font-semibold text-ink hover:underline"
                >
                  {task.title}
                </Link>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className={cn("inline-flex items-center gap-1.5", past && "text-ink")}>
                    <Clock className="size-3.5 text-gold" />
                    Due {formatDateTime(task.due_at)} · {relativeTo(task.due_at, now)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5 text-gold" />
                    {task.assignees ? `${assigned.length} selected` : "All interns"}
                  </span>
                </p>
              </div>
              <div className="w-full lg:w-48">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-ink tabular-nums">
                    {completed}/{assigned.length} completed
                  </span>
                </div>
                <ProgressBar
                  value={assigned.length ? (completed / assigned.length) * 100 : 0}
                  className="mt-1.5 h-1.5"
                />
              </div>
              <div className="flex items-center gap-1 border-t pt-3 lg:border-0 lg:pt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/portal/programs/${program.id}/tasks/${task.id}`}>
                    Submissions <ChevronRight />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(task)}
                  aria-label={`Edit ${task.title}`}
                >
                  <Pencil />
                </Button>
                <ConfirmAction
                  title="Delete this task?"
                  description={
                    <>
                      “{task.title}” and every intern&apos;s work on it will be removed. This
                      can&apos;t be undone.
                    </>
                  }
                  onConfirm={() => remove(task)}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 />
                  </Button>
                </ConfirmAction>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

/** ISO → value for <input type="datetime-local"> in the browser's time zone. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function TaskForm({
  programId,
  task,
  interns,
  onDone,
}: {
  programId: string;
  task: Task | null;
  interns: Member[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState({
    title: task?.title ?? "",
    kind: task?.kind ?? "Article",
    instructions: task?.instructions ?? "",
    mode: task?.mode ?? ("both" as TaskMode),
    due: task ? toLocalInput(task.due_at) : "",
    everyone: task ? task.assignees === null : true,
    assignees: new Set(task?.assignees ?? []),
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggle = (id: string) =>
    setForm((f) => {
      const next = new Set(f.assignees);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...f, assignees: next };
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.due) return setError("Pick a deadline.");
    setSaving(true);
    const res = await saveTask(programId, task?.id ?? null, {
      title: form.title,
      kind: form.kind,
      instructions: form.instructions,
      mode: form.mode,
      due_at: new Date(form.due).toISOString(),
      assignees: form.everyone ? null : [...form.assignees],
    });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    toast.success(task ? "Task updated" : "Task assigned");
    onDone();
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-col">
      <div className="h-[3px] gold-gradient" />
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle className="font-serif text-2xl">{task ? "Edit task" : "New task"}</SheetTitle>
        <SheetDescription>
          Interns see it on their dashboard straight away, with the deadline.
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-5 px-6 py-6">
        <div className="grid gap-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Comment on the Puttaswamy privacy judgment"
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="task-kind">Type of work</Label>
            <Input
              id="task-kind"
              list="task-kinds"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              required
            />
            <datalist id="task-kinds">
              {TASK_KINDS.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-due">Deadline</Label>
            <Input
              id="task-due"
              type="datetime-local"
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="task-instructions">Instructions</Label>
          <Textarea
            id="task-instructions"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            rows={6}
            placeholder="What to cover, word limit, citation style, sources to use…"
          />
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">How interns submit</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(modeLabels) as TaskMode[]).map((mode) => (
              <label
                key={mode}
                className={cn(
                  "cursor-pointer rounded-lg border px-3 py-3 text-sm transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-ring/30",
                  form.mode === mode
                    ? "border-ink bg-ink text-white"
                    : "bg-white hover:border-foreground/30",
                )}
              >
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={form.mode === mode}
                  onChange={() => setForm({ ...form, mode })}
                  className="sr-only"
                />
                {modeLabels[mode]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-sm font-medium">Assign to</legend>
          <select
            value={form.everyone ? "all" : "some"}
            onChange={(e) => setForm({ ...form, everyone: e.target.value === "all" })}
            className={selectClass}
            aria-label="Assign to"
          >
            <option value="all">Every intern (including those who join later)</option>
            <option value="some">Selected interns</option>
          </select>
          {!form.everyone &&
            (interns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interns have joined yet.</p>
            ) : (
              <ul className="grid max-h-64 gap-1 overflow-y-auto rounded-lg border bg-paper p-2">
                {interns.map((m) => (
                  <li key={m.user_id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-white">
                      <input
                        type="checkbox"
                        checked={form.assignees.has(m.user_id)}
                        onChange={() => toggle(m.user_id)}
                        className="size-4 accent-ink"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">
                          {m.full_name || m.email}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {m.email}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ))}
        </fieldset>
        {error && <ErrorNote message={error} />}
      </div>

      <div className="sticky bottom-0 mt-auto flex justify-end gap-2 border-t bg-white px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {task ? "Save changes" : "Assign task"}
        </Button>
      </div>
    </form>
  );
}

/* ---------------- People ---------------- */

function PeopleTab({
  program,
  access,
  currentUserId,
  members,
  tasks,
  submissions,
  now,
  onInvite,
}: Props & { onInvite: () => void }) {
  const router = useRouter();
  const [open, setOpen] = React.useState<string | null>(null);
  const admins = members.filter((m) => m.role === "admin");
  const interns = members.filter((m) => m.role === "intern");

  const remove = async (m: Member) => {
    const res = await removeMember(program.id, m.user_id);
    if (!res.ok) return toast.error(res.error);
    toast.success(`${m.full_name || m.email} was removed`);
    router.refresh();
  };

  const removeButton = (m: Member, what: string) => (
    <ConfirmAction
      title={`Remove this ${what}?`}
      description={
        <>
          {m.full_name || m.email} will lose access to this internship. Their submitted work stays
          until the internship is deleted.
        </>
      }
      confirmLabel="Remove"
      onConfirm={() => remove(m)}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${m.full_name || m.email}`}
      >
        <UserMinus />
      </Button>
    </ConfirmAction>
  );

  return (
    <div className="grid grid-cols-1 gap-8">
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          <ShieldCheck className="size-3.5 text-gold" /> Coordinators
        </h2>
        {admins.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-white px-4 py-5 text-sm text-muted-foreground">
            No coordinator yet.{" "}
            {access === "president" && (
              <>
                Create a <strong className="text-ink">coordinator</strong> invite link in{" "}
                <button type="button" onClick={onInvite} className="font-medium text-ink underline">
                  Invite links
                </button>{" "}
                and send it to the person who will run this internship.
              </>
            )}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {admins.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3"
              >
                <Initials name={m.full_name || m.email} dark />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {m.full_name || m.email}
                    {m.user_id === currentUserId && (
                      <span className="text-muted-foreground"> (you)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                </div>
                {access === "president" && removeButton(m, "coordinator")}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          <Users className="size-3.5 text-gold" /> Interns
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums">
            {interns.length}
          </span>
        </h2>
        {interns.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No interns have joined yet.</p>
            <Button className="mt-4" variant="outline" onClick={onInvite}>
              <Link2 /> Create an invite link
            </Button>
          </div>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-white">
            {interns.map((m) => {
              const mine = tasksFor(tasks, m.user_id);
              const subs = submissions.filter((s) => s.user_id === m.user_id);
              const perf = performanceFor(mine, subs, now);
              const expanded = open === m.user_id;
              return (
                <li key={m.user_id}>
                  <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? null : m.user_id)}
                      aria-expanded={expanded}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <Initials name={m.full_name || m.email} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {m.full_name || m.email}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {m.email} · joined {formatDate(m.joined_at.slice(0, 10))}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform sm:order-last",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                    <div className="flex items-center gap-4 sm:w-auto">
                      <div className="hidden gap-3 text-center text-xs text-muted-foreground md:flex">
                        <span>
                          <span className="block font-semibold text-ink tabular-nums">
                            {perf.onTime}
                          </span>
                          on time
                        </span>
                        <span>
                          <span className="block font-semibold text-ink tabular-nums">
                            {perf.late}
                          </span>
                          late
                        </span>
                        <span>
                          <span className="block font-semibold text-ink tabular-nums">
                            {perf.missed}
                          </span>
                          missed
                        </span>
                      </div>
                      <div className="flex-1 sm:w-44 sm:flex-none">
                        <PerformanceSummary perf={perf} />
                      </div>
                      {removeButton(m, "intern")}
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <ul className="grid gap-1 border-t bg-paper/60 px-4 py-3 sm:px-5">
                          {mine.length === 0 && (
                            <li className="py-2 text-sm text-muted-foreground">
                              No tasks assigned.
                            </li>
                          )}
                          {mine.map((t) => {
                            const sub = subs.find((s) => s.task_id === t.id);
                            const state = taskState(t, sub, now);
                            const body = (
                              <>
                                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                                  {t.title}
                                </span>
                                <span className="hidden text-xs text-muted-foreground sm:inline">
                                  Due {formatDateTime(t.due_at)}
                                </span>
                                <TaskStateBadge state={state} />
                              </>
                            );
                            return (
                              <li key={t.id}>
                                {sub ? (
                                  <Link
                                    href={`/portal/programs/${program.id}/submissions/${sub.id}`}
                                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white"
                                  >
                                    {body}
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-3 px-2 py-2 pr-9">
                                    {body}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Initials({ name, dark }: { name: string; dark?: boolean }) {
  const letters = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full font-serif text-sm font-semibold",
        dark ? "bg-ink text-gold-light" : "bg-paper text-ink ring-1 ring-border",
      )}
    >
      {letters}
    </span>
  );
}

/* ---------------- Invite links ---------------- */

const EXPIRY_PRESETS = [
  { value: "1", label: "24 hours" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "custom", label: "Pick a date…" },
];

function inviteStatus(invite: Invite, now: number) {
  if (invite.revoked) return { label: "Revoked", active: false };
  if (new Date(invite.expires_at).getTime() <= now) return { label: "Expired", active: false };
  if (invite.max_uses !== null && invite.uses >= invite.max_uses)
    return { label: "Used up", active: false };
  return { label: "Active", active: true };
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied. Paste it into WhatsApp or email.");
  } catch {
    toast.error("Couldn't copy automatically. Select the link and copy it.");
  }
}

function InvitesTab({ program, access, origin, invites, now }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState({
    role: "intern" as "intern" | "admin",
    label: "",
    expiry: "7",
    custom: "",
    limit: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<string | null>(null);
  const linkFor = (token: string) => `${origin}/portal/join/${token}`;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const expires =
      form.expiry === "custom"
        ? form.custom
          ? new Date(form.custom)
          : null
        : new Date(Date.now() + Number(form.expiry) * 86_400_000);
    if (!expires || Number.isNaN(expires.getTime())) return setError("Pick when the link expires.");
    setSaving(true);
    const res = await createInvite(program.id, {
      role: form.role,
      label: form.label,
      expires_at: expires.toISOString(),
      max_uses: form.limit ? Number(form.limit) : null,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    setCreated(linkFor(res.data.token));
    setForm((f) => ({ ...f, label: "" }));
    router.refresh();
  };

  const revoke = async (invite: Invite) => {
    const res = await revokeInvite(invite.id);
    if (!res.ok) return toast.error(res.error);
    toast.success("Link revoked. It can't be used any more.");
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr] xl:items-start">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border bg-white p-5">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">Create an invite link</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Anyone with the link can create an account and join until it expires.
          </p>
        </div>
        {access === "president" && (
          <div className="grid gap-2">
            <Label htmlFor="invite-role">Joins as</Label>
            <select
              id="invite-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "intern" | "admin" })}
              className={selectClass}
            >
              <option value="intern">Intern</option>
              <option value="admin">Coordinator (internship admin)</option>
            </select>
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="invite-label">
            Label{" "}
            <span className="font-normal text-muted-foreground">· optional, only you see it</span>
          </Label>
          <Input
            id="invite-label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="e.g. Batch A, or the coordinator's name"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="invite-expiry">Expires after</Label>
            <select
              id="invite-expiry"
              value={form.expiry}
              onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              className={selectClass}
            >
              {EXPIRY_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-limit">Maximum sign-ups</Label>
            <Input
              id="invite-limit"
              type="number"
              min={1}
              max={1000}
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              placeholder="No limit"
            />
          </div>
        </div>
        {form.expiry === "custom" && (
          <div className="grid gap-2">
            <Label htmlFor="invite-custom">Expires on</Label>
            <Input
              id="invite-custom"
              type="datetime-local"
              value={form.custom}
              onChange={(e) => setForm({ ...form, custom: e.target.value })}
              required
            />
          </div>
        )}
        {error && <ErrorNote message={error} />}
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Link2 />}
          Create link
        </Button>
        <AnimatePresence>
          {created && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-gold/40 bg-gold/5 p-3"
            >
              <p className="text-xs font-medium text-gold-dark">New link ready to share</p>
              <div className="mt-2 flex gap-2">
                <Input
                  readOnly
                  value={created}
                  onFocus={(e) => e.target.select()}
                  className="h-9 bg-white text-xs"
                />
                <Button type="button" size="sm" className="h-9" onClick={() => copy(created)}>
                  <Copy /> Copy
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <section>
        <h2 className="mb-3 font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Links
        </h2>
        {invites.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white px-6 py-12 text-center text-sm text-muted-foreground">
            No invite links yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2">
            {invites.map((invite) => {
              const s = inviteStatus(invite, now);
              return (
                <li
                  key={invite.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-white px-4 py-3 sm:flex-row sm:items-center",
                    !s.active && "bg-paper/60",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">
                        {invite.label ||
                          (invite.role === "admin" ? "Coordinator link" : "Intern link")}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          s.active
                            ? "border-emerald-600/20 bg-emerald-50 text-emerald-800"
                            : "border-foreground/10 text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                      {invite.role === "admin" && (
                        <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">
                          Coordinator
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {invite.uses}
                      {invite.max_uses !== null && ` of ${invite.max_uses}`} joined ·{" "}
                      {s.label === "Expired" ? "expired" : "expires"}{" "}
                      {formatDateTime(invite.expires_at)}
                    </p>
                  </div>
                  {s.active && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(linkFor(invite.token))}
                      >
                        <Copy /> Copy link
                      </Button>
                      <ConfirmAction
                        title="Revoke this link?"
                        description="Nobody else will be able to join with it. People who already joined keep their access."
                        confirmLabel="Revoke"
                        onConfirm={() => revoke(invite)}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          Revoke
                        </Button>
                      </ConfirmAction>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
