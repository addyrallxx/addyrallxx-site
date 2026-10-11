import { ImageResponse } from "next/og";
import { SITE } from "@/lib/content";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", padding: 80, background: "#030817", color: "#EEF1FA" }}>
    <div style={{ fontSize: 88, fontWeight: 800 }}>{SITE.name}</div>
    <div style={{ fontSize: 30, marginTop: 40, lineHeight: 1.5 }}>{SITE.description}</div>
  </div>, size);
}
