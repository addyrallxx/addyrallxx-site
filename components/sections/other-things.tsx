import { TransitionLink as Link } from "@/components/page-transition";
import { OTHER } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";
import Image from "next/image";
import "./other-things.css";

// Reference B clip 8: a compact spread of objects between display words.
export function OtherThings() {
  return <section className="home-section" aria-label={OTHER.label}>
    <SectionReveal><div className="other-gallery">
      <h2 className="t-display-l">{OTHER.left} {OTHER.right}</h2>
      <div className="other-grid">{OTHER.items.map(item => <Link href={item.href} prefetch={false} className="other-card" key={item.name}>
        <div className="other-image"><Image src={item.image} alt="" width={1672} height={940} quality={90} sizes="(min-width: 900px) 32vw, 100vw" /></div>
        <div className="other-copy"><h3 className="t-title">{item.name}</h3><p className="t-small">{item.line}</p></div>
      </Link>)}</div>
    </div></SectionReveal>
  </section>;
}
