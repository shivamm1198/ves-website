import type { SiteContent } from "./schema";

const HONORIFICS =
  /^(adv\.?|advocate|sr\.?|senior|hon'?ble|justice|\(retd\.?\)|retd\.?|prof\.?|\(dr\.?\)|dr\.?|mr\.?|mrs\.?|ms\.?|shri|smt\.?)$/i;

/** "Hon'ble Justice (Retd.) S. N. Kashyap" → "SK" */
export function initialsOf(name: string) {
  const parts = name
    .split(/\s+/)
    .filter((p) => p && !HONORIFICS.test(p))
    .map((p) => p.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function memberTotals(stateMembers: SiteContent["stateMembers"]) {
  const counts = Object.values(stateMembers);
  return {
    total: counts.reduce((sum, s) => sum + s.members, 0),
    states: counts.filter((s) => s.members > 0).length,
  };
}

export type Stat = { value: number; suffix: string; label: string };

/** Headline numbers; member and state counts always come from the map data. */
export function buildStats(content: Pick<SiteContent, "stateMembers" | "stats">): Stat[] {
  const { total, states } = memberTotals(content.stateMembers);
  return [
    { value: total, suffix: "", label: "Members nationwide" },
    { value: content.stats.internshipsFacilitated, suffix: "+", label: "Internships facilitated" },
    { value: content.stats.eventsHeld, suffix: "", label: "Events & seminars" },
    { value: states, suffix: "", label: "States & UTs reached" },
  ];
}

const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const [day, month, year] = dayMonthYear.format(date).split(" ");
  return { day, month, year };
}

/** "2026-08-14" + "2026-08-16" → "14 – 16 Aug 2026" */
export function formatEventDate(start: string, end?: string | null) {
  const s = parts(start);
  if (!end || end === start) return `${s.day} ${s.month} ${s.year}`;
  const e = parts(end);
  if (s.year !== e.year) return `${s.day} ${s.month} ${s.year} – ${e.day} ${e.month} ${e.year}`;
  if (s.month !== e.month) return `${s.day} ${s.month} – ${e.day} ${e.month} ${e.year}`;
  return `${s.day} – ${e.day} ${e.month} ${e.year}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}
