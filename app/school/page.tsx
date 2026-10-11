import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/page-transition";
import { SCHOOL } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { SplitFlap } from "@/components/ui/split-flap";
import { SchoolBanner, CourseTree } from "@/components/school-terminal";

export const metadata: Metadata = { title: SCHOOL.label, description: SCHOOL.lead };

export default function School() {
  return <main id="main" className="school-page">
    <section className="home-section page-hero"><GradientMesh place="school" /><SectionReveal>
      <p className="t-label section-label"><SplitFlap text={SCHOOL.label} /></p>
      <SchoolBanner lines={SCHOOL.lines} />
      <h1 className="t-display-l section-heading" aria-label={SCHOOL.lines.join(" ")}>{SCHOOL.lines.map((line, i) => <span className="section-line" aria-hidden="true" key={line} style={{ "--line-index": i } as React.CSSProperties}><span>{line}</span></span>)}</h1>
      <p className="t-body section-body">{SCHOOL.lead}</p>
      <dl className="hero-facts page-facts">{SCHOOL.facts.map(fact => <div key={fact.label}><dt className="t-label">{fact.label}</dt><dd className="t-small">{fact.value}</dd></div>)}</dl>
    </SectionReveal></section>
    <section className="home-section"><SectionReveal><div className="index-list">{SCHOOL.sections.map(section => <div className="index-row school-section-row" key={section.title}>
      <p className="t-label">{section.label}</p><h2 className="t-title">{section.title}</h2><p className="t-body section-body">{section.body}</p>
    </div>)}</div></SectionReveal></section>
    <section className="home-section" aria-labelledby="courses-heading"><SectionReveal>
      <h2 id="courses-heading" className="t-label section-label">{SCHOOL.coursesLabel}</h2>
      <CourseTree label={SCHOOL.coursesLabel} groups={SCHOOL.courses} />
    </SectionReveal><Link href="/" className="back-link t-small">{SCHOOL.back}</Link></section>
  </main>;
}
