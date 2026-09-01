import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import WorldCanvas from "@/components/world/world-canvas";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adnan Shakib",
  description:
    "Builds order management for a Dhaka garment factory and listing automation for four Calgary dealerships, while studying computer science at the University of Calgary.",
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink-2 focus:px-4 focus:py-2 focus:font-mono focus:text-[length:var(--step--1)] focus:text-paper-0"
        >
          Skip to content
        </a>
        {/*
          SmoothScroll (Lenis) is deliberately NOT mounted here.

          Two reasons. Lenis calls preventDefault on every wheel event once
          smoothWheel is on, and docs/phase-2-world.md section 5 bans hijacked
          wheel events outright. More importantly it would double damp: the
          world already eases toward the scroll target at 0.05 per frame in
          components/world/world-canvas.tsx, so easing the scroll position
          underneath that as well makes the world lag the wheel twice over and
          feel disconnected.

          Nothing breaks by leaving it out. lib/scroll.ts is Lenis-first but
          falls back to native scrollIntoView with behavior smooth when
          window.__lenis is absent, so anchor navigation still works.

          The component stays in the repo for a future non-world page.
        */}
        <WorldCanvas />
        {children}
      </body>
    </html>
  );
}
