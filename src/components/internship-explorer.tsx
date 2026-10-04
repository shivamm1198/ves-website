"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Internship } from "@/lib/content/schema";
import { Input } from "@/components/ui/input";
import { InternshipCard } from "@/components/internship-card";

const modes = ["Any mode", "On-site", "Hybrid", "Remote"] as const;

export function InternshipExplorer({
  internships,
  email,
}: {
  internships: Internship[];
  email: string;
}) {
  const domains = ["All", ...Array.from(new Set(internships.map((i) => i.domain)))];
  const [domain, setDomain] = React.useState("All");
  const [mode, setMode] = React.useState<(typeof modes)[number]>("Any mode");
  const [query, setQuery] = React.useState("");

  const results = internships.filter((i: Internship) => {
    const q = query.trim().toLowerCase();
    return (
      (domain === "All" || i.domain === domain) &&
      (mode === "Any mode" || i.mode === mode) &&
      (!q || [i.title, i.organization, i.location].some((f) => f.toLowerCase().includes(q)))
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 lg:pb-0"
          role="tablist"
          aria-label="Filter by domain"
        >
          {domains.map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={domain === d}
              onClick={() => setDomain(d)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                domain === d ? "text-white" : "text-foreground/60 hover:text-ink",
              )}
            >
              {domain === d && (
                <motion.span
                  layoutId="domain-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative">{d}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="relative flex-1 lg:w-64">
            <span className="sr-only">Search internships</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or firm"
              className="h-10 pl-9"
            />
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as (typeof modes)[number])}
            aria-label="Filter by mode"
            className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            {modes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-ink">{results.length}</span> of{" "}
        {internships.length} openings
      </p>

      <motion.div layout className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <InternshipCard item={item} email={email} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {results.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed px-6 py-16 text-center">
          <p className="font-serif text-2xl text-ink">No openings match those filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another domain — or register with VES to hear about new openings first.
          </p>
        </div>
      )}
    </div>
  );
}
