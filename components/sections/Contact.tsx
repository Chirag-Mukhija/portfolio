import { laps, site } from "@/content/site";
import { Arrow, Flags, SectionHead } from "../ui";

export default function Contact() {
  const links = [
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GitHub", href: site.links.github },
    { label: "LeetCode", href: site.links.leetcode },
    { label: "Résumé (PDF)", href: site.resume },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <section id="contact" className="section contact lane" aria-labelledby="contact-title">
      <Flags inview />
      <div className="wrap">
        <SectionHead id="contact" meters={laps.contact} label="The wall">
          Touch the wall.
        </SectionHead>

        <div className="contact-grid">
          <div>
            <p className="lede" data-reveal style={{ maxWidth: "34ch", marginBottom: 28 }}>
              I’m looking for backend and systems internships. If you’re building something that has to hold up under
              real load, I’d like to hear about it.
            </p>
            <a className="big-mail" href={`mailto:${site.email}`} data-reveal>
              {site.email}
            </a>
          </div>
          <nav className="contact-links" aria-label="Profiles" data-reveal>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener me" }
                  : l.href.endsWith(".pdf")
                    ? { target: "_blank", rel: "noopener" }
                    : {})}
              >
                {l.label}
                <Arrow dir="ne" />
              </a>
            ))}
          </nav>
        </div>

        <div className="clock mono" aria-hidden="true">
          <span>
            Distance <b>200 m</b>
          </span>
          <span>
            Your time on this page <b data-clock>—</b>
          </span>
          <span>
            Stroke <b>freestyle</b>
          </span>
        </div>
      </div>
    </section>
  );
}
