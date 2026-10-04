import { ShieldAlert } from "lucide-react";

import { signOut } from "@/lib/admin/auth-actions";
import { Button } from "@/components/ui/button";

export function NotAuthorized({ email }: { email: string }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-gold" strokeWidth={1.5} />
        <h1 className="mt-4 text-3xl font-semibold text-ink">No dashboard access</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-ink">{email}</span> is signed in but isn&apos;t listed
          as an administrator. Add it to the <code>admins</code> table in Supabase, then sign in
          again.
        </p>
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
