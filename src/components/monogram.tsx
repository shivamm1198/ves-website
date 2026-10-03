import { cn } from "@/lib/utils";

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
