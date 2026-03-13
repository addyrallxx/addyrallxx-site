'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const ring  = useRef({ x: 0, y: 0 });
  const raf   = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top  = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', onMove);
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.11;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.11;
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px';
        ringRef.current.style.top  = ring.current.y + 'px';
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf.current); };
  }, []);

  useEffect(() => {
    const grow = () => {
      if (cursorRef.current) { cursorRef.current.style.width = '5px'; cursorRef.current.style.height = '5px'; }
      if (ringRef.current)   { ringRef.current.style.width = '58px'; ringRef.current.style.height = '58px'; ringRef.current.style.borderColor = 'rgba(201,169,110,0.9)'; }
    };
    const shrink = () => {
      if (cursorRef.current) { cursorRef.current.style.width = '8px'; cursorRef.current.style.height = '8px'; }
      if (ringRef.current)   { ringRef.current.style.width = '38px'; ringRef.current.style.height = '38px'; ringRef.current.style.borderColor = 'rgba(201,169,110,0.5)'; }
    };
    const els = document.querySelectorAll('a, button');
    els.forEach(el => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });
    return () => els.forEach(el => { el.removeEventListener('mouseenter', grow); el.removeEventListener('mouseleave', shrink); });
  }, []);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const skills = [
    { icon: '⬡', name: 'Frontend Dev',      desc: 'Building clean, fast, interactive interfaces that feel premium.',      tags: ['HTML/CSS','JavaScript','React','Next.js'] },
    { icon: '◈', name: 'Backend & Data',     desc: 'APIs, databases, and server logic that powers reliable products.',     tags: ['Python','SQL','Node.js','REST APIs'] },
    { icon: '◎', name: 'AI & Automation',    desc: 'Integrating LLMs and building intelligent workflows that scale.',      tags: ['LLM APIs','Agents','Prompt Eng.'] },
    { icon: '▣', name: 'Systems & Networks', desc: 'Understanding how computers and the internet actually work.',          tags: ['Networking','Databases','Security'] },
    { icon: '◇', name: 'Crypto & Web3',      desc: 'Active in Solana, exploring DeFi, wallets, and on-chain tooling.',    tags: ['Solana','Phantom','DeFi','BTC'] },
    { icon: '◉', name: 'Product Thinking',   desc: 'Turning raw ideas into products — market-aware, revenue-first.',      tags: ['SaaS','CRM','Growth','Strategy'] },
  ];

  const projects = [
    { num: '01', title: 'This Portfolio', desc: 'Dark, minimal personal site built with Next.js and pure intent.',        tags: ['Next.js','TypeScript'], href: '#' },
    { num: '02', title: 'Coming Soon',    desc: 'Currently building. Check back shortly.',                                tags: ['In Progress'],         href: '#' },
    { num: '03', title: 'Coming Soon',    desc: 'Currently building. Check back shortly.',                                tags: ['In Progress'],         href: '#' },
  ];

  const contacts = [
    { label: 'Email',    handle: 'adnanshakib.business@gmail.com', href: 'mailto:adnanshakib.business@gmail.com' },
    { label: 'WhatsApp', handle: '+1 (587) 894-1429',              href: 'https://wa.me/15878941429' },
    { label: 'GitHub',   handle: '@addyrallxx',                    href: 'https://github.com/addyrallxx' },
    { label: 'LinkedIn', handle: 'Adnan Shakib',                   href: 'https://www.linkedin.com/in/adnanshakib/' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; cursor: none; }
        body {
          background: #070707;
          color: #f0ede8;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        a { text-decoration: none; color: inherit; }

        /* Cursor */
        #cursor {
          position: fixed; width: 8px; height: 8px;
          background: #c9a96e; border-radius: 50%;
          pointer-events: none; z-index: 9999;
          transform: translate(-50%,-50%);
          transition: width .3s, height .3s;
        }
        #cursor-ring {
          position: fixed; width: 38px; height: 38px;
          border: 1.5px solid rgba(201,169,110,0.55);
          border-radius: 50%; pointer-events: none; z-index: 9998;
          transform: translate(-50%,-50%);
          transition: width .4s cubic-bezier(.16,1,.3,1), height .4s cubic-bezier(.16,1,.3,1), border-color .3s;
        }

        /* Nav */
        .p-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          display: flex; align-items: center; justify-content: center;
          padding: 34px 80px;
          transition: background .5s, border-color .5s;
        }
        .p-nav.scrolled {
          background: rgba(7,7,7,0.92);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .p-nav-logo {
          position: absolute; left: 80px;
          font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 800;
          letter-spacing: -0.02em; color: #f0ede8;
          opacity: 0; animation: fadeDown .8s cubic-bezier(.16,1,.3,1) .2s forwards;
        }
        .p-nav-logo .g { color: #c9a96e; }
        .p-nav-links {
          display: flex; align-items: center; gap: 56px; list-style: none;
          opacity: 0; animation: fadeDown .8s cubic-bezier(.16,1,.3,1) .35s forwards;
        }
        .p-nav-links a {
          position: relative; font-size: 11px; font-weight: 400;
          letter-spacing: .16em; text-transform: uppercase;
          color: rgba(240,237,232,0.45);
          transition: color .3s; padding-bottom: 3px;
        }
        .p-nav-links a::after {
          content: ''; position: absolute; bottom: -1px; left: 0;
          width: 0; height: 1px; background: #c9a96e;
          transition: width .35s cubic-bezier(.16,1,.3,1);
        }
        .p-nav-links a:hover { color: #f0ede8; }
        .p-nav-links a:hover::after { width: 100%; }

        /* Hero */
        .p-hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 80px 110px; overflow: hidden;
        }
        .p-hero-guide {
          position: absolute; top: 0; width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 75%, transparent);
        }
        .p-hero-glow {
          position: absolute; bottom: -5%; left: -3%;
          width: 50vw; height: 50vw;
          background: radial-gradient(ellipse at bottom left, rgba(201,169,110,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .p-hero-label {
          display: flex; align-items: center; gap: 14px;
          font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
          color: rgba(240,237,232,0.45); margin-bottom: 36px;
          opacity: 0; animation: fadeUp .9s cubic-bezier(.16,1,.3,1) .45s forwards;
        }
        .p-hero-label-line { display: block; width: 30px; height: 1px; background: #c9a96e; }
        .p-hero-name {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(80px, 11vw, 160px);
          line-height: .9; letter-spacing: -.045em;
          color: #f0ede8; margin-bottom: 56px;
        }
        .p-hero-line { display: block; overflow: hidden; }
        .p-hero-line span {
          display: block; transform: translateY(110%);
          animation: slideUp 1.1s cubic-bezier(.16,1,.3,1) forwards;
        }
        .p-hero-line:nth-child(1) span { animation-delay: .5s; }
        .p-hero-line:nth-child(2) span { animation-delay: .65s; }
        .p-hero-bottom {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 60px;
          opacity: 0; animation: fadeUp .9s cubic-bezier(.16,1,.3,1) 1.1s forwards;
        }
        .p-hero-desc { max-width: 480px; }
        .p-hero-headline { font-size: 17px; font-weight: 400; color: #f0ede8; margin-bottom: 12px; }
        .p-hero-sub { font-size: 14px; font-weight: 300; color: rgba(240,237,232,0.45); line-height: 1.8; margin-bottom: 36px; }
        .p-hero-cta {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          color: #070707; background: #c9a96e; padding: 16px 34px; border-radius: 2px;
          transition: background .3s, transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s;
        }
        .p-hero-cta:hover { background: #d4b87a; transform: translateY(-3px); box-shadow: 0 18px 52px rgba(201,169,110,0.32); }
        .p-hero-scroll { display: flex; align-items: center; gap: 12px; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: rgba(240,237,232,0.4); flex-shrink: 0; }
        .p-hero-scroll-line { width: 1px; height: 64px; background: linear-gradient(to bottom, #c9a96e, transparent); animation: pulse 2.5s ease-in-out infinite; }

        /* Section base */
        .p-section {
          padding: 160px 80px;
          border-top: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }
        .p-section::before {
          content: '';
          position: absolute; top: 0; left: 0; width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(201,169,110,0.18) 30%, rgba(201,169,110,0.18) 70%, transparent);
        }
        .p-section-tag {
          display: flex; align-items: center; gap: 10px;
          font-size: 11px; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(240,237,232,0.42); margin-bottom: 56px;
        }
        .p-section-num { font-family: 'Syne', sans-serif; font-weight: 700; color: #c9a96e; }
        .p-section-line { display: block; width: 56px; height: 1px; background: linear-gradient(to right, rgba(201,169,110,0.5), transparent); }
        .p-section-heading {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(42px, 6vw, 82px);
          letter-spacing: -.04em; line-height: 1; color: #f0ede8;
        }

        /* About */
        .p-about-grid {
          display: grid; grid-template-columns: 55% 1fr;
          gap: 100px; margin-top: 68px; align-items: start;
        }
        .p-about-wrap { padding-left: 32px; border-left: 1px solid rgba(201,169,110,0.35); }
        .p-about-text { font-size: 15px; font-weight: 300; color: rgba(240,237,232,0.48); line-height: 2; }
        .p-about-text p { margin-bottom: 28px; }
        .p-about-text p:last-child { margin-bottom: 0; }
        .p-about-text strong { color: #f0ede8; font-weight: 400; }
        .p-details { display: flex; flex-direction: column; }
        .p-detail-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 22px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: border-color .3s;
        }
        .p-detail-row:first-child { border-top: 1px solid rgba(255,255,255,0.06); }
        .p-detail-row:hover { border-color: rgba(201,169,110,0.35); }
        .p-detail-label { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: rgba(240,237,232,0.42); }
        .p-detail-value { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #f0ede8; text-align: right; }

        /* Skills */
        .p-skills-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: rgba(255,255,255,0.06);
          margin-top: 68px; border: 1px solid rgba(255,255,255,0.06);
        }
        .p-skill-card {
          position: relative; overflow: hidden; padding: 44px 36px;
          background: #0d0d0d;
          transition: background .4s, transform .4s cubic-bezier(.16,1,.3,1);
          cursor: default;
        }
        /* Always-on top gold line */
        .p-skill-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,169,110,0.25), transparent);
        }
        /* Hover glow */
        .p-skill-card::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(201,169,110,0.12), transparent 65%);
          opacity: 0; transition: opacity .5s;
        }
        .p-skill-card:hover { background: #111; transform: translateY(-4px); }
        .p-skill-card:hover::after { opacity: 1; }
        .p-skill-bottom-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, #c9a96e, transparent);
          opacity: 0; transition: opacity .5s;
        }
        .p-skill-card:hover .p-skill-bottom-bar { opacity: 0.7; }
        .p-skill-inner { position: relative; z-index: 1; }
        .p-skill-icon {
          display: inline-block; font-size: 24px; color: #c9a96e;
          margin-bottom: 20px; transition: transform .4s cubic-bezier(.16,1,.3,1);
        }
        .p-skill-card:hover .p-skill-icon { transform: scale(1.2) rotate(8deg); }
        .p-skill-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #f0ede8; margin-bottom: 10px; }
        .p-skill-desc { font-size: 13px; color: rgba(240,237,232,0.45); line-height: 1.7; margin-bottom: 20px; }
        .p-skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .p-pill {
          font-size: 10px; padding: 4px 11px; letter-spacing: .06em;
          border: 1px solid rgba(255,255,255,0.08); color: rgba(240,237,232,0.45);
          border-radius: 2px; transition: border-color .3s, color .3s;
        }
        .p-skill-card:hover .p-pill { border-color: rgba(201,169,110,0.3); color: rgba(240,237,232,0.7); }

        /* Projects */
        .p-projects-list { margin-top: 68px; }
        .p-project-row {
          position: relative;
          display: grid; grid-template-columns: 64px 1fr auto auto;
          align-items: center; gap: 48px;
          padding: 44px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: padding-left .4s cubic-bezier(.16,1,.3,1); overflow: hidden;
        }
        .p-project-row:first-child { border-top: 1px solid rgba(255,255,255,0.06); }
        /* Left gold bar */
        .p-project-row::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: #c9a96e; transform: scaleY(0); transform-origin: bottom;
          transition: transform .4s cubic-bezier(.16,1,.3,1);
        }
        /* Gold wash */
        .p-project-row::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(201,169,110,0.08), transparent 45%);
          opacity: 0; transition: opacity .4s;
        }
        .p-project-row:hover { padding-left: 24px; }
        .p-project-row:hover::before { transform: scaleY(1); }
        .p-project-row:hover::after { opacity: 1; }
        .p-project-num {
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
          color: #c9a96e; letter-spacing: .1em; opacity: .6;
          position: relative; z-index: 1; transition: opacity .3s;
        }
        .p-project-row:hover .p-project-num { opacity: 1; }
        .p-project-info { position: relative; z-index: 1; }
        .p-project-title {
          font-family: 'Syne', sans-serif; font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 700; letter-spacing: -.025em; color: #f0ede8; margin-bottom: 6px;
          transition: color .3s;
        }
        .p-project-row:hover .p-project-title { color: #d4b87a; }
        .p-project-desc { font-size: 13px; font-weight: 300; color: rgba(240,237,232,0.45); }
        .p-project-tags { display: flex; gap: 8px; position: relative; z-index: 1; }
        .p-project-arrow {
          font-size: 20px; color: rgba(240,237,232,0.45); display: inline-block;
          position: relative; z-index: 1;
          transition: transform .35s cubic-bezier(.16,1,.3,1), color .3s;
        }
        .p-project-row:hover .p-project-arrow { transform: translate(5px,-5px); color: #c9a96e; }

        /* Contact */
        .p-contact-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 100px; align-items: start;
        }
        .p-contact-heading {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(36px, 4.5vw, 62px);
          letter-spacing: -.04em; line-height: 1.08; color: #f0ede8; margin-bottom: 24px;
        }
        .p-contact-sub { font-size: 14px; font-weight: 300; color: rgba(240,237,232,0.45); line-height: 1.85; max-width: 360px; }
        .p-contact-links { display: flex; flex-direction: column; padding-top: 8px; }
        .p-contact-link {
          position: relative; display: flex; align-items: center; justify-content: space-between;
          padding: 26px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow: hidden; transition: padding-left .35s cubic-bezier(.16,1,.3,1), border-color .3s;
        }
        .p-contact-link:first-child { border-top: 1px solid rgba(255,255,255,0.06); }
        .p-contact-link::after {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 0;
          background: linear-gradient(to right, rgba(201,169,110,0.14), transparent);
          transition: width .4s cubic-bezier(.16,1,.3,1);
        }
        .p-contact-link:hover { padding-left: 16px; border-color: rgba(201,169,110,0.4); }
        .p-contact-link:hover::after { width: 100%; }
        .p-contact-label {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #f0ede8;
          position: relative; z-index: 1; transition: color .3s;
        }
        .p-contact-link:hover .p-contact-label { color: #d4b87a; }
        .p-contact-handle { font-size: 12px; color: rgba(240,237,232,0.42); position: relative; z-index: 1; }
        .p-contact-arrow {
          font-size: 18px; color: rgba(240,237,232,0.42); display: inline-block;
          position: relative; z-index: 1;
          transition: transform .35s cubic-bezier(.16,1,.3,1), color .3s;
        }
        .p-contact-link:hover .p-contact-arrow { transform: translate(4px,-4px); color: #c9a96e; }

        /* Footer */
        .p-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 32px 80px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .p-footer-text { font-size: 11px; letter-spacing: .04em; color: rgba(240,237,232,0.42); }

        /* Reveal */
        .reveal { opacity: 0; transform: translateY(36px); transition: opacity .95s cubic-bezier(.16,1,.3,1), transform .95s cubic-bezier(.16,1,.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay: .08s; }
        .d2 { transition-delay: .18s; }
        .d3 { transition-delay: .28s; }

        /* Keyframes */
        @keyframes slideUp  { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse    { 0%,100% { opacity: .3; } 50% { opacity: 1; } }

        @media (max-width: 900px) {
          html { cursor: auto; }
          #cursor, #cursor-ring { display: none; }
          .p-nav { padding: 22px 28px; }
          .p-nav-logo { left: 28px; }
          .p-nav-links { gap: 28px; }
          .p-hero { padding: 0 28px 80px; }
          .p-section { padding: 100px 28px; }
          .p-about-grid, .p-contact-grid { grid-template-columns: 1fr; gap: 56px; }
          .p-skills-grid { grid-template-columns: 1fr; }
          .p-project-row { grid-template-columns: 48px 1fr; }
          .p-project-tags { display: none; }
          .p-footer { padding: 28px; flex-direction: column; gap: 10px; text-align: center; }
        }
      `}</style>

      <div id="cursor" ref={cursorRef} />
      <div id="cursor-ring" ref={ringRef} />

      {/* NAV */}
      <nav className={`p-nav${navScrolled ? ' scrolled' : ''}`}>
        <a href="#hero" className="p-nav-logo"><span className="g">A</span>S</a>
        <ul className="p-nav-links">
          {['About','Skills','Projects','Contact'].map(s => (
            <li key={s}><a href={`#${s.toLowerCase()}`}>{s}</a></li>
          ))}
        </ul>
      </nav>

      {/* HERO */}
      <section id="hero" className="p-hero">
        <div className="p-hero-guide" style={{ right: 'clamp(80px,10vw,160px)' }} />
        <div className="p-hero-guide" style={{ right: 'clamp(220px,28vw,400px)', opacity: .4 }} />
        <div className="p-hero-glow" />
        <p className="p-hero-label"><span className="p-hero-label-line" />Portfolio · 2025</p>
        <h1 className="p-hero-name">
          <span className="p-hero-line"><span>Adnan</span></span>
          <span className="p-hero-line"><span>Shakib.</span></span>
        </h1>
        <div className="p-hero-bottom">
          <div className="p-hero-desc">
            <p className="p-hero-headline"><strong>Builder. Operator. Always in motion.</strong></p>
            <p className="p-hero-sub">Designing systems and products at the intersection of tech, automation, and business — one project at a time.</p>
            <a href="#contact" className="p-hero-cta">Let&apos;s Talk ↗</a>
          </div>
          <div className="p-hero-scroll">
            <div className="p-hero-scroll-line" />
            Scroll
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="p-section">
        <div className="p-section-tag reveal">
          <span className="p-section-num">01</span>
          <span>— About</span>
          <span className="p-section-line" />
        </div>
        <h2 className="p-section-heading reveal d1">Who I Am</h2>
        <div className="p-about-grid">
          <div className="reveal d2">
            <div className="p-about-wrap">
              <div className="p-about-text">
                <p>I&apos;m a <strong>Computer Science student at the University of Calgary</strong>, building at the intersection of software, automation, and entrepreneurship. I started in Engineering, found that my mind was wired for building and systems thinking, pivoted to CS, and never looked back.</p>
                <p>My goal isn&apos;t just to write code. It&apos;s to <strong>build things that matter</strong> — products, tools, and systems that create real value for real people. I think like an operator first and an engineer second. I care about outcomes, not just output.</p>
                <p>Outside the screen: cars, motorsport, travel, music, and anything that moves fast. I approach building with the same energy — <strong>all in, always learning, always moving forward.</strong></p>
              </div>
            </div>
          </div>
          <div className="p-details reveal d3">
            {[['Location','Calgary, AB'],['Education','BSc Computer Science'],['University','University of Calgary'],['Focus','SaaS · AI · Automation'],['Interests','Cars · Crypto · Travel'],['Status','Building · Open to Collabs']].map(([l,v],i) => (
              <div key={i} className="p-detail-row">
                <span className="p-detail-label">{l}</span>
                <span className="p-detail-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="p-section">
        <div className="p-section-tag reveal">
          <span className="p-section-num">02</span>
          <span>— Skills</span>
          <span className="p-section-line" />
        </div>
        <h2 className="p-section-heading reveal d1">What I Work With</h2>
        <div className="p-skills-grid">
          {skills.map((s,i) => (
            <div key={i} className={`p-skill-card reveal d${(i%3)+1}`}>
              <div className="p-skill-bottom-bar" />
              <div className="p-skill-inner">
                <div className="p-skill-icon">{s.icon}</div>
                <div className="p-skill-name">{s.name}</div>
                <div className="p-skill-desc">{s.desc}</div>
                <div className="p-skill-tags">{s.tags.map(t=><span key={t} className="p-pill">{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="p-section">
        <div className="p-section-tag reveal">
          <span className="p-section-num">03</span>
          <span>— Work</span>
          <span className="p-section-line" />
        </div>
        <h2 className="p-section-heading reveal d1">Projects</h2>
        <div className="p-projects-list">
          {projects.map((p,i) => (
            <a key={i} href={p.href} className={`p-project-row reveal d${i+1}`}>
              <span className="p-project-num">{p.num}</span>
              <div className="p-project-info">
                <div className="p-project-title">{p.title}</div>
                <div className="p-project-desc">{p.desc}</div>
              </div>
              <div className="p-project-tags">{p.tags.map(t=><span key={t} className="p-pill">{t}</span>)}</div>
              <span className="p-project-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="p-section">
        <div className="p-section-tag reveal">
          <span className="p-section-num">04</span>
          <span>— Contact</span>
          <span className="p-section-line" />
        </div>
        <div className="p-contact-grid">
          <div className="reveal">
            <p className="p-contact-heading">Let&apos;s build<br /><span style={{color:'#c9a96e'}}>something real.</span></p>
            <p className="p-contact-sub">Open to collaborations, freelance work, internships, and interesting conversations. If you have an idea or opportunity — let&apos;s talk.</p>
          </div>
          <div className="p-contact-links reveal d2">
            {contacts.map((c,i) => (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="p-contact-link">
                <span className="p-contact-label">{c.label}</span>
                <span className="p-contact-handle">{c.handle}</span>
                <span className="p-contact-arrow">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-footer">
        <p className="p-footer-text">© 2025 <span style={{color:'#c9a96e'}}>Adnan Shakib</span>. All rights reserved.</p>
        <p className="p-footer-text">Built from scratch · Designed with intent</p>
      </footer>
    </>
  );
}