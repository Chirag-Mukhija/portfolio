// Case files for the three flagship systems and cards for the other projects.
// Every claim here is traceable to the repo it links to — keep it that way.

export type Decision = { title: string; instead: string; why: string; cost: string };

export type CaseFile = {
  id: string;
  code: string;
  name: string;
  title: string;
  tagline: string;
  status: { label: string; done: number; total: number };
  stack: string[];
  repo: string;
  problem: string;
  decisions: Decision[];
  excerpt: { file: string; lang: "js" | "sql"; source: string; note: string };
  limits: string[];
  phases: { label: string; done: boolean }[];
  diagram: "queue" | "fanout" | "idempotency";
};

export const systems: CaseFile[] = [
  {
    id: "job-scheduler",
    code: "SYS—01",
    name: "Job-Scheduler",
    title: "Distributed job scheduler",
    tagline:
      "A task queue built from scratch — the machinery BullMQ, Sidekiq and Celery run under the hood.",
    status: { label: "7 / 7 phases · complete", done: 7, total: 7 },
    stack: ["Node.js", "PostgreSQL", "Redis sorted sets", "Redis Pub/Sub", "WebSockets", "Docker Compose"],
    repo: "https://github.com/Chirag-Mukhija/Job-Scheduler",
    problem:
      "Background jobs fail, workers die mid-task, and two workers must never run the same job at the same time. The goal: at-least-once delivery with retries, priorities and delayed jobs — without a job ever being silently lost.",
    decisions: [
      {
        title: "Postgres is the truth. Redis is only an index.",
        instead: "Using Redis as the queue itself",
        why: "Every job lives durably in Postgres. Redis holds one sorted set per priority tier, scored by run-at time, so “what’s due next?” is an in-memory lookup — not a table scan.",
        cost: "Every path that makes a job eligible has to write to both stores. Forgetting one is the easiest bug to introduce in this codebase.",
      },
      {
        title: "Claim with a guarded UPDATE, not row locks.",
        instead: "SELECT … FOR UPDATE SKIP LOCKED",
        why: "Once Redis has picked a single candidate there is nothing left to lock against. UPDATE … WHERE status = 'pending' is the guard; zero rows back means a stale entry, so drop it and try again.",
        cost: "The claim path now has a hard dependency on Redis — by design, there is no fallback to scanning the table.",
      },
      {
        title: "Shut down gracefully, don’t hope.",
        instead: "Letting the process die on SIGTERM",
        why: "The worker awaits its in-flight job before exiting, so scaling down never strands work. The API closes every WebSocket before server.close() — an open socket blocks it forever, which testing caught.",
        cost: "Scaling down now takes as long as the slowest in-flight job — shutdown waits for it."
      },
    ],
    excerpt: {
      file: "api/services/queueService.js",
      lang: "js",
      note: "Redis picks the candidate; Postgres decides who actually gets it.",
      source: `async function claimNextJob() {
  const redis = await getRedisClient();

  for (let tier = MIN_TIER; tier <= MAX_TIER; tier++) {
    while (true) {
      const jobId = await redisQueue.peekDueJob(redis, tier);
      if (!jobId) break;

      const claimed = await pool.query(
        \`UPDATE jobs
         SET status = 'processing', attempts = attempts + 1
         WHERE id = $1 AND status = 'pending'
         RETURNING *\`,
        [jobId]
      );
      await redisQueue.removeJob(redis, tier, jobId);

      if (claimed.rows.length > 0) return claimed.rows[0];
      // stale Redis entry — already claimed elsewhere, try again
    }
  }
  return null;
}`,
    },
    limits: [
      "No lease or visibility timeout yet — a SIGKILL’d worker strands its job in “processing”.",
      "Exponential backoff (5 s · 2ⁿ) has no jitter and no cap, so mass failures retry in lockstep.",
      "No priority aging: a steady flood of priority-0 jobs can starve lower tiers.",
      "At-least-once, not exactly-once — job handlers have to be idempotent.",
    ],
    phases: [
      { label: "Postgres-backed queue + submission API", done: true },
      { label: "Separate worker process + handler registry", done: true },
      { label: "Retries, exponential backoff, dead-letter queue", done: true },
      { label: "Priorities + delayed jobs", done: true },
      { label: "Redis sorted-set hot claim path", done: true },
      { label: "Live dashboard over WebSockets + Pub/Sub", done: true },
      { label: "Docker, N workers, graceful shutdown", done: true },
    ],
    diagram: "queue",
  },
  {
    id: "insta-backend",
    code: "SYS—02",
    name: "InstaBackend",
    title: "Instagram-style backend",
    tagline:
      "The backend of a photo-sharing app — auth, uploads, a social graph, and feeds that stay fast deep into the scroll.",
    status: { label: "7 / 7 phases · complete", done: 7, total: 7 },
    stack: ["Node.js", "PostgreSQL", "Redis", "AWS S3 presigned URLs", "Nginx", "Docker"],
    repo: "https://github.com/Chirag-Mukhija/InstaBackend",
    problem:
      "A feed is the same data read far more often than it’s written. Do you pay at write time — copy each post into every follower’s feed — or at read time, joining the follow graph live on every open?",
    decisions: [
      {
        title: "Build both fan-out strategies, side by side.",
        instead: "Picking one from a blog post",
        why: "Fan-out-on-write precomputes a feed_items row per follower, so reads are a single indexed lookup. Fan-out-on-read writes once and joins follows × posts on every request. Both are exposed so they can be compared directly.",
        cost: "Write fan-out grows with follower count — the celebrity problem — and it currently runs inside the post request.",
      },
      {
        title: "Keyset pagination everywhere. Never OFFSET.",
        instead: "LIMIT … OFFSET …",
        why: "OFFSET makes the database walk and throw away every skipped row, and pages drift when new posts arrive. An opaque (created_at, id) cursor stays O(page) at any depth.",
        cost: "No “jump to page 40”. Clients can only move forward from a cursor.",
      },
      {
        title: "The app server never touches image bytes.",
        instead: "Streaming uploads through Express",
        why: "Clients upload straight to S3 with a presigned URL. The server only signs the request — and before saving a post, checks that the image URL points at its own bucket.",
        cost: "Orphaned uploads — signed but never attached to a post — need cleaning up separately.",
      },
    ],
    excerpt: {
      file: "src/services/feed.service.js",
      lang: "js",
      note: "Fan-out-on-write: one post becomes a row in every follower’s feed, idempotently.",
      source: `const fanOutOnWrite = async (post) => {
  const followerIds = await followService.getFollowerIds(post.user_id);
  if (followerIds.length === 0) return;

  const values = [];
  const placeholders = followerIds.map((followerId, i) => {
    values.push(followerId, post.id);
    return \`($\${i * 2 + 1}, $\${i * 2 + 2})\`;
  });

  await db.query(
    \`INSERT INTO feed_items (user_id, post_id)
     VALUES \${placeholders.join(', ')}
     ON CONFLICT (user_id, post_id) DO NOTHING\`,
    values
  );
};`,
    },
    limits: [
      "Fan-out runs synchronously in the post request — a big account makes posting slow. The fix is a queue (see SYS—01).",
      "Counts are live COUNT(*) rather than counters: right at this scale, with the point to revisit written down.",
      "Notifications are poll-based; there are no WebSockets here.",
    ],
    phases: [
      { label: "JWT access + refresh, Redis-revocable sessions", done: true },
      { label: "Profiles, posts, S3 presigned uploads", done: true },
      { label: "Follow graph", done: true },
      { label: "Feeds: fan-out on write and on read", done: true },
      { label: "Likes, comments, notifications", done: true },
      { label: "Keyset pagination, search, explore", done: true },
      { label: "Docker, Nginx, two-layer rate limiting", done: true },
    ],
    diagram: "fanout",
  },
  {
    id: "payment-gateway",
    code: "SYS—03",
    name: "PaytmentGateway",
    title: "Payment gateway",
    tagline:
      "A payment API where the hard part isn’t taking money. It’s never taking it twice.",
    status: { label: "Phase 1 of 6 · in progress", done: 1, total: 6 },
    stack: ["Node.js", "Express 5", "PostgreSQL", "raw SQL (pg)", "next: Redis + BullMQ"],
    repo: "https://github.com/Chirag-Mukhija/PaytmentGateway",
    problem:
      "Networks time out and clients retry. A retried payment request has to return the original payment — not quietly create a second charge. And every state change has to leave a trail you can reconcile against a bank later.",
    decisions: [
      {
        title: "Idempotency keys are unique per merchant.",
        instead: "A globally unique key",
        why: "UNIQUE (merchant_id, idempotency_key): two unrelated merchants can both send “order_1”. A SELECT pre-check handles the common retry; the constraint’s 23505 violation is the backstop for the race.",
        cost: "Two requests in the same millisecond can both do work before one is rejected — closed properly by a Redis lock in phase 3.",
      },
      {
        title: "A payment and its first event commit together.",
        instead: "Two independent pool.query() calls",
        why: "pool.query() can hand BEGIN and INSERT to different connections, which makes the transaction meaningless. One checked-out client runs BEGIN → INSERT payment → INSERT event → COMMIT.",
        cost: "Holding a connection for the whole transaction — the pool is capped at 20.",
      },
      {
        title: "History is append-only. Money is DECIMAL.",
        instead: "Overwriting a status column · FLOAT amounts",
        why: "payment_events keeps every transition, which is what debugging and reconciliation actually read. DECIMAL(12,2) because binary floats drift on money.",
        cost: "A denormalised status column still has to be kept in sync for fast queries.",
      },
    ],
    excerpt: {
      file: "src/services/paymentService.js",
      lang: "js",
      note: "One connection, one transaction — and a clean 409 when the race is lost.",
      source: `const client = await pool.connect();
try {
  await client.query('BEGIN');
  const { rows } = await client.query(
    \`INSERT INTO payments (merchant_id, idempotency_key, amount)
     VALUES ($1, $2, $3) RETURNING *\`,
    [merchantId, idempotencyKey, amount]
  );
  await client.query(
    \`INSERT INTO payment_events (payment_id, from_status, to_status)
     VALUES ($1, NULL, $2)\`,
    [rows[0].id, rows[0].payment_status]
  );
  await client.query('COMMIT');
  return rows[0];
} catch (err) {
  await client.query('ROLLBACK');
  if (err.code === '23505') throw conflict(409); // lost the idempotency race
  throw err;
} finally {
  client.release();
}`,
    },
    limits: [
      "The idempotency race isn’t fully closed yet — a Redis lock lands in phase 3.",
      "A DB write and a bank call can never be atomic. The honest fix is a reconciliation job (phase 6).",
      "No test suite yet.",
    ],
    phases: [
      { label: "Core API, idempotency, transactions, audit trail", done: true },
      { label: "Mock bank + payment state machine", done: false },
      { label: "Redis locking + retries on bank calls", done: false },
      { label: "Per-merchant rate limiting + caching", done: false },
      { label: "Docker + Nginx", done: false },
      { label: "Reconciliation batch job", done: false },
    ],
    diagram: "idempotency",
  },
];

