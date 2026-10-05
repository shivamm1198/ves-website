import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { getContent } from "@/lib/content/queries";
import { formatDateTime } from "@/lib/portal/format";
import { getPortalSession } from "@/lib/portal/session";
import { AuthCard } from "@/components/portal/auth-card";
import { JoinForms } from "@/components/portal/auth-forms";

export const metadata: Metadata = { title: "Join an internship" };

export default async function JoinPage({ params }: PageProps<"/portal/join/[token]">) {
  const { site } = await getContent();
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <Join params={params} site={site} />
    </Suspense>
  );
}

type Preview = {
  program_title: string;
  role: "admin" | "intern";
  expires_at: string;
  usable: boolean;
};

async function Join({
  params,
  site,
}: Pick<PageProps<"/portal/join/[token]">, "params"> & {
  site: Awaited<ReturnType<typeof getContent>>["site"];
}) {
  const { token } = await params;
  const session = await getPortalSession();
  const supabase = session?.supabase ?? (await import("@/lib/supabase/server")).createClient();
  const { data } = await (await supabase).rpc("invite_preview", { invite_token: token });
  const invite = ((data ?? []) as Preview[])[0];

  if (!invite || !invite.usable) {
    return (
      <AuthCard
        site={site}
        eyebrow="Invite link"
        title={invite ? "This link has expired" : "Link not found"}
        description={
          invite
            ? "Ask your internship coordinator for a new invite link."
            : "Check that you copied the whole link, or ask for a new one."
        }
      >
        <a
          href="/portal/login"
          className="mt-8 inline-block text-sm font-medium text-ink underline underline-offset-4"
        >
          Already joined? Sign in
        </a>
      </AuthCard>
    );
  }

  const roleLabel = invite.role === "admin" ? "internship admin" : "an intern";
  return (
    <AuthCard
      site={site}
      eyebrow="You're invited"
      title={invite.program_title}
      description={
        <>
          Join as <span className="font-medium text-ink">{roleLabel}</span>. This link works until{" "}
          {formatDateTime(invite.expires_at)}.
        </>
      }
    >
      <JoinForms
        token={token}
        signedInAs={session?.user.email ?? null}
        roleLabel={invite.role === "admin" ? "admin" : "intern"}
      />
    </AuthCard>
  );
}
