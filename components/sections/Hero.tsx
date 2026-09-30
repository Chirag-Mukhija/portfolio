import { site } from "@/content/site";
import { Arrow, Flags } from "../ui";

export default function Hero() {
  return (
    <section id="top" className="hero lane" aria-labelledby="hero-title" data-hero>
      <div className="floor-t" aria-hidden="true" />
      <Flags />

      <div className="wrap hero-body">
        <p className="hero-eyebrow mono">
          <span className="lane-no">Lane 04</span>
          <span>{site.location.city}, India</span>
          <span className="hide-xs">{site.education.schoolShort} · CSE ’28</span>
        </p>

        <h1 id="hero-title" className="hero-name display" data-hero-name>
          <span className="line">{site.firstName}</span>
          <span className="line">
            {site.lastName}
          </span>
        </h1>

        <div className="hero-foot">
          <p className="hero-role" style={{ "--i": 0 } as React.CSSProperties}>
            <span className="mono" style={{ color: "var(--muted)" }}>
              Role
            </span>
            <strong>{site.role}</strong>
          </p>
          <p className="hero-pitch lede" style={{ "--i": 1 } as React.CSSProperties}>
            {site.pitch}
          </p>
          <div className="hero-ctas" style={{ "--i": 2 } as React.CSSProperties}>
            <a className="btn btn-primary" href="#systems">
              See the systems <Arrow dir="down" />
            </a>
            <a className="btn btn-ghost" href="#contact">
              Get in touch
            </a>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="hero-meta mono">
          <span className="now">{site.now}</span>
          <span className="hide-sm">
            {site.education.degree} · CGPA {site.education.cgpa}
          </span>
        </div>
      </div>
    </section>
  );
}
