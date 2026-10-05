import { Suspense } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

import { getContent } from "@/lib/content/queries";
import { portalSignOut } from "@/lib/portal/auth-actions";
import { listPrograms } from "@/lib/portal/data";
import { accessTo, requirePortalSession } from "@/lib/portal/session";
import { PortalSidebar, type SidebarProgram } from "@/components/portal/sidebar";
import { Button } from "@/components/ui/button";

export default function PortalAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}

async function PortalShell({ children }: { children: React.ReactNode }) {
  const session = await requirePortalSession();
  if (!session.isPresident && session.memberships.length === 0) {
    return <NoAccess email={session.user.email} />;
  }

  const [{ site }, { programs }] = await Promise.all([getContent(), listPrograms(session)]);
  const nav: SidebarProgram[] = programs.flatMap((p) => {
    const access = accessTo(session, p.id);
    return access ? [{ id: p.id, title: p.title, access }] : [];
  });

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <PortalSidebar
        email={session.user.email}
        logo={site.logo}
        isPresident={session.isPresident}
        programs={nav}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function NoAccess({ email }: { email: string }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-gold" strokeWidth={1.5} />
        <h1 className="mt-4 text-3xl font-semibold text-ink">Not part of an internship</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-ink">{email}</span> isn&apos;t enrolled in any
          internship yet, or was removed from one. Open the invite link your coordinator sent you to
          join.
        </p>
        <form action={portalSignOut} className="mt-6">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}

function ShellFallback() {
  return (
    <div className="grid min-h-dvh place-items-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="Loading portal" />
    </div>
  );
}
