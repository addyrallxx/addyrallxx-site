/**
 * Every user facing word on the site, in one file. Components import from
 * here and hold no strings of their own.
 *
 * Level 4 rules (2026-10-09): say what a thing is and what it does. No
 * paragraph over 45 words, no section over 80. No line counts, no
 * confession blocks, no em or en dashes. Facts only from Adnan or the
 * repos; confidentiality per PLAN.md section 7 (dealerships never named,
 * no TotalTex financials, nothing from totaltex-ops/samples).
 */

export type Link = { label: string; href: string };

export const SITE = {
  name: "Adnan Shakib",
  email: "adnanshakib.business@gmail.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/adnanshakib/" },
    { label: "GitHub", href: "https://github.com/addyrallxx" },
    { label: "WhatsApp", href: "https://wa.me/15878941429" },
  ] satisfies Link[],
  description:
    "Adnan Shakib builds the software behind a Calgary dealership operation and a Dhaka garment factory. Computer science at the University of Calgary.",
};

export const NAV = [
  { label: "Work", href: "/#work" },
  { label: "Info", href: "/#info" },
  { label: "Contact", href: "/#contact" },
] satisfies Link[];

export const CHROME = {
  clocks: [
    { city: "Calgary", zone: "America/Edmonton" },
    { city: "Dhaka", zone: "Asia/Dhaka" },
  ],
  availability: "Open to summer 2027 internships",
  toggleToNight: "Switch to night sky",
  toggleToDay: "Switch to day sky",
  menu: "Menu",
  close: "Close",
  skip: "Skip to content",
};

export const HERO = {
  lines: ["Systems", "with taste"],
  lead: "I'm Adnan Shakib. I build the software that runs a car dealership operation in Calgary and a garment factory in Dhaka. If it's slow, ugly or vague, it isn't done.",
  // The resume line. A recruiter gets who, where, when and what next
  // before scrolling, so the display line never has to carry it.
  facts: [
    { label: "Studying", value: "Computer Science, University of Calgary, April 2028" },
    { label: "Running", value: "Co-founder, Puzzled" },
    { label: "Taking over", value: "Managing director, TotalTex" },
    { label: "Looking for", value: "Summer 2027 internships" },
  ],
};

// The sphere returns from the previous design, restyled to Level 4 tokens.
// Every slug has a file at public/icons/<slug>.svg; null means name only.
export const SKILLS = {
  label: "Tools",
  hint: "Drag it",
  groups: [
    { title: "Languages", items: [
      { name: "Python", slug: "python" }, { name: "TypeScript", slug: "typescript" }, { name: "JavaScript", slug: "javascript" },
      { name: "Java", slug: "openjdk" }, { name: "Kotlin", slug: "kotlin" }, { name: "SQL", slug: null },
    ] },
    { title: "Web and motion", items: [
      { name: "Next.js", slug: "nextdotjs" }, { name: "React", slug: "react" }, { name: "Tailwind CSS", slug: "tailwindcss" },
      { name: "Node.js", slug: "nodedotjs" }, { name: "GSAP", slug: "greensock" }, { name: "Three.js", slug: null },
    ] },
    { title: "Data and infrastructure", items: [
      { name: "PostgreSQL", slug: "postgresql" }, { name: "Drizzle", slug: "drizzle" }, { name: "Docker", slug: "docker" },
      { name: "Vercel", slug: "vercel" }, { name: "Git", slug: "git" },
    ] },
    { title: "AI and automation", items: [
      { name: "Claude Code", slug: "claude" }, { name: "Codex", slug: null }, { name: "Gemini", slug: "googlegemini" },
      { name: "MCP", slug: "modelcontextprotocol" }, { name: "LangChain", slug: "langchain" }, { name: "Hugging Face", slug: "huggingface" },
      { name: "n8n", slug: "n8n" }, { name: "Zapier", slug: "zapier" },
    ] },
    { title: "ML and research", items: [
      { name: "PyTorch", slug: "pytorch" }, { name: "CUDA", slug: "nvidia" }, { name: "LaTeX", slug: "latex" },
    ] },
  ],
};

