import { SERVICES } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

export function Services() {
  return <section className="home-section services" aria-labelledby="services-heading"><SectionReveal>
    <h2 className="t-display-l section-heading" id="services-heading" aria-label={SERVICES.lines.join(" ")}>{SERVICES.lines.map((line, i) => <span className="section-line" key={line} aria-hidden="true" style={{ "--line-index": i } as React.CSSProperties}><span>{line}</span></span>)}</h2>
    <div className="index-list">{SERVICES.items.map((item, i) => <div className="index-row service-row" key={item.name} style={{ "--row-index": i } as React.CSSProperties}>
      <span className="t-label index-number">{String(i + 1).padStart(2, "0")}</span><h3 className="t-title">{item.name}</h3><p className="t-body section-body">{item.line}</p>
    </div>)}</div>
    <a className="contact-pill t-small" href="#contact">{SERVICES.cta}</a>
  </SectionReveal></section>;
}
