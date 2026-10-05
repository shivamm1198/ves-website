import Link from "next/link";
import { Award, CalendarDays, ChevronRight, Clock, MessageSquareText } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate, formatDateTime, relativeTo } from "@/lib/portal/format";
import {
  performanceFor,
  programStatus,
  taskState,
  tasksFor,
  type Performance,
  type TaskState,
} from "@/lib/portal/progress";
import type { Program, Submission, Task } from "@/lib/portal/types";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  ProgramStatusBadge,
  ProgressBar,
  RateRing,
  Stat,
  TaskStateBadge,
} from "@/components/portal/bits";

type Props = {
  program: Program;
  userId: string;
  tasks: Task[];
  submissions: Submission[];
  now: number;
};

/** An intern's view of a programme: progress, tasks by status and, at the end, a report card. */
export function InternOverview({ program, userId, tasks, submissions, now }: Props) {
  const mine = tasksFor(tasks, userId);
  const subs = submissions.filter((s) => s.user_id === userId);
  const byTask = new Map(subs.map((s) => [s.task_id, s]));
  const perf = performanceFor(mine, subs, now);
  const status = programStatus(program.start_date, program.end_date, now);

  const rows = mine.map((task) => ({
    task,
    sub: byTask.get(task.id),
    state: taskState(task, byTask.get(task.id), now),
  }));
  const overdue = rows.filter((r) => r.state === "overdue");
  const open = rows.filter((r) => r.state === "todo" || r.state === "in-progress");
  const done = rows
    .filter((r) => r.state === "done" || r.state === "done-late")
    .sort((a, b) => (b.sub?.submitted_at ?? "").localeCompare(a.sub?.submitted_at ?? ""));
  const next = open[0];

  return (
    <>
      <AdminPageHeader
        eyebrow="Internship"
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
      />

      <div className="grid grid-cols-1 gap-8 p-5 sm:p-8">
        {status === "ended" ? (
          <ReportCard perf={perf} />
        ) : (
          <section aria-labelledby="progress-title" className="rounded-xl border bg-white p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-dark uppercase">
                  Your progress
                </p>
                <h2 id="progress-title" className="mt-1 font-serif text-3xl font-semibold text-ink">
                  {perf.completed} of {perf.total} tasks completed
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-ink tabular-nums">{perf.remaining}</span>{" "}
                {perf.remaining === 1 ? "task" : "tasks"} remaining
              </p>
            </div>
            <ProgressBar value={perf.rate} className="mt-5 h-2.5" />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="On time" value={perf.onTime} />
              <Stat label="Late" value={perf.late} />
              <Stat label="Missed" value={perf.missed} hint="Past deadline" />
              <Stat
                label="Next deadline"
                value={next ? relativeTo(next.task.due_at, now) : "—"}
                hint={next ? next.task.title : "Nothing due"}
                className="[&_p:nth-child(2)]:text-xl [&_p:nth-child(3)]:truncate"
              />
            </div>
          </section>
        )}

        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white px-6 py-14 text-center text-sm text-muted-foreground">
            No tasks yet. Your coordinator will add them here, so check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {overdue.length > 0 && (
              <TaskGroup title="Overdue" rows={overdue} now={now} programId={program.id} />
            )}
            {open.length > 0 && (
              <TaskGroup title="To do" rows={open} now={now} programId={program.id} />
            )}
            {done.length > 0 && (
              <TaskGroup title="Completed" rows={done} now={now} programId={program.id} />
            )}
          </div>
        )}

        {program.description && (
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-serif text-xl font-semibold text-ink">About this internship</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {program.description}
            </p>
          </section>
        )}
      </div>
    </>
  );
}

function ReportCard({ perf }: { perf: Performance }) {
  return (
    <section
      aria-labelledby="report-title"
      className="relative overflow-hidden rounded-xl border bg-white"
    >
      <div className="h-[3px] gold-gradient" />
      <div className="flex flex-col items-center gap-8 p-6 sm:p-8 md:flex-row">
        <RateRing rate={perf.rate} />
        <div className="flex-1 text-center md:text-left">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] text-gold-dark uppercase">
            <Award className="size-3.5" /> Internship complete · Your performance
          </p>
          <h2 id="report-title" className="mt-2 font-serif text-4xl font-semibold text-ink">
            {perf.grade}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You completed <span className="font-semibold text-ink">{perf.completed}</span> of{" "}
            <span className="font-semibold text-ink">{perf.total}</span> tasks in this internship.
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["On time", perf.onTime],
              ["Late", perf.late],
              ["Not submitted", perf.missed],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-paper px-3 py-3 text-center">
                <dd className="font-serif text-3xl font-semibold text-ink tabular-nums">{value}</dd>
                <dt className="text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function TaskGroup({
  title,
  rows,
  now,
  programId,
}: {
  title: string;
  rows: { task: Task; sub?: Submission; state: TaskState }[];
  now: number;
  programId: string;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums">
          {rows.length}
        </span>
      </h2>
      <ul className="grid grid-cols-1 gap-2">
        {rows.map(({ task, sub, state }) => (
          <li key={task.id}>
            <Link
              href={`/portal/programs/${programId}/tasks/${task.id}`}
              className={cn(
                "group flex items-center gap-4 rounded-lg border bg-white px-4 py-4 transition-colors hover:border-foreground/25 sm:px-5",
                state === "overdue" && "border-destructive/25",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-gold-dark uppercase">
                    {task.kind}
                  </span>
                  <TaskStateBadge state={state} />
                  {sub?.feedback && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MessageSquareText className="size-3" /> Feedback
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-serif text-xl font-semibold text-ink">
                  {task.title}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {sub?.status === "submitted" && sub.submitted_at
                    ? `Completed ${formatDateTime(sub.submitted_at)}`
                    : `Due ${formatDateTime(task.due_at)} · ${relativeTo(task.due_at, now)}`}
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
