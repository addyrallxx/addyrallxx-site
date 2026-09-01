import type { ReactNode } from "react";
import Reveal from "@/components/reveal";
import { WordReveal } from "@/components/story/word-reveal";
import type { ChapterId } from "@/lib/world/types";
import { CalgaryTime } from "./calgary-time";

const BODY_CLASS = "text-[length:var(--step-0)] text-paper-1";
const SUBHEAD_CLASS =
  "text-[length:var(--step-1)] text-paper-0";
const CODE_CLASS = "font-mono text-paper-0";
const LINK_CLASS =
  "rounded-sm text-paper-0 underline decoration-signal underline-offset-4 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal";

function ChapterPanel({
  headingId,
  headline,
  subhead,
  arrival = false,
  children,
}: {
  headingId: string;
  headline: string;
  subhead?: string;
  arrival?: boolean;
  children: ReactNode;
}) {
  return (
    <Reveal
      immediate={arrival}
      className="flex w-full max-w-[640px] flex-col gap-[var(--space-6)] rounded-sm border border-ink-3 bg-ink-0/70 p-[var(--space-5)] backdrop-blur-sm md:p-[var(--space-8)]"
    >
      {arrival ? (
        <h1
          id={headingId}
          className="text-balance font-sans text-[length:var(--step-4)] leading-[1.1] tracking-[-0.02em] text-paper-0"
        >
          {headline}
        </h1>
      ) : (
        <h2
          id={headingId}
          className="text-balance font-sans text-[length:var(--step-3)] text-paper-0"
        >
          <WordReveal text={headline} />
        </h2>
      )}
      {subhead ? <p className={SUBHEAD_CLASS}>{subhead}</p> : null}
      {children}
    </Reveal>
  );
}

function EvidenceList({ children }: { children: ReactNode }) {
  return (
    <ul
      className={`${BODY_CLASS} flex list-disc flex-col gap-[var(--space-3)] pl-[var(--space-6)] marker:text-signal`}
    >
      {children}
    </ul>
  );
}

function FieldNote({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-[var(--space-4)] border-t border-ink-3 pt-[var(--space-6)]">
      <h3 className="font-sans text-[length:var(--step-1)] text-paper-0">
        {title}
      </h3>
      {children}
    </article>
  );
}

