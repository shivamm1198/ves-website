"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Stat } from "@/lib/content/derive";
import type { Site, SiteContent } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { CountUp, easeOut } from "@/components/motion";
import { IndiaMap } from "@/components/home/india-map";
import { SmartLink } from "../smart-link";
import { ArrowUpRight } from "lucide-react";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: easeOut, delay },
});

export function Hero({
  site,
  stats,
  stateMembers,
  joinHref,
}: {
  site: Site;
  stats: Stat[];
  stateMembers: SiteContent["stateMembers"];
  joinHref: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="flex flex-col">
          <motion.p
            {...rise(0)}
            className="inline-flex w-fit items-center gap-2.5 rounded-full border bg-white px-3.5 py-1.5 text-xs font-medium text-foreground/70"
          >
            <span className="size-1.5 rounded-full bg-gold" />
            Est. {site.founded} · A national legal fraternity
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="mt-7 text-[3.4rem] leading-[0.95] font-semibold text-ink sm:text-7xl xl:text-[5.6rem]"
          >
            {site.name}
          </motion.h1>

          <motion.div {...rise(0.16)} className="mt-5 flex items-center gap-4">
            <span className="h-px w-12 gold-gradient" aria-hidden />
            <span className="font-serif text-2xl text-gold-dark sm:text-3xl" lang="hi">
              {site.hindi}
            </span>
          </motion.div>

          <motion.p
            {...rise(0.24)}
            className="mt-7 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground"
          >
            Uniting legal professionals and law students across India — opening doors to
            internships, scholarships, mentorship and events that shape the next generation of the
            Bar.
          </motion.p>

          <motion.div {...rise(0.32)} className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <SmartLink href={joinHref}>
                 Become a part of family <ArrowUpRight /> {/* {site.short} */}
              </SmartLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Our story</Link>
            </Button>
          </motion.div>

          <motion.dl
            {...rise(0.42)}
            className="mt-14 grid grid-cols-2 gap-y-6 border-t pt-8 sm:grid-cols-4"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={cn(i % 2 === 1 && "border-l pl-6", i > 0 && "sm:border-l sm:pl-6")}
              >
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-serif text-4xl font-semibold text-ink tabular-nums">
                  <CountUp value={s.value} />
                  <span className="text-gold">{s.suffix}</span>
                </dd>
                <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.2 }}
        >
          <IndiaMap stateMembers={stateMembers} />
        </motion.div>
      </div>
    </section>
  );
}
