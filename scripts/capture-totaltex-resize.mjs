// Resize + compress selected TotalTex Web production photos into public/totaltex/.
// Uses sharp from totaltex-web's node_modules (not a portfolio dependency).
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(
  "C:/Users/adnan/projects/totaltex-web/package.json"
);
const sharp = require("sharp");

const SRC_DIR = "C:/Users/adnan/projects/totaltex-web/public/facility";
const OUT_DIR = path.resolve("public/totaltex");

// [source filename, output filename] - picked for manufacturing/product/floor
// content, no faces, no documents, no buyer-identifying text. See report for
// full rejection reasoning.
const PICKS = [
  ["hero-range-flatlay-01.webp", "trims-range-flatlay.jpg"],
  ["finished-garment-tableau-01.webp", "finished-garment-tableau.jpg"],
  ["product-thread-cones-blue-01.webp", "sewing-thread-cones.jpg"],
  ["floor-conning-wide-01.webp", "conning-floor-wide.jpg"],
  ["machine-loom-spools-01.webp", "loom-spools-detail.jpg"],
  ["machine-flexo-01.webp", "flexo-printing-machine.jpg"],
];

for (const [src, out] of PICKS) {
  const srcPath = path.join(SRC_DIR, src);
  const outPath = path.join(OUT_DIR, out);
  const meta = await sharp(srcPath).metadata();
  const longEdge = Math.max(meta.width, meta.height);
  const scale = longEdge > 1600 ? 1600 / longEdge : 1;
  const targetW = Math.round(meta.width * scale);
  const targetH = Math.round(meta.height * scale);

  let quality = 82;
  let buf;
  for (; quality >= 55; quality -= 7) {
    buf = await sharp(srcPath)
      .resize(targetW, targetH)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (buf.length <= 400 * 1024) break;
  }
  await sharp(buf).toFile(outPath);
  console.log(
    `${out}: ${meta.width}x${meta.height} -> ${targetW}x${targetH}, q${quality}, ${(buf.length / 1024).toFixed(0)}KB`
  );
}
