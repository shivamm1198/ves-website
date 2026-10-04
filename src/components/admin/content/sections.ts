import {
  Award,
  BarChart3,
  Building2,
  CalendarClock,
  Columns3,
  Crown,
  GraduationCap,
  HelpCircle,
  ListOrdered,
  Link2,
  Map,
  Newspaper,
  Network,
  UserRound,
  Users,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react";

import { internshipModes, wingIcons, type ContentKey } from "@/lib/content/schema";

type Base = { key: string; label: string; help?: string; wide?: boolean };

export type FieldDef =
  | (Base & {
      kind: "text" | "email" | "url";
      placeholder?: string;
      transform?: (value: string) => string;
    })
  | (Base & { kind: "textarea"; rows?: number; placeholder?: string })
  | (Base & { kind: "number"; min?: number })
  | (Base & { kind: "select"; options: readonly { value: string; label: string }[] })
  | (Base & { kind: "image"; shape?: "round" | "wide" | "logo" })
  | (Base & { kind: "strings"; itemLabel: string; multiline?: boolean })
  | (Base & { kind: "group"; fields: FieldDef[] });

type Item = Record<string, unknown>;

export type SectionDef = {
  key: ContentKey;
  title: string;
  description: string;
  group: string;
  Icon: LucideIcon;
} & (
  | { shape: "object"; fields: FieldDef[] }
  | {
      shape: "list";
      itemFields: FieldDef[];
      itemNoun: string;
      itemTitle: (item: Item) => string;
      itemSubtitle?: (item: Item) => string;
      newItem: () => Item;
      fixed?: boolean;
    }
  | { shape: "map" }
);

const s = (v: unknown) => (typeof v === "string" ? v : "");

/** Accepts a full YouTube link and keeps just the video id. */
export function youtubeIdFrom(value: string) {
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  return match ? match[1] : value.trim();
}

const wingIconLabels: Record<(typeof wingIcons)[number], string> = {
  briefcase: "Briefcase",
  "hand-heart": "Helping hand",
  gavel: "Gavel",
  book: "Book",
  venus: "Women",
  "graduation-cap": "Graduation cap",
  calendar: "Calendar",
  megaphone: "Megaphone",
  scale: "Scales of justice",
  users: "People",
};

export const sections: SectionDef[] = [
  {
    key: "site",
    group: "Organisation",
    title: "Organisation details",
    Icon: Building2,
    description:
      "Name, tagline and contact details. Used in the header, footer, hero, contact page and every form.",
    shape: "object",
    fields: [
      {
        kind: "image",
        key: "logo",
        label: "Logo",
        shape: "logo",
        help: "Shown in the header, footer, dashboard and browser tab. A square PNG with a transparent background works best. Leave empty to use the built-in emblem.",
        wide: true,
      },
      { kind: "text", key: "name", label: "Organisation name" },
      { kind: "text", key: "short", label: "Short name", help: "e.g. VES" },
      { kind: "text", key: "hindi", label: "Name in Hindi" },
      { kind: "number", key: "founded", label: "Year founded" },
      { kind: "text", key: "tagline", label: "Tagline", wide: true },
      {
        kind: "textarea",
        key: "description",
        label: "Short description",
        help: "Shown in the footer and in search results.",
        wide: true,
      },
      {
        kind: "email",
        key: "email",
        label: "Contact email",
        help: "Contact and application forms send to this address.",
      },
      { kind: "text", key: "phone", label: "Phone" },
      { kind: "textarea", key: "address", label: "Office address", rows: 2 },
      { kind: "text", key: "hours", label: "Office hours" },
      {
        kind: "group",
        key: "socials",
        label: "Social media links",
        help: "Leave a link empty to hide that icon.",
        wide: true,
        fields: [
          { kind: "url", key: "youtube", label: "YouTube channel" },
          { kind: "url", key: "linkedin", label: "LinkedIn" },
          { kind: "url", key: "instagram", label: "Instagram" },
          { kind: "url", key: "x", label: "X (Twitter)" },
        ],
      },
    ],
  },
  {
    key: "links",
    group: "Organisation",
    title: "Forms & links",
    Icon: Link2,
    description:
      "Links to your application forms (e.g. Google Forms). Leave a link empty to send people to the contact page instead.",
    shape: "object",
    fields: [
      {
        kind: "url",
        key: "joinFormUrl",
        label: "Join VES form",
        help: "Used by every “Join VES” and “Become a member” button.",
        wide: true,
      },
      {
        kind: "url",
        key: "scholarshipFormUrl",
        label: "Scholarship application form",
        help: "Used by the “Apply for a scholarship” button. Individual scholarships can also have their own form in Programmes → Scholarships.",
        wide: true,
      },
    ],
  },
  {
    key: "stats",
    group: "Organisation",
    title: "Headline numbers",
    Icon: BarChart3,
    description:
      "The counters in the hero, About and Journey pages. Member and state counts are added up automatically from the members map.",
    shape: "object",
    fields: [
      { kind: "number", key: "internshipsFacilitated", label: "Internships facilitated", min: 0 },
      { kind: "number", key: "eventsHeld", label: "Events & seminars held", min: 0 },
    ],
  },
  {
    key: "stateMembers",
    group: "Organisation",
    title: "Members map",
    Icon: Map,
    description:
      "Members and chapter cities per state. Drives the interactive map on the homepage, the total member count and the number of states reached.",
    shape: "map",
  },
  {
    key: "founder",
    group: "Organisation",
    title: "Founder",
    Icon: Crown,
    description: "The founder section on the homepage and About page.",
    shape: "object",
    fields: [
      {
        kind: "image",
        key: "photo",
        label: "Portrait",
        shape: "round",
        help: "Optional. Without a photo, initials are shown.",
        wide: true,
      },
      { kind: "text", key: "name", label: "Name" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "quote", label: "Quote", rows: 3, wide: true },
      {
        kind: "strings",
        key: "bio",
        label: "Biography",
        itemLabel: "paragraph",
        multiline: true,
        wide: true,
      },
      {
        kind: "strings",
        key: "credentials",
        label: "Credentials",
        itemLabel: "credential",
        wide: true,
      },
    ],
  },
  {
    key: "internships",
    group: "Programmes",
    title: "Internships",
    Icon: GraduationCap,
    description:
      "Openings on the Internships page. The first three are also featured on the homepage.",
    shape: "list",
    itemNoun: "internship",
    itemTitle: (i) => s(i.title) || "Untitled internship",
    itemSubtitle: (i) => [s(i.domain), s(i.location), s(i.mode)].filter(Boolean).join(" · "),
    newItem: () => ({
      id: crypto.randomUUID(),
      title: "",
      organization: "",
      location: "",
      mode: "On-site",
      domain: "Litigation",
      duration: "",
      stipend: "",
      deadline: "",
      seats: 1,
      description: "",
      eligibility: "",
      applyUrl: "",
    }),
    itemFields: [
      { kind: "text", key: "title", label: "Title", wide: true },
      { kind: "text", key: "organization", label: "Organisation / chambers", wide: true },
      {
        kind: "text",
        key: "domain",
        label: "Domain",
        help: "Used for the filter, e.g. Litigation, Corporate, Legal Aid",
      },
      {
        kind: "select",
        key: "mode",
        label: "Mode",
        options: internshipModes.map((m) => ({ value: m, label: m })),
      },
      { kind: "text", key: "location", label: "Location" },
      { kind: "text", key: "duration", label: "Duration", placeholder: "e.g. 4 weeks" },
      { kind: "text", key: "stipend", label: "Stipend", placeholder: "e.g. ₹5,000 / month" },
      { kind: "text", key: "deadline", label: "Apply by", placeholder: "e.g. 31 Oct 2026" },
      { kind: "number", key: "seats", label: "Seats", min: 0 },
      { kind: "textarea", key: "description", label: "Description", wide: true },
      { kind: "text", key: "eligibility", label: "Eligibility", wide: true },
      {
        kind: "url",
        key: "applyUrl",
        label: "Application form link",
        help: "The “Apply now” button opens this form. Leave empty to let students apply by email.",
        wide: true,
      },
    ],
  },
  {
    key: "internshipSteps",
    group: "Programmes",
    title: "How internships work",
    Icon: ListOrdered,
    description: "The numbered steps at the top of the Internships page.",
    shape: "list",
    itemNoun: "step",
    itemTitle: (i) => s(i.title) || "Untitled step",
    newItem: () => ({ title: "", text: "" }),
    itemFields: [
      { kind: "text", key: "title", label: "Title", wide: true },
      { kind: "textarea", key: "text", label: "Text", rows: 2, wide: true },
    ],
  },
  {
    key: "internshipFaqs",
    group: "Programmes",
    title: "Internship FAQs",
    Icon: HelpCircle,
    description: "Questions and answers at the bottom of the Internships page.",
    shape: "list",
    itemNoun: "question",
    itemTitle: (i) => s(i.q) || "Untitled question",
    newItem: () => ({ q: "", a: "" }),
    itemFields: [
      { kind: "text", key: "q", label: "Question", wide: true },
      { kind: "textarea", key: "a", label: "Answer", wide: true },
    ],
  },
  {
    key: "scholarships",
    group: "Programmes",
    title: "Scholarships",
    Icon: Award,
    description: "The scholarships section on the homepage and Internships page.",
    shape: "list",
    itemNoun: "scholarship",
    itemTitle: (i) => s(i.title) || "Untitled scholarship",
    itemSubtitle: (i) => s(i.amount),
    newItem: () => ({ title: "", amount: "", text: "", deadline: "", applyUrl: "" }),
    itemFields: [
      { kind: "text", key: "title", label: "Name", wide: true },
      { kind: "text", key: "amount", label: "Amount", placeholder: "e.g. ₹25,000" },
      {
        kind: "text",
        key: "deadline",
        label: "Deadline",
        placeholder: "e.g. 30 Nov 2026 or Rolling",
      },
      { kind: "textarea", key: "text", label: "Description", rows: 2, wide: true },
      {
        kind: "url",
        key: "applyUrl",
        label: "Application form link",
        help: "Optional. Adds an “Apply” link to this scholarship.",
        wide: true,
      },
    ],
  },
  {
    key: "news",
    group: "Updates",
    title: "Inside VES news",
    Icon: Newspaper,
    description: "Text-only news on the homepage. List the newest item first.",
    shape: "list",
    itemNoun: "news item",
    itemTitle: (i) => s(i.title) || "Untitled news",
    itemSubtitle: (i) => [s(i.date), s(i.category)].filter(Boolean).join(" · "),
    newItem: () => ({ date: "", category: "Announcement", title: "", text: "" }),
    itemFields: [
      { kind: "text", key: "date", label: "Date", placeholder: "e.g. 28 Sep 2026" },
      { kind: "text", key: "category", label: "Category", placeholder: "e.g. Announcement" },
      { kind: "text", key: "title", label: "Headline", wide: true },
      { kind: "textarea", key: "text", label: "Text", rows: 3, wide: true },
    ],
  },
  {
    key: "videos",
    group: "Updates",
    title: "YouTube videos",
    Icon: MonitorPlay,
    description:
      "Videos on the homepage and gallery page. The first one is shown large. The channel link is set in Organisation details.",
    shape: "list",
    itemNoun: "video",
    itemTitle: (i) => s(i.title) || "Untitled video",
    itemSubtitle: (i) => (s(i.youtubeId) ? `youtu.be/${s(i.youtubeId)}` : "No video linked yet"),
    newItem: () => ({ youtubeId: "", title: "", duration: "", image: "" }),
    itemFields: [
      { kind: "text", key: "title", label: "Title", wide: true },
      {
        kind: "text",
        key: "youtubeId",
        label: "YouTube link or ID",
        help: "Paste the video link — it plays on the site. Leave empty to link to the channel.",
        transform: youtubeIdFrom,
      },
      { kind: "text", key: "duration", label: "Duration", placeholder: "e.g. 12:48" },
      {
        kind: "image",
        key: "image",
        label: "Custom thumbnail",
        shape: "wide",
        help: "Optional. YouTube's own thumbnail is used otherwise.",
        wide: true,
      },
    ],
  },
  {
    key: "members",
    group: "People",
    title: "Members",
    Icon: Users,
    description: "The core-team carousel on the homepage. Reorder with the arrows.",
    shape: "list",
    itemNoun: "member",
    itemTitle: (i) => s(i.name) || "Unnamed member",
    itemSubtitle: (i) => [s(i.role), s(i.state)].filter(Boolean).join(" · "),
    newItem: () => ({ name: "", role: "", state: "", photo: "" }),
    itemFields: [
      { kind: "image", key: "photo", label: "Photo", shape: "round", help: "Optional", wide: true },
      { kind: "text", key: "name", label: "Name" },
      { kind: "text", key: "role", label: "Role" },
      { kind: "text", key: "state", label: "State" },
    ],
  },
  {
    key: "patrons",
    group: "People",
    title: "Patrons",
    Icon: UserRound,
    description: "The patrons section on the homepage and About page.",
    shape: "list",
    itemNoun: "patron",
    itemTitle: (i) => s(i.name) || "Unnamed patron",
    itemSubtitle: (i) => s(i.title),
    newItem: () => ({ name: "", title: "Patron", detail: "", photo: "" }),
    itemFields: [
      { kind: "image", key: "photo", label: "Photo", shape: "round", help: "Optional", wide: true },
      { kind: "text", key: "name", label: "Name", wide: true },
      { kind: "text", key: "title", label: "Title", placeholder: "e.g. Chief Patron" },
      { kind: "text", key: "detail", label: "Designation", placeholder: "e.g. Senior Advocate" },
    ],
  },
  {
    key: "pillars",
    group: "About VES",
    title: "Four pillars",
    Icon: Columns3,
    description: "The four pillars band on the homepage and About page.",
    shape: "list",
    fixed: true,
    itemNoun: "pillar",
    itemTitle: (i) => s(i.title),
    itemSubtitle: (i) => s(i.hindi),
    newItem: () => ({}),
    itemFields: [
      { kind: "text", key: "title", label: "Title" },
      { kind: "text", key: "hindi", label: "Hindi word" },
      { kind: "textarea", key: "text", label: "Text", rows: 3, wide: true },
    ],
  },
  {
    key: "wings",
    group: "About VES",
    title: "Organisation wings",
    Icon: Network,
    description: "The wings explorer on the Wings page.",
    shape: "list",
    itemNoun: "wing",
    itemTitle: (i) => s(i.name) || "Untitled wing",
    itemSubtitle: (i) => (s(i.head) ? `Head: ${s(i.head)}` : ""),
    newItem: () => ({
      key: crypto.randomUUID().slice(0, 8),
      icon: "scale",
      name: "",
      head: "",
      summary: "",
      activities: [],
    }),
    itemFields: [
      { kind: "text", key: "name", label: "Wing name" },
      {
        kind: "select",
        key: "icon",
        label: "Icon",
        options: wingIcons.map((i) => ({ value: i, label: wingIconLabels[i] })),
      },
      { kind: "text", key: "head", label: "Wing head" },
      { kind: "textarea", key: "summary", label: "Summary", rows: 2, wide: true },
      {
        kind: "strings",
        key: "activities",
        label: "Key activities",
        itemLabel: "activity",
        wide: true,
      },
    ],
  },
  {
    key: "journey",
    group: "About VES",
    title: "Journey timeline",
    Icon: CalendarClock,
    description: "Milestones on the Journey page, oldest first.",
    shape: "list",
    itemNoun: "milestone",
    itemTitle: (i) => [s(i.year), s(i.title)].filter(Boolean).join(" — ") || "Untitled milestone",
    newItem: () => ({ year: "", title: "", text: "" }),
    itemFields: [
      { kind: "text", key: "year", label: "Year" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "text", label: "Text", rows: 3, wide: true },
    ],
  },
];

export const sectionGroups = Array.from(new Set(sections.map((s) => s.group)));
