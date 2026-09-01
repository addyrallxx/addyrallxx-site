import type { ChapterPacing } from "./types";

export const CHAPTER_PACING: ChapterPacing[] = [
  { id: "arrival", scroll: 1, linger: 0.18 },
  { id: "ground", scroll: 1.2, linger: 0.2 },
  { id: "totaltex", scroll: 2, linger: 0.32 },
  { id: "puzzled", scroll: 1.35, linger: 0.2 },
  { id: "field-notes", scroll: 1.1, linger: 0.16 },
  { id: "contact", scroll: 1.5, linger: 0.28 },
];

const TOTAL_SCROLL = CHAPTER_PACING.reduce(
  (total, chapter) => total + chapter.scroll,
  0,
);

function clampProgress(progress: number): number {
  return Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
}

function mapBand(index: number, local: number): number {
  const chapter = CHAPTER_PACING[index];
  const hold = Math.min(1 - Number.EPSILON, Math.max(0, chapter.linger));
  const lower = 0.5 - hold / 2;
  const upper = 0.5 + hold / 2;
  const lastIndex = CHAPTER_PACING.length - 1;

  // Linger reserves a symmetric central plateau for the authored formation.
  // Linear moving halves keep every cross-band seam exact.

  if (index === 0) {
    if (local <= upper) return 0;
    return 0.5 * ((local - upper) / (1 - upper));
  }

  if (index === lastIndex) {
    if (local <= lower) return 4.5 + 0.5 * (local / lower);
    return 5;
  }

  if (local <= lower) {
    return index - 0.5 + 0.5 * (local / lower);
  }
  if (local <= upper) return index;
  return index + 0.5 * ((local - upper) / (1 - upper));
}

function chapterBand(progress: number): {
  index: number;
  local: number;
} {
  const weightedProgress = progress * TOTAL_SCROLL;
  let start = 0;

  for (let index = 0; index < CHAPTER_PACING.length; index += 1) {
    const scroll = CHAPTER_PACING[index].scroll;
    const end = start + scroll;
    if (weightedProgress < end || index === CHAPTER_PACING.length - 1) {
      return {
        index,
        local: Math.min(1, Math.max(0, (weightedProgress - start) / scroll)),
      };
    }
    start = end;
  }

  return { index: CHAPTER_PACING.length - 1, local: 1 };
}

export function mapScrollProgress(progress: number): number {
  const normalized = clampProgress(progress);
  if (normalized === 0) return 0;
  if (normalized === 1) return CHAPTER_PACING.length - 1;

  const band = chapterBand(normalized);
  return mapBand(band.index, band.local);
}

export function snapScrollProgress(progress: number): number {
  const normalized = clampProgress(progress);
  return chapterBand(normalized).index;
}
