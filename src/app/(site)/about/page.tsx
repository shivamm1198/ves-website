import type { Metadata } from "next";

import { buildStats } from "@/lib/content/derive";
import { joinHref } from "@/lib/content/links";
import { getContent } from "@/lib/content/queries";
import { mediaUrl } from "@/lib/supabase/env";
import { FounderAboutSection } from "@/components/home/founder-about";
import { JoinCta } from "@/components/home/join-cta";
import { PatronsSection } from "@/components/home/patrons";
import { PillarsSection } from "@/components/home/pillars";
import { iconComponents } from "@/components/icon-map";
import { PageHero } from "@/components/page-hero";
import { Photo } from "@/components/photo";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  const { site, aboutPage } = await getContent();
  return {
    title: "About",
    description: aboutPage.heroDescription || `The story, mission and people behind ${site.name}.`,
  };
}

export default async function AboutPage() {
  const content = await getContent();
  const { site, aboutPage: page } = content;
  const stats = buildStats(content);

  return (
    <>
      <PageHero
        eyebrow={page.heroEyebrow}
        title={
          <>
            {page.heroTitle}
            {page.heroTitleMuted && (
              <>
                <br />
                <span className="text-foreground/45">{page.heroTitleMuted}</span>
              </>
            )}
          </>
        }
        description={page.heroDescription || undefined}
      />

      {page.purpose.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Stagger className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
            {page.purpose.map(({ icon, title, text }) => {
              const Icon = iconComponents[icon];
              return (
                <StaggerItem key={title} className="flex flex-col gap-5 bg-white p-8 lg:p-10">
                  <Icon className="size-7 text-gold" strokeWidth={1.3} />
                  <h2 className="text-3xl font-semibold text-ink">{title}</h2>
                  <p className="leading-relaxed text-muted-foreground">{text}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      )}

      <section
        className={
          page.purpose.length > 0
            ? "mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32"
            : "mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
        }
      >
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-8">
            {page.storyTitle && (
              <SectionHeading eyebrow={page.storyEyebrow} title={page.storyTitle} />
            )}
            {page.storyParagraphs.length > 0 && (
              <Reveal className="flex flex-col gap-5 leading-relaxed text-muted-foreground">
                {page.storyParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </Reveal>
            )}
            {page.showStats && (
              <Reveal>
                <dl className="grid grid-cols-2 gap-6 border-t pt-8">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dd className="font-serif text-4xl font-semibold text-ink tabular-nums">
                        <CountUp value={s.value} />
                        <span className="text-gold">{s.suffix}</span>
                      </dd>
                      <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
          {content.images.aboutPage && (
            <Reveal
              delay={0.1}
              className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted lg:sticky lg:top-28"
            >
              <Photo
                src={mediaUrl(content.images.aboutPage)}
                alt={`${site.name} — our story`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </Reveal>
          )}
        </div>
      </section>

      <FounderAboutSection
        founder={content.founder}
        images={content.images}
        text={content.sectionText}
      />

      {page.work.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          {page.workTitle && <SectionHeading eyebrow={page.workEyebrow} title={page.workTitle} />}
          <Stagger className="mt-14 grid border-t sm:grid-cols-2 lg:grid-cols-3">
            {page.work.map(({ title, text }, i) => (
              <StaggerItem key={title} className="group border-b py-8 sm:pr-10">
                <p className="font-serif text-sm text-gold-dark tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <PillarsSection pillars={content.pillars} text={content.sectionText} />
      {content.patrons.length > 0 && (
        <PatronsSection patrons={content.patrons} text={content.sectionText} />
      )}
      <JoinCta joinHref={joinHref(content.links)} text={content.sectionText} />
    </>
  );
}
