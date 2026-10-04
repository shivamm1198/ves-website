import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { GalleryItem } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/photo";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export function GalleryPreview({ gallery }: { gallery: GalleryItem[] }) {
  const items = gallery.slice(0, 12);
  if (items.length === 0) return null;
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
        className="mt-14 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6"
      >
        {items.map((item) => (
          <StaggerItem
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10 bg-ink/5 transition-shadow hover:shadow-lg"
          >
            <Link href="/gallery" className="block h-full w-full">
              <Photo
                src={item.src}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 33vw"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-2.5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="hidden text-[10px] tracking-[0.2em] text-gold-light uppercase sm:block">
                  {item.category}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs font-medium text-white">{item.title}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
