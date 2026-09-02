# Portfolio

Adnan Shakib's personal site. A dark editorial spine with warm photographic
chapters, tracing Dhaka to Calgary and the software built along the way.
Replaces the old create-next-app-flavoured site previously live at
`addyrallxx-site.vercel.app`.

Next.js 16, React 19, TypeScript, Tailwind 4, framer-motion. Scroll is
smoothed with Lenis, mounted in `app/layout.tsx`.

## Run it

```
npm install
npm run dev
```

Open http://localhost:3000.

`npm run build` builds for production. `npm run typecheck` runs `tsc
--noEmit`. `npm run lint` runs ESLint.

## Verify it

The Browser pane and other in-repo automation tabs report `document.hidden =
true`, which throttles `requestAnimationFrame` and breaks `loading="lazy"`
images, so they cannot verify motion, scroll choreography or lazy-loaded
assets on this site. Verification drives real Chrome with `puppeteer-core`
instead, against a local production build, and asserts things a human would
see (rendered text, computed styles, box dimensions, lit pixel counts)
rather than trusting a screenshot.

No verification script lives in this repo yet. See `NEXT-SESSION.md` for
where the current 19-check harness lives and the plan to move it into
`scripts/verify.mjs`.

## Deploys

Git origin is `github.com/addyrallxx/addyrallxx-site.git`. Pushing a
non-`main` branch produces a Vercel preview at
`addyrallxx-site-git-<branch>-addyrallxxs-projects.vercel.app` without
touching production. Vercel Deployment Protection is on for this project, so
previews require a Vercel login (or a temporary shareable link minted
through the Vercel MCP). Production (`main`) is promoted only when Adnan
approves the work.

See `PLAN.md` for the full build plan and `CLAUDE.md` for operating rules.
