// Identity, links and SEO copy. Every personal fact on the page comes from this folder.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chiragmukhija.vercel.app"
).replace(/\/$/, "");

export const site = {
  name: "Chirag Mukhija",
  firstName: "Chirag",
  lastName: "Mukhija",
  role: "Backend & Systems Engineer",
  pitch:
    "I find what’s actually broken in a system — then fix it, or build it again from the ground up.",
  now: "Currently building a payment gateway from scratch.",
  location: { city: "Bengaluru", region: "Karnataka", code: "KA", country: "IN" },
  hometown: { city: "Sirsa", region: "Haryana", code: "HR" },
  distanceHomeKm: 1860,
  education: {
    degree: "B.E. Computer Science & Engineering",
    school: "B.M.S. College of Engineering",
    schoolShort: "BMSCE",
    schoolUrl: "https://bmsce.ac.in",
    years: "2024 – 2028",
    cgpa: "9.2",
  },
  email: "chiragmukhija.cs24@bmsce.ac.in",
  links: {
    github: "https://github.com/Chirag-Mukhija",
    linkedin: "https://www.linkedin.com/in/chirag-mukhija/",
    // TODO(chirag): add your LeetCode profile URL, e.g. "https://leetcode.com/u/<username>/"
    leetcode: null as string | null,
  },
  // TODO(chirag): drop an updated résumé at public/resume.pdf, then set this to "/resume.pdf"
  resume: null as string | null,
  // TODO(chirag): add public/portrait.jpg, run `pnpm images`, then set this to "/portrait"
  portrait: null as string | null,
  seo: {
    title: "Chirag Mukhija — Backend & Systems Engineer, Bengaluru",
    description:
      "Chirag Mukhija is a backend & systems engineer and CSE student at BMSCE, Bengaluru. He builds job schedulers, Instagram-style backends and payment APIs from scratch.",
    keywords: [
      "Chirag Mukhija",
      "Chirag Mukhija BMSCE",
      "Chirag Mukhija portfolio",
      "backend engineer Bengaluru",
      "systems engineer",
      "distributed job scheduler",
      "payment gateway idempotency",
      "Node.js PostgreSQL Redis",
    ],
  },
  updated: "2026-09-30",
} as const;

export const nav = [
  { href: "#systems", label: "Systems" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#dsa", label: "DSA" },
  { href: "#contact", label: "Contact" },
] as const;

// Sections double as distance markers down a 200 m race.
export const laps = {
  approach: 25,
  about: 50,
  systems: 75,
  work: 100,
  dsa: 125,
  training: 150,
  life: 175,
  contact: 200,
} as const;

export const approach = [
  {
    title: "Find the real problem",
    body: "Most bugs are symptoms. I trace a failure back to the assumption that broke — two requests racing on one key, a job stranded in “processing”, a query quietly scanning the whole table.",
  },
  {
    title: "Understand the system",
    body: "Before I change anything I map how data moves: who writes, who reads, what has to be atomic, and what is allowed to be eventually right.",
  },
  {
    title: "Fix it, or build it again",
    body: "Then I repair the part that’s wrong — or rebuild the system from zero, in phases, with every trade-off written down where the next engineer can find it.",
  },
] as const;

export const about = {
  heading: "Built on discipline.",
  paragraphs: [
    "I’m Chirag — a pre-final-year computer science student at BMSCE, Bengaluru, originally from Sirsa, Haryana.",
    "I learn by building the real thing. When a concept matters — idempotency, fan-out, at-least-once delivery — I build a system around it and write down every decision I made, and what it cost.",
    "When I commit to learning something, it’s only a matter of time before I’m as good at it as anyone. Perfection takes longer. I’m fine with that.",
  ],
  belief: "Discipline and hard work. Everything else is just the output.",
  // TODO(chirag): these are drafted from what you told me — rewrite them in your own words.
  rules: [
    {
      rule: "Show up on the boring days.",
      proof: "Gym for an hour and a half, every day, around a full college schedule.",
    },
    {
      rule: "Go deep, not wide.",
      proof: "100 problems on LeetCode — about 90 of them dynamic programming and graphs.",
    },
    {
      rule: "Write the decision down.",
      proof: "Every system I build ships with its trade-offs and known limits documented.",
    },
  ],
} as const;
