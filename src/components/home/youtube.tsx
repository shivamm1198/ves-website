"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Video } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Photo } from "@/components/photo";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";
import { YoutubeIcon } from "@/components/social-icons";
import { mediaUrl } from "@/lib/supabase/env";

export function YoutubeSection({ videos, channelUrl }: { videos: Video[]; channelUrl: string }) {
  const [playing, setPlaying] = React.useState<Video | null>(null);
  const [feature, ...rest] = videos;

  // Videos without an id yet simply open the channel.
  const open = (v: Video) =>
    v.youtubeId ? setPlaying(v) : channelUrl && window.open(channelUrl, "_blank", "noopener");

  return (
    <section className="border-t bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="VES on YouTube"
            title="Watch, learn and stay informed"
            description="Event highlights, rights-awareness explainers and career guidance from practising lawyers."
          />
          <Button asChild className="shrink-0">
            <a href={channelUrl} target="_blank" rel="noreferrer">
              <YoutubeIcon className="size-4" /> Subscribe
            </a>
          </Button>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <VideoCard video={feature} onPlay={open} large />
          </Reveal>
          <div className="grid gap-6">
            {rest.map((v, i) => (
              <Reveal key={v.title} delay={0.1 * (i + 1)}>
                <VideoCard video={v} onPlay={open} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="overflow-hidden border-0 bg-black p-0 sm:max-w-4xl">
          <DialogTitle className="sr-only">{playing?.title}</DialogTitle>
          {playing && (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1&rel=0`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function VideoCard({
  video,
  onPlay,
  large,
}: {
  video: Video;
  onPlay: (v: Video) => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className={cn(
        "group relative block w-full overflow-hidden rounded-lg text-left",
        large ? "aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[420px]" : "aspect-[16/9]",
      )}
      aria-label={`Play: ${video.title}`}
    >
      <Photo
        src={
          video.image
            ? mediaUrl(video.image)
            : video.youtubeId
              ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
              : "/images/event-moot-court.svg"
        }
        alt=""
        fill
        unoptimized
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <motion.span
        whileHover={{ scale: 1.08 }}
        className={cn(
          "absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-xl transition-colors group-hover:bg-gold-light",
          large ? "size-20" : "size-14",
        )}
      >
        <Play className={cn("translate-x-0.5 fill-current", large ? "size-7" : "size-5")} />
      </motion.span>
      <div className={cn("absolute inset-x-0 bottom-0", large ? "p-7" : "p-5")}>
        <span className="rounded-sm bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">
          {video.duration}
        </span>
        <h3
          className={cn(
            "mt-3 leading-tight font-semibold text-white",
            large ? "text-3xl" : "text-xl",
          )}
        >
          {video.title}
        </h3>
      </div>
    </button>
  );
}
