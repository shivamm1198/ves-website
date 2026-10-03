import type { Metadata } from "next";

import { site, statesReached, wings } from "@/data/site";
import { JoinCta } from "@/components/home/join-cta";
import { PageHero } from "@/components/page-hero";
import { WingsExplorer } from "@/components/wings-explorer";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Organisation Wings",
  description: `The specialised wings through which ${site.name} runs its programmes.`,
};

const structure = [
  {
    tier: "National Executive",
    text: "Founder, patrons and office-bearers who set direction, uphold the pillars and steward funds.",
    count: "Core body",
  },
  {
    tier: "Specialised Wings",
    text: "Run programmes nationally — internships, legal aid, moots, research, outreach and more.",
    count: `${wings.length} wings`,
  },
  {
    tier: "State Chapters",
    text: "Led by state coordinators who adapt programmes to local courts, languages and needs.",
    count: `${statesReached} states & UTs`,
  },
  {
    tier: "Campus Chapters",
    text: "Student ambassadors who bring VES to their law schools and onboard new members.",
    count: "120+ campuses",
  },
];

export default function WingsPage() {
  return (
    <>
      <PageHero
        eyebrow="Organisation wings"
        title="Eight wings. One fraternity."
        description="Each wing is led by a volunteer head and focuses on one part of our mission — together they carry VES from the courtroom to the countryside."
      />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <WingsExplorer />
      </section>

      <section className="border-y bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <SectionHeading
            align="center"
            eyebrow="How we're organised"
            title="From the national executive to every campus"
          />
          <Stagger className="mx-auto mt-16 flex max-w-3xl flex-col items-center">
            {structure.map((s, i) => (
              <StaggerItem key={s.tier} className="flex w-full flex-col items-center">
                {i > 0 && (
                  <span aria-hidden className="h-10 w-px bg-gradient-to-b from-gold to-border" />
                )}
                <div
                  className="w-full rounded-lg border bg-white px-6 py-6 text-center sm:max-w-[var(--w)] sm:px-10"
                  style={{ "--w": `${60 + i * 13}%` } as React.CSSProperties}
                >
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-gold-dark uppercase">
                    {s.count}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">{s.tier}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <JoinCta />
    </>
  );
}
