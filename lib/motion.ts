/**
 * Ported from totaltex-web/lib/motion.ts (unchanged: already generic).
 *
 * The site's one easing family: a weighted ease-out,
 * cubic-bezier(0.16, 1, 0.3, 1). CSS consumers use the `--ease` custom
 * property in app/globals.css; JS consumers that need an array (framer
 * motion, motion/react) import this. Keep both in sync if the curve ever
 * changes.
 *
 * GSAP's own ease names (power1.out, power4.out, sine.inOut) are a separate,
 * deliberate per-tween vocabulary for scroll-scrubbed choreography and are
 * intentionally NOT unified with this constant.
 */
export const EASE_SITE = [0.16, 1, 0.3, 1] as const;
