import { Eyebrow } from "@/components/section-heading";
import { Reveal } from "@/components/motion";

/** Header band for inner pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b bg-paper">
      <div className="paper-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24 lg:px-8">
        <Reveal className="flex max-w-3xl flex-col gap-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-5xl leading-[1.02] font-semibold text-balance text-ink sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
              {description}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
