"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CHROME, NAV, SITE } from "@/lib/content";
import "@/lib/scroll";
import { Clocks } from "./clocks";
import { SkyToggle } from "./sky-toggle";
import { RevBar } from "./rev-bar";

export function Chrome() {
  const sheet = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const previousOverflow = useRef("");
  const close = () => sheet.current?.close();
  useEffect(() => {
    const dialog = sheet.current;
    const onScroll = () => {
      if (bottom.current) bottom.current.dataset.pastHero = String(window.scrollY >= (document.querySelector(".hero")?.clientHeight ?? window.innerHeight));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const resize = () => { onScroll(); if (window.innerWidth >= 720) close(); };
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", onScroll);
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
        <div className="chrome-name"><Link href="/">{SITE.name}</Link><RevBar /></div>
        <nav className="chrome-nav" aria-label={CHROME.menu}>
          {NAV.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
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
    <dialog id="phone-menu" className="menu-sheet" ref={sheet} aria-label={CHROME.menu} onClose={restore} onCancel={close} data-lenis-prevent>
      <div className="flex justify-end"><button type="button" onClick={close} autoFocus className="t-small">{CHROME.close}</button></div>
      <nav>{NAV.map((link) => <a href={link.href} key={link.href} onClick={close} className="t-display-l">{link.label}</a>)}</nav>
    </dialog>
  </>;
}
