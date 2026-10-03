"use client";

import * as React from "react";
import Link from "next/link";
import india from "@svg-maps/india";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, MapPin, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { stateMembers, statesReached, totalMembers as total } from "@/data/site";
import { CountUp, easeOut } from "@/components/motion";

const NAMES: Record<string, string> = {
  jk: "Jammu & Kashmir and Ladakh",
  an: "Andaman & Nicobar Islands",
  dn: "Dadra & Nagar Haveli",
  dd: "Daman & Diu",
};

const locations = india.locations.map((l) => ({
  ...l,
  name: NAMES[l.id] ?? l.name ?? l.id,
  members: stateMembers[l.id]?.members ?? 0,
}));

const ranked = [...locations].sort((a, b) => b.members - a.members);

/** Monochrome density scale — darker means more members. */
const scale = [
  { min: 150, fill: "#111111", label: "150+" },
  { min: 80, fill: "#3b3a37", label: "80+" },
  { min: 40, fill: "#6e6c67", label: "40+" },
  { min: 15, fill: "#a19e97", label: "15+" },
  { min: 1, fill: "#cfccc5", label: "1+" },
  { min: 0, fill: "#efede8", label: "Soon" },
];

const fillFor = (members: number) => scale.find((s) => members >= s.min)!.fill;

type Point = { x: number; y: number };

/** Finds a point inside each state's shape to anchor its marker. */
function useAnchors(svgRef: React.RefObject<SVGSVGElement | null>) {
  const [anchors, setAnchors] = React.useState<Record<string, Point>>({});

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const next: Record<string, Point> = {};
    svg.querySelectorAll<SVGPathElement>("path[data-id]").forEach((path) => {
      const id = path.dataset.id!;
      const box = path.getBBox();
      const center = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2);
      if (path.isPointInFill(center)) {
        next[id] = { x: center.x, y: center.y };
        return;
      }
      // Concave shapes: pick the inside point nearest the bounding-box centre.
      let best: Point | null = null;
      let bestDist = Infinity;
      const steps = 14;
      for (let i = 1; i < steps; i++) {
        for (let j = 1; j < steps; j++) {
          const p = new DOMPoint(box.x + (box.width * i) / steps, box.y + (box.height * j) / steps);
          if (!path.isPointInFill(p)) continue;
          const d = (p.x - center.x) ** 2 + (p.y - center.y) ** 2;
          if (d < bestDist) {
            bestDist = d;
            best = { x: p.x, y: p.y };
          }
        }
      }
      next[id] = best ?? { x: center.x, y: center.y };
    });
    // Anchors depend on rendered geometry, so they can only be measured after mount.
    setAnchors(next);
  }, [svgRef]);

  return anchors;
}

