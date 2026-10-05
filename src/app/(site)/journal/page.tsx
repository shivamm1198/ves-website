import type { Metadata } from "next";
import { NotebookPen } from "lucide-react";

import { getArticles, getContent } from "@/lib/content/queries";
import { ArticleCard } from "@/components/journal/article-card";
import { PageHero } from "@/components/page-hero";
import { Stagger, StaggerItem } from "@/components/motion";

export async function generateMetadata(): Promise<Metadata> {
  const { sectionText, site } = await getContent();
  return {
    title: sectionText.journalEyebrow || "Student Journal",
    description:
      sectionText.journalDescription || `Articles by law students, published by ${site.name}.`,
  };
}

export default async function JournalPage() {
  const [{ sectionText: text }, articles] = await Promise.all([getContent(), getArticles()]);

  return (
    <>
      <PageHero
        eyebrow={text.journalEyebrow}
        title={text.journalTitle || "Student Journal"}
        description={text.journalDescription || undefined}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-20 text-center">
            <NotebookPen className="size-10 text-gold" strokeWidth={1.3} />
            <p className="mt-4 font-serif text-2xl text-ink">The first articles are on their way</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon.</p>
          </div>
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <StaggerItem key={a.id}>
                <ArticleCard article={a} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
