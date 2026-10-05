import type { Submission, Task } from "./types";

export type TaskState = "done" | "done-late" | "in-progress" | "todo" | "overdue";

/** Where one intern stands on one task at `now`. */
export function taskState(task: Task, submission: Submission | undefined, now: number): TaskState {
  if (submission?.status === "submitted" && submission.submitted_at) {
    return new Date(submission.submitted_at).getTime() <= new Date(task.due_at).getTime()
      ? "done"
      : "done-late";
  }
  if (new Date(task.due_at).getTime() < now) return "overdue";
  return submission ? "in-progress" : "todo";
}

export type Performance = {
  total: number;
  completed: number;
  onTime: number;
  late: number;
  missed: number;
  remaining: number;
  rate: number;
  grade: string;
};

export function gradeFor(rate: number) {
  if (rate >= 90) return "Outstanding";
  if (rate >= 75) return "Very good";
  if (rate >= 50) return "Good";
  if (rate > 0) return "Needs improvement";
  return "Not started";
}

/** Totals for one intern across the tasks assigned to them. */
export function performanceFor(tasks: Task[], submissions: Submission[], now: number): Performance {
  const byTask = new Map(submissions.map((s) => [s.task_id, s]));
  let onTime = 0;
  let late = 0;
  let missed = 0;
  for (const t of tasks) {
    const state = taskState(t, byTask.get(t.id), now);
    if (state === "done") onTime++;
    else if (state === "done-late") late++;
    else if (state === "overdue") missed++;
  }
  const completed = onTime + late;
  const total = tasks.length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  return {
    total,
    completed,
    onTime,
    late,
    missed,
    remaining: total - completed,
    rate,
    grade: gradeFor(rate),
  };
}

/** Tasks that apply to an intern (given to everyone, or to them specifically). */
export const tasksFor = (tasks: Task[], userId: string) =>
  tasks.filter((t) => !t.assignees || t.assignees.includes(userId));

/** True once the programme's last day (India time) has passed. */
export function programEnded(endDate: string, now: number) {
  return new Date(`${endDate}T23:59:59+05:30`).getTime() < now;
}

export type ProgramStatus = "upcoming" | "ongoing" | "ended";

export function programStatus(startDate: string, endDate: string, now: number): ProgramStatus {
  if (programEnded(endDate, now)) return "ended";
  return new Date(`${startDate}T00:00:00+05:30`).getTime() > now ? "upcoming" : "ongoing";
}

export const programStatusLabel: Record<ProgramStatus, string> = {
  upcoming: "Starts soon",
  ongoing: "Ongoing",
  ended: "Completed",
};
