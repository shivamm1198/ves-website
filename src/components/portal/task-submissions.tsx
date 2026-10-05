import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  FileText,
  MessageSquareText,
  Paperclip,
  Users,
} from "lucide-react";

import { formatDateTime, relativeTo } from "@/lib/portal/format";
import { taskState } from "@/lib/portal/progress";
import {
  modeLabels,
  type Member,
  type Program,
  type Submission,
  type Task,
} from "@/lib/portal/types";
import { ProgressBar, TaskStateBadge } from "@/components/portal/bits";

/** Coordinator view of one task: who has completed it, and links to review each piece. */
export function TaskSubmissions({
  program,
  task,
  members,
  submissions,
  now,
}: {
  program: Program;
  task: Task;
  members: Member[];
  submissions: Submission[];
  now: number;
}) {
  const interns = members.filter(
    (m) => m.role === "intern" && (!task.assignees || task.assignees.includes(m.user_id)),
  );
  const rows = interns
    .map((m) => {
      const sub = submissions.find((s) => s.task_id === task.id && s.user_id === m.user_id);
      return { m, sub, state: taskState(task, sub, now) };
    })
    .sort((a, b) => order(a.state) - order(b.state));
  const completed = rows.filter((r) => r.sub?.status === "submitted").length;

  return (
    <>
      <header className="border-b bg-white">
        <div className="px-5 pt-6 pb-7 sm:px-8">
          <Link
            href={`/portal/programs/${program.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
          >
            <ArrowLeft className="size-4" /> {program.title}
          </Link>
          <p className="mt-5 text-[11px] font-semibold tracking-[0.18em] text-gold-dark uppercase">
            {task.kind}
          </p>
          <h1 className="mt-1 text-4xl font-semibold text-ink">{task.title}</h1>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-gold" /> Due {formatDateTime(task.due_at)} ·{" "}
              {relativeTo(task.due_at, now)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-4 text-gold" /> {modeLabels[task.mode]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-gold" />
              {task.assignees ? "Selected interns" : "All interns"}
            </span>
          </p>
          {task.instructions && (
            <div className="mt-5 max-w-3xl rounded-lg border-l-2 border-gold bg-paper px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-foreground/80">
              {task.instructions}
            </div>
          )}
        </div>
      </header>

      <div className="p-5 sm:p-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Submissions
          </h2>
          <div className="flex items-center gap-3 sm:w-72">
            <span className="text-sm whitespace-nowrap text-ink tabular-nums">
              {completed} of {rows.length} completed
            </span>
            <ProgressBar
              value={rows.length ? (completed / rows.length) * 100 : 0}
              className="flex-1"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white px-6 py-12 text-center text-sm text-muted-foreground">
            No interns are assigned to this task yet.
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-white">
            {rows.map(({ m, sub, state }) => {
              const content = (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {m.full_name || m.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {sub?.status === "submitted" && sub.submitted_at
                        ? `Completed ${formatDateTime(sub.submitted_at)}`
                        : sub
                          ? `Draft · last edited ${formatDateTime(sub.updated_at)}`
                          : "Not started"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {sub && sub.attachments.length > 0 && (
                      <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                        <Paperclip className="size-3.5" /> {sub.attachments.length}
                      </span>
                    )}
                    {sub?.reviewed_at && (
                      <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                        <MessageSquareText className="size-3.5" /> Reviewed
                      </span>
                    )}
                    {sub?.status === "submitted" && !sub.reviewed_at && (
                      <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">
                        To review
                      </span>
                    )}
                    <TaskStateBadge state={state} />
                  </div>
                </>
              );
              return (
                <li key={m.user_id}>
                  {sub ? (
                    <Link
                      href={`/portal/programs/${program.id}/submissions/${sub.id}`}
                      className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-paper/70 sm:px-5"
                    >
                      {content}
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 px-4 py-4 pr-12 sm:px-5 sm:pr-13">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

const order = (state: ReturnType<typeof taskState>) =>
  ({ done: 1, "done-late": 1, "in-progress": 2, overdue: 3, todo: 4 })[state];
