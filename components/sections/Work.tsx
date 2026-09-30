import { laps } from "@/content/site";
import { alsoBuilt, problems, type Problem } from "@/content/projects";
import { Arrow, GitHubIcon, SectionHead } from "../ui";

// ClipForge's ten steps; the LLM only runs the marked ones, and the run pauses for review after the critic.
const PIPE = ["angle", "script", "critic", "board", "voice", "assets", "timeline", "render", "meta", "publish"];
const LLM = new Set(["angle", "script", "critic", "board", "meta"]);

function Viz({ kind }: { kind: Problem["visual"] }) {
  if (kind === "context") {
    return (
      <div className="viz viz-context" aria-hidden="true">
        <div className="viz-grid">
          {Array.from({ length: 72 }, (_, i) => (
            <i key={i} className={i === 45 ? "hit" : ""} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
        <span className="viz-chain mono">
          <b>issue</b>→<b>PR</b>→<b>diff</b>→<b>file</b>
        </span>
      </div>
    );
  }
  return (
    <div className="viz viz-pipe" aria-hidden="true">
      <div className="pipe-track">
        <span className="pipe-line" />
        {PIPE.map((s, i) => (
          <span
            key={s}
            className={`st mono ${LLM.has(s) ? "llm" : ""} ${s === "critic" ? "pause" : ""}`}
            style={{ left: `${(i / (PIPE.length - 1)) * 100}%` }}
          >
            <i />
            <span>{s}</span>
          </span>
        ))}
        <span className="mover">
          <b className="token" />
        </span>
      </div>
    </div>
  );
}

function Card({ p, index, total }: { p: Problem; index: number; total: number }) {
  return (
    <article className="card" aria-labelledby={`${p.id}-title`} data-inview data-card>
      <div>
        <p className="card-top mono">
          <span>{p.code}</span>
          <span>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </p>
        <h3 id={`${p.id}-title`} style={{ marginTop: 18 }}>
          {p.name}
        </h3>
        <p className="card-context mono">{p.context}</p>
      </div>

      <Viz kind={p.visual} />

      <div className="card-cols">
        <div>
          <h4 className="mono">The problem</h4>
          <p>{p.problem}</p>
        </div>
        <div>
          <h4 className="mono">{p.team ? "My part" : "What I did"}</h4>
          <ul>
            {p.did.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-foot">
        <dl className="results">
          {p.result.map((r) => (
            <div key={r.label}>
              <dt className="sr-only">{r.label}</dt>
              <dd className="v">{r.value}</dd>
              <dd className="l mono">{r.label}</dd>
            </div>
          ))}
        </dl>
        <div className="card-meta">
          <ul className="stack mono" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <a className="card-link link-u" href={p.repo} target="_blank" rel="noopener">
            <GitHubIcon /> Repository <Arrow dir="ne" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  const total = problems.length + 1;
  return (
    <section id="work" className="section lane reel" aria-labelledby="work-title" data-reel>
      <div className="wrap">
        <SectionHead id="work" meters={laps.work} label="Problems I attacked">
          Other problems I went after.
        </SectionHead>
      </div>

      <div className="reel-pin" data-reel-pin>
        <div className="wrap">
          <div className="reel-track" data-reel-track>
            {problems.map((p, i) => (
              <Card key={p.id} p={p} index={i} total={total} />
            ))}
            <article className="card also" aria-labelledby="also-title" data-card>
              <div>
                <p className="card-top mono">
                  <span>ALSO BUILT</span>
                  <span>
                    {String(total).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </p>
                <h3 id="also-title" style={{ marginTop: 18 }}>
                  Smaller laps.
                </h3>
              </div>
              <ul className="also-list">
                {alsoBuilt.map((a) => (
                  <li key={a.name}>
                    <strong>
                      {a.repo ? (
                        <a className="link-u" href={a.repo} target="_blank" rel="noopener">
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                      {a.repo && <Arrow dir="ne" />}
                    </strong>
                    <p>{a.note}</p>
                  </li>
                ))}
              </ul>
              <a className="card-link link-u" href="https://github.com/Chirag-Mukhija" target="_blank" rel="noopener">
                <GitHubIcon /> Everything else on GitHub <Arrow dir="ne" />
              </a>
            </article>
          </div>
          <p className="reel-hint mono" aria-hidden="true">
            <span>Keep scrolling</span>
            <span className="reel-progress">
              <i data-reel-progress />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