export const SERVICES = {
  label: "Services",
  lines: ["What I'll", "build you"],
  items: [
    { name: "Websites", line: "Sites that look expensive and load fast. Design, build, motion, launch." },
    { name: "Internal tools", line: "The order system, the dashboard, the spreadsheet you've outgrown, rebuilt as software your team will actually use." },
    { name: "Automation", line: "Scrapers, pipelines and AI agents that take the repetitive part of a job off someone's desk." },
    { name: "Dealership operations", line: "Through Puzzled: inventory, listings, leads and paid social, run for you end to end." },
  ],
  cta: "Tell me what you need",
};

// What runs alongside the degree. Ordered by hours, not prestige.
export const SIDE = {
  label: "Alongside school",
  items: [
    { name: "Puzzled", line: "The dealership operation I co-run with my roommate. More than seven Calgary dealerships so far." },
    { name: "TotalTex", line: "My father's trims factory in Dhaka. I built its software and I'm next in line to run it." },
    { name: "Handled AI", line: "My CPSC 598 capstone venture: a home services platform, built with a team of three." },
    { name: "The studio", line: "My own setup where Claude, Codex and Gemini build in parallel and review each other's work." },
  ],
};

// Written last, per Adnan (2026-10-10). Placeholder until the copy pass.
export const FAQ = {
  label: "Questions",
  items: [] as { q: string; a: string }[],
};

export type Project = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  line: string;
  lead: string;
  does: string[];
  stack: string[];
  status: string;
  link?: Link;
  images: { src: string; alt: string }[];
};

