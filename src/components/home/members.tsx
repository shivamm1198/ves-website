"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { MapPin } from "lucide-react";

import { members } from "@/data/site";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Monogram } from "@/components/monogram";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function MembersSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [plugins] = React.useState(() => [
    Autoplay({ delay: 3200, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="overflow-hidden border-y bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Our members"
            title={`${members.length} people who carry VES forward`}
            description="Wing heads, state coordinators and volunteers — the national core team that makes every internship, camp and conclave happen."
          />
          <div className="flex items-center gap-4">
            <p className="font-serif text-lg text-muted-foreground tabular-nums">
              <span className="text-ink">{pad(current + 1)}</span> / {pad(members.length)}
            </p>
            <div className="flex gap-2">
              <CarouselNavButton direction="prev" api={api} />
              <CarouselNavButton direction="next" api={api} />
            </div>
          </div>
        </div>

        <Reveal className="mt-14">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            plugins={plugins}
            aria-label="VES core members"
          >
            <CarouselContent className="-ml-5">
              {members.map((m, i) => (
                <CarouselItem
                  key={m.name}
                  className="basis-[78%] pl-5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <article className="group flex h-full flex-col items-center rounded-lg border bg-white px-6 pt-9 pb-7 text-center transition-[border-color,box-shadow] duration-300 hover:border-foreground/20 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.4)]">
                    <div className="relative">
                      <Monogram
                        initials={m.initials}
                        className="w-24 text-3xl transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-2 border-white bg-gold text-[10px] font-semibold text-ink tabular-nums">
                        {pad(i + 1)}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl leading-tight font-semibold text-ink">{m.name}</h3>
                    <p className="mt-1 text-sm text-foreground/75">{m.role}</p>
                    <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 text-gold" /> {m.state}
                    </p>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Keyboard users get the native carousel buttons too */}
            <CarouselPrevious className="sr-only" />
            <CarouselNext className="sr-only" />
          </Carousel>
        </Reveal>

        <div className="mt-8 h-px w-full bg-border">
          <div
            className="h-px gold-gradient transition-[width] duration-500"
            style={{ width: `${((current + 1) / members.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function CarouselNavButton({ direction, api }: { direction: "prev" | "next"; api?: CarouselApi }) {
  const Icon = direction === "prev" ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <button
      type="button"
      onClick={() => (direction === "prev" ? api?.scrollPrev() : api?.scrollNext())}
      aria-label={direction === "prev" ? "Previous members" : "Next members"}
      className="grid size-11 place-items-center rounded-full border border-foreground/15 bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
    >
      <Icon />
    </button>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
