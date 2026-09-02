import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Currently } from "@/components/sections/currently";
import { Education } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { SiteFooter } from "@/components/sections/site-footer";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { SiteHeader } from "@/components/ui/site-header";

/*
  Section order, and why it is this one.

  Experience sits above Selected work deliberately. The site has to serve a
  recruiter filling an internship, a dealership owner, and a freelance
  client at the same time, and the only fact that lands with all three is
  that he co-runs a business with paying clients and is taking over a
  factory. A recruiter's eye also goes hunting for an experience section
  first and gives up quickly when there is not one.

  Off the clock is the single warm section, and it sits late on purpose: by
  the time the ground turns to paper the reader already knows what he has
  built, so the personal material reads as a person rather than as padding.
*/
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <Hero />
        <Currently />
        <Experience />
        <Work />
        <Skills />
        <Education />
        <About />
        <Contact />
      </main>

      <SiteFooter />
    </>
  );
}
