"use client";

// The "mounted" gate img-sphere.tsx needs before it can touch window sizes
// or generate the sphere's (randomised) layout: useSyncExternalStore's
// server/client snapshot split is what this pattern exists for, so React
// itself schedules the post-hydration re-render rather than this file doing
// it by hand with useState(false) + useEffect(() => setState(true)), which
// is what a set-state-in-effect lint warning is telling you to replace.

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
