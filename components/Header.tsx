import { nav, site } from "@/content/site";
import { Arrow, LaneMark } from "./ui";

export default function Header() {
  return (
    <header className="site-head" data-head>
      <div className="wrap">
        <a className="brand" href="#top" aria-label={`${site.name} — back to the start`}>
          <LaneMark className="brand-mark" />
          <span>{site.name}</span>
        </a>

        <span className="head-dist mono" data-dist aria-hidden="true">
          000 m
        </span>

        <nav className="head-nav" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href} data-nav={item.href.slice(1)}>
              {item.label}
            </a>
          ))}
          <a className="btn btn-primary" href={`mailto:${site.email}`}>
            Email me <Arrow dir="ne" />
          </a>
        </nav>

        <details className="menu" data-menu>
          <summary className="mono">Menu</summary>
          <nav className="menu-sheet" aria-label="Mobile">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
                <Arrow />
              </a>
            ))}
            <a href={`mailto:${site.email}`}>
              Email
              <Arrow dir="ne" />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
