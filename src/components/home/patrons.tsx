import type { Patron, SectionText } from "@/lib/content/schema";
import { PeopleCarousel } from "@/components/home/people-carousel";

export function PatronsSection({
  patrons,
  text,
}: {
  patrons: Patron[];
  text: Pick<SectionText, "patronsEyebrow" | "patronsTitle" | "patronsDescription">;
}) {
  return (
    <PeopleCarousel
      variant="subtle"
      label="Patrons"
      eyebrow={text.patronsEyebrow}
      title={text.patronsTitle}
      description={text.patronsDescription || undefined}
      people={patrons.map((p) => ({
        name: p.name,
        photo: p.photo,
        line1: p.title,
        line2: p.detail,
      }))}
    />
  );
}
