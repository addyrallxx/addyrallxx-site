import type { Metadata } from "next";
import Image from "next/image";
import { TransitionLink as Link } from "@/components/page-transition";
import { notFound } from "next/navigation";
import { FOOTER, WORK } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

export const dynamicParams = false;
export function generateStaticParams() { return WORK.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = WORK.find(item => item.slug === slug);
  return project ? { title: project.name, description: project.lead } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = WORK.findIndex(item => item.slug === slug);
  if (index < 0) notFound();
  const project = WORK[index], next = WORK[(index + 1) % WORK.length];
  // NEXT-SESSION.md withholds FitTrack links until its history cleanup is confirmed.
  const liveLink = project.slug === "fittrack" ? undefined : project.link;
  return <main id="main" className="project-page" data-project={project.slug}>
    <section className="home-section page-hero"><SectionReveal>
      <h1 className="t-display-l section-heading" aria-label={project.name}><span className="section-line"><span>{project.name}</span></span></h1>
      <ul className="project-meta t-small"><li>{project.kind}</li><li>{project.year}</li><li>{project.stack.join(", ")}</li><li>{liveLink ? <a href={liveLink.href} target="_blank" rel="noopener noreferrer">{liveLink.label}</a> : project.status}</li></ul>
      <p className="t-body section-body">{project.lead}</p>
    </SectionReveal></section>
    {project.images[0] && <div className="project-cover"><Image src={project.images[0].src} alt={project.images[0].alt} fill sizes="100vw" priority /></div>}
    <section className="home-section"><SectionReveal><ul className="project-does">{project.does.map(line => <li className="t-body section-body" key={line}>{line}</li>)}</ul></SectionReveal></section>
    {project.images.length > 1 && <div className="home-section project-images">{project.images.slice(1).map(image => <div className="project-image" key={image.src}><Image src={image.src} alt={image.alt} fill sizes="(max-width: 719px) 100vw, 50vw" /></div>)}</div>}
    <section className="home-section"><Link className="next-project" href={`/work/${next.slug}`}><span className="t-label">{FOOTER.next}</span><span className="t-display-l">{next.name}</span></Link></section>
  </main>;
}
