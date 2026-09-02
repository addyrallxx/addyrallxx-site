"use client";

/*
  Adapted from the 21st.dev "Preloader" component (info-mdshakeeb), pulled
  into wiki/resources/21st-components/2556-preloader.md. That write up flagged
  six real defects, all fixed below: the absurd z-index, the hardcoded fill,
  the uncleared setTimeout handles, the total absence of reduced-motion
  handling, the lack of a repeat-visit skip, and (implicitly) the hardcoded
  easing curve, which this repo bans outright.

  One thing added beyond that list. Adnan pointed at redoyanulhaque.me and
  asked for the light ground that flips to dark on exit. Rather than invent a
  colour for that, this borrows [data-tone="warm"] (the same paper palette
  About uses) for the rest state and lets it fall back to the default dark
  tokens on exit, so the flip is a data attribute toggle, not a new value.
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_SITE } from "@/lib/motion";

// Ends on Bengali on purpose: the site's whole spine is Dhaka to Calgary,
// and this is the first word a visitor sees.
const GREETINGS = ["Hello", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "Guten tag", "হ্যালো"];
const LAST = GREETINGS.length - 1;

const SESSION_KEY = "preloader-played";

function hasPlayed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Some privacy modes throw on storage access. Treat as "not played" and
    // let it run again rather than crash the mount.
    return false;
  }
}

function markPlayed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Same as above: worst case it replays next visit, not worth handling further.
  }
}

// Fast in, a small crawl before the last word, a hold, then exit. No percent
// counter, just the cadence doing the same job.
function stepDelay(index: number): number {
  if (index === 0) return 900;
  if (index === LAST - 1) return 300;
  return 120;
}

type Stage = "checking" | "playing" | "exiting" | "done";

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>("checking");
  const [word, setWord] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const after = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeouts.current.push(id);
  }, []);

  const finish = useCallback(() => {
    setStage("done");
    onComplete?.();
  }, [onComplete]);

  // Decide once, on mount. Reduced motion or an already-played session both
  // resolve to "done" without ever painting the overlay: `stage` starts at
  // "checking", which renders nothing, on both the server and this first
  // client render, so there is no flash to suppress. This is a genuine
  // one-time side effect (a sessionStorage write, kicking off a multi-stage
  // sequence), not a value useMemo could produce on its own, so it stays in
  // an effect.
  //
  // Deliberately window.matchMedia(...) read directly here, not the shared
  // usePrefersReducedMotion hook used elsewhere in this file's sibling
  // components. That hook's useSyncExternalStore always renders the server
  // snapshot (hardcoded false, SSR cannot know the OS preference) on this
  // first client render too, correcting itself one tick later. For
  // gating autoRotate that's harmless; here it briefly ran the whole
  // sequence under reduced motion before self-correcting and aborting mid
  // cascade, caught by the puppeteer-core reduced-motion check during
  // verification. A plain effect only ever runs client side, so there is no
  // server snapshot to be wrong about.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || hasPlayed()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      finish();
      return;
    }
    setSize({ width: window.innerWidth, height: window.innerHeight });
    markPlayed();
    setStage("playing");
  }, [finish]);

  // The greeting cycle. Runs only while playing; the exiting/done stages
  // have their own effects below.
  useEffect(() => {
    if (stage !== "playing") return;
    if (word === LAST) {
      after(() => setStage("exiting"), 900);
      return;
    }
    after(() => setWord((w) => w + 1), stepDelay(word));
  }, [stage, word, after]);

  useEffect(() => {
    if (stage !== "exiting") return;
    // Matches the curve/slide transition below: 0.2s delay + 0.8s slide is
    // the longer of the two exit tweens, so it gates when this unmounts.
    after(finish, 1000);
  }, [stage, after, finish]);

  // StrictMode double-invokes effects in development; without this every
  // timeout from the first, discarded mount keeps firing against a
  // component that never rendered again.
  useEffect(() => {
    const handles = timeouts.current;
    return () => {
      handles.forEach(clearTimeout);
    };
  }, []);

  if (stage === "checking" || stage === "done") return null;

  const isExiting = stage === "exiting";
  const { width, height } = size;
  const restPath = `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height + 300} 0 ${height} L0 0`;
  const exitPath = `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height} 0 ${height} L0 0`;

  return (
    <motion.div
      data-preloader
      className="fixed inset-0 z-50"
      initial={{ top: 0 }}
      animate={{ top: isExiting ? "-100vh" : 0 }}
      transition={{ duration: 0.8, ease: EASE_SITE, delay: isExiting ? 0.2 : 0 }}
    >
      {/*
        No position utility here on purpose. [data-tone="warm"] in
        globals.css sets `position: relative` unlayered, which would beat a
        Tailwind `absolute`/`fixed` utility on this same element outright
        (the exact trap documented at the top of that file). Filling the
        parent with h-full/w-full needs no position of its own, and the SVG
        curve below still gets a valid containing block either way: this
        div while "warm" is applied, the fixed ancestor once it is not.
      */}
      <div
        data-tone={isExiting ? undefined : "warm"}
        className="tone-surface flex h-full w-full items-center justify-center bg-canvas text-ink transition-colors duration-[var(--dur-slow)] ease-[var(--ease)]"
      >
        {width > 0 && (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute z-10 flex items-center gap-[var(--space-3)] font-display text-[length:var(--step-4)] font-semibold"
            >
              <span aria-hidden className="inline-block size-[10px] rounded-full bg-ink" />
              {GREETINGS[word]}
            </motion.p>
            <svg className="absolute top-0 h-[calc(100%+300px)] w-full" aria-hidden>
              <motion.path
                initial={{ d: restPath }}
                animate={{ d: isExiting ? exitPath : restPath }}
                transition={{ duration: 0.7, ease: EASE_SITE, delay: isExiting ? 0.3 : 0 }}
                fill="var(--canvas)"
              />
            </svg>
          </>
        )}
      </div>
    </motion.div>
  );
}
