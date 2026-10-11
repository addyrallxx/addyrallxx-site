import { TASTE } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";
import { SectionReveal } from "@/components/ui/section-reveal";

export function Taste() {
  return <section id="taste" className="home-section taste" aria-labelledby="taste-heading"><SectionReveal>
    <h2 id="taste-heading" className="t-label section-label"><SplitFlap text={TASTE.label} /></h2>
    <p className="t-display-l section-heading" aria-label={TASTE.lines.join(" ")}>{TASTE.lines.map((line, i) => <span className="section-line" aria-hidden="true" key={line} style={{ "--line-index": i } as React.CSSProperties}><span>{line}</span></span>)}</p>
    <div className="editorial-grid"><p className="t-body section-body taste-body">{TASTE.body}</p></div>
  </SectionReveal></section>;
}
