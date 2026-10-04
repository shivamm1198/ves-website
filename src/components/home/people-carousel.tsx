"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Avatar } from "@/components/monogram";
import { Reveal } from "@/components/motion";
import { Eyebrow, SectionHeading } from "@/components/section-heading";

export type Person = {
  name: string;
  photo?: string;
  /** Main line under the name (role or title). */
  line1?: string;
  /** Secondary line (state or designation). */
  line2?: string;
};

/**
 * Auto-playing people carousel. "featured" is the prominent members band;
 * "subtle" is a quieter, smaller version used for patrons.
 */
export function PeopleCarousel({
  people,
  variant,
  eyebrow,
  title,
  description,
  label,
}: {
  people: Person[];
  variant: "featured" | "subtle";
  eyebrow: string;
  title: string;
  description?: string;
  label: string;
}) {
  const featured = variant === "featured";
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [plugins] = React.useState(() => [
    Autoplay({ delay: featured ? 3200 : 4200, stopOnInteraction: false, stopOnMouseEnter: true }),
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
    <section className={cn("overflow-hidden", featured ? "border-y bg-paper" : "bg-white")}>
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          featured ? "py-24 lg:py-32" : "py-16 lg:py-20",
        )}
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          {featured ? (
            <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          ) : (
            <Reveal className="flex flex-col gap-3">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2 className="text-3xl leading-tight font-semibold text-ink">{title}</h2>
              {description && (
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </Reveal>
          )}
          <div className="flex items-center gap-4">
            {featured && (
              <p className="font-serif text-lg text-muted-foreground tabular-nums">
                <span className="text-ink">{pad(current + 1)}</span> / {pad(people.length)}
              </p>
            )}
            <div className="flex gap-2">
              <CarouselNavButton direction="prev" api={api} small={!featured} label={label} />
              <CarouselNavButton direction="next" api={api} small={!featured} label={label} />
            </div>
          </div>
        </div>

        <Reveal className={featured ? "mt-14" : "mt-8"}>
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            plugins={plugins}
            aria-label={label}
          >
            <CarouselContent className={featured ? "-ml-5" : "-ml-4"}>
              {people.map((p, i) => (
                <CarouselItem
                  key={`${i}-${p.name}`}
                  className={
                    featured
                      ? "basis-[78%] pl-5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                      : "basis-[62%] pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                  }
                >
                  {featured ? (
                    <article className="group flex h-full flex-col items-center rounded-lg border bg-white px-6 pt-9 pb-7 text-center transition-[border-color,box-shadow] duration-300 hover:border-foreground/20 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.4)]">
                      <div className="relative">
                        <Avatar
                          name={p.name}
                          photo={p.photo}
                          sizes="96px"
                          className="w-24 text-3xl transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-2 border-white bg-gold text-[10px] font-semibold text-ink tabular-nums">
                          {pad(i + 1)}
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl leading-tight font-semibold text-ink">
                        {p.name}
                      </h3>
                      {p.line1 && <p className="mt-1 text-sm text-foreground/75">{p.line1}</p>}
                      {p.line2 && (
                        <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 text-gold" /> {p.line2}
                        </p>
                      )}
                    </article>
                  ) : (
                    <article className="flex h-full flex-col items-center rounded-lg border border-foreground/10 bg-paper/60 px-4 pt-6 pb-5 text-center">
                      <Avatar
                        name={p.name}
                        photo={p.photo}
                        tone="paper"
                        sizes="64px"
                        className="w-16 text-xl"
                      />
                      {p.line1 && (
                        <p className="mt-4 text-[10px] font-semibold tracking-[0.2em] text-gold-dark uppercase">
                          {p.line1}
                        </p>
                      )}
                      <h3 className="mt-1.5 font-serif text-base leading-snug font-semibold text-ink">
                        {p.name}
                      </h3>
                      {p.line2 && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {p.line2}
                        </p>
                      )}
                    </article>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Keyboard users get the native carousel buttons too */}
            <CarouselPrevious className="sr-only" />
            <CarouselNext className="sr-only" />
          </Carousel>
        </Reveal>

        {featured && (
          <div className="mt-8 h-px w-full bg-border">
            <div
              className="h-px gold-gradient transition-[width] duration-500"
              style={{ width: `${((current + 1) / people.length) * 100}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function CarouselNavButton({
  direction,
  api,
  small,
  label,
}: {
  direction: "prev" | "next";
  api?: CarouselApi;
  small?: boolean;
  label: string;
}) {
  const Icon = direction === "prev" ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <button
      type="button"
      onClick={() => (direction === "prev" ? api?.scrollPrev() : api?.scrollNext())}
      aria-label={`${direction === "prev" ? "Previous" : "Next"}: ${label}`}
      className={cn(
        "grid place-items-center rounded-full border border-foreground/15 bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white",
        small ? "size-9" : "size-11",
      )}
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
