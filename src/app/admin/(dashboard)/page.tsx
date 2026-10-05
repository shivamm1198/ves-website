import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Images, NotebookPen, PenSquare } from "lucide-react";

import { getAdminSession } from "@/lib/content/admin";
import { contentKeys } from "@/lib/content/schema";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RelativeTime } from "@/components/admin/relative-time";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const { supabase } = await getAdminSession();

  const [events, drafts, gallery, content, articles] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("gallery_items").select("id", { count: "exact", head: true }),
    supabase
      .from("site_content")
      .select("key, updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("articles").select("id", { count: "exact", head: true }),
  ]);

  const lastEdit = content.data?.[0]?.updated_at ?? null;
  const cards = [
    {
      href: "/admin/content",
      Icon: PenSquare,
      title: "Homepage editor",
      text: "Organisation details, map, founder, internships, scholarships, news, members, patrons, videos, pillars, wings and journey.",
      stat: `${content.data?.length ?? 0} of ${contentKeys.length} sections customised`,
      updated: lastEdit,
    },
    {
      href: "/admin/events",
      Icon: CalendarDays,
      title: "Events",
      text: "Create, edit, hide or delete events with a cover photo.",
      stat: `${events.count ?? 0} events${drafts.count ? ` · ${drafts.count} hidden` : ""}`,
    },
    {
      href: "/admin/gallery",
      Icon: Images,
      title: "Gallery",
      text: "Upload photos in bulk, set captions and categories, remove old ones.",
      stat: `${gallery.count ?? 0} photos`,
    },
    {
      href: "/admin/journal",
      Icon: NotebookPen,
      title: "Student Journal",
      text: "Publish student articles with an attached PDF or Word paper.",
      stat: articles.error
        ? "Run supabase/journal.sql to enable"
        : `${articles.count ?? 0} articles`,
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Welcome back"
        description="Everything on the website is managed from here. Changes go live as soon as you save."
      />
      <div className="grid gap-5 p-5 sm:p-8 md:grid-cols-2 2xl:grid-cols-4">
        {cards.map(({ href, Icon, title, text, stat, updated }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-white p-6 transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.35)]"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 gold-gradient transition-transform duration-500 group-hover:scale-x-100" />
            <span className="grid size-11 place-items-center rounded-full border text-ink">
              <Icon className="size-5" strokeWidth={1.5} />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            <div className="mt-6 flex items-end justify-between gap-3 border-t pt-4">
              <div className="text-sm">
                <p className="font-medium text-ink">{stat}</p>
                {updated && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Last edited <RelativeTime date={updated} />
                  </p>
                )}
              </div>
              <ArrowRight className="size-4 text-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-ink" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
