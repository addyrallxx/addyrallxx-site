// Ported from totaltex-web, with the site's easing and an 8px pull cap.
import { gsap } from "gsap";

const TRANSITION = "transform 220ms var(--ease-out)";
const PRESS_SCALE = 0.97;

/**
 * Magnetic pull for primary CTAs only, nowhere else. Desktop / `pointer:
 * fine` only, off entirely under `prefers-reduced-motion`. Tracks
 * `pointermove` at the window level for visible, interactive elements only,
 * so the pull can engage a few px before the cursor
 * is literally over the element. Springs back to (0, 0) the moment the
 * padded box is left.
 *
 * Interpolation is a CSS `transition: transform` (set once, inline, on
 * attach) rather than an imperative animate() call: this function only ever
 * needs to set a target `transform` and let the browser's compositor tween
 * to it. 220ms/--ease is a near match for a spring of stiffness 300 /
 * damping 22 / mass 0.5 (damping ratio ~0.9, essentially no overshoot), so
 * this is a lighter engine for the same motion, not a softened replacement.
 *
 * Also layers press feedback (a 3% scale-down on pointerdown, released on
 * pointerup/pointercancel/pointerleave) into the same inline `transform`,
 * because a separate CSS `:active` rule cannot win here: this function
 * already writes `transform` to the element's inline style attribute every
 * time the pointer moves, and an inline style always beats a stylesheet
 * rule in the cascade.
 */
export function attachMagnetic(
  el: HTMLElement,
  { pad = 10, pull = 0.22 }: { pad?: number; pull?: number } = {}
) {
  if (typeof window === "undefined") return () => {};
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const original = { transition: el.style.transition, transform: el.style.transform, willChange: el.style.willChange };
  el.style.transition = TRANSITION;
  let previous = "";
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let inside = false;
  let pressed = false;
  let lastX = 0;
  let lastY = 0;
  let visible = false;

  const apply = (x: number, y: number, scale: number) => {
    const value = `translate(${x}px, ${y}px) scale(${scale})`;
    if (value !== previous) { el.style.transform = value; previous = value; }
  };

  const currentScale = () => (pressed ? PRESS_SCALE : 1);
  const reset = () => {
    inside = false; pressed = false; lastX = 0; lastY = 0;
    apply(0, 0, 1); el.style.willChange = "";
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (!visible) reset();
  });
  observer.observe(el);

  const move = (e: PointerEvent) => {
    if (motion.matches || document.hidden) return;
    // Hidden Work beats must not force layout on every global pointer sample.
    if (!visible || el.closest("[inert]")) { if (inside) reset(); return; }
    const r = el.getBoundingClientRect();
    const within =
      e.clientX >= r.left - pad &&
      e.clientX <= r.right + pad &&
      e.clientY >= r.top - pad &&
      e.clientY <= r.bottom + pad;

    if (within) {
      inside = true;
      el.style.willChange = "transform";
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      lastX = Math.max(-8, Math.min(8, (e.clientX - cx) * pull));
      lastY = Math.max(-8, Math.min(8, (e.clientY - cy) * pull));
      const length = Math.hypot(lastX, lastY);
      if (length > 8) { lastX *= 8 / length; lastY *= 8 / length; }
      apply(lastX, lastY, currentScale());
    } else if (inside) {
      reset();
    }
  };
  let latest: PointerEvent | undefined;
  let scheduled = false;
  const flush = () => { scheduled = false; if (latest) move(latest); };
  const onMove = (event: PointerEvent) => {
    latest = event;
    if (!scheduled) { scheduled = true; gsap.ticker.add(flush, true); }
  };

  const onPointerDown = () => {
    if (!inside) return;
    pressed = true;
    apply(lastX, lastY, PRESS_SCALE);
  };

  const release = () => {
    if (!pressed) return;
    pressed = false;
    apply(inside ? lastX : 0, inside ? lastY : 0, 1);
  };
  const finish = () => { if (motion.matches) reset(); };
  motion.addEventListener("change", finish);

  window.addEventListener("pointermove", onMove, { passive: true });
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);
  el.addEventListener("pointerleave", release);
  return () => {
    observer.disconnect();
    gsap.ticker.remove(flush);
    Object.assign(el.style, original);
    motion.removeEventListener("change", finish);
    window.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointerup", release);
    el.removeEventListener("pointercancel", release);
    el.removeEventListener("pointerleave", release);
  };
}
