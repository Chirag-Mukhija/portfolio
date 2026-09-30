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

All copy is in `content/`. Search for `TODO(chirag)` to find the things only you can fill in.

### Before you publish

1. **Portrait** — save a photo as `assets/portrait-src.jpg`, run `pnpm images`, then set
   `portrait: "/portrait"` in `content/site.ts`.
2. **Résumé** — put the updated PDF at `public/resume.pdf` and set `resume: "/resume.pdf"`.
3. **LeetCode** — set `links.leetcode` to your profile URL (it also goes into the JSON-LD `sameAs`).
4. **Wanderlust** — the repo linked on the old résumé is private or gone; add a public link or leave it unlinked.
5. Read every drafted line in `content/` (the three "rules", the swimming line) and make it sound like you.

### Social preview image

`public/og.png` is rendered from `scripts/og.html` with headless Chrome: edit the HTML, then `pnpm og`.

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

Several other people share the name, so the off-page steps matter as much as the on-page SEO:

1. **Google Search Console** → *Add property* → URL prefix → your site URL → verify with the *HTML tag*
   method: copy the `content="…"` value into the Vercel env var `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`,
   redeploy, click Verify.
2. In Search Console: *Sitemaps* → submit `sitemap.xml`; *URL inspection* → your URL → *Request indexing*.
3. **Bing Webmaster Tools** → import the site from Search Console (covers Bing, DuckDuckGo, Yahoo).
4. Link the site from everywhere that already ranks for your name:
   GitHub profile *Website* field and each pinned repo's *About → Website*; LinkedIn *Contact info → Website*
   and a *Featured* link; your LeetCode profile.

Expect a few days to a couple of weeks before the page shows up for a name search.
