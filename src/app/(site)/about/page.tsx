import type { Metadata } from "next";
import { Compass, Eye, Target } from "lucide-react";

import { buildStats } from "@/lib/content/derive";
import { joinHref } from "@/lib/content/links";
import { getContent } from "@/lib/content/queries";
import { FounderSection } from "@/components/home/founder";
import { JoinCta } from "@/components/home/join-cta";
import { PatronsSection } from "@/components/home/patrons";
import { PillarsSection } from "@/components/home/pillars";
import { PageHero } from "@/components/page-hero";
import { Photo } from "@/components/photo";
import { mediaUrl } from "@/lib/supabase/env";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return {
    title: "About",
    description: `The story, mission and people behind ${site.name}.`,
  };
}

const purpose = [
  {
    Icon: Target,
    title: "Our mission",
    text: "To make the legal profession accessible to every aspiring lawyer — through free internships, mentorship, scholarships and a community that shows up for each other.",
  },
  {
    Icon: Eye,
    title: "Our vision",
    text: "A Bar that reflects all of India: where talent from every district and background has an equal shot at the courtroom, the boardroom and the Bench.",
  },
  {
    Icon: Compass,
    title: "Our approach",
    text: "Volunteer-led and fee-free. Senior professionals give time, students give energy, and our wings turn both into programmes that last.",
  },
];

const work = [
  [
    "Internship facilitation",
    "Verified openings with chambers, firms, courts, NGOs and legal-services authorities.",
  ],
  [
    "Mentorship circles",
    "Small groups of students guided by practising advocates for a full academic year.",
  ],
  ["Scholarships & grants", "Financial support for merit, access and women in litigation."],
  ["Legal-aid outreach", "Camps and awareness drives that take free legal advice to rural India."],
  [
    "Moots & skill-building",
    "National moot courts, legal writing bootcamps and advocacy masterclasses.",
  ],
  ["Research & publication", "The VES Quarterly Law Review and student-authored policy briefs."],
];

export default async function AboutPage() {
  const content = await getContent();
  const { site } = content;
  const stats = buildStats(content);
  return (
    <>
      <PageHero
        eyebrow="About VES"
        title={
          <>
            Law is a fraternity.
            <br />
            <span className="text-foreground/45">We make sure no one walks in alone.</span>
          </>
        }
        description={`${site.name} (${site.hindi}) is a national, volunteer-led organisation that helps law students and young legal professionals find their footing — and gives back to society through legal aid.`}
      />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Stagger className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
          {purpose.map(({ Icon, title, text }) => (
            <StaggerItem key={title} className="flex flex-col gap-5 bg-white p-8 lg:p-10">
              <Icon className="size-7 text-gold" strokeWidth={1.3} />
              <h2 className="text-3xl font-semibold text-ink">{title}</h2>
              <p className="leading-relaxed text-muted-foreground">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Our story"
              title="From forty students to a national movement"
            />
            <Reveal className="flex flex-col gap-5 leading-relaxed text-muted-foreground">
              <p>
                In 2020, when courts went virtual and internships vanished overnight, a small group
                of law students and young advocates in Delhi started sharing whatever opportunities
                they could find. Within months, students from Jaipur, Patna, Kochi and Guwahati had
                joined in.
              </p>
              <p>
                That informal circle became {site.name} — <em>vidhi</em> (law), <em>ekta</em>{" "}
                (unity), <em>sangh</em> (fraternity). Today our wings run internship cycles,
                scholarships, moot courts and legal-aid camps, with chapters in more than 30 states
                and union territories.
              </p>
              <p>
                We remain fee-free and volunteer-led, because the people who helped us find our
                first internship never asked for anything in return.
              </p>
            </Reveal>
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
          </div>
          <Reveal
            delay={0.1}
            className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted lg:sticky lg:top-28"
          >
            {content.images.aboutPage && (
              <Photo
                src={mediaUrl(content.images.aboutPage)}
                alt={`${site.name} — our story`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            )}
          </Reveal>
        </div>
      </section>

      <FounderSection founder={content.founder} images={content.images} />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading
          eyebrow="What we do"
          title="Six ways VES shows up for the legal community"
        />
        <Stagger className="mt-14 grid border-t sm:grid-cols-2 lg:grid-cols-3">
          {work.map(([title, text], i) => (
            <StaggerItem key={title} className="group border-b py-8 sm:pr-10">
              <p className="font-serif text-sm text-gold-dark tabular-nums">0{i + 1}</p>
              <h3 className="mt-3 text-2xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <PillarsSection pillars={content.pillars} />
      {content.patrons.length > 0 && <PatronsSection patrons={content.patrons} />}
      <JoinCta joinHref={joinHref(content.links)} />
    </>
  );
}
