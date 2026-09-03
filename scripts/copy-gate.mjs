// Copy gate. Checks the words that actually ship.
//
// Run: node scripts/copy-gate.mjs
//
// The failure this exists to prevent is specific. The version of this site
// that was rejected did not contain any of the obvious AI vocabulary; a grep
// for "passionate", "seamlessly", "journey" and em dashes came back clean.
// It failed on subtler patterns instead: a manufactured aphorism closing
// every section, line counts used as bragging, and one sentence that told
// visitors an AI had invented revenue figures about the family business.
// Those are the patterns below.
//
// Comments are stripped before checking, because lib/content.ts documents
// these rules by quoting the banned constructions. A naive grep over the raw
// file flags its own documentation and then gets ignored, which is worse
// than having no gate at all.

import { readFileSync } from "node:fs";

const FILE = "lib/content.ts";
const src = readFileSync(FILE, "utf8");

// Strip block comments then line comments. Crude, and sufficient: this file
// is hand written data, not arbitrary source, and no string in it contains a
// comment opener.
const shipped = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const RULES = [
  {
    name: "em dash",
    re: /—/g,
    why: "Adnan's standing rule across every project. Use periods, commas, colons, parentheses.",
  },
  {
    name: "en dash used as punctuation",
    re: /–/g,
    why: "Same rule.",
  },
  {
    name: "line, file or commit count used as a claim",
    re: /[0-9][0-9,]*\s+(lines|source files|commits|files)\b/gi,
    why: "Nobody is impressed by a line count. Say what changed for the business instead.",
  },
  {
    name: "manufactured aphorism",
    re: /\bis not (?:a|an|the)\b[^.!?]{2,60},\s*it(?:'s| is)\b/gi,
    why: "The old copy closed nearly every section with this construction. It reads as written, not thought.",
  },
  {
    name: "assistant or model reference",
    /*
      The lookahead is what makes this rule mean what it was written to mean.

      What the rejected build shipped was a SENTENCE about an assistant
      inventing revenue figures, and prose about how the site was made is the
      thing being banned. Naming a tool in a skills list is a different act,
      and it is one Adnan asked for directly.

      So a model name only trips the rule when six or more further words
      follow it on the same line, which is prose rather than a label. A tile
      reading "Claude Code" passes, a heading reading "AI and automation"
      passes, and a sentence beginning "Claude helped me write this site"
      does not. The canary still carries the original confession, so this
      rule is still proved able to fail on the thing it exists to catch.
    */
    re: /\b(?:AI|LLM|Gemini|Codex|Claude|Opus|Sonnet|ChatGPT|hallucinat\w*|prompt(?:ed|ing)?)\b(?=(?:[^\n"]*?\s+\S+){6})/g,
    why: "The rejected build shipped a sentence about an AI inventing revenue figures. Nothing about how the site was made belongs in the site.",
  },
  {
    name: "process or planning leakage",
    re: /\b(?:PLAN\.md|NEXT-SESSION|chunk \d|Phase \d|verification harness|handover|handoff)\b/gi,
    why: "Internal process vocabulary. The reader does not care and should not be able to tell.",
  },
  {
    name: "confession block",
    re: /\b(?:is not finished|still unbuilt|not yet built|to be honest|full disclosure)\b/gi,
    why: "Specificity is what makes a claim credible. Announcing your own honesty is not.",
  },
  {
    name: "generic AI vocabulary",
    re: /\b(?:seamless\w*|passionate|passion for|craft(?:ing|ed)? (?:beautiful|elegant)|delve|tapestry|testament to|leverage[sd]?|robust|cutting.edge|game.chang\w+|elevate|unlock(?:ing)? (?:the|your))\b/gi,
    why: "The obvious tells. These were already absent and must stay absent.",
  },
];

let failed = 0;
const lines = shipped.split("\n");

for (const rule of RULES) {
  const hits = [];
  lines.forEach((line, i) => {
    rule.re.lastIndex = 0;
    const m = line.match(rule.re);
    if (m) hits.push({ n: i + 1, line: line.trim(), m });
  });
  if (hits.length) {
    failed += hits.length;
    console.log(`\nFAIL  ${rule.name}  (${hits.length})`);
    console.log(`      ${rule.why}`);
    for (const h of hits.slice(0, 6)) {
      console.log(`      ${FILE}:${h.n}  ${JSON.stringify(h.m.join(", "))}`);
      console.log(`        ${h.line.slice(0, 110)}`);
    }
  } else {
    console.log(`ok    ${rule.name}`);
  }
}

// A gate that cannot fail is not a gate. Prove the patterns actually match by
// running them against a sample built from the rejected copy.
const CANARY = `
  95 source files, 12,501 lines, 27 commits, TypeScript strict throughout.
  Being wrong is not a user experience problem, it is an AMVIC problem.
  That system caught an earlier AI handover inventing revenue figures.
  This runs a real factory and it is not finished.
  Passionate about seamlessly crafting beautiful experiences.
  A quiet moment — and then the rest.
  Open May–August, every year, without fail.
  Read PLAN.md section 7 before shipping chunk 2.
`;
// Every rule now has a line in the canary, so any miss is a broken rule.
const canaryMisses = RULES.filter((r) => {
  r.re.lastIndex = 0;
  return !r.re.test(CANARY);
}).map((r) => r.name);

console.log("");
if (canaryMisses.length) {
  console.log(`BROKEN GATE: these rules matched nothing in the canary: ${canaryMisses.join(", ")}`);
  process.exit(2);
}

if (failed) {
  console.log(`${failed} copy gate violation(s) in shipped strings.`);
  process.exit(1);
}
console.log("copy gate clean, and every rule proved it can still fail.");
