import Reveal from "@/components/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SocialIcon } from "@/components/ui/social-icon";
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

      <Reveal>
        <a
          href={`mailto:${CONTACT.email}`}
          className="press mt-[var(--space-10)] inline-block rounded-[var(--radius-pill)] bg-accent px-[var(--space-8)] py-[var(--space-4)] font-display text-[length:var(--step-0)] font-semibold text-canvas transition-colors hover:bg-accent-deep hover:text-white"
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
