import type { Metadata } from "next";
import { OTHER, WORK_LABEL, WORK } from "@/lib/content";
import { Work } from "@/components/sections/work";
import { SectionReveal } from "@/components/ui/section-reveal";

export const metadata: Metadata = { title: WORK_LABEL, description: WORK.map(project => project.line).join(" ") };

export default function WorkPage() {
  return <main id="main" className="work-page">
    <section className="home-section page-hero"><SectionReveal><h1 className="t-display-l section-heading" aria-label={WORK_LABEL}><span className="section-line"><span>{WORK_LABEL}</span></span></h1></SectionReveal></section>
    <Work showLabel={false} />
    <section className="home-section" aria-labelledby="smaller-heading"><SectionReveal>
      <h2 id="smaller-heading" className="t-label section-label">{OTHER.label}</h2>
      <div className="index-list">{OTHER.items.map((item, i) => <div className="index-row smaller-row" key={item.name}><span className="t-label index-number">{String(i + 1).padStart(2, "0")}</span><h3 className="t-title">{item.name}</h3><p className="t-body section-body">{item.line}</p></div>)}</div>
    </SectionReveal></section>
  </main>;
}
