"use client";

/*
  The fixed header. Only reason this is a client component and not the
  markup that used to sit directly in app/page.tsx: it needs to know when
  the warm About section is behind it, which needs an observer, which needs
  a browser.

  Known cosmetic issue this fixes, from NEXT-SESSION.md: the header kept its
  dark translucent background over the warm paper section.
*/

import { useEffect, useState } from "react";
import { SITE } from "@/lib/content";

export function SiteHeader() {
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const about = document.getElementById("about");
    if (!about || typeof IntersectionObserver === "undefined") return;

    // rootMargin shrinks the observed root down to roughly the header's own
    // band at the top of the viewport. A fixed header sits outside normal
    // flow, so there is no element height to derive a real margin from; this
    // reads correctly at any header height or content length without a
    // resize listener, which comparing scrollY against a measured offset
    // would need. The header flips warm exactly while #about occupies that
    // band, and flips back the moment it scrolls past it, in either
    // direction.
    const io = new IntersectionObserver(([entry]) => setWarm(entry.isIntersecting), {
      threshold: 0,
      rootMargin: "0px 0px -92% 0px",
    });
    io.observe(about);
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/*
        No position utility on this inner element. [data-tone="warm"] in
        globals.css sets `position: relative` unlayered, which outranks a
        Tailwind position utility on the same element regardless of
        specificity (see the comment block near the top of globals.css). The
        outer <header> above already carries the fixed positioning, so this
        div only needs to fill it, which needs no position of its own.
      */}
      {/*
        bg-canvas/80 stays translucent in the dark state, unchanged from
        before. In the warm state the unlayered `[data-tone] { background:
        var(--canvas) }` rule in globals.css (see its own comment) outranks
        that utility's alpha value and the header goes fully opaque instead.
        Still legible, still an eased transition on the same property, just
        solid rather than glassy while it sits over the paper section.
      */}
      <div
        data-tone={warm ? "warm" : undefined}
        className="tone-surface border-b border-hairline/60 bg-canvas/80 backdrop-blur transition-colors duration-[var(--dur-base)] ease-[var(--ease)]"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[var(--content-max)] items-center justify-between px-[var(--gutter)] py-[var(--space-4)]"
        >
          <a
            href="#main"
            className="font-display text-[length:var(--step-0)] font-semibold tracking-[-0.02em]"
          >
            {SITE.name}
          </a>
          <a href={`mailto:${SITE.email}`} className="press label transition-colors hover:text-ink">
            Email
          </a>
        </nav>
      </div>
    </header>
  );
}
