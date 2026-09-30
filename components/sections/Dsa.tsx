import { laps } from "@/content/site";
import { dsa, leetcode } from "@/content/training";
import { Arrow, SectionHead } from "../ui";

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
  const { solved, easy, medium, hard } = leetcode;
  const cells = [
    ...Array<string>(hard).fill("hard"),
    ...Array<string>(medium).fill("medium"),
    ...Array<string>(easy).fill("easy"),
  ];
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
                <span data-count={s.value}>{s.value.toLocaleString("en-IN")}</span>
                {s.suffix ? <span className="accent">{s.suffix}</span> : null}
              </p>
              <p className="l mono">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="ticks-wrap">
          <div className="ticks-legend mono" data-reveal>
            <span className="hard">{hard} Hard</span>
            <span className="medium">{medium} Medium</span>
            <span className="easy">{easy} Easy</span>
            <a className="link-u" href={leetcode.profile} target="_blank" rel="noopener me">
              LeetCode profile <Arrow dir="ne" />
            </a>
          </div>
          <div
            className="ticks"
            role="img"
            aria-label={`${solved} LeetCode problems solved: ${hard} Hard, ${medium} Medium, ${easy} Easy.`}
            data-ticks
          >
            {cells.map((level, i) => (
              <i key={i} className={level} />
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
