import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const base=process.argv[2]??'http://localhost:3100';
const out=process.argv[3]??'C:/Users/adnan/AppData/Local/Temp/claude/briefs';
mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:false,args:['--window-position=-2000,0','--hide-scrollbars','--force-device-scale-factor=1']});
let checks=0;
const errors=[],budgets=[];
const check=(name,value)=>{assert(value,name);checks++;console.log('ok',name);};
async function go(p,route='/') {
  assert.equal((await p.goto(base+route,{waitUntil:'domcontentloaded'})).status(),200);
  await p.waitForFunction(()=>document.documentElement.dataset.intro==='done');
  check('site identity '+route, await p.title().then(s=>s.includes('Adnan Shakib')));
  await p.evaluate(()=>document.fonts.ready);await sleep(1800);
}
async function scroll(p,selector,offset=100) {
  await p.evaluate(({selector,offset})=>{const y=document.querySelector(selector).getBoundingClientRect().top+scrollY-offset;window.__lenis.scrollTo(y,{immediate:true});},{selector,offset});await sleep(1400);
}
async function budget(p,name,selector) {
  if(selector) await scroll(p,selector,180);
  else await p.evaluate(()=>window.__lenis.scrollTo(0,{immediate:true}));
  const cdp=await p.createCDPSession();await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const result=await p.evaluate(({selector,name})=>new Promise(resolve=>{
    const frames=[],tasks=[];let last;
    const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});
    const el=selector?document.querySelector(selector):document.documentElement;
    const startScroll=window.__lenis.animatedScroll;
    const distance=selector?Math.min(el.offsetHeight,innerHeight*2):document.documentElement.scrollHeight-innerHeight;
    const start=performance.now();
    function tick(now) {
      if(last!==undefined) frames.push(now-last);last=now;
      const t=Math.min(1,(now-start)/(name==='scroll'?6000:4000));
      if(name!=='pit') window.__lenis.scrollTo(startScroll+distance*(.5-.5*Math.cos(t*Math.PI*2)));
      if(t<1)requestAnimationFrame(tick);
      else {tasks.push(...observer.takeRecords().map(e=>e.duration));observer.disconnect();frames.sort((a,b)=>a-b);resolve({p95:frames[Math.ceil(frames.length*.95)-1],frames:frames.length,maxTask:Math.max(0,...tasks)});}
    }
    requestAnimationFrame(tick);
  }),{selector,name});
  console.log('PHONE FRAME',name,JSON.stringify(result));budgets.push({name,...result});
  check(name+' p95 <= 33ms at 4x',result.p95<=33&&result.frames>60&&result.maxTask<=50);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await cdp.detach();
}
async function phoneBudgets(p) {
  await go(p);
  // Match the established suite: load lazy assets and finish entries before frame probes.
  const max=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  for(let y=0;y<=max+844;y+=700){await p.evaluate(y=>window.__lenis.scrollTo(y,{immediate:true}),y);await sleep(100);}
  await sleep(1800);
  await budget(p,'scroll');await budget(p,'Work','#work');await budget(p,'E92','#e92');await go(p);await budget(p,'pit','.glyph-pit');
}
try {
  const p=await browser.newPage();await p.setCacheEnabled(false);p.on('pageerror',e=>errors.push(String(e)));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  for(const [width,height] of (process.argv.includes('--budgets')?[[390,844]]:[[390,844],[360,780]])) {
    await p.setViewport({width,height,deviceScaleFactor:1,isMobile:true,hasTouch:true});await go(p);
    const firstProject=await p.$eval('#work .work-media-link',el=>new URL(el.href).pathname);
    if(process.argv.includes('--project')) {
      await scroll(p,'#work',-150);
      check('bottom hidden before slow upward steps '+width,await p.$eval('.chrome-bottom',el=>getComputedStyle(el).visibility==='hidden'));
      const slowStart=await p.evaluate(()=>window.__lenis.animatedScroll);
      for(let i=1;i<=8;i++){await p.evaluate(y=>window.__lenis.scrollTo(y,{immediate:true}),slowStart-i*.5);await sleep(40);}
      check('slow upward probe actually moves '+width,await p.evaluate(start=>scrollY<start-2,slowStart));
      check('bottom returns for slow upward steps '+width,await p.$eval('.chrome-bottom',el=>getComputedStyle(el).visibility==='visible'));
      if(width===390){await scroll(p,'.glyph-pit',100);await sleep(4000);await p.screenshot({path:`${out}/f13-pit.png`});}
      await go(p,firstProject);await scroll(p,'.page-hero',80);
      check('first project fits '+width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.page-hero h1 .section-line')].every(el=>el.firstElementChild.scrollWidth<=el.clientWidth+1&&el.firstElementChild.getBoundingClientRect().height<parseFloat(getComputedStyle(el).fontSize)*1.5)));
      if(width===390)await p.screenshot({path:`${out}/f13-project.png`});
      continue;
    }
    if(process.argv.includes('--budgets')) {await phoneBudgets(p);continue;}
    check('visible real Chrome '+width,await p.evaluate(()=>!document.hidden));
    check('phone typography '+width,await p.evaluate(()=>Math.abs(parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)-innerWidth*.15)<.1&&getComputedStyle(document.querySelector('.hero-lead')).fontSize==='17px'&&getComputedStyle(document.documentElement).getPropertyValue('--gutter').trim()==='20px'));
    check('hero words fit authored lines '+width,await p.$$eval('.hero-line',els=>els.filter(el=>el.getClientRects().length).every(el=>el.firstElementChild.scrollWidth<=el.clientWidth+1)));
    check('phone sky DPR cap '+width,await p.$eval('.sky canvas',el=>el.width<=innerWidth*1.5));
    check('fluid disabled '+width,await p.$eval('.sky',el=>el.dataset.fluid==='off'));
    check('unpinned Work and E92 '+width,await p.evaluate(()=>!document.querySelector('#e92[data-pin]')&&[...document.querySelectorAll('.work-card')].every(el=>getComputedStyle(el).position==='relative')));
    check('single bottom line '+width,await p.$eval('.chrome-bottom',el=>el.getBoundingClientRect().height<25&&getComputedStyle(el.querySelector('.clocks')).flexDirection==='row'));
    check('phone clock digits visibly painted '+width,await p.$$eval('.chrome-bottom .split-flap > .sr-only',els=>els.length===4&&els.every(el=>el.getBoundingClientRect().width>5&&el.getBoundingClientRect().height>=10)));
    await p.click('.menu-button');
    check('full screen native menu '+width,await p.$eval('.menu-sheet',el=>el.open&&el.getBoundingClientRect().width===innerWidth&&el.getBoundingClientRect().height>=innerHeight));
    for(let i=0;i<7;i++){await p.keyboard.press('Tab');check('menu traps focus '+width,await p.evaluate(()=>document.querySelector('.menu-sheet').contains(document.activeElement)));}
    await p.keyboard.press('Escape');check('Escape restores focus '+width,await p.evaluate(()=>!document.querySelector('.menu-sheet').open&&document.activeElement.matches('.menu-button')));
    await p.click('.menu-button');await p.click('.menu-sheet button');check('close button works '+width,await p.$eval('.menu-sheet',el=>!el.open));
    await p.evaluate(()=>document.activeElement.blur());
    const captures=[['hero','.hero',0],['work','#work',80],['services','.services',80],['e92','#e92',80],['info','#info',80],['contact','#contact',80]];
    for(const [name,selector,offset] of captures){await scroll(p,selector,offset);if(width===390)await p.screenshot({path:`${out}/f13-${name}.png`});}
    check('Contact authored words fit lines '+width,await p.$$eval('#contact .section-line',els=>els.every(el=>el.firstElementChild.scrollWidth<=el.clientWidth+1&&el.firstElementChild.getBoundingClientRect().height<parseFloat(getComputedStyle(el).fontSize)*1.5)));
    const max=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
    for(let y=0;y<=max+height;y+=height*.7){
      await p.evaluate(y=>window.__lenis.scrollTo(y,{immediate:true}),y);await sleep(100);
      check('no horizontal scroll '+width+' '+Math.round(y),await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    const bad=await p.evaluate(()=>[...document.querySelectorAll('a,button,[tabindex="0"]')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&!el.closest('dialog:not([open])')&&!el.matches('.skip-link')&&(r.width<43.9||r.height<43.9);}).map(el=>({text:el.textContent,cls:el.className,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
    console.log('small targets',JSON.stringify(bad));check('all phone targets >=44px '+width,bad.length===0);
    await scroll(p,'.service-entry:nth-child(2)',height/2-50);
    check('Services opens on centre crossing '+width,await p.$$eval('.service-entry[data-open="true"]',els=>els.length===1));
    await p.evaluate(()=>window.__lenis.scrollTo(0,{immediate:true}));await sleep(100);
    await scroll(p,'#work',0);check('bottom hides after hero '+width,await p.$eval('.chrome-bottom',el=>getComputedStyle(el).visibility==='hidden'));
    await p.evaluate(()=>window.__lenis.scrollTo(window.__lenis.animatedScroll-160,{immediate:true}));await sleep(100);
    check('bottom returns on scroll up '+width,await p.$eval('.chrome-bottom',el=>getComputedStyle(el).visibility==='visible'));
    check('pit height 300px '+width,await p.$eval('.glyph-pit',el=>el.getBoundingClientRect().height===300));
    for(const [route,name,selector] of [['/school','school-top','.page-hero'],['/school','school-coursework','#courses-heading'],[firstProject,'project','.page-hero'],['/work','work-index','.page-hero']]) {
      await go(p,route);await scroll(p,selector,80);check('route overflow '+route+' '+width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(route==='/school')check('School heading authored lines fit '+width,await p.$$eval('.page-hero h1 .section-line',els=>els.every(el=>el.firstElementChild.scrollWidth<=el.clientWidth+1&&el.firstElementChild.getBoundingClientRect().height<parseFloat(getComputedStyle(el).fontSize)*1.5)));
      if(width===390)await p.screenshot({path:`${out}/f13-${name}.png`});
    }
    if(width===390&&!process.argv.includes('--layout'))await phoneBudgets(p);
  }
  await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});await go(p);
  check('high-DPR phone sky capped at 1.5',await p.$eval('.sky canvas',el=>el.width<=585));
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await go(p);
  check('reduced motion complete unpinned phone',await p.evaluate(()=>!document.querySelector('#e92[data-pin]')&&document.querySelector('.glyph-pit').dataset.running==='false'));
  check('no runtime or HTTP errors',errors.length===0);
  const kind=process.argv.includes('--project')?'project':process.argv.includes('--budgets')?'budgets':process.argv.includes('--layout')?'layout':'results';
  writeFileSync(`${out}/f13-${kind}.json`,JSON.stringify({checks,errors,budgets},null,2));console.log('PASS',checks);
}finally{await browser.close();}
