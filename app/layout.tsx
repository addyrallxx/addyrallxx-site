import type { Metadata } from "next";
import { Archivo, Manrope, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import SmoothScroll from "@/components/smooth-scroll";
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

// Working metadata. Final wording lands with the rest of the copy in chunk 1.
export const metadata: Metadata = {
  metadataBase: new URL("https://addyrallxx-site.vercel.app"),
  title: {
    default: "Adnan Shakib",
    template: "%s | Adnan Shakib",
  },
  description:
    "Computer science at the University of Calgary. I co-run Puzzled, which handles vehicle listings for four Calgary-area dealerships, and I built the order system TotalTex runs on in Dhaka.",
  openGraph: {
    title: "Adnan Shakib",
    description:
      "Computer science at the University of Calgary. I co-run Puzzled, which handles vehicle listings for four Calgary-area dealerships, and I built the order system TotalTex runs on in Dhaka.",
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
    // "js" is rendered server-side (not injected by script) so hydration
    // matches; the noscript block below re-reveals everything when
    // scripting is off. See the .js .reveal rule in globals.css and the
    // comment on components/reveal.tsx.
    <html lang="en" className="js">
      <head>
        <noscript>
          <style>{`.js .reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
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
        {children}
      </body>
    </html>
  );
}
