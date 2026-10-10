import Image from "next/image";
import Link from "next/link";
import { OTHER } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

export function OtherThings() {
  return <section className="home-section" aria-label={OTHER.label}>
    <SectionReveal><Link href="/work" prefetch={false} className="other-band">
      <h2 className="t-display-l section-line" aria-label={OTHER.left}><span aria-hidden="true">{OTHER.left}</span></h2>
      <div className="card-fan">
        {OTHER.items.map(item => <div className={`fan-card ${item.image ? "fan-photo" : "fan-type"}`} key={item.name}>
          {item.image ? <><div className="image-treatment"><Image src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 1440px) 168px, 120px" /></div><span className="car-stripe m-stripe" aria-hidden="true"><span /><span /><span /></span></> : <><p className="t-title">{item.name}</p><p className="t-small">{item.line}</p></>}
        </div>)}
      </div>
      <h2 className="t-display-l section-line" aria-label={OTHER.right}><span aria-hidden="true">{OTHER.right}</span></h2>
    </Link></SectionReveal>
  </section>;
}
