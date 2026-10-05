import type { Metadata } from "next";
import { Suspense } from "react";

import { getContent } from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AuthCard } from "@/components/portal/auth-card";
import { PortalLoginForm } from "@/components/portal/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function PortalLoginPage({ searchParams }: PageProps<"/portal/login">) {
  const { site } = await getContent();
  return (
    <AuthCard
      site={site}
      eyebrow={site.name}
      title="Internship portal"
      description="For interns and internship coordinators. New here? Open the invite link you were sent."
    >
      {isSupabaseConfigured ? (
        <Suspense fallback={<PortalLoginForm />}>
          <LoginWithParams searchParams={searchParams} />
        </Suspense>
      ) : (
        <p className="mt-8 rounded-lg border border-dashed bg-paper p-5 text-sm text-muted-foreground">
          Supabase isn&apos;t connected yet.
        </p>
      )}
    </AuthCard>
  );
}

async function LoginWithParams({ searchParams }: Pick<PageProps<"/portal/login">, "searchParams">) {
  const { next, error } = await searchParams;
  return (
    <PortalLoginForm
      next={typeof next === "string" ? next : undefined}
      linkError={error === "link"}
    />
  );
}
