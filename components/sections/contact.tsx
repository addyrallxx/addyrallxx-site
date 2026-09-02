import Reveal from "@/components/reveal";
import { CONTACT, SITE } from "@/lib/content";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <Reveal>
        <p className="label">
          <span className="label-index">07</span>
          <span className="mx-[var(--space-3)] text-hairline-strong">/</span>
          {CONTACT.eyebrow}
        </p>
      </Reveal>

      <Reveal>
        <h2 id="contact-heading" className="mt-[var(--space-6)] max-w-[16ch] text-[length:var(--step-4)]">
          {CONTACT.headline}
        </h2>
      </Reveal>

      <Reveal>
        <p className="mt-[var(--space-6)] max-w-[var(--measure)] text-[length:var(--step-1)] text-ink-muted">
          {CONTACT.body}
        </p>
      </Reveal>

      <Reveal>
        <a
          href={`mailto:${CONTACT.email}`}
          className="press mt-[var(--space-10)] inline-block rounded-[var(--radius-pill)] bg-accent px-[var(--space-8)] py-[var(--space-4)] font-display text-[length:var(--step-0)] font-semibold text-white transition-colors hover:bg-accent-deep"
        >
          {CONTACT.email}
        </a>
      </Reveal>

      <Reveal>
        <ul className="mt-[var(--space-10)] flex flex-wrap gap-[var(--space-6)]">
          {SITE.links.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="press label hover:text-ink"
                  style={{ transitionProperty: "color" }}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
