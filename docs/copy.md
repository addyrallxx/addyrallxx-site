# Site copy, draft 1

Written by Opus, 2026-09-01, to `PLAN.md` section 8 (voice) with every claim
traced to `PLAN.md` section 5 (evidence) and filtered through section 7
(confidentiality).

A first draft was delegated to Gemini and **rejected**. It invented a "fourteen
hour time difference" between Dhaka and Calgary (the real gap is twelve), and it
padded every chapter with the exact intent-selling section 8 bans, for example
"I anchor the daily work in strictly verifiable facts". Recorded here because the
same trap is easy to fall back into: **if a sentence describes an attitude rather
than a thing that exists, cut it.**

Voice rules applied throughout:
- Open with a verb and an object. Never with an identity label.
- One claim, one fact behind it.
- Short declarative sentences, roughly 8 to 14 words.
- No em dashes, no en dashes.
- If it has no artifact, it is not on the site.

Two things still need Adnan's answer, and both are drafted twice so nothing is
blocked: **TotalTex naming** (variant A names it, variant B anonymises) and
whether the **phone number** stays public.

---

## 1. Arrival

**Headline**

> I build the software two businesses actually run on.

**Subhead**

> Order management for a garment factory in Dhaka. Listing automation for four
> Calgary dealerships. Computer science at the University of Calgary.

**Body**

> Two continents, two real businesses, and code running in production on both.
> Everything below traces to a repository, a live URL, or a running system.
> Where a claim could not be verified, it is not here.

*Note: that last line is a real differentiator and it is honest. The site it
replaces claimed Solana, DeFi and Phantom with nothing shipped behind any of
them.*

---

## 2. Ground

**Headline**

> Calgary now. Dhaka first.

**Subhead**

> Studying computer science at the University of Calgary, and running the
> technical half of a Calgary business while doing it.

**Body**

> I am a Bangladeshi citizen studying in Canada. The factory software runs
> against a plant twelve time zones away. The dealership automation runs against
> a city I can drive across. Both ship to people who notice immediately when
> something breaks.

---

## 3. TotalTex Ops, the flagship

### Variant A, client named

**Headline**

> Built the order system a Dhaka factory runs on.

### Variant B, anonymised

**Headline**

> Built the order system a Dhaka garment factory runs on.

*Variant B substitutes "a garment accessories manufacturer in Dhaka" for the name
throughout. Everything else below is identical.*

**Subhead**

> Order to job card to proforma invoice to production to delivery challan to
> bill. One spine, eleven tables, and a schema that argues with itself in the
> comments.

**Body**

> Generic ERPs model a product as a variant of a variant. A garment accessories
> factory needs a spec sheet per product line, and the spec has to drive both the
> data entry form and the printed description on the invoice. So the templates
> generate both from one definition. That decision is the reason this is not a
> configured Odoo instance.

**Evidence lines**

- 95 source files, 12,501 lines, 27 commits, TypeScript strict throughout.
- `lib/spec-templates.ts` is 186 lines. One typed template drives both the form
  and the printed description string.
- Money and quantity are `numeric`, never float. Challan and bill lines snapshot
  rather than join, so a later price edit cannot rewrite a delivered document.
- Job numbers start at 10000, so any number in the wild provably came from the
  software.
- bcrypt at cost 12, with a dummy hash compare that closes the account existence
  timing oracle. Lockout is per account, ten attempts per fifteen minutes,
  deliberately not per IP because the office shares one NAT.

**The best story on the site, give it its own beat**

> `updateJob` deleted and reinserted job lines on every edit. The edit form never
> submitted `job_item.id`, so a cascading foreign key silently erased recorded
> production. Nobody reported it. I found it reading my own schema.
>
> Fixed with a diff based update, and the foreign key changed to RESTRICT so the
> database refuses that shape of mistake even if the next bug reintroduces it.

**Honesty block, required by PLAN.md section 5.1, do not cut it**

