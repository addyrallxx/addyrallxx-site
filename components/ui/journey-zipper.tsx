"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Pre-rendered Cycles sequence (assets-src/blender/zipper.py): a gold zipper closes Dhaka to Calgary.
const FRAMES = 120;
const src = (size: number, i: number) => `/journey/zip-${size}/${String(i).padStart(3, "0")}.webp`;

export function JourneyZipper() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!, section = el.closest<HTMLElement>(".journey")!;
    const canvas = el.querySelector("canvas")!, ctx = canvas.getContext("2d", { alpha: false })!;
    const size = innerWidth < 720 ? 960 : 1920;
    const images: HTMLImageElement[] = [];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = reduced ? FRAMES - 1 : 0, shown = -1, current = target, loaded = false, visible = false, paints = 0;

    const fit = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); shown = -1; draw();
    };
    // Nearest loaded frame, so a fast scroll never shows a blank.
    const nearest = (i: number) => { for (let d = 0; d < FRAMES; d++) for (const j of [i - d, i + d]) if (images[j]?.complete && images[j].naturalWidth) return images[j]; return null; };
    const draw = () => {
      const i = Math.round(current); if (i === shown) return;
      const img = nearest(i); if (!img) return;
      const cw = canvas.width, ch = canvas.height, s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.fillStyle = "#0A0F2C"; ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      shown = i; el.dataset.frame = String(i); el.dataset.paints = String(++paints);
    };
    const load = () => {
      if (loaded) return; loaded = true;
      const order = reduced ? [FRAMES - 1] : [0, ...Array.from({ length: FRAMES - 1 }, (_, i) => i + 1)];
      order.forEach(i => { const img = new Image(); img.decoding = "async"; img.src = src(size, i); img.onload = () => { if (Math.abs(i - Math.round(current)) < 4 || shown < 0) { shown = -1; draw(); } el.dataset.ready = "true"; }; images[i] = img; });
    };
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: "150% 0px" });
    const seen = new IntersectionObserver(([e]) => { visible = e.isIntersecting; el.dataset.running = String(visible && !document.hidden); });
    near.observe(section); seen.observe(section);
    const resize = new ResizeObserver(fit); resize.observe(el);

    // Ease toward the scroll target on the shared GSAP ticker; idle when settled or offscreen.
    const tick = () => {
      if (!visible || document.hidden) return;
      const d = target - current; if (Math.abs(d) < .01) return;
      current += d * .18; draw();
    };
    gsap.ticker.add(tick);

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({ trigger: section, start: "top bottom", end: () => `+=${innerHeight + innerWidth * 1.4}`, invalidateOnRefresh: true, onUpdate: self => { target = self.progress * (FRAMES - 1); } });
      // The camera leans with the pointer, transform only.
      const rx = gsap.quickTo(el, "rotationX", { duration: .9, ease: "power3.out" }), ry = gsap.quickTo(el, "rotationY", { duration: .9, ease: "power3.out" });
      const move = (e: PointerEvent) => { if (!visible) return; ry((e.clientX / innerWidth - .5) * 4); rx((e.clientY / innerHeight - .5) * -3); };
      addEventListener("pointermove", move, { passive: true });
      return () => removeEventListener("pointermove", move);
    });
    const onVis = () => { el.dataset.running = String(visible && !document.hidden); };
    document.addEventListener("visibilitychange", onVis);
    return () => { gsap.ticker.remove(tick); media.revert(); near.disconnect(); seen.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return <div className="journey-zipper" ref={host} aria-hidden="true"><canvas /></div>;
}
