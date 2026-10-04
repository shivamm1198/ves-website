import type { z } from "zod";

/** Turns zod issues into one readable line, e.g. "Item 3 › Name: Required". */
export function describeIssues(error: z.ZodError) {
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path
        .map((p) => (typeof p === "number" ? `Item ${p + 1}` : humanize(String(p))))
        .join(" › ");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(" · ");
}

function humanize(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}
