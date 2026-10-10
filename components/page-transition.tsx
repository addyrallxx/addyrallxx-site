"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

const Navigation = createContext<((href: string) => void) | null>(null);

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter(), pathname = usePathname(), reduced = usePrefersReducedMotion();
  const panel = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null);
  const pending = useRef<{ path: string; hash: string } | null>(null);
  const animation = useRef<Animation | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reset = useCallback(() => {
    clearTimeout(deadline.current); animation.current?.cancel(); animation.current = null; pending.current = null;
    if (panel.current) { panel.current.hidden = true; panel.current.style.transform = "translateY(100%)"; }
    if (content.current) { content.current.inert = false; content.current.removeAttribute("aria-busy"); }
    content.current?.querySelector(".route-heading-armed")?.classList.remove("route-heading-armed");
    delete document.documentElement.dataset.transition;
    window.__lenis?.start();
  }, []);
  useEffect(() => {
    const preventScroll = (event: Event) => { if (pending.current) event.preventDefault(); };
    const preventKeys = (event: KeyboardEvent) => { if (pending.current && [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) event.preventDefault(); };
    window.addEventListener("wheel", preventScroll, { passive: false }); window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeys); window.addEventListener("popstate", reset);
    return () => { reset(); window.removeEventListener("wheel", preventScroll); window.removeEventListener("touchmove", preventScroll); window.removeEventListener("keydown", preventKeys); window.removeEventListener("popstate", reset); };
  }, [reset]);
  useEffect(() => { if (reduced) reset(); }, [reduced, reset]);
  useLayoutEffect(() => {
    const target = pending.current, el = panel.current;
    if (!target || target.path !== pathname || !el) return;
    const heading = content.current?.querySelector<HTMLElement>("h1");
    heading?.classList.add("route-heading-armed");
    let cancelled = false;
    // The route is committed beneath a fully opaque panel before any scroll reset.
    void document.fonts.ready.then(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))).then(async () => {
      if (cancelled || pending.current !== target) return;
      const anchor = target.hash ? document.getElementById(decodeURIComponent(target.hash.slice(1))) : null;
      if (window.__lenis) { window.__lenis.resize(); window.__lenis.scrollTo(anchor ?? 0, { immediate: true, force: true }); }
      else if (anchor) anchor.scrollIntoView(); else window.scrollTo(0, 0);
      document.documentElement.dataset.transition = "revealing";
      window.dispatchEvent(new Event("route:ready"));
      const ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-inout").trim();
      animation.current = el.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: 700, easing: ease, fill: "forwards" });
      try { await animation.current.finished; } catch { return; }
      if (cancelled || pending.current !== target) return;
      heading?.classList.remove("route-heading-armed"); heading?.classList.add("route-heading-rise");
      reset();
      heading?.setAttribute("tabindex", "-1"); heading?.focus({ preventScroll: true });
      window.dispatchEvent(new Event("route:revealed"));
    });
    return () => { cancelled = true; };
  }, [pathname, reset]);
  const navigate = async (href: string) => {
    if (pending.current) return;
    if (reduced || !panel.current) { router.push(href); return; }
    const target = new URL(href, location.href), el = panel.current;
    pending.current = { path: target.pathname, hash: target.hash };
    window.__lenis?.stop();
    if (content.current) { content.current.inert = true; content.current.setAttribute("aria-busy", "true"); }
    document.documentElement.dataset.transition = "covering";
    el.hidden = false;
    const ease = getComputedStyle(document.documentElement).getPropertyValue("--ease-inout").trim();
    animation.current = el.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], { duration: 600, easing: ease, fill: "forwards" });
    deadline.current = setTimeout(reset, 8000);
    window.dispatchEvent(new Event("route:wipe-start"));
    try { await animation.current.finished; } catch { return; }
    if (!pending.current) return;
    el.style.transform = "translateY(0)"; animation.current.cancel(); animation.current = null;
    document.documentElement.dataset.transition = "covered";
    window.dispatchEvent(new Event("route:covered"));
    router.push(href, { scroll: false });
  };
  return <Navigation.Provider value={navigate}><div ref={content} className="route-content relative z-[1]">{children}</div>{!reduced && <div className="route-panel" ref={panel} hidden aria-hidden="true" />}</Navigation.Provider>;
}

export function TransitionLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const navigate = useContext(Navigation);
  return <Link {...props} onClick={event => {
    onClick?.(event);
    if (!navigate || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === "_blank" || event.currentTarget.hasAttribute("download")) return;
    const target = new URL(event.currentTarget.href);
    if (target.origin !== location.origin || target.pathname === location.pathname || !(target.pathname === "/" || target.pathname === "/school" || target.pathname === "/work" || target.pathname.startsWith("/work/"))) return;
    event.preventDefault(); void navigate(target.pathname + target.search + target.hash);
  }} />;
}
