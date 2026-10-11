import { SIDE } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";
import { SectionReveal } from "@/components/ui/section-reveal";

export function AlongsideSchool() {
  return <section className="home-section" aria-labelledby="side-heading"><SectionReveal>
    <h2 className="t-label section-label" id="side-heading"><SplitFlap text={SIDE.label} /></h2>
    <div className="index-list">{SIDE.items.map((item, i) => <div className="index-row plain-row" key={item.name} style={{ "--row-index": i } as React.CSSProperties}>
      <h3 className="t-title">{item.name}</h3><p className="t-body section-body">{item.line}</p>
    </div>)}</div>
  </SectionReveal></section>;
}
