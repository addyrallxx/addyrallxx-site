import { INFO } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";
import { SectionReveal } from "@/components/ui/section-reveal";

export function Info() {
  return <section id="info" className="home-section" aria-labelledby="info-heading"><SectionReveal>
    <h2 id="info-heading" className="t-label section-label"><SplitFlap text={INFO.label} /></h2>
    <div className="editorial-grid info-grid">
      <p className="t-body section-body info-bio">{INFO.bio}</p>
      <div className="info-lists">{INFO.lists.map(list => <div key={list.label}><h3 className="t-label">{list.label}</h3><ul>{list.items.map(item => <li className="t-small" key={item}>{item}</li>)}</ul></div>)}</div>
    </div>
  </SectionReveal></section>;
}
