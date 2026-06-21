import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const logoPathA =
  "m82.75,100.52c-2.57-1.13-5.35-1.68-8.16-1.68h-27.4s0-21.74,0-21.74l28.54-23.88-3.89-3.63-30.47,25.51v26.79h33.09c3.09,0,6.13.84,8.77,2.45,8.26,5.05,13.3,12.82,12.99,20.5-.45,11.1-8.52,19.43-17.76,21.14-23.4,4.33-62.95-28.74-64.45-66.16-1.14-28.46,17.85-56.18,47.57-70.26C28.55,21.06,6.61,49.84,7.01,79.82c.53,39.54,43.28,73.14,70.84,68.91,11.41-1.75,23.55-10.94,23.85-24.15.21-9.33-7.24-18.92-18.96-24.05Z";
const logoPathB =
  "m84.75,7c-15.54,0-22.4,10.76-22.4,19.86,0,11.17,14.43,21.73,19.79,26.58,5.36,4.85,25.54,22.31,25.54,22.31v23.08h-11.74v3.05h19.19v-26.17l-39.57-34.33c-1.97-1.74-8.01-8.14-7.77-14.37.32-8.54,5.3-16.11,16.98-16.11,26.02,0,55.47,28.65,56.89,65.76,1.06,27.93-17.2,55-45.71,69.68,0,0,0,0,0,0,31.48-12.35,52.6-40.67,52.78-69.68.25-39.92-32.72-69.68-63.98-69.68Z";

interface AnimatedRealoLogoProps {
  className?: string;
  sizeClassName?: string;
  cinematic?: boolean;
  glow?: boolean;
}

export const AnimatedRealoLogo: React.FC<AnimatedRealoLogoProps> = ({
  className = "",
  sizeClassName = "h-20 w-20",
  cinematic = false,
  glow = true,
}) => (
  <span
    className={`${glow ? "realo-logo-glow" : ""} relative inline-flex items-center justify-center ${sizeClassName} ${className}`}
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 155.74 156.09"
      className={`overflow-visible ${sizeClassName} ${cinematic ? "realo-logo-cinematic" : ""}`}
    >
      <g fill="none" stroke="#c9ab03" strokeLinecap="round" strokeLinejoin="round">
        <path className="realo-logo-draw" d={logoPathA} pathLength={1} />
        <path className="realo-logo-draw realo-logo-draw-delay" d={logoPathB} pathLength={1} />
      </g>
      <g fill="#c9ab03" className="realo-logo-fill">
        <path d={logoPathA} />
        <path d={logoPathB} />
      </g>
    </svg>
  </span>
);

export const GlobalRouteLoader: React.FC = () => {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname !== "/";
  });

  useEffect(() => {
    const isInitialPath = previousPath.current === null;
    previousPath.current = location.pathname;
    if (isInitialPath && location.pathname === "/") return;

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 1950);
    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="realo-route-loader fixed inset-0 z-[9998] flex cursor-wait items-center justify-center bg-[#050705]/95">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,72,52,0.78)_0%,rgba(5,7,5,0.98)_58%,#050705_100%)]" />
      <AnimatedRealoLogo sizeClassName="relative h-20 w-20" glow={false} />
    </div>
  );
};

export const HomeIntroOverlay: React.FC = () => {
  const location = useLocation();
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      location.pathname === "/" &&
      sessionStorage.getItem("realo-home-intro-complete") !== "true"
    );
  });

  useEffect(() => {
    if (!show) return;
    const timeout = window.setTimeout(() => {
      sessionStorage.setItem("realo-home-intro-complete", "true");
      setShow(false);
    }, 2850);
    return () => window.clearTimeout(timeout);
  }, [show]);

  if (!show || location.pathname !== "/") return null;

  return (
    <div className="realo-home-intro fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050705]">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,72,52,0.86)_0%,rgba(5,7,5,0.97)_52%,#050705_100%)]" />
      <div className="realo-home-intro-logo relative">
        <AnimatedRealoLogo sizeClassName="h-28 w-28 sm:h-36 sm:w-36" cinematic glow={false} />
      </div>
      <div className="realo-home-intro-flash absolute inset-0 bg-white" />
      <div className="realo-home-intro-black absolute inset-0 bg-black" />
    </div>
  );
};
