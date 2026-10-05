import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SectionText } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { SmartLink } from "@/components/smart-link";

export type JoinText = Pick<
  SectionText,
  "joinTitle" | "joinText" | "joinButtonLabel" | "joinSecondaryLabel"
>;

export function JoinCta({ joinHref, text }: { joinHref: string; text: JoinText }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="relative overflow-hidden rounded-xl border bg-white px-8 py-14 text-center sm:px-16">
        <div className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <span className="h-[3px] w-14 gold-gradient" />
          <h2 className="text-4xl leading-tight font-semibold text-balance text-ink sm:text-5xl">
            {text.joinTitle}
          </h2>
          {text.joinText && <p className="text-muted-foreground">{text.joinText}</p>}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <SmartLink href={joinHref}>
                {text.joinButtonLabel || "Join"} <ArrowRight />
              </SmartLink>
            </Button>
            {text.joinSecondaryLabel && (
              <Button asChild size="lg" variant="outline">
                <Link href="/wings">{text.joinSecondaryLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
