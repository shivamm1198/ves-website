import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Download, FileText } from "lucide-react";

import { getArticle, getArticles } from "@/lib/content/queries";
import type { ArticleItem } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/journal/article-card";
import { Photo } from "@/components/photo";
import { Reveal } from "@/components/motion";

export async function generateStaticParams() {
  const articles = await getArticles();
  // Cache Components needs at least one param; unknown slugs still render on demand.
  return articles.length > 0
    ? articles.slice(0, 20).map((a) => ({ slug: a.slug }))
    : [{ slug: "coming-soon" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.summary || undefined,
    authors: article.author ? [{ name: article.author }] : undefined,
  };
}

export default function ArticlePage({ params }: PageProps<"/journal/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <Article params={params} />
    </Suspense>
  );
}

async function Article({ params }: Pick<PageProps<"/journal/[slug]">, "params">) {
  const { slug } = await params;
  const [article, all] = await Promise.all([getArticle(slug), getArticles()]);
  if (!article) notFound();

  const paragraphs = article.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const more = all.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b bg-paper">
          <div className="paper-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="relative mx-auto max-w-3xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink"
            >
              <ArrowLeft className="size-4" /> Student Journal
            </Link>
            <Reveal className="mt-8 flex flex-col gap-5">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {article.category && (
                  <span className="font-semibold tracking-[0.18em] text-gold-dark uppercase">
                    {article.category}
                  </span>
                )}
                <time dateTime={article.date}>{article.dateLabel}</time>
                {article.body && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5 text-gold" /> {article.readingMinutes} min read
                  </span>
                )}
              </p>
              <h1 className="text-4xl leading-[1.08] font-semibold text-balance text-ink sm:text-5xl">
                {article.title}
              </h1>
              {article.summary && (
                <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
                  {article.summary}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                {article.author ? (
                  <p className="text-sm">
                    <span className="font-semibold text-ink">{article.author}</span>
                    {article.authorDetail && (
                      <span className="block text-muted-foreground">{article.authorDetail}</span>
                    )}
                  </p>
                ) : (
                  <span />
                )}
                {article.documentUrl && <DownloadButton article={article} />}
              </div>
            </Reveal>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          {article.cover && (
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-lg">
              <Photo src={article.cover} alt="" fill sizes="(min-width: 768px) 768px, 100vw" />
            </div>
          )}
          {paragraphs.length > 0 && (
            <div className="flex flex-col gap-6 font-serif text-xl leading-relaxed text-ink/90">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          )}

          {article.documentUrl && (
            <div className="mt-14 flex flex-col gap-4 rounded-lg border bg-paper p-6 sm:flex-row sm:items-center">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border bg-white">
                <FileText className="size-5 text-gold" strokeWidth={1.5} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-semibold text-ink">Read the full paper</p>
                <p className="truncate text-sm text-muted-foreground">
                  {article.documentName || "Attached document"}
                </p>
              </div>
              <DownloadButton article={article} />
            </div>
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t bg-paper">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-ink">More from the journal</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function DownloadButton({ article }: { article: ArticleItem }) {
  const isPdf = /\.pdf$/i.test(article.documentName);
  return (
    <Button asChild>
      <a href={article.documentUrl} target="_blank" rel="noopener noreferrer">
        <Download /> Download {isPdf ? "PDF" : "paper"}
      </a>
    </Button>
  );
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-20 sm:px-6">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="mt-8 h-12 w-full rounded bg-muted" />
      <div className="mt-3 h-12 w-2/3 rounded bg-muted" />
      <div className="mt-10 space-y-3">
        <div className="h-4 rounded bg-muted" />
        <div className="h-4 rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}
