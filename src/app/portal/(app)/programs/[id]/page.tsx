import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getProgram, getProgramData } from "@/lib/portal/data";
import { accessTo, canManage, requestTime, requirePortalSession } from "@/lib/portal/session";
import { ProgramAdmin } from "@/components/portal/program-admin";
import { InternOverview } from "@/components/portal/intern-overview";
import { PageFallback } from "@/components/portal/bits";

export const metadata: Metadata = { title: "Internship" };

export default function ProgramPage({ params }: PageProps<"/portal/programs/[id]">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Program params={params} />
    </Suspense>
  );
}

async function Program({ params }: Pick<PageProps<"/portal/programs/[id]">, "params">) {
  const { id } = await params;
  const session = await requirePortalSession();
  const access = accessTo(session, id);
  if (!access) notFound();
  const program = await getProgram(session, id);
  if (!program) notFound();

  const manage = canManage(access);
  const data = await getProgramData(session, id, manage);
  const now = await requestTime();

  if (!manage) {
    return <InternOverview program={program} userId={session.user.id} {...data} now={now} />;
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <ProgramAdmin
      program={program}
      access={access}
      currentUserId={session.user.id}
      origin={`${proto}://${host}`}
      now={now}
      {...data}
    />
  );
}
