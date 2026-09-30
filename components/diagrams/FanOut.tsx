"use client";

// Fan-out-on-write vs fan-out-on-read, animated: where the work lands when one post meets N followers.
import { useEffect, useRef, useState } from "react";

type Mode = "write" | "read";

const N = 8;
const AUTHOR = { x: 70, y: 165 };
const FX = 500;
const fy = (i: number) => 32 + i * 38.5;
const ROW_X = 250;
const ROW_W = 110;
const FOLLOWS = { x: 232, y: 58, w: 132, h: 80 };
const POSTS = { x: 232, y: 196, w: 132, h: 80 };
const PICK = 3;

const COSTS = {
  write: {
    write: (celeb: boolean) => (celeb ? "1,000,000 inserts" : `${N} inserts`),
    writeNote: "one feed_items row per follower",
    read: () => "1 indexed lookup",
    readNote: "WHERE user_id = $1 on a precomputed feed",
  },
  read: {
    write: () => "1 insert",
    writeNote: "the post row, nothing else",
    read: (celeb: boolean) => (celeb ? "join across every followee" : "join follows ⋈ posts"),
    readNote: "recomputed on every single feed open",
  },
} as const;

export default function FanOut() {
  const [mode, setMode] = useState<Mode>("write");
  const [celeb, setCeleb] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let revert: (() => void) | null = null;
    let disposed = false;
    import("gsap").then(({ gsap }) => {
      if (disposed) return;
      const q = gsap.utils.selector(svg);
      const dots = q(".fo-dot");
      const reader = q(`.fo-follower[data-i="${PICK}"]`);
      const ctx = gsap.context(() => {
        gsap.set(dots, { x: AUTHOR.x, y: AUTHOR.y, opacity: 0, scale: 1 });
        gsap.set(q(".fo-row, .fo-box"), { fill: "rgba(127,214,224,0.06)" });
        gsap.set(q(".fo-q"), { strokeDashoffset: 1, opacity: 0 });

        const t = gsap.timeline({ repeat: -1, repeatDelay: 1.1, defaults: { ease: "power3.inOut" } });

        t.to(q(".fo-author"), { scale: 1.12, duration: 0.25, transformOrigin: "50% 50%", yoyo: true, repeat: 1 });
        if (mode === "write") {
          t.set(dots, { opacity: 1 }, "<");
          t.to(dots, {
            x: ROW_X + ROW_W / 2,
            y: (i: number) => fy(i),
            duration: 0.8,
            stagger: 0.05,
          });
          t.to(q(".fo-row"), { fill: "rgba(255,90,60,0.55)", duration: 0.15, stagger: 0.05 }, "<0.55");
          t.to(q(".fo-row"), { fill: "rgba(127,214,224,0.1)", duration: 0.6 }, ">0.2");
          t.to(dots, { opacity: 0, duration: 0.2 }, "<");
          t.addLabel("open", ">0.3");
          t.to(reader, { scale: 1.3, transformOrigin: "50% 50%", duration: 0.25, yoyo: true, repeat: 1 }, "open");
          t.set(dots[0], { x: ROW_X + ROW_W, y: fy(PICK), opacity: 1 }, "open+=0.2");
          t.to(q(`.fo-row[data-i="${PICK}"]`), { fill: "rgba(255,90,60,0.55)", duration: 0.15 }, "open+=0.2");
          t.to(dots[0], { x: FX - 14, duration: 0.55 }, "open+=0.3");
          t.to(dots[0], { opacity: 0, duration: 0.15 });
          t.to(q(`.fo-row[data-i="${PICK}"]`), { fill: "rgba(127,214,224,0.1)", duration: 0.4 }, "<");
        } else {
          t.set(dots[0], { opacity: 1 }, "<");
          t.to(dots[0], { x: POSTS.x + POSTS.w / 2, y: POSTS.y + POSTS.h / 2, duration: 0.8 });
          t.to(q(".fo-posts"), { fill: "rgba(255,90,60,0.4)", duration: 0.15 }, "<0.6");
          t.to(q(".fo-posts"), { fill: "rgba(127,214,224,0.06)", duration: 0.5 }, ">0.1");
          t.to(dots[0], { opacity: 0, duration: 0.2 }, "<");
          t.addLabel("open", ">0.3");
          t.to(reader, { scale: 1.3, transformOrigin: "50% 50%", duration: 0.25, yoyo: true, repeat: 1 }, "open");
          t.to(
            q(".fo-q"),
            { opacity: 1, strokeDashoffset: 0, duration: 0.7, stagger: 0.35, ease: "power2.out" },
            "open+=0.2",
          );
          t.to(q(".fo-follows"), { fill: "rgba(255,90,60,0.35)", duration: 0.2 }, "open+=0.5");
          t.to(q(".fo-posts"), { fill: "rgba(255,90,60,0.35)", duration: 0.2 }, "open+=0.85");
          t.set(dots[1], { x: POSTS.x + POSTS.w, y: POSTS.y + POSTS.h / 2, opacity: 1 }, "open+=1.2");
          t.to(dots[1], { x: FX - 14, y: fy(PICK), duration: 0.6 }, "open+=1.25");
          t.to(dots[1], { opacity: 0, duration: 0.15 });
          t.to(q(".fo-q"), { opacity: 0, duration: 0.3 }, "<");
          t.to(q(".fo-follows, .fo-posts"), { fill: "rgba(127,214,224,0.06)", duration: 0.4 }, "<");
        }
        return t;
      }, svg);
      revert = () => ctx.revert();
    });

    return () => {
      disposed = true;
      revert?.();
    };
  }, [mode, inView]);

  const cost = COSTS[mode];

  return (
    <div className="tank fanout" ref={rootRef}>
      <div className="tank-head mono">
        <span>Feed fan-out · {celeb ? "1,000,000" : N} followers</span>
        <span className="live">{mode === "write" ? "fan-out on write" : "fan-out on read"}</span>
      </div>

      <svg
        ref={svgRef}
        className={`fo-svg mode-${mode}`}
        viewBox="0 0 600 330"
        role="img"
        aria-label={
          mode === "write"
            ? "Fan-out on write: one post is copied into every follower's feed_items row; reading a feed is a single lookup."
            : "Fan-out on read: a post is written once; opening a feed joins the follow graph against posts every time."
        }
      >
        {/* links author → followers (the social graph) */}
        <g className="fo-graph">
          {Array.from({ length: N }, (_, i) => (
            <line key={i} x1={AUTHOR.x} y1={AUTHOR.y} x2={FX} y2={fy(i)} />
          ))}
        </g>

        <g className="fo-write">
          <text className="fo-label" x={ROW_X} y={16}>
            feed_items
          </text>
          {Array.from({ length: N }, (_, i) => (
            <rect key={i} className="fo-row" data-i={i} x={ROW_X} y={fy(i) - 12} width={ROW_W} height={24} rx={4} />
          ))}
        </g>

        <g className="fo-read">
          <rect className="fo-box fo-follows" x={FOLLOWS.x} y={FOLLOWS.y} width={FOLLOWS.w} height={FOLLOWS.h} rx={6} />
          <text className="fo-label" x={FOLLOWS.x + 12} y={FOLLOWS.y + 24}>
            follows
          </text>
          <text className="fo-sub" x={FOLLOWS.x + 12} y={FOLLOWS.y + 44}>
            follower_id → followee_id
          </text>
          <rect className="fo-box fo-posts" x={POSTS.x} y={POSTS.y} width={POSTS.w} height={POSTS.h} rx={6} />
          <text className="fo-label" x={POSTS.x + 12} y={POSTS.y + 24}>
            posts
          </text>
          <text className="fo-sub" x={POSTS.x + 12} y={POSTS.y + 44}>
            ORDER BY created_at
          </text>
          <path
            className="fo-q"
            pathLength={1}
            d={`M${FX - 14} ${fy(PICK)} C 430 ${fy(PICK)}, 420 ${FOLLOWS.y + 40}, ${FOLLOWS.x + FOLLOWS.w} ${FOLLOWS.y + 40}`}
          />
          <path
            className="fo-q"
            pathLength={1}
            d={`M${FOLLOWS.x + FOLLOWS.w / 2} ${FOLLOWS.y + FOLLOWS.h} V ${POSTS.y}`}
          />
        </g>

        <g className="fo-author">
          <circle cx={AUTHOR.x} cy={AUTHOR.y} r={30} />
          <text x={AUTHOR.x} y={AUTHOR.y + 4} textAnchor="middle">
            post
          </text>
        </g>
        <text className="fo-sub" x={AUTHOR.x} y={AUTHOR.y + 52} textAnchor="middle">
          {celeb ? "celebrity" : "author"}
        </text>

        {Array.from({ length: N }, (_, i) => (
          <g key={i} className="fo-follower" data-i={i}>
            <circle cx={FX} cy={fy(i)} r={11} />
          </g>
        ))}
        <text className="fo-sub" x={FX + 22} y={fy(PICK) + 4}>
          opens feed
        </text>
        {celeb && (
          <text className="fo-sub accent" x={FX} y={322} textAnchor="middle">
            × 125,000 each
          </text>
        )}

        {Array.from({ length: N }, (_, i) => (
          <circle key={i} className="fo-dot" r={5} cx={0} cy={0} opacity={0} />
        ))}
      </svg>

      <dl className="fo-costs">
        <div>
          <dt className="mono">Cost per post</dt>
          <dd className={mode === "write" && celeb ? "hot" : ""}>{cost.write(celeb)}</dd>
          <dd className="mono note">{cost.writeNote}</dd>
        </div>
        <div>
          <dt className="mono">Cost per feed open</dt>
          <dd className={mode === "read" && celeb ? "hot" : ""}>{cost.read(celeb)}</dd>
          <dd className="mono note">{cost.readNote}</dd>
        </div>
      </dl>

      <div className="tank-foot">
        <button type="button" className="tbtn" aria-pressed={mode === "write"} onClick={() => setMode("write")}>
          Fan-out on write
        </button>
        <button type="button" className="tbtn" aria-pressed={mode === "read"} onClick={() => setMode("read")}>
          Fan-out on read
        </button>
        <button type="button" className="tbtn" aria-pressed={celeb} onClick={() => setCeleb((c) => !c)}>
          Celebrity account
        </button>
      </div>
    </div>
  );
}
