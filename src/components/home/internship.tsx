import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { internships } from "@/data/site";
import { Button } from "@/components/ui/button";
import { InternshipCard } from "@/components/internship-card";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function InternshipSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Internships"
          title="Your first step into the profession"
          description="Verified internships with advocates, firms, courts and legal-aid bodies — matched to your interests and always free of placement fees."
        />
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/internships">
            View all openings <ArrowRight />
          </Link>
        </Button>
      </div>
      <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {internships.slice(0, 3).map((item) => (
          <StaggerItem key={item.id}>
            <InternshipCard item={item} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
