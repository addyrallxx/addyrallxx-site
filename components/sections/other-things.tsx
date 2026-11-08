import { TransitionLink as Link } from "@/components/page-transition";
import { OTHER } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";
import Image from "next/image";
import "./other-things.css";

// Original three-piece composition, with photographic faces.
export function OtherThings() {
  return <section className="home-section other-gallery" aria-label={OTHER.label}>
    <SectionReveal><Link href="/work" prefetch={false} className="other-band" data-cursor="View" aria-label={OTHER.left + " " + OTHER.right}>
      <h2 className="t-display-l" aria-label={OTHER.left + " " + OTHER.right}><span aria-hidden="true">{OTHER.left}</span></h2>
      <div className="fan-composition">
        <div className="card-fan" aria-hidden="true"><div className="fan-depth">{OTHER.items.map(item => <div className="fan-card" key={item.name}><div className="fan-face"><Image src={item.image} alt="" width={item.width} height={item.height} quality={90} sizes="260px" /></div></div>)}</div></div>
        <div className="fan-captions t-small" aria-hidden="true"><span>{OTHER.label}</span><span>{OTHER.items.map(item => item.name).join(" / ")}</span></div>
      </div>
      <span className="t-display-l" aria-hidden="true">{OTHER.right}</span>
    </Link></SectionReveal>
    <ul className="fan-links">{OTHER.items.map(item => <li key={item.name}><Link href={item.href} prefetch={false} className="sr-only" data-cursor="View">{item.name}</Link></li>)}</ul>
  </section>;
}
