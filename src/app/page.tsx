import { AboutSection } from "@/components/home/about";
import { EventsSection } from "@/components/home/events";
import { FounderSection } from "@/components/home/founder";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { Hero } from "@/components/home/hero";
import { InternshipSection } from "@/components/home/internship";
import { JoinCta } from "@/components/home/join-cta";
import { MembersSection } from "@/components/home/members";
import { NewsSection } from "@/components/home/news";
import { PatronsSection } from "@/components/home/patrons";
import { PillarsSection } from "@/components/home/pillars";
import { ScholarshipSection } from "@/components/home/scholarship";
import { ValuesMarquee } from "@/components/home/values-marquee";
import { YoutubeSection } from "@/components/home/youtube";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValuesMarquee />
      <AboutSection />
      <FounderSection />
      <InternshipSection />
      <ScholarshipSection />
      <GalleryPreview />
      <EventsSection />
      <NewsSection />
      <MembersSection />
      <PillarsSection />
      <PatronsSection />
      <YoutubeSection />
      <JoinCta />
    </>
  );
}
