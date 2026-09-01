"use client";

import { useEffect, useState } from "react";

const CALGARY_TIME = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Edmonton",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function CalgaryTime() {
  const [time, setTime] = useState("HH:MM");

  useEffect(() => {
    const updateTime = () => setTime(CALGARY_TIME.format(new Date()));
    updateTime();
    const interval = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <p className="text-[length:var(--step-0)] text-paper-1">
      It is currently{" "}
      <span className="font-mono tabular-nums text-paper-0">{time}</span> in
      Calgary.
    </p>
  );
}
