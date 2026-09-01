# Portfolio rebuild handoff

Read this first, then `PLAN.md` (plan of record), then `CLAUDE.md` (operating
rules), then `docs/phase-2-world.md` if touching the world.
Last updated **2026-09-01, end of the third session**.

## The headline: Phase 2 was reported complete and verified, and it was blank

**The world rendered nothing at any chapter, and had not since Phase 2 was
built.** The previous handoff claimed it was complete and independently
verified. That claim was false and has been corrected here and in the vault.

Every measurement in the old harness was true: 240 fps, 24000 particles, camera
materially different at three scroll positions, frame counter climbing, exactly
one GPU upload, zero console errors, valid WebGL context, SSR headings present.
**Not one check asserted that a pixel was lit.**

Two independent bugs, both "correct but never reaches the screen":

1. **CSS painting order, not WebGL.** The canvas is `fixed inset-0 -z-10` and
   `body` carried an opaque background. A negative z-index descendant paints at
   step 2 of the CSS painting algorithm, before the backgrounds of in-flow block
   level descendants at step 3, so `body` painted over the whole scene. Now only
   `html` carries the page background and `body` is transparent. **Do not put a
   background back on `body`.** A comment in `app/globals.css` says so.
2. **The arc faced away from the camera.** The Dhaka to Calgary great circle
   runs near the north pole, so all 65 points sat at z between -1.09 and -0.03
   while the globe front surface is at z +4. It was correct to 1e-7 on its
   endpoints and entirely hidden behind the particle field. The arc and the
   globe formation now share one `orientGlobePoint` rotation in
   `lib/world/arc.ts`, and `verify-arc` asserts the arc faces the camera.

**The lesson, which matters more than either bug: green instrumentation is not
evidence of a working feature.** A harness for anything visual must assert the
visible output at least once or it can pass forever on a blank screen.

## Where we are

Branch `phase-1-scaffold`, pushed to the **`portfolio-rebuild`** branch of the
`addyrallxx-site` repo, which gives a Vercel preview WITHOUT touching the live
site. `addyrallxx-site.vercel.app` still serves the old site.

    cc8ce6a  Harden the verification harness so its checks can actually fail
    b405d20  Fix the world never reaching the screen, Phase 3 copy, chapter 6 arc
    faa7c17  Checkpoint: Phase 2 complete and verified   <- this claim was false

Preview (Vercel SSO, sign in as Adnan):
`https://addyrallxx-site-git-portfolio-rebuild-addyrallxxs-projects.vercel.app`

Phases 0, 1, 2 and 3 are done. Phase 2 is now genuinely verified against pixels.

## Verification, measured this session

    npm run build && npm run start -- -p 4173
    node scripts/verify/verify-pixels.mjs      # the one that was missing
    node scripts/verify/verify-world.mjs
    node scripts/verify/verify-arc-visible.mjs
    node scripts/verify/wheel-check.mjs
    node scripts/verify/tab-order-check.mjs
    node scripts/verify/find-404.mjs
    node lib/world/verify-arc.mjs             # no server needed

    # StrictMode checks need the DEV server, see below
    npm run dev -- -p 4174
    node scripts/verify/strictmode-check.mjs
    node scripts/verify/strictmode-console-check.mjs

All pass. Highlights:

- lit pixels with the DOM hidden: 104,652 / 48,057 / 30,830 / 65,845 across the
  scroll, and 999 amber pixels where the arc draws
- every chapter renders a signature closest to its OWN counterpart, uniquely
- **real composited text contrast, worst case 6.609:1** in contact, above 4.5:1.
  This replaces the Phase 1 numbers, which were measured against a static token
  colour that no longer describes a translucent panel over a moving scene
- reduced motion: tier static, `isAnimating` false, 2 frames, arc fully drawn at
  progress 1 with dashOffset 0
- wheel input moves the expected distance in both directions, nothing cancelled

## Traps that cost real time, do not rediscover them

- **Kill test servers by port, never `pkill`.** A stale server survived and
  served a `.next` that later builds had overwritten, which looked exactly like
  a fresh regression. `Get-NetTCPConnection -LocalPort <p> -State Listen`.
  This bit twice, on 4173 and again on 4174.
- **Port 4174 is the DEV server and that is deliberate.** StrictMode only
  double invokes in development, so pointing those two checks at production
  makes them vacuous. Documented at the top of both files. Do not "align" it.
- **Element level screenshots of a WebGL canvas come back empty.** Use full page
  capture. This wasted a debugging round.
- **Hide the DOM before counting pixels.** The amber email link was counted as
  the arc for a full round. Set `main` visibility to hidden.
- **Brief Codex and Gemini from a FILE on stdin, never an inline argument.**
  Use `codex exec --dangerously-bypass-approvals-and-sandbox < brief.md`. Passed
  as an argument, Codex hangs forever on "Reading additional input from stdin"
  after producing about 39 bytes, which looks like a long running job.
- **Drive Gemini only through the wrapper** at
  `C:\Users\adnan\.claude\tools\gem.ps1`. It handles all five agy traps. Raw
  invocation cost three round trips today.

## What is next

1. **Design pass on the world.** It works, nobody has judged whether it looks
   good. Specifically: does the arc sweep read at real scroll speed, and is the
   globe orientation the most flattering framing or just the first that worked?
   `GLOBE_FACING` in `lib/world/arc.ts` is the single knob.
2. **The adversarial review never ran.** Gemini timed out twice on it. The brief
   is worth re-running when quota is back. It was told to assume a THIRD
   invisibility bug exists.
3. **Phase 5 assets.** TotalTex Ops screenshots from `npm run seed:demo` only,
   never real data. None exist on disk yet.
4. **Phase 6.** `impeccable detect`, `/humanizer` over all copy, Lighthouse,
   then a Codex adversarial review of the finished diff.
5. **Promote to production** when Adnan is happy: merge `portfolio-rebuild`
   into `main` on `addyrallxx-site`. Not done, deliberately.

## Decisions made this session

1. **TotalTex is named on the site.** Adnan confirmed his family is fine with
   it. The anonymised variant is deleted from `docs/copy.md`.
2. **No phone number, email only.** Claude's call: a public page is a spam
   magnet and an employer needs an email address.
3. **The Puzzled scraper line ships without the TLS fingerprinting clause.**
   It read as adversarial and invited a question the plan could not answer, so
   the line states only what is verifiable.
4. **`AGENTS.md` points at `CLAUDE.md` instead of duplicating it.** Codex had
   created a verbatim copy, which would drift.

## Open questions for Adnan

1. **Domain.** Keep `addyrallxx-site.vercel.app` or register one?
2. **Photo.** Still no photograph of Adnan on this machine. A real face beats
   any 3D flourish for trust.
3. **Do Convertus VMS, LeadBox HQ or DealerEProcess offer the dealer a data
   feed?** If not, the Puzzled scraper line can say so plainly and the whole
   objection disappears.
4. **Asset generation.** The only free route is Adnan generating images by hand
   in the Gemini app and saving them into the repo. Anything scripted bills.

## How the work split, and how it went

- **Codex builds well specified self contained modules.** It wrote the arc and
  the harness audit, both good. It hit its usage limit mid task and never wrote
  a report, so its work was verified by re-running everything here.
- **Gemini reviews and corrects prose.** It wrote the vault correction cleanly
  and respected the append only rule. It timed out twice on the code review.
- **Claude keeps** architecture, the confidentiality and voice calls, and final
  verification. Both partners and Claude have each now been confidently wrong
  once on this project, so re-running the claim is not optional.
