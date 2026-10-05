import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Site } from "@/lib/content/schema";
import { BrandMark } from "@/components/logo";

/** Centered card used by the portal's sign-in and join pages. */
export function AuthCard({
  site,
  eyebrow,
  title,
  description,
  children,
}: {
  site: Pick<Site, "name" | "logo">;
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-16">
      <div className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-xl border bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.45)]">
          <div className="h-[3px] gold-gradient" />
          <div className="px-8 pt-10 pb-8 sm:px-10">
            <BrandMark logo={site.logo} name={site.name} className="size-12" />
            <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-gold-dark uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">{title}</h1>
            {description && <div className="mt-2 text-sm text-muted-foreground">{description}</div>}
            {children}
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
