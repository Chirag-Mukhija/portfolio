import { Fragment } from "react";
import { laps } from "@/content/site";
import { systems, type CaseFile } from "@/content/projects";
import { highlight } from "@/lib/highlight";
import { Arrow, GitHubIcon, SectionHead } from "../ui";
import QueueSim from "../diagrams/QueueSim";
import FanOut from "../diagrams/FanOut";
import IdempotencyFlow from "../diagrams/IdempotencyFlow";

const WAVE = "M0 40 Q 180 0 360 40 T 720 40 T 1080 40 T 1440 40 T 1800 40 T 2160 40 T 2520 40 T 2880 40 V100 H0 Z";

function Waves() {
  return (
    <div className="waves" aria-hidden="true">
      <div className="w2-wrap" style={{ position: "absolute", inset: 0, width: "200%" }}>
        <svg viewBox="0 0 2880 100" preserveAspectRatio="none" style={{ width: "100%" }}>
          <path className="w2" d={WAVE} transform="translate(0 -14)" />
        </svg>
      </div>
      <div className="w1-wrap" style={{ position: "absolute", inset: 0, width: "200%" }}>
        <svg viewBox="0 0 2880 100" preserveAspectRatio="none" style={{ width: "100%" }}>
          <path className="w1" d={WAVE} />
        </svg>
      </div>
    </div>
  );
}

function Diagram({ kind }: { kind: CaseFile["diagram"] }) {
  if (kind === "queue") return <QueueSim />;
  if (kind === "fanout") return <FanOut />;
  return <IdempotencyFlow />;
}

function Code({ file, source, note }: CaseFile["excerpt"]) {
  const lines = highlight(source);
  return (
    <figure className="code" data-code>
      <div className="code-bar mono">
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{file}</span>
      </div>
      <pre tabIndex={0} aria-label={`Code excerpt from ${file}`}>
        <code>
          {lines.map((line, i) => (
            <span key={i} className="ln" data-n={i + 1}>
              {line.map((tok, j) =>
                tok.t === "txt" ? (
                  <Fragment key={j}>{tok.v}</Fragment>
                ) : (
                  <span key={j} className={`tk-${tok.t}`}>
                    {tok.v}
                  </span>
                )
              )}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
      <figcaption>{note}</figcaption>
    </figure>
  );
}

function Case({ c }: { c: CaseFile }) {
  const nextIndex = c.phases.findIndex((p) => !p.done);
  return (
    <article id={c.id} className="case" aria-labelledby={`${c.id}-title`}>
      <header className="case-head">
        <div data-reveal>
          <p className="case-code mono">
            <span>{c.code}</span>
            <span style={{ color: "var(--on-deep-muted)" }}>{c.name}</span>
          </p>
          <h3 id={`${c.id}-title`} className="h3">
            {c.title}
          </h3>
          <p className="case-tag">{c.tagline}</p>
        </div>
        <div className="case-meta" data-reveal>
          <p className="status mono">
            <span className={`status-bar ${c.status.done < c.status.total ? "partial" : ""}`} aria-hidden="true">
              {Array.from({ length: c.status.total }, (_, i) => (
                <i key={i} className={i < c.status.done ? "on" : ""} />
              ))}
            </span>
            <span>{c.status.label}</span>
          </p>
          <ul className="stack mono" aria-label="Stack">
            {c.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <a className="repo-link link-u" href={c.repo} target="_blank" rel="noopener">
            <GitHubIcon /> Read the code <Arrow dir="ne" />
          </a>
        </div>
      </header>

      <div className="case-grid">
        <div className="case-visual">
          <Diagram kind={c.diagram} />
        </div>

        <div className="case-body">
          <section aria-label="The problem" data-reveal>
            <h4 className="mono">The problem</h4>
            <p className="problem">{c.problem}</p>
          </section>

          <section aria-label="Decisions">
            <h4 className="mono" data-reveal>
              Decisions &amp; trade-offs
            </h4>
            <ol className="decisions">
              {c.decisions.map((d) => (
                <li key={d.title} className="decision" data-reveal>
                  <strong>{d.title}</strong>
                  <p className="instead mono">
                    Instead of <s>{d.instead}</s>
                  </p>
                  <p>{d.why}</p>
                  <p className="cost">
                    <span className="sr-only">Cost: </span>
                    {d.cost}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-label="The crux, in code" data-reveal>
            <h4 className="mono">The crux, in code</h4>
            <Code {...c.excerpt} />
          </section>

          <section aria-label="What breaks" data-reveal>
            <h4 className="mono">What breaks — honestly</h4>
            <ul className="limits">
              {c.limits.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>

          <section aria-label="Build log" data-reveal>
            <h4 className="mono">Build log</h4>
            <ol className="phases" data-phases>
              {c.phases.map((p, i) => (
                <li key={p.label} className={p.done ? "done" : i === nextIndex ? "next" : ""}>
                  <span>{p.label}</span>
                  <span className="tick" aria-label={p.done ? "done" : "planned"} role="img" />
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  );
}

export default function Systems() {
  return (
    <section id="systems" className="section deep lane" aria-labelledby="systems-title">
      <Waves />
      <div className="wrap">
        <SectionHead
          id="systems"
          meters={laps.systems}
          label="Systems I built"
          aside={
            <div className="deep-intro">
              <p className="lede" data-reveal style={{ color: "var(--ink-2)", maxWidth: "40ch" }}>
                Three backends built from zero to learn what production systems actually have to get right. Each one is
                built in phases, and every non-obvious decision is written down — including what it costs.
              </p>
              <p className="mono" data-reveal style={{ color: "var(--on-deep-muted)" }}>
                No “pay now → success” demos. The depth is in the code, so that’s what’s on show.
              </p>
            </div>
          }
        >
          The deep end.
        </SectionHead>

        {systems.map((c) => (
          <Case key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}
