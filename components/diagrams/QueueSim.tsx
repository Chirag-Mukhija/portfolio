"use client";

// Client-side model of Job-Scheduler: priority tiers scanned 0→2, due-time ordering,
// claim-on-idle, exponential backoff, and `failed` as the dead-letter queue.
import { useEffect, useRef, useState } from "react";

type Status = "pending" | "processing" | "completed" | "failed";
type Job = {
  id: number;
  tier: number;
  attempts: number;
  status: Status;
  runAt: number; // sim ms
  startedAt: number;
  duration: number;
  worker: number;
  doneAt: number;
  born: number;
};
type Worker = { id: number; state: "idle" | "busy" | "draining" | "offline"; job: number | null };
type Ev = { k: "ok" | "bad" | "warn" | ""; t: string };
type Sim = {
  now: number;
  jobs: Job[];
  workers: Worker[];
  nextId: number;
  nextSpawn: number;
  fail: number;
  done: number;
  retried: number;
  dead: number;
  log: Ev[];
};

const MAX_ATTEMPTS = 3;
const SPEED = 4; // sim seconds per real second — backoff reads true to the code (5s · 2^n)
const BASE_BACKOFF = 5;
const TIERS = 3;
const FAIL_STEPS = [0, 0.25, 0.6];

const backoffMs = (attempts: number) => BASE_BACKOFF * 2 ** (attempts - 1) * 1000;

// ───────────────────────── model ─────────────────────────

function createSim(): Sim {
  const mk = (id: number, tier: number, over: Partial<Job> = {}): Job => ({
    id,
    tier,
    attempts: 0,
    status: "pending",
    runAt: 0,
    startedAt: 0,
    duration: 4000,
    worker: -1,
    doneAt: 0,
    born: -1,
    ...over,
  });
  return {
    now: 0,
    jobs: [
      mk(41, 0, { status: "processing", attempts: 1, worker: 0, duration: 5200 }),
      mk(42, 1, { status: "processing", attempts: 1, worker: 1, duration: 6400 }),
      mk(43, 0),
      mk(44, 1),
      mk(45, 1, { attempts: 1, runAt: 5000 }),
      mk(46, 2),
      mk(47, 2, { runAt: 9000 }),
      mk(38, 2, { status: "failed", attempts: 3 }),
    ],
    workers: [
      { id: 0, state: "busy", job: 41 },
      { id: 1, state: "busy", job: 42 },
      { id: 2, state: "idle", job: null },
    ],
    nextId: 48,
    nextSpawn: 1500,
    fail: 1,
    done: 0,
    retried: 0,
    dead: 1,
    log: [],
  };
}

function log(s: Sim, k: Ev["k"], t: string) {
  s.log = [{ k, t }, ...s.log].slice(0, 6);
}

function enqueue(s: Sim, delay = 0) {
  const tier = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
  const id = s.nextId++;
  s.jobs.push({
    id,
    tier,
    attempts: 0,
    status: "pending",
    runAt: s.now + delay,
    startedAt: 0,
    duration: 4400 + Math.random() * 5200,
    worker: -1,
    doneAt: 0,
    born: s.now,
  });
  log(s, "", `job:created #${id} → queue:priority:${tier}${delay ? ` · delay ${Math.round(delay / 1000)}s` : ""}`);
}

// Mirrors claimNextJob(): lowest tier first, earliest due first, only jobs whose run_at has passed.
function claim(s: Sim, w: Worker) {
  for (let tier = 0; tier < TIERS; tier++) {
    const due = s.jobs
      .filter((j) => j.status === "pending" && j.tier === tier && j.runAt <= s.now)
      .sort((a, b) => a.runAt - b.runAt || a.id - b.id)[0];
    if (!due) continue;
    due.status = "processing";
    due.attempts += 1;
    due.worker = w.id;
    due.startedAt = s.now;
    w.state = "busy";
    w.job = due.id;
    log(s, "", `job:claimed #${due.id} by w${w.id + 1} · attempt ${due.attempts}/${MAX_ATTEMPTS}`);
    return;
  }
}

