import { laps } from "@/content/site";
import { dsa } from "@/content/training";
import { SectionHead } from "../ui";

function Marquee({ items, reverse = false }: { items: readonly string[]; reverse?: boolean }) {
  return (
    <div className={`marquee ${reverse ? "rev" : ""}`} data-marquee>
      <ul className="marquee-row">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
      <ul className="marquee-row" aria-hidden="true">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Dsa() {
  const { total, deep } = dsa.leetcode;
  return (
    <section id="dsa" className="section lane" aria-labelledby="dsa-title">
      <div className="wrap">
        <SectionHead id="dsa" meters={laps.dsa} label="Problem solving">
          {dsa.heading}
        </SectionHead>

        <div className="dsa-top">
          <p className="lede" data-reveal>
            {dsa.body[0]}
          </p>
          <p className="prose-p" data-reveal>
            {dsa.body[1]}
          </p>
        </div>

        <div className="stats">
          {dsa.stats.map((s) => (
            <div key={s.label} data-reveal>
              <p className="v">
                <span data-count={s.value}>{s.value}</span>
                {s.suffix ? <span className="accent">{s.suffix}</span> : null}
              </p>
              <p className="l mono">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="ticks-wrap">
          <div className="ticks-legend mono" data-reveal>
            <span>{deep} on DP &amp; graphs</span>
            <span className="rest">{total - deep} everything else</span>
          </div>
          <div
            className="ticks"
            role="img"
            aria-label={`Of ${total} LeetCode problems, about ${deep} are dynamic programming and graphs.`}
            data-ticks
          >
            {Array.from({ length: total }, (_, i) => (
              <i key={i} className={i < deep ? "deep" : "rest"} />
            ))}
          </div>
        </div>
      </div>

      <div className="marquees" data-marquees>
        <h3 className="sr-only">Problems I’ve solved</h3>
        <Marquee items={dsa.lanes[0]} />
        <Marquee items={dsa.lanes[1]} reverse />
      </div>
    </section>
  );
}
