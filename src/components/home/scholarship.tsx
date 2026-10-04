import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { SiteContent } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/photo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function ScholarshipSection({
  scholarships,
}: {
  scholarships: SiteContent["scholarships"];
}) {
  return (
    <section id="scholarships" className="relative scroll-mt-20 overflow-hidden bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-12">
          <SectionHeading
            inverse
            eyebrow="Scholarships"
            title="Talent should never wait on means"
            description="Funded by our patrons and members, VES scholarships support deserving law students with tuition, travel and year-long mentorship."
          />
          <Stagger className="flex flex-col border-t border-white/15">
            {scholarships.map((s) => (
              <StaggerItem
                key={s.title}
                className="group grid gap-2 border-b border-white/15 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-white transition-colors group-hover:text-gold-light">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-white/60">{s.text}</p>
                </div>
                <div className="sm:text-right">
                  <p className="gold-text font-serif text-4xl font-semibold">{s.amount}</p>
                  <p className="mt-1 text-xs text-white/50">Deadline · {s.deadline}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href="/contact?subject=scholarship">
                Apply for a scholarship <ArrowUpRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:border-white hover:bg-white/5 hover:text-white"
            >
              <Link href="/contact?subject=sponsor">Sponsor a student</Link>
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="relative hidden lg:block">
          <div className="relative h-full min-h-[520px] overflow-hidden rounded-lg border border-white/10">
            <Photo
              src="/images/scholarship.svg"
              alt="Graduation cap illustration"
              fill
              sizes="40vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
