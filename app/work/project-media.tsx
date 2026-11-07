"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollVideo } from "@/components/ui/scroll-video";
import type { Project } from "@/lib/content";
import "./project-media.css";

export function ProjectMedia({ project, gallery = false }: { project: Project; gallery?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const phone = project.slug === "fittrack" || project.slug === "handled";
  const images = gallery ? project.images.slice(project.video ? 0 : 1) : project.images.slice(0, 1);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      root.current?.querySelectorAll<HTMLElement>(".project-media-inner").forEach(inner => {
        const frame = inner.parentElement!;
        gsap.fromTo(inner, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: {
          trigger: frame, start: "top bottom", end: "bottom top", scrub: .6,
          onToggle: self => { inner.style.willChange = self.isActive ? "transform" : ""; },
        } });
        gsap.fromTo(inner, { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "top 35%", scrub: .6 } });
      });
    }, root);
    return () => media.revert();
  }, [project.slug, gallery]);
  if (gallery && !images.length) return null;
  return <div ref={root} className={`project-media${gallery ? " home-section project-images" : " project-hero-media"}${phone ? " project-media-phone" : ""}`}>
    {!gallery && project.video ? <ScrollVideo {...project.video} label={project.name} /> : images.length ? images.map(image => <div className={gallery ? "project-image" : "project-cover"} key={image.src}><div className="project-media-inner"><Image src={image.src} alt={image.alt} fill sizes={phone ? "(max-width: 719px) 80vw, 360px" : gallery ? "(max-width: 719px) 100vw, 50vw" : "100vw"} priority={!gallery} /></div></div>) : <div className="project-type-panel"><span className="t-display-l">{project.name}</span><ul className="t-small">{project.stack.map(tag => <li key={tag}>{tag}</li>)}</ul></div>}
  </div>;
}
