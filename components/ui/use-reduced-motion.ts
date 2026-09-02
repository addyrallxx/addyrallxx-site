"use client";

// Shared by preloader.tsx and img-sphere.tsx. useSyncExternalStore rather
// than a matchMedia check inside a useEffect: React's own docs use this
// exact query as the textbook case for the hook, it needs no setState call
// of its own (a plain useEffect version trips
// react-hooks/set-state-in-effect), and it reacts live if the OS setting
// changes mid-session instead of only at the next full page load.

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
