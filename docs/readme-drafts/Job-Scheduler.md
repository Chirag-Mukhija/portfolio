# Job-Scheduler

A distributed task queue and job scheduler built from scratch — the machinery that BullMQ, Sidekiq and
Celery run under the hood. Built to understand at-least-once delivery, safe concurrent claiming,
retries with backoff, priorities, and graceful shutdown by implementing them, not by importing them.

**Stack:** Node.js · Express · PostgreSQL (durable job store) · Redis (sorted-set claim index + Pub/Sub) ·
WebSockets (live dashboard) · Docker Compose

**Status:** all 7 phases built and verified end-to-end against real Postgres, Redis and worker processes.

## Architecture

```
            POST /jobs                      claim (ZRANGEBYSCORE → guarded UPDATE)
 client ───────────────▶  API  ──────┐          ┌──────────────  worker × N
                           │         ▼          ▼                    │
                           │   ┌───────────┐  ┌────────────────────┐ │
                           │   │ Postgres  │  │ Redis              │ │
                           │   │ jobs      │  │ queue:priority:0-9 │ │
                           │   │ (truth)   │  │ (due-time index)   │ │
                           │   └───────────┘  └────────────────────┘ │
                           │         ▲   job:events (Pub/Sub)  │     │
   dashboard ◀── WebSocket ┴─────────┴─────────────────────────┴─────┘
```

- **Postgres is the source of truth.** Every job, attempt count and error lives in the `jobs` table.
- **Redis is only an index.** One sorted set per priority tier, scored by `run_at`, so "what's due next?"
  is an in-memory lookup rather than a table scan. Losing Redis loses no data.
- **Claiming is two steps:** ask Redis for the earliest due id in the lowest tier, then
  `UPDATE jobs SET status='processing' … WHERE id=$1 AND status='pending'`. Zero rows back means a stale
  index entry — drop it and try again.

## Features by phase

| Phase | What it adds |
| --- | --- |
| 1 | Job submission API, Postgres-backed queue |
| 2 | Separate worker process, handler registry (`send_email`, `resize_image`) |
| 3 | Retries with exponential backoff (5 s · 2ⁿ⁻¹), dead-letter queue (`status = 'failed'`), manual retry |
| 4 | Priorities (0 = most urgent) and delayed jobs via `delaySeconds` |
| 5 | Redis sorted-set hot claim path |
| 6 | Live dashboard over WebSockets, fed by Redis Pub/Sub, with worker heartbeats |
| 7 | Docker Compose, `--scale worker=N`, graceful shutdown on SIGTERM/SIGINT |

## API

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/jobs` | `{ type, payload?, maxAttempts?, priority?, delaySeconds? }` |
| `GET` | `/jobs` | `?status=&limit=&offset=` |
| `GET` | `/jobs/:id` | |
| `POST` | `/jobs/:id/retry` | Requeues a dead-lettered job |
| `GET` | `/stats` | Counts by status |
| `GET` | `/dashboard` | Live dashboard |

## Run it

```bash
npm install
cp .env.example .env          # set DATABASE_URL and REDIS_URL
npm run migrate
npm start                     # API on :3000
npm run worker                # in another terminal
```

Or the whole stack:

```bash
docker-compose up --build
docker-compose run --rm api npm run migrate
docker-compose up --scale worker=3
```

## Known limits (deliberate, documented)

- No lease / visibility timeout: a worker killed with SIGKILL leaves its job in `processing`.
- Backoff has no jitter and no cap.
- No priority aging — a steady stream of priority-0 jobs can starve lower tiers.
- The claim path has a hard dependency on Redis; there is no table-scan fallback.
- Delivery is at-least-once, so handlers must be idempotent.

## Design notes

Each phase has a theory write-up in `docs/phase1-theory.pdf` … `docs/phase7-theory.pdf`: architecture,
data model, failure modes, the decisions log and the trade-offs behind every non-obvious choice.
