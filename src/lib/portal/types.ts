import { z } from "zod";

export type ProgramRole = "admin" | "intern";
/** What the signed-in user can do in a programme. The president acts as an admin everywhere. */
export type Access = "president" | "admin" | "intern";

export type Program = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

export type Member = {
  program_id: string;
  user_id: string;
  role: ProgramRole;
  full_name: string;
  email: string;
  joined_at: string;
};

export type Invite = {
  id: string;
  program_id: string;
  token: string;
  role: ProgramRole;
  label: string;
  expires_at: string;
  max_uses: number | null;
  uses: number;
  revoked: boolean;
  created_at: string;
};

export type TaskMode = "text" | "file" | "both";

export type Task = {
  id: string;
  program_id: string;
  title: string;
  kind: string;
  instructions: string;
  mode: TaskMode;
  due_at: string;
  assignees: string[] | null;
  created_at: string;
};

export type Attachment = { path: string; name: string; size: number };

export type Submission = {
  id: string;
  task_id: string;
  program_id: string;
  user_id: string;
  title: string;
  content: unknown;
  content_text: string;
  attachments: Attachment[];
  status: "draft" | "submitted";
  submitted_at: string | null;
  feedback: string;
  reviewed_at: string | null;
  updated_at: string;
};

const str = z.string().trim();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

export const programInputSchema = z
  .object({
    title: str.min(1, "Give the internship a name").max(200),
    description: str.max(2000).default(""),
    start_date: isoDate,
    end_date: isoDate,
  })
  .refine((p) => p.end_date >= p.start_date, {
    message: "The end date can't be before the start date",
    path: ["end_date"],
  });

export const taskModes = ["text", "file", "both"] as const;

export const modeLabels: Record<TaskMode, string> = {
  text: "Write in the editor",
  file: "Upload a file",
  both: "Write or upload",
};

export const TASK_KINDS = [
  "Article",
  "Research paper",
  "Case comment",
  "Blog post",
  "Legal drafting",
  "Case summary",
  "Presentation",
  "Report",
];

export const taskInputSchema = z.object({
  title: str.min(1, "Give the task a title").max(200),
  kind: str.min(1).max(60).default("Article"),
  instructions: str.max(5000).default(""),
  mode: z.enum(taskModes),
  due_at: z.iso.datetime({ offset: true, message: "Pick a valid deadline" }),
  assignees: z.array(z.uuid()).min(1, "Pick at least one intern").nullable(),
});

export const inviteInputSchema = z.object({
  role: z.enum(["admin", "intern"]),
  label: str.max(80).default(""),
  expires_at: z.iso.datetime({ offset: true, message: "Pick a valid expiry" }),
  max_uses: z.number().int().positive().max(1000).nullable(),
});

const attachmentSchema = z.object({
  path: z.string().min(1).max(400),
  name: z.string().min(1).max(200),
  size: z.number().int().nonnegative(),
});

export const MAX_ATTACHMENTS = 5;

export const workInputSchema = z.object({
  title: str.max(250).default(""),
  content: z.unknown(),
  content_text: z.string().max(200_000).default(""),
  attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS),
});

export type WorkInput = z.infer<typeof workInputSchema>;