export function IndiaMap({ className }: { className?: string }) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const anchors = useAnchors(svgRef);

  const [hovered, setHovered] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [cursor, setCursor] = React.useState<Point>({ x: 0, y: 0 });

  const hoveredLoc = locations.find((l) => l.id === hovered);
  const selectedLoc = locations.find((l) => l.id === selected);
  const highlight = hoveredLoc ?? selectedLoc;

  const onMove = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const toggle = (id: string) => setSelected((cur) => (cur === id ? null : id));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-paper shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="h-[3px] w-full gold-gradient" aria-hidden />
      <div className="paper-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-gold-dark uppercase">
            Our presence
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink">Members across India</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl leading-none font-semibold text-ink tabular-nums">
            <CountUp value={total} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">in {statesReached} states & UTs</p>
        </div>
      </div>

      {/* Map */}
      <div
        ref={wrapRef}
        className="relative mx-auto w-full max-w-[520px] px-3 sm:px-6"
        onPointerMove={onMove}
        onPointerLeave={() => setHovered(null)}
      >
        <svg
          ref={svgRef}
          viewBox={india.viewBox}
          role="group"
          aria-label="Interactive map of India showing VES members by state"
          className="h-auto w-full touch-manipulation select-none"
        >
          <defs>
            <linearGradient id="ves-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--gold-light)" />
              <stop offset="1" stopColor="var(--gold)" />
            </linearGradient>
            <filter id="ves-lift" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.28" />
            </filter>
          </defs>

          <g>
            {locations.map((loc, i) => {
              const isSelected = selected === loc.id;
              return (
                <motion.path
                  key={loc.id}
                  data-id={loc.id}
                  d={loc.path}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${loc.name}: ${loc.members} members`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOut, delay: 0.15 + i * 0.018 }}
                  fill={isSelected ? "var(--gold-dark)" : fillFor(loc.members)}
                  stroke="#ffffff"
                  strokeWidth={0.8}
                  strokeLinejoin="round"
                  className="cursor-pointer outline-none transition-[fill] duration-300 focus-visible:fill-[var(--gold)]"
                  onPointerEnter={() => setHovered(loc.id)}
                  onFocus={() => setHovered(loc.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => toggle(loc.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(loc.id);
                    }
                  }}
                />
              );
            })}
          </g>

          {/* Raised highlight of the active state */}
          <AnimatePresence>
            {highlight && (
              <motion.path
                key={highlight.id}
                d={highlight.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                fill={hoveredLoc ? "url(#ves-gold)" : "var(--gold-dark)"}
                stroke="#ffffff"
                strokeWidth={1.2}
                filter="url(#ves-lift)"
                pointerEvents="none"
              />
            )}
          </AnimatePresence>

          {/* Pulsing markers on the strongest chapters */}
          <g pointerEvents="none">
            {ranked.slice(0, 8).map((loc, i) => {
              const a = anchors[loc.id];
              if (!a) return null;
              return (
                <g key={loc.id} transform={`translate(${a.x} ${a.y})`}>
                  <motion.circle
                    r={4}
                    fill="none"
                    stroke="var(--gold-light)"
                    strokeWidth={1.2}
                    initial={{ scale: 0.6, opacity: 0.9 }}
                    animate={{ scale: 3.2, opacity: 0 }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 1.2 + i * 0.3,
                    }}
                  />
                  <motion.circle
                    r={3.2}
                    fill="var(--gold-light)"
                    stroke="#111"
                    strokeWidth={0.8}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                      delay: 1 + i * 0.08,
                    }}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Cursor tooltip */}
        <AnimatePresence>
          {hoveredLoc && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, x: cursor.x + 14, y: cursor.y - 18 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.4 }}
              className="pointer-events-none absolute top-0 left-0 z-10 hidden rounded-md bg-ink px-3 py-2 text-white shadow-lg sm:block"
            >
              <p className="text-sm font-medium whitespace-nowrap">{hoveredLoc.name}</p>
              <p className="text-xs text-gold-light tabular-nums">
                {hoveredLoc.members > 0
                  ? `${hoveredLoc.members.toLocaleString("en-IN")} members`
                  : "Chapter opening soon"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail panel */}
      <div className="relative border-t bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          {selectedLoc ? (
            <motion.div
              key={selectedLoc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-gold" /> Selected state
                  </p>
                  <p className="mt-0.5 font-serif text-xl font-semibold text-ink">
                    {selectedLoc.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="grid size-7 place-items-center rounded-full border text-muted-foreground transition-colors hover:text-ink"
                  aria-label="Clear selection"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-5">
                <p className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-semibold text-ink tabular-nums">
                    {selectedLoc.members}
                  </span>
                  <span className="text-sm text-muted-foreground">members</span>
                </p>
                <div className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full gold-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedLoc.members / ranked[0].members) * 100}%` }}
                      transition={{ duration: 0.8, ease: easeOut }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {((selectedLoc.members / total) * 100).toFixed(1)}% of the national network
                  </p>
                </div>
              </div>
              {stateMembers[selectedLoc.id] ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {stateMembers[selectedLoc.id].cities.map((c) => (
                    <span key={c} className="rounded-full border bg-white px-2.5 py-0.5 text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <Link
                  href="/contact?subject=chapter"
                  className="inline-flex items-center gap-1 text-sm font-medium text-gold-dark hover:underline"
                >
                  Help us start a chapter here <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <p className="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5 text-gold" /> Strongest chapters — tap a state to explore
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ranked.slice(0, 6).map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelected(loc.id)}
                    onPointerEnter={() => setHovered(loc.id)}
                    onPointerLeave={() => setHovered(null)}
                    className="group inline-flex items-center gap-2 rounded-full border bg-white py-1 pr-1 pl-3 text-xs font-medium transition-colors hover:border-ink"
                  >
                    {loc.name}
                    <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] text-white tabular-nums transition-colors group-hover:bg-gold-dark">
                      {loc.members}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-5 py-3 text-[11px] text-muted-foreground sm:px-6">
        <span className="font-medium text-foreground/70">Members</span>
        {scale.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-[2px] border border-black/10"
              style={{ background: s.fill }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
