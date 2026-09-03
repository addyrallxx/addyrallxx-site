// Fetches full colour Simple Icons SVGs for every non-null slug in
// lib/content.ts SKILLS.groups, substitutes any brand colour that fails
// WCAG contrast 3:1 against the site canvas (#08090b) with the site's
// --ink token, and writes public/icons/<slug>.svg.
//
// Re-run any time SKILLS.groups changes: `node scripts/fetch-icons.mjs`.
// The group list below is a plain copy of lib/content.ts (that file is
// TypeScript and owned by another agent, so this script does not import
// it). Keep the two in sync by hand if slugs change.

const GROUPS = [
  { items: [{ name: "Python", slug: "python" }, { name: "TypeScript", slug: "typescript" }, { name: "JavaScript", slug: "javascript" }, { name: "Java", slug: "openjdk" }, { name: "SQL", slug: "postgresql" }] },
  { items: [{ name: "Next.js", slug: "nextdotjs" }, { name: "React", slug: "react" }, { name: "Tailwind CSS", slug: "tailwindcss" }, { name: "Node.js", slug: "nodedotjs" }, { name: "GSAP", slug: "greensock" }] },
  { items: [{ name: "PostgreSQL", slug: "postgresql" }, { name: "Drizzle", slug: "drizzle" }, { name: "Docker", slug: "docker" }, { name: "Vercel", slug: "vercel" }, { name: "Git", slug: "git" }] },
  { items: [{ name: "Claude Code", slug: "claude" }, { name: "Codex", slug: null }, { name: "Gemini", slug: "googlegemini" }, { name: "MCP", slug: "modelcontextprotocol" }, { name: "LangChain", slug: "langchain" }, { name: "Hugging Face", slug: "huggingface" }, { name: "LLMs", slug: null }, { name: "RAG", slug: null }, { name: "n8n", slug: "n8n" }, { name: "Zapier", slug: "zapier" }] },
  { items: [{ name: "PyTorch", slug: "pytorch" }, { name: "CUDA", slug: "nvidia" }, { name: "Kotlin", slug: "kotlin" }, { name: "LaTeX", slug: "latex" }] },
];

const CANVAS_HEX = "#08090b";
const INK_HEX = "#f1f2f4";
const CONTRAST_FLOOR = 3;

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexToRgb(hexA));
  const lb = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

const slugs = [...new Set(GROUPS.flatMap((g) => g.items.map((i) => i.slug)).filter(Boolean))];

const results = [];

for (const slug of slugs) {
  const url = `https://cdn.simpleicons.org/${slug}`;
  let svg;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      results.push({ slug, ok: false, status: res.status });
      continue;
    }
    svg = await res.text();
  } catch (err) {
    results.push({ slug, ok: false, error: String(err) });
    continue;
  }

  if (!svg.trim().startsWith("<svg") || !svg.includes("</svg>")) {
    results.push({ slug, ok: false, error: "response did not parse as SVG" });
    continue;
  }

  const match = svg.match(/<svg[^>]*\bfill="(#[0-9a-fA-F]{6})"/);
  const brandHex = match ? match[1] : null;
  if (!brandHex) {
    results.push({ slug, ok: false, error: "no fill hex found on root svg" });
    continue;
  }

  const ratio = contrastRatio(brandHex, CANVAS_HEX);
  const substituted = ratio < CONTRAST_FLOOR;
  const finalHex = substituted ? INK_HEX : brandHex;
  const out = svg.replace(/<svg([^>]*)\bfill="#[0-9a-fA-F]{6}"/, `<svg$1fill="${finalHex}"`);

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const outPath = path.join(process.cwd(), "public", "icons", `${slug}.svg`);
  await fs.writeFile(outPath, out, "utf8");

  results.push({ slug, ok: true, brandHex, ratio, substituted, finalHex });
}

for (const r of results) {
  if (!r.ok) {
    console.log(`FAIL  ${r.slug}  ${r.error ?? r.status}`);
  } else {
    console.log(
      `OK    ${r.slug.padEnd(22)} brand=${r.brandHex}  ratio=${r.ratio.toFixed(2)}:1  ${r.substituted ? `SUBSTITUTED -> ${r.finalHex}` : ""}`
    );
  }
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.log(`\n${failed.length} slug(s) failed.`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${results.length} slugs fetched.`);
}
