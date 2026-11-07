"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { SplitFlap } from "@/components/ui/split-flap";
import { ScrollVideo } from "@/components/ui/scroll-video";
import { StudioStack } from "@/components/ui/studio-stack";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink as Link } from "@/components/page-transition";
import { WORK, WORK_LABEL, WORK_CTA } from "@/lib/content";
import { attachMagnetic } from "@/lib/magnetic";
import "./work.css";

export function Work({ showLabel = true }: { showLabel?: boolean }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const media = gsap.matchMedia();
    const cleanups = Array.from(el.querySelectorAll<HTMLElement>(".work-pill")).map(el => attachMagnetic(el));
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>(".work-card"));
      gsap.fromTo(el.querySelector(".section-hairline"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 65%", scrub: .6 } });
      cards.forEach(card => {
        const inner = card.querySelector(".work-media-inner");
        if (card.classList.contains("work-stage")) {
          const planes = card.querySelectorAll<HTMLElement>("[data-parallax]");
          gsap.timeline({ scrollTrigger: {
            trigger: card, start: "top bottom", end: "bottom top", scrub: .6,
            onToggle: self => planes.forEach(plane => { plane.style.willChange = self.isActive ? "transform" : ""; }),
          } }).fromTo(card.querySelector('[data-parallax="0.6"]'), { y: 48 }, { y: -48, ease: "none" }, 0)
            .fromTo(card.querySelector('[data-parallax="1"]'), { y: 80 }, { y: -80, ease: "none" }, 0);
        } else if (inner) {
          gsap.fromTo(inner, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: {
            trigger: card, start: "top bottom", end: "bottom top", scrub: .6,
            onToggle: self => { (inner as HTMLElement).style.willChange = self.isActive ? "transform" : ""; },
          } });
          gsap.fromTo(inner, { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "top 35%", scrub: .6 } });
        }
      });
    });
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>(".work-card"));
      const stack = el.querySelector<HTMLElement>(".work-stack")!;
      // Reference B clip 7: one persistent stage, six media beats and masked titles.
      el.dataset.pinned = "true";
      let active = -1;
      const select = (index: number) => {
        if (active === index) return;
        active = index;
        cards.forEach((card, i) => { card.inert = i !== index; card.dataset.active = String(i === index); });
      };
      const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        id: "work-beats", trigger: stack, start: "top top", end: () => `+=${innerHeight * cards.length}`, pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: self => select(Math.min(cards.length - 1, Math.floor(self.progress * cards.length))),
      } });
      cards.forEach((card, i) => {
        if (i) {
          timeline.fromTo(card, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .65 }, i);
          timeline.fromTo(card.querySelectorAll(".work-word"), { yPercent: 110 }, { yPercent: 0, duration: .6, stagger: .03 }, i);
        }
        timeline.fromTo(card.querySelector(".work-media"), { xPercent: 6 }, { xPercent: 0, duration: 1 }, i);
      });
      select(0);
      return () => { delete el.dataset.pinned; cards.forEach(card => { card.inert = false; delete card.dataset.active; }); };
    });
    let mounted = true;
    void document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh(); });
    return () => { mounted = false; media.revert(); cleanups.forEach(cleanup => cleanup()); };
  }, []);
  return <section ref={root} className="home-section work" id="work" aria-labelledby={showLabel ? "work-heading" : undefined}>
    <span className="section-hairline" aria-hidden="true" />
    {showLabel && <h2 id="work-heading" className="t-label section-label"><SplitFlap text={WORK_LABEL} /></h2>}
    <div className="work-stack">{WORK.map((item, i) => {
      const stage = item.slug === "puzzled" && !!item.video;
      const phone = item.slug === "fittrack" || item.slug === "handled";
      return <article className={`work-card${stage ? " work-stage" : ""}${phone ? " work-phone" : ""}`} key={item.slug} data-cursor="View" style={{ "--i": i } as CSSProperties}>
        {stage && <span className="work-stage-name t-display-xl" data-parallax="0.6" aria-hidden="true">{item.name}</span>}
        <div className="work-card-content">
          <div className="work-copy">
            <div className="t-label work-kind"><span>{item.kind}</span><span>{item.year}</span></div>
            <h3 className="t-display-m" aria-label={item.name}>{item.name.split(" ").map((word, j) => <span key={j} className="work-word-mask" aria-hidden="true"><span className="work-word">{word}</span>{" "}</span>)}</h3>
            <p className="t-body work-line">{item.line}</p>
            <ul className="work-tags t-small">{item.stack.map(tag => <li key={tag}>{tag}</li>)}</ul>
            <Link prefetch={false} className="contact-pill work-pill" data-cursor="View" href={`/work/${item.slug}`}>{WORK_CTA.open}</Link>
          </div>
          <div className="work-media" data-parallax={stage ? "1" : undefined}>
            {item.video ? <div className="work-media-frame"><ScrollVideo {...item.video} label={item.name} /></div> : <Link prefetch={false} className="work-media-link" data-cursor="View" href={`/work/${item.slug}`} aria-label={`${WORK_CTA.open}: ${item.name}`}>
              <div className="work-media-frame">{item.slug === "studio" ? <StudioStack /> : item.images[0] ? <div className="work-media-inner"><Image src={item.images[0].src} alt="" fill sizes={phone ? "(max-width: 719px) 70vw, 300px" : "(max-width: 719px) 100vw, 58vw"} /></div> : <div className="work-type-panel"><span className="t-display-xl work-outline" aria-hidden="true">{item.name}</span><ul className="work-panel-tags t-small" aria-hidden="true">{item.stack.map(tag => <li key={tag}>{tag}</li>)}</ul></div>}</div>
            </Link>}
          </div>
        </div>
      </article>;
    })}</div>
  </section>;
}
