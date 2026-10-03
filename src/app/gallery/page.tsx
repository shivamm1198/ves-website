import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery-grid";
import { EventsSection } from "@/components/home/events";
import { YoutubeSection } from "@/components/home/youtube";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from VES moot courts, seminars, legal-aid camps and community events.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The fraternity, in frames"
        description="From national moot courts to village legal-aid camps — moments captured across our chapters."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <GalleryGrid />
      </section>
      <EventsSection />
      <YoutubeSection />
    </>
  );
}
