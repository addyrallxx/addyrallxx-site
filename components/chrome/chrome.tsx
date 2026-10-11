"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink as Link } from "@/components/page-transition";
import { CHROME, NAV, SITE } from "@/lib/content";
import "@/lib/scroll";
import { Clocks } from "./clocks";
import { SkyToggle } from "./sky-toggle";
import "./current-route.css";

export function Chrome() {
  const pathname = usePathname();
  const [section, setSection] = useState("");
  const sheet = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const previousOverflow = useRef("");
  const close = () => sheet.current?.close();
  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]"));
    if (!controls.length) return;
    const index = controls.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  };
  useEffect(() => {
    if (pathname !== "/") return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRect.height); else visible.delete(entry.target.id); });
      setSection([...visible].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "");
    }, { rootMargin: "-20% 0px -40% 0px", threshold: 0 });
    NAV.forEach(link => { const id = link.href.split("#")[1]; const target = id && document.getElementById(id); if (target) observer.observe(target); });
    return () => observer.disconnect();
  }, [pathname]);
  const current = (href: string) => {
    if (href === "/#work" && (pathname === "/work" || pathname.startsWith("/work/"))) return "page" as const;
    if (href === pathname || (pathname === "/" && href === `/#${section}`)) return "page" as const;
    return undefined;
  };
  useEffect(() => {
    const dialog = sheet.current;
    const hero = document.querySelector(".hero");
    let heroHeight = hero?.clientHeight ?? window.innerHeight;
    let pastHero: boolean | undefined;
    let previousScroll = 0;
    const onScroll = () => {
      const lenis = window.__lenis;
      const position = lenis?.animatedScroll ?? window.scrollY;
      const past = position >= heroHeight;
      if (Math.abs(position - previousScroll) > 1) {
        if (bottom.current && innerWidth < 720) bottom.current.dataset.scrollUp = String(position < previousScroll);
        previousScroll = position;
      }
      // Cached Lenis position avoids flushing styles after animated DOM writes.
      if (bottom.current && past !== pastHero) { bottom.current.dataset.pastHero = String(past); pastHero = past; }
    };
    const observer = new ResizeObserver(entries => { heroHeight = entries[0].target.clientHeight; onScroll(); });
    if (hero) observer.observe(hero);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const resize = () => { onScroll(); if (window.innerWidth >= 720) close(); };
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (dialog?.open) {
        document.body.style.overflow = previousOverflow.current;
        window.__lenis?.start();
      }
    };
  }, []);
  const open = () => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    sheet.current?.showModal();
  };
  const restore = () => {
    document.body.style.overflow = previousOverflow.current;
    window.__lenis?.start();
    menu.current?.focus();
  };
  return <>
    <div className="chrome t-small">
      <header className="chrome-top">
        <div className="chrome-name"><Link href="/">{SITE.name}</Link></div>
        <nav className="chrome-nav" aria-label={CHROME.menu}>
          {NAV.map((link) => <Link href={link.href} key={link.href} aria-current={current(link.href)}>{link.label}</Link>)}
          <button ref={menu} className="menu-button" type="button" onClick={open} aria-haspopup="dialog" aria-controls="phone-menu">{CHROME.menu}</button>
          <SkyToggle />
        </nav>
      </header>
      <div className="chrome-bottom" ref={bottom}>
        <Clocks />
        <p className="availability"><span className="live-dot" data-day="true" aria-hidden="true" />{CHROME.availability}</p>
      </div>
    </div>
    {/* Native modal dialog supplies the focus trap, inert background and Escape handling. */}
    <dialog id="phone-menu" className="menu-sheet" ref={sheet} aria-label={CHROME.menu} onClose={restore} onCancel={close} onKeyDown={trapFocus} data-lenis-prevent>
      <div className="flex justify-end"><button type="button" onClick={close} autoFocus className="t-small">{CHROME.close}</button></div>
      <nav>{NAV.map((link) => <Link href={link.href} key={link.href} onClick={close} className="t-display-l" aria-current={current(link.href)}>{link.label}</Link>)}</nav>
    </dialog>
  </>;
}
