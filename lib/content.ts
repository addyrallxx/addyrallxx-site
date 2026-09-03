/**
 * Every user facing word on the site, in one file.
 *
 * Two reasons it lives here rather than inline in components. The words are
 * the part most likely to be wrong, so they should be reviewable in one
 * place without reading JSX. And the deploy gates grep this file directly
 * for the failure modes the previous version shipped.
 *
 * Rules this file is written to, all of them reactions to a real defect in
 * the version it replaces:
 *
 *   1. No em dashes, no en dashes. Standing rule across the repo.
 *   2. No line counts, file counts or commit counts. The old copy said
 *      "95 source files, 12,501 lines, 27 commits". Nobody is impressed by
 *      a line count and it reads as padding.
 *   3. No manufactured aphorisms. The old copy closed nearly every section
 *      with a "X is not a Y, it is a Z" snap. Ban the construction.
 *   4. No confession blocks. Being specific is what makes a claim credible.
 *      Announcing that you are being honest does not.
 *   5. Nothing about an AI, a model, a handover or a verification process.
 *      The old site told visitors an AI had invented revenue figures about
 *      the family business.
 *   6. First person, short sentences, no adjectives about himself.
 *
 * Confidentiality, from PLAN.md section 7 and binding: no TotalTex
 * financials, addresses or ownership split; client dealerships are never
 * named and stop at "Calgary dealerships", with a count but never a name; immigration detail
 * stops at "Bangladeshi citizen studying in Canada"; nothing sourced from
 * totaltex-ops/samples.
 */

export type Link = { label: string; href: string };

/*
  Confirmed by Adnan 2026-09-02.

  The public address is the business one, not the personal gmail the old
  resumes carry. No phone number goes on the site. LinkedIn and GitHub only,
  no Instagram. Staying on the vercel.app URL for now, no domain purchase.

  This is the only place an address is written. Nothing may hardcode a
  mailto anywhere else, so changing it stays a one line change.
*/
export type ContactLink = {
  label: string;
  href: string | null;
  icon: "email" | "linkedin" | "github" | "whatsapp";
};

export const SITE = {
  name: "Adnan Shakib",
  location: "Calgary, Alberta",
  email: "adnanshakib.business@gmail.com",
  /*
    Adnan supplied this number himself on 2026-09-02, reversing his earlier
    call that no phone number would appear on the site. wa.me wants the
    country code with no plus, no spaces and no dashes.

    No prefilled ?text= message. It would put an opening line in the
    visitor own words before they have written one, and every consumer of
    this list still skips an entry whose href is null, so the mechanism that
    kept this row hidden is unchanged.
  */
  whatsapp: "15878941429" as string | null,
  links: [
    { label: "Email", href: "mailto:adnanshakib.business@gmail.com", icon: "email" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/adnanshakib/", icon: "linkedin" },
    { label: "GitHub", href: "https://github.com/addyrallxx", icon: "github" },
    { label: "WhatsApp", href: "https://wa.me/15878941429", icon: "whatsapp" },
  ] satisfies ContactLink[],
};

export const NAV = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] satisfies Link[];

export const HERO = {
  eyebrow: "Calgary, Alberta",
  headline: "I sold cars, then I automated the part I hated.",
  lead: "Puzzled is the company my roommate and I run. We take over the online side of a dealership, from the inventory through to the ads, and we have done it for more than seven Calgary dealerships and dealer families. In Dhaka, the order system I built runs my father's factory from the first order to the final bill. I am doing a computer science degree at the University of Calgary at the same time.",
  primary: { label: "See the work", href: "#work" } satisfies Link,
  secondary: { label: SITE.email, href: `mailto:${SITE.email}` } satisfies Link,
};

export const CURRENTLY = [
  {
    label: "Company",
    name: "Puzzled",
    role: "Co-founder, and the one who writes the software",
    place: "Calgary, since 2023",
    detail: "Inventory, listings, ads and the leads they bring in. More than seven dealerships so far.",
  },
  {
    label: "Family business",
    name: "TotalTex",
    role: "Incoming managing director",
    place: "Dhaka",
    detail: "A garment trims factory my father founded in 2014. I built the software it runs on.",
  },
  {
    label: "School",
    name: "University of Calgary",
    role: "Computer science, Faculty of Science",
    place: "Graduating April 2028",
    detail: "Third year. I take the systems and databases courses first.",
  },
];

