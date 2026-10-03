import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { site } from "@/data/site";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/social-icons";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — membership, internships, scholarships and partnerships.`,
};

const details = [
  { Icon: MapPin, label: "Office", value: site.address },
  { Icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { Icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
  { Icon: Clock, label: "Hours", value: site.hours },
];

const socials = [
  { href: site.socials.youtube, label: "YouTube", Icon: YoutubeIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: site.socials.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: site.socials.x, label: "X", Icon: XIcon },
];

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { subject } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk"
        description="Whether you're a student looking for your first internship, an advocate who wants to mentor, or an institution hoping to partner — we'd love to hear from you."
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-10">
          <Stagger className="flex flex-col divide-y border-y">
            {details.map(({ Icon, label, value, href }) => (
              <StaggerItem key={label} className="flex gap-4 py-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border">
                  <Icon className="size-4.5 text-gold-dark" strokeWidth={1.6} />
                </span>
                <div>
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                  </p>
                  {href ? (
                    <a href={href} className="mt-1 block font-medium text-ink hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 font-medium text-ink">{value}</p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="rounded-xl bg-ink p-8 text-white">
            <div className="h-[3px] w-12 gold-gradient" />
            <p className="mt-6 font-serif text-2xl leading-snug">
              Want to bring VES to your campus or state?
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Pick “Start a state / campus chapter” in the form and our national team will walk you
              through it.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-light hover:text-gold-light"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ContactForm initialSubject={typeof subject === "string" ? subject : undefined} />
        </Reveal>
      </section>
    </>
  );
}
