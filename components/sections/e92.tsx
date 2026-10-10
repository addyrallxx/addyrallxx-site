import Image from "next/image";
import { CAR } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";
import { Tach } from "./tach";

export function E92() {
  return <section id="e92" className="home-section e92" aria-labelledby="e92-heading"><SectionReveal>
    <span className="m-stripe e92-stripe" aria-hidden="true"><span /><span /><span /></span>
    <p className="t-label section-label">{CAR.label}</p>
    <h2 id="e92-heading" className="t-display-l section-heading" aria-label={CAR.lines.join(" ")}>{CAR.lines.map((line, i) => <span className="section-line" aria-hidden="true" key={line} style={{ "--line-index": i } as React.CSSProperties}><span>{line}</span></span>)}</h2>
    <h3 className="t-title">{CAR.title}</h3><p className="t-body section-body car-lead">{CAR.lead}</p>
    <div className="editorial-grid e92-grid">
      <div className="car-images">
        <div className="image-treatment car-bay"><Image src="/e92/bay-wide.jpg" alt={`${CAR.title}, engine bay`} width={1800} height={1012} sizes="(max-width: 719px) 100vw, 58vw" loading="lazy" /></div>
        <div className="image-treatment car-night"><Image src="/e92/night.jpg" alt={`${CAR.title}, night profile`} width={1800} height={814} sizes="(max-width: 719px) 100vw, 29vw" loading="lazy" /></div>
        <div className="image-treatment car-front"><Image src="/e92/front.jpg" alt={`${CAR.title}, front three quarter`} width={1200} height={1502} sizes="(max-width: 719px) 100vw, 29vw" loading="lazy" /></div>
      </div>
      <div className="car-instrument"><Tach /><dl className="car-specs t-small">{CAR.specs.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></div>
    </div>
    <p className="t-title car-signoff">{CAR.signOff}</p>
  </SectionReveal></section>;
}
