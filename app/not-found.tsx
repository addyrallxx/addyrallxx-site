import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/page-transition";
import { SCHOOL, SITE } from "@/lib/content";

export const metadata: Metadata = { title: "404", description: SITE.description };

export default function NotFound() {
  return <main id="main" className="home-section page-hero">
    <h1 className="t-display-l">404</h1>
    <Link className="back-link t-small" href="/">{SCHOOL.back}</Link>
  </main>;
}
