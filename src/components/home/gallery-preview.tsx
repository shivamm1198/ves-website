import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { gallery } from "@/data/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/photo";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

const layout = [
  "md:col-span-2 md:row-span-2",
  "",
  "md:row-span-2",
  "",
  "md:col-span-2",
  "md:col-span-2",
];

export function GalleryPreview() {
  const items = [gallery[4], gallery[2], gallery[5], gallery[0], gallery[6], gallery[8]];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Gallery"
          title="Moments from the fraternity"
          description="Courtrooms, classrooms and village squares — a glimpse of VES in action."
        />
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/gallery">
            Open gallery <ArrowRight />
          </Link>
        </Button>
      </div>

      <Stagger
        stagger={0.06}
        className="mt-14 grid auto-rows-[170px] grid-cols-2 gap-3 sm:auto-rows-[210px] md:grid-cols-4 md:gap-4"
      >
        {items.map((item, i) => (
          <StaggerItem
            key={item.src}
            className={cn("group relative overflow-hidden rounded-lg", layout[i])}
          >
            <Link href="/gallery" className="block h-full w-full">
              <Photo
                src={item.src}
                alt={item.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[11px] tracking-[0.2em] text-gold-light uppercase">
                  {item.category}
                </p>
                <p className="mt-1 text-sm font-medium text-white">{item.title}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