/*
  Education. Present because the primary reader is a recruiter filling a
  summer 2027 internship, and the first thing that reader looks for is a
  graduation date. Leaving it to be inferred from "since 2022" was making
  them do arithmetic.
*/
export const EDUCATION = [
  {
    institution: "University of Calgary",
    credential: "BSc Computer Science, Faculty of Science",
    period: "2022 to April 2028",
    place: "Calgary, Alberta",
    detail:
      "Coursework across data structures, algorithms, databases, operating systems, software engineering and computer networks.",
  },
  {
    institution: "Mastermind English Medium School",
    credential: "Edexcel GCSE and International A Levels",
    period: "Completed 2022",
    place: "Dhaka, Bangladesh",
    detail: "Graduated with a 3.94 of 4 average.",
  },
];

/**
 * Experience. Three entries, and the shape of the list is the argument: two
 * automotive businesses and a manufacturer, which reads as a deliberate
 * track rather than a student taking whatever came up.
 *
 * Puzzled started in 2023, confirmed by Adnan on 2026-09-02. It was
 * previously written as "Current" because no start date existed anywhere on
 * this machine and inventing one was not an option.
 */
export const EXPERIENCE = [
  {
    company: "Puzzled",
    role: "Co-founder",
    period: "2023 to now",
    place: "Calgary, Alberta",
    summary:
      "My roommate and I take over the online side of a dealership and run it end to end: inventory, listings, lead generation, finance applications, social media and paid boosting. More than seven Calgary dealerships and dealer families so far. He owns the accounts and the relationships. I write the software underneath all of it.",
    points: [
      "Built the inventory scraper and the listing generator the whole operation runs on.",
      "Audited every live description against the provincial advertising regulator's rules.",
      "Handle the paid social and the lead routing that turns a listing into a conversation.",
      "Both of us are AMVIC licensed and registered with the dealerships we represent.",
    ],
    tags: ["Python", "Automation", "Paid social", "AMVIC"],
  },
  {
    /*
      Added 2026-09-02. Adnan confirmed he is taking over as managing
      director and that naming TotalTex is a decision he and his father made
      together and both want on the site.

      It sits in Experience rather than only in Work because "the reason a
      computer science student wrote a factory order system" is the single
      most useful piece of context on the page, and a project card cannot
      carry it. Deliberately no start date for the directorship, because no
      date has been given and inventing one is not an option.
    */
    company: "TotalTex Industry Limited",
    role: "Incoming Managing Director",
    period: "Current",
    place: "Dhaka, Bangladesh",
    summary:
      "My father founded TotalTex in 2014 and I am taking it over. For now I advise, and I build the software the floor runs on.",
    points: [
      "Wrote the internal order system that replaced the paper chain from order to bill.",
      "Built and shipped the company's public site onto its own domain.",
      "Sit in on the operational decisions I will eventually be the one making.",
    ],
    tags: ["Operations", "Manufacturing", "Succession"],
  },
  {
    company: "Prime Autos Calgary",
    role: "Sales and Inventory Manager",
    period: "October 2022 to February 2023",
    place: "Calgary, Alberta",
    summary:
      "My first job in the industry, and the reason the rest of this exists. I sourced cars at auction, negotiated them in, and put them online.",
    points: [
      "Rebuilt the dealership's website and its listings on Facebook, Kijiji and Carfax.",
      "Earned my AMVIC licence here, which Alberta requires of anyone selling a vehicle.",
      "Trained a new hire onto the inventory process.",
    ],
    tags: ["Sales", "Inventory", "Marketing"],
  },
];

/**
 * Selected work. Ordered by how much of it a stranger can verify: the two
 * with public URLs are reachable right now, the internal one is not.
 */
