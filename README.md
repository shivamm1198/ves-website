# Vidhi Ekta Sangh (VES) — website

The website for **Vidhi Ekta Sangh (विधि एकता संघ)**, a national community that helps law students and
legal professionals with internships, scholarships, mentorship and events.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **shadcn/ui** (Radix primitives) and
**Framer Motion**. The theme is light only: black and white, with a few gold accents.

## Pages

| Route          | Contents                                                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | Hero with an interactive India map of members, About, Founder, Internships, Scholarships, Gallery, Events, Inside VES news, Members carousel (32), Four Pillars, Patrons, YouTube |
| `/internships` | How it works, a filterable and searchable list of openings with an apply dialog, Scholarships, FAQs                                                                               |
| `/gallery`     | Category filters, masonry grid, lightbox (keyboard ← →), events, videos                                                                                                           |
| `/journey`     | Timeline from 2020 to today with a scroll-linked gold progress rail                                                                                                               |
| `/wings`       | Interactive explorer for the 8 wings and an org-structure diagram                                                                                                                 |
| `/about`       | Mission, vision, story, founder, what we do, pillars, patrons                                                                                                                     |
| `/contact`     | Validated contact form (`/contact?subject=membership` preselects a topic) and contact details                                                                                     |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run format
```

## Editing content

All copy and data live in **`src/data/site.ts`**: organisation details, members per state (this drives the
map), founder, members, patrons, internships, scholarships, events, news, wings, journey, gallery and videos.

> The names, numbers and contact details there are **sample content**. Replace them with VES's real data
> before launch.

- **Map:** edit `stateMembers` (keys are state codes such as `dl`, `up`, `mh`). The totals, shading, ranked
  chips and pulsing markers all update automatically.
- **YouTube:** set `site.socials.youtube` to the channel URL and add each video's `youtubeId`. Videos with an
  id play inline in a dialog. Videos without one link to the channel.
- **Photos:** `public/images` holds generated monochrome placeholder artwork
  (`npm run generate:images`). Replace a file with a real photo, or point the data at a new path (`.jpg`/`.png`
  are optimised by `next/image`).
- **Founder, member and patron portraits** currently show elegant monograms (`src/components/monogram.tsx`).

## Forms

There is no backend yet. The contact and internship-application forms validate their input and then open
the visitor's mail app with a pre-filled email to `site.email`. To store submissions instead, connect them to
a route handler or a form service.

## Structure

```
src/
  app/                 routes (one folder per page)
  components/
    ui/                shadcn/ui components (button, card, dialog, sheet, tabs, accordion, carousel, …)
    home/              landing-page sections (hero, india-map, members, pillars, …)
    motion.tsx         Reveal / Stagger / CountUp animation helpers (respect reduced-motion)
  data/site.ts         all site content
scripts/               placeholder image generator
```

The shadcn components were added by hand from the shadcn sources and are configured in `components.json`.
`npx shadcn add <component>` works as normal for new ones.
