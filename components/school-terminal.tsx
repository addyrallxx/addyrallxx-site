"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// Five rows, five columns, authored here rather than fetched from a font service.
const glyphs: Record<string, string[]> = Object.fromEntries(Object.entries({
  A: ["01110", "10001", "11111", "10001", "10001"], B: ["11110", "10001", "11110", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "01111"], D: ["11110", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "11110", "10000", "11111"], F: ["11111", "10000", "11110", "10000", "10000"],
  G: ["01111", "10000", "10111", "10001", "01111"], H: ["10001", "10001", "11111", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "11111"], J: ["00111", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "11100", "10010", "10001"], L: ["10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10001", "10001"], N: ["10001", "11001", "10101", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "01110"], P: ["11110", "10001", "11110", "10000", "10000"],
  Q: ["01110", "10001", "10101", "10010", "01101"], R: ["11110", "10001", "11110", "10010", "10001"],
  S: ["01111", "10000", "01110", "00001", "11110"], T: ["11111", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "01110"], V: ["10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10101", "11011", "10001"], X: ["10001", "01010", "00100", "01010", "10001"],
  Y: ["10001", "01010", "00100", "00100", "00100"], Z: ["11111", "00010", "00100", "01000", "11111"],
  " ": ["000", "000", "000", "000", "000"],
}).map(([letter, rows]) => [letter, rows.map(row => row.replaceAll("1", "█").replaceAll("0", " "))]));

export function SchoolBanner({ lines }: { lines: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const rows = lines.flatMap(line => Array.from({ length: 5 }, (_, row) => [...line.toUpperCase()].map(letter => glyphs[letter]?.[row] ?? glyphs[" "][row]).join(" ")));
  const final = rows.join("\n");
  useEffect(() => {
    const el = root.current!;
    const nodes = [...el.querySelectorAll<HTMLElement>(".ascii-row")];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const finish = () => { cancelAnimationFrame(frame); nodes.forEach((node, i) => { node.textContent = rows[i]; }); el.dataset.settled = "true"; };
    const fit = () => {
      el.style.removeProperty("--ascii-size");
      const size = parseFloat(getComputedStyle(nodes[0]).fontSize);
      const width = Math.max(...nodes.map(node => node.scrollWidth));
      if (width > el.clientWidth) el.style.setProperty("--ascii-size", `${size * el.clientWidth / width}px`);
    };
    const resize = new ResizeObserver(fit);
    resize.observe(el);
    document.fonts.ready.then(fit);
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (motion.matches) { finish(); return; }
      el.dataset.settled = "false";
      const starts = performance.now();
      const longest = Math.max(...rows.map(row => row.length));
      const deadlines = rows.map(row => [...row].map((_, column) => 300 + Math.random() * 300 + 300 * column / longest));
      const noise = "░▒▓█/\\|-_=+*#";
      const tick = (now: number) => {
        const elapsed = now - starts;
        nodes.forEach((node, row) => { node.textContent = [...rows[row]].map((cell, column) => cell === " " || elapsed >= deadlines[row][column] ? cell : noise[Math.floor(Math.random() * noise.length)]).join(""); });
        if (elapsed < 900 && !motion.matches) frame = requestAnimationFrame(tick); else finish();
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .3 });
    observer.observe(el);
    const changed = () => { if (motion.matches) { observer.disconnect(); finish(); } };
    motion.addEventListener("change", changed);
    return () => { finish(); resize.disconnect(); observer.disconnect(); motion.removeEventListener("change", changed); };
  }, [final]); // The joined string is the complete banner identity.
  return <div ref={root} className="school-ascii" aria-hidden="true" data-final={final} data-settled="true">{rows.map((row, i) => <pre className="ascii-row" key={i}>{row}</pre>)}</div>;
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
    if (!motion.matches) { el.classList.add("tree-armed"); observer.observe(el); }
    const changed = () => { if (motion.matches) { el.classList.remove("tree-armed"); observer.disconnect(); } };
    motion.addEventListener("change", changed);
    return () => { observer.disconnect(); el.classList.remove("tree-armed"); document.removeEventListener("visibilitychange", pause); motion.removeEventListener("change", changed); };
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
