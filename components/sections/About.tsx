import { about, laps, site } from "@/content/site";
import { SectionHead } from "../ui";

function Portrait() {
  if (site.portrait) {
    return (
      <picture>
        <source srcSet={`${site.portrait}.avif`} type="image/avif" />
        <source srcSet={`${site.portrait}.webp`} type="image/webp" />
        <img
          src={`${site.portrait}.jpg`}
          alt={`Portrait of ${site.name}`}
          width={900}
          height={1125}
          loading="lazy"
          decoding="async"
          data-portrait-img
        />
      </picture>
    );
  }
  return (
    <div className="portrait-mono" aria-hidden="true" data-portrait-img>
      <span>CM</span>
    </div>
  );
}

export default function About() {
  const words = about.belief.split(" ");
  return (
    <section id="about" className="section lane" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead id="about" meters={laps.about} label="About">
          {about.heading}
        </SectionHead>

        <div className="about-grid">
          <figure data-reveal>
            <div className="portrait" data-portrait>
              <Portrait />
              <div className="portrait-cap mono" aria-hidden="true">
                <span>{site.name}</span>
                <span>{site.location.city}</span>
              </div>
            </div>
            <figcaption>
              <div className="route mono">
                <span>
                  {site.hometown.city}, {site.hometown.code}
                </span>
                <span className="route-line" data-route />
                <span>
                  {site.location.city}, {site.location.code}
                </span>
              </div>
              <p className="route-km mono">{site.distanceHomeKm.toLocaleString("en-IN")} km as the crow flies</p>
            </figcaption>
          </figure>

          <div>
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className={i === 0 ? "lede" : "prose-p"}
                data-reveal
                style={i === 0 ? { marginBottom: "1.1em" } : undefined}
              >
                {p}
              </p>
            ))}

            <dl className="facts">
              <div data-reveal>
                <dt className="mono">Studying</dt>
                <dd>
                  {site.education.degree}
                  <br />
                  {site.education.school}
                </dd>
              </div>
              <div data-reveal>
                <dt className="mono">CGPA</dt>
                <dd className="big">{site.education.cgpa}</dd>
              </div>
              <div data-reveal>
                <dt className="mono">Years</dt>
                <dd>{site.education.years}</dd>
              </div>
              <div data-reveal>
                <dt className="mono">Focus</dt>
                <dd>Backend &amp; distributed systems</dd>
              </div>
            </dl>
          </div>
        </div>

        <blockquote className="belief" data-belief>
          <p>
            {words.map((w, i) => (
              <span key={i}>
                <span className="w">{w}</span>
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <footer className="belief-by mono">— the one thing I believe in</footer>
        </blockquote>

        <ol className="rules">
          {about.rules.map((r, i) => (
            <li key={r.rule} data-reveal>
              <span className="n mono">Rule {String(i + 1).padStart(2, "0")}</span>
              <h3>{r.rule}</h3>
              <p>{r.proof}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
