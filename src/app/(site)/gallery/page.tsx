import type { Metadata } from "next";

import { getContent, getEvents, getGallery } from "@/lib/content/queries";

import { GalleryGrid } from "@/components/gallery-grid";
import { EventsSection } from "@/components/home/events";
import { YoutubeSection } from "@/components/home/youtube";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from VES moot courts, seminars, legal-aid camps and community events.",
};

export default async function GalleryPage() {
  const [content, events, gallery] = await Promise.all([getContent(), getEvents(), getGallery()]);
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The fraternity, in frames"
        description="From national moot courts to village legal-aid camps — moments captured across our chapters."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {gallery.length > 0 ? (
          <GalleryGrid gallery={gallery} />
        ) : (
          <p className="rounded-lg border border-dashed px-6 py-16 text-center text-muted-foreground">
            Photos will appear here soon.
          </p>
        )}
      </section>
      <EventsSection events={events} />
      {content.videos.length > 0 && (
        <YoutubeSection videos={content.videos} channelUrl={content.site.socials.youtube} />
      )}
    </>
  );
}
