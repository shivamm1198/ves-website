import Link from "next/link";

import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/supabase/env";
import { Photo } from "@/components/photo";
import type { Site } from "@/lib/content/schema";

export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("size-10", className)}>
      <circle cx="24" cy="24" r="23" fill="currentColor" />
      <circle cx="24" cy="24" r="19.5" fill="none" stroke="var(--gold-light)" strokeWidth="0.8" />
      <g
        fill="none"
        stroke="var(--background)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 12v23" />
        <path d="M17 35h14" />
        <path d="M14 17h20" />
        <path d="M24 12.5l-1.5 1.5h3z" fill="var(--background)" />
        <path d="M14.5 17l-3.5 8a3.8 3.8 0 0 0 7 0z" />
        <path d="M33.5 17l-3.5 8a3.8 3.8 0 0 0 7 0z" />
      </g>
    </svg>
  );
}

export function Logo({
  site,
  inverse = false,
  className,
}: {
  site: Pick<Site, "name" | "hindi" | "logo">;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label={`${site.name} — home`}
    >
      <BrandMark logo={site.logo} name={site.name} inverse={inverse} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-[1.35rem] font-semibold tracking-tight",
            inverse ? "text-white" : "text-ink",
          )}
        >
          {site.name}
        </span>
        <span
          className={cn(
            "mt-1 font-serif text-[13px] leading-none",
            inverse ? "text-gold-light" : "text-gold-dark",
          )}
        >
          {site.hindi}
        </span>
      </span>
    </Link>
  );
}

/**
 * The organisation's uploaded logo, or the built-in emblem when none is set.
 * On dark backgrounds the logo sits on a white disc so dark artwork stays visible.
 */
export function BrandMark({
  logo,
  name,
  inverse = false,
  className,
}: {
  logo?: string;
  name: string;
  inverse?: boolean;
  className?: string;
}) {
  if (!logo) {
    return (
      <Emblem
        className={cn(inverse ? "text-white [--background:#0a0a0a]" : "text-ink", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "relative block size-10 shrink-0 overflow-hidden",
        inverse && "rounded-full bg-white p-1",
        className,
      )}
    >
      <span className="relative block size-full">
        <Photo
          src={mediaUrl(logo)}
          alt={`${name} logo`}
          fill
          sizes="96px"
          className="bg-transparent object-contain"
        />
      </span>
    </span>
  );
}