export type Problem = {
  id: string;
  code: string;
  name: string;
  context: string;
  team?: boolean;
  problem: string;
  did: string[];
  result: { value: string; label: string }[];
  stack: string[];
  repo: string;
  visual: "context" | "pipeline" | "funnel";
};

export const problems: Problem[] = [
  {
    id: "practice",
    code: "PRB—01",
    name: "PRactice",
    context: "LeetCode for open source · team of four",
    team: true,
    problem:
      "Beginners can’t practise real open-source contribution: real repositories are too big to read, and far too big to hand to an LLM.",
    did: [
      "Built the Issue → PR → Diff → File mapping that pulls only the code a fix actually touched, instead of stuffing a whole repo into context.",
      "Wired the GitHub REST pipeline to fetch pre-fix file contents by commit SHA.",
      "Integrated a Monaco editor that reveals the codebase progressively — find the file first, then the code.",
    ],
    result: [
      { value: "1 file", label: "sent to the model, not the repo" },
      { value: "4", label: "contributors" },
    ],
    stack: ["Next.js", "TypeScript", "FastAPI", "GitHub REST API", "Monaco"],
    repo: "https://github.com/sciboyrocks/PRactice",
    visual: "context",
  },
  {
    id: "clipforge",
    code: "PRB—02",
    name: "ClipForge",
    context: "Topic in, finished short out · solo",
    problem:
      "One good 60-second explainer takes hours of scripting, voice-over, editing and timing — and every video is built by hand from scratch.",
    did: [
      "Split the job into 10 durable steps — angle, script, critic, storyboard, voice, assets, timeline, render, metadata, publish — each one a retryable job in SQLite that resumes after a crash.",
      "The LLM never writes animation code. It fills props for eight hand-built Remotion templates, so a render can’t break.",
      "Animations are anchored to spoken words, not timestamps — change the voice and every cue re-syncs itself.",
    ],
    result: [
      { value: "~5 min", label: "topic → 1080×1920 MP4" },
      { value: "10", label: "resumable pipeline steps" },
    ],
    stack: ["TypeScript", "Hono", "SQLite", "Remotion", "ffmpeg", "Claude · Gemini · OpenAI"],
    repo: "https://github.com/Chirag-Mukhija/ShortsPipeline",
    visual: "pipeline",
  },
  {
    id: "entity-resolution",
    code: "PRB—03",
    name: "Entity resolution",
    context: "Amazon ML Challenge 2026",
    problem:
      "Match 10.3 million noisy business records across three sources — typos, legal-form swaps, Hindi and Tamil transliterations, scrambled addresses — without comparing every pair.",
    did: [
      "Rare-key blocking: IDF-weighted name and address keys, matched with sparse top-K products per country.",
      "A LightGBM matcher on ~70 features, including “competition” features built on each record matching at most one entity.",
      "A transliteration dictionary learned only from training pairs, and a decision rule tuned directly for macro F0.5.",
    ],
    result: [
      { value: "0.989", label: "macro F0.5 · validation, 5% sample" },
      { value: "96.6%", label: "true pairs kept by blocking" },
    ],
    stack: ["Python", "LightGBM", "sparse_dot_topn", "rapidfuzz", "Parquet"],
    repo: "https://github.com/Chirag-Mukhija/AmazonML-Pipeline",
    visual: "funnel",
  },
];

export const alsoBuilt = [
  {
    name: "Signal",
    note: "AWS hackathon · voice notes → tasks, reminders and calendar events. React Native, Express, Whisper, Gemini.",
    repo: "https://github.com/Chirag-Mukhija/AwsHacakthonProject",
  },
  {
    name: "Wanderlust",
    note: "Full-stack rental marketplace · auth, role-based authorisation, listings CRUD. MongoDB, Express, Node.",
    // TODO(chirag): the résumé link (Major-project-web-dev) is private or gone — add a public URL here
    repo: null,
  },
] as const satisfies readonly { name: string; note: string; repo: string | null }[];
