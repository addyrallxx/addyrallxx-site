import { TransitionLink as Link } from "@/components/page-transition";
import { OTHER } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

export function OtherThings() {
  return <section className="home-section" aria-label={OTHER.label}>
    <SectionReveal><Link href="/work" prefetch={false} className="other-band" aria-label={`${OTHER.left} ${OTHER.right}`}>
      <h2 className="t-display-l section-line" aria-label={`${OTHER.left} ${OTHER.right}`}><span aria-hidden="true">{OTHER.left}</span></h2>
      <div className="card-fan" aria-hidden="true">
        {OTHER.items.map(item => <div className="fan-card fan-type" key={item.name} title={item.line}>
          <p className="t-title">{item.name}</p>
        </div>)}
      </div>
      <h2 className="t-display-l section-line" aria-hidden="true"><span>{OTHER.right}</span></h2>
    </Link></SectionReveal>
  </section>;
}
