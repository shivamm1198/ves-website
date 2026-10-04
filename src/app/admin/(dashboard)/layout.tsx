import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { requireAdminPage } from "@/lib/content/admin";
import { AdminSidebar } from "@/components/admin/sidebar";
import { NotAuthorized } from "@/components/admin/not-authorized";

export default function DashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await requireAdminPage();
  if (!isAdmin) return <NotAuthorized email={user!.email} />;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar email={user!.email} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ShellFallback() {
  return (
    <div className="grid min-h-dvh place-items-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="Loading dashboard" />
    </div>
  );
}
