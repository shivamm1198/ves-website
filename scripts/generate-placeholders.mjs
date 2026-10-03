// Generates monochrome, legal-themed placeholder artwork into public/images.
// Replace any file in public/images with a real photo of the same name
// (or point the data in src/data to a new path) when VES photos are ready.
//
//   node scripts/generate-placeholders.mjs

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images");
mkdirSync(outDir, { recursive: true });

const iconInner = (name) => {
  const svg = readFileSync(
    join(root, "node_modules", "lucide-static", "icons", `${name}.svg`),
    "utf8",
  );
  return svg
    .replace(/<!--.*?-->/gs, "")
    .replace(/<svg[^>]*>/s, "")
    .replace("</svg>", "")
    .trim();
};

const tones = {
  dark: { a: "#0b0b0b", b: "#2e2e2e", ink: "#f5f5f4", line: "#ffffff" },
  graphite: { a: "#222222", b: "#5c5c5c", ink: "#fafafa", line: "#ffffff" },
  light: { a: "#f6f5f2", b: "#d6d3cd", ink: "#111111", line: "#000000" },
  stone: { a: "#e7e5e1", b: "#a8a49c", ink: "#0f0f0f", line: "#000000" },
};

const patterns = {
  columns: (w, h, line) => {
    const cols = 7;
    const gap = w / (cols * 1.6);
    const cw = gap * 0.55;
    const top = h * 0.22;
    const base = h * 0.86;
    let out = `<g stroke="${line}" stroke-opacity="0.10" fill="none" stroke-width="1.5">`;
    out += `<path d="M ${w * 0.08} ${top - 10} L ${w * 0.5} ${h * 0.06} L ${w * 0.92} ${top - 10} Z"/>`;
    out += `<line x1="${w * 0.06}" y1="${top}" x2="${w * 0.94}" y2="${top}"/>`;
    for (let i = 0; i < cols; i++) {
      const x = w * 0.1 + i * ((w * 0.8 - cw) / (cols - 1));
      out += `<rect x="${x}" y="${top + 12}" width="${cw}" height="${base - top - 24}"/>`;
      for (let f = 1; f < 4; f++) {
        const fx = x + (cw / 4) * f;
        out += `<line x1="${fx}" y1="${top + 20}" x2="${fx}" y2="${base - 20}" stroke-opacity="0.05"/>`;
      }
    }
    out += `<line x1="${w * 0.04}" y1="${base}" x2="${w * 0.96}" y2="${base}"/>`;
    out += `<line x1="${w * 0.02}" y1="${base + 14}" x2="${w * 0.98}" y2="${base + 14}"/>`;
    return out + "</g>";
  },
  rings: (w, h, line) => {
    let out = `<g stroke="${line}" fill="none" stroke-opacity="0.08" stroke-width="1.2">`;
    for (let r = 60; r < Math.max(w, h); r += 46) {
      out += `<circle cx="${w * 0.72}" cy="${h * 0.5}" r="${r}"/>`;
    }
    return out + "</g>";
  },
  grid: (w, h, line) => {
    let out = `<g stroke="${line}" stroke-opacity="0.07" stroke-width="1">`;
    for (let x = 0; x <= w; x += 48) out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
    for (let y = 0; y <= h; y += 48) out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
    return out + "</g>";
  },
  diagonal: (w, h, line) => {
    let out = `<g stroke="${line}" stroke-opacity="0.07" stroke-width="1.2">`;
    for (let x = -h; x <= w; x += 36) out += `<line x1="${x}" y1="${h}" x2="${x + h}" y2="0"/>`;
    return out + "</g>";
  },
  pages: (w, h, line) => {
    let out = `<g stroke="${line}" stroke-opacity="0.09" fill="none" stroke-width="1.2">`;
    for (let i = 0; i < 9; i++) {
      const y = h * 0.2 + i * 34;
      out += `<line x1="${w * 0.08}" y1="${y}" x2="${w * (0.38 - (i % 3) * 0.04)}" y2="${y}"/>`;
    }
    out += `<rect x="${w * 0.05}" y="${h * 0.12}" width="${w * 0.38}" height="${h * 0.76}" rx="6"/>`;
    return out + "</g>";
  },
};

