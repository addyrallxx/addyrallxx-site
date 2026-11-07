"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, WORK } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";
import "./services.css";

const slugs = ["totaltex-web", "totaltex-ops", "puzzled", "puzzled"];

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
        ScrollTrigger.create({
          trigger: panel,
          start: "top center",
          end: "bottom center",
          onToggle: self => { if (self.isActive) setActive(index); },
        });
        if (reduce) return;
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
          .fromTo(art, { scale: 1.15 }, { scale: 1 }, 0);
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

  return <section ref={root} className="home-section svc-section" aria-labelledby="services-heading">
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
            <span className="svc-number t-label">{active === index ? <SplitFlap text={number} /> : number}</span>
            <span className="svc-copy"><span className="svc-title t-title">{item.name}</span><span className="svc-description t-body">{item.line}</span></span>
          </a>;
        })}
      </nav>
      <a className="contact-pill t-small svc-cta" href="#contact">{SERVICES.cta}</a>
    </div>
    <div className="svc-panels">{SERVICES.items.map((item, index) => {
      const project = WORK.find(project => project.slug === slugs[index]);
      const src = project?.video?.poster || project?.images[0]?.src;
      const number = String(index + 1).padStart(2, "0");
      return <div className="service-entry svc-panel" id={`svc-panel-${index + 1}`} key={item.name}>
        <div className="svc-phone-heading"><span className="t-label svc-number">{number}</span><div><h3 className="t-title">{item.name}</h3><p className="t-body">{item.line}</p></div></div>
        <div className="svc-frame" data-cursor="View" role="group" aria-label={item.name}>
          <div className="svc-art">{src ? <Image src={src} alt="" fill sizes="(min-width: 900px) 48vw, 100vw" /> : <span className="svc-outline" aria-hidden="true">{number}</span>}</div>
        </div>
      </div>;
    })}</div>
  </section>;
}
