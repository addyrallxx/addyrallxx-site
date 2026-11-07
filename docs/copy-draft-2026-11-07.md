# Copy draft, 2026-11-07

Claude wrote this. Not applied to `lib/content.ts`. Sources: `lib/content.ts`, PLAN.md section 7, the 2026-11-04 resumes in `projects/job-search/cv/` (master and software-ai), the vault Career History page, the Handled repo README, the saved E92 notes.

## 0. Open conflicts and decisions (read first)

1. **Puzzled start year.** `content.ts` says "Since 2023". Every resume dated 2026-11-04 says 2024 (idea in summer 2024, business that autumn). I used **2024**.
2. **Puzzled client count.** `content.ts` says "more than seven". The newest resume says "seven at peak, four active". I used the resume wording. If Adnan still wants "more than seven", change one phrase in three places (SIDE, WORK puzzled lead, INFO).
3. **Handled safety numbers disagree.** The resume says the triage caught all 120 emergency cases and blocked booking on 96. The vault (2026-10-27) says 96 of 120 hard-stopped (80.0%). I wrote only "tested against 120 emergency scenarios" until Adnan says which is right.
4. **Handled link.** README names `handled-ai.pages.dev` (updated Oct 15). The live app is on a workers.dev address and the site has since been rebuilt. Verify the URL loads before shipping the `link`.
5. **Left out on purpose.** Renfrew Chrysler by name (it is a Puzzled client, so it becomes "a Calgary dealership"). The 450k, 530k and 650k monthly gross figures (a dealership's numbers, not Adnan's to publish). TotalTex turnover. Grades and GPA. Ollama (pulled once for a vault experiment, not a tool he uses). Awards: I found none in the vault or resumes. The only graded fact is the Edexcel 3.94 of 4.0 from Mastermind, included in School.
6. **Optional fact I kept:** "about 250 people" at TotalTex (headcount, on his public resume, not in the PLAN section 7 never-publish list). Drop it if he disagrees.

## (a) Hero headline candidates (replace "Systems / with taste")

Each is two display lines.

1. Two businesses. / One engineer.
2. Written in Calgary. / Running in Dhaka.
3. Paper in. / Software out.
4. Sold cars. / Ship software.
5. Built for the / shop floor.
6. From dealer floor / to factory floor.
7. Real clients. / Real invoices.
8. Code that / earns its keep.

**Top 2**

- **Two businesses. One engineer.** It is the whole pitch in four words and it is checkable: Puzzled and TotalTex both run on software I wrote. It also sets up the lead line without repeating it.
- **Written in Calgary. Running in Dhaka.** The only line a recruiter cannot find on another portfolio. It carries the two-continent spine from PLAN.md and has a rhythm that scrolls well in display type.

## (b) Taste headline candidates (replace "I see the / 2px that's / off.")

Each has a matching body of one or two sentences.

1. **I can taste / a bad margin.**
   Spacing, type and motion are where software shows whether anyone cared. I check them the way I check a database schema: closely, and before it ships.
2. **A keen eye / for the 2px / nobody asked about.**
   Nobody files a ticket for uneven padding. Everybody feels it. I fix it before they have to.
3. **Chef's kiss, / or it / doesn't ship.**
   I do the small stuff last and slowest: the gap, the font weight, the half second of an animation. People judge the whole screen at once, so I do too.
4. **Allergic to / almost right.**
   Almost right is the 2px gap, the font that is close but not the one, the button that moves a beat late. I go looking for those.
5. **Picky about / pixels. On / purpose.**
   Most software works and looks like nobody cared. I would rather lose an evening to a misaligned icon than ship it.
6. **Taste buds / for software.**
   I can feel when something is slightly off before I can say what. Then I measure it, and it is usually 2px.
7. **Measure twice. / Nudge once.**
   I look at the spacing the way I look at a schema: with numbers, not vibes. Then I move one thing by the exact amount it needed.
8. **Sweating / the small / stuff.**
   People in a dealership or a factory office will never praise the spacing. They just stop getting annoyed. That is the review I'm after.

**Top 2**

- **I can taste a bad margin.** Closest to "I have a keen eye for taste": the same wit, but concrete, a little gross, and instantly visual. It reads as a person, not a slogan, and the body pays it off with the schema comparison.
- **Taste buds for software.** The shortest and most quotable pun. Its body keeps the 2px from the old line, so the old headline's best idea survives as the punchline.

