"use client";

import { useEffect, useRef, useState, type CSSProperties, type JSX } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./use-reduced-motion";
import { VIDEO_CONTROL } from "@/lib/content";
import "./scroll-video.css";

export type ScrollVideoProps = { mp4: string; webm?: string; poster: string; label: string; aspect?: string; className?: string };

export function ScrollVideo({ mp4, webm, poster, label, aspect = "16 / 9", className = "" }: ScrollVideoProps): JSX.Element {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const paused = useRef(false);
  const toggle = () => {
    const player = video.current!;
    paused.current = !player.paused;
    if (player.paused) void player.play().catch(() => {});
    else player.pause();
  };
  useEffect(() => {
    const el = root.current!, player = video.current!;
    let visible = false, loaded = false;
    const play = () => { void player.play().catch(() => { /* Keep the poster when autoplay is unavailable. */ }); };
    const sync = () => { if (visible && !document.hidden && !reduced && !paused.current && !el.closest("[inert]")) play(); else player.pause(); };
    const near = new IntersectionObserver(entries => {
      if (!loaded && entries.some(entry => entry.isIntersecting)) {
        loaded = true; player.preload = "metadata"; player.load(); sync(); near.disconnect();
      }
    }, { rootMargin: "150% 0px" });
    const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= .25; sync(); }, { threshold: [0, .25] });
    const active = new MutationObserver(sync);
    active.observe(el.closest(".work-card") ?? el, { attributes: true, attributeFilter: ["inert"] });
    near.observe(el); observer.observe(player);
    document.addEventListener("visibilitychange", sync);
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const frame = el.querySelector<HTMLElement>(".scroll-video-frame")!;
      // Reference B clip 11: counter-moving media within a vertical reveal.
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        trigger: el, start: "top 90%", end: "center 55%", scrub: .6,
        onToggle: self => { frame.style.willChange = self.isActive ? "clip-path" : ""; player.style.willChange = self.isActive ? "transform" : ""; },
      } }).fromTo(frame, { clipPath: "inset(18% 12% round 28px)" }, { clipPath: "inset(0% 0% round 14px)" }, 0)
        .fromTo(player, { scale: 1.18, yPercent: 8 }, { scale: 1, yPercent: -4 }, 0);
    });
    sync();
    return () => { media.revert(); near.disconnect(); observer.disconnect(); active.disconnect(); document.removeEventListener("visibilitychange", sync); player.pause(); };
  }, [mp4, webm, reduced]);
  return <figure ref={root} className={`scroll-video ${className}`} style={{ "--video-aspect": aspect } as CSSProperties}>
    <div className="scroll-video-frame" data-cursor="Play" onClick={toggle}>
      <video ref={video} muted playsInline loop preload="none" poster={poster} aria-label={label} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
        {webm && <source src={webm} type="video/webm" />}<source src={mp4} type="video/mp4" />
      </video>
      <button type="button" className="scroll-video-control sr-only" aria-pressed={playing} onClick={event => { event.stopPropagation(); toggle(); }}>
        {playing ? VIDEO_CONTROL.pause : VIDEO_CONTROL.play}
      </button>
    </div><figcaption className="t-small">{label}</figcaption>
  </figure>;
}