export const WORK: Project[] = [
  {
    slug: "puzzled",
    name: "Puzzled",
    kind: "Dealership listings pipeline",
    year: "Since 2023",
    line: "Reads dealer inventory three times a day and writes a compliant listing for every car.",
    lead: "Puzzled runs the online side of car dealerships in Calgary: inventory, listings, ads and the leads they bring in. More than seven dealerships and dealer families so far. I built the software underneath.",
    does: [
      "Pulls each client's live inventory from three dealer platforms, three times a day.",
      "Writes listing copy from the record only, with the disclaimer each province requires.",
      "Catches sold cars and price changes so nothing stale stays up.",
      "Stops at the platform. A person posts every listing, on purpose.",
    ],
    stack: ["Python", "curl_cffi", "Scheduled jobs"],
    status: "Private, client data",
    images: [],
  },
  {
    slug: "totaltex-ops",
    name: "TotalTex Ops",
    kind: "Factory order system",
    year: "2026",
    line: "Takes a garment trims order from first quote to final bill, every document from one record.",
    lead: "An order system for a garment trims factory in Dhaka. One order record produces the job card, proforma invoice, delivery challan and bill, and replaces a paper chain.",
    does: [
      "One typed spec per product line drives both the entry form and the printed invoice.",
      "Money and quantities are exact decimals. A shipped document never changes after the fact.",
      "The database refuses the kind of edit that could erase recorded production.",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle"],
    status: "In use at the factory",
    images: [],
  },
  {
    slug: "totaltex-web",
    name: "TotalTex Web",
    kind: "Factory website",
    year: "2026",
    line: "The public face of a Dhaka trims factory, built on its real production photography.",
    lead: "The public site for TotalTex, on its own domain. Built around the factory's real production photography, because buyers judge a trims supplier by what it makes.",
    does: [
      "Moved to its own domain with no downtime and no break in mail.",
      "A page for each of eleven product lines, with an inquiry form that knows which line you came from.",
      "Structured data that search engines can actually read.",
    ],
    stack: ["Next.js", "React Three Fiber", "GSAP"],
    status: "Live",
    link: { label: "totaltex-bd.com", href: "https://totaltex-bd.com" },
    images: [
      { src: "/totaltex/conning-floor-wide.jpg", alt: "The TotalTex production floor in Dhaka" },
      { src: "/totaltex/trims-range-flatlay.jpg", alt: "A flat lay of TotalTex garment trims" },
      { src: "/totaltex/loom-spools-detail.jpg", alt: "Thread spools on a loom at TotalTex" },
    ],
  },
  {
    slug: "fittrack",
    name: "FitTrack",
    kind: "Offline fitness app",
    year: "2026",
    line: "Workouts, food and weight in one installable app that works with no signal.",
    lead: "A workout, food and weight tracker that installs to your phone and keeps working with no signal. The whole app is one HTML file with no build step.",
    does: [
      "Logs a set or a meal in two taps, with undo.",
      "Food data from Open Food Facts, and weight trends you can scrub through.",
      "Runs offline through a service worker. Version 1.2 is live.",
    ],
    stack: ["Vanilla JS", "Service Worker", "Chart.js"],
    status: "Live",
    link: { label: "Open FitTrack", href: "https://addyrallxx.github.io/fittrack/fittrack.html" },
    images: [
      { src: "/fittrack/fittrack-home-dashboard.png", alt: "FitTrack home dashboard" },
      { src: "/fittrack/fittrack-workout-session.png", alt: "A FitTrack workout session" },
      { src: "/fittrack/fittrack-progress-weight-trend.png", alt: "FitTrack weight trend chart" },
    ],
  },
  {
    slug: "studio",
    name: "The Studio",
    kind: "AI build system",
    year: "2026",
    line: "Claude, Codex and Gemini working as one team, with every result re-checked before it ships.",
    lead: "How I build now. Claude plans and designs, Codex writes most of the code, Gemini researches and reviews from outside. I set the taste and check the result.",
    does: [
      "Wrappers that send each job to the right model at the right cost, and stop cleanly when a quota runs out.",
      "A review loop where the model that didn't build the work inspects it in a fresh session.",
      "A finished run is not a finished task. Every claim gets re-run before it ships.",
      "One knowledge base the whole team reads, so no session starts cold.",
    ],
    stack: ["Claude Code", "Codex CLI", "Gemini", "PowerShell", "Python"],
    status: "Private tooling",
    images: [],
  },
];

export const OTHER = {
  left: "Other",
  right: "Things",
  label: "Smaller builds, and the car",
  // Fan order is left, centre, right. Only the car carries a photo; the
  // other two are typographic cards until real captures exist.
  items: [
    { name: "This site", line: "Two skies, one page. Next.js, Three.js and GSAP.", image: null },
    { name: "Motion studio", line: "Product reels made in code with Remotion.", image: null },
    { name: "The E92", line: "335xi, BMW Individual Bernina Grey wrap, mostly built by me.", image: { src: "/e92/bay.jpg", alt: "Grey BMW E92 coupe with the bonnet up and halo headlights on" } },
  ],
};

export const TASTE = {
  label: "Taste",
  lines: ["I see the", "2px that's", "off."],
  body: "Most software works and looks like nobody cared. I sweat spacing, type and motion the way I sweat a database schema, because people judge the whole thing at once. I don't ship slop.",
};

export const METHOD = {
  label: "How I work",
  items: [
    { title: "Do the job by hand first", body: "I sold cars and wrote listings by hand before I automated any of it." },
    { title: "Measure before deciding", body: "I audited 1,069 live listings against the regulator's rules instead of assuming they were fine." },
    { title: "Own the whole problem", body: "Scraper, listing, ad spend, lead, invoice. I'd rather own it end to end than a clean slice." },
  ],
};

export const INFO = {
  label: "Info",
  bio: "Born in Dhaka, studying computer science in Calgary, graduating April 2028. I co-run Puzzled and I'm stepping in as managing director of TotalTex, the trims factory my father founded. Off the clock: an E92 335xi, wrapped in BMW Individual Bernina Grey, mostly built by me.",
  lists: [
    {
      label: "Now",
      items: ["Co-founder, Puzzled, Calgary, since 2023", "Incoming managing director, TotalTex, Dhaka"],
    },
    { label: "Before", items: ["Sales and inventory, Prime Autos Calgary, 2022 to 2023"] },
    { label: "School", items: ["BSc Computer Science, University of Calgary, April 2028"] },
  ],
};

export const CONTACT = {
  lines: ["Let's build", "something"],
  body: "Email is fastest. I answer everything.",
  copy: "Copy email",
  copied: "Copied",
  availability: "Open to summer 2027 internships and freelance builds.",
};

export const FOOTER = {
  copyright: "© 2026 Adnan Shakib",
  made: "Built by hand in Calgary",
  top: "Back to top",
  next: "Next project",
};

export const INTRO = { label: "Loading" };
