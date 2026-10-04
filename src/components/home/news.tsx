import { ArrowUpRight } from "lucide-react";

import type { SiteContent } from "@/lib/content/schema";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function NewsSection({ news }: { news: SiteContent["news"] }) {
  if (news.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="Inside VES"
            title="News from the Sangh"
            description="Announcements, chapter updates, publications and recognitions — straight from our wings."
          />
        </div>
        <Stagger className="flex flex-col border-t">
          {news.map((n) => (
            <StaggerItem key={n.title}>
              <article className="group relative grid gap-3 border-b py-7 transition-colors sm:grid-cols-[8.5rem_1fr_auto] sm:gap-6">
                <div className="flex gap-3 text-xs sm:flex-col sm:gap-1.5">
                  <time className="font-medium text-ink">{n.date}</time>
                  <span className="tracking-[0.15em] text-gold-dark uppercase">{n.category}</span>
                </div>
                <div>
                  <h3 className="text-2xl leading-tight font-semibold text-ink transition-colors group-hover:text-gold-dark">
                    {n.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.text}</p>
                </div>
                <ArrowUpRight className="hidden size-5 text-foreground/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-dark sm:block" />
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
