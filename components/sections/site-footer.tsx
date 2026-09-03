import Reveal from "@/components/reveal";
import { FOOTER, SITE, type ContactLink } from "@/lib/content";

// Same rule as components/sections/contact.tsx: a null href has nowhere to
// go, so the channel is skipped here too rather than rendered as a dead link.
function hasHref(link: ContactLink): link is ContactLink & { href: string } {
  return link.href !== null;
}

export function SiteFooter() {
  const channels = SITE.links.filter(hasHref);
  return (
    <footer className="border-t border-hairline">
      <Reveal>
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-[var(--space-6)] px-[var(--gutter)] py-[var(--space-10)]">
          <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
            <p className="data text-ink-subtle">
              {FOOTER.line} {"·"} {FOOTER.year}
            </p>
            <ul className="flex flex-wrap gap-[var(--space-6)]">
              {channels.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <li key={link.label}>
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
          </div>
          {/* The trademark line Adnan asked for. Quiet on purpose: same
              .data token recipe as the line above (font-mono, ink-subtle),
              no border, no emphasis. FOOTER.signature is the only source of
              this string. */}
          <p className="data text-ink-subtle">{FOOTER.signature}</p>
        </div>
      </Reveal>
    </footer>
  );
}
