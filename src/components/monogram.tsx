import { cn } from "@/lib/utils";
import { initialsOf } from "@/lib/content/derive";
import { Photo } from "@/components/photo";

export function Monogram({
  initials,
  className,
  tone = "ink",
}: {
  initials: string;
  className?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative grid aspect-square place-items-center overflow-hidden rounded-full font-serif font-semibold tracking-wide",
        tone === "ink" ? "bg-ink text-white" : "border border-foreground/10 bg-paper text-ink",
        className,
      )}
    >
      <span className="absolute inset-[6%] rounded-full border border-gold/50" />
      <span className="relative">{initials}</span>
    </div>
  );
}

/** A portrait photo when one is set, otherwise the name's monogram. */
export function Avatar({
  name,
  photo,
  className,
  tone = "ink",
  sizes = "128px",
}: {
  name: string;
  photo?: string;
  className?: string;
  tone?: "ink" | "paper";
  sizes?: string;
}) {
  if (!photo) return <Monogram initials={initialsOf(name)} tone={tone} className={className} />;
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-full ring-1 ring-gold/40",
        className,
      )}
    >
      <Photo src={photo} alt={name} fill sizes={sizes} />
    </div>
  );
}