> Nine of eleven spec templates are still unbuilt. Daily production entry is not
> built. Tally integration is designed and not written. This runs a real factory
> and it is not finished.

*Explicitly not claimed anywhere: that entry beats paper on a stopwatch. That was
reasoned from source and never timed, so it stays off.*

---

## 4. Puzzled

**Headline**

> Wrote the automation behind a Calgary listing business.

**Subhead**

> 7,313 lines of Python on a scheduled task, three times a day, against four
> Calgary-area dealerships.

**Body**

> Vehicle listings are regulated advertising. Being wrong is not a user
> experience problem, it is an AMVIC problem. So the generator states only facts
> present in the scraped record, picks a sales angle from those facts, and
> attaches the disclaimer the jurisdiction requires. Constrained generation,
> because the constraint is the law.

**Evidence lines**

- A `curl_cffi` scraper that defeats TLS fingerprinting across three dealer
  platforms, including gallery photo extraction.
- 287 of 335 descriptions generated at zero API cost, because the rules do the
  work instead of a model.
- Audited 1,069 real descriptions against AMVIC advertising regulation. It
  surfaced two live violations that predated the software.
- Found a caching bug in production: 58 vehicles were no longer live and 38 price
  changes had been missed.

*Client dealerships are never named. "Four Calgary-area dealerships" is the
ceiling, per PLAN.md section 7.*

---

## 5. Field notes

**Headline**

> Three more things that shipped.

### TotalTex Web

> Live at totaltex-bd.com since August 2026. 83 files, 11,506 lines, 383 real
> production photographs, custom domain, zero downtime DNS cutover.
>
> The structured data was emitting `"@type": "Factory"`. That type does not exist
> in schema.org. The address, geo, opening hours and phone had been worth nothing
> to Google since the day it launched. Found by systematic audit, not by luck.

*This is the only project with a live, clickable, third party verifiable URL.
Lead the chapter with it for exactly that reason.*

### FitTrack

> A workout and nutrition tracker you can open right now. 6,110 lines of vanilla
> JavaScript in a single file. No framework, no bundler, no build step. Nutrition
> data from Open Food Facts, weight history in Chart.js, and a service worker so
> it works with no signal.

*Open it and use it in five seconds. That is the entire pitch.*

### The working system

> Every claim in my notes carries an evidence grade: confirmed, unverified,
> hypothesis, obsolete. That system caught an earlier AI handover inventing
> revenue figures and a client count, and forced the retraction.
>
> A knowledge base that catches its own hallucinations is worth more than a list
> of frameworks.

---

## 6. Contact

**Headline**

> Dhaka to Calgary, and open to what is next.

**Body**

> Studying in Calgary, Alberta. Bangladeshi citizen. The one route I actually fly
> is Calgary to Dhaka every May through August, via Doha or Istanbul, because no
> direct flight exists.

**The globe legend, wording matters here**

> Origin: Dhaka, Bangladesh.
> Present: Calgary, Alberta. University of Calgary.
> The wider network on this globe is TotalTex's buyer reach across 54 apparel
> brands. That is the company's supply chain, not my passport.

*That last distinction is not pedantry. Claiming personal global reach he does
not have is exactly the kind of unearned claim the old site died of.*

**Contact surface, pending Adnan's answer**

- Variant A: email, plus phone number, plus copy to clipboard on both.
- Variant B: email only, phone removed.

Both keep a `mailto:` fallback link so the form is never the only route.

**Live detail**

> It is currently HH:MM in Calgary.

Computed client side, no dependency, no API.

---

## Still to do before this ships

1. Run every final line through `/humanizer`.
2. Confirm the TotalTex naming decision, then delete the losing variant.
3. Confirm the phone decision, then delete the losing variant.
4. Re-check every number against `PLAN.md` section 5 one more time at build time.
   Two numbers in the first delegated draft were wrong, so this is not paranoia.
