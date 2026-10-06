import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, FileText, Paperclip } from "lucide-react";

import { formatBytes, formatDateTime } from "@/lib/portal/format";
import { getProgram, getSubmission, getTask, signAttachments } from "@/lib/portal/data";
import { taskState } from "@/lib/portal/progress";
import { accessTo, canManage, requestTime, requirePortalSession } from "@/lib/portal/session";
import type { Member } from "@/lib/portal/types";
import { PageFallback, TaskStateBadge } from "@/components/portal/bits";
import { ReviewForm } from "@/components/portal/review-form";
import { RichViewer } from "@/components/portal/rich-editor";

export const metadata: Metadata = { title: "Review" };

type Params = Promise<{
  id: string;
  submissionId: string;
}>;

export default function SubmissionPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Review params={params} />
    </Suspense>
  );
}

async function Review({ params }: { params: Params }) {
  const { id, submissionId } = await params;//Property 'submissionId' does not exist on type 'unknown'. Property 'id' does not exist on type 'unknown'.
  const session = await requirePortalSession();
  if (!canManage(accessTo(session, id))) notFound();

  const submission = await getSubmission(session, { id: submissionId });
  if (!submission || submission.program_id !== id) notFound();
  const [program, task, member, files] = await Promise.all([
    getProgram(session, id),
    getTask(session, submission.task_id),
    session.supabase
      .from("internship_members")
      .select("full_name, email")
      .eq("program_id", id)
      .eq("user_id", submission.user_id)
      .maybeSingle<Pick<Member, "full_name" | "email">>(),
    signAttachments(session, submission.attachments),
  ]);
  if (!program || !task) notFound();

  const name = member.data?.full_name || member.data?.email || "Former intern";
  const state = taskState(task, submission, await requestTime());
  const submitted = submission.status === "submitted";

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b">
        <div className="mx-auto max-w-3xl px-5 pt-6 pb-7 sm:px-8">
          <Link
            href={`/portal/programs/${id}/tasks/${task.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
          >
            <ArrowLeft className="size-4" /> {task.title}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-dark uppercase">
              {task.kind} · {program.title}
            </span>
            <TaskStateBadge state={state} />
          </div>
          <h1 className="mt-2 text-4xl font-semibold text-ink">{name}</h1>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {member.data?.email && <span>{member.data.email}</span>}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-gold" />
              {submitted && submission.submitted_at
                ? `Completed ${formatDateTime(submission.submitted_at)} · due ${formatDateTime(task.due_at)}`
                : `Draft, not completed yet · last edited ${formatDateTime(submission.updated_at)}`}
            </span>
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-3xl gap-8 px-5 py-8 sm:px-8">
        <article>
          {submission.title && (
            <h2 className="font-serif text-4xl font-semibold text-ink">{submission.title}</h2>
          )}
          {submission.content_text.trim() ? (
            <div className="mt-4">
              <RichViewer content={submission.content} />
            </div>
          ) : (
            files.length === 0 && (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Nothing written yet.
              </p>
            )
          )}
        </article>

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

        <ReviewForm
          submissionId={submission.id}
          submitted={submitted}
          feedback={submission.feedback}
          reviewedAt={submission.reviewed_at}
        />
      </div>
    </div>
  );
}
