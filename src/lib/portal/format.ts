const dateTime = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

const dateOnly = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "12 Nov 2026, 5:00 pm" in India time. */
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** "2026-11-01" → "1 Nov 2026". */
export const formatDate = (isoDate: string) => dateOnly.format(new Date(`${isoDate}T00:00:00Z`));

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "in 3 days", "2 hours ago" relative to `now`. */
export function relativeTo(iso: string, now: number) {
  const seconds = (new Date(iso).getTime() - now) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
