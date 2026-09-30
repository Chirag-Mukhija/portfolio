"use client";

// One place for every scroll-driven behaviour, so sections stay server-rendered HTML.
// Everything here is enhancement: with JS off or reduced motion the page is complete without it.
// GSAP and Lenis load as a separate chunk after hydration so they never block the first paint.
import { useEffect } from "react";
import { laps } from "@/content/site";

declare global {
  interface Window {
    __cmReady?: boolean;
  }
}

type Libs = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  SplitText: typeof import("gsap/SplitText").SplitText;
  Lenis: typeof import("lenis").default;
};
type Api = {
  $: <T extends Element = HTMLElement>(sel: string) => T | null;
  $$: <T extends Element = HTMLElement>(sel: string) => T[];
  cleanups: Array<() => void>;
  measure: () => void;
  onScroll: () => void;
};

const INK = "#0b2233";
const pad2 = (n: number) => String(n).padStart(2, "0");

async function loadLibs(): Promise<Libs> {
  const [g, st, split, lenis] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
    import("lenis"),
  ]);
  return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger, SplitText: split.SplitText, Lenis: lenis.default };
}

function startMotion(libs: Libs, api: Api): () => void {
  const { gsap, ScrollTrigger, SplitText, Lenis } = libs;
  const { $, $$, cleanups, measure, onScroll } = api;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = new Lenis({ autoRaf: false, lerp: 0.11, anchors: { offset: -72 } });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  cleanups.push(() => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  });

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    // Hero: the name streamlines (condenses) and lifts as you push off the wall.
    gsap.to("[data-hero-name]", {
      "--ws": 60,
      yPercent: -14,
      ease: "none",
      scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".floor-t", {
      yPercent: 22,
      ease: "none",
      scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
    });

    // Approach: pin the three steps and swim through them.
    mm.add("(min-width: 1024px) and (min-height: 760px)", () => {
      const wrap = $("[data-steps]");
      const steps = $$("[data-step]");
      const sw = $("[data-steps-swimmer]");
      if (!wrap || steps.length < 3 || !sw) return;
      wrap.classList.add("is-pinned-steps");
      const mid = (el: HTMLElement) => el.offsetTop + el.offsetHeight / 2;
      // Inactive steps dim, but never below readable contrast.
      const dim = { opacity: 0.55 };
      const on = { opacity: 1 };
      const tl = gsap.timeline({
        defaults: { duration: 0.3, ease: "power1.inOut" },
        scrollTrigger: {
          trigger: wrap,
          start: "center center",
          end: () => `+=${window.innerHeight * 1.4}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(sw, { y: () => mid(steps[0]) }, { y: () => mid(steps[2]), ease: "none", duration: 2 }, 0)
        .fromTo(steps.slice(1), on, { ...dim, duration: 0.12 }, 0)
        .to(steps[1], on, 0.7)
        .to(steps[0], dim, 0.7)
        .to(steps[2], on, 1.45)
        .to(steps[1], dim, 1.45)
        .to({}, { duration: 0.25 });
      return () => wrap.classList.remove("is-pinned-steps");
    });

    // Work: pin the cards and scroll them sideways, like lanes seen from the deck.
    mm.add("(min-width: 1024px) and (min-height: 700px)", () => {
      const section = $("[data-reel]");
      const pinEl = $("[data-reel-pin]");
      const track = $("[data-reel-track]");
      const bar = $("[data-reel-progress]");
      if (!section || !pinEl || !track) return;
      section.classList.add("is-reel");
      // Short viewports keep the stacked layout: a pinned card must fit on screen.
      // (The header hides while scrolling down, so the card may use almost the full height.)
      if (pinEl.offsetHeight > window.innerHeight - 24) {
        section.classList.remove("is-reel");
        return;
      }
      const host = track.parentElement as HTMLElement;
      const distance = () => {
        const cs = getComputedStyle(host);
        const inner = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        return Math.max(0, track.scrollWidth - inner);
      };
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          start: () => (pinEl.offsetHeight < window.innerHeight - 110 ? "center center+=30" : "top top+=12"),
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => bar && gsap.set(bar, { scaleX: self.progress }),
        },
      });
      const onFocus = (e: FocusEvent) => {
        const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
        const st = tween.scrollTrigger;
        if (!card || !st) return;
        const rel = Math.min(1, card.offsetLeft / Math.max(1, distance()));
        lenis.scrollTo(st.start + rel * (st.end - st.start), { immediate: true });
      };
      track.addEventListener("focusin", onFocus);
      return () => {
        section.classList.remove("is-reel");
        track.removeEventListener("focusin", onFocus);
      };
    });

    // Headings: masked line reveals.
    $$("[data-split]").forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "sl",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 118,
            duration: 1.25,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
      });
    });

    // Section distance ticks draw in.
    $$(".sec-mark .rule").forEach((r) =>
      gsap.from(r, {
        scaleX: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: r, start: "top 92%", once: true },
      }),
    );

    // Generic reveals, batched so neighbours stagger together.
    const reveals = $$("[data-reveal]");
    gsap.set(reveals, { y: 26 });
    ScrollTrigger.batch(reveals, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.07, overwrite: true }),
    });

    // About: portrait opens up, route draws, belief fills in word by word.
    const portrait = $("[data-portrait]");
    if (portrait) {
      const st = { trigger: portrait, start: "top 92%", end: "top 38%", scrub: true };
      gsap.fromTo(
        portrait,
        { clipPath: "inset(12% 9% 12% 9% round 4px)" },
        { clipPath: "inset(0% 0% 0% 0% round 4px)", ease: "none", scrollTrigger: st },
      );
      gsap.fromTo("[data-portrait-img]", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { ...st } });
    }
    gsap.from("[data-route]", {
      scaleX: 0,
      duration: 1.6,
      ease: "expo.out",
      scrollTrigger: { trigger: "[data-route]", start: "top 94%", once: true },
    });
    const belief = $("[data-belief]");
    if (belief) {
      belief.classList.add("is-scrub");
      gsap.to(belief.querySelectorAll(".w"), {
        color: INK,
        stagger: 0.14,
        ease: "none",
        scrollTrigger: { trigger: belief, start: "top 82%", end: "bottom 52%", scrub: true },
      });
    }

    // Systems: status bars, code lines, build-log ticks.
    $$(".status-bar").forEach((sb) =>
      gsap.from(sb.children, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.5,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: sb, start: "top 92%", once: true },
      }),
    );
    $$("[data-code]").forEach((code) =>
      gsap.from(code.querySelectorAll(".ln"), {
        opacity: 0,
        x: -10,
        duration: 0.6,
        stagger: 0.025,
        ease: "power2.out",
        scrollTrigger: { trigger: code, start: "top 86%", once: true },
      }),
    );
    $$("[data-phases]").forEach((ph) =>
      gsap.from(ph.querySelectorAll(".tick"), {
        scale: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "back.out(2)",
        scrollTrigger: { trigger: ph, start: "top 88%", once: true },
      }),
    );

    // DSA: counters, the 100-problem strip, and marquees that answer to scroll speed.
    $$("[data-count]").forEach((el) => {
      const end = Number(el.dataset.count);
      const o = { v: 0 };
      el.textContent = "0";
      gsap.to(o, {
        v: end,
        duration: 1.9,
        ease: "expo.out",
        onUpdate: () => (el.textContent = String(Math.round(o.v))),
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });
    gsap.from("[data-ticks] i", {
      scaleY: 0,
      transformOrigin: "50% 100%",
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.012,
      scrollTrigger: { trigger: "[data-ticks]", start: "top 90%", once: true },
    });

    const anims = $$(".marquee-row")
      .map((row) => row.getAnimations()[0])
      .filter((a): a is Animation => Boolean(a));
    let target = 1;
    let rate = 1;
    const onLenis = ({ velocity }: { velocity: number }) => {
      target = Math.max(-5, Math.min(6, 1 + velocity / 7));
      if (Math.abs(target) < 0.35) target = target < 0 ? -0.35 : 0.35;
    };
    lenis.on("scroll", onLenis);
    const tickMarquee = () => {
      target += (1 - target) * 0.04;
      const next = rate + (target - rate) * 0.1;
      if (Math.abs(next - rate) > 0.005) {
        rate = next;
        anims.forEach((a) => (a.playbackRate = rate));
      }
    };
    gsap.ticker.add(tickMarquee);
    cleanups.push(() => {
      gsap.ticker.remove(tickMarquee);
      lenis.off("scroll", onLenis);
      anims.forEach((a) => (a.playbackRate = 1));
    });

    // Life: two race lanes swum to the wall, then the medals land.
    const swim = $("[data-swim]");
    if (swim) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: swim, start: "top 72%", once: true } });
      $$("[data-swimmer]").forEach((s, i) =>
        tl.from(
          s,
          { x: () => -((s.parentElement?.clientWidth ?? 200) - 12), duration: 1.7 + i * 0.3, ease: "power2.inOut" },
          i * 0.12,
        ),
      );
      tl.from("[data-medal]", { scale: 0, rotate: -50, duration: 0.8, ease: "back.out(2.2)", stagger: 0.18 }, "-=0.35");
    }

    const dot = $<SVGCircleElement>("[data-shuttle-dot]");
    if (dot) {
      const o = { t: 0 };
      const rally = gsap.to(o, {
        t: 1,
        duration: 1.25,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        paused: true,
        onUpdate: () => {
          const t = o.t;
          const u = 1 - t;
          dot.setAttribute("cx", String(u * u * 24 + 2 * u * t * 160 + t * t * 296));
          dot.setAttribute("cy", String(u * u * 96 + 2 * u * t * -40 + t * t * 96));
        },
      });
      ScrollTrigger.create({
        trigger: "[data-shuttle]",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? rally.play() : rally.pause()),
      });
    }
  });

  // Hero ripples follow a fine pointer across the water.
  const hero = $("[data-hero]");
  if (hero && window.matchMedia("(pointer: fine)").matches) {
    let lastT = 0;
    let lx = -999;
    let ly = -999;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (now - lastT < 110 || Math.hypot(x - lx, y - ly) < 46) return;
      lastT = now;
      lx = x;
      ly = y;
      const ring = document.createElement("span");
      ring.className = "ripple";
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      hero.appendChild(ring);
      const anim = ring.animate(
        [
          { transform: "scale(0.12)", opacity: 0.9 },
          { transform: "scale(1.7)", opacity: 0 },
        ],
        { duration: 1700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      anim.onfinish = () => ring.remove();
    };
    hero.addEventListener("pointermove", onMove);
    cleanups.push(() => hero.removeEventListener("pointermove", onMove));
  }

  const refresh = () => {
    ScrollTrigger.refresh();
    measure();
    onScroll();
  };
  ScrollTrigger.addEventListener("refresh", measure);
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  measure();
  document.fonts?.ready.then(refresh);
  window.addEventListener("load", refresh);
  cleanups.push(() => {
    window.removeEventListener("load", refresh);
    ScrollTrigger.removeEventListener("refresh", measure);
  });

  return () => {
    mm.revert();
    ctx.revert();
  };
}

export default function MotionDirector() {
  useEffect(() => {
    window.__cmReady = true;
    const root = document.documentElement;
    const motion = root.classList.contains("motion") && !root.classList.contains("motion-failed");
    const cleanups: Array<() => void> = [];
    const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
    const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));

    // ── in-view flags for CSS-driven details ──
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.25 },
    );
    $$("[data-inview]").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // ── mobile menu ──
    const menu = $<HTMLDetailsElement>("[data-menu]");
    if (menu) {
      const close = () => (menu.open = false);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
      document.addEventListener("keydown", onKey);
      cleanups.push(() => document.removeEventListener("keydown", onKey));
    }

    // ── header, distance readout, lane-rope swimmer, current nav item ──
    const head = $("[data-head]");
    const dist = $("[data-dist]");
    const rope = $("[data-rope]");
    const ropeSwimmer = $("[data-rope-swimmer]");
    const navLinks = $$<HTMLAnchorElement>("[data-nav]");
    const ids = Object.keys(laps) as Array<keyof typeof laps>;
    let anchors: Array<{ id: string; y: number; m: number }> = [];

    const measure = () => {
      anchors = [{ id: "top", y: 0, m: 0 }];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) anchors.push({ id, y: el.getBoundingClientRect().top + window.scrollY, m: laps[id] });
      }
    };
    const metersAt = (y: number) => {
      for (let i = anchors.length - 1; i >= 0; i--) {
        const a = anchors[i];
        if (y < a.y) continue;
        const b = anchors[i + 1];
        if (!b) return a.m;
        return a.m + ((y - a.y) / Math.max(1, b.y - a.y)) * (b.m - a.m);
      }
      return 0;
    };

    let lastY = window.scrollY;
    let queued = false;
    const update = () => {
      queued = false;
      const y = window.scrollY;
      const probe = y + window.innerHeight * 0.45;
      const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 4;
      const m = atBottom ? 200 : Math.min(200, metersAt(y));
      if (dist) dist.textContent = `${String(Math.round(m)).padStart(3, "0")} m`;
      if (rope && ropeSwimmer) {
        rope.classList.toggle("is-on", y > window.innerHeight * 0.6);
        ropeSwimmer.style.transform = `translate3d(0, ${(m / 200) * rope.clientHeight}px, 0)`;
      }
      if (head) {
        head.classList.toggle("is-solid", y > 24);
        if (y > lastY + 4 && y > window.innerHeight * 0.9 && !menu?.open) head.classList.add("is-hidden");
        else if (y < lastY - 4 || y < 120) head.classList.remove("is-hidden");
      }
      let current = "top";
      for (const a of anchors) if (probe >= a.y) current = a.id;
      for (const link of navLinks) {
        if (link.dataset.nav === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    });

    // ── race clock: time spent on the page, shown at the finish ──
    const clock = $("[data-clock]");
    if (clock) {
      let visible = false;
      const fmt = (ms: number) => {
        const cs = Math.floor(ms / 10);
        return `${pad2(Math.floor(cs / 6000))}:${pad2(Math.floor(cs / 100) % 60)}.${pad2(cs % 100)}`;
      };
      clock.textContent = fmt(performance.now());
      const cio = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      cio.observe(clock);
      const timer = window.setInterval(() => visible && (clock.textContent = fmt(performance.now())), 47);
      cleanups.push(() => {
        cio.disconnect();
        window.clearInterval(timer);
      });
    }

    if (!motion) {
      $$("[data-inview]").forEach((el) => el.classList.add("in-view"));
      return () => cleanups.forEach((fn) => fn());
    }

    let disposed = false;
    let stopMotion: (() => void) | null = null;
    loadLibs()
      .then((libs) => {
        if (!disposed) stopMotion = startMotion(libs, { $, $$, cleanups, measure, onScroll });
      })
      .catch(() => root.classList.add("motion-failed"));

    return () => {
      disposed = true;
      stopMotion?.();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
