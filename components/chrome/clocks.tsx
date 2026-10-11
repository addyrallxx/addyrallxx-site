"use client";

import { useId, useSyncExternalStore } from "react";
import { CHROME } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";

const formatters = CHROME.clocks.map(({ zone }) => ({
  time: new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true }),
  hour: new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "numeric", hourCycle: "h23" }),
}));
const listeners = new Set<() => void>();
let timestamp = 0, blink = false, timer: ReturnType<typeof setTimeout> | undefined;
const snapshot = () => timestamp;
const serverSnapshot = () => 0;
function update() {
  clearTimeout(timer);
  timestamp = Date.now();
  // Restart the CSS blink at each sync, including after a hidden tab resumes.
  blink = !blink;
  // Keep minute sync style invalidation inside the clocks, away from the page.
  document.querySelectorAll<HTMLElement>(".clocks").forEach(clock => {
    clock.style.setProperty("--clock-blink", blink ? "clock-colon-a" : "clock-colon-b");
    clock.style.setProperty("--clock-phase", `${-(timestamp % 1000)}ms`);
  });
  listeners.forEach(listener => listener());
  timer = setTimeout(update, 60000 - Date.now() % 60000);
}
function visibility() {
  document.documentElement.classList.toggle("clock-paused", document.hidden);
  if (!document.hidden) update();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) { update(); visibility(); document.addEventListener("visibilitychange", visibility); }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); }
  };
}

function ClockFigure({ day }: { day: boolean }) {
  const mask = useId();
  return <svg className="clock-figure" data-day={day} viewBox="0 0 16 16" aria-hidden="true">
    <defs><mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16"><circle cx="7" cy="9" r="6" fill="white" /><circle cx="10" cy="6" r="5.5" fill="black" /></mask></defs>
    <g className="clock-sun" fill="var(--accent)" stroke="var(--accent)"><circle cx="8" cy="8" r="5" stroke="none" /><g className="clock-rays" strokeWidth="1.5" strokeLinecap="round">{Array.from({ length: 8 }, (_, i) => <line key={i} x1="8" y1=".75" x2="8" y2="1.75" transform={`rotate(${i * 45} 8 8)`} />)}</g></g>
    <g className="clock-moon" fill="var(--ink)"><circle cx="7" cy="9" r="6" mask={`url(#${mask})`} /><path className="clock-star" d="M13 1L13.6 2.4L15 3L13.6 3.6L13 5L12.4 3.6L11 3L12.4 2.4Z" /></g>
  </svg>;
}

export function Clocks({ label = false }: { label?: boolean }) {
  const now = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const times = now ? formatters.map(formatter => {
    const parts = formatter.time.formatToParts(new Date(now));
    const hour = Number(formatter.hour.format(new Date(now)));
    return { hour: parts.find(part => part.type === "hour")?.value ?? "", minute: parts.find(part => part.type === "minute")?.value ?? "", period: parts.find(part => part.type === "dayPeriod")?.value ?? "", colon: parts.find(part => part.type === "literal")?.value ?? "", day: hour >= 6 && hour < 18 };
  }) : [];
  return <div className={`clocks ${label ? "t-label" : "t-small"}`}>
    {CHROME.clocks.map(({ city, zone }, i) => <span className="clock" role="timer" key={city} data-zone={zone} aria-label={times[i] ? `${city}, ${times[i].hour}:${times[i].minute} ${times[i].period}` : city}>
      <ClockFigure day={times[i]?.day ?? false} /><span className="clock-city">{city}</span>
      <span className="clock-time"><span className="clock-digits"><span><SplitFlap text={times[i]?.hour ?? ""} clock /></span><span className="clock-colon" aria-hidden="true">{times[i]?.colon}</span><span><SplitFlap text={times[i]?.minute ?? ""} clock /></span></span><span className="clock-period">{times[i]?.period}</span></span>
    </span>)}
  </div>;
}
