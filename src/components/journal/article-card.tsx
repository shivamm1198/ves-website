import Link from "next/link";
import { ArrowUpRight, Clock, Paperclip } from "lucide-react";

import type { ArticleItem } from "@/lib/content/schema";
import { Photo } from "@/components/photo";

/** Journal article card: a closed box with a gold top strip, like the event cards. */
export function ArticleCard({ article }: { article: ArticleItem }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-white transition-shadow duration-300 hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.35)]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-[3px] gold-gradient opacity-80"
      />
      {article.cover && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Photo
            src={article.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {article.category && (
            <span className="font-semibold tracking-[0.16em] text-gold-dark uppercase">
              {article.category}
            </span>
          )}
          <span>{article.dateLabel}</span>
        </div>
        <h3 className="mt-3 text-2xl leading-tight font-semibold text-ink">
          <Link href={`/journal/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        {article.summary && (
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4 [&:not(:first-child)]:mt-6">
          <div className="min-w-0 text-sm">
            {article.author && <p className="truncate font-medium text-ink">{article.author}</p>}
            {article.authorDetail && (
              <p className="truncate text-xs text-muted-foreground">{article.authorDetail}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            {article.documentUrl && (
              <span className="inline-flex items-center gap-1" title="Paper attached">
                <Paperclip className="size-3.5 text-gold" /> Paper
              </span>
            )}
            {article.body && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 text-gold" /> {article.readingMinutes} min
              </span>
            )}
            <ArrowUpRight className="size-4 text-foreground/30 transition-colors group-hover:text-gold-dark" />
          </div>
        </div>
      </div>
    </article>
  );
}
