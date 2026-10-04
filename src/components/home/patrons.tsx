import type { Patron } from "@/lib/content/schema";
import { PeopleCarousel } from "@/components/home/people-carousel";

export function PatronsSection({ patrons }: { patrons: Patron[] }) {
  return (
    <PeopleCarousel
      variant="subtle"
      label="Patrons"
      eyebrow="Our patrons"
      title="Guided by the Bench, Bar and Academia"
      description="Eminent members of the legal fraternity who lend their wisdom and support to VES."
      people={patrons.map((p) => ({
        name: p.name,
        photo: p.photo,
        line1: p.title,
        line2: p.detail,
      }))}
    />
  );
}
