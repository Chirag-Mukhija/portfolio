# InstaBackend

The backend of an Instagram-style photo-sharing app, built to learn the parts that get hard at scale:
authentication and revocable sessions, direct-to-S3 uploads, a social graph, feed generation, and
pagination that stays fast deep into a scroll.

**Stack:** Node.js · Express · PostgreSQL · Redis · AWS S3 (presigned URLs) · Nginx · Docker

**Status:** all 7 phases built and live-verified against real Postgres and Redis (phase 7 against a real
`docker compose` stack).

## Highlights

- **Two feed strategies, side by side.** `GET /api/feed/fanout-write` reads a precomputed `feed_items`
  table (one row per follower, written when a post is published). `GET /api/feed/fanout-read` joins the
  follow graph against `posts` on every request. Both exist so the trade-off can be measured directly.
- **Keyset pagination everywhere.** Opaque base64url `(created_at, id)` cursors — never `OFFSET` — so a
  page deep in a feed costs the same as the first one and doesn't drift when new posts arrive.
- **The app server never touches image bytes.** Clients upload straight to S3 with a presigned URL; the
  server only signs requests and checks that saved image URLs point at its own bucket.
- **Revocable sessions.** Short-lived JWT access tokens plus refresh tokens tracked in Redis, so logout
  and revocation take effect immediately.
- **Two layers of rate limiting.** Nginx limits per IP (10 r/s, burst 20); the app adds a Redis-backed
  limiter on auth routes, shared across instances.
- **Idempotent writes.** Follows, likes and feed rows use composite primary keys with
  `ON CONFLICT DO NOTHING`, and report whether anything changed so duplicate notifications never fire.

## Phases

| Phase | What it adds |
| --- | --- |
| 1 | Auth: register, login, refresh, logout; Redis-backed sessions |
| 2 | Profiles, posts, S3 presigned uploads |
| 3 | Follow / unfollow |
| 4 | Feeds: fan-out on write and fan-out on read |
| 5 | Likes, comments, notifications (poll-based) |
| 6 | Cursor pagination, user search, explore |
| 7 | Docker, Nginx, two-layer rate limiting, helmet, morgan, graceful shutdown |

## API overview

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register · login · refresh · logout`, `GET /api/auth/me` |
| Uploads | `POST /api/uploads/presign` |
| Users | `GET/PATCH /api/users/me`, `GET /api/users/:username`, `…/posts`, `…/followers`, `…/following`, `POST/DELETE …/follow` |
| Posts | `POST /api/posts`, `GET /api/posts/:id`, likes and comments under `/api/posts/:id/…` |
| Feed | `GET /api/feed/fanout-write`, `GET /api/feed/fanout-read` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all` |
| Discovery | `GET /api/search/users`, `GET /api/explore` |

## Run it

```bash
cp .env.example .env     # DATABASE_URL, REDIS_URL; any AWS_* values work locally (presigning is local)
npm install
npm run migrate
npm run dev
```

Or the containerised stack behind Nginx:

```bash
docker compose up -d --build
docker exec <app-container> node src/db/migrate.js
# → http://localhost
```

## Known limits

- Fan-out on write runs synchronously inside the post request; a large account makes posting slow.
  The fix is to move it onto a queue.
- Counts use live `COUNT(*)` instead of denormalised counters — right at this scale, with the point to
  revisit documented.
- Notifications are poll-based (no WebSockets).

## Design notes

`docs/phase-1-theory.pdf` … `docs/phase-7-theory.pdf` explain each phase: architecture, data model,
failure modes and the decisions log.
