"use client";

import { useEffect, useRef, useState } from "react";
import { CONTACT, FOOTER, SITE } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";
import { GlyphPit } from "./glyph-pit";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };
  return <section id="contact" className="home-section contact" aria-labelledby="contact-heading">
    <SectionReveal>
      <h2 id="contact-heading" className="t-display-xl section-heading" aria-label={CONTACT.lines.join(" ")}>{CONTACT.lines.map((line, i) => <span className="section-line" aria-hidden="true" key={line} style={{ "--line-index": i } as React.CSSProperties}><span>{line}</span></span>)}</h2>
      <p className="t-body section-body">{CONTACT.body}</p>
      <div className="contact-actions">
        <button className="contact-pill email-copy t-small" type="button" aria-label={copied ? CONTACT.copied : CONTACT.copy} onClick={copy}><span aria-live="polite">{copied ? CONTACT.copied : SITE.email}</span></button>
        <a className="contact-mailto t-small" href={`mailto:${SITE.email}`}>{CONTACT.mail}</a>
      </div>
      <div className="contact-socials t-small">{SITE.links.filter(link => link.href).map(link => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>)}</div>
      <p className="t-body section-body">{CONTACT.availability}</p>
    </SectionReveal>
    <GlyphPit />
    <footer className="site-footer t-small"><span>{FOOTER.copyright}</span><span>{FOOTER.made}</span><a href="#main">{FOOTER.top}</a></footer>
  </section>;
}
