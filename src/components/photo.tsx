import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = [/\.supabase\.co$/, /^i\.ytimg\.com$/];

/** Hosts next.config allows for optimisation; anything else is served as-is. */
function canOptimize(src: ImageProps["src"]) {
  if (typeof src !== "string") return true;
  if (src.endsWith(".svg")) return false;
  if (!/^https?:\/\//.test(src)) return true;
  try {
    const host = new URL(src).hostname;
    return OPTIMIZED_HOSTS.some((re) => re.test(host));
  } catch {
    return false;
  }
}

/** next/image with a neutral backdrop. */
export function Photo({ className, src, alt, unoptimized, ...props }: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={unoptimized || !canOptimize(src)}
      className={cn("bg-muted object-cover", className)}
      {...props}
    />
  );
}
