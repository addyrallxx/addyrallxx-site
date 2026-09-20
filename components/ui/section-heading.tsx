import { WordReveal } from "@/components/story/word-reveal";

// Transform-only rules replace the old width animation. Server markup stays
// visible, including without JavaScript or support for view timelines.
export function SectionHeading({
  id, eyebrow, children, quiet = false,
}: {
  id: string;
  eyebrow?: string;
  children: React.ReactNode;
  quiet?: boolean;
}): React.JSX.Element {
  return (
    <div className="section-heading">
      <div className="section-heading-top">
        <span className={`${quiet ? "" : "motion-hairline-draw "}block h-[2px] w-12 shrink-0 bg-accent`} aria-hidden="true" />
        {eyebrow ? <p className="label section-heading-eyebrow">{eyebrow}</p> : null}
      </div>
      <h2 id={id} className="section-heading-title text-balance">
        {typeof children === "string" && !quiet ? <WordReveal text={children} /> : children}
      </h2>
    </div>
  );
}
