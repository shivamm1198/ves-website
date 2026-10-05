import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { nav } from "@/data/site";
import type { Site } from "@/lib/content/schema";
import { Logo } from "@/components/logo";
import { GoldStrip } from "@/components/section-heading";
import { socialLinks } from "@/components/social-icons";

const programmes = [
  { href: "/internships", label: "Internships" },
  { href: "/internships#scholarships", label: "Scholarships" },
  { href: "/wings", label: "Organisation Wings" },
  { href: "/gallery", label: "Events & Gallery" },
  { href: "/portal", label: "Intern login" },
];

export function SiteFooter({ site, year }: { site: Site; year: number }) {
  const socials = socialLinks(site.socials);
  return (
    <footer className="bg-ink text-white">
      <GoldStrip />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-8">
        <div className="flex flex-col gap-5">
          <Logo site={site} inverse />
          <p className="max-w-sm text-sm leading-relaxed text-white/60">{site.description}</p>
          <div className="flex gap-2">
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
        </div>

        <FooterColumn title="Explore" links={nav} />
        <FooterColumn title="Programmes" links={programmes} />

        <div className="flex flex-col gap-4">
          <h3 className="font-sans text-xs font-semibold tracking-[0.22em] text-gold-light uppercase">
            Reach us
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" />
              {site.address}
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-white/40" />
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="flex gap-3 hover:text-white"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-white/40" />
                {site.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="tracking-[0.2em] uppercase">Integrity · Unity · Justice · Empowerment</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-sans text-xs font-semibold tracking-[0.22em] text-gold-light uppercase">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
