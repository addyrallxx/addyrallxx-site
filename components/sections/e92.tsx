"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CAR } from "@/lib/content";
import "./e92.css";

export function E92() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = root.current!;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const photo = section.querySelector<HTMLElement>(".car-slide-inner")!;
      gsap.fromTo(photo, { scale: 1.08, yPercent: 4 }, { scale: 1, yPercent: -4, ease: "none", scrollTrigger: {
        trigger: section.querySelector(".car-photo"), start: "top bottom", end: "bottom top", scrub: .7,
        onToggle: self => { photo.style.willChange = self.isActive ? "transform" : ""; },
      } });
      gsap.fromTo(section.querySelector(".e92-stripe"), { scaleX: 0 }, { scaleX: 1, duration: .4, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 70%", once: true } });
    });
    return () => media.revert();
  }, []);

  return (
    <section id="e92" ref={root} className="e92" aria-labelledby="e92-heading">
      <div className="e92-stage">
        <span className="e92-part t-display-xl" aria-hidden="true">
          N54
        </span>
        <div className="e92-track">
          <div className="car-photo">
            <div className="car-slide car-slide-profile"><div className="car-slide-inner">
              <picture className="car-picture">
                <source srcSet="/e92/v2/profile-small.webp 1600w, /e92/v2/profile.webp 3024w" sizes="100vw" type="image/webp" />
                <img src="/e92/v2/profile.jpg" width={3024} height={1701} alt={CAR.title} decoding="async" loading="eager" />
              </picture>
            </div></div>
            <span className="m-stripe e92-stripe" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <div className="car-caption">
              <p className="t-label">
                {CAR.label}
              </p>
              <h2 id="e92-heading" className="t-display-l" aria-label={CAR.lines.join(" ")}>
                {CAR.lines.map(line => (
                  <span key={line}>
                    {line}{" "}
                  </span>
                ))}
              </h2>
            </div>
          </div>
          <div className="car-details editorial-grid">
            <div className="car-intro">
              <h3 className="t-title">{CAR.title}</h3>
              <p className="t-body car-lead">{CAR.lead}</p>
              <p className="t-display-m car-signoff" aria-label={CAR.signOff}>
                {CAR.signOff.split(/(\s+)/).map((word, i) =>
                  word.trim() ? (
                    <span className="work-word-mask" key={i} aria-hidden="true">
                      <span className="car-signoff-word">{word}</span>
                    </span>
                  ) : (
                    word
                  )
                )}
              </p>
            </div>
            <dl className="car-specs t-small">
              {CAR.specs.map(spec => (
                <div key={spec.label}>
                  <span className="car-spec-line" aria-hidden="true" />
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
