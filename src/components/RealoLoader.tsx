import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import wordmarkImage from "../assets/LogoMainSection.png";

// The icon inside the "O" of REALO (same paths as public/Logo.svg and public/logo.png).
const logoPathA =
  "m82.75,100.52c-2.57-1.13-5.35-1.68-8.16-1.68h-27.4s0-21.74,0-21.74l28.54-23.88-3.89-3.63-30.47,25.51v26.79h33.09c3.09,0,6.13.84,8.77,2.45,8.26,5.05,13.3,12.82,12.99,20.5-.45,11.1-8.52,19.43-17.76,21.14-23.4,4.33-62.95-28.74-64.45-66.16-1.14-28.46,17.85-56.18,47.57-70.26C28.55,21.06,6.61,49.84,7.01,79.82c.53,39.54,43.28,73.14,70.84,68.91,11.41-1.75,23.55-10.94,23.85-24.15.21-9.33-7.24-18.92-18.96-24.05Z";
const logoPathB =
  "m84.75,7c-15.54,0-22.4,10.76-22.4,19.86,0,11.17,14.43,21.73,19.79,26.58,5.36,4.85,25.54,22.31,25.54,22.31v23.08h-11.74v3.05h19.19v-26.17l-39.57-34.33c-1.97-1.74-8.01-8.14-7.77-14.37.32-8.54,5.3-16.11,16.98-16.11,26.02,0,55.47,28.65,56.89,65.76,1.06,27.93-17.2,55-45.71,69.68,0,0,0,0,0,0,31.48-12.35,52.6-40.67,52.78-69.68.25-39.92-32.72-69.68-63.98-69.68Z";

export const LOGO_GOLD = "#c69937";

/** The REALO "O" icon, solid and crisp at any size. */
export const RealoMark: React.FC<{ className?: string; title?: string }> = ({ className = "h-12 w-12", title }) => (
  <svg
    viewBox="0 0 155.74 156.09"
    className={className}
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
  >
    <g fill={LOGO_GOLD}>
      <path d={logoPathA} />
      <path d={logoPathB} />
    </g>
  </svg>
);

const SIZES = {
  sm: { box: "h-9 w-9", mark: "h-6 w-6", ring: 2 },
  md: { box: "h-16 w-16", mark: "h-11 w-11", ring: 2.5 },
  lg: { box: "h-24 w-24", mark: "h-16 w-16", ring: 3 },
};

interface RealoLoaderProps {
  size?: keyof typeof SIZES;
  label?: string;
  /** "dark" for green/black backgrounds, "light" for cream/white ones. */
  tone?: "dark" | "light";
  className?: string;
}

/** Loading indicator: the logo icon, gently pulsing, inside a slowly turning gold ring. */
export const RealoLoader: React.FC<RealoLoaderProps> = ({
  size = "md",
  label,
  tone = "dark",
  className = "",
}) => {
  const s = SIZES[size];
  return (
    <div role="status" aria-live="polite" className={`inline-flex flex-col items-center gap-4 ${className}`}>
      <span className={`relative inline-flex items-center justify-center ${s.box}`}>
        <svg viewBox="0 0 48 48" className={`absolute inset-0 ${s.box}`} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="none" strokeWidth={s.ring / 2} stroke={tone === "dark" ? "rgba(198,153,55,0.22)" : "rgba(10,72,52,0.12)"} />
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke={LOGO_GOLD}
            strokeWidth={s.ring / 2}
            strokeLinecap="round"
            strokeDasharray="34 104"
            className="realo-ring origin-center"
          />
        </svg>
        <RealoMark className={`realo-breathe ${s.mark}`} />
      </span>
      {label ? (
        <span className={`text-sm font-medium tracking-wide ${tone === "dark" ? "text-[#f5f0e8]/80" : "text-real-estate-primary/70"}`}>
          {label}
        </span>
      ) : (
        <span className="sr-only">Duke ngarkuar…</span>
      )}
    </div>
  );
};

/** Full-screen version used while a page is loading. */
export const FullPageLoader: React.FC<{ label?: string }> = ({ label = "Duke ngarkuar…" }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#06130f]">
    <RealoLoader size="lg" label={label} />
  </div>
);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const INTRO_KEY = "realo-intro-seen";
const INTRO_MS = 3500;

/**
 * Opening animation, once per visit (any landing page), ~3.5s, tap to skip:
 * the "O" icon draws itself in gold, fills, slides into place as "REAL" is revealed
 * next to it (the full REALO logo), a shine passes over it, then the screen lifts away.
 * The icon sits exactly over the O of the logo image, so the hand-off is seamless.
 */
export const SiteIntro: React.FC = () => {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return false;
    try {
      return sessionStorage.getItem(INTRO_KEY) !== "true";
    } catch {
      return false;
    }
  });

  const finish = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, "true");
    } catch {
      /* storage unavailable */
    }
    setShow(false);
  };

  useEffect(() => {
    if (!show) return;
    const timeout = window.setTimeout(finish, INTRO_MS);
    return () => window.clearTimeout(timeout);
  }, [show]);

  if (!show) return null;

  return (
    <div
      onClick={finish}
      className="realo-intro fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center bg-[#06130f]"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(10,72,52,0.9),transparent_65%)]" />

      {/* Same proportions as the logo image (477 × 154). */}
      <div className="relative aspect-[477/154] w-[min(78vw,440px)]">
        <img src={wordmarkImage} alt="" className="realo-intro-real absolute inset-0 h-full w-full" />
        <span
          className="realo-intro-shine absolute inset-0"
          style={{
            WebkitMaskImage: `url(${wordmarkImage})`,
            maskImage: `url(${wordmarkImage})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        />
        {/* The icon, placed over the O of the logo image (x 320–456, y 8–144 of 477 × 154). */}
        <svg
          viewBox="0 0 155.74 156.09"
          className="realo-intro-icon absolute"
          style={{ left: "67.09%", top: "5.19%", width: "28.51%", height: "88.31%" }}
        >
          <g fill="none" stroke={LOGO_GOLD} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path className="realo-intro-draw" d={logoPathA} pathLength={1} />
            <path className="realo-intro-draw realo-intro-draw-2" d={logoPathB} pathLength={1} />
          </g>
          <g fill={LOGO_GOLD} className="realo-intro-fill">
            <path d={logoPathA} />
            <path d={logoPathB} />
          </g>
        </svg>
      </div>
      <span className="realo-intro-tagline relative mt-6 font-title text-xs tracking-[0.6em] text-[#c69937] sm:text-sm">
        REAL ESTATE
      </span>
    </div>
  );
};

/**
 * Between pages: a quick (~0.65s) dark cover with the logo icon spinning once, then the
 * new page appears. Not a loader; it never waits for anything.
 */
export const RouteTransition: React.FC = () => {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (prefersReducedMotion()) return;
    setRun((n) => n + 1);
  }, [pathname]);

  useEffect(() => {
    if (!run) return;
    const timeout = window.setTimeout(() => setRun(0), 650);
    return () => window.clearTimeout(timeout);
  }, [run]);

  if (!run) return null;

  return (
    <div
      key={run}
      className="realo-route pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center bg-[#06130f]"
      aria-hidden="true"
    >
      <RealoMark className="realo-route-mark h-20 w-20 sm:h-24 sm:w-24" />
    </div>
  );
};
