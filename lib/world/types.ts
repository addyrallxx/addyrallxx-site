// Pinned interface for the scrolled world. Written by the orchestrator before
// any implementation so the DOM layer and the WebGL layer cannot drift apart.
// Do not change a signature here without changing both sides in the same commit.
// Spec: docs/phase-2-world.md

/** Chosen once at init from device capability and motion preference. Never switched mid session. */
export type Tier = "full" | "lite" | "static";

/** The six chapters, in scroll order. See PLAN.md section 3. */
export type ChapterId =
  | "arrival"
  | "ground"
  | "totaltex"
  | "puzzled"
  | "field-notes"
  | "contact";

export const CHAPTERS: readonly ChapterId[] = [
  "arrival",
  "ground",
  "totaltex",
  "puzzled",
  "field-notes",
  "contact",
] as const;

/**
 * Pacing per chapter, ported from scroll-world as a spec rather than as code.
 * `scroll` is dwell distance as a multiple of viewport height, so it controls
 * how much page the chapter consumes. `linger` remaps time within the chapter
 * so the camera settles and holds while the copy peaks, instead of gliding
 * through it. 0 means linear, higher values hold longer in the middle.
 */
export interface ChapterPacing {
  readonly id: ChapterId;
  readonly scroll: number;
  readonly linger: number;
}

export interface WorldOptions {
  /** Force a tier. Omit to detect. Present so tests and the verifier can pin one. */
  readonly tier?: Tier;
  /** Override particle count. Omit to use the tier default. */
  readonly particleCount?: number;
}

/**
 * The only surface the React layer touches. The world never reads scroll itself
 * and never writes to the DOM, so it stays testable and cannot scrolljack.
 */
export interface WorldHandle {
  /** Normalised document progress, 0 at the top of chapter 1, 1 at the end of chapter 6. Clamped internally. */
  setProgress(progress: number): void;
  /** Normalised pointer, both axes in -1 to 1, origin at viewport centre. Ignored on lite and static tiers. */
  setPointer(x: number, y: number): void;
  /** Call on viewport resize. Recomputes aspect ratio driven camera framing. */
  resize(): void;
  /** Stop the loop, drop GPU resources, remove listeners. Must be idempotent. */
  dispose(): void;

  readonly tier: Tier;
  readonly particleCount: number;

  /**
   * Debug surface for puppeteer-core verification, per docs/phase-2-world.md
   * section 7. The Browser pane cannot verify this project, so these values are
   * how correctness gets asserted numerically instead of by eye.
   */
  readonly debug: {
    cameraPosition(): readonly [number, number, number];
    /** Whether a requestAnimationFrame loop is currently scheduled. Must be false on the static tier. */
    isAnimating(): boolean;
    /** Frames rendered since init. On the static tier this increments only on chapter change. */
    frameCount(): number;
    /**
     * Live state of the chapter 6 great-circle arc. A LineMaterial whose
     * resolution uniform is zero renders nothing and logs no error, so the
     * arc has to be asserted numerically rather than looked at.
     */
    arc(): {
      readonly progress: number;
      readonly opacity: number;
      readonly dashOffset: number;
      readonly resolution: readonly [number, number];
      readonly visible: boolean;
    };
  };
}

/**
 * Build the world against an existing canvas. Must not throw when WebGL is
 * unavailable: return a handle whose tier is "static" and whose methods are
 * safe no-ops, so the page degrades instead of breaking.
 */
export type CreateWorld = (
  canvas: HTMLCanvasElement,
  options?: WorldOptions,
) => WorldHandle;
