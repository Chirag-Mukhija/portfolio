// Small shared pieces: icons, the lane mark, backstroke flags and the section header.
import type { ReactNode } from "react";

export function Arrow({ dir = "right", className = "" }: { dir?: "right" | "down" | "up" | "ne"; className?: string }) {
  const rotate = { right: 0, down: 90, up: -90, ne: -45 }[dir];
  return (
    <svg
      className={`arrow ${dir === "down" ? "down" : ""} ${className}`}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

// Pool-floor lane marker: the dark stripe that ends in a T before the wall.
export function LaneMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0b2233" />
      <rect x="13" y="5" width="6" height="17" fill="#7fd6e0" />
      <rect x="6" y="20" width="20" height="6" fill="#7fd6e0" />
      <circle cx="25.5" cy="7.5" r="3" fill="#ff5a3c" />
    </svg>
  );
}

export function Flags({ count = 25, inview = false }: { count?: number; inview?: boolean }) {
  return (
    <div className="flags" aria-hidden="true" data-inview={inview || undefined}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="flag" style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

export function SectionHead({
  id,
  meters,
  label,
  children,
  aside,
}: {
  id: string;
  meters: number;
  label: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="sec-head">
      <p className="sec-mark mono">
        <span className="dist">{String(meters).padStart(3, "0")} m</span>
        <span className="rule" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <h2 id={`${id}-title`} className="h2" data-split>
        {children}
      </h2>
      {aside}
    </header>
  );
}