function art({
  file,
  icon,
  tone = "dark",
  pattern = "columns",
  w = 1200,
  h = 800,
  side = "right",
}) {
  const t = tones[tone];
  const size = Math.min(w, h) * 0.58;
  const cx = side === "right" ? w * 0.68 : side === "left" ? w * 0.32 : w * 0.5;
  const scale = size / 24;
  const ix = cx - size / 2;
  const iy = h / 2 - size / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.a}"/>
      <stop offset="1" stop-color="${t.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${cx / w}" cy="0.45" r="0.6">
      <stop offset="0" stop-color="${t.line}" stop-opacity="0.10"/>
      <stop offset="1" stop-color="${t.line}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" x2="1">
      <stop offset="0" stop-color="#8a6a2c"/>
      <stop offset="0.5" stop-color="#d4b26a"/>
      <stop offset="1" stop-color="#8a6a2c"/>
    </linearGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${patterns[pattern](w, h, t.line)}
  <g transform="translate(${ix} ${iy}) scale(${scale})" fill="none" stroke="${t.ink}" stroke-opacity="0.9" stroke-width="0.32" stroke-linecap="round" stroke-linejoin="round">
    ${iconInner(icon)}
  </g>
  <rect x="${w * 0.06}" y="${h * 0.88}" width="${Math.min(160, w * 0.2)}" height="3" fill="url(#gold)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.07"/>
</svg>`;
  writeFileSync(join(outDir, `${file}.svg`), svg);
}

const images = [
  // Sections
  { file: "about", icon: "landmark", tone: "dark", pattern: "columns", side: "center" },
  { file: "internship", icon: "briefcase", tone: "light", pattern: "grid" },
  {
    file: "scholarship",
    icon: "graduation-cap",
    tone: "dark",
    pattern: "rings",
    w: 1000,
    h: 1100,
    side: "center",
  },
  { file: "journey", icon: "scroll-text", tone: "stone", pattern: "pages" },
  { file: "contact", icon: "landmark", tone: "light", pattern: "columns", side: "center" },
  // Events
  { file: "event-moot-court", icon: "gavel", tone: "dark", pattern: "columns" },
  { file: "event-legal-aid", icon: "heart-handshake", tone: "light", pattern: "rings" },
  { file: "event-constitution-day", icon: "scroll-text", tone: "graphite", pattern: "pages" },
  { file: "event-career-conclave", icon: "briefcase", tone: "stone", pattern: "grid" },
  { file: "event-womens-rights", icon: "megaphone", tone: "dark", pattern: "diagonal" },
  { file: "event-legal-writing", icon: "feather", tone: "light", pattern: "pages", side: "left" },
  // Gallery
  {
    file: "gallery-01",
    icon: "gavel",
    tone: "graphite",
    pattern: "columns",
    w: 900,
    h: 1200,
    side: "center",
  },
  { file: "gallery-02", icon: "users", tone: "light", pattern: "rings" },
  {
    file: "gallery-03",
    icon: "mic",
    tone: "dark",
    pattern: "rings",
    w: 1000,
    h: 1000,
    side: "center",
  },
  {
    file: "gallery-04",
    icon: "award",
    tone: "stone",
    pattern: "diagonal",
    w: 900,
    h: 1200,
    side: "center",
  },
  { file: "gallery-05", icon: "library", tone: "dark", pattern: "columns" },
  {
    file: "gallery-06",
    icon: "presentation",
    tone: "light",
    pattern: "grid",
    w: 1000,
    h: 1000,
    side: "center",
  },
  { file: "gallery-07", icon: "handshake", tone: "graphite", pattern: "diagonal" },
  {
    file: "gallery-08",
    icon: "book-open",
    tone: "stone",
    pattern: "pages",
    w: 900,
    h: 1200,
    side: "center",
  },
  {
    file: "gallery-09",
    icon: "trophy",
    tone: "dark",
    pattern: "rings",
    w: 1000,
    h: 1000,
    side: "center",
  },
  { file: "gallery-10", icon: "school", tone: "light", pattern: "columns" },
  {
    file: "gallery-11",
    icon: "globe",
    tone: "graphite",
    pattern: "grid",
    w: 900,
    h: 1200,
    side: "center",
  },
  { file: "gallery-12", icon: "scale", tone: "stone", pattern: "rings" },
];

for (const img of images) art(img);
console.log(`Generated ${images.length} images in public/images`);
