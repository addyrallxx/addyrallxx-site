"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { NAV, SCHOOL, SITE, WORK } from "@/lib/content";
import "./page-transition.css";

const Navigation = createContext<((href: string) => void) | null>(null);

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter(), pathname = usePathname(), reduced = usePrefersReducedMotion();
  const panel = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const coveredAt = useRef(0);
  const pending = useRef<{ path: string; hash: string } | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reset = useCallback(() => {
    clearTimeout(deadline.current); animation.current?.kill(); animation.current = null; pending.current = null;
    if (panel.current) { panel.current.hidden = true; gsap.set(panel.current, { y: 0, yPercent: 118 }); }
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
      await new Promise(resolve => setTimeout(resolve, Math.max(0, 180 - (performance.now() - coveredAt.current))));
      if (cancelled || pending.current !== target) return;
      document.documentElement.dataset.transition = "revealing";
      window.dispatchEvent(new Event("route:ready"));
      const curve = { bulge: 0 };
      const edge = el.querySelector(".route-curve-bottom path")!;
      animation.current = gsap.timeline().to(el, { y: 0, yPercent: -118, duration: .75, ease: "route-wipe" }, 0)
        .to(el.querySelector(".route-name > span"), { yPercent: -110, opacity: 0, duration: .2, ease: "power3.in" }, 0)
        .to(curve, { bulge: 180, duration: .375, ease: "sine.inOut", onUpdate: () => edge.setAttribute("d", `M0 0 Q500 ${curve.bulge * 2} 1000 0 L1000 -1 L0 -1 Z`) }, 0)
        .to(curve, { bulge: 0, duration: .375, ease: "sine.inOut", onUpdate: () => edge.setAttribute("d", `M0 0 Q500 ${curve.bulge * 2} 1000 0 L1000 -1 L0 -1 Z`) }, .375);
      await animation.current.then();
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
    gsap.registerPlugin(CustomEase);
    CustomEase.create("route-wipe", ".76,0,.24,1");
    setName(WORK.find(project => target.pathname === `/work/${project.slug}`)?.name ?? (target.pathname === "/school" ? SCHOOL.label : NAV.find(link => link.href === target.pathname + target.hash || (target.pathname === "/work" && link.label === NAV[0].label))?.label ?? SITE.name));
    pending.current = { path: target.pathname, hash: target.hash };
    window.__lenis?.stop();
    if (content.current) { content.current.inert = true; content.current.setAttribute("aria-busy", "true"); }
    document.documentElement.dataset.transition = "covering";
    el.hidden = false;
    const curve = { bulge: 180 };
    const edge = el.querySelector(".route-curve-top path")!;
    gsap.set(el.querySelector(".route-curve-bottom path"), { attr: { d: "M0 0 Q500 0 1000 0 L1000 -1 L0 -1 Z" } });
    animation.current = gsap.timeline().fromTo(el, { y: 0, yPercent: 118 }, { y: 0, yPercent: 0, duration: .65, ease: "route-wipe" }, 0)
      .fromTo(el.querySelector(".route-name > span"), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .3, ease: "power3.out" }, .1)
      .to(curve, { bulge: 0, duration: .65, ease: "route-wipe", onUpdate: () => edge.setAttribute("d", `M0 180 Q500 ${180 - curve.bulge * 2} 1000 180 L1000 181 L0 181 Z`) }, 0);
    deadline.current = setTimeout(reset, 8000);
    window.dispatchEvent(new Event("route:wipe-start"));
    await animation.current.then();
    if (!pending.current) return;
    gsap.set(el, { y: 0, yPercent: 0 }); animation.current = null;
    coveredAt.current = performance.now();
    document.documentElement.dataset.transition = "covered";
    window.dispatchEvent(new Event("route:covered"));
    router.push(href, { scroll: false });
  };
  return <Navigation.Provider value={navigate}><div ref={content} className="route-content relative z-[1]">{children}</div>{!reduced && <div className="route-panel" ref={panel} hidden aria-hidden="true">
    <svg className="route-curve route-curve-top" viewBox="0 0 1000 180" preserveAspectRatio="none"><path d="M0 180 Q500 -180 1000 180 L1000 181 L0 181 Z" /></svg>
    <div className="route-name t-display-l"><span>{name}</span></div>
    <svg className="route-curve route-curve-bottom" viewBox="0 0 1000 180" preserveAspectRatio="none"><path d="M0 0 Q500 0 1000 0 L1000 -1 L0 -1 Z" /></svg>
  </div>}</Navigation.Provider>;
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
