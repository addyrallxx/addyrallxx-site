"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const alphabet = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.,+-/";

export function SplitFlap({ text, intro = false, clock = false }: { text: string; intro?: boolean; clock?: boolean }) {
  const root = useRef<HTMLSpanElement>(null);
  const previous = useRef("");
  useEffect(() => {
    const el = root.current!;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".flap-card"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let timeline: gsap.core.Timeline | undefined;
    let started = false;
    const old = previous.current;
    previous.current = text;
    const finish = () => {
      timeline?.kill();
      cards.forEach(card => {
        card.replaceChildren();
        delete card.dataset.flipping;
        delete card.dataset.glyph;
      });
      el.dataset.settled = "true";
    };
    const play = () => {
      if (started) return;
      started = true;
      if (motion.matches || (clock && (!el.getClientRects().length || getComputedStyle(el).visibility === "hidden"))) { finish(); return; }
      el.dataset.settled = "false";
      timeline = gsap.timeline({ onComplete: finish });
      cards.forEach((card, i) => {
        const delay = clock ? 0 : i * .03;
        const target = card.dataset.target!;
        if (clock && old[i] === target) return;
        const top = document.createElement("span"), bottom = document.createElement("span");
        top.className = "flap-face flap-top"; bottom.className = "flap-face flap-bottom";
        top.dataset.glyph = bottom.dataset.glyph = old[i] ?? " ";
        card.dataset.glyph = old[i] ?? " "; card.dataset.flipping = "true"; card.replaceChildren(top, bottom);
        // Keep the full 30ms wave within 1.6s, with every count still in the 2 to 8 range.
        const limit = Math.max(2, Math.min(8, Math.floor((1.58 - delay) / .07)));
        const flips = 2 + Math.floor(Math.random() * (limit - 1));
        const from = Math.max(0, alphabet.indexOf((old[i] ?? " ").toUpperCase()));
        for (let flip = 0; flip < flips; flip++) {
          const at = delay + flip * .07;
          const value = flip === flips - 1 ? target : alphabet[(from + flip + 1) % alphabet.length];
          timeline!.set(top, { rotateX: 0 }, at)
            .to(top, { rotateX: -90, duration: .035, ease: "none" }, at)
            .set([top, bottom, card], { attr: { "data-glyph": value } }, at + .035)
            .set(bottom, { rotateX: 90 }, at + .035)
            .to(bottom, { rotateX: 0, duration: .035, ease: "none" }, at + .035);
        }
        timeline!.call(() => { card.replaceChildren(); delete card.dataset.flipping; delete card.dataset.glyph; }, undefined, delay + flips * .07);
      });
      if (!timeline.duration()) finish();
    };
    const visibility = () => { if (document.hidden) timeline?.pause(); else timeline?.resume(); };
    const change = () => { if (motion.matches) { started = true; finish(); } };
    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(e => e.isIntersecting);
      el.dataset.visible = String(visible);
      if (visible && !intro && !clock) play();
    });
    observer.observe(el);
    if (clock || motion.matches || (intro && document.documentElement.dataset.intro === "done")) play();
    else if (intro) window.addEventListener("intro:done", play, { once: true });
    document.addEventListener("visibilitychange", visibility);
    visibility();
    motion.addEventListener("change", change);
    return () => { timeline?.kill(); observer.disconnect(); window.removeEventListener("intro:done", play); document.removeEventListener("visibilitychange", visibility); motion.removeEventListener("change", change); };
  }, [text, intro, clock]);
  let index = 0;
  return <span className="split-flap" ref={root} aria-label={text}>
    <span className="sr-only">{text}</span>
    <span className="flap-visual" aria-hidden="true">{text.split(/(\s+)/).map((word, w) => /^\s+$/.test(word) ? <span className="flap-space" data-space={word} key={w} /> : <span className="flap-word" key={w}>{Array.from(word).map((char, c) => <span className="flap-card" data-target={char} data-index={index++} key={c} />)}</span>)}</span>
  </span>;
}
