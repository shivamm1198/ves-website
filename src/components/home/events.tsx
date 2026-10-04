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
        <Stagger className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <StaggerItem key={e.id}>
              <article className="group flex h-full flex-col">
                <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
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
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
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
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
