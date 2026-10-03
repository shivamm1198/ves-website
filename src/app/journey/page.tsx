import type { Metadata } from "next";

import { site, stats } from "@/data/site";
import { JoinCta } from "@/components/home/join-cta";
import { JourneyTimeline } from "@/components/journey-timeline";
import { PageHero } from "@/components/page-hero";
import { CountUp, Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "Our Journey",
  description: `How ${site.name} grew from a student WhatsApp group into a national legal fraternity.`,
};

export default function JourneyPage() {
  return (
    <>
      <PageHero
        eyebrow={`${site.founded} — today`}
        title="The journey so far"
        description="Every milestone below was built by volunteers — students and lawyers who believed the profession should be open to all."
      />

      <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <JourneyTimeline />
      </section>

      <section className="bg-ink text-white">
        <div className="h-[3px] w-full gold-gradient" aria-hidden />
        <Stagger className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s, i) => (
            <StaggerItem
              key={s.label}
              className={i > 0 ? "lg:border-l lg:border-white/15 lg:pl-10" : ""}
            >
              <p className="font-serif text-5xl font-semibold tabular-nums">
                <CountUp value={s.value} />
                <span className="text-gold-light">{s.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-white/60">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <JoinCta />
    </>
  );
}
