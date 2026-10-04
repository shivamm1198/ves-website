import { buildStats } from "@/lib/content/derive";
import { getContent, getEvents, getGallery } from "@/lib/content/queries";
import { getCurrentYear } from "@/lib/current-year";
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

export default async function HomePage() {
  const [content, events, gallery, year] = await Promise.all([
    getContent(),
    getEvents(),
    getGallery(),
    getCurrentYear(),
  ]);

  return (
    <>
      <Hero site={content.site} stats={buildStats(content)} stateMembers={content.stateMembers} />
      <ValuesMarquee />
      <AboutSection site={content.site} year={year} />
      <FounderSection founder={content.founder} />
      {content.internships.length > 0 && (
        <InternshipSection internships={content.internships} email={content.site.email} />
      )}
      {content.scholarships.length > 0 && (
        <ScholarshipSection scholarships={content.scholarships} />
      )}
      <GalleryPreview gallery={gallery} />
      <EventsSection events={events.slice(0, 6)} />
      <NewsSection news={content.news} />
      {content.members.length > 0 && <MembersSection members={content.members} />}
      <PillarsSection pillars={content.pillars} />
      {content.patrons.length > 0 && <PatronsSection patrons={content.patrons} />}
      {content.videos.length > 0 && (
        <YoutubeSection videos={content.videos} channelUrl={content.site.socials.youtube} />
      )}
      <JoinCta />
    </>
  );
}
