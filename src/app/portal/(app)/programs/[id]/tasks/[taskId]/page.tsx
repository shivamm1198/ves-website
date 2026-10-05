import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getProgram, getProgramData, getTask, signAttachments } from "@/lib/portal/data";
import { performanceFor, tasksFor } from "@/lib/portal/progress";
import { accessTo, canManage, requestTime, requirePortalSession } from "@/lib/portal/session";
import { PageFallback } from "@/components/portal/bits";
import { TaskSubmissions } from "@/components/portal/task-submissions";
import { WorkArea } from "@/components/portal/work-area";

export const metadata: Metadata = { title: "Task" };

type Params = PageProps<"/portal/programs/[id]/tasks/[taskId]">["params"];

export default function TaskPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <TaskView params={params} />
    </Suspense>
  );
}

async function TaskView({ params }: { params: Params }) {
  const { id, taskId } = await params;
  const session = await requirePortalSession();
  const access = accessTo(session, id);
  if (!access) notFound();
  const [program, task] = await Promise.all([getProgram(session, id), getTask(session, taskId)]);
  if (!program || !task || task.program_id !== id) notFound();

  const manage = canManage(access);
  const data = await getProgramData(session, id, false);
  const now = await requestTime();

  if (manage) {
    return <TaskSubmissions program={program} task={task} {...data} now={now} />;
  }

  const mine = data.submissions.filter((s) => s.user_id === session.user.id);
  const submission = mine.find((s) => s.task_id === task.id) ?? null;
  const perf = performanceFor(tasksFor(data.tasks, session.user.id), mine, now);
  const files = await signAttachments(session, submission?.attachments ?? []);

  return (
    <WorkArea
      key={submission?.status === "submitted" ? "done" : "work"}
      program={program}
      task={task}
      userId={session.user.id}
      submission={submission}
      files={files}
      remaining={perf.remaining}
      now={now}
    />
  );
}
