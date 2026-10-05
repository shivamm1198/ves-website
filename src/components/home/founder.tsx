import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import type { Founder, SectionText, SiteImages } from "@/lib/content/schema";
import { FloatingPhoto } from "@/components/floating-photo";
import { initialsOf } from "@/lib/content/derive";
import { Monogram } from "@/components/monogram";
import { Reveal } from "@/components/motion";
import { Eyebrow } from "@/components/section-heading";
import { mediaUrl } from "@/lib/supabase/env";
import Image from "next/image";

const truncate = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
};

export function FounderSection({
  founder,
  images,
  text,
}: {
  founder: Founder;
  images: SiteImages;
  text: Pick<SectionText, "founderEyebrow" | "founderLinkLabel">;
}) {
  return (
    <section id="founder" className="relative scroll-mt-24 overflow-hidden border-y bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-32">
        <Reveal className="relative mx-auto w-full max-w-sm">
          <FloatingPhoto
            src={images.founder1}
            className="top-12 -left-20 z-10 hidden w-40 sm:block"
            rotate={-5}
            delay={0.3}
            sizes="160px"
          />
          <FloatingPhoto
            src={images.founder2}
            className="-right-20 bottom-16 z-10 hidden w-44 sm:block"
            rotate={4}
            delay={0.5}
            duration={8}
            aspect="aspect-[16/10]"
            sizes="176px"
          />
          {/* Portrait frame — swap the monogram for a photo when available */}
          <div className="relative aspect-[4/5] rounded-lg bg-ink p-8">
            <span className="absolute top-4 left-4 h-10 w-10 border-t border-l border-gold-light/70" />
            <span className="absolute right-4 bottom-4 h-10 w-10 border-r border-b border-gold-light/70" />
            <div className="flex h-full flex-col items-center justify-center gap-6">
              {founder.photo ? (
                <div className="relative size-40 overflow-hidden rounded-full ring-1 ring-gold-light/50">
                  <Image
                    src={mediaUrl(founder.photo)}
                    alt={founder.name}
                    fill
                    sizes="160px"
                    quality={90}
                    className="object-cover"
                  />
                </div>
              ) : (
                <Monogram
                  initials={initialsOf(founder.name)}
                  className="w-40 bg-white/5 text-6xl text-white ring-1 ring-white/10"
                />
              )}
              <div className="text-center">
                <p className="font-serif text-2xl font-semibold text-white">{founder.name}</p>
                <p className="mt-1 text-xs tracking-[0.2em] text-gold-light uppercase">
                  {founder.title}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-8">
          {text.founderEyebrow && <Eyebrow>{text.founderEyebrow}</Eyebrow>}
          <blockquote className="relative">
            <Quote
              className="absolute -top-3 -left-1 size-9 -scale-x-100 text-gold/20 sm:-top-4 sm:-left-2 sm:size-14"
              aria-hidden
            />
            <p className="relative font-serif text-sm leading-relaxed font-medium text-pretty text-ink italic sm:text-4xl sm:leading-snug sm:text-balance">
              “{truncate(founder.quote, 200)}”
            </p>
          </blockquote>

          <div className="flex flex-col gap-3 text-muted-foreground">
            {founder.bio.slice(0, 2).map((p) => (
              <p key={p.slice(0, 20)} className="leading-relaxed">
                {truncate(p, 400)}
              </p>
            ))}
          </div>
          <ul className="flex flex-wrap gap-2">
            {founder.credentials.map((c) => (
              <li key={c} className="rounded-full border bg-white px-3 py-1 text-xs font-medium">
                {c}
              </li>
            ))}
          </ul>
          {text.founderLinkLabel && (
            <Link
              href="/about#founder"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
            >
              {text.founderLinkLabel} <ArrowRight className="size-4" />
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
