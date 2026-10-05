"use server";

import { randomBytes } from "node:crypto";

import { describeIssues } from "@/lib/admin/errors";
import { getPortalSession } from "./session";
import {
  inviteInputSchema,
  programInputSchema,
  taskInputSchema,
  workInputSchema,
  type Task,
} from "./types";

type Result<T = undefined> =
  ({ ok: true } & (T extends undefined ? object : { data: T })) | { ok: false; error: string };

async function session() {
  const s = await getPortalSession();
  if (!s) throw new Error("Your session has expired. Please sign in again.");
  return s;
}

/** Runs an action, turning thrown errors into a friendly result. RLS does the authorising. */
async function guard<R extends { ok: boolean }>(
  fn: () => Promise<R | { ok: false; error: string }>,
): Promise<R | { ok: false; error: string }> {
  try {
    return await fn();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

const denied = (count: number | null, what: string) =>
  count === 0 ? `You don't have permission to change this ${what}.` : null;

/* ---------- Programmes (president) ---------- */

export async function saveProgram(
  id: string | null,
  input: unknown,
): Promise<Result<{ id: string }>> {
  return guard(async () => {
    const s = await session();
    if (!s.isPresident) return { ok: false, error: "Only the president can manage internships." };
    const parsed = programInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };

    if (id) {
      const { error } = await s.supabase
        .from("internship_programs")
        .update(parsed.data)
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
      return { ok: true, data: { id } };
    }
    const { data, error } = await s.supabase
      .from("internship_programs")
      .insert(parsed.data)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: data.id } };
  });
}

export async function deleteProgram(id: string): Promise<Result> {
  return guard(async () => {
    const s = await session();
    const { error, count } = await s.supabase
      .from("internship_programs")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    const msg = denied(count, "internship");
    return msg ? { ok: false, error: msg } : { ok: true };
  });
}

/* ---------- Invite links ---------- */

export async function createInvite(
  programId: string,
  input: unknown,
): Promise<Result<{ token: string }>> {
  return guard(async () => {
    const s = await session();
    const parsed = inviteInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };
    if (new Date(parsed.data.expires_at).getTime() <= Date.now()) {
      return { ok: false, error: "The expiry must be in the future." };
    }
    const token = randomBytes(24).toString("base64url");
    const { error } = await s.supabase.from("internship_invites").insert({
      ...parsed.data,
      program_id: programId,
      token,
      created_by: s.user.id,
    });
    if (error) {
      return {
        ok: false,
        error:
          error.code === "42501" ? "You can't create this kind of invite link." : error.message,
      };
    }
    return { ok: true, data: { token } };
  });
}

export async function revokeInvite(id: string): Promise<Result> {
  return guard(async () => {
    const s = await session();
    const { error, count } = await s.supabase
      .from("internship_invites")
      .update({ revoked: true }, { count: "exact" })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    const msg = denied(count, "invite link");
    return msg ? { ok: false, error: msg } : { ok: true };
  });
}

/* ---------- Members ---------- */

export async function removeMember(programId: string, userId: string): Promise<Result> {
  return guard(async () => {
    const s = await session();
    const { error, count } = await s.supabase
      .from("internship_members")
      .delete({ count: "exact" })
      .eq("program_id", programId)
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    const msg = denied(count, "member");
    return msg ? { ok: false, error: msg } : { ok: true };
  });
}

export async function renameMember(
  programId: string,
  userId: string,
  fullName: string,
): Promise<Result> {
  return guard(async () => {
    const s = await session();
    const name = fullName.trim().slice(0, 120);
    if (!name) return { ok: false, error: "Enter a name." };
    const { error } = await s.supabase
      .from("internship_members")
      .update({ full_name: name })
      .eq("program_id", programId)
      .eq("user_id", userId);
    return error ? { ok: false, error: error.message } : { ok: true };
  });
}

/* ---------- Tasks ---------- */

export async function saveTask(
  programId: string,
  id: string | null,
  input: unknown,
): Promise<Result<{ id: string }>> {
  return guard(async () => {
    const s = await session();
    const parsed = taskInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };
    const row = { ...parsed.data, program_id: programId };

    if (id) {
      const { error, count } = await s.supabase
        .from("internship_tasks")
        .update(row, { count: "exact" })
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
      const msg = denied(count, "task");
      return msg ? { ok: false, error: msg } : { ok: true, data: { id } };
    }
    const { data, error } = await s.supabase
      .from("internship_tasks")
      .insert({ ...row, created_by: s.user.id })
      .select("id")
      .single();
    if (error) {
      return {
        ok: false,
        error: error.code === "42501" ? "You can't add tasks here." : error.message,
      };
    }
    return { ok: true, data: { id: data.id } };
  });
}

export async function deleteTask(id: string): Promise<Result> {
  return guard(async () => {
    const s = await session();
    const { error, count } = await s.supabase
      .from("internship_tasks")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    const msg = denied(count, "task");
    return msg ? { ok: false, error: msg } : { ok: true };
  });
}

/* ---------- Intern work ---------- */

async function writeWork(
  taskId: string,
  input: unknown,
  complete: boolean,
): Promise<Result<{ savedAt: string }>> {
  const s = await session();
  const parsed = workInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };
  if (JSON.stringify(parsed.data.content ?? null).length > 1_000_000) {
    return {
      ok: false,
      error: "This piece is too long to save. Try attaching it as a file instead.",
    };
  }

  if (complete) {
    const { data: task } = await s.supabase
      .from("internship_tasks")
      .select("mode")
      .eq("id", taskId)
      .single<Pick<Task, "mode">>();
    const hasText = parsed.data.content_text.trim().length > 0;
    const hasFile = parsed.data.attachments.length > 0;
    if (task?.mode === "text" && !hasText)
      return { ok: false, error: "Write your answer before completing the task." };
    if (task?.mode === "file" && !hasFile)
      return { ok: false, error: "Upload your file before completing the task." };
    if (task?.mode === "both" && !hasText && !hasFile) {
      return { ok: false, error: "Write something or upload a file before completing the task." };
    }
  }

  const { data, error } = await s.supabase
    .from("internship_submissions")
    .upsert(
      {
        task_id: taskId,
        user_id: s.user.id,
        title: parsed.data.title,
        content: parsed.data.content ?? null,
        content_text: parsed.data.content_text,
        attachments: parsed.data.attachments,
        status: complete ? "submitted" : "draft",
      },
      { onConflict: "task_id,user_id" },
    )
    .select("updated_at")
    .single();
  if (error) {
    return {
      ok: false,
      error:
        error.code === "42501"
          ? "This task is already completed, or isn't assigned to you."
          : error.message,
    };
  }
  return { ok: true, data: { savedAt: data.updated_at } };
}

export async function saveDraft(taskId: string, input: unknown) {
  return guard(() => writeWork(taskId, input, false));
}

export async function completeTask(taskId: string, input: unknown) {
  return guard(() => writeWork(taskId, input, true));
}

/* ---------- Reviews ---------- */

export async function reviewSubmission(
  submissionId: string,
  feedback: string,
  returnForChanges: boolean,
): Promise<Result> {
  return guard(async () => {
    const s = await session();
    const { error } = await s.supabase.rpc("review_submission", {
      submission_id: submissionId,
      review_feedback: feedback.trim().slice(0, 5000),
      return_for_changes: returnForChanges,
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  });
}
