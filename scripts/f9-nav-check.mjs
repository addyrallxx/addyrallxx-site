import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import sharp from 'sharp';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const base = process.argv[2] ?? 'http://localhost:3100';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--hide-scrollbars', '--force-device-scale-factor=1'] });
const lum = rgb => rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c+.055)/1.055)**2.4; }).reduce((s,c,i) => s+c*[.2126,.7152,.0722][i],0);
try {
  const p = await browser.newPage();
  await p.setCacheEnabled(false);
  const errors = [];
  p.on('pageerror', error => errors.push(String(error)));
  for (const width of [1440,390]) {
    await p.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1 });
    for (const [route,href] of [['/school','/school'],['/work','/#work'],['/work/totaltex-web','/#work']]) {
      assert.equal((await p.goto(base+route)).status(),200);
      await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
      assert.equal(await p.$eval('.chrome-nav a[aria-current="page"]', el => el.getAttribute('href')),href);
      assert.equal(await p.$$eval('.chrome-nav a[aria-current="page"]', nodes => nodes.length),1);
    }
    await p.goto(base);
    await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    for (const id of ['work','info','contact']) {
      await p.evaluate(id => { const y=document.getElementById(id).getBoundingClientRect().top+scrollY-100; if (window.__lenis) window.__lenis.scrollTo(y,{immediate:true}); else scrollTo(0,y); },id);
      await p.waitForFunction(id => document.querySelector('.chrome-nav a[aria-current="page"]')?.getAttribute('href') === '/#'+id,{},id);
    }
    await p.goto(base+'/school');
    await sleep(1800);
    if (width === 390) await p.click('.menu-button');
    const selector = width === 390 ? '.menu-sheet nav a[aria-current="page"]' : '.chrome-nav a[aria-current="page"]';
    for (const mode of ['night','day']) {
      await p.evaluate(mode => { document.documentElement.dataset.mode=mode; window.dispatchEvent(new CustomEvent('sky:mode',{detail:{mode}})); },mode);
      await sleep(1100);
      assert(await p.$eval(selector,el => { const s=getComputedStyle(el); return s.color===getComputedStyle(document.body).color && s.textDecorationLine.includes('underline') && s.textDecorationThickness==='2px' && s.textUnderlineOffset==='6px'; }));
      const nodes = await p.evaluate(() => {
        const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=canvas.height=1;
        return [...document.querySelectorAll('.chrome-name a,.chrome-nav a,.menu-button,.menu-sheet nav a')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility==='visible').map(el=>{const r=el.getBoundingClientRect();ctx.fillStyle=getComputedStyle(el).color;ctx.fillRect(0,0,1,1);return {x:r.x,y:r.y,w:r.width,h:r.height,rgb:[...ctx.getImageData(0,0,1,1).data].slice(0,3),name:el.textContent};});
      });
      const maskStyle=await p.addStyleTag({content:'.chrome a,.chrome button,.menu-sheet a {color:rgb(255,0,255)!important;-webkit-text-fill-color:rgb(255,0,255)!important;}'});
      const mask=await sharp(await p.screenshot()).raw().toBuffer({resolveWithObject:true});await maskStyle.evaluate(el=>el.remove());
      const bgStyle=await p.addStyleTag({content:'.chrome a,.chrome button,.menu-sheet a {color:transparent!important;-webkit-text-fill-color:transparent!important;}'});
      const bg=await sharp(await p.screenshot()).raw().toBuffer({resolveWithObject:true});await bgStyle.evaluate(el=>el.remove());
      let minimum=Infinity,samples=0;
      for(const node of nodes) for(let y=Math.max(0,Math.ceil(node.y));y<Math.min(bg.info.height,node.y+node.h);y++) for(let x=Math.max(0,Math.ceil(node.x));x<Math.min(bg.info.width,node.x+node.w);x++) {
        const i=(y*bg.info.width+x)*bg.info.channels;
        if(mask.data[i]<180||mask.data[i+1]>80||mask.data[i+2]<180) continue;
        const a=lum(node.rgb),b=lum([bg.data[i],bg.data[i+1],bg.data[i+2]]);minimum=Math.min(minimum,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));samples++;
      }
      assert(samples>10);assert(minimum>=4.5,`nav ${width} ${mode} contrast ${minimum}`);
      console.log(`Nav ${width} ${mode} capture contrast ${minimum.toFixed(2)}:1`);
    }
    if(width===390) await p.keyboard.press('Escape');
  }
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('F9 nav checks passed');
} finally {await browser.close();}
