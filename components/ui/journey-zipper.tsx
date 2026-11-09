"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Pre-rendered Cycles sequence (assets-src/blender/zipper.py): a gold zipper closes Dhaka to Calgary.
const FRAMES = 240;
const src = (size: number, i: number) => `/journey/zip-${size}/${String(i).padStart(3, "0")}.webp`;

export function JourneyZipper() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!, section = el.closest<HTMLElement>(".journey")!;
    const canvas = el.querySelector("canvas")!, ctx = canvas.getContext("2d", { alpha: false })!;
    const size = innerWidth < 720 ? 960 : 1920;
    const images: HTMLImageElement[] = [];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = reduced ? FRAMES - 1 : 0, shown = -1, current = target, loaded = false, visible = false, paints = 0, fade = 0;

    const fit = () => {
      const r = el.getBoundingClientRect(), scale = Math.min(devicePixelRatio, 2, size / Math.max(r.width, 1));
      canvas.width = Math.round(r.width * scale); canvas.height = Math.round(r.height * scale); shown = -1; fade = -1; draw();
    };
    // Nearest loaded frame, so a fast scroll never shows a blank.
    const ready: boolean[] = [];
    const nearest = (i: number) => { for (let d = 0; d < FRAMES; d++) for (const j of [i - d, i + d]) if (ready[j]) return j; return -1; };
    // Decode a short window ahead off the main thread so drawImage never decodes synchronously.
    const warm = (i: number) => { for (let j = Math.max(0, i - 8); j <= Math.min(FRAMES - 1, i + 24); j++) { const img = images[j]; if (img && !ready[j] && !img.dataset.decoding) { img.dataset.decoding = "1"; img.decode().then(() => { ready[j] = true; if (shown < 0 || Math.abs(j - Math.round(current)) < 3) draw(); }).catch(() => { delete img.dataset.decoding; }); } } };
    const blit = (img: HTMLImageElement, alpha: number) => {
      const cw = canvas.width, ch = canvas.height, s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.globalAlpha = alpha; ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };
    // Between two rendered frames, crossfade by the fractional position so slow scrolls never step.
    const draw = () => {
      const base = Math.floor(current), f = Math.round((current - base) * 16) / 16; warm(base);
      const i = nearest(base); if (i < 0) return;
      const next = i === base && f > 0 && ready[base + 1] ? base + 1 : -1, a = next < 0 ? 0 : f;
      if (i === shown && a === fade) return;
      blit(images[i], 1); if (next >= 0) blit(images[next], a); ctx.globalAlpha = 1;
      shown = i; fade = a; el.dataset.frame = String(a > .5 ? i + 1 : i); el.dataset.paints = String(++paints);
    };
    const load = () => {
      if (loaded) return; loaded = true;
      const order = reduced ? [FRAMES - 1] : [0, ...Array.from({ length: FRAMES - 1 }, (_, i) => i + 1)];
      order.forEach(i => { const img = new Image(); img.src = src(size, i); images[i] = img; });
      warm(Math.round(current)); images[order[0]].decode().then(() => { ready[order[0]] = true; el.dataset.ready = "true"; draw(); }).catch(() => {});
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
      ScrollTrigger.create({ trigger: section, start: "top top", end: () => `+=${innerWidth * 1.4}`, invalidateOnRefresh: true, onUpdate: self => { target = self.progress * (FRAMES - 1); } });
      // The camera leans with the pointer, transform only.
      const rx = gsap.quickTo(el, "rotationX", { duration: .9, ease: "power3.out" }), ry = gsap.quickTo(el, "rotationY", { duration: .9, ease: "power3.out" });
      const move = (e: PointerEvent) => { if (!visible) return; ry((e.clientX / innerWidth - .5) * 4); rx((e.clientY / innerHeight - .5) * -3); };
      addEventListener("pointermove", move, { passive: true });
      return () => removeEventListener("pointermove", move);
    });
    const onVis = () => { el.dataset.running = String(visible && !document.hidden); };
    document.addEventListener("visibilitychange", onVis);
    return () => { images.forEach(img => { img.src = ""; }); gsap.ticker.remove(tick); media.revert(); near.disconnect(); seen.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return <div className="journey-zipper" ref={host} aria-hidden="true"><canvas /></div>;
}
