"use client";

import { useEffect, useId, useState } from "react";
import { CHROME } from "@/lib/content";

export function SkyToggle() {
  const [mode, setMode] = useState<"day" | "night">("day");
  const id = useId();
  useEffect(() => {
    const sync = () => setMode(document.documentElement.dataset.mode === "night" ? "night" : "day");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    return () => observer.disconnect();
  }, []);
  const toggle = () => {
    const next = mode === "day" ? "night" : "day";
    try { localStorage.setItem("sky", next); } catch { /* The choice still works without storage. */ }
    // Sky owns the midpoint token swap. Without a live canvas this swaps immediately.
    if (document.documentElement.dataset.sky !== "webgl") document.documentElement.dataset.mode = next;
    setMode(next);
    window.dispatchEvent(new CustomEvent("sky:mode", { detail: { mode: next } }));
  };
  return <button className="sky-toggle" type="button" onClick={toggle}
    aria-label={mode === "day" ? CHROME.toggleToNight : CHROME.toggleToDay} aria-pressed={mode === "night"}>
    <span className="sky-toggle-icon">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <defs><mask id={id}><rect width="24" height="24" fill="white" /><circle className="sky-mask" cx="12" cy="12" r="8" fill="black" /></mask></defs>
        <circle cx="12" cy="12" r="8" fill="currentColor" mask={`url(#${id})`} />
      </svg>
    </span>
  </button>;
}
