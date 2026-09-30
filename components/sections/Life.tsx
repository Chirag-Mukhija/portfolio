import { laps } from "@/content/site";
import { life } from "@/content/training";
import { SectionHead } from "../ui";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const EQ = [0.55, 0.9, 0.4, 0.75, 1, 0.5, 0.8, 0.35, 0.65, 0.95, 0.45, 0.7];

export default function Life() {
  return (
    <section id="life" className="section lane" aria-labelledby="life-title">
      <div className="wrap">
        <SectionHead id="life" meters={laps.life} label="Life">
          {life.heading}
        </SectionHead>

        <div className="life-grid">
          <article className="tile tile-swim" data-inview data-swim>
            <div>
              <p className="mono" style={{ color: "var(--aqua)" }}>
                Swimming
              </p>
              <h3 style={{ marginTop: 14 }}>{life.swim.title}</h3>
              <p>{life.swim.body}</p>
            </div>
            <div className="pool" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`pool-lane ${n === 4 ? "mine" : ""}`}>
                  <span className="mono">{n}</span>
                  {n === 4 && (
                    <span className="lap">
                      <b />
                    </span>
                  )}
                </div>
              ))}
            </div>
            <ol className="race">
              {life.swim.results.map((r) => (
                <li key={r.event} className="race-lane">
                  <div>
                    <p className="race-event">{r.event}</p>
                    <p className="race-level mono">
                      {r.level} · {r.medal}
                    </p>
                    <div className="race-track" aria-hidden="true">
                      <span className="race-swimmer" data-swimmer />
                    </div>
                  </div>
                  <span className="medal" data-medal role="img" aria-label={`${r.medal} medal`}>
                    <span>
                      2<small>ND</small>
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="tile tile-gym" data-inview>
            <div>
              <p className="mono" style={{ color: "var(--muted)" }}>
                Training
              </p>
              <h3 style={{ marginTop: 14 }}>{life.gym.title}</h3>
              <p>{life.gym.body}</p>
            </div>
            <div className="week" aria-hidden="true">
              {DAYS.map((d, i) => (
                <div key={i}>
                  <i style={{ "--i": i } as React.CSSProperties} />
                  <span className="mono">{d}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="tile tile-bad" data-inview data-shuttle>
            <div>
              <p className="mono" style={{ color: "var(--muted)" }}>
                Badminton
              </p>
              <h3 style={{ marginTop: 14 }}>{life.badminton.title}</h3>
              <p>{life.badminton.body}</p>
            </div>
            <svg className="shuttle-svg" viewBox="0 0 320 110" aria-hidden="true">
              <line className="court" x1="0" y1="104" x2="320" y2="104" />
              <line className="net" x1="160" y1="104" x2="160" y2="58" />
              <path className="arc" d="M24 96 Q 160 -40 296 96" data-arc />
              <circle className="shuttle" r="6" cx="24" cy="96" data-shuttle-dot />
            </svg>
          </article>

          <article className="tile tile-music" data-inview>
            <div>
              <p className="mono" style={{ color: "var(--muted)" }}>
                Music
              </p>
              <h3 style={{ marginTop: 14 }}>{life.music.title}</h3>
              <p>{life.music.body}</p>
            </div>
            <div className="eq" aria-hidden="true">
              {EQ.map((h, i) => (
                <i key={i} style={{ "--h": h, "--i": i } as React.CSSProperties} />
              ))}
            </div>
          </article>

          <article className="tile tile-read" data-inview>
            <div>
              <p className="mono" style={{ color: "var(--muted)" }}>
                Reading
              </p>
              <h3 style={{ marginTop: 14 }}>{life.reading.title}</h3>
              <p>{life.reading.body}</p>
            </div>
            <div className="books" aria-hidden="true">
              {[52, 64, 44, 58, 38, 60, 48].map((h, i) => (
                <i key={i} className={i === 6 ? "lean" : ""} style={{ height: h }} />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
