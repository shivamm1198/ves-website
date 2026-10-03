import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { founder } from "@/data/site";
import { Monogram } from "@/components/monogram";
import { Reveal } from "@/components/motion";
import { Eyebrow } from "@/components/section-heading";

export function FounderSection() {
  return (
    <section id="founder" className="relative scroll-mt-24 overflow-hidden border-y bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-32">
        <Reveal className="relative mx-auto w-full max-w-sm">
          {/* Portrait frame — swap the monogram for a photo when available */}
          <div className="relative aspect-[4/5] rounded-lg bg-ink p-8">
            <span className="absolute top-4 left-4 h-10 w-10 border-t border-l border-gold-light/70" />
            <span className="absolute right-4 bottom-4 h-10 w-10 border-r border-b border-gold-light/70" />
            <div className="flex h-full flex-col items-center justify-center gap-6">
              <Monogram
                initials={founder.initials}
                className="w-40 bg-white/5 text-6xl text-white ring-1 ring-white/10"
              />
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
          <Eyebrow>From the founder</Eyebrow>
          <blockquote className="relative">
            <Quote
              className="absolute -top-4 -left-2 size-14 -scale-x-100 text-gold/20"
              aria-hidden
            />
            <p className="relative font-serif text-3xl leading-snug font-medium text-balance text-ink italic sm:text-4xl">
              “{founder.quote}”
            </p>
          </blockquote>
          <div className="flex flex-col gap-4 text-muted-foreground">
            {founder.bio.map((p) => (
              <p key={p.slice(0, 20)} className="leading-relaxed">
                {p}
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
          <Link
            href="/about#founder"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            Read the founder&apos;s message <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