## (c) Info section rewrite

Shape matches the existing `INFO` export (label, bio, lists). Rows are Now, Before, School, Off the clock.

```
label: Info
bio: Born in Dhaka. A Bangladeshi citizen studying computer science in Calgary, graduating April 2028. I co-run Puzzled, I'm the named successor at TotalTex, the trims factory my father founded, and I'm looking for a summer 2027 internship.
```

**Now**
- Co-founder, Puzzled, Calgary, 2024 to present
- Operations technology lead and named successor, TotalTex Industry Limited, Dhaka, 2026 to present
- Product and engineering lead, Handled AI (CPSC 598 capstone), September 2026 to April 2027
- Vice President of Operations, Bangladeshi Students' Society, University of Calgary
- Looking for: summer 2027 internships

**Before**
- Specialty finance marketing and sales, a Calgary dealership, May to August 2024
- Sales representative, Vector Marketing (CUTCO), May to December 2023
- Sales and inventory manager, Prime Autos Calgary, October 2022 to February 2023
- AMVIC-registered salesperson, earned at Prime Autos

**School**
- BSc Computer Science, Faculty of Science, University of Calgary, expected April 2028
- Edexcel GCSE and International A Levels, Mastermind English Medium School, Dhaka, 3.94 of 4.0, 2022

**Off the clock**
- A 2008 BMW 335xi, six speed manual, BMW Individual Bernina Grey, mostly built by me
- A photography portfolio for my brother Sadman: 117 frames, full keyboard navigation

## (d) Handled entry for WORK

Same fields and types as the other `WORK` entries. Insert after `studio` or before it, Adnan's call on order (I would put it second, after Puzzled, because it is the newest and the one he is living in now).

```ts
{
  slug: "handled",
  name: "Handled AI",
  kind: "Home services app",
  year: "2026",
  line: "A photo in, a price range out, then a licensed Calgary plumber or heating pro booked.",
  lead: "Our CPSC 598 capstone venture, built by a team of three. A homeowner sends a photo and a line of text, sees a price range, and picks one of three licensed pros. I lead the product and the engineering.",
  does: [
    "Names the likely job and shows a price band. If the photo is not enough, it says so and offers a visit instead of guessing.",
    "Shows three licensed pros who can come, with the reason each was picked, then books one with a server-issued booking ID.",
    "Safety checks stop emergencies from being booked like routine jobs. Tested against 120 emergency scenarios.",
    "Says it is an AI, every time. A pro inbox and a text-only phone assistant demo are working.",
  ],
  stack: ["Expo", "React Native", "Cloudflare Workers", "Supabase"],
  status: "Student prototype",
  link: { label: "handled-ai.pages.dev", href: "https://handled-ai.pages.dev" },
  images: [],
},
```

Notes: `images` is empty because no screenshot exists yet that is safe to publish. Demo pros and prices in the app are fictional samples, so any capture is fine, but it has to be captured fresh. `link` needs the check in section 0, item 4.

## (e) Skill stack additions

Slugs are Simple Icons names. Only slugs marked "have" exist in `public/icons/` today. The rest need an svg added by the main session. A null slug appears in the list but not the globe.

| Tool | Group | Slug | Icon file | Why it is true |
|---|---|---|---|---|
| ElevenLabs | Media and 3D | elevenlabs | needs adding | On the resume skills line |
| Higgsfield | Media and 3D | null | none exists | On the resume, used for product cutouts and video |
| JEV | AI and automation | null | none exists | On the resume, Adnan confirmed 2026-11-06 he has used it |
| Remotion | Media and 3D | remotion | needs adding | `projects/motion-studio`, reels built in code |
| HyperFrames | Media and 3D | null | none exists | HTML to MP4 reels, installed and used |
| Blender | Media and 3D | blender | needs adding | 5.2 installed, the Handled mascot Bev is modelled in it |
| FFmpeg | Media and 3D | ffmpeg | needs adding | Installed, used in every reel render |
| Kokoro | Media and 3D | null | none exists | Open source local voiceover for the Handled reels |
| Fish Audio | AI and automation | null | none exists | On the resume as a voice tool |
| Expo | Web, mobile and motion | expo | needs adding | The Handled app |
| React Native | Web, mobile and motion | react | have | The Handled app (reuse the React icon) |
| Cloudflare | Data and infrastructure | cloudflare | needs adding | Workers for Handled, DNS for totaltex-bd.com |
| Supabase | Data and infrastructure | supabase | needs adding | Handled auth and data |
| Playwright | Data and infrastructure | playwright | needs adding | Real-Chrome verification on every site |

