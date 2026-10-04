import type { Links } from "./schema";

/** Where "Join VES" buttons go: the form if one is set, else the contact page. */
export const joinHref = (links: Links) => links.joinFormUrl || "/contact?subject=membership";

/** Where scholarship "Apply" buttons go when a scholarship has no form of its own. */
export const scholarshipHref = (links: Links) =>
  links.scholarshipFormUrl || "/contact?subject=scholarship";
