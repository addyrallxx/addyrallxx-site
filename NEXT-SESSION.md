# Portfolio rebuild handoff

Read this first in any new session, then `PLAN.md` for the plan of record,
then `CLAUDE.md` for operating rules. Last updated **2026-08-31**.

## Where we are

**Phase 0 (plan and checkpoint) is DONE as of 2026-08-31.** Nothing is
built. The repo holds exactly `PLAN.md`, `CLAUDE.md`, `NEXT-SESSION.md` and
an empty `docs/` directory. No `package.json`, no `node_modules`, no `app/`,
no scaffold of any kind exists on disk. `git log` will confirm this in
seconds if it is ever in doubt, do not trust a stale claim in this file over
the working tree.

## What is next

**Phase 1: scaffold**, per `PLAN.md` section 9. Next.js 16 + React 19 + TS
+ Tailwind 4. Port the eight reuse files listed in `PLAN.md` section 4.4 and
in `CLAUDE.md`'s reuse section. Set design tokens and a type scale. No
content yet, no Three.js scene yet, that is Phase 2 onward.

Follow the parallel agent rules in `CLAUDE.md` if any part of the scaffold is
fanned out: file ownership named per agent, interfaces pinned before
starting, no `git stash`, `model: 'sonnet'` and `effort` on every agent call.

## Key facts a fresh session would otherwise have to re-derive

- **The old site's source is `github.com/addyrallxx/addyrallxx-site`.** It
  has never been cloned to this machine. A reference clone was made into this
  session's scratchpad directory to run `impeccable detect` and read the
  source, but that clone is temporary and session-scoped; it may not exist
  by the time this is read. Re-clone if the old source needs reading again.
- **The old site scores 49 impeccable anti-patterns.** Full breakdown with
  evidence is `PLAN.md` section 1. Do not re-run the audit to rediscover
  numbers already written down there.
- **The new site pushes to that same `addyrallxx-site` repo when it ships**,
  specifically to keep the existing Vercel project and URL rather than
  standing up a new deployment. `PLAN.md` section 4.6: preserve the old code
  on a branch before replacing it, do not just force-push over it.
- **This `portfolio` repo is the working repo for the build.** It is not the
  same repo as `addyrallxx-site`; the push described above is a later,
  deliberate step, not something that happens automatically or early.

## Skill installed this session

The `scroll-world` skill was installed at `~/.claude/skills/scroll-world`
during this session's research, specifically to evaluate it as the engine
for the scrolled world concept. **Decision made in `PLAN.md` section 4.1:
its asset pipeline (AI video clips scrubbed by scroll) is banned here**,
because it needs either Monid (~$27 per 6-scene chain) or Higgsfield
credits, both against the zero-dollar constraint. **Its `scrub-engine.js`
remains a fallback only**: if one scene proves too heavy for mobile as a
live Three.js render, that single scene can fall back to a pre-rendered clip
played through the scrub engine. It is not the foundation of the build, do
not default to it.

## Open questions, all awaiting Adnan

None of these block Phase 1. Answer before Phase 4 (contact finale) and
Phase 6 (audit and ship). Full context for each is `PLAN.md` section 11.

1. **Domain.** Keep `addyrallxx-site.vercel.app`, or register a real domain?
   A real domain is the cheapest credibility upgrade available but costs
   money, which conflicts with the zero-dollar constraint unless Adnan
   chooses to spend on this specifically.
2. **Contact surface.** The old site publishes a phone number and a business
   Gmail. Keep the phone number public on the new site?
3. **TotalTex naming.** Name TotalTex as the client on the flagship case
   study, or anonymise to "a garment accessories manufacturer in Dhaka"?
   Naming it is the stronger pitch and the company is Adnan's family's, but
   needs the family's confirmation before it appears on a personal
   portfolio.
4. **Photo.** No photograph of Adnan exists anywhere on this machine. A real
   face would beat any 3D flourish for trust on the About/Ground chapter.
   Worth taking one before Phase 3.
5. **Codex asset generation.** Confirm with Adnan before generating any
   image via Codex, even though it bills the ChatGPT subscription rather
   than dollars or Higgsfield credits. Per `PLAN.md` Phase 5.
