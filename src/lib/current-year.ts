import "server-only";

import { cacheLife } from "next/cache";

/** The current year, cached for a day so prerendered pages stay current. */
export async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
