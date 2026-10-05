import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { SiteContent } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/smart-link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function ScholarshipSection({
  scholarships,
  applyHref,
}: {
  scholarships: SiteContent["scholarships"];
  applyHref: string;
}) {
  return (
    <section
      id="scholarships"
      className="relative scroll-mt-20 overflow-hidden bg-ink text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-12">
          {/* Heading */}
          <Reveal>
            <SectionHeading
              inverse
              eyebrow="Scholarships"
              title="Talent should never wait on means"
              description="Funded by our patrons and members, VES scholarships support deserving law students with tuition, travel and year-long mentorship."
            />
          </Reveal>

          {/* Scholarship Cards */}
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((s) => (
              <StaggerItem
                key={`${s.title}-${s.amount}`}
                className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.07]"
              >
                {/* Amount */}
                <div className="flex items-start justify-between gap-4">
                  <p className="gold-text font-serif text-4xl font-semibold">
                    {s.amount}
                  </p>

                  <span className="mt-1 size-2 rounded-full bg-gold opacity-60 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="mt-6 flex-1">
                  <h3 className="text-2xl font-semibold text-white transition-colors group-hover:text-gold-light">
                    {s.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {s.text}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-8 border-t border-white/10 pt-5">
                  {s.deadline && (
                    <p className="text-xs text-white/45">
                      Deadline ·{" "}
                      <span className="text-white/70">{s.deadline}</span>
                    </p>
                  )}

                  {s.applyUrl && (
                    <a
                      href={s.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold-light underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      Apply
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          {/* CTA */}
          <Reveal className="flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <SmartLink href={applyHref}>
                Apply for a scholarship
                <ArrowUpRight />
              </SmartLink>
            </Button>

            {/* <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:border-white hover:bg-white/5 hover:text-white"
            >
              <Link href="/contact?subject=sponsor">
                Sponsor a student
              </Link>
            </Button> */}
          </Reveal>
        </div>
      </div>
    </section>
  );
}