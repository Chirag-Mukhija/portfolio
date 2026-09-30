# chiragmukhija — portfolio

A one-page portfolio for **Chirag Mukhija**, built around a 200 m race: every section is a lap
(`025 m`, `050 m` … `200 m`), the scroll progress is a lane rope, and the page ends at the wall.

- **Stack:** Next.js 16 (App Router, static export) · TypeScript · Tailwind v4 · GSAP (ScrollTrigger, SplitText) · Lenis
- **Output:** plain static HTML in `out/` — host it anywhere for free.
- **Measured (Lighthouse 12, brotli-served static build):** mobile Performance 96–97, desktop 100;
  Accessibility, Best Practices and SEO 100; CLS 0.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static site → out/
pnpm start        # serve out/ locally
```

## Where things live

| What | File |
| --- | --- |
| Name, role, links, SEO copy, approach, about, rules | `content/site.ts` |
| The three case files + other projects | `content/projects.ts` |
| DSA numbers, courses, sports & life | `content/training.ts` |
| Sections (server-rendered HTML) | `components/sections/*` |
| Interactive diagrams (queue sim, fan-out, idempotency) | `components/diagrams/*` |
| Every scroll animation, smooth scroll, header, lane rope | `components/motion/MotionDirector.tsx` |
| Design tokens + all styles | `app/globals.css` |
| Metadata, fonts, JSON-LD | `app/layout.tsx`, `lib/jsonld.ts` |

All copy is in `content/`; LeetCode numbers live in one object (`leetcode` in `content/training.ts`).

### Assets and the résumé

| Command | What it does |
| --- | --- |
| `pnpm images` | `private/portrait-src.jpg` → `public/portrait.{avif,webp,jpg}` (4:5 crop, **all EXIF/GPS stripped**) and `app/apple-icon.png` |
| `pnpm resume` | `resume/resume.html` → `public/Chirag-Mukhija-Resume.pdf` (linked on the site, no phone number) and `private/Chirag-Mukhija-Resume-full.pdf` (with phone, for applications) |
| `pnpm og` | `scripts/og.html` → `public/og.jpg`, the 1200×630 social preview |

`private/` is git-ignored on purpose: the original photo carries GPS coordinates and the full résumé has
your phone number. Keep originals there, never in `public/` or the repo root.

To update the résumé: edit `resume/resume.html`, run `pnpm resume`, check it is still one page, commit.

## How the motion works

- The page is complete without JavaScript. An inline script adds `.motion` to `<html>` only when JS runs
  and the visitor hasn't asked for reduced motion; hidden start-states only exist under that class, and a
  4-second failsafe un-hides everything if the motion bundle never arrives.
- GSAP and Lenis are loaded as a separate chunk **after** hydration, so they never block the first paint.
- Only `transform`/`opacity` are animated, with one deliberate exception: the hero name's variable-font
  width axis (`wdth`), which is safe because the name is left-aligned and nothing sits after it on the line.
- `prefers-reduced-motion` gets a static page: no smooth scroll, no pins, no marquees.

## Deploy (free)

**Vercel** (recommended): push this folder to a GitHub repo → vercel.com → *Add New Project* → import it.
Name the project `chiragmukhija` to get **chiragmukhija.vercel.app**. No settings needed — Vercel detects
Next.js and serves the static export.

If the name is taken or you add a custom domain later, set the environment variable
`NEXT_PUBLIC_SITE_URL=https://your-domain` in Vercel and redeploy — canonical URL, sitemap, robots, Open
Graph and JSON-LD all read from it.

## Getting found on Google

Several other people share the name, so the off-page steps matter as much as the on-page SEO.

1. **Search Console** → *Add property* → URL prefix → *HTML tag*: put the `content="…"` value in the Vercel env var
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy, click *Verify*. Then submit `sitemap.xml` and use
   *URL inspection → Request indexing* for the home page and the résumé PDF.
2. **Bing Webmaster Tools** → import from Search Console (covers Bing, DuckDuckGo, Yahoo).
3. **One identity everywhere** — same name, same photo, same one-line title, all linking to the site:
   GitHub (profile *Website*, a profile README, *About → Website* on the flagship repos), LinkedIn
   (*Contact info → Website*, *Featured*), LeetCode (display name “Chirag Mukhija”, website field).
4. **Tell people** — a LinkedIn post about the site brings the first visits and links.
5. **Watch** Search Console → *Performance* for the query “chirag mukhija”. Expect days to two weeks.
6. **Keep it fresh** — update `site.updated`, the LeetCode object and the résumé when things change.