export const WORK = [
  {
    id: "puzzled",
    name: "Puzzled",
    kind: "Dealership operations",
    year: "2023 to now",
    headline: "Three dealer platforms in, one listing out, three times a day.",
    body: "Puzzled runs the online side of a dealership: inventory, listings, lead generation, finance applications, social media and paid boosting. This is the part I built. Three times a day a scraper reads each client's live inventory across three different dealer platforms. A rule driven generator then writes the listing copy. It states only what is in the record, picks a selling angle from those facts, and attaches the disclaimer that client's province requires, because the clients are not all in the same one.",
    detail: [
      "I audited 1,069 live descriptions against the provincial advertising regulator's rules. Two were violations, and both predated anything I wrote.",
      "A stale cache meant 58 cars were still listed after they sold, and 38 price changes had never gone out. Nobody had reported it.",
      "The software never touches Facebook Marketplace itself. The accounts belong to the clients and they are the actual product, so the automation stops at the edge of the platform and a person posts.",
    ],
    tags: ["Python", "curl_cffi", "Scheduled jobs"],
    links: [] satisfies Link[],
    note: "Private, client data.",
  },
  {
    id: "totaltex-ops",
    name: "TotalTex Ops",
    kind: "Internal order system",
    year: "2026",
    headline: "Runs a Dhaka factory from first order to final bill.",
    body: "Order, job card, proforma invoice, production, delivery challan, bill. All of it was paper. A generic ERP models a product as a variant of a variant. A trims factory needs a spec sheet per product line, and that spec has to drive two things at once: the form a clerk types into, and the printed description on the invoice. One typed template generates both.",
    detail: [
      "Money and quantities are exact decimals, never floats. Challan and bill lines snapshot their values rather than joining, so editing a price later cannot rewrite a document that already shipped.",
      "Editing a job used to delete its lines and reinsert them. The form never sent the line id, so a cascading foreign key quietly erased recorded production. I found it reading my own schema. The fix was a diff based update, and a key changed to RESTRICT so the database now refuses that shape of mistake even if I write the bug again.",
    ],
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle"],
    links: [] satisfies Link[],
    note: "Runs inside the factory. Screenshots are from seeded demo data.",
  },
  {
    id: "totaltex-web",
    name: "TotalTex Web",
    kind: "Public site",
    year: "2026",
    headline: "The factory's site, on its own domain since August.",
    body: "Moved onto the real domain with no downtime and no interruption to mail. Built around real production photography rather than stock, because a trims factory selling to apparel brands is judged on what it actually makes.",
    detail: [
      "Its structured data declared a type that does not exist in schema.org. The address, opening hours and phone number had been invisible to search since the day it launched, and nothing on the page looked wrong.",
    ],
    tags: ["Next.js", "React Three Fiber", "GSAP"],
    links: [{ label: "totaltex-bd.com", href: "https://totaltex-bd.com" }] satisfies Link[],
    note: "",
  },
  {
    id: "fittrack",
    name: "FitTrack",
    kind: "Offline PWA",
    year: "2026",
    headline: "A workout and nutrition tracker that works with no signal.",
    body: "One HTML file. No framework, no build step, no bundler. It installs to a phone home screen and keeps working offline. The constraint was that it still run years from now on any host at all, which costs modularity and buys permanence.",
    detail: [
      "Nutrition data comes from Open Food Facts, weight history renders in Chart.js, and a service worker keeps the whole thing usable with no connection.",
    ],
    tags: ["Vanilla JS", "Service Worker", "Chart.js"],
    links: [
      { label: "Open it", href: "https://addyrallxx.github.io/fittrack/fittrack.html" },
    ] satisfies Link[],
    note: "",
  },
];

/**
 * Skills. The technology list feeds the draggable sphere, so every entry
 * here needs a matching Simple Icons slug (fetched through the
 * company-logos skill, Iconify, free and MIT). `slug` is that identifier.
 *
 * The business row is deliberately separate and deliberately present. It is
 * the half of this person a normal CS portfolio hides, and it is the half
 * that explains why the dealership work exists.
 */
/**
 * A slug of null means there is no brand mark to draw, so the sphere renders
 * the name as a text tile instead. Three cases hit this: OpenAI was pulled
 * from Simple Icons over trademark, and LLMs and RAG are whole categories
 * rather than products with a logo. Inventing a mark for any of them would
 * be worse than showing the words.
 */