function step(s: Sim, dt: number) {
  s.now += dt;

  if (s.now >= s.nextSpawn) {
    if (s.jobs.filter((j) => j.status === "pending").length < 11) {
      enqueue(s, Math.random() < 0.15 ? 6000 + Math.random() * 6000 : 0);
    }
    s.nextSpawn = s.now + 2400 + Math.random() * 2400;
  }

  for (const w of s.workers) {
    if (w.job == null) continue;
    const job = s.jobs.find((j) => j.id === w.job);
    if (!job || s.now - job.startedAt < job.duration) continue;

    if (Math.random() >= FAIL_STEPS[s.fail]) {
      job.status = "completed";
      job.doneAt = s.now;
      s.done += 1;
      log(s, "ok", `job:completed #${job.id}`);
    } else if (job.attempts >= MAX_ATTEMPTS) {
      job.status = "failed";
      job.doneAt = s.now;
      s.dead += 1;
      log(s, "bad", `job:failed #${job.id} · attempts exhausted → status = 'failed' (DLQ)`);
    } else {
      const wait = backoffMs(job.attempts);
      job.status = "pending";
      job.runAt = s.now + wait;
      s.retried += 1;
      log(s, "warn", `job:failed #${job.id} · retry in ${wait / 1000}s (5s · 2^${job.attempts - 1})`);
    }
    job.worker = -1;
    w.job = null;
    if (w.state === "draining") {
      w.state = "offline";
      log(s, "", `w${w.id + 1} finished in-flight job · exited cleanly`);
    } else w.state = "idle";
  }

  for (const w of s.workers) if (w.state === "idle") claim(s, w);

  // Completed chips linger briefly in the done tray; the DLQ keeps the latest six.
  s.jobs = s.jobs.filter((j) => !(j.status === "completed" && s.now - j.doneAt > 2400));
  const dead = s.jobs.filter((j) => j.status === "failed");
  if (dead.length > 6) {
    const drop = new Set(dead.slice(0, dead.length - 6).map((j) => j.id));
    s.jobs = s.jobs.filter((j) => !drop.has(j.id));
  }
}

function retryDead(s: Sim) {
  for (const j of s.jobs.filter((x) => x.status === "failed")) {
    j.status = "pending";
    j.attempts = 0;
    j.runAt = s.now;
    j.born = s.now;
    log(s, "", `POST /jobs/${j.id}/retry → requeued (WHERE status = 'failed')`);
  }
}

function toggleWorker(s: Sim) {
  const w = s.workers[2];
  if (w.state === "offline") {
    w.state = "idle";
    log(s, "", "w3 started · polling");
  } else if (w.state === "busy") {
    w.state = "draining";
    log(s, "warn", "SIGTERM → w3 · awaiting in-flight job before exit");
  } else if (w.state === "idle") {
    w.state = "offline";
    log(s, "", "SIGTERM → w3 · idle, exited cleanly");
  }
}

const snapshot = (s: Sim): Sim => ({
  ...s,
  jobs: s.jobs.map((j) => ({ ...j })),
  workers: s.workers.map((w) => ({ ...w })),
  log: [...s.log],
});

// ───────────────────────── view ─────────────────────────

