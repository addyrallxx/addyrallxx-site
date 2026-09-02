// Turns full resolution generated assets into web sized ones.
//
// Adnan generates textures in the Gemini app at whatever resolution it gives
// him, which has been up to 4096x4096 and 9.5MB. Anything inside public/ is
// served verbatim by Next.js, so a file that size would be shipped to every
// visitor. Originals therefore live in raw-assets/ (gitignored) and only the
// output of this script goes into public/.
//
// Run: node scripts/optimise-assets.mjs
//
// The prefix of the source filename decides the treatment, so dropping
// paper-grain-04.jpg into raw-assets/textures/ and re-running is enough.

import { readdirSync, mkdirSync, statSync } from "node:fs";
import { join, parse } from "node:path";
import { createRequire } from "node:module";

const require = createRequire("C:/Users/adnan/projects/totaltex-web/package.json");
const sharp = require("sharp");

const SRC = "raw-assets/textures";
const OUT = "public/textures";

// A grain or paper overlay is drawn at low opacity over a solid ground, so it
// carries no detail worth more than 1024px. A share image is read at exactly
// 1200x630 by every social platform and never larger.
const RULES = [
  { match: /^(paper-grain|grain|film-grain)/, width: 1024, height: 1024, format: "webp", quality: 72 },
  { match: /^(social-share|og)/, width: 1200, height: 630, format: "jpeg", quality: 82 },
  { match: /^(plate|backdrop)/, width: 1920, height: null, format: "webp", quality: 78 },
];

mkdirSync(OUT, { recursive: true });

let done = 0;
for (const file of readdirSync(SRC)) {
  const { name, ext } = parse(file);
  if (!/^\.(jpe?g|png|webp)$/i.test(ext)) continue;
  const rule = RULES.find((r) => r.match.test(name));
  if (!rule) {
    console.log(`skip  ${file} (no rule matches the prefix)`);
    continue;
  }
  const dest = join(OUT, `${name}.${rule.format === "jpeg" ? "jpg" : rule.format}`);
  const pipeline = sharp(join(SRC, file)).resize(rule.width, rule.height, {
    fit: "cover",
    position: "attention",
  });
  await (rule.format === "webp"
    ? pipeline.webp({ quality: rule.quality })
    : pipeline.jpeg({ quality: rule.quality, mozjpeg: true })
  ).toFile(dest);
  const before = statSync(join(SRC, file)).size;
  const after = statSync(dest).size;
  console.log(
    `write ${dest}  ${rule.width}x${rule.height ?? "auto"}  ` +
      `${(before / 1e6).toFixed(2)}MB -> ${(after / 1e3).toFixed(0)}KB`
  );
  done++;
}
console.log(`\n${done} asset${done === 1 ? "" : "s"} optimised.`);
