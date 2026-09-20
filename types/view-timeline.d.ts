/**
 * Scroll driven animations: the parts of the API TypeScript's lib.dom has not
 * caught up to yet.
 *
 * `ViewTimeline`, and the `rangeStart` / `rangeEnd` options that make it useful,
 * are shipped in every browser this site targets and are what the hero exit
 * animation and the Mindset shape morph are driven by. They are simply missing
 * from the bundled DOM typings, so without this file a correct call fails to
 * compile with "Object literal may only specify known properties".
 *
 * Declared here as an augmentation rather than cast away at each call site, so
 * the call sites stay readable and a future TypeScript release that ships these
 * natively only requires deleting this file.
 */
export {};

declare global {
  /**
   * A timeline whose progress is driven by how far `subject` has travelled
   * through its scrollport, rather than by a clock.
   */
  interface ViewTimelineOptions {
    subject: Element;
    axis?: "block" | "inline" | "x" | "y";
    inset?: string | string[];
  }

  interface ViewTimeline extends AnimationTimeline {
    readonly subject: Element;
    readonly startOffset: CSSNumericValue;
    readonly endOffset: CSSNumericValue;
  }

  var ViewTimeline: {
    prototype: ViewTimeline;
    new (options: ViewTimelineOptions): ViewTimeline;
  };

  /**
   * Where along the timeline the animation starts and ends, for example
   * "entry 0%" or "exit 100%". Only meaningful when `timeline` is a
   * ViewTimeline or a ScrollTimeline.
   */
  interface KeyframeAnimationOptions {
    rangeStart?: string;
    rangeEnd?: string;
  }
}
