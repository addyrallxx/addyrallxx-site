import type { Metadata } from "next";
import { Archivo, Manrope, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import SmoothScroll from "@/components/smooth-scroll";
import { Preloader } from "@/components/ui/preloader";
import { Starfield } from "@/components/ui/starfield";
import "./globals.css";

/*
  Four faces, each with one job, and none of them Inter.

  Archivo is the display face: an industrial grotesque with a width axis,
  which is what lets a hero headline sit at 112px without looking like a
  system font scaled up. Manrope carries body text, geometric enough to
  pair with Archivo and warm enough to read at length. Instrument Serif
  appears only inside the warm paper section, where it replaces Archivo for
  headings and does half the work of the tonal break. JetBrains Mono is for
  figures, tags and labels, never for prose.
*/
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// One description string, declared once. It was written out twice, so the
// two copies could drift apart silently.
const DESCRIPTION =
  "Computer science at the University of Calgary. I co-run Puzzled, which runs the online side of more than seven Calgary dealerships, and I built the order system TotalTex runs on in Dhaka.";
export const metadata: Metadata = {
  metadataBase: new URL("https://addyrallxx-site.vercel.app"),
  title: {
    default: "Adnan Shakib",
    template: "%s | Adnan Shakib",
  },
  description:
    DESCRIPTION,
  openGraph: {
    title: "Adnan Shakib",
    description:
      DESCRIPTION,
    type: "website",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // No "js" class, and no noscript counter-rule.
    //
    // Both used to exist so scroll reveals could start hidden from the very
    // first paint. The problem was that the hidden state applied before any
    // JavaScript had proven it could run, so a failed hydration or a dropped
    // chunk left every section at opacity 0 on top of correct server
    // rendered markup. The noscript rule did not help, because scripting was
    // enabled, it had just failed. Reveal now arms the hidden state itself
    // on mount, so the page fails open. See components/reveal.tsx.
    <html lang="en">
      <body
        className={`${archivo.variable} ${manrope.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-surface-2 focus:px-4 focus:py-2 focus:font-mono focus:text-[length:var(--step--1)] focus:text-ink"
        >
          Skip to content
        </a>
        {/*
          Lenis is mounted now. The previous build deliberately left it out
          because the Three.js world already eased toward the scroll target
          at 0.05 per frame, so smoothing the scroll underneath that damped
          the motion twice and made the world lag the wheel. That world has
          been deleted, so the conflict is gone and the component finally
          does the job it was ported for. It no-ops under reduced motion.
        */}
        <SmoothScroll />
        {/*
          Fixed, z-index -1, aria-hidden: a background layer, not a gate.
          html carries the page background and body stays transparent (see
          the comment above the html rule in globals.css), so this paints
          visibly behind every in-flow section instead of being painted over
          by an opaque body. Do not change its z-index to "fix" a stacking
          problem: if it ever goes invisible again the bug is a background
          reappearing on body or html, not this element.
        */}
        <Starfield />
        {/*
          An overlay, never a gate: children are server rendered right here
          underneath it on every load, preloader or not. Preloader decides
          for itself whether to show (see the reduced-motion and
          sessionStorage checks inside it) and never controls this tree.
        */}
        <Preloader />
        {children}
      </body>
    </html>
  );
}
