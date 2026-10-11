import { FAQ } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";

export function Questions() {
  if (!FAQ.items.length) return null;
  return <section id="questions" className="home-section" aria-labelledby="questions-heading">
    <h2 id="questions-heading" className="t-label section-label"><SplitFlap text={FAQ.label} /></h2>
    {FAQ.items.map(item => <details className="question" key={item.q}><summary className="t-title">{item.q}</summary><p className="t-body">{item.a}</p></details>)}
  </section>;
}
