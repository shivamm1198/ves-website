import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ArticleItem, SectionText } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/journal/article-card";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

/** Latest Student Journal articles; hidden until at least one is published. */
export function JournalSection({
  articles,
  text,
}: {
  articles: ArticleItem[];
  text: Pick<SectionText, "journalEyebrow" | "journalTitle" | "journalDescription">;
}) {
  if (articles.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          eyebrow={text.journalEyebrow}
          title={text.journalTitle || "Student Journal"}
          description={text.journalDescription || undefined}
        />
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/journal">
            Read the journal <ArrowRight />
          </Link>
        </Button>
      </div>
      <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((a) => (
          <StaggerItem key={a.id}>
            <ArticleCard article={a} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
