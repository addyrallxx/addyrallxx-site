"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";
import { gsap } from "gsap";
import { NAV, SCHOOL, SITE, WORK } from "@/lib/content";
import "./page-transition.css";

const Navigation = createContext<((href: string) => void) | null>(null);
const shape = (top = 0, bottom = 0) => "M0 0 Q500 " + (-top * 2) + " 1000 0 L1000 1000 Q500 " + (1000 + bottom * 2) + " 0 1000 Z";

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter(), pathname = usePathname(), reduced = usePrefersReducedMotion();
  const panel = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null), backplate = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const pending = useRef<{ path: string; hash: string } | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const headingTween = useRef<gsap.core.Tween | null>(null);
  const crossfade = useRef<gsap.core.Tween | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reset = useCallback(() => {
    clearTimeout(deadline.current); animation.current?.kill(); animation.current = null; pending.current = null;
    [panel.current, backplate.current].forEach(layer => { if (!layer) return; layer.hidden = true; gsap.set(layer, { yPercent: 118, clearProps: "willChange" }); });
    if (content.current) { content.current.inert = false; content.current.removeAttribute("aria-busy"); }
    delete document.documentElement.dataset.transition;
    window.__lenis?.start();
  }, []);
  const fade = useCallback(() => {
    crossfade.current?.kill();
    if (content.current) crossfade.current = gsap.fromTo(content.current, { opacity: .01 }, { opacity: 1, duration: .2, ease: "none", clearProps: "opacity" });
  }, []);
  useEffect(() => {
    const preventScroll = (event: Event) => { if (pending.current) event.preventDefault(); };
    const preventKeys = (event: KeyboardEvent) => { if (pending.current && [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) event.preventDefault(); };
    const pop = () => { reset(); headingTween.current?.kill(); fade(); };
    window.addEventListener("wheel", preventScroll, { passive: false }); window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeys); window.addEventListener("popstate", pop);
    return () => { reset(); headingTween.current?.kill(); crossfade.current?.kill(); window.removeEventListener("wheel", preventScroll); window.removeEventListener("touchmove", preventScroll); window.removeEventListener("keydown", preventKeys); window.removeEventListener("popstate", pop); };
  }, [reset, fade]);
  useEffect(() => { if (reduced) reset(); }, [reduced, reset]);
  useLayoutEffect(() => {
    const target = pending.current, timeline = animation.current;
    if (!target || target.path !== pathname || !timeline) return;
    const anchor = target.hash ? document.getElementById(decodeURIComponent(target.hash.slice(1))) : null;
    if (window.__lenis) { window.__lenis.resize(); window.__lenis.scrollTo(anchor ?? 0, { immediate: true, force: true }); }
    else if (anchor) anchor.scrollIntoView(); else window.scrollTo(0, 0);
    const heading = content.current?.querySelector<HTMLElement>("h1");
    heading?.classList.add("route-heading-rise");
    const lines = heading?.querySelectorAll<HTMLElement>(".section-line > span, .hero-line > span");
    const targets = lines?.length ? lines : heading;
    if (targets) gsap.set(targets, { yPercent: 100 });
    const start = Math.max(.7, timeline.time());
    document.documentElement.dataset.transition = "revealing";
    window.dispatchEvent(new Event("route:ready"));
    [panel.current, backplate.current].forEach((layer, index) => {
      const edge = { bend: 0 };
      timeline.to(layer, { yPercent: -118, duration: .39, ease: "expo.inOut" }, start + index * .06)
        .to(edge, { bend: 180, duration: .195, ease: "sine.inOut", onUpdate: () => layer?.querySelector("path")?.setAttribute("d", shape(0, edge.bend)) }, start + index * .06);
    });
    timeline.call(() => {
      if (targets) headingTween.current = gsap.to(targets, { yPercent: 0, duration: .6, ease: "expo.out", onComplete: () => { gsap.set(targets, { clearProps: "transform" }); } });
    }, [], start + .12);
    timeline.call(() => {
      reset(); heading?.setAttribute("tabindex", "-1"); heading?.focus({ preventScroll: true });
      window.dispatchEvent(new Event("route:revealed"));
    }, [], start + .45);
  }, [pathname, reset]);
  const navigate = (href: string) => {
    if (pending.current) return;
    if (reduced || !panel.current || !backplate.current) { router.push(href); fade(); return; }
    const target = new URL(href, location.href);
    setName(WORK.find(project => target.pathname === "/work/" + project.slug)?.name ?? (target.pathname === "/school" ? SCHOOL.label : NAV.find(link => link.href === target.pathname + target.hash || (target.pathname === "/work" && link === NAV[0]))?.label ?? SITE.name));
    pending.current = { path: target.pathname, hash: target.hash };
    headingTween.current?.kill(); window.__lenis?.stop();
    if (content.current) { content.current.inert = true; content.current.setAttribute("aria-busy", "true"); }
    document.documentElement.dataset.transition = "covering";
    const timeline = gsap.timeline(); animation.current = timeline;
    [backplate.current, panel.current].forEach((layer, index) => {
      layer.hidden = false;
      gsap.set(layer, { yPercent: 118, willChange: "transform" });
      const edge = { bend: 180 }, path = layer.querySelector("path")!;
      path.setAttribute("d", shape(180));
      timeline.to(layer, { yPercent: 0, duration: .52, ease: "power3.inOut" }, index * .08)
        .to(edge, { bend: 0, duration: .52, ease: "power3.inOut", onUpdate: () => path.setAttribute("d", shape(edge.bend)) }, index * .08);
    });
    timeline.call(() => {
      gsap.fromTo(panel.current!.querySelectorAll(".route-letter > span"), { yPercent: 110 }, { yPercent: 0, stagger: .018, duration: .42, ease: "expo.out" });
    }, [], .3)
      .fromTo(panel.current.querySelector(".route-name"), { "--route-width": 100 }, { "--route-width": 118, duration: .3, ease: "none" }, .64)
      .call(() => { document.documentElement.dataset.transition = "covered"; window.dispatchEvent(new Event("route:covered")); router.push(href, { scroll: false }); }, [], .7);
    deadline.current = setTimeout(reset, 8000);
    window.dispatchEvent(new Event("route:wipe-start"));
  };
  return <Navigation.Provider value={navigate}><div ref={content} className="route-content relative z-[1]">{children}</div>{!reduced && <>
    <div className="route-backplate" ref={backplate} hidden aria-hidden="true"><svg className="route-shape" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d={shape()} /></svg></div>
    <div className="route-panel" ref={panel} hidden aria-hidden="true"><svg className="route-shape route-curve-top" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d={shape()} /></svg>
      <div className="route-title"><div className="route-name"><span aria-label={name}>{Array.from(name).map((letter, i) => <span className="route-letter" key={i} aria-hidden="true"><span>{letter === " " ? "\u00a0" : letter}</span></span>)}</span></div></div>
    </div>
  </>}</Navigation.Provider>;
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
