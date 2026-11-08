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
    "Adnan Shakib, UCalgary computer science student. Builds software for a Calgary dealership business and a Dhaka garment factory. Open to summer 2027 internships.",
};

export const NAV = [
  { label: "Work", href: "/#work" },
  { label: "School", href: "/school" },
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
  lines: ["Written in Calgary.", "Running in Dhaka."],
  lead: "I'm Adnan Shakib. I build the software two businesses run on: listings for car dealerships in Alberta and BC, and orders and billing for a garment factory in Dhaka. Slow, ugly or vague means it isn't done.",
  // The resume line. A recruiter gets who, where, when and what next
  // before scrolling, so the display line never has to carry it.
  facts: [
    { label: "Studying", value: "Computer Science, University of Calgary, April 2028" },
    { label: "Running", value: "Co-founder, Puzzled" },
    { label: "Taking over", value: "Named successor, TotalTex, Dhaka" },
    { label: "Looking for", value: "Summer 2027 internships" },
  ],
};

// The sphere returns from the previous design, restyled to Level 4 tokens.
// Every slug has a file at public/icons/<slug>.svg. The globe shows brand
// colour logos only (Adnan, 2026-10-10); null slugs appear in the list only.
export const SKILLS = {
  label: "Tools",
  hint: "Drag it",
  groups: [
    { title: "Languages", items: [
      { name: "Python", slug: "python" }, { name: "TypeScript", slug: "typescript" }, { name: "JavaScript", slug: "javascript" },
      { name: "Java", slug: "openjdk" }, { name: "Kotlin", slug: "kotlin" }, { name: "SQL", slug: null },
    ] },
    { title: "Web, mobile and motion", items: [
      { name: "Next.js", slug: "nextdotjs" }, { name: "React", slug: "react" }, { name: "Tailwind CSS", slug: "tailwindcss" },
      { name: "Node.js", slug: "nodedotjs" }, { name: "GSAP", slug: "greensock" }, { name: "Three.js", slug: "threedotjs" },
      { name: "Expo", slug: "expo" }, { name: "React Native", slug: null },
    ] },
    { title: "Data and infrastructure", items: [
      { name: "PostgreSQL", slug: "postgresql" }, { name: "Drizzle", slug: "drizzle" }, { name: "Docker", slug: "docker" },
      { name: "Vercel", slug: "vercel" }, { name: "Git", slug: "git" },
      { name: "Cloudflare", slug: "cloudflare" }, { name: "Supabase", slug: "supabase" }, { name: "Playwright", slug: null },
    ] },
    { title: "AI and automation", items: [
      { name: "Claude Code", slug: "claude" }, { name: "Codex", slug: "openai" }, { name: "Gemini", slug: "googlegemini" },
      { name: "MCP", slug: "modelcontextprotocol" }, { name: "LangChain", slug: "langchain" }, { name: "Hugging Face", slug: "huggingface" },
      { name: "n8n", slug: "n8n" }, { name: "Zapier", slug: "zapier" },
      { name: "JEV", slug: null }, { name: "Fish Audio", slug: null },
    ] },
    { title: "Media and 3D", items: [
      { name: "ElevenLabs", slug: "elevenlabs" }, { name: "Higgsfield", slug: null }, { name: "Remotion", slug: null },
      { name: "HyperFrames", slug: null }, { name: "Blender", slug: "blender" }, { name: "FFmpeg", slug: "ffmpeg" }, { name: "Kokoro", slug: null },
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
    { name: "Websites", line: "Fast sites that look designed. I do the design, the build, the motion and the launch." },
    { name: "Internal tools", line: "The spreadsheet you've outgrown, rebuilt as software your team will actually use. Order systems and dashboards included." },
    { name: "Automation", line: "Scrapers, pipelines and AI agents that take the repetitive part of a job off someone's desk." },
    { name: "Dealership operations", line: "Through Puzzled: I run the online side of your dealership, from inventory to the leads it brings in." },
  ],
  cta: "Tell me what you need",
};

// What runs alongside the degree. Ordered by hours, not prestige.
export const SIDE = {
  label: "Alongside school",
  items: [
    { name: "Puzzled", line: "The dealership business I co-run with my roommate. Seven Alberta and BC dealerships at the peak, four active now." },
    { name: "TotalTex", line: "My father's garment trims factory in Dhaka, about 250 people. I built its order system and I'm the named successor." },
    { name: "Handled AI", line: "Our CPSC 598 capstone: a home services app for Calgary homeowners. I lead product and engineering on a team of three." },
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
  images: { src: string; alt: string; width: number; height: number }[];
  video?: { mp4: string; webm?: string; poster: string };
};

export const WORK_LABEL = "Selected work";

// Cursor follower and card link on the Work cards.
export const WORK_CTA = { view: "View", open: "View project" };

// Labels on /work/[slug]. Values come from each WORK item.
export const WORK_META = {
  kind: "Kind",
  year: "Year",
  stack: "Stack",
  status: "Status",
  does: "What it does",
};

export const WORK: Project[] = [
  {
    slug: "puzzled",
    name: "Puzzled",
    kind: "Dealership listings pipeline",
    year: "Since 2024",
    line: "Reads dealer inventory three times a day and writes a compliant listing for every car.",
    lead: "Puzzled runs the online side of car dealerships in Alberta and BC: inventory, listings, ads and the leads they bring in. Seven dealerships at the peak, four active now. I built the software underneath.",
    does: [
      "Pulls each client's live inventory from three dealer platforms, three times a day.",
      "Writes listing copy from the record only, inside the provincial advertising rules.",
      "Catches sold cars and price changes so nothing stale stays up.",
      "Stops at the platform. A person posts every listing, on purpose.",
    ],
    stack: ["Python", "curl_cffi", "Scheduled jobs"],
    status: "Private, client data",
    images: [{ src: "/puzzled/poster.webp", alt: "A Puzzled listing generated from a dealer inventory record", width: 1024, height: 576 }],
    video: { mp4: "/puzzled/showcase.mp4", webm: "/puzzled/showcase.webm", poster: "/puzzled/poster.webp" },
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
    images: [{ src: "/totaltex-ops/dashboard.webp", alt: "TotalTex Ops dashboard with fictional demo orders", width: 2880, height: 2200 }],
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
      "Mobile Lighthouse scores of 90 to 94.",
    ],
    stack: ["Next.js", "React Three Fiber", "GSAP"],
    status: "Live",
    link: { label: "totaltex-bd.com", href: "https://totaltex-bd.com" },
    images: [
      { src: "/totaltex/homepage-hero.webp", alt: "The TotalTex homepage hero", width: 2880, height: 2200 },
      { src: "/totaltex/homepage-products.webp", alt: "The TotalTex homepage product lines", width: 2880, height: 1800 },
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
      { src: "/fittrack/fittrack-home-v2.webp", alt: "FitTrack home screen", width: 1290, height: 2796 },
      { src: "/fittrack/fittrack-home-dashboard.png", alt: "FitTrack home dashboard", width: 780, height: 1688 },
      { src: "/fittrack/fittrack-workout-session.png", alt: "A FitTrack workout session", width: 780, height: 1688 },
      { src: "/fittrack/fittrack-progress-weight-trend.png", alt: "FitTrack weight trend chart", width: 780, height: 1688 },
    ],
  },
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
    images: [{ src: "/handled/handled-home.webp", alt: "Handled AI home with fictional demo jobs", width: 1290, height: 2796 }, { src: "/handled/handled-feature.webp", alt: "Handled AI booking confirmation with fictional demo data", width: 1290, height: 2796 }],
  },
  {
    slug: "sadman",
    name: "Sadman Shakib",
    kind: "Photography and film portfolio",
    year: "2026",
    line: "A portfolio for my brother, a photographer and filmmaker in Kuala Lumpur.",
    lead: "My brother's photography and film portfolio, with a procedural Kuala Lumpur skyline and a motion-led gallery.",
    does: ["A Kuala Lumpur skyline opens the homepage.", "Photography series and individual frames have their own views.", "Keyboard navigation reaches the gallery and frame viewer."],
    stack: ["Next.js", "TypeScript", "Three.js", "GSAP"],
    status: "Live",
    link: { label: "sadman-shakib.vercel.app", href: "https://sadman-shakib.vercel.app" },
    images: [{ src: "/sadman/homepage.webp", alt: "Sadman Shakib portfolio with its illustrated Kuala Lumpur skyline", width: 2850, height: 2200 }],
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
    images: [{ src: "/studio/composite.webp", alt: "Layered illustration of the Studio build workflow", width: 1585, height: 992 }],
  },
];

export const CAR = {
  card: { name: "The E92", line: "335xi, six speed manual, BMW Individual Bernina Grey. Mostly built by me." },
  label: "Off the clock",
  // Display L lines for the section heading.
  lines: ["The", "E92"],
  title: "2008 BMW 335xi",
  lead: "An all wheel drive, three pedal N54 coupe. BMW left a lot of power on the table, so I've been collecting it.",
  specs: [
    { label: "Engine", value: "Original N54 twin turbo six, RB Twos+ turbos" },
    { label: "Fuel", value: "Walbro 450 lift pump, upgraded high pressure pump, Index 12 injectors" },
    { label: "Air", value: "VRSF 7.5 inch intercooler and charge pipe, HKS blow off valve" },
    { label: "Tune", value: "MHD flash, four maps. About 535 wheel horsepower on 93 pump gas, about 610 on E40 (tune estimates)" },
    { label: "Drive", value: "Six speed manual, SPEC Stage 2+ clutch, xDrive with xDelete" },
    { label: "Chassis", value: "ST XTA coilovers, M3 control arms, Hawk HP+ pads" },
    { label: "Wheels", value: "BBS RX202, 18 inch, Hankook Ventus RS4" },
    { label: "Body", value: "M3 style bumper and skirts, carbon lip, grilles, mirror caps, diffuser, spoiler, skirt extensions and rear spats" },
    { label: "Inside", value: "M3 wheel, M Performance shift knob, Logic 7" },
  ],
  signOff: "Bernina Grey. RB twins. Bad intentions.",
};

export const OTHER = {
  left: "Other",
  right: "Things",
  label: "Smaller builds",
  // Fan order is left, centre, right. The car has its own section now
  // (Adnan, 2026-10-10); all three cards are smaller builds.
  items: [
    { name: "This site", line: "Design, code and motion. Every detail is mine.", image: "/other/site.webp", href: "/work" },
    { name: "Motion studio", line: "Product films, built frame by frame in code.", image: "/studio/composite.webp", href: "/work/studio" },
    { name: "Class steward", line: "One place for the class to catch what matters.", image: "/other/steward@2x.webp", href: "/school" },
  ],
};

export const TASTE = {
  label: "Taste",
  measureLabel: "2px",
  lines: ["I can taste", "a bad margin."],
  body: "Spacing, type and motion are where software shows whether anyone cared. I check them the way I check a database schema: closely, and before it ships.",
};

export const METHOD = {
  label: "How I work",
  items: [
    { title: "Business first", body: "I've sold the cars and run the office. I know what the software needs to fix." },
    { title: "Built to be used", body: "The factory team runs on my software every day. Seven dealerships have run on my inventory pipeline at once." },
    { title: "Accountable end to end", body: "I own the product and the operation behind it, from the first decision to the fix after launch." },
  ],
};

export const INFO = {
  label: "Info",
  bio: "Born in Dhaka, studying computer science in Calgary. I co-run Puzzled, a digital BDC for Calgary car dealerships, and I'm next in line to run TotalTex, the trims factory my father built. I write the software both businesses run on, and I care how it looks. Graduating April 2028, looking for a summer 2027 internship.",
  year: "2028",
  yearLabel: "University of Calgary / April",
  lists: [
    {
      label: "Now",
      items: [
        "Co-founder, Puzzled, Calgary, 2024 to present",
        "Operations technology lead and named successor, TotalTex Industry Limited, Dhaka, 2026 to present",
        "Product and engineering lead, Handled AI (CPSC 598 capstone), September 2026 to April 2027",
        "Vice President of Operations, Bangladeshi Students' Society, University of Calgary",
        "Looking for: summer 2027 internships",
      ],
    },
    {
      label: "Before",
      items: [
        "Specialty finance marketing and sales, a Calgary dealership, May to August 2024",
        "Sales representative, Vector Marketing (CUTCO), May to December 2023",
        "Sales and inventory manager, Prime Autos Calgary, October 2022 to February 2023",
        "AMVIC-registered salesperson, earned at Prime Autos",
      ],
    },
    {
      label: "School",
      items: [
        "BSc Computer Science, Faculty of Science, University of Calgary, expected April 2028",
        "Edexcel GCSE and International A Levels, Mastermind English Medium School, Dhaka, 3.94 of 4.0, 2022",
      ],
    },
    {
      label: "Off the clock",
      items: [
        "A 2008 BMW 335xi, six speed manual, BMW Individual Bernina Grey, mostly built by me",
        "A photography portfolio for my brother Sadman: 117 frames, full keyboard navigation",
      ],
    },
  ],
};

// The /school page. Facts only from the vault: degree, graduation date,
// CPSC 598 and Handled AI, the steward bot. No grades or course list until
// Adnan supplies them.
export const SCHOOL = {
  label: "School",
  lines: ["University", "of Calgary"],
  lead: "The degree runs alongside the work, not instead of it.",
  facts: [
    { label: "Degree", value: "BSc Computer Science" },
    { label: "Capstone", value: "Handled AI, CPSC 598" },
    { label: "Graduating", value: "April 2028" },
    { label: "Looking for", value: "Summer 2027 internships" },
  ],
  sections: [
    {
      label: "Now",
      title: "CPSC 598, the entrepreneurship capstone",
      body: "An eight month venture course, September 2026 to April 2027, graded on evidence over opinion. Interviews, a lean canvas, milestones and a funding pitch, all built as a team.",
    },
    {
      label: "The venture",
      title: "Handled AI",
      body: "Our capstone venture for Calgary homeowners. Send a photo and a line of text, get a scoped price band, get booked with a licensed local pro. Plumbing and heating first.",
    },
    {
      label: "Built for the class",
      title: "Class steward",
      body: "A Discord bot that mirrors every instructor post into one channel and checks the server's permissions, after it found three settings locking the professor out.",
    },
    {
      label: "Outside class",
      title: "Bangladeshi Students' Society",
      body: "I'm Vice President of Operations for the society at the University of Calgary this term.",
    },
  ],
  // Course names only, from Adnan's transcript (2026-10-10). Never grades,
  // GPA, term results, student ID or birthdate.
  courses: [
    {
      label: "Done",
      items: [
        "CPSC 331 Data Structures, Algorithms and Analysis",
        "CPSC 355 Computing Machinery",
        "CPSC 441 Computer Networks",
        "CPSC 471 Database Management Systems",
        "SENG 300 Software Engineering",
        "CPSC 329 Information Security and Privacy",
        "CPSC 409 History of Computation",
        "PHIL 314 Information Technology Ethics",
      ],
    },
    {
      label: "This term",
      items: [
        "CPSC 383 Artificial Intelligence and Machine Learning",
        "CPSC 481 Human Computer Interaction",
        "CPSC 598 Software Entrepreneur Capstone",
      ],
    },
    {
      label: "Next term",
      items: [
        "CPSC 457 Operating Systems",
        "CPSC 449 Programming Paradigms",
        "CPSC 365 C++ Programming",
      ],
    },
  ],
  coursesLabel: "Coursework",
  back: "Back to home",
};

export const CONTACT = {
  lines: ["Let's build", "something"],
  body: "Email is fastest. I answer everything.",
  copy: "Copy email",
  copied: "Copied",
  mail: "Open in mail app",
  availability: "Open to summer 2027 internships and freelance builds.",
};

export const FOOTER = {
  copyright: "© 2026 Adnan Shakib",
  made: "Made in Calgary",
  top: "Back to top",
  next: "Next project",
};

export const INTRO = { label: "Loading" };
