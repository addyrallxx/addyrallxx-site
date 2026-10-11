"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { SplitFlap } from "@/components/ui/split-flap";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink as Link } from "@/components/page-transition";
import { WORK, WORK_LABEL, WORK_CTA } from "@/lib/content";
import { attachMagnetic } from "@/lib/magnetic";

export function Work({ showLabel = true }: { showLabel?: boolean }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const media = gsap.matchMedia();
    const cleanups = Array.from(el.querySelectorAll<HTMLElement>(".work-pill")).map(el => attachMagnetic(el));
    media.add("(max-width: 719px) and (prefers-reduced-motion: no-preference)", () => {
      el.querySelectorAll(".work-card").forEach(card => {
        gsap.fromTo(card.querySelector(".work-card-content"), { y: 20, opacity: .9 }, { y: 0, opacity: 1, duration: .6, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%", once: true } });
      });
    });
    media.add("(min-width: 720px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>(".work-card"));
      const context = gsap.context(() => {
        gsap.fromTo(el.querySelector(".section-hairline"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 65%", scrub: true } });
        cards.forEach((card, i) => {
          const frame = card.querySelector<HTMLElement>(".work-media-frame")!;
          gsap.set(frame, { willChange: "transform, clip-path" });
          if (cards[i + 1]) {
            gsap.set(card, { willChange: "transform" });
            gsap.set(card.querySelector(".work-card-content"), { willChange: "opacity" });
          }
          gsap.fromTo(frame, { clipPath: "inset(16% 22% round 999px)" }, { clipPath: "inset(0% 0% round 20px)", ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "top 35%", scrub: true } });
          gsap.fromTo(card.querySelector(".work-media-inner"), { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
          gsap.fromTo(card.querySelectorAll(".work-word"), { yPercent: 110 }, { yPercent: 0, duration: .8, stagger: .055, ease: "power4.out", scrollTrigger: { trigger: card, start: "top 82%", once: true } });
          if (cards[i + 1] && innerWidth >= 720) {
            const timeline = gsap.timeline({ scrollTrigger: { trigger: cards[i + 1], start: "top 85%", end: `top ${9 + (i + 1) * 16 / innerHeight * 100}%`, scrub: true } });
            timeline.to(card, { scale: .93, ease: "none" }, 0).to(card.querySelector(".work-card-content"), { opacity: .9, ease: "none" }, 0);
          }
        });
      }, el);
      const followers = cards.map(card => {
        const surface = card.querySelector<HTMLElement>(".work-media")!;
        const frame = card.querySelector<HTMLElement>(".work-media-frame")!;
        const follower = card.querySelector<HTMLElement>(".work-follower")!;
        const setPosition = gsap.quickSetter(follower, "css");
        const setSkew = gsap.quickSetter(frame, "skewY", "deg");
        let x = 0, y = 0, tx = 0, ty = 0, skew = 0, active = false;
        let previous = "", previousSkew = 0;
        const move = (event: PointerEvent) => {
          const bounds = surface.getBoundingClientRect();
          tx = event.clientX - bounds.left; ty = event.clientY - bounds.top;
        };
        const enter = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" || !matchMedia("(pointer: fine)").matches) return;
          move(event); x = tx; y = ty; active = true;
          gsap.to(follower, { scale: 1, duration: .2, overwrite: true });
        };
        const leave = () => { active = false; gsap.to(follower, { scale: 0, duration: .2, overwrite: true }); };
        gsap.set(follower, { scale: 0 });
        surface.addEventListener("pointermove", move); surface.addEventListener("pointerenter", enter); surface.addEventListener("pointerleave", leave);
        return { tick: () => {
          if (active) {
            x += (tx - x) * .16; y += (ty - y) * .16;
            const next = `${x.toFixed(2)},${y.toFixed(2)}`;
            if (next !== previous) { setPosition({ x, y }); previous = next; }
          }
          const target = Math.max(-3, Math.min(3, (window.__lenis?.velocity ?? 0) * .04));
          skew += (target - skew) * .1;
          const value = Math.abs(skew) < .005 ? 0 : Math.round(skew * 100) / 100;
          if (value !== previousSkew) { setSkew(value); previousSkew = value; }
        }, cleanup: () => { surface.removeEventListener("pointermove", move); surface.removeEventListener("pointerenter", enter); surface.removeEventListener("pointerleave", leave); } };
      });
      const tick = () => { if (!document.hidden) followers.forEach(f => f.tick()); };
      gsap.ticker.add(tick);
      void document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => { gsap.ticker.remove(tick); followers.forEach(f => f.cleanup()); context.revert(); };
    });
    return () => { media.revert(); cleanups.forEach(cleanup => cleanup()); };
  }, []);
  return <section ref={root} className="home-section work" id="work" aria-labelledby={showLabel ? "work-heading" : undefined}>
    <span className="section-hairline" aria-hidden="true" />
    {showLabel && <h2 id="work-heading" className="t-label section-label"><SplitFlap text={WORK_LABEL} /></h2>}
    <div className="work-stack">{WORK.map((item, i) => <article className="work-card" key={item.slug} style={{ "--i": i } as CSSProperties}>
      <div className="work-card-content">
        <div className="work-copy">
          <div className="t-label work-kind"><span>{item.kind}</span><span>{item.year}</span></div>
          <h3 className="t-display-m" aria-label={item.name}>{item.name.split(" ").map((word, j) => <span key={j} className="work-word-mask" aria-hidden="true"><span className="work-word">{word}</span>{" "}</span>)}</h3>
          <p className="t-body work-line">{item.line}</p>
          <ul className="work-tags t-small">{item.stack.map(tag => <li key={tag}>{tag}</li>)}</ul>
          <Link prefetch={false} className="contact-pill work-pill" href={`/work/${item.slug}`}>{WORK_CTA.open}</Link>
        </div>
        <div className="work-media">
          <Link prefetch={false} className="work-media-link" href={`/work/${item.slug}`} aria-label={`${WORK_CTA.open}: ${item.name}`}>
            <div className="work-media-frame"><div className="work-media-inner">{item.images[0] ? <Image src={item.images[0].src} alt="" fill sizes="(max-width: 719px) 100vw, 58vw" onLoad={() => ScrollTrigger.refresh()} /> : <span className="t-display-xl work-outline" aria-hidden="true">{item.name}</span>}</div></div>
          </Link>
          <span className="work-follower t-small" aria-hidden="true">{WORK_CTA.view}</span>
        </div>
      </div>
    </article>)}</div>
  </section>;
}
