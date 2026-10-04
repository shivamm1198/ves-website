import { CalendarDays, MapPin } from "lucide-react";

import type { EventItem } from "@/lib/content/schema";
import { Photo } from "@/components/photo";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function EventsSection({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;
  return (
    <section className="border-y bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <SectionHeading
          eyebrow="Events"
          title="Where the legal community gathers"
          description="Moot courts, seminars, legal-aid camps and conclaves — organised by VES wings across the country."
        />
        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <StaggerItem key={e.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-white transition-shadow duration-300 hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.35)]">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 z-10 h-[3px] gold-gradient opacity-80"
                />
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Photo
                    src={e.image}
                    alt={e.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
                    {e.location}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-gold" />
                      {e.dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-gold" />
                      {e.location}
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl leading-tight font-semibold text-ink decoration-gold/60 decoration-1 underline-offset-4 group-hover:underline">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {e.description}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
