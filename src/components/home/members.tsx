import type { Member, SectionText } from "@/lib/content/schema";
import { PeopleCarousel } from "@/components/home/people-carousel";

export function MembersSection({
  members,
  text,
}: {
  members: Member[];
  text: Pick<
    SectionText,
    "membersEyebrow" | "membersTitle" | "membersDescription"
  >;
}) {
  return (
    <PeopleCarousel
      variant="featured"
      label="Core members"
      eyebrow={text.membersEyebrow}
      title={text.membersTitle}
      description={text.membersDescription || undefined}
      people={members.map((m) => ({
        name: m.name,
        photo: m.photo,
        line1: m.role,
        line2: m.state,
      }))}
    />
  );
}