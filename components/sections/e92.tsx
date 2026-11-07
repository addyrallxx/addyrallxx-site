"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CAR } from "@/lib/content";
import "./e92.css";

// Reference B clips 3, 11 and 17. Motion credits: Reference A (@webloved) vertical slice smear, circular iris clip-path, and parallax panel push.
const SLIDES = [
  { key: "profile", className: "car-slide car-slide-profile", base: "/e92/v2/profile", width: 2350, height: 1322 },
  { key: "front", className: "car-slide car-slide-front", base: "/e92/v2/front", width: 1500, height: 1875 },
  { key: "bay-wide", className: "car-slide car-slide-bay", base: "/e92/v2/bay-wide", width: 2400, height: 1350 },
  { key: "night", className: "car-slide car-slide-night", base: "/e92/v2/night", width: 1440, height: 651 },
] as const;

const SLICES = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export function E92() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = root.current!;

    const preloadObserver = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        preloadObserver.disconnect();
        section.querySelectorAll<HTMLImageElement>("img[loading='lazy']").forEach(img => {
          img.loading = "eager";
          void img.decode?.().catch(() => {});
        });
      },
      { rootMargin: "150% 0px" }
    );
    preloadObserver.observe(section);

    const media = gsap.matchMedia();
    let swept = false;
    let striped = false;
    let sweep: gsap.core.Timeline | undefined;
    let stripe: gsap.core.Tween | undefined;

    media.add("(max-width: 719px) and (prefers-reduced-motion: no-preference)", () => {
      [".car-photo", ".car-intro", ".car-specs"].forEach(selector => {
        const target = section.querySelector(selector);
        gsap.fromTo(
          target,
          { y: 20, opacity: 0.9 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: target, start: "top 85%", once: true } }
        );
      });
    });

    media.add("(min-width: 720px) and (prefers-reduced-motion: no-preference)", () => {
      section.dataset.pin = "true";
      const frame = section.querySelector<HTMLElement>(".car-photo")!;
      const profileInner = section.querySelector<HTMLElement>(".car-slide-profile .car-slide-inner")!;
      const smear = section.querySelector<HTMLElement>(".car-smear")!;
      const slices = section.querySelectorAll<HTMLElement>(".car-smear-slice");
      const frontSlide = section.querySelector<HTMLElement>(".car-slide-front")!;
      const frontInner = section.querySelector<HTMLElement>(".car-slide-front .car-slide-inner")!;
      const baySlide = section.querySelector<HTMLElement>(".car-slide-bay")!;
      const bayInner = section.querySelector<HTMLElement>(".car-slide-bay .car-slide-inner")!;
      const nightSlide = section.querySelector<HTMLElement>(".car-slide-night")!;
      const nightInner = section.querySelector<HTMLElement>(".car-slide-night .car-slide-inner")!;
      const caption = section.querySelector<HTMLElement>(".car-caption")!;
      const details = section.querySelector<HTMLElement>(".car-details")!;

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "e92-build",
          trigger: section,
          start: "top top",
          end: () => `+=${innerHeight * 3.2}`,
          pin: section.querySelector(".e92-stage"),
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: self => {
            if (self.isActive) section.dataset.active = "true";
            else delete section.dataset.active;
          },
        },
      });

      timeline
        .addLabel("world", 0)
        .fromTo(
          section.querySelector(".e92-part"),
          { x: () => innerWidth * 0.35 },
          { x: () => innerWidth * 0.35 - innerHeight * 3.2 * 0.35, duration: 10 },
          0
        )
        .addLabel("profile", 0.2)
        .fromTo(frame, { clipPath: "inset(48% 0% 48% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0 }, 0.2)
        .fromTo(profileInner, { scale: 1 }, { scale: 1.08, duration: 2.8 }, 0.2)
        .fromTo(section.querySelectorAll(".car-caption > *"), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 1.4)
        .addLabel("smearToFront", 2.5)
        .fromTo(slices, { scaleY: 0 }, { scaleY: 1, duration: 0.56, stagger: 0.04 }, 2.5)
        .fromTo(frontSlide, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 3.3)
        .fromTo(smear, { opacity: 1 }, { opacity: 0, duration: 0.05 }, 3.33)
        .fromTo(frontInner, { scale: 1 }, { scale: 1.08, duration: 2.4 }, 2.5)
        .addLabel("irisToBay", 4.6)
        .fromTo(baySlide, { clipPath: "circle(0% at 50% 56%)" }, { clipPath: "circle(100% at 50% 56%)", duration: 1.0 }, 4.6)
        .fromTo(bayInner, { scale: 1 }, { scale: 1.08, duration: 2.4 }, 4.6)
        .addLabel("pushToNight", 6.6)
        .fromTo(nightSlide, { xPercent: 100 }, { xPercent: 0, duration: 1.1 }, 6.6)
        .fromTo(baySlide, { xPercent: 0 }, { xPercent: -60, duration: 1.1 }, 6.6)
        .fromTo(nightInner, { scale: 1 }, { scale: 1.08, duration: 3.4 }, 6.6)
        .addLabel("build", 7.4)
        .to(caption, { y: -24, opacity: 0, duration: 0.5 }, 7.3)
        .fromTo(details, { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9 }, 7.4)
        .fromTo(section.querySelectorAll(".car-intro > :not(.car-signoff)"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 7.6)
        .fromTo(section.querySelectorAll(".car-specs > div"), { x: 48 }, { x: 0, duration: 0.7, stagger: 0.05 }, 7.5)
        .fromTo(section.querySelectorAll(".car-spec-line"), { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.05 }, 7.5)
        .fromTo(section.querySelectorAll(".car-specs dt, .car-specs dd"), { opacity: 0 }, { opacity: 1, duration: 0.7, stagger: 0.03 }, 7.5)
        .addLabel("signOff", 8.8)
        .fromTo(section.querySelectorAll(".car-signoff-word"), { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.05 }, 8.8);

      gsap.set(section.querySelector(".e92-stripe"), { scaleX: striped ? 1 : 0 });
      timeline.eventCallback("onUpdate", () => {
        if (timeline.progress() >= 0.12 && !striped) {
          striped = true;
          stripe = gsap.to(section.querySelector(".e92-stripe"), { scaleX: 1, duration: 0.4, ease: "power3.out" });
        }
        if (timeline.progress() >= 0.55 && !swept) {
          swept = true;
          sweep = gsap
            .timeline()
            .set(section.querySelector(".car-sun"), { opacity: 1 })
            .fromTo(section.querySelector(".car-sun"), { xPercent: -120 }, { xPercent: 450, duration: 1.6, ease: "power3.out" })
            .set(section.querySelector(".car-sun"), { opacity: 0 });
        }
      });

      void document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => {
        sweep?.kill();
        stripe?.kill();
        delete section.dataset.progress;
        delete section.dataset.pin;
        delete section.dataset.active;
      };
    });

    return () => {
      preloadObserver.disconnect();
      media.revert();
      sweep?.kill();
      stripe?.kill();
    };
  }, []);

  return (
    <section id="e92" ref={root} className="e92" aria-labelledby="e92-heading">
      <div className="e92-stage">
        <span className="e92-part t-display-xl" aria-hidden="true">
          N54
        </span>
        <div className="e92-track">
          <div className="car-photo">
            {SLIDES.map((slide, i) => (
              <div key={slide.key} className={slide.className} aria-hidden={i > 0 ? "true" : undefined}>
                <div className="car-slide-inner">
                  <picture className="car-picture">
                    <source srcSet={`${slide.base}-small.webp ${Math.round(slide.width / 2)}w, ${slide.base}.webp ${slide.width}w`} sizes="100vw" type="image/webp" />
                    <img
                      src={`${slide.base}.jpg`}
                      width={slide.width}
                      height={slide.height}
                      alt={i === 0 ? CAR.title : ""}
                      decoding="async"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </picture>
                </div>
              </div>
            ))}
            <div className="car-smear" aria-hidden="true">
              {SLICES.map(i => (
                <span key={i} className="car-smear-slice" style={{ backgroundPosition: `${(i / 7) * 100}% 55%` }} />
              ))}
            </div>
            <span className="m-stripe e92-stripe" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="car-sun" aria-hidden="true" />
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
