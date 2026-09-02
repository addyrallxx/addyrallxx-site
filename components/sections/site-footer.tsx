import Reveal from "@/components/reveal";
import { FOOTER, SITE } from "@/lib/content";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-hairline">
      <Reveal>
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-[var(--space-4)] px-[var(--gutter)] py-[var(--space-10)] sm:flex-row sm:items-center sm:justify-between">
          <p className="data text-ink-subtle">
            {FOOTER.line} {"·"} {year}
          </p>
          <ul className="flex flex-wrap gap-[var(--space-6)]">
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
        </div>
      </Reveal>
    </footer>
  );
}
