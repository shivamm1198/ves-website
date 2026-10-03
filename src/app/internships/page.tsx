import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { internshipFaqs, internshipSteps } from "@/data/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { InternshipExplorer } from "@/components/internship-explorer";
import { ScholarshipSection } from "@/components/home/scholarship";
import { PageHero } from "@/components/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Internships & Scholarships",
  description:
    "Verified, fee-free internships for law students across India — litigation, corporate, policy, legal aid and judiciary.",
};

export default function InternshipsPage() {
  return (
    <>
      <PageHero
        eyebrow="Internships"
        title="Find the internship that starts your career"
        description="Every opening is verified by our Internship Wing and comes with a mentor, a certificate and zero placement fees."
      >
        <div className="mt-3 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="#openings">
              Browse openings <ArrowRight />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact?subject=internship-listing">List an internship</Link>
          </Button>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Stagger className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {internshipSteps.map((s, i) => (
            <StaggerItem key={s.title} className="relative bg-white p-7">
              <span className="font-serif text-5xl font-semibold text-foreground/10">0{i + 1}</span>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              {i === 0 && <span className="absolute inset-x-0 top-0 h-[3px] gold-gradient" />}
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section
        id="openings"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32"
      >
        <SectionHeading
          eyebrow="Current openings"
          title="Winter cycle 2026"
          description="Applications close on the date listed against each opening. Shortlisted students hear back within 5 working days."
          className="mb-12"
        />
        <InternshipExplorer />
      </section>

      <ScholarshipSection />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-32">
        <SectionHeading
          eyebrow="FAQs"
          title="Questions students ask us"
          description="Can't find what you're looking for? Write to our Internship Wing."
        >
          <Button asChild variant="outline" className="mt-2 w-fit">
            <Link href="/contact?subject=internship">Contact the wing</Link>
          </Button>
        </SectionHeading>
        <Reveal>
          <Accordion type="single" collapsible defaultValue="q0" className="border-t">
            {internshipFaqs.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="font-serif text-xl font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-base">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>
    </>
  );
}