export function ChapterContent({
  chapterId,
  headingId,
}: {
  chapterId: ChapterId;
  headingId: string;
}) {
  switch (chapterId) {
    case "arrival":
      return (
        <ChapterPanel
          arrival
          headingId={headingId}
          headline="I build the software two businesses actually run on."
          subhead="Order management for a garment factory in Dhaka. Listing automation for four Calgary dealerships. Computer science at the University of Calgary."
        >
          <p className={BODY_CLASS}>
            Two continents, two real businesses, and code running in production
            on both. Every claim below traces to a repository, a live URL, or a
            running system.
          </p>
        </ChapterPanel>
      );

    case "ground":
      return (
        <ChapterPanel
          headingId={headingId}
          headline="Calgary now. Dhaka first."
          subhead="Studying computer science at the University of Calgary, and running the technical half of a Calgary business while doing it."
        >
          <p className={BODY_CLASS}>
            Studying in Canada as a Bangladeshi citizen. One system runs against
            a garment factory in Dhaka. The other runs against four dealerships
            in this city. Both are in production, and both are used by people
            who did not ask for software, they asked for their work to get done.
          </p>
        </ChapterPanel>
      );

    case "totaltex":
      return (
        <ChapterPanel
          headingId={headingId}
          headline="Built the order system a Dhaka factory runs on."
          subhead="Order to job card to proforma invoice to production to delivery challan to bill. Eleven tables, with the reasoning for each decision written inline in the schema."
        >
          <p className={BODY_CLASS}>
            Generic ERPs model a product as a variant of a variant. A garment
            accessories factory needs a spec sheet per product line. That spec
            has to drive the data entry form and the printed description on the
            invoice at the same time. So one typed template generates both. That
            decision is the reason this is not a configured Odoo instance.
          </p>

          <EvidenceList>
            <li>
              95 source files, 12,501 lines, 27 commits, TypeScript strict
              throughout.
            </li>
            <li>
              <code className={CODE_CLASS}>lib/spec-templates.ts</code> is 186
              lines. One typed template drives both the form and the printed
              description string.
            </li>
            <li>
              Money and quantity are <code className={CODE_CLASS}>numeric</code>,
              never float. Challan and bill lines snapshot rather than join, so
              a later price edit cannot rewrite a delivered document.
            </li>
            <li>
              Job numbers start at 10000, so any number in the wild provably
              came from the software.
            </li>
            <li>
              bcrypt at cost 12, with a dummy hash compare that closes the
              account existence timing oracle. Lockout is per account, ten
              attempts per fifteen minutes, deliberately not per IP because the
              office shares one NAT.
            </li>
            <li>
              21 runnable assertions across four check scripts, standing in for
              CI. There is no build server, so the checks run by hand before
              anything ships.
            </li>
          </EvidenceList>

          <div className="flex flex-col gap-[var(--space-4)] border-t border-ink-3 pt-[var(--space-6)]">
            <p className={BODY_CLASS}>
              <code className={CODE_CLASS}>updateJob</code> deleted and
              reinserted job lines on every edit. The edit form never submitted{" "}
              <code className={CODE_CLASS}>job_item.id</code>, so a cascading
              foreign key silently erased recorded production. Nobody reported
              it. I found it reading my own schema.
            </p>
            <p className={BODY_CLASS}>
              Fixed with a diff based update, and the foreign key changed to
              RESTRICT so the database refuses that shape of mistake even if the
              next bug reintroduces it.
            </p>
          </div>

          <p className="border-t border-ink-3 pt-[var(--space-6)] text-[length:var(--step-0)] text-paper-0">
            Nine of eleven spec templates are still unbuilt. Daily production
            entry is not built. Tally integration is designed and not written.
            This runs a real factory and it is not finished.
          </p>
        </ChapterPanel>
      );

    case "puzzled":
      return (
        <ChapterPanel
          headingId={headingId}
          headline="Wrote the automation behind a Calgary listing business."
          subhead="7,313 lines of Python on a scheduled task, three times a day, against four Calgary-area dealerships."
        >
          <p className={BODY_CLASS}>
            Vehicle listings are regulated advertising. Being wrong is not a
            user experience problem, it is an AMVIC problem. The generator
            states only facts present in the scraped record. It picks a sales
            angle from those facts, then attaches the disclaimer the
            jurisdiction requires. Constrained generation, because the
            constraint is the law.
          </p>

          <EvidenceList>
            <li>
              A scraper reads each client&apos;s own public inventory across three
              vendor platforms, including gallery photos.
            </li>
            <li>
              287 of 335 descriptions generated at zero API cost, because the
              rules do the work instead of a model.
            </li>
            <li>
              Audited 1,069 real descriptions against AMVIC advertising
              regulation. It surfaced two live violations that predated the
              software.
            </li>
            <li>
              Found a caching bug in production: 58 vehicles were no longer live
              and 38 price changes had been missed.
            </li>
          </EvidenceList>
        </ChapterPanel>
      );

    case "field-notes":
      return (
        <ChapterPanel
          headingId={headingId}
          headline="Three more things that shipped."
        >
          <FieldNote title="TotalTex Web">
            <p className={BODY_CLASS}>
              Live at{" "}
              <a className={LINK_CLASS} href="https://totaltex-bd.com">
                totaltex-bd.com
              </a>{" "}
              since August 2026, on its own domain. 83 files, 11,506 lines, and
              383 real production photographs.
            </p>
            <p className={BODY_CLASS}>
              The structured data was emitting{" "}
              <code className={CODE_CLASS}>&quot;@type&quot;: &quot;Factory&quot;</code>.
              That type does not exist in schema.org. The address, geo, opening
              hours and phone had been worth nothing to Google since the day it
              launched. Found by systematic audit, not by luck.
            </p>
          </FieldNote>

          <FieldNote title="FitTrack">
            <p className={BODY_CLASS}>
              <a
                className={LINK_CLASS}
                href="https://addyrallxx.github.io/fittrack/fittrack.html"
              >
                A workout and nutrition tracker you can open right now.
              </a>{" "}
              It installs to a phone home screen and works with no signal.
            </p>
            <p className={BODY_CLASS}>
              The constraint was that it stay one file with no build step, so it
              can be hosted anywhere and still run years from now. That costs
              modularity and it buys permanence. 6,110 lines of vanilla
              JavaScript, nutrition data from Open Food Facts, weight history in
              Chart.js, offline through a service worker.
            </p>
          </FieldNote>

          <FieldNote title="The working system">
            <p className={BODY_CLASS}>
              Every claim in my notes carries an evidence grade: confirmed,
              unverified, hypothesis, obsolete. That system caught an earlier AI
              handover inventing revenue figures and a client count, and forced
              the retraction.
            </p>
            <p className={BODY_CLASS}>
              A knowledge base that catches its own hallucinations is worth more
              than a list of frameworks.
            </p>
          </FieldNote>
        </ChapterPanel>
      );

    case "contact":
      return (
        <ChapterPanel
          headingId={headingId}
          headline="Dhaka to Calgary, and open to what is next."
        >
          <p className={BODY_CLASS}>
            Studying in Calgary, Alberta. Bangladeshi citizen. The one route I
            actually fly is Calgary to Dhaka every May through August, via Doha
            or Istanbul, because no direct flight exists.
          </p>

          <aside
            aria-label="Globe legend"
            className="flex flex-col gap-[var(--space-4)] border-t border-ink-3 pt-[var(--space-6)]"
          >
            <dl className={`${BODY_CLASS} grid gap-[var(--space-2)]`}>
              <div className="flex flex-wrap gap-x-[var(--space-2)]">
                <dt className="text-paper-0">Origin:</dt>
                <dd>Dhaka, Bangladesh.</dd>
              </div>
              <div className="flex flex-wrap gap-x-[var(--space-2)]">
                <dt className="text-paper-0">Present:</dt>
                <dd>Calgary, Alberta. University of Calgary.</dd>
              </div>
            </dl>
            <p className={BODY_CLASS}>
              The wider network on this globe is TotalTex&apos;s buyer reach
              across 54 apparel brands. That is the company&apos;s supply chain,
              not my passport.
            </p>
          </aside>

          <address className="border-t border-ink-3 pt-[var(--space-6)] not-italic">
            <a
              className={`${LINK_CLASS} font-mono text-[length:var(--step-0)]`}
              href="mailto:adnanshakib888@gmail.com"
            >
              adnanshakib888@gmail.com
            </a>
          </address>

          <CalgaryTime />
        </ChapterPanel>
      );
  }
}
