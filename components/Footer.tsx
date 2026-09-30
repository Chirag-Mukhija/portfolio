import { site } from "@/content/site";
import { Arrow } from "./ui";

export default function Footer() {
  const year = site.updated.slice(0, 4);
  return (
    <footer className="lane" style={{ position: "relative" }}>
      <div className="wrap">
        <div className="foot mono">
          <span>
            © {year} {site.name} · {site.location.city}
          </span>
          <span>Designed &amp; built from scratch</span>
          <a href="#top" className="link-u">
            Back to the start <Arrow dir="up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
