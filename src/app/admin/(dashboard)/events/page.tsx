import type { Metadata } from "next";

import { getAdminSession } from "@/lib/content/admin";
import { toEventItem, type EventRow } from "@/lib/content/queries";
import { EventsManager } from "@/components/admin/events-manager";

export const metadata: Metadata = { title: "Events" };

export default async function AdminEventsPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, location, start_date, end_date, description, image_url, published")
    .order("start_date", { ascending: false });

  const rows = (data ?? []) as EventRow[];
  const events = rows.map((row) => ({ ...toEventItem(row), imagePath: row.image_url }));

  return <EventsManager events={events} loadError={error?.message} />;
}
