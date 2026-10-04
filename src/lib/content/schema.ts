import { z } from "zod";

/**
 * Validation for every section of editable site content. The same schemas
 * guard dashboard saves and reads from the database, so a malformed row
 * can never break the public site (it falls back to the default instead).
 */

const str = z.string().trim();
const optionalStr = z.string().trim().default("");
/** Empty, or a full web link (e.g. a Google Form). */
const optionalUrl = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^https?:\/\/\S+$/i.test(v),
    "Enter a full link starting with https://",
  )
  .default("");
const strList = z.array(z.string().trim().min(1));

export const siteSchema = z.object({
  name: str.min(1, "Name is required"),
  short: str.min(1),
  logo: optionalStr,
  hindi: optionalStr,
  tagline: optionalStr,
  description: optionalStr,
  founded: z.number().int().min(1900).max(2100),
  email: z.email("Enter a valid email"),
  phone: optionalStr,
  address: optionalStr,
  hours: optionalStr,
  socials: z.object({
    youtube: optionalStr,
    linkedin: optionalStr,
    instagram: optionalStr,
    x: optionalStr,
  }),
});

export const linksSchema = z.object({
  joinFormUrl: optionalUrl,
  scholarshipFormUrl: optionalUrl,
});

export const statsSchema = z.object({
  internshipsFacilitated: z.number().int().min(0),
  eventsHeld: z.number().int().min(0),
});

export const stateMembersSchema = z.record(
  z.string(),
  z.object({ members: z.number().int().min(0), cities: strList }),
);

export const founderSchema = z.object({
  name: str.min(1, "Name is required"),
  title: optionalStr,
  photo: optionalStr,
  quote: optionalStr,
  bio: strList,
  credentials: strList,
});

export const pillarKeys = ["integrity", "unity", "justice", "empowerment"] as const;

export const pillarsSchema = z
  .array(
    z.object({
      key: z.enum(pillarKeys),
      title: str.min(1),
      hindi: optionalStr,
      text: optionalStr,
    }),
  )
  .length(4);

export const internshipModes = ["On-site", "Hybrid", "Remote"] as const;

export const internshipSchema = z.object({
  id: str.min(1),
  title: str.min(1, "Title is required"),
  organization: optionalStr,
  location: optionalStr,
  mode: z.enum(internshipModes),
  domain: str.min(1, "Domain is required"),
  duration: optionalStr,
  stipend: optionalStr,
  deadline: optionalStr,
  seats: z.number().int().min(0),
  description: optionalStr,
  eligibility: optionalStr,
  applyUrl: optionalUrl,
});

export const internshipsSchema = z.array(internshipSchema);

export const internshipStepsSchema = z.array(z.object({ title: str.min(1), text: optionalStr }));

export const internshipFaqsSchema = z.array(z.object({ q: str.min(1), a: optionalStr }));

export const scholarshipsSchema = z.array(
  z.object({
    title: str.min(1),
    amount: optionalStr,
    text: optionalStr,
    deadline: optionalStr,
    applyUrl: optionalUrl,
  }),
);

export const newsSchema = z.array(
  z.object({ date: optionalStr, category: optionalStr, title: str.min(1), text: optionalStr }),
);

export const membersSchema = z.array(
  z.object({ name: str.min(1), role: optionalStr, state: optionalStr, photo: optionalStr }),
);

export const patronsSchema = z.array(
  z.object({ name: str.min(1), title: optionalStr, detail: optionalStr, photo: optionalStr }),
);

export const videosSchema = z.array(
  z.object({
    youtubeId: optionalStr,
    title: str.min(1),
    duration: optionalStr,
    image: optionalStr,
  }),
);

export const wingIcons = [
  "briefcase",
  "hand-heart",
  "gavel",
  "book",
  "venus",
  "graduation-cap",
  "calendar",
  "megaphone",
  "scale",
  "users",
] as const;

export const wingsSchema = z.array(
  z.object({
    key: str.min(1),
    icon: z.enum(wingIcons),
    name: str.min(1),
    head: optionalStr,
    summary: optionalStr,
    activities: strList,
  }),
);

export const journeySchema = z.array(
  z.object({ year: str.min(1), title: str.min(1), text: optionalStr }),
);

/** Every editable section, keyed by its row key in `site_content`. */
export const contentSchemas = {
  site: siteSchema,
  links: linksSchema,
  stats: statsSchema,
  stateMembers: stateMembersSchema,
  founder: founderSchema,
  pillars: pillarsSchema,
  internships: internshipsSchema,
  internshipSteps: internshipStepsSchema,
  internshipFaqs: internshipFaqsSchema,
  scholarships: scholarshipsSchema,
  news: newsSchema,
  members: membersSchema,
  patrons: patronsSchema,
  videos: videosSchema,
  wings: wingsSchema,
  journey: journeySchema,
} as const;

export type ContentKey = keyof typeof contentSchemas;
export const contentKeys = Object.keys(contentSchemas) as ContentKey[];

export type SiteContent = { [K in ContentKey]: z.infer<(typeof contentSchemas)[K]> };

export type Site = SiteContent["site"];
export type Links = SiteContent["links"];
export type Founder = SiteContent["founder"];
export type Pillar = SiteContent["pillars"][number];
export type Internship = SiteContent["internships"][number];
export type Member = SiteContent["members"][number];
export type Patron = SiteContent["patrons"][number];
export type Video = SiteContent["videos"][number];
export type Wing = SiteContent["wings"][number];
export type JourneyItem = SiteContent["journey"][number];

/* Events and gallery live in their own tables. */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

export const eventInputSchema = z
  .object({
    title: str.min(1, "Title is required").max(200),
    location: optionalStr,
    start_date: isoDate,
    end_date: z.union([isoDate, z.literal("")]).default(""),
    description: optionalStr,
    image_url: str.min(1, "Add an image"),
    published: z.boolean().default(true),
  })
  .refine((e) => !e.end_date || e.end_date >= e.start_date, {
    message: "End date can't be before the start date",
    path: ["end_date"],
  });

export type EventInput = z.infer<typeof eventInputSchema>;

export const galleryInputSchema = z.object({
  title: str.min(1, "Add a caption").max(200),
  category: str.min(1, "Pick a category").max(60),
  image_url: str.min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type GalleryInput = z.infer<typeof galleryInputSchema>;

/** An event as shown on the public site. */
export type EventItem = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  dateLabel: string;
  description: string;
  image: string;
  published: boolean;
};

/** A gallery photo as shown on the public site. */
export type GalleryItem = {
  id: string;
  src: string;
  title: string;
  category: string;
  w: number;
  h: number;
};
