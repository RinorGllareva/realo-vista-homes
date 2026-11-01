import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const storageKey = (key: string) => `realo:scroll:${key}`;

const saveY = (key: string, y: number) => {
  try {
    sessionStorage.setItem(storageKey(key), String(Math.round(y)));
  } catch {
    /* storage unavailable */
  }
};

// Puts the visitor back exactly where they were when they press Back (e.g. on the card
// they opened), scrolls new pages to the top, and jumps to #anchors such as /#map.
const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  // The first page of a visit always has the key "default"; add the URL so different
  // landing pages never share a saved position.
  const entryKey =
    location.key === "default" ? `default:${location.pathname}${location.search}` : location.key;

  // Which history entry scroll events belong to. Updated during commit, before the new
  // page scrolls, so the jump to the top is never recorded against the page we left.
  const currentKey = useRef(entryKey);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      const key = currentKey.current;
      const y = window.scrollY;
      frame = requestAnimationFrame(() => {
        if (key === currentKey.current) saveY(key, y);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    currentKey.current = entryKey;

    // Filter changes replace the URL; stay where the visitor is and remember it.
    if (navigationType === "REPLACE") {
      saveY(entryKey, window.scrollY);
      return;
    }

    let saved: number | null = null;
    try {
      const raw = sessionStorage.getItem(storageKey(entryKey));
      saved = raw === null ? null : Number(raw);
    } catch {
      saved = null;
    }

    const hashId = decodeURIComponent(location.hash.replace(/^#/, ""));
    const shouldRestore = navigationType === "POP" && saved !== null && saved > 0;

    if (!shouldRestore && !hashId) {
      window.scrollTo(0, 0);
      return;
    }

    // Content (cards, images, map) may still be rendering; keep trying until the page is
    // tall enough or the element exists, and give up as soon as the visitor scrolls.
    // Input that belongs to the Back action itself (Alt+←, a trackpad swipe) arrives right
    // after the navigation, so only input after a short grace period counts as scrolling.
    let cancelled = false;
    const started = performance.now();
    const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    const stop = (event: Event) => {
      if (performance.now() - started < 600) return;
      if (event instanceof KeyboardEvent && !SCROLL_KEYS.includes(event.key)) return;
      cancelled = true;
    };
    let timer = 0;

    const attempt = () => {
      if (cancelled) return;
      if (shouldRestore && saved !== null) {
        const maxY = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, Math.min(saved, Math.max(maxY, 0)));
        if (maxY >= saved) return;
      } else {
        const el = document.getElementById(hashId);
        if (el) {
          el.scrollIntoView({ block: "start" });
          return;
        }
      }
      if (performance.now() - started < 5000) timer = window.setTimeout(attempt, 50);
    };

    attempt();
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [entryKey, location.hash, navigationType]);

  return null;
};

export default ScrollManager;
