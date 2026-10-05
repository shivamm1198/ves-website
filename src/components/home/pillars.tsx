"use client";

import { motion } from "framer-motion";
import { Handshake, Landmark, Scale, Sparkles } from "lucide-react";

import type { Pillar, SectionText } from "@/lib/content/schema";
import { easeOut } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

const icons = {
  integrity: Landmark,
  unity: Handshake,
  justice: Scale,
  empowerment: Sparkles,
} as const;

export function PillarsSection({
  pillars,
  text,
}: {
  pillars: Pillar[];
  text: Pick<SectionText, "pillarsEyebrow" | "pillarsTitle" | "pillarsDescription">;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading
          inverse
          align="center"
          eyebrow={text.pillarsEyebrow}
          title={text.pillarsTitle}
          description={text.pillarsDescription || undefined}
        />

        <div className="mt-16 grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => {
            const Icon = icons[p.key];
            return (
              <motion.article
                key={p.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: easeOut, delay: i * 0.1 }}
                className="group relative flex flex-col gap-6 border-b border-white/15 px-2 py-10 sm:px-8 lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-white/15"
              >
                <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 gold-gradient transition-transform duration-500 group-hover:scale-x-100" />
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl font-semibold text-white/15 transition-colors duration-500 group-hover:text-gold-light/60">
                    0{i + 1}
                  </span>
                  <Icon className="size-7 text-gold-light" strokeWidth={1.3} />
                </div>
                <div>
                  <p className="font-serif text-lg text-gold-light" lang="hi">
                    {p.hindi}
                  </p>
                  <h3 className="mt-1 text-4xl font-semibold text-white">{p.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/60">{p.text}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
