import type { Metadata } from "next";
import { Archivo, Instrument_Sans } from "next/font/google";
import SmoothScroll from "@/components/smooth-scroll";
import { Sky } from "@/components/sky/sky";
import { Intro } from "@/components/intro/intro";
import { Chrome } from "@/components/chrome/chrome";
import { PageTransition } from "@/components/page-transition";
import { SITE, CHROME } from "@/lib/content";
import "./globals.css";

const archivo = Archivo({ variable: "--font-display", axes: ["wdth"], subsets: ["latin"], display: "swap" });
const instrument = Instrument_Sans({ variable: "--font-body", weight: ["400", "500"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://addyrallxx-site.vercel.app"),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: SITE.name, description: SITE.description, type: "website", locale: "en_CA" },
};

const modeScript = `document.documentElement.dataset.mode="night"`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-mode="night" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: modeScript }} /></head>
      <body className={`${archivo.variable} ${instrument.variable} antialiased`}>
        <a href="#main" className="skip-link">{CHROME.skip}</a>
        <SmoothScroll />
        <Sky />
        <Intro />
        <PageTransition><Chrome />{children}</PageTransition>
      </body>
    </html>
  );
}
