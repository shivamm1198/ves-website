import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { SmartLink } from "@/components/smart-link";

export function JoinCta({ joinHref }: { joinHref: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="relative overflow-hidden rounded-xl border bg-white px-8 py-14 text-center sm:px-16">
        <div className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <span className="h-[3px] w-14 gold-gradient" />
          <h2 className="text-4xl leading-tight font-semibold text-balance text-ink sm:text-5xl">
            Join India&apos;s fraternity of future lawyers
          </h2>
          <p className="text-muted-foreground">
            Membership is free for law students. Get early access to internships, scholarships,
            mentorship circles and every VES event.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <SmartLink href={joinHref}>
                Become a member <ArrowRight />
              </SmartLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/wings">Explore our wings</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
