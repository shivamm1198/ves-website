import type { Member } from "@/lib/content/schema";
import { PeopleCarousel } from "@/components/home/people-carousel";

export function MembersSection({ members }: { members: Member[] }) {
  return (
    <PeopleCarousel
      variant="featured"
      label="Core members"
      eyebrow="Our members"
      title={`${members.length} people who carry VES forward`}
      description="Wing heads, state coordinators and volunteers — the national core team that makes every internship, camp and conclave happen."
      people={members.map((m) => ({ name: m.name, photo: m.photo, line1: m.role, line2: m.state }))}
    />
  );
}
