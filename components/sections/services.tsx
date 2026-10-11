"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, WORK } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";
import { GradientMesh } from "@/components/ui/gradient-mesh";

export function Services() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(-1);
  const previousOpen = useRef(-1);
  const measureRows = useRef<(() => void) | null>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(pointer: coarse)", () => {
      const rows = Array.from(root.current!.querySelectorAll<HTMLElement>(".service-row"));
      let centres: number[] = [];
      let refreshing = false;
      const measure = () => { const scroll = window.__lenis?.animatedScroll ?? window.scrollY; centres = rows.map(row => { const r = row.getBoundingClientRect(); return r.top + r.height / 2 + scroll; }); };
      measureRows.current = measure;
      ScrollTrigger.create({ trigger: root.current, start: "top bottom", end: "bottom top", onRefreshInit: () => { refreshing = true; }, onRefresh: () => { measure(); refreshing = false; }, onUpdate: self => {
        if (!self.isActive || refreshing) return;
        const centre = self.scroll() + innerHeight / 2;
        let nearest = 0;
        centres.forEach((value, i) => { if (Math.abs(value - centre) < Math.abs(centres[nearest] - centre)) nearest = i; });
        if (Math.abs(centres[nearest] - centre) < innerHeight * .25) setOpen(nearest);
      } });
      measure();
      return () => { measureRows.current = null; };
    });
    return () => media.revert();
  }, []);
  useEffect(() => {
    if (open === previousOpen.current) return;
    const first = previousOpen.current === -1;
    previousOpen.current = open;
    // Switching strips keeps the section's total height. Only its local word windows move.
    if (first) { ScrollTrigger.refresh(); window.__lenis?.resize(); }
    else ScrollTrigger.getAll().filter(trigger => trigger.trigger?.matches("p.t-body") && root.current!.contains(trigger.trigger)).forEach(trigger => trigger.refresh());
    measureRows.current?.();
  }, [open]);
  const slugs = ["totaltex-web", "totaltex-ops", "puzzled", "puzzled"];
  return <section ref={root} className="home-section services" aria-labelledby="services-heading"><GradientMesh place="services" /><SectionReveal>
    <h2 className="t-display-l section-heading" id="services-heading" aria-label={SERVICES.lines.join(" ")}>{SERVICES.lines.map((line, i) => <span className="section-line" key={line} aria-hidden="true" style={{ "--line-index": i } as React.CSSProperties}><span>{line}</span></span>)}</h2>
    <div className="index-list">{SERVICES.items.map((item, i) => <div className="service-entry" data-open={open === i} key={item.name} onPointerEnter={event => { if (event.pointerType === "mouse" && matchMedia("(hover: hover) and (pointer: fine)").matches) setOpen(i); }} onFocus={() => setOpen(i)}>
      <div className="index-row service-row" style={{ "--row-index": i } as React.CSSProperties}>
      <span className="t-label index-number">{String(i + 1).padStart(2, "0")}</span><h3 className="t-title">{item.name}</h3><p className="t-body section-body">{item.line}</p>
      </div>
      <div className="service-strip" aria-hidden="true">{(() => {
        const project = WORK.find(project => project.slug === slugs[i])!;
        const image = project.images[0];
        return image ? <Image src={image.src} alt="" fill sizes="100vw" /> : <span className="t-display-l work-outline">{project.name}</span>;
      })()}</div>
    </div>)}</div>
    <a className="contact-pill t-small" href="#contact">{SERVICES.cta}</a>
  </SectionReveal></section>;
}
