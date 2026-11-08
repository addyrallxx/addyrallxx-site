"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, WORK } from "@/lib/content";
import "./services.css";

const slugs = ["totaltex-web", "totaltex-ops", "studio", "puzzled"];
const colours = ["#2340FF", "#0A0F2C", "#0E6B50", "#923B24"];
const clips = [
  ["circle(0% at 25% 45%)", "circle(150% at 25% 45%)"],
  ["polygon(100% 100%, 100% 100%, 100% 100%)", "polygon(-100% 100%, 100% -100%, 100% 100%)"],
  [],
  ["ellipse(0% 0% at 75% 65%)", "ellipse(160% 140% at 45% 45%)"],
];

// Reference B clip 16: rounded media windows with a counter-moving interior.
export function Services() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ desktop: "(min-width: 900px)", reduce: "(prefers-reduced-motion: reduce)", all: "all" }, context => {
      const { desktop, reduce } = context.conditions!;
      const panels = gsap.utils.toArray<HTMLElement>(".svc-panel", root.current);
      panels.forEach((panel, index) => {
        const colour = root.current!.querySelector<HTMLElement>(`[data-svc-colour="${index}"]`)!;
        ScrollTrigger.create({
          trigger: panel,
          start: "top center",
          end: "bottom center",
          onToggle: self => { if (self.isActive) setActive(index); },
        });
        if (reduce) return;
        const reveal = gsap.timeline({ scrollTrigger: { trigger: panel, start: "top 95%", end: "top 40%", scrub: .7 }, defaults: { ease: "none" } });
        if (index === 2) reveal.fromTo(colour.children, { scaleY: 0 }, { scaleY: 1, stagger: .08 });
        else reveal.fromTo(colour, { clipPath: clips[index][0] }, { clipPath: clips[index][1] });
        gsap.fromTo(panel.querySelectorAll(".svc-mark i"), { y: 12, scaleY: .4 }, { y: -12, scaleY: 1, stagger: .07, ease: "none", scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: .7 } });
        const frame = panel.querySelector<HTMLElement>(".svc-frame")!;
        const art = panel.querySelector<HTMLElement>(".svc-art")!;
        gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            start: desktop ? "top 85%" : "top 95%",
            end: desktop ? "top 35%" : "top 65%",
            scrub: 0.6,
          },
          defaults: { ease: "none" },
        })
          .fromTo(frame, { clipPath: "inset(14% 10% round 28px)" }, { clipPath: "inset(0% 0% round 14px)" })
          .fromTo(art, { scale: .94 }, { scale: 1 }, 0);
        gsap.fromTo(art, { yPercent: 6 }, {
          yPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6 },
        });
      });
      if (desktop && !reduce) gsap.fromTo(".svc-progress", { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top center", end: "bottom center", scrub: 0.6 },
      });
    }, root);
    return () => media.revert();
  }, []);

  return <section ref={root} className="home-section svc-section" aria-labelledby="services-heading" data-active-service={active}>
    <div className="svc-colour-track" aria-hidden="true"><div className="svc-colours">{colours.map((colour, index) => <div key={colour} className="svc-colour" data-svc-colour={index} data-entry={["iris", "diagonal", "slices", "blob"][index]} style={{ background: index === 2 ? "transparent" : colour }}>{index === 2 && Array.from({ length: 6 }, (_, i) => <span key={i} style={{ background: colour }} />)}</div>)}</div></div>
    <div className="svc-sticky">
      <h2 className="t-display-l svc-heading" id="services-heading">{SERVICES.lines.map(line => <span key={line}>{line}</span>)}</h2>
      <nav className="svc-list" aria-label={SERVICES.label}>
        <span className="svc-rail" aria-hidden="true"><span className="svc-progress" /></span>
        {SERVICES.items.map((item, index) => {
          const number = String(index + 1).padStart(2, "0");
          return <a className="svc-row" href={`#svc-panel-${index + 1}`} aria-current={active === index ? "location" : undefined} key={item.name} onClick={event => {
            const panel = document.getElementById(`svc-panel-${index + 1}`);
            if (!panel || !window.__lenis) return;
            event.preventDefault();
            window.__lenis.scrollTo(panel, { immediate: matchMedia("(prefers-reduced-motion: reduce)").matches });
          }}>
            <span className="svc-number t-label">{number}</span>
            <span className="svc-copy"><span className="svc-title t-title">{item.name}</span><span className="svc-description t-body">{item.line}</span></span>
          </a>;
        })}
      </nav>
      <a className="contact-pill t-small svc-cta" href="#contact">{SERVICES.cta}</a>
    </div>
    <div className="svc-panels">{SERVICES.items.map((item, index) => {
      const project = WORK.find(project => project.slug === slugs[index]);
      const src = index === 2 ? "/services/automation@2x.webp" : index === 3 ? "/services/dealership@2x.webp" : project?.video?.poster || project?.images[0]?.src;
      const number = String(index + 1).padStart(2, "0");
      return <div className="service-entry svc-panel" id={`svc-panel-${index + 1}`} key={item.name}>
        <div className="svc-phone-heading"><span className="t-label svc-number">{number}</span><div><h3 className="t-title">{item.name}</h3><p className="t-body">{item.line}</p></div></div>
        <div className="svc-frame" data-cursor="View" role="group" aria-label={item.name}>
          <div className="svc-art">{src ? <Image src={src} alt="" width={index >= 2 ? 1672 : project?.images[0]?.width ?? 1920} height={index >= 2 ? 941 : project?.images[0]?.height ?? 1080} quality={90} sizes="(min-width: 900px) 48vw, 100vw" /> : <span className="svc-outline" aria-hidden="true">{number}</span>}</div>
        </div>
        <div className="svc-mark" data-mark={index} aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</div>
      </div>;
    })}</div>
  </section>;
}
