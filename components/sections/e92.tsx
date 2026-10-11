"use client";

import { useEffect, useRef } from "react";
import { SplitFlap } from "@/components/ui/split-flap";
import Image from "next/image";
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
    let swept = false;
    let striped = false;
    let sweep: gsap.core.Timeline | undefined;
    let stripe: gsap.core.Tween | undefined;
    media.add("(min-width: 720px) and (prefers-reduced-motion: no-preference)", () => {
      section.dataset.pin = "true";
      const sky = document.querySelector(".sky");
      const frame = section.querySelector<HTMLElement>(".car-photo")!;
      const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        id: "e92-build", trigger: section, start: "top top", end: () => `+=${innerHeight * 2.2}`,
        pin: section.querySelector(".e92-stage"), scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => { section.dataset.progress = self.progress.toFixed(3); },
      } });
      timeline.addLabel("world", 0)
        .fromTo(section.querySelector(".e92-warm"), { opacity: 0 }, { opacity: 1, duration: 2.5 }, 0)
        .to(sky, { opacity: .15, duration: 2.5 }, 0)
        .fromTo(section.querySelector(".e92-part"), { x: () => innerWidth * .35 }, { x: () => innerWidth * .35 - innerHeight * 2.2 * .4, duration: 10 }, 0)
        .addLabel("lens", 1.5)
        .fromTo(frame, { clipPath: "inset(48% 0% 48% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 4 }, 1.5)
        .fromTo(section.querySelector(".car-photo-inner"), { scale: 1.25, yPercent: -6 }, { scale: 1, yPercent: 6, duration: 4 }, 1.5)
        .addLabel("light", 5)
        .fromTo(section.querySelector(".car-saturation"), { opacity: 0 }, { opacity: 1, duration: 1 }, 5)
        .to(section.querySelector(".car-saturation"), { opacity: 0, duration: 1 }, 6)
        .addLabel("build", 6)
        .fromTo(section.querySelectorAll(".car-caption > *"), { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .12, ease: "power3.out" }, 6)
        .to(section.querySelector(".e92-track"), { y: () => -(frame.offsetHeight - innerHeight * .1), duration: 2, ease: "power3.inOut" }, 6.8)
        .fromTo(section.querySelectorAll(".car-intro > :not(.car-signoff)"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .12 }, 7)
        .fromTo(section.querySelectorAll(".car-specs > div"), { x: 48 }, { x: 0, duration: .8, stagger: .06, ease: "power3.out" }, 6.8)
        .fromTo(section.querySelectorAll(".car-spec-line"), { scaleX: 0 }, { scaleX: 1, duration: .8, stagger: .06 }, 6.8)
        .fromTo(section.querySelectorAll(".car-specs dt, .car-specs dd"), { opacity: 0 }, { opacity: 1, duration: .8, stagger: .03 }, 6.8)
        .addLabel("signOff", 9)
        .fromTo(section.querySelectorAll(".car-signoff-word"), { yPercent: 110 }, { yPercent: 0, duration: .5, stagger: .055, ease: "power4.out" }, 9);
      gsap.set(section.querySelector(".e92-stripe"), { scaleX: striped ? 1 : 0 });
      timeline.eventCallback("onUpdate", () => {
        if (timeline.progress() >= .15 && !striped) {
          striped = true; stripe = gsap.to(section.querySelector(".e92-stripe"), { scaleX: 1, duration: .4, ease: "power3.out" });
        }
        if (timeline.progress() >= .55 && !swept) {
          swept = true;
          sweep = gsap.timeline().set(section.querySelector(".car-sun"), { opacity: 1 })
            .fromTo(section.querySelector(".car-sun"), { xPercent: -120 }, { xPercent: 450, duration: 1.6, ease: "power3.out" })
            .set(section.querySelector(".car-sun"), { opacity: 0 });
        }
      });
      gsap.fromTo(sky, { opacity: .15 }, { opacity: 1, immediateRender: false, ease: "none", scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom 60%", scrub: true } });
      gsap.to(section.querySelector(".e92-warm"), { opacity: 0, immediateRender: false, ease: "none", scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom 60%", scrub: true } });
      void document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => { sweep?.kill(); stripe?.kill(); delete section.dataset.progress; delete section.dataset.pin; };
    });
    return () => { media.revert(); sweep?.kill(); stripe?.kill(); };
  }, []);
  return <section id="e92" ref={root} className="e92" aria-labelledby="e92-heading">
    <div className="e92-stage">
      <div className="e92-warm" aria-hidden="true" />
      <span className="e92-part t-display-xl" aria-hidden="true">N54</span>
      <div className="e92-track">
        <div className="car-photo">
          <div className="car-photo-inner">
            <Image src="/e92/profile.jpg" alt="2008 BMW 335xi in BMW Individual Bernina Grey, side profile in the sun" fill sizes="100vw" onLoad={() => ScrollTrigger.refresh()} />
            <div className="car-saturation" aria-hidden="true" />
          </div>
          <span className="m-stripe e92-stripe" aria-hidden="true"><span /><span /><span /></span>
          <span className="car-sun" aria-hidden="true" />
          <div className="car-caption">
            <p className="t-label"><SplitFlap text={CAR.label} /></p>
            <h2 id="e92-heading" className="t-display-l" aria-label={CAR.lines.join(" ")}>{CAR.lines.map(line => <span key={line}>{line}{" "}</span>)}</h2>
          </div>
        </div>
        <div className="car-details editorial-grid">
          <div className="car-intro"><h3 className="t-title">{CAR.title}</h3><p className="t-body car-lead">{CAR.lead}</p>
            <p className="t-display-m car-signoff" aria-label={CAR.signOff}>{CAR.signOff.split(/(\s+)/).map((word, i) => word.trim() ? <span className="work-word-mask" key={i} aria-hidden="true"><span className="car-signoff-word">{word}</span></span> : word)}</p>
          </div>
          <dl className="car-specs t-small">{CAR.specs.map(spec => <div key={spec.label}><span className="car-spec-line" aria-hidden="true" /><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
        </div>
      </div>
    </div>
  </section>;
}
