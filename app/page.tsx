'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  // Cursor
  useEffect(() => {
    const move = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top  = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', move);

    const animateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px';
        ringRef.current.style.top  = ringPos.current.y + 'px';
      }
      rafRef.current = requestAnimationFrame(animateRing);
    };
    rafRef.current = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener('mousemove', move);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Cursor hover states
  useEffect(() => {
    const enter = () => {
      if (cursorRef.current) { cursorRef.current.style.width = '6px'; cursorRef.current.style.height = '6px'; }
      if (ringRef.current)   { ringRef.current.style.width = '52px'; ringRef.current.style.height = '52px'; ringRef.current.style.borderColor = 'rgba(240,237,232,0.6)'; }
    };
    const leave = () => {
      if (cursorRef.current) { cursorRef.current.style.width = '10px'; cursorRef.current.style.height = '10px'; }
      if (ringRef.current)   { ringRef.current.style.width = '36px'; ringRef.current.style.height = '36px'; ringRef.current.style.borderColor = 'rgba(240,237,232,0.35)'; }
    };
    const els = document.querySelectorAll('a, button');
    els.forEach(el => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); });
    return () => els.forEach(el => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); });
  }, []);

  // Nav scroll
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const skills = [
    { icon: '⬡', name: 'Frontend Dev', desc: 'Building clean, fast, interactive web interfaces that feel premium.', tags: ['HTML/CSS', 'JavaScript', 'React', 'Next.js'] },
    { icon: '◈', name: 'Backend & Data', desc: 'APIs, databases, and server logic that powers reliable products.', tags: ['Python', 'SQL', 'Node.js', 'REST APIs'] },
    { icon: '◎', name: 'AI & Automation', desc: 'Integrating LLMs and building intelligent workflows that scale.', tags: ['LLM APIs', 'Agents', 'Prompt Eng.'] },
    { icon: '▣', name: 'Systems & Networks', desc: 'Understanding how computers and the internet actually work.', tags: ['Networking', 'Databases', 'Security'] },
    { icon: '◇', name: 'Crypto & Web3', desc: 'Active in the Solana ecosystem, exploring DeFi and on-chain tooling.', tags: ['Solana', 'Phantom', 'DeFi', 'BTC'] },
    { icon: '◉', name: 'Product Thinking', desc: 'Turning ideas into scoped products — market-aware, revenue-first.', tags: ['SaaS', 'CRM', 'Growth', 'Strategy'] },
  ];

  const projects = [
    { num: '01', title: 'This Portfolio', desc: 'Dark, minimal personal site built with Next.js, Tailwind, and pure intent.', tags: ['Next.js', 'Tailwind', 'TypeScript'], href: '#' },
    { num: '02', title: 'Coming Soon', desc: 'Currently building. Check back shortly.', tags: ['In Progress'], href: '#' },
    { num: '03', title: 'Coming Soon', desc: 'Currently building. Check back shortly.', tags: ['In Progress'], href: '#' },
  ];

  const contacts = [
    { label: 'Email', handle: 'adnanshakib.business@gmail.com', href: 'mailto:adnanshakib.business@gmail.com' },
    { label: 'GitHub', handle: '@addyrallxx', href: 'https://github.com/addyrallxx' },
    { label: 'LinkedIn', handle: 'Adnan Shakib', href: 'https://www.linkedin.com/in/adnanshakib/' },
  ];

  return (
    <>
      {/* Cursor */}
      <div id="cursor" ref={cursorRef} />
      <div id="cursor-ring" ref={ringRef} />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-14 py-7 transition-all duration-500"
        style={navScrolled ? {
          background: 'rgba(8,8,8,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        } : {}}
      >
        <a href="#hero" className="font-display text-lg font-bold tracking-tight text-[var(--text)] no-underline anim-fade-down" style={{ animationDelay: '0.2s' }}>
          AS
        </a>
        <ul className="flex gap-10 list-none anim-fade-down" style={{ animationDelay: '0.3s' }}>
          {['About', 'Skills', 'Projects', 'Contact'].map(item => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="text-xs font-normal tracking-widest uppercase no-underline transition-colors duration-300"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero */}
      <section id="hero" className="min-h-screen flex flex-col justify-end px-14 pb-20 relative overflow-hidden">
        {/* Background lines */}
        <div className="absolute top-0 right-36 w-px h-full" style={{ background: 'linear-gradient(to bottom, transparent, var(--border) 30%, var(--border) 70%, transparent)' }} />
        <div className="absolute top-0 right-80 w-px h-full opacity-50" style={{ background: 'linear-gradient(to bottom, transparent, var(--border) 30%, var(--border) 70%, transparent)' }} />

        <p className="text-xs tracking-widest uppercase mb-7 flex items-center gap-3 anim-fade-up" style={{ color: 'var(--muted)', animationDelay: '0.5s' }}>
          <span className="block w-6 h-px bg-current" />
          Portfolio · 2025
        </p>

        <h1 className="font-display font-extrabold leading-none tracking-tighter mb-10" style={{ fontSize: 'clamp(64px, 9vw, 140px)' }}>
          <span className="hero-line"><span>Adnan</span></span>
          <span className="hero-line"><span>Shakib.</span></span>
        </h1>

        <div className="flex items-end justify-between anim-fade-up" style={{ animationDelay: '1.1s' }}>
          <p className="max-w-sm text-sm font-light leading-relaxed" style={{ color: 'var(--muted)' }}>
            <strong className="font-normal" style={{ color: 'var(--text)' }}>Builder. Operator. Always in motion.</strong><br />
            Designing systems and products at the intersection of tech, automation, and business — one project at a time.
          </p>
          <div className="flex items-center gap-3 text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            <div className="scroll-line w-px h-14" style={{ background: 'linear-gradient(to bottom, var(--muted), transparent)' }} />
            Scroll
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-14 py-36" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="reveal text-xs tracking-widest uppercase mb-14 flex items-center gap-3" style={{ color: 'var(--muted)' }}>
          01 — About
          <span className="block h-px max-w-20 flex-1" style={{ background: 'var(--border)' }} />
        </p>
        <h2 className="reveal reveal-delay-1 font-display font-bold tracking-tight leading-none" style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>Who I Am</h2>

        <div className="grid grid-cols-2 gap-20 mt-14">
          <div className="reveal reveal-delay-2 text-base font-light leading-loose space-y-4" style={{ color: 'var(--muted)' }}>
            <p>I&apos;m a <strong className="font-normal" style={{ color: 'var(--text)' }}>Computer Science student at the University of Calgary</strong>, building at the intersection of software, automation, and entrepreneurship. Started in Engineering — pivoted to CS, never looked back.</p>
            <p>My goal isn&apos;t just to write code. It&apos;s to <strong className="font-normal" style={{ color: 'var(--text)' }}>build things that matter</strong> — products, tools, and systems that create real value. I think like an operator first, engineer second.</p>
            <p>Outside the screen: cars, travel, music, and anything that moves fast. I approach building with the same energy I bring to everything else — <strong className="font-normal" style={{ color: 'var(--text)' }}>all in, always learning.</strong></p>
          </div>

          <div className="reveal reveal-delay-3 flex flex-col">
            {[
              ['Location', 'Calgary, AB'],
              ['Education', 'BSc Computer Science'],
              ['University', 'University of Calgary'],
              ['Focus', 'SaaS · AI · Automation'],
              ['Status', 'Building · Open to Collabs'],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between items-center py-5" style={{ borderBottom: '1px solid var(--border)', ...(i === 0 ? { borderTop: '1px solid var(--border)' } : {}) }}>
                <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>{label}</span>
                <span className="font-display text-sm font-semibold" style={{ color: 'var(--text)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="px-14 py-36" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="reveal text-xs tracking-widest uppercase mb-14 flex items-center gap-3" style={{ color: 'var(--muted)' }}>
          02 — Skills
          <span className="block h-px max-w-20 flex-1" style={{ background: 'var(--border)' }} />
        </p>
        <h2 className="reveal reveal-delay-1 font-display font-bold tracking-tight leading-none mb-14" style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>What I Work With</h2>

        <div className="grid grid-cols-3 gap-0.5">
          {skills.map((skill, i) => (
            <div
              key={i}
              className={`skill-card reveal reveal-delay-${(i % 3) + 1} relative overflow-hidden p-9 cursor-default transition-all duration-300`}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.background = '#131313'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
            >
              <div className="text-2xl mb-5">{skill.icon}</div>
              <div className="font-display text-base font-bold mb-2 tracking-tight" style={{ color: 'var(--text)' }}>{skill.name}</div>
              <div className="text-xs leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>{skill.desc}</div>
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 tracking-wide" style={{ border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '2px' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="px-14 py-36" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="reveal text-xs tracking-widest uppercase mb-14 flex items-center gap-3" style={{ color: 'var(--muted)' }}>
          03 — Work
          <span className="block h-px max-w-20 flex-1" style={{ background: 'var(--border)' }} />
        </p>
        <h2 className="reveal reveal-delay-1 font-display font-bold tracking-tight leading-none mb-14" style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}>Projects</h2>

        <div className="flex flex-col">
          {projects.map((project, i) => (
            <a
              key={i}
              href={project.href}
              className={`project-row reveal reveal-delay-${i + 1} grid items-center gap-10 py-9 relative no-underline`}
              style={{
                gridTemplateColumns: '60px 1fr auto auto',
                borderBottom: '1px solid var(--border)',
                color: 'inherit',
                ...(i === 0 ? { borderTop: '1px solid var(--border)' } : {}),
              }}
            >
              <span className="font-display text-xs tracking-widest" style={{ color: 'var(--muted)' }}>{project.num}</span>
              <div>
                <div className="font-display font-bold tracking-tight mb-1.5" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', color: 'var(--text)' }}>{project.title}</div>
                <div className="text-sm font-light" style={{ color: 'var(--muted)' }}>{project.desc}</div>
              </div>
              <div className="flex gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 tracking-wide" style={{ border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '2px' }}>{tag}</span>
                ))}
              </div>
              <span className="text-xl transition-all duration-300" style={{ color: 'var(--muted)' }}>↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-14 py-36 pb-24" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="reveal text-xs tracking-widest uppercase mb-14 flex items-center gap-3" style={{ color: 'var(--muted)' }}>
          04 — Contact
          <span className="block h-px max-w-20 flex-1" style={{ background: 'var(--border)' }} />
        </p>

        <div className="grid grid-cols-2 gap-20 items-start">
          <div className="reveal">
            <p className="font-display font-bold tracking-tight leading-tight mb-7" style={{ fontSize: 'clamp(32px, 4vw, 56px)', color: 'var(--text)' }}>
              Let&apos;s build something real.
            </p>
            <p className="text-sm font-light leading-relaxed max-w-sm" style={{ color: 'var(--muted)' }}>
              Open to collaborations, freelance work, internships, and interesting conversations. If you have an idea — let&apos;s talk.
            </p>
          </div>

          <div className="reveal reveal-delay-2 flex flex-col pt-4">
            {contacts.map((c, i) => (
              <a
                key={i}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link flex items-center justify-between py-6 no-underline"
                style={{
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)',
                  ...(i === 0 ? { borderTop: '1px solid var(--border)' } : {}),
                }}
              >
                <span className="font-display text-xl font-semibold tracking-tight">{c.label}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{c.handle}</span>
                <span className="text-lg transition-all duration-300" style={{ color: 'var(--muted)' }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-14 py-8 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs tracking-wide" style={{ color: 'var(--muted)' }}>© 2025 Adnan Shakib. All rights reserved.</p>
        <p className="text-xs tracking-wide" style={{ color: 'var(--muted)' }}>Built from scratch · Designed with intent</p>
      </footer>
    </>
  );
}