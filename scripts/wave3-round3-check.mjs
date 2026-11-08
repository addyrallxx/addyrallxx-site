import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';
const puppeteer = createRequire('C:/Users/adnan/projects/totaltex-web/package.json')('puppeteer-core');
const output = 'C:/Users/adnan/AppData/Local/Temp/claude/briefs/w2/wave3-round3';
mkdirSync(output, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let count = 0;
const check = (name, value) => { assert.ok(value, name); count++; console.log('ok', name); };
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0','--window-size=1500,1100','--disable-features=CalculateNativeWinOcclusion','--force-device-scale-factor=1'] });
const errors = [];
try {
  const p = await browser.newPage();
  p.on('pageerror', e => errors.push(String(e)));
  p.on('console', e => { if(e.type()==='error') errors.push(e.text()); });
  p.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  const top = selector => p.$eval(selector, e => e.getBoundingClientRect().top + scrollY);
  const go = async y => { await p.evaluate(y => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0,y), y); await sleep(1400); };
  const capture = async name => sharp(await p.screenshot()).resize({width:1000,height:1000,fit:'inside',withoutEnlargement:true}).toFile(output+'/'+name+'.png');
  await p.setViewport({width:390,height:844,deviceScaleFactor:1});
  await p.goto(process.argv[2] || 'http://localhost:3100',{waitUntil:'networkidle0'});
  check('phone preflight identity',await p.$eval('h1',e=>e.getAttribute('aria-label')==='Written in Calgary. Running in Dhaka.'));
  await p.waitForFunction(()=>document.documentElement.dataset.intro==='done');await sleep(2000);
  check('phone hero clears backed footer',await p.evaluate(()=>document.querySelector('h1').getBoundingClientRect().bottom<document.querySelector('.chrome-bottom .clocks').getBoundingClientRect().top));
  for (const width of [1440,390]) {
    await p.setViewport({width,height:1000,deviceScaleFactor:1});
    await p.goto(process.argv[2] || 'http://localhost:3100',{waitUntil:'networkidle0'});
    check('identity '+width, await p.$eval('h1', e=>e.getAttribute('aria-label') === 'Written in Calgary. Running in Dhaka.'));
    await p.waitForFunction(()=>document.documentElement.dataset.intro==='done'); await sleep(2000);
    await capture('hero-'+width);
    check('clock digits stay on one baseline '+width,await p.$$eval('.clock-digits',es=>es.every(e=>getComputedStyle(e).display.endsWith('flex')&&getComputedStyle(e).whiteSpace==='nowrap'&&e.getBoundingClientRect().height<=Math.max(...Array.from(e.children,c=>c.getBoundingClientRect().height))+2)));
    check('clock colon aligns with both digit groups '+width,await p.$$eval('.clock-digits',es=>es.every(e=>{const centers=Array.from(e.children,c=>{const r=c.getBoundingClientRect();return r.top+r.height/2;});return Math.max(...centers)-Math.min(...centers)<1;})));
    if(width===1440)check('clock glyph cards align with colon '+width,await p.$$eval('.clock-digits',es=>es.every(e=>{const digit=e.querySelector('.flap-card').getBoundingClientRect(),colon=e.querySelector('.clock-colon').getBoundingClientRect();return Math.abs(digit.top+digit.height/2-colon.top-colon.height/2)<1;})));
    for (const [name,selector] of [['work','.work-stack'],['other','.other-gallery'],['journey','.journey'],['alongside','#side-heading'],['taste','#taste'],['tools','.tools'],['method','#method'],['info','#info'],['e92','#e92'],['contact','#contact']]) {
      if (!await p.$(selector)) continue;
      await go(await top(selector)-110);
      if(name==='journey') { await go(await top('.journey')+450); await p.waitForFunction(()=>document.querySelector('.thread-ribbon').dataset.ready==='true'); }
      await capture(name+'-'+width);
      check('no horizontal overflow '+name+' '+width, await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(name==='e92')check('E92 photos retain full-frame containment '+width,await p.$$eval('#e92 .car-slide-inner img',es=>es.length===4&&es.every(e=>getComputedStyle(e).objectFit==='contain')));
      if(name==='other') check('all image cards readable '+width, await p.$$eval('.other-card', cards=>cards.length===3 && cards.every(e=>e.querySelector('img').naturalWidth>0 && e.scrollHeight<=e.clientHeight && e.querySelector('p').getBoundingClientRect().width<e.getBoundingClientRect().width)));
      if(name==='tools') {
        check('all six tool groups preserved '+width, await p.$$eval('.skill-group', e=>e.length===6));
        check('all labels paint shared gradient '+width, await p.$$eval('.skill-ink', es=>es.length===42 && es.every(e=>getComputedStyle(e).backgroundClip==='text' && getComputedStyle(e).backgroundImage.includes('linear-gradient'))));
        const label=await p.$eval('.skill-ink',e=>{const r=e.getBoundingClientRect();return {left:Math.floor(r.left),top:Math.floor(r.top),width:Math.ceil(r.width),height:Math.ceil(r.height)};});
        const pixels=await sharp(await p.screenshot()).extract(label).removeAlpha().raw().toBuffer();
        let pale=0;for(let i=0;i<pixels.length;i+=3)if(pixels[i]>180&&pixels[i+1]>180&&pixels[i+2]>180)pale++;
        check('gradient glyphs visibly paint '+width,pale>20);
      }
      if(name==='journey') {
        check('ribbon animates with aligned strip columns '+width, await p.$eval('.thread-ribbon', e=>e.dataset.running==='true' && +e.dataset.indices%48===0));
        const paints=await p.$eval('.thread-ribbon', e=>+e.dataset.paints); await p.mouse.move(width*.5,600); await sleep(500);
        check('live ribbon paints '+width, await p.$eval('.thread-ribbon',(e,n)=>+e.dataset.paints>n,paints));
        const cdp=await p.createCDPSession();
        for(const rate of [1,4]) {
          await cdp.send('Emulation.setCPUThrottlingRate',{rate});
          const frame=await p.evaluate(()=>new Promise(resolve=>{
            const frames=[],tasks=[],el=document.querySelector('.thread-ribbon'),initial=+el.dataset.paints;
            let start,last,visible=!document.hidden;
            const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});
            const sample=now=>{
              visible&&=!document.hidden;if(last)frames.push(now-last);last=now;start??=now;
              document.querySelector('.journey').dispatchEvent(new PointerEvent('pointermove',{clientX:innerWidth*(.5+.3*Math.sin(now/700)),clientY:innerHeight*(.5+.2*Math.cos(now/900))}));
              if(now-start<6000)requestAnimationFrame(sample);else{tasks.push(...observer.takeRecords().map(e=>e.duration));observer.disconnect();frames.sort((a,b)=>a-b);resolve({p95:frames[Math.ceil(frames.length*.95)-1],maxTask:Math.max(0,...tasks),paints:+el.dataset.paints-initial,visible});}
            };requestAnimationFrame(sample);
          }));
          console.log('RIBBON_FRAME',width,rate,JSON.stringify(frame));
          check('ribbon frame budget and 60Hz cadence '+width+' '+rate,frame.visible&&frame.p95<=(rate===1?16.7:33)&&frame.maxTask<=50&&frame.paints>=320);
        }
        await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await cdp.detach();
        const hidden=await browser.newPage();await hidden.bringToFront();await sleep(300);
        const stopped=await p.$eval('.thread-ribbon',e=>+e.dataset.paints);await sleep(300);
        check('hidden tab stops ribbon '+width,await p.$eval('.thread-ribbon',(e,n)=>document.hidden&&e.dataset.running==='false'&&+e.dataset.paints===n,stopped));
        await hidden.close();await p.bringToFront();
        const pin=await p.$eval('.journey',e=>{const parent=e.parentElement;return {start:parent.getBoundingClientRect().top+scrollY,distance:parent.offsetHeight-e.offsetHeight};});
        if(pin.distance>0){
          await go(pin.start+1);
          check('first city starts centered '+width,await p.$eval('.journey-title',e=>{const r=e.getBoundingClientRect();return Math.abs(r.left+r.width/2-innerWidth/2)<4;}));
          await capture('journey-departure-'+width);
          await go(pin.start+pin.distance-1);
          const arrival=await p.$$eval('.journey-title',es=>{const r=es[1].getBoundingClientRect();return {center:r.left+r.width/2,left:r.left,right:r.right,width:innerWidth,y:scrollY,hidden:document.hidden,transform:getComputedStyle(es[1]).transform};});
          console.log('CITY_ARRIVAL',width,JSON.stringify({pin,arrival}));
          check('arrival city is centered and fully framed '+width,Math.abs(arrival.center-arrival.width/2)<4&&arrival.left>=0&&arrival.right<=arrival.width);
          await capture('journey-arrival-'+width);
        }
      }
      if(name==='e92'&&width===1440){const start=await top('#e92');await go(start+1000*3.2*.5);check('E92 mid-sequence capture contains the car',await p.$eval('.car-photo',e=>{const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}));await capture('e92-middle-'+width);await go(start+1000*3.2*.85);check('E92 final photo fully reaches its frame',await p.$eval('.car-slide-night',e=>Math.abs(new DOMMatrix(getComputedStyle(e).transform).m41)<1));await capture('e92-details-'+width);}
      if(name==='contact'){await go(await top('.glyph-pit')-180);await capture('contact-settled-'+width);}
    }
    for (let i=0;i<4;i++) { await go(await top('#svc-panel-'+(i+1))-150); await capture('services-'+i+'-'+width); check('full service copy '+i+' '+width,await p.$$eval('.svc-description',es=>es.every(e=>getComputedStyle(e).textOverflow!=='ellipsis'&&getComputedStyle(e).whiteSpace!=='nowrap'))); }
    await go(0); const n=await p.$eval('.thread-ribbon',e=>+e.dataset.paints); await sleep(300);
    check('offscreen ribbon stops '+width,await p.$eval('.thread-ribbon',(e,n)=>e.dataset.running==='false'&&+e.dataset.paints===n,n));
    await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]); await go(await top('.journey')-100);
    const frozen=await p.$eval('.thread-ribbon',e=>+e.dataset.paints); await sleep(350);
    check('reduced ribbon static and complete '+width,await p.$eval('.thread-ribbon',(e,n)=>e.dataset.running==='false'&&+e.dataset.paints===n&&+e.dataset.indices===7680,frozen));
    await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
  }
  const ratios = await p.evaluate(()=>{
    const rgb = s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
    const lum = values=>{const c=values.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
    const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    const stops=[...getComputedStyle(document.querySelector('.skill-ink')).backgroundImage.matchAll(/rgb\([^)]+\)/g)].map(m=>rgb(m[0]));
    const ground=rgb(getComputedStyle(document.querySelector('.skills-list')).backgroundColor);
    const text=rgb(getComputedStyle(document.querySelector('.svc-row')).color);
    const opacity=Math.min(...Array.from(document.querySelectorAll('.svc-row'),e=>+getComputedStyle(e).opacity));
    return {tools:stops.flatMap((a,i)=>i?Array.from({length:33},(_,j)=>contrast(a.map((v,k)=>stops[i-1][k]+(v-stops[i-1][k])*j/32),ground)):[]),services:[...document.querySelectorAll('.svc-colour')].map(e=>{const g=rgb(getComputedStyle(e.dataset.svcColour==='2'?e.firstElementChild:e).backgroundColor);return contrast(text.map((v,i)=>v*opacity+g[i]*(1-opacity)),g);})};
  });
  console.log('contrast',JSON.stringify({toolsMin:Math.min(...ratios.tools),services:ratios.services}));check('all rendered gradient and section text >=4.5',ratios.tools.length>=66&&ratios.services.length===4&&Object.values(ratios).flat().every(n=>n>=4.5));
  check('no runtime or HTTP errors',errors.length===0);console.log('passed',count);
} finally { await browser.close(); }
