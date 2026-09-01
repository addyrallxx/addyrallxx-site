// Ported from totaltex-web/lib/magnetic.ts. Only change: --ease-site (that
// repo's token name) renamed to --ease (this repo's token name). Logic and
// accessibility behavior (pointer:fine only, off under
// prefers-reduced-motion) are unchanged.

const TRANSITION = "transform 220ms var(--ease)";
const PRESS_SCALE = 0.97;

/**
 * Magnetic pull for primary CTAs only, nowhere else. Desktop / `pointer:
 * fine` only, off entirely under `prefers-reduced-motion`. Tracks
 * `pointermove` at the window level (cheap: a `getBoundingClientRect` and a
 * range check per call) so the pull can engage a few px before the cursor
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

  el.style.transition = TRANSITION;
  el.style.willChange = "transform";

  let inside = false;
  let pressed = false;
  let lastX = 0;
  let lastY = 0;

  const apply = (x: number, y: number, scale: number) => {
    el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };

  const currentScale = () => (pressed ? PRESS_SCALE : 1);

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const within =
      e.clientX >= r.left - pad &&
      e.clientX <= r.right + pad &&
      e.clientY >= r.top - pad &&
      e.clientY <= r.bottom + pad;

    if (within) {
      inside = true;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      lastX = (e.clientX - cx) * pull;
      lastY = (e.clientY - cy) * pull;
      apply(lastX, lastY, currentScale());
    } else if (inside) {
      inside = false;
      pressed = false;
      lastX = 0;
      lastY = 0;
      apply(0, 0, 1);
    }
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

  window.addEventListener("pointermove", onMove, { passive: true });
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);
  el.addEventListener("pointerleave", release);
  return () => {
    window.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointerup", release);
    el.removeEventListener("pointercancel", release);
    el.removeEventListener("pointerleave", release);
  };
}