Group titles: rename "Web and motion" to **"Web, mobile and motion"** and add a new group **"Media and 3D"**. Do not add Ollama (see section 0).

## (f) Every user-facing string in `lib/content.ts`

"keep" means the old string is already in a human voice. Rewrites follow the three site rules: say what a thing is, no paragraph over 45 words, no dashes.

| Key | Old | New |
|---|---|---|
| SITE.name | Adnan Shakib | keep |
| SITE.email | adnanshakib.business@gmail.com | keep |
| SITE.links labels | LinkedIn, GitHub, WhatsApp | keep |
| SITE.description | Adnan Shakib builds the software behind a Calgary dealership operation and a Dhaka garment factory. Computer science at the University of Calgary. | Adnan Shakib, UCalgary computer science student. Builds software for a Calgary dealership business and a Dhaka garment factory. Open to summer 2027 internships. |
| NAV labels | Work, School, Info, Contact | keep |
| CHROME.clocks | Calgary, Dhaka | keep |
| CHROME.availability | Open to summer 2027 internships | keep |
| CHROME.toggleToNight | Switch to night sky | keep |
| CHROME.toggleToDay | Switch to day sky | keep |
| CHROME.menu, close, skip | Menu, Close, Skip to content | keep |
| HERO.lines | Systems / with taste | Two businesses. / One engineer. (alt: Written in Calgary. / Running in Dhaka.) |
| HERO.lead | I'm Adnan Shakib. I build the software that runs a car dealership operation in Calgary and a garment factory in Dhaka. If it's slow, ugly or vague, it isn't done. | I'm Adnan Shakib. I build the software two businesses run on: listings for car dealerships in Alberta and BC, and orders and billing for a garment factory in Dhaka. Slow, ugly or vague means it isn't done. |
| HERO.facts Studying | Computer Science, University of Calgary, April 2028 | keep |
| HERO.facts Running | Co-founder, Puzzled | keep |
| HERO.facts Taking over | Managing director, TotalTex | Named successor, TotalTex, Dhaka |
| HERO.facts Looking for | Summer 2027 internships | keep |
| SKILLS.label, hint | Tools, Drag it | keep |
| SKILLS group titles | Web and motion (others unchanged) | Web, mobile and motion. New group: Media and 3D |
| SKILLS item names | see content.ts | keep, plus section (e) |
| SERVICES.label | Services | keep |
| SERVICES.lines | What I'll / build you | keep |
| SERVICES Websites | Sites that look expensive and load fast. Design, build, motion, launch. | Fast sites that look designed. I do the design, the build, the motion and the launch. |
| SERVICES Internal tools | The order system, the dashboard, the spreadsheet you've outgrown, rebuilt as software your team will actually use. | The spreadsheet you've outgrown, rebuilt as software your team will actually use. Order systems and dashboards included. |
| SERVICES Automation | Scrapers, pipelines and AI agents that take the repetitive part of a job off someone's desk. | keep |
| SERVICES Dealership operations | Through Puzzled: inventory, listings, leads and paid social, run for you end to end. | Through Puzzled: I run the online side of your dealership, from inventory to the leads it brings in. |
| SERVICES.cta | Tell me what you need | keep |
| SIDE.label | Alongside school | keep |
| SIDE Puzzled | The dealership operation I co-run with my roommate. More than seven Calgary dealerships so far. | The dealership business I co-run with my roommate. Seven Alberta and BC dealerships at the peak, four active now. |
| SIDE TotalTex | My father's trims factory in Dhaka. I built its software and I'm next in line to run it. | My father's garment trims factory in Dhaka, about 250 people. I built its order system and I'm the named successor. |
| SIDE Handled AI | My CPSC 598 capstone venture: a home services platform, built with a team of three. | Our CPSC 598 capstone: a home services app for Calgary homeowners. I lead product and engineering on a team of three. |
| SIDE The studio | My own setup where Claude, Codex and Gemini build in parallel and review each other's work. | keep |
| FAQ.label | Questions | keep (items still empty) |
| WORK_LABEL | Selected work | keep |
| WORK_CTA | View, View project | keep |
| WORK_META labels | Kind, Year, Stack, Status, What it does | keep |
| WORK puzzled year | Since 2023 | Since 2024 |
| WORK puzzled lead | Puzzled runs the online side of car dealerships in Calgary: inventory, listings, ads and the leads they bring in. More than seven dealerships and dealer families so far. I built the software underneath. | Puzzled runs the online side of car dealerships in Alberta and BC: inventory, listings, ads and the leads they bring in. Seven dealerships at the peak, four active now. I built the software underneath. |
| WORK puzzled line, kind, status, stack | see content.ts | keep |
| WORK puzzled does 2 | Writes listing copy from the record only, with the disclaimer each province requires. | Writes listing copy from the record only, inside the provincial advertising rules. |
| WORK puzzled does 1, 3, 4 | see content.ts | keep |
| WORK totaltex-ops | all fields | keep |
| WORK totaltex-web does (add) | n/a | add a fourth line: Mobile Lighthouse scores of 90 to 94. |
| WORK totaltex-web other fields | all fields | keep |
| WORK fittrack | all fields | keep |
| WORK studio | all fields | keep |
| WORK handled | does not exist | new entry, section (d) |
| CAR.card | The E92 / 335xi, six speed manual, BMW Individual Bernina Grey. Mostly built by me. | keep |
| CAR.label, lines, title | Off the clock, The / E92, 2008 BMW 335xi | keep |
| CAR.lead | An all wheel drive, three pedal N54 coupe that BMW left a lot on the table with. I picked it up. | An all wheel drive, three pedal N54 coupe. BMW left a lot of power on the table, so I've been collecting it. |
| CAR.specs | nine rows | keep (from the saved build notes, no flagged items) |
| CAR.signOff | Bernina Grey. RB twins. Bad intentions. | keep |
| OTHER.left, right, label | Other, Things, Smaller builds | keep |
| OTHER This site | Two skies, one page. Next.js, Three.js and GSAP. | keep |
| OTHER Motion studio | Product reels made in code with Remotion. | Product reels made in code with Remotion and HyperFrames. |
| OTHER Class steward | A Discord bot for my capstone class. It mirrors instructor posts into one channel and audits the server's permissions. | keep |
| TASTE.label | Taste | keep |
| TASTE.lines | I see the / 2px that's / off. | I can taste / a bad margin. (alt: Taste buds / for software.) |
| TASTE.body | Most software works and looks like nobody cared. I sweat spacing, type and motion the way I sweat a database schema, because people judge the whole thing at once. I don't ship slop. | Spacing, type and motion are where software shows whether anyone cared. I check them the way I check a database schema: closely, and before it ships. |
| METHOD.label | How I work | keep |
| METHOD items | three items | keep (specific, and the 1,069 figure stays) |
| INFO.label | Info | keep |
| INFO.bio | Born in Dhaka, studying computer science in Calgary, graduating April 2028. I co-run Puzzled and I'm stepping in as managing director of TotalTex, the trims factory my father founded. Off the clock: an E92 335xi in BMW Individual Bernina Grey, mostly built by me. | Section (c) |
| INFO.lists | Now, Before, School | Section (c), adds Off the clock |
| SCHOOL.label, lines | School, University / of Calgary | keep |
| SCHOOL.lead | The degree runs alongside the work on this site, not instead of it. | The degree runs alongside the work, not instead of it. |
| SCHOOL.facts | Degree, Capstone, Graduating, Looking for | keep |
| SCHOOL.sections Now | CPSC 598, the entrepreneurship capstone | keep, body too |
| SCHOOL.sections venture | Handled AI | keep, body too |
| SCHOOL.sections Class steward | Class steward | keep, body too |
| SCHOOL.sections (add) | n/a | New: label "Outside class", title "Bangladeshi Students' Society", body "I'm Vice President of Operations for the society at the University of Calgary this term." |
| SCHOOL.courses, coursesLabel, back | course names, Coursework, Back to home | keep |
| CONTACT.lines | Let's build / something | keep |
| CONTACT.body | Email is fastest. I answer everything. | keep |
| CONTACT.copy, copied, mail | Copy email, Copied, Open in mail app | keep |
| CONTACT.availability | Open to summer 2027 internships and freelance builds. | keep |
| FOOTER.copyright | © 2026 Adnan Shakib | keep |
| FOOTER.made | Built by hand in Calgary | Made in Calgary |
| FOOTER.top, next | Back to top, Next project | keep |
| INTRO.label | Loading | keep |
