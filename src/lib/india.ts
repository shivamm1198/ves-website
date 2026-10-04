import india from "@svg-maps/india";

const NAMES: Record<string, string> = {
  jk: "Jammu & Kashmir and Ladakh",
  an: "Andaman & Nicobar Islands",
  dn: "Dadra & Nagar Haveli",
  dd: "Daman & Diu",
};

export const indiaViewBox = india.viewBox;

/** Every state / UT on the map, with display names. */
export const indiaStates = india.locations.map((l) => ({
  id: l.id,
  path: l.path,
  name: NAMES[l.id] ?? l.name ?? l.id,
}));
