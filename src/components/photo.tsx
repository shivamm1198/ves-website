import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

/** next/image with a neutral backdrop; SVG artwork is served as-is. */
export function Photo({ className, src, alt, ...props }: ImageProps) {
  const isSvg = typeof src === "string" && src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={isSvg}
      className={cn("bg-muted object-cover", className)}
      {...props}
    />
  );
}
