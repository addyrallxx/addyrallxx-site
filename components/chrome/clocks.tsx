"use client";

import { useEffect, useState } from "react";
import { CHROME } from "@/lib/content";

const formatters = CHROME.clocks.map(({ zone }) => new Intl.DateTimeFormat("en-GB", {
  timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}));

export function Clocks({ label = false }: { label?: boolean }) {
  const [times, setTimes] = useState<string[]>([]);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimes(formatters.map((formatter) => formatter.format(now)));
    };
    update();
    const timer = window.setInterval(update, 15000);
    return () => clearInterval(timer);
  }, []);
  return <div className={`clocks ${label ? "t-label" : "t-small"}`}>
    {CHROME.clocks.map(({ city }, i) => {
      const hour = Number(times[i]?.slice(0, 2));
      return <span className="clock" key={city}>
        <span className="live-dot" data-day={hour >= 7 && hour < 19} aria-hidden="true" />
        {city} <span>{times[i] ?? "\u00a0\u00a0:\u00a0\u00a0"}</span>
      </span>;
    })}
  </div>;
}
