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
 * Rule 6 is the one that carries the voice, and it is worth saying what it
 * is doing. Adnan asked for copy that sounds capable and in command rather
 * than studious. The way to get that is not to add adjectives, it is to
 * remove hedges and state what he has actually done, in the order a person
 * would say it out loud. "More than seven Calgary dealerships" outranks
 * "highly experienced" every time, and it is checkable.
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
  resumes carry. LinkedIn and GitHub only, no Instagram. Staying on the
  vercel.app URL for now, no domain purchase.

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
  { label: "Next", href: "#next" },
  { label: "Skills", href: "#skills" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] satisfies Link[];

/**
 * The hero.
 *
 * The headline was open going into this pass. Two candidates were live: the
 * shipped "I sold cars, then I automated the part I hated." and a swap to
 * "I sold cars, then I wrote the software that does it for me."
 *
 * Called in favour of the swap, split into two sentences. The original is
 * funnier but it centres a grievance, and the first thing a stranger reads
 * should centre capability. Two sentences also lets the second one land on
 * its own beat instead of trailing off a comma.
 */
export const HERO = {
  eyebrow: "Calgary, via Dhaka",
  headline: "I sold cars. Then I built the software that does it for me.",
  lead: "My roommate and I run Puzzled. A dealership hands us its entire online operation and we run it, from the inventory through to the ads, and we have done it for more than seven Calgary dealerships and dealer families. In Dhaka, the system I wrote runs my father's factory from the first order to the final bill. Third year computer science at the University of Calgary in between.",
  primary: { label: "See the work", href: "#work" } satisfies Link,
  secondary: { label: "Start a conversation", href: "#contact" } satisfies Link,
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

/**
 * How I work.
 *
 * New this pass, and it is the section Adnan asked for by name: the skills,
 * the mindset, the goals. A portfolio that only lists what someone shipped
 * makes the reader reverse engineer how that person thinks, and most
 * readers will not bother.
 *
 * Four principles rather than three, deliberately. Three reads as a slogan
 * set. Every one of them is traceable to something already true elsewhere
 * in this file, so none of them is a slogan he would have to live up to
 * later.
 */
export const MINDSET = {
  eyebrow: "How I work",
  headline: "I do the job by hand before I write anything to do it.",
  lead: "That is the whole method. Every piece of software on this page exists because I was already doing the work manually, badly, at volume, and I knew exactly which part was costing me the day.",
  principles: [
    {
      title: "Do it by hand first",
      body: "I sourced cars at auction and wrote listings by hand before I automated any of it. You cannot design the tool for a job you have never done.",
    },
    {
      title: "Then go and measure it",
      body: "I audited 1,069 live listings against the regulator's rules rather than assuming they were fine. The cache bug I found had been quietly wrong for weeks and nobody had reported it.",
    },
    {
      title: "Own the whole problem",
      body: "Scraper, listing copy, ad spend, the lead that comes back, the invoice at the end. I would rather own a problem end to end than a clean slice of one.",
    },
    {
      title: "Money is part of the engineering",
      body: "I keep the books for the business I co-own. If a system cannot pay for itself I want to know before I build it, not after.",
    },
  ],
};

/*
  Education. Present because one of the readers is a recruiter filling a
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
      "We take a dealership's online operation off its hands and run the whole thing: inventory, listings, lead generation, finance applications, social media and paid boosting. More than seven Calgary dealerships and dealer families so far. My roommate owns the accounts and the relationships. I own everything underneath them.",
    points: [
      "Built the inventory scraper and the listing generator the whole operation runs on.",
      "Audited every live description against the provincial advertising regulator's rules.",
      "Run the paid social and the lead routing that turns a listing into a conversation.",
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
 *
 * Headlines carry the interesting claim and `body` carries the shape of the
 * thing. `detail` is where the one hard technical fact per project lives.
 * That split is deliberate: a reader skimming gets the story, a reader who
 * stops gets the proof, and neither one has to wade through the other.
 */
export const WORK = [
  {
    id: "puzzled",
    name: "Puzzled",
    kind: "Dealership operations",
    year: "2023 to now",
    headline: "Three dealer platforms in, one listing out, three times a day.",
    body: "Puzzled runs the online side of a dealership. This is the part I built. Three times a day a scraper reads each client's live inventory across three different dealer platforms. A rule driven generator then writes the listing copy. It states only what is in the record, picks a selling angle from those facts, and attaches the disclaimer that client's province requires, because the clients are not all in the same one.",
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
    headline: "One HTML file. No build step. Works with no signal.",
    body: "A workout and nutrition tracker that installs to a phone home screen and keeps working with no connection. No framework, no bundler, nothing to compile: the entire app is a single file you can drop on any static host and open. That costs modularity and buys permanence, and permanence was the trade I wanted.",
    detail: [
      "Nutrition data comes from Open Food Facts, weight history renders in Chart.js, and a service worker keeps every screen usable offline.",
      "The bar I held it to was whether it would still run years from now, unchanged, on a host that does not exist yet.",
    ],
    tags: ["Vanilla JS", "Service Worker", "Chart.js"],
    links: [
      { label: "Open it", href: "https://addyrallxx.github.io/fittrack/fittrack.html" },
    ] satisfies Link[],
    note: "",
  },
];

/**
 * Up next.
 *
 * New this pass. Adnan asked for what is upcoming to be as visible as what
 * is already shipped, which is the right instinct for someone whose most
 * interesting item (running a manufacturer) has not happened yet.
 *
 * Every entry here is drawn from a fact already settled elsewhere in this
 * file or already confirmed by Adnan. Nothing is a projection and nothing
 * carries a date that was not given. If a plan is not in here it is because
 * nobody has stated it, not because it was judged uninteresting.
 */
export const NEXT = {
  eyebrow: "Up next",
  headline: "What I am moving toward.",
  items: [
    {
      when: "Summer 2027",
      title: "A software internship",
      body: "I want the one where somebody hands me a system that is already on fire and expects me to have opinions by Friday.",
    },
    {
      when: "Ongoing",
      title: "Taking over TotalTex",
      body: "My father founded it in 2014 and I am stepping in as managing director. I am learning the business from him while I finish the degree.",
    },
    {
      when: "Ongoing",
      title: "More of Puzzled running itself",
      body: "More dealerships, and more of the pipeline running unattended right up to the point where a person has to post. That last step stays human on purpose.",
    },
    {
      when: "April 2028",
      title: "The degree",
      body: "Computer science at the University of Calgary. Systems and databases first, because that is what the rest of this needs.",
    },
  ],
};

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
    body: "Auction sourcing, inventory, paid social and the books for the business I co-own. I ran every one of those by hand before I wrote a line of software to do it, which is why the software knows where the work actually is.",
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
 * Contact.
 *
 * Rewritten this pass against a direct instruction from Adnan: he wants
 * reaching out to feel easy and slightly irresistible, and he named the
 * three doors he wants open. Something interesting, something to build,
 * something with money in it.
 *
 * So the three `openers` are his own framing, tidied. They do the work a
 * contact form pretends to do, which is telling a stranger what counts as a
 * reasonable reason to write, without making them fill anything in. The old
 * version listed the same three things inside one paragraph and every one
 * of them got skimmed past.
 */
export const CONTACT = {
  eyebrow: "Contact",
  headline: "Tell me what you are building.",
  body: "I answer everything. Email is the fastest way to reach me, and WhatsApp is there if it is urgent.",
  openers: [
    {
      label: "Something interesting",
      body: "If you have something good going on, I want to hear about it. You do not need a pitch and you do not need a budget yet.",
    },
    {
      label: "Something to build",
      body: "Tell me what it has to do. I will tell you how I would build it, what it costs you, and how long it takes.",
    },
    {
      label: "Something with money in it",
      body: "If it involves revenue or a business, put me in the conversation. That half of the room is not a mystery to me.",
    },
  ],
  availability: "Open to a software internship for summer 2027, and taking freelance builds now.",
  email: SITE.email,
};

export const FOOTER = {
  line: "Built in Calgary.",
  signature: "Built by Adnan Shakib",
  year: 2026,
};
