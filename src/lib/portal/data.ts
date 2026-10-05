import "server-only";

import type { PortalSession } from "./session";
import type { Attachment, Invite, Member, Program, Submission, Task } from "./types";

export const INTERNSHIP_BUCKET = "internship-files";

const TASK_COLUMNS =
  "id, program_id, title, kind, instructions, mode, due_at, assignees, created_at";
const SUBMISSION_COLUMNS =
  "id, task_id, program_id, user_id, title, content, content_text, attachments, status, submitted_at, feedback, reviewed_at, updated_at";

/** Programmes the user can see (all of them for the president), soonest-ending last. */
export async function listPrograms(session: PortalSession) {
  const { data, error } = await session.supabase
    .from("internship_programs")
    .select("id, title, description, start_date, end_date")
    .order("start_date", { ascending: false });
  return { programs: (data ?? []) as Program[], error: error?.message };
}

export async function getProgram(session: PortalSession, id: string) {
  const { data } = await session.supabase
    .from("internship_programs")
    .select("id, title, description, start_date, end_date")
    .eq("id", id)
    .maybeSingle();
  return (data as Program | null) ?? null;
}

/** Everything a programme admin needs. RLS limits interns to their own rows anyway. */
export async function getProgramData(session: PortalSession, programId: string, manage: boolean) {
  const sb = session.supabase;
  const [members, tasks, submissions, invites] = await Promise.all([
    sb
      .from("internship_members")
      .select("program_id, user_id, role, full_name, email, joined_at")
      .eq("program_id", programId)
      .order("joined_at"),
    sb.from("internship_tasks").select(TASK_COLUMNS).eq("program_id", programId).order("due_at"),
    sb.from("internship_submissions").select(SUBMISSION_COLUMNS).eq("program_id", programId),
    manage
      ? sb
          .from("internship_invites")
          .select(
            "id, program_id, token, role, label, expires_at, max_uses, uses, revoked, created_at",
          )
          .eq("program_id", programId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  return {
    members: (members.data ?? []) as Member[],
    tasks: (tasks.data ?? []) as Task[],
    submissions: (submissions.data ?? []) as Submission[],
    invites: (invites.data ?? []) as Invite[],
  };
}

export async function getTask(session: PortalSession, taskId: string) {
  const { data } = await session.supabase
    .from("internship_tasks")
    .select(TASK_COLUMNS)
    .eq("id", taskId)
    .maybeSingle();
  return (data as Task | null) ?? null;
}

export async function getSubmission(
  session: PortalSession,
  filter: { id?: string; taskId?: string; userId?: string },
) {
  let q = session.supabase.from("internship_submissions").select(SUBMISSION_COLUMNS);
  if (filter.id) q = q.eq("id", filter.id);
  if (filter.taskId) q = q.eq("task_id", filter.taskId);
  if (filter.userId) q = q.eq("user_id", filter.userId);
  const { data } = await q.maybeSingle();
  return (data as Submission | null) ?? null;
}

/** Short-lived download links for private uploads (RLS decides who may read them). */
export async function signAttachments(session: PortalSession, attachments: Attachment[]) {
  if (attachments.length === 0) return [];
  const { data } = await session.supabase.storage.from(INTERNSHIP_BUCKET).createSignedUrls(
    attachments.map((a) => a.path),
    60 * 60,
    // Download with the original file name.
  );
  return attachments.map((a, i) => ({ ...a, url: data?.[i]?.signedUrl ?? "" }));
}

/** Light rows across every visible programme, for the portal home cards. */
export async function getOverview(session: PortalSession) {
  const sb = session.supabase;
  const [members, tasks, submissions] = await Promise.all([
    sb.from("internship_members").select("program_id, user_id, role"),
    sb.from("internship_tasks").select(TASK_COLUMNS),
    sb
      .from("internship_submissions")
      .select("id, task_id, program_id, user_id, status, submitted_at, reviewed_at"),
  ]);
  return {
    members: (members.data ?? []) as Pick<Member, "program_id" | "user_id" | "role">[],
    tasks: (tasks.data ?? []) as Task[],
    submissions: (submissions.data ?? []) as Submission[],
  };
}
