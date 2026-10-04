"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/content/schema";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Photo } from "@/components/photo";

export function GalleryGrid({ gallery }: { gallery: GalleryItem[] }) {
  const categories = ["All", ...Array.from(new Set(gallery.map((g) => g.category)))];
  const [category, setCategory] = React.useState("All");
  const [index, setIndex] = React.useState<number | null>(null);

  const items = gallery.filter((g) => category === "All" || g.category === category);
  const active: GalleryItem | null = index === null ? null : items[index];

  const step = React.useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  React.useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  return (
    <>
      <div
        className="flex flex-wrap gap-2 border-b pb-6"
        role="tablist"
        aria-label="Filter gallery"
      >
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "relative rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              category === c
                ? "border-ink text-white"
                : "border-foreground/15 text-foreground/65 hover:border-foreground/40 hover:text-ink",
            )}
          >
            {category === c && (
              <motion.span
                layoutId="gallery-pill"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">
              {c}
              <span
                className={cn(
                  "ml-1.5 text-xs",
                  category === c ? "text-gold-light" : "text-muted-foreground",
                )}
              >
                {c === "All" ? gallery.length : gallery.filter((g) => g.category === c).length}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Re-keyed per category so each filter fades in as a fresh set */}
      <div key={category} className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setIndex(i)}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg text-left"
            style={{ aspectRatio: `${item.w} / ${item.h}` }}
            aria-label={`Open photo: ${item.title}`}
          >
            <Photo
              src={item.src}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Expand className="size-4" />
            </span>
            <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-[11px] tracking-[0.2em] text-gold-light uppercase">
                {item.category}
              </p>
              <p className="mt-1 font-medium text-white">{item.title}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent className="gap-0 overflow-hidden border-0 bg-ink p-0 text-white sm:max-w-5xl [&>button]:text-white">
          {active && (
            <>
              <div className="relative h-[70dvh] max-h-[720px] w-full bg-black">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <Photo
                      src={active.src}
                      alt={active.title}
                      fill
                      sizes="90vw"
                      className="bg-black object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
                <LightboxButton side="left" onClick={() => step(-1)} />
                <LightboxButton side="right" onClick={() => step(1)} />
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4">
                <div>
                  <DialogTitle className="font-serif text-xl text-white">
                    {active.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs tracking-[0.2em] text-gold-light uppercase">
                    {active.category}
                  </DialogDescription>
                </div>
                <p className="font-serif text-white/50 tabular-nums">
                  {(index ?? 0) + 1} / {items.length}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function LightboxButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-ink",
        side === "left" ? "left-4" : "right-4",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
