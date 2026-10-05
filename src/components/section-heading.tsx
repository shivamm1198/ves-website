import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";

export function Eyebrow({
  children,
  className,
  inverse,
}: {
  children: React.ReactNode;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-xs font-semibold tracking-[0.22em] uppercase",
        inverse ? "text-gold-light" : "text-gold-dark",
        className,
      )}
    >
      <span className="h-px w-8 gold-gradient" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverse = false,
  className,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  inverse?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow inverse={inverse}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "max-w-3xl text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl",
          inverse ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-pretty sm:text-lg",
            inverse ? "text-white/65" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
      {children}
    </Reveal>
  );
}

/** A thin, restrained gold rule used to punctuate sections. */
export function GoldStrip({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-[3px] w-full gold-gradient", className)} />;
}
