import { METHOD } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

export function Method() {
  return <section id="method" className="home-section" aria-labelledby="method-heading"><SectionReveal>
    <h2 id="method-heading" className="t-label section-label">{METHOD.label}</h2>
    <div className="index-list">{METHOD.items.map((item, i) => <div className="index-row method-row" key={item.title} style={{ "--row-index": i } as React.CSSProperties}>
      <span className="t-label index-number">{String(i + 1).padStart(2, "0")}</span><h3 className="t-title">{item.title}</h3><p className="t-body section-body">{item.body}</p>
    </div>)}</div>
  </SectionReveal></section>;
}
