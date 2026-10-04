import type { Patron } from "@/lib/content/schema";
import { Avatar } from "@/components/monogram";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function PatronsSection({ patrons }: { patrons: Patron[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionHeading
        align="center"
        eyebrow="Our patrons"
        title="Guided by eminent members of the Bench, Bar and Academia"
        description="Our patrons lend their wisdom, stature and support to VES programmes and scholarships."
      />
      <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {patrons.map((p) => (
          <StaggerItem key={`${p.name}-${p.title}`}>
            <article className="group relative flex h-full flex-col items-center rounded-lg border bg-white px-6 pt-10 pb-8 text-center transition-shadow duration-300 hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.4)]">
              <span className="absolute top-0 left-1/2 h-[3px] w-12 -translate-x-1/2 gold-gradient transition-all duration-500 group-hover:w-24" />
              <Avatar
                name={p.name}
                photo={p.photo}
                tone="paper"
                sizes="112px"
                className="w-28 text-4xl"
              />
              <p className="mt-6 text-[11px] font-semibold tracking-[0.22em] text-gold-dark uppercase">
                {p.title}
              </p>
              <h3 className="mt-2 text-xl leading-snug font-semibold text-ink">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.detail}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