export const SKILLS = {
  groups: [
    {
      title: "Languages",
      items: [
        { name: "Python", slug: "python" },
        { name: "TypeScript", slug: "typescript" },
        { name: "JavaScript", slug: "javascript" },
        { name: "Java", slug: "openjdk" },
        { name: "SQL", slug: "postgresql" },
      ],
    },
    {
      title: "Web",
      items: [
        { name: "Next.js", slug: "nextdotjs" },
        { name: "React", slug: "react" },
        { name: "Tailwind CSS", slug: "tailwindcss" },
        { name: "Node.js", slug: "nodedotjs" },
        { name: "GSAP", slug: "greensock" },
      ],
    },
    {
      title: "Data and infrastructure",
      items: [
        { name: "PostgreSQL", slug: "postgresql" },
        { name: "Drizzle", slug: "drizzle" },
        { name: "Docker", slug: "docker" },
        { name: "Vercel", slug: "vercel" },
        { name: "Git", slug: "git" },
      ],
    },
    {
      title: "AI and automation",
      items: [
        { name: "Claude Code", slug: "claude" },
        { name: "Codex", slug: null },
        { name: "Gemini", slug: "googlegemini" },
        { name: "MCP", slug: "modelcontextprotocol" },
        { name: "LangChain", slug: "langchain" },
        { name: "Hugging Face", slug: "huggingface" },
        { name: "LLMs", slug: null },
        { name: "RAG", slug: null },
        { name: "n8n", slug: "n8n" },
        { name: "Zapier", slug: "zapier" },
      ],
    },
    {
      title: "Machine learning and scientific",
      items: [
        { name: "PyTorch", slug: "pytorch" },
        { name: "CUDA", slug: "nvidia" },
        { name: "Kotlin", slug: "kotlin" },
        { name: "LaTeX", slug: "latex" },
      ],
    },
  ],
  business: {
    title: "The other half",
    body: "I have run auction sourcing, inventory and paid social for a dealership, and I keep the books for the business I co-own. I did each of those by hand before I wrote anything to do them.",
  },
};

/**
 * The warm band. This is the section where the ground flips to paper and
 * the display face becomes a serif.
 *
 * Facts checked before writing. The time difference between Dhaka and
 * Calgary is twelve or thirteen hours depending on daylight saving, so the
 * number is deliberately not stated. An earlier draft of this site asserted
 * fourteen, which was wrong.
 */
export const ABOUT = {
  eyebrow: "Off the clock",
  headline: "Dhaka, then Calgary.",
  paragraphs: [
    "I grew up in Dhaka and moved to Calgary for school. I go back every summer. There is no direct flight, so it is always two planes and most of two days.",
    "My father started TotalTex in 2014. I am taking it over as managing director. We decided that together, and I am learning the business from him while I finish the degree. The software was where I could start.",
  ],
  /*
    The car. Deliberately three sentences and no parts list.

    An earlier draft of this block carried a five row spec table naming the
    turbos, the tune and the coilover brand. Two reasons it is gone. Adnan
    asked for the car woven into the copy rather than given a section of its
    own, and a spec sheet is a section. And a parts list is where an
    interesting detail turns into a car forum post, which is not the read
    anyone wants from a recruiter skimming a student's portfolio.

    One number survives because it is the one that means anything, and the
    sentence after it is the point.

    The single M tricolour rule on the site sits with this block.
  */
  car: {
    heading: "The E92",
    body: "There has been a black 335xi in my garage for about a year, and most of what is on it now I put there myself. It makes around 600 wheel horsepower on its most aggressive map. I care more that it drives well cold and starts every morning.",
  },
};

/**
 * Contact. Modelled on cade.codes, which Adnan singled out: one warm line,
 * a direct ask, and no form theatre.
 *
 * It names all three things he actually wants, because the alternative is
 * "open to what is next", which was the weakest line on the old site and
 * asks the reader to guess.
 */
export const CONTACT = {
  eyebrow: "Contact",
  headline: "Say hello.",
  body: "I am looking for a software internship for summer 2027. I also take freelance builds. And if you run a dealership, I will show you what a week of listing work looks like once this is doing it. Email is the fastest way to reach me.",
  email: SITE.email,
};

export const FOOTER = {
  line: "Built in Calgary.",
  signature: "Built by Adnan Shakib",
  year: 2026,
};
