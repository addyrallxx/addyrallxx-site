"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { WORK, WORK_LABEL } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

export function Work({ showLabel = true }: { showLabel?: boolean }) {
  const preview = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState<number | null>(null);
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const media = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => { setFine(media.matches); if (!media.matches) setActive(null); };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useLayoutEffect(() => {
    const el = preview.current;
    if (!el || active === null) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = innerWidth, height = innerHeight;
    let x = Math.max(0, Math.min(pointer.current.x + 24, width - 320));
    let y = Math.max(0, Math.min(pointer.current.y + 24, height - 220));
    const resize = () => { width = innerWidth; height = innerHeight; };
    const tick = () => {
      frame = 0;
      const tx = Math.max(0, Math.min(pointer.current.x + 24, width - 320));
      const ty = Math.max(0, Math.min(pointer.current.y + 24, height - 220));
      const dx = (tx - x) * (motion.matches ? 1 : .12);
      x += dx; y += (ty - y) * (motion.matches ? 1 : .12);
      const angle = motion.matches ? 0 : Math.max(-6, Math.min(6, dx));
      el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${angle}deg)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > .1) frame = requestAnimationFrame(tick);
      else el.style.transform = `translate3d(${tx}px,${ty}px,0)`;
    };
    const move = (event: PointerEvent) => { pointer.current = { x: event.clientX, y: event.clientY }; if (!frame) frame = requestAnimationFrame(tick); };
    const clear = () => setActive(null);
    // Position the newly mounted image before paint, including row switches.
    tick();
    const bloom = window.setTimeout(() => { el.dataset.colour = "true"; }, 400);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", clear, { passive: true });
    window.addEventListener("blur", clear);
    return () => { cancelAnimationFrame(frame); clearTimeout(bloom); window.removeEventListener("pointermove", move); window.removeEventListener("resize", resize); window.removeEventListener("scroll", clear); window.removeEventListener("blur", clear); };
  }, [active]);
  const image = active === null ? undefined : WORK[active].images[0];
  return <section className="home-section work" id="work" aria-labelledby={showLabel ? "work-heading" : undefined}><SectionReveal>
    {showLabel && <h2 id="work-heading" className="t-label section-label">{WORK_LABEL}</h2>}
    <div className="index-list">{WORK.map((item, i) => <Link prefetch={false} className="index-row work-row" href={`/work/${item.slug}`} key={item.slug} style={{ "--row-index": i } as CSSProperties}
      onPointerEnter={event => { pointer.current = { x: event.clientX, y: event.clientY }; if (fine && event.pointerType === "mouse" && item.images.length) setActive(i); }} onPointerLeave={() => setActive(null)}>
      <span className="t-label index-number">{String(i + 1).padStart(2, "0")}</span>
      <h3 className="t-title work-name">{item.name}</h3><p className="t-body section-body">{item.line}</p>
      <div className="work-meta t-small"><span>{item.kind}</span><span>{item.year}</span></div>
      {item.images[0] && <div className="work-inline-image image-treatment"><Image src={item.images[0].src} alt="" fill sizes="88px" /></div>}
    </Link>)}</div>
    {fine && image && <div key={active} ref={preview} className="work-preview image-treatment" aria-hidden="true"><Image src={image.src} alt="" fill sizes="320px" /></div>}
  </SectionReveal></section>;
}