export default function QueueSim() {
  const simRef = useRef<Sim | null>(null);
  const [view, setView] = useState<Sim>(createSim);
  const [running, setRunning] = useState(false);
  const [width, setWidth] = useState(560);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  const mutate = (fn: (s: Sim) => void) => {
    simRef.current ??= createSim();
    fn(simRef.current);
    setView(snapshot(simRef.current));
  };

  useEffect(() => {
    const el = rootRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(stage);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) setRunning(true);
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const t = performance.now();
      const dt = Math.min(t - last, 250);
      last = t;
      if (!visible.current || document.hidden) return;
      simRef.current ??= createSim();
      step(simRef.current, dt * SPEED);
      setView(snapshot(simRef.current));
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  const s = view;

  // ── layout ──
  const compact = width < 480;
  const pad = 14;
  const prodW = compact ? 30 : 42;
  const workerW = compact ? 64 : 92;
  const laneH = 40;
  const laneGap = 14;
  const laneY = (k: number) => 16 + k * (laneH + laneGap);
  const laneX0 = pad + prodW + 10;
  const workerX = width - pad - workerW;
  const laneX1 = workerX - 14;
  const chipW = 34;
  const chipH = 22;
  const binY = laneY(TIERS) + 4;
  const binH = 52;
  const height = binY + binH + 14;
  const binMid = laneX0 + (width - pad - laneX0) * 0.36;

  const positions = new Map<number, { x: number; y: number; o: number; cls: string; title: string }>();
  for (let tier = 0; tier < TIERS; tier++) {
    s.jobs
      .filter((j) => j.status === "pending" && j.tier === tier)
      .sort((a, b) => a.runAt - b.runAt || a.id - b.id)
      .forEach((j, i) => {
        const x = laneX1 - (i + 1) * (chipW + 6);
        const waiting = j.runAt > s.now;
        const fresh = j.born >= 0 && s.now - j.born < 400;
        positions.set(j.id, {
          x: fresh ? pad : x,
          y: laneY(tier) + (laneH - chipH) / 2,
          o: x < laneX0 + 18 ? 0 : 1,
          cls: waiting ? "wait" : j.attempts > 0 ? "retry" : "",
          title: waiting
            ? `job #${j.id} · due in ${((j.runAt - s.now) / 1000).toFixed(1)}s`
            : `job #${j.id} · due now · priority ${tier}`,
        });
      });
  }
  for (const j of s.jobs) {
    if (j.status === "processing") {
      positions.set(j.id, {
        x: workerX + 8,
        y: laneY(j.worker) + (laneH - chipH) / 2,
        o: 1,
        cls: "busy",
        title: `job #${j.id} · processing on w${j.worker + 1}`,
      });
    } else if (j.status === "completed") {
      positions.set(j.id, {
        x: binMid - chipW - 22 - (j.id % 3) * 6,
        y: binY + 22,
        o: s.now - j.doneAt > 900 ? 0 : 1,
        cls: "ok",
        title: `job #${j.id} · completed`,
      });
    }
  }
  s.jobs
    .filter((j) => j.status === "failed")
    .forEach((j, i) => {
      positions.set(j.id, {
        x: binMid + 12 + i * (chipW + 5),
        y: binY + 22,
        o: binMid + 12 + (i + 1) * (chipW + 5) > width - pad ? 0 : 1,
        cls: "dead",
        title: `job #${j.id} · status = 'failed'`,
      });
    });

  const w3 = s.workers[2];
  const pending = s.jobs.filter((j) => j.status === "pending").length;
  const hasDead = s.jobs.some((j) => j.status === "failed");

  return (
    <div className="tank qsim" ref={rootRef}>
      <div className="tank-head mono">
        <span>Queue simulation · time ×{SPEED}</span>
        <span className="live">{running ? "running" : "idle"}</span>
      </div>

      <div className="qstage" ref={stageRef} style={{ height }} aria-hidden="true">
        <span className="qlabel mono" style={{ left: pad, top: laneY(1) + 12, width: prodW }}>
          API
        </span>
        {Array.from({ length: TIERS }, (_, k) => (
          <div key={k} className="qlane" style={{ left: laneX0, top: laneY(k), width: laneX1 - laneX0, height: laneH }}>
            <span className="mono">P{k}</span>
          </div>
        ))}
        {s.workers.map((w, k) => {
          const job = w.job != null ? s.jobs.find((j) => j.id === w.job) : undefined;
          const progress = job ? Math.min(1, (s.now - job.startedAt) / job.duration) : 0;
          return (
            <div
              key={w.id}
              className={`qworker ${w.state}`}
              style={{ left: workerX, top: laneY(k), width: workerW, height: laneH }}
            >
              <span className="mono">
                w{w.id + 1}
                {!compact && <em>{w.state === "busy" ? "" : ` · ${w.state}`}</em>}
              </span>
              <i style={{ transform: `scaleX(${progress})` }} />
            </div>
          );
        })}
        <div className="qbin" style={{ left: laneX0, top: binY, width: binMid - laneX0 - 8, height: binH }}>
          <span className="mono">completed · {s.done}</span>
        </div>
        <div className="qbin dlq" style={{ left: binMid, top: binY, width: width - pad - binMid, height: binH }}>
          <span className="mono">DLQ · status = &apos;failed&apos;</span>
        </div>

        {s.jobs.map((j) => {
          const p = positions.get(j.id);
          if (!p) return null;
          return (
            <span
              key={j.id}
              className={`qchip mono ${p.cls}`}
              title={p.title}
              style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)`, opacity: p.o, width: chipW, height: chipH }}
            >
              #{j.id}
              {p.cls === "wait" && (
                <i
                  style={{
                    transform: `scaleX(${Math.max(0, 1 - (j.runAt - s.now) / backoffMs(Math.max(1, j.attempts)))})`,
                  }}
                />
              )}
            </span>
          );
        })}
      </div>

      <div className="tank-foot">
        <button
          type="button"
          className="tbtn hot"
          onClick={() => {
            mutate((sim) => {
              for (let i = 0; i < 5; i++) enqueue(sim);
            });
            setRunning(true);
          }}
        >
          + Enqueue 5
        </button>
        <button
          type="button"
          className="tbtn"
          onClick={() => mutate((sim) => (sim.fail = (sim.fail + 1) % FAIL_STEPS.length))}
        >
          Fail rate {Math.round(FAIL_STEPS[s.fail] * 100)}%
        </button>
        <button type="button" className="tbtn" onClick={() => mutate(toggleWorker)} disabled={w3.state === "draining"}>
          {w3.state === "offline" ? "Start w3" : w3.state === "draining" ? "w3 draining…" : "SIGTERM w3"}
        </button>
        <button type="button" className="tbtn" onClick={() => mutate(retryDead)} disabled={!hasDead}>
          Retry DLQ
        </button>
        <span className="tcount mono">
          <span>
            pending <b>{pending}</b>
          </span>
          <span>
            retried <b>{s.retried}</b>
          </span>
          <span>
            dead <b>{s.dead}</b>
          </span>
        </span>
      </div>

      <div className="tlog" aria-live="off">
        {s.log.length === 0 ? (
          <span className="ev">waiting for the first event on job:events…</span>
        ) : (
          s.log.map((e, i) => (
            <span key={`${i}-${e.t}`} className={`ev ${e.k}`}>
              {e.t}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
