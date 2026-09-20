import Reveal from "@/components/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SocialIcon } from "@/components/ui/social-icon";
import { ScrollTilt } from "@/components/ui/scroll-tilt";
import { CONTACT, SITE, type ContactLink } from "@/lib/content";

// A null href means the channel has no destination yet (WhatsApp before
// Adnan supplies a number was the original case). Never render a dead link,
// a disabled row, or a placeholder for it: skip the entry entirely.
function hasHref(link: ContactLink): link is ContactLink & { href: string } {
  return link.href !== null;
}

export function Contact() {
  const channels = SITE.links.filter(hasHref);

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <SectionHeading id="contact-heading" eyebrow={CONTACT.eyebrow}>
        {CONTACT.headline}
      </SectionHeading>

      <Reveal>
        <p className="mt-[var(--space-6)] max-w-[var(--measure)] text-[length:var(--step-1)] text-ink-muted">
          {CONTACT.body}
        </p>
      </Reveal>

      <ul className="mt-[var(--space-10)] grid gap-[var(--space-4)] lg:grid-cols-3">
        {CONTACT.openers.map((opener, index) => (
          <li key={opener.label} className="min-w-0">
            <Reveal delay={index * 70} className="h-full">
              <ScrollTilt tilt={false} className="h-full">
                <a
                  href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(opener.label)}`}
                  aria-labelledby={`contact-opener-${index}`}
                  className="group relative flex h-full flex-col rounded-[var(--radius-lg)] bg-surface-1 p-[var(--space-6)] shadow-[var(--shadow-float)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[var(--ease)] motion-safe:active:scale-[0.985]"
                >
                  <h3 id={`contact-opener-${index}`} className="pr-[var(--space-8)] text-[length:var(--step-1)] font-semibold">{opener.label}</h3>
                  <p className="mt-[var(--space-4)] text-ink-muted">{opener.body}</p>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute top-[var(--space-6)] right-[var(--space-6)] size-5 text-ink-muted group-hover:text-ink">
                    <path d="M6 18 18 6M6 6h12v12" />
                  </svg>
                </a>
              </ScrollTilt>
            </Reveal>
          </li>
        ))}
      </ul>

      <p className="mt-[var(--space-8)] max-w-[var(--measure)] text-ink-muted">{CONTACT.availability}</p>

      <Reveal>
        <a
          href={`mailto:${CONTACT.email}`}
          className="press mt-[var(--space-8)] inline-block max-w-full break-all rounded-[var(--radius-pill)] bg-accent px-[var(--space-6)] py-[var(--space-4)] font-display text-[length:var(--step-0)] font-semibold text-canvas hover:bg-accent-deep hover:text-white"
        >
          {CONTACT.email}
        </a>
      </Reveal>

      <Reveal>
        <ul className="mt-[var(--space-10)] grid gap-[var(--space-4)] sm:grid-cols-2">
          {channels.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="press group flex items-center gap-[var(--space-4)] rounded-[var(--radius-md)] border border-hairline px-[var(--space-5)] py-[var(--space-4)] transition-colors hover:border-accent"
                >
                  <SocialIcon
                    name={link.icon}
                    className="size-[20px] shrink-0 text-ink-muted transition-colors group-hover:text-ink"
                  />
                  <span className="text-[length:var(--step-0)] text-ink-muted transition-colors group-hover:text-ink">
                    {link.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
