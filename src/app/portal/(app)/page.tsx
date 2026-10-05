import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, Inbox, Users } from "lucide-react";

import { formatDate } from "@/lib/portal/format";
import { getOverview, listPrograms } from "@/lib/portal/data";
import { performanceFor, programStatus, tasksFor } from "@/lib/portal/progress";
import { accessTo, canManage, requestTime, requirePortalSession } from "@/lib/portal/session";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorNote } from "@/components/admin/events-manager";
import { ProgramStatusBadge, ProgressBar } from "@/components/portal/bits";
import { NewProgramButton, ProgramCardMenu } from "@/components/portal/program-actions";

export const metadata: Metadata = { title: "Internships" };

export default async function PortalHome() {
  const session = await requirePortalSession();
  const [{ programs, error }, overview] = await Promise.all([
    listPrograms(session),
    getOverview(session),
  ]);
  const now = await requestTime();
  const firstName = session.memberships.find((m) => m.full_name)?.full_name.split(" ")[0];

  return (
    <>
      <AdminPageHeader
        eyebrow="Internship portal"
        title={
          session.isPresident
            ? "All internships"
            : firstName
              ? `Hello, ${firstName}`
              : "My internships"
        }
        description={
          session.isPresident
            ? "Create internships, appoint a coordinator for each, and follow every intern's progress."
            : "Your internships, tasks and progress in one place."
        }
        actions={session.isPresident ? <NewProgramButton /> : undefined}
      />

      <div className="p-5 sm:p-8">
        {error && <ErrorNote message={`Couldn't load internships: ${error}`} />}

        {programs.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white px-6 py-16 text-center">
            <ClipboardList className="mx-auto size-10 text-gold" strokeWidth={1.4} />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-ink">No internships yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {session.isPresident
                ? "Create the first internship, then invite a coordinator and interns with a link."
                : "You'll see your internship here once you've joined it."}
            </p>
            {session.isPresident && (
              <div className="mt-6">
                <NewProgramButton />
              </div>
            )}
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {programs.map((program) => {
              const access = accessTo(session, program.id);
              if (!access) return null;
              const status = programStatus(program.start_date, program.end_date, now);
              const tasks = overview.tasks.filter((t) => t.program_id === program.id);
              const subs = overview.submissions.filter((s) => s.program_id === program.id);
              const manage = canManage(access);

              return (
                <li
                  key={program.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-[0_20px_50px_-35px_rgba(0,0,0,0.5)]"
                >
                  <div className="h-[3px] gold-gradient opacity-70" />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <ProgramStatusBadge status={status} />
                        {access === "admin" && (
                          <span className="text-[11px] font-medium text-gold-dark">
                            Coordinator
                          </span>
                        )}
                      </div>
                      {session.isPresident && <ProgramCardMenu program={program} />}
                    </div>
                    <h2 className="mt-3 font-serif text-2xl leading-tight font-semibold text-ink">
                      <Link
                        href={`/portal/programs/${program.id}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {program.title}
                      </Link>
                    </h2>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5 text-gold" />
                      {formatDate(program.start_date)} – {formatDate(program.end_date)}
                    </p>
                    {program.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {program.description}
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      {manage ? (
                        <ManagerSummary
                          interns={
                            overview.members.filter(
                              (m) => m.program_id === program.id && m.role === "intern",
                            ).length
                          }
                          tasks={tasks.length}
                          toReview={
                            subs.filter((s) => s.status === "submitted" && !s.reviewed_at).length
                          }
                        />
                      ) : (
                        <InternSummary
                          {...performanceFor(
                            tasksFor(tasks, session.user.id),
                            subs.filter((s) => s.user_id === session.user.id),
                            now,
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t bg-paper/60 px-6 py-3 text-sm font-medium text-ink">
                    {manage ? "Manage internship" : "Open my tasks"}
                    <ArrowRight className="size-4 text-gold-dark transition-transform group-hover:translate-x-1" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function ManagerSummary({
  interns,
  tasks,
  toReview,
}: {
  interns: number;
  tasks: number;
  toReview: number;
}) {
  const items = [
    { Icon: Users, value: interns, label: interns === 1 ? "intern" : "interns" },
    { Icon: ClipboardList, value: tasks, label: tasks === 1 ? "task" : "tasks" },
    { Icon: Inbox, value: toReview, label: "to review" },
  ];
  return (
    <dl className="grid grid-cols-3 gap-2 text-center">
      {items.map(({ Icon, value, label }) => (
        <div key={label} className="rounded-md bg-paper px-2 py-2.5">
          <dt className="sr-only">{label}</dt>
          <dd>
            <span className="flex items-center justify-center gap-1.5 font-serif text-2xl font-semibold text-ink tabular-nums">
              <Icon className="size-4 text-gold" />
              {value}
            </span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function InternSummary({
  completed,
  total,
  remaining,
  rate,
}: {
  completed: number;
  total: number;
  remaining: number;
  rate: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-ink tabular-nums">
          {completed} of {total} tasks completed
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">{remaining} remaining</span>
      </div>
      <ProgressBar value={rate} className="mt-2" />
    </div>
  );
}
