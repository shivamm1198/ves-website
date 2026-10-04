import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Emblem } from "@/components/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-16">
      <div className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-xl border bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)]">
          <div className="h-[3px] gold-gradient" />
          <div className="px-8 pt-10 pb-8 sm:px-10">
            <Emblem className="size-12 text-ink" />
            <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-gold-dark uppercase">
              Vidhi Ekta Sangh
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">President&apos;s dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage the homepage, events and gallery.
            </p>
            {isSupabaseConfigured ? (
              <LoginForm />
            ) : (
              <div className="mt-8 rounded-lg border border-dashed bg-paper p-5 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-ink">Supabase isn&apos;t connected yet.</p>
                <p className="mt-2">
                  Add <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                  <code className="text-ink">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to the
                  environment (see <code className="text-ink">SUPABASE_SETUP.md</code>), then
                  restart the site.
                </p>
              </div>
            )}
          </div>
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Back to the website
        </Link>
      </div>
    </main>
  );
}
