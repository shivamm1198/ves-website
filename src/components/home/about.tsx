import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Site, SiteContent, SiteImages } from "@/lib/content/schema";
import { iconComponents } from "@/components/icon-map";
import { mediaUrl } from "@/lib/supabase/env";
import { FloatingPhoto } from "@/components/floating-photo";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/photo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function AboutSection({
  site,
  year,
  images,
  about,
}: {
  site: Site;
  year: number;
  images: SiteImages;
  about: SiteContent["aboutSection"];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="relative aspect-[5/3] overflow-hidden rounded-lg bg-muted">
            {images.aboutSection && (
              <Photo
                src={mediaUrl(images.aboutSection)}
                alt={`About ${site.name}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            )}
          </div>
          <FloatingPhoto
            src={images.about1}
            className="-top-10 -right-3 z-10 hidden w-40 sm:block lg:-right-8"
            rotate={4}
            delay={0.3}
            sizes="160px"
          />
          <FloatingPhoto
            src={images.about2}
            className="-bottom-12 -left-3 z-10 hidden w-36 sm:block lg:-left-8"
            rotate={-4}
            delay={0.5}
            duration={8}
            aspect="aspect-[4/3]"
            sizes="144px"
          />
        </Reveal>

        <div className="flex flex-col gap-10">
          <SectionHeading
            eyebrow={about.eyebrow}
            title={about.title}
            description={about.description || undefined}
          />
          <div className=" border-3 border-l-[gold-gradient] border-r-0 border-b-0 border-t-0 pl-6">
            <p className="font-serif text-4xl font-semibold text-ink">
              {Math.max(year - site.founded, 1)}+ yrs
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{about.badgeText}</p>
          </div>
          {about.points.length > 0 && (
            <Stagger className="flex flex-col divide-y border-y">
              {about.points.map(({ icon, title, text }) => {
                const Icon = iconComponents[icon];
                return (
                  <StaggerItem key={title} className="flex gap-4 py-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border text-ink">
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
          {about.buttonLabel && (
            <Reveal>
              <Button asChild variant="outline">
                <Link href="/about">
                  {about.buttonLabel} <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
