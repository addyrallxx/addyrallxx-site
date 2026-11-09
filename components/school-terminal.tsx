"use client";

import { useEffect, useRef, type CSSProperties } from "react";

function observeUncovered(observer: IntersectionObserver, el: HTMLElement) {
  // Viewport intersection can occur behind the intro or route wipe.
  const arm = () => {
    if (document.documentElement.dataset.intro === "done" && !document.documentElement.dataset.transition) {
      observer.observe(el);
      gate.disconnect();
    }
  };
  const gate = new MutationObserver(arm);
  gate.observe(document.documentElement, { attributes: true, attributeFilter: ["data-intro", "data-transition"] });
  arm();
  return () => gate.disconnect();
}

export function CourseTree({ label, groups }: { label: string; groups: { label: string; items: string[] }[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pause = () => { el.classList.toggle("terminal-paused", document.hidden); };
    pause();
    document.addEventListener("visibilitychange", pause);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { el.classList.add("tree-visible"); observer.disconnect(); }
    }, { threshold: .3 });
    let stopWatching = () => {};
    if (!motion.matches) { el.classList.add("tree-armed"); stopWatching = observeUncovered(observer, el); }
    const changed = () => { if (motion.matches) { stopWatching(); el.classList.remove("tree-armed"); observer.disconnect(); } };
    motion.addEventListener("change", changed);
    return () => { stopWatching(); observer.disconnect(); el.classList.remove("tree-armed"); document.removeEventListener("visibilitychange", pause); motion.removeEventListener("change", changed); };
  }, []);
  let index = 0;
  const style = () => ({ "--tree-index": index++ } as CSSProperties);
  return <div className="course-tree" ref={root}>
    <div className="tree-line tree-root" style={style()}>{label.toLowerCase()}/</div>
    <ul>{groups.map((group, g) => <li className={g === groups.length - 1 ? "tree-last" : ""} key={group.label}>
      <div className="tree-line tree-folder" style={style()}>{group.label.toLowerCase().replaceAll(" ", "-")}/</div>
      <ul>{group.items.map((item, i) => {
        const code = item.match(/^[A-Z]+ \d+ /)?.[0] ?? "";
        return <li className={`tree-line tree-course${i === group.items.length - 1 ? " tree-last" : ""}`} key={item} style={style()}><span className="course-code">{code.trim()}</span>{"  "}<span className="course-name">{item.slice(code.length)}</span>{g === groups.length - 1 && i === group.items.length - 1 && <span className="tree-cursor" aria-hidden="true">█</span>}</li>;
      })}</ul>
    </li>)}</ul>
  </div>;
}
