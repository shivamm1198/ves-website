import type { Member } from "@/lib/content/schema";
import { PeopleCarousel } from "@/components/home/people-carousel";

export function MembersSection({ members }: { members: Member[] }) {
  return (
    <PeopleCarousel
      variant="featured"
      label="Core members"
      eyebrow="Central Governing Body 2026"
      title={`${members.length} people who carry VES forward`}
      description="The Central Governing Body of Vidhi Ekta Sngh (VES) 2026 serves as the principal leadership and administrative body responsible for guiding the organisation, overseeing departments, strengthening national operations, and advancing VES's vision of Unity, Integrity, Empowerment and Justice."
      people={members.map((m) => ({ name: m.name, photo: m.photo, line1: m.role, line2: m.state }))}
    />
  );
}
