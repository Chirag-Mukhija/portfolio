"use client";

// Sequence diagram for PaytmentGateway's idempotency path: first request, a retry, and the same-key race.
import { useEffect, useRef, useState } from "react";

type Col = 0 | 1 | 2; // client · api · postgres
type Msg = { from: Col; to: Col; label: string; sub?: string; tone?: "ok" | "bad" | "warn"; tag?: "A" | "B" };
type Row = { key: string; idem: string; amount: string; status: string; ghost?: boolean };
type Scenario = { id: string; title: string; msgs: Msg[]; before: Row[]; rows: Row[]; caption: string };

const P1: Row = { key: "pay_7f3a", idem: "order_1", amount: "499.00", status: "INITIATED" };
const P2: Row = { key: "pay_91c2", idem: "order_2", amount: "1,250.00", status: "INITIATED" };

const SCENARIOS: Scenario[] = [
  {
    id: "first",
    title: "First request",
    msgs: [
      { from: 0, to: 1, label: "POST /payments", sub: "Idempotency-Key: order_1" },
      { from: 1, to: 2, label: "SELECT … WHERE (merchant_id, key)", sub: "miss" },
      { from: 1, to: 2, label: "BEGIN · INSERT payment · INSERT event · COMMIT", sub: "one connection" },
      { from: 1, to: 0, label: "201 Created", sub: "pay_7f3a", tone: "ok" },
    ],
    before: [],
    rows: [P1],
    caption: "Payment and its first audit event commit together — or not at all.",
  },
  {
    id: "retry",
    title: "Retry after timeout",
    msgs: [
      { from: 0, to: 1, label: "POST /payments (retry)", sub: "Idempotency-Key: order_1", tone: "warn" },
      { from: 1, to: 2, label: "SELECT … WHERE (merchant_id, key)", sub: "hit → pay_7f3a" },
      { from: 1, to: 0, label: "200 OK · same payment", sub: "no second charge", tone: "ok" },
    ],
    before: [P1],
    rows: [P1],
    caption: "The client retried. The database still holds exactly one payment.",
  },
  {
    id: "race",
    title: "Race: same key, same ms",
    msgs: [
      { from: 0, to: 1, label: "POST /payments", sub: "order_2", tag: "A" },
      { from: 0, to: 1, label: "POST /payments", sub: "order_2", tag: "B" },
      { from: 1, to: 2, label: "SELECT → miss · SELECT → miss", sub: "both pass the pre-check", tone: "warn" },
      { from: 1, to: 2, label: "A: INSERT … COMMIT", sub: "wins", tone: "ok", tag: "A" },
      { from: 2, to: 1, label: "B: 23505 unique_violation", sub: "ROLLBACK", tone: "bad", tag: "B" },
      { from: 1, to: 0, label: "A: 201 · B: 409 Conflict", sub: "fails clean, not a 500", tone: "ok" },
    ],
    before: [P1],
    rows: [P1, P2, { ...P2, key: "(rolled back)", ghost: true }],
    caption: "The UNIQUE (merchant_id, idempotency_key) constraint is the real backstop.",
  },
];

const COLS = ["Client", "API", "Postgres"] as const;
const center = (c: Col) => (c * 2 + 1) / 6;

export default function IdempotencyFlow() {
  const [sc, setSc] = useState(0);
  const [step, setStep] = useState(SCENARIOS[0].msgs.length);
  const [auto, setAuto] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (e.isIntersecting && !started.current && !reduce) {
          started.current = true;
          setStep(0);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const total = SCENARIOS[sc].msgs.length;
    const id = window.setTimeout(
      () => {
        if (!inView.current || !started.current) return;
        if (step < total) setStep((s) => s + 1);
        else if (auto) {
          setSc((s) => (s + 1) % SCENARIOS.length);
          setStep(0);
        }
      },
      step < total ? 850 : 3200,
    );
    return () => window.clearTimeout(id);
  }, [sc, step, auto]);

  const scenario = SCENARIOS[sc];
  const complete = step >= scenario.msgs.length;
  const rows = complete ? scenario.rows : scenario.before;
  const events = rows.filter((r) => !r.ghost).length;

  return (
    <div className="tank idem" ref={rootRef}>
      <div className="tank-head mono">
        <span>Idempotency · {scenario.title}</span>
        <span className="live">{auto ? "auto-play" : "manual"}</span>
      </div>

      <div className="idem-seq">
        <div className="idem-cols" aria-hidden="true">
          {COLS.map((c, i) => (
            <div key={c} className="idem-col" style={{ left: `${center(i as Col) * 100}%` }}>
              <span className="mono">{c}</span>
            </div>
          ))}
        </div>
        <ol className="idem-msgs">
          {scenario.msgs.map((m, i) => {
            const a = center(m.from);
            const b = center(m.to);
            const left = Math.min(a, b);
            const width = Math.abs(b - a);
            return (
              <li
                key={`${scenario.id}-${i}`}
                className={`idem-msg ${i < step ? "on" : ""} ${m.tone ?? ""} ${b < a ? "back" : ""}`}
              >
                <div className="idem-arrow" style={{ left: `${left * 100}%`, width: `${width * 100}%` }}>
                  <span className="idem-label">
                    {m.tag && <em className={`tag tag-${m.tag}`}>{m.tag}</em>}
                    {m.label}
                    {m.sub && <small className="mono">{m.sub}</small>}
                  </span>
                  <i aria-hidden="true" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`idem-db ${complete ? "on" : ""}`}>
        <p className="mono idem-db-h">
          <span>payments</span>
          <span>
            payment_events · {events} {events === 1 ? "row" : "rows"}
          </span>
        </p>
        <table>
          <thead className="mono">
            <tr>
              <th scope="col">id</th>
              <th scope="col">idempotency_key</th>
              <th scope="col">amount</th>
              <th scope="col">status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4}>— empty —</td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className={r.ghost ? "ghost" : ""}>
                <td>{r.key}</td>
                <td>{r.idem}</td>
                <td>{r.amount}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="idem-cap">{scenario.caption}</p>
      </div>

      <div className="tank-foot">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="tbtn"
            aria-pressed={sc === i && !auto}
            onClick={() => {
              setAuto(false);
              started.current = true;
              setSc(i);
              setStep(0);
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
