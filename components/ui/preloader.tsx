"use client";

import { useEffect, useRef, useState } from "react";
import { Galaxy } from "./galaxy";

// Adapted from the already archived 21st.dev Preloader (2556). This overlay
// remains a sibling of the page, never a condition for rendering its content.
const GREETINGS = ["Hello", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "Guten tag", "হ্যালো"];
const SESSION_KEY = "preloader-played";
type Stage = "checking" | "playing" | "exiting" | "done";

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>("checking");
  const [word, setWord] = useState(0);
  const completed = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // Deferring the session write makes the discarded StrictMode setup inert.
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
          setStage("done");
          return;
        }
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage is optional. The greeting sequence still has a bounded exit.
      }
      setStage("playing");
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (stage === "done") {
      if (!completed.current) { completed.current = true; onComplete?.(); }
      return;
    }
    if (stage === "checking") return;
    if (stage === "exiting") {
      const timer = setTimeout(() => setStage("done"), 900);
      return () => clearTimeout(timer);
    }
    const last = word === GREETINGS.length - 1;
    const delay = word === 0 || last ? 900 : word === GREETINGS.length - 2 ? 300 : 120;
    const timer = setTimeout(() => {
      if (last) setStage("exiting");
      else setWord((value) => value + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [stage, word, onComplete]);

  if (stage === "checking" || stage === "done") return null;
  return (
    <div data-preloader data-stage={stage} className="galaxy-intro">
      <div className="galaxy-intro-scene" aria-hidden="true">
        <Galaxy view="face" intensity={1} />
      </div>
      <p className="galaxy-greeting font-display" lang={["en", "fr", "it", "pt", "ja", "sv", "de", "bn"][word]}>
        {GREETINGS[word]}
      </p>
    </div>
  );
}
