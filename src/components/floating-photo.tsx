"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/supabase/env";
import { Photo } from "@/components/photo";
import { easeOut } from "@/components/motion";

/**
 * A framed landscape photo that fades in, then drifts gently up and down.
 * Purely decorative: position and size come from `className`, and it never
 * blocks clicks on whatever it overlaps.
 */
export function FloatingPhoto({
  src,
  className,
  rotate = 0,
  delay = 0,
  drift = 8,
  duration = 7,
  aspect = "aspect-[3/2]",
  sizes = "240px",
}: {
  src: string;
  className?: string;
  rotate?: number;
  delay?: number;
  drift?: number;
  duration?: number;
  aspect?: string;
  sizes?: string;
}) {
  if (!src) return null;
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.92, rotate }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: easeOut, delay }}
      className={cn("pointer-events-none absolute", className)}
    >
      <motion.div
        animate={{ y: [0, -drift, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay: delay + 0.9 }}
        className={cn(
          "relative overflow-hidden rounded-md border-4 border-white bg-muted shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5",
          aspect,
        )}
      >
        <Photo src={mediaUrl(src)} alt="" fill sizes={sizes} />
      </motion.div>
    </motion.div>
  );
}
