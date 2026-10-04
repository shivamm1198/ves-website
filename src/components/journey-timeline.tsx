"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";
import type { JourneyItem } from "@/lib/content/schema";
import { easeOut } from "@/components/motion";

export function JourneyTimeline({ journey }: { journey: JourneyItem[] }) {
  const ref = React.useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <ol ref={ref} className="relative mx-auto max-w-5xl">
      {/* Rail + gold progress */}
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-[19px] w-px bg-border md:left-1/2"
      />
      <motion.span
        aria-hidden
        style={{ scaleY: progress }}
        className="absolute top-0 bottom-0 left-[19px] w-px origin-top bg-gradient-to-b from-gold-light via-gold to-gold-dark md:left-1/2"
      />

      {journey.map((m, i) => {
        const right = i % 2 === 1;
        return (
          <li key={m.year} className="relative grid pb-16 pl-14 last:pb-0 md:grid-cols-2 md:pl-0">
            <motion.span
              aria-hidden
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute top-1.5 left-[12px] z-10 grid size-[15px] place-items-center rounded-full border-2 border-gold bg-white md:left-1/2 md:-translate-x-1/2"
            >
              <span className="size-[5px] rounded-full bg-ink" />
            </motion.span>

            <motion.div
              initial={{ opacity: 0, x: right ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: easeOut }}
              className={cn("md:px-12", right ? "md:col-start-2" : "md:col-start-1 md:text-right")}
            >
              <p className="font-serif text-6xl leading-none font-semibold text-foreground/12 lg:text-7xl">
                {m.year}
              </p>
              <h3 className="mt-3 text-3xl leading-tight font-semibold text-ink">{m.title}</h3>
              <p
                className={cn(
                  "mt-3 max-w-md leading-relaxed text-muted-foreground",
                  !right && "md:ml-auto",
                )}
              >
                {m.text}
              </p>
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}
