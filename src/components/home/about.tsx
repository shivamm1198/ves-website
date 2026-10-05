import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, HandHeart, GraduationCap } from "lucide-react";

import type { Site } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/photo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

const points = [
  {
    Icon: BriefcaseBusiness,
    title: "Internships that open doors",
    text: "Verified placements with chambers, firms, courts and NGOs — never a fee.",
  },
  {
    Icon: GraduationCap,
    title: "Mentorship & scholarships",
    text: "Senior advocates guiding first-generation lawyers, backed by financial support.",
  },
  {
    Icon: HandHeart,
    title: "Law in service of people",
    text: "Legal-aid camps and awareness drives that take justice to the last mile.",
  },
];

export function AboutSection({ site, year }: { site: Site; year: number }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="relative aspect-[5/3] overflow-hidden rounded-lg">
            <Photo
              src="/images/ves-group-photo.png"
              alt="Classical courthouse columns"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="absolute -right-3 -bottom-8 w-56 rounded-lg border bg-white p-5 shadow-xl sm:-right-8">
            <div className="mb-3 h-[3px] w-10 gold-gradient" />
            <p className="font-serif text-4xl font-semibold text-ink">
              {Math.max(year - site.founded, 1)}+ yrs
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              of building India&apos;s most welcoming legal community
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="About VES"
            title={<>One fraternity for every law student and legal professional</>}
            description={`${site.name} bridges the gap between the classroom and the courtroom. We connect students with the mentors, opportunities and community they need — wherever in India they study.`}
          />
          <Stagger className="flex flex-col divide-y border-y">
            {points.map(({ Icon, title, text }) => (
              <StaggerItem key={title} className="flex gap-4 py-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border text-ink">
                  <Icon className="size-5" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal>
            <Button asChild variant="outline">
              <Link href="/about">
                Read our story <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
