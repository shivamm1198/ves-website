import type { Metadata } from "next";

import { memberTotals } from "@/lib/content/derive";
import { joinHref } from "@/lib/content/links";
import { getContent } from "@/lib/content/queries";
import { fillTokens, numberWord } from "@/lib/content/tokens";
import { JoinCta } from "@/components/home/join-cta";
import { PageHero } from "@/components/page-hero";
import { WingsExplorer } from "@/components/wings-explorer";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  const { site, wingsPage } = await getContent();
  return {
    title: "Organisation Wings",
    description:
      wingsPage.heroDescription ||
      `The specialised wings through which ${site.name} runs its programmes.`,
  };
}

export default async function WingsPage() {
  const { wings, stateMembers, links, sectionText, wingsPage: page } = await getContent();
  // Placeholders editors can use in this page's text.
  const tokens = {
    count: numberWord(wings.length),
    wings: wings.length,
    states: memberTotals(stateMembers).states,
  };
  const tiers = page.tiers;
  // Each tier is a little wider than the one above it, like a pyramid.
  const widthFor = (i: number) => (tiers.length > 1 ? 60 + (i * 40) / (tiers.length - 1) : 100);

  return (
    <>
      <PageHero
        eyebrow={fillTokens(page.heroEyebrow, tokens)}
        title={fillTokens(page.heroTitle, tokens)}
        description={fillTokens(page.heroDescription, tokens) || undefined}
      />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <WingsExplorer wings={wings} />
      </section>

      {tiers.length > 0 && (
        <section className="border-y bg-paper">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            {page.structureTitle && (
              <SectionHeading
                align="center"
                eyebrow={fillTokens(page.structureEyebrow, tokens)}
                title={fillTokens(page.structureTitle, tokens)}
              />
            )}
            <Stagger className="mx-auto mt-16 flex max-w-3xl flex-col items-center">
              {tiers.map((s, i) => (
                <StaggerItem key={`${i}-${s.tier}`} className="flex w-full flex-col items-center">
                  {i > 0 && (
                    <span aria-hidden className="h-10 w-px bg-gradient-to-b from-gold to-border" />
                  )}
                  <div
                    className="w-full rounded-lg border bg-white px-6 py-6 text-center sm:max-w-[var(--w)] sm:px-10"
                    style={{ "--w": `${widthFor(i)}%` } as React.CSSProperties}
                  >
                    {s.count && (
                      <p className="text-[11px] font-semibold tracking-[0.22em] text-gold-dark uppercase">
                        {fillTokens(s.count, tokens)}
                      </p>
                    )}
                    <h3 className="mt-2 text-2xl font-semibold text-ink">
                      {fillTokens(s.tier, tokens)}
                    </h3>
                    {s.text && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {fillTokens(s.text, tokens)}
                      </p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <JoinCta joinHref={joinHref(links)} text={sectionText} />
    </>
  );
}
