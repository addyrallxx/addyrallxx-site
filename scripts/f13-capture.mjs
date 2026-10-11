// Real Chrome, deterministic live-layer masks, and per-viewport desktop comparison.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import sharp from 'sharp';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const [mode = 'baseline', base = 'http://localhost:3100', output = 'C:/Users/adnan/AppData/Local/Temp/claude/briefs/f13-desktop'] = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(output, {recursive:true});
const browser = process.argv.includes('--compare-only') ? null : await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:false,args:['--window-position=-2000,0','--hide-scrollbars','--force-device-scale-factor=1']});
const errors = [], results = [];
async function compare(name,image,masks=[]) {
  const a=await sharp(`${output}/${name}.png`).removeAlpha().raw().toBuffer();
  const b=await sharp(image).removeAlpha().raw().toBuffer();
  assert.equal(a.length,b.length);
  let changed=0;
  const regions=new Array(12).fill(0),diff=Buffer.alloc(a.length);
  for(let i=0;i<a.length;i+=3) {
    const pixel=i/3,x=pixel%1440,y=Math.floor(pixel/1440);
    if(masks.some(r=>x>=r.x-2&&x<r.x+r.width+2&&y>=r.y-2&&y<r.y+r.height+2)) continue;
    if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]) {
      changed++;diff[i]=255;
      regions[Math.floor(pixel/1440/300)*4+Math.floor(pixel%1440/360)]++;
    }
  }
  const ratio=changed/(1440*900),maxRegionRatio=Math.max(...regions)/(360*300);
  results.push({name,changed,ratio,maxRegionRatio,masks});
  if(maxRegionRatio>.005) await sharp(diff,{raw:{width:1440,height:900,channels:3}}).png().toFile(`${output}/${name}-diff.png`);
}
try {
  const p = browser ? await browser.newPage() : null;
  if(p) {
    await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
    p.on('pageerror', e => errors.push(String(e)));
    p.on('response', r => {if(r.status()>=400) errors.push(r.status()+' '+r.url());});
  }
  for (const route of ['/', '/school', '/work', '/work/totaltex-web']) {
    const key = route==='/'?'home':route.slice(1).replaceAll('/','-');
    const manifest = `${output}/${key}.json`;
    if(!p) {
      const {height}=JSON.parse(readFileSync(manifest));
      for(let y=0;y<height;y+=900) {
        const name=`${key}-${y}`,previous=JSON.parse(readFileSync(`${output}/${mode}-results.json`)).results.find(r=>r.name===name);
        await compare(name,readFileSync(`${output}/${name}-${mode}.png`),previous?.masks??[]);
      }
      continue;
    }
    assert.equal((await p.goto(base+route,{waitUntil:'domcontentloaded'})).status(),200);
    await p.waitForFunction(() => document.documentElement.dataset.intro==='done');
    assert(await p.$('main'), 'identity');
    await p.evaluate(() => document.fonts.ready);
    // Only continuously live visuals are masked. Layout and all copy remain measurable.
    await p.addStyleTag({content:'.sky canvas,.clocks,.mesh-field,.section-atmosphere,.marquee-track,.sphere-item,.falling-glyph,.e92-part {visibility:hidden!important}'});
    const height = await p.evaluate(() => document.documentElement.scrollHeight);
    if(mode==='baseline') writeFileSync(manifest,JSON.stringify({height}));
    else assert.equal(height,JSON.parse(readFileSync(manifest)).height, key+' desktop height');
    for(let y=0;y<height;y+=900) {
      await p.evaluate(y=>window.__lenis ? window.__lenis.scrollTo(y,{immediate:true}):scrollTo(0,y),y);
      await sleep(2400);
      // The N54 outline is another live scrub layer. Apply the same mask to old raw references.
      const masks=await p.$$eval('.e92-part',els=>els.map(el=>{const r=el.getBoundingClientRect();return {element:'N54 scrub outline',x:r.x,y:r.y,width:r.width,height:r.height};}).filter(r=>r.x<innerWidth&&r.x+r.width>0&&r.y<innerHeight&&r.y+r.height>0));
      const image = await p.screenshot();
      const name = `${key}-${y}`;
      if(mode==='baseline') writeFileSync(`${output}/${name}.png`,image);
      else {
        writeFileSync(`${output}/${name}-${mode}.png`,image);
        await compare(name,image,masks);
      }
    }
    if(mode==='baseline') await p.screenshot({path:`${output}/${key}-full.png`,fullPage:true});
  }
  writeFileSync(`${output}/${mode}-results.json`,JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({mode,frames:results.length,maxRatio:Math.max(0,...results.map(r=>r.ratio)),maxRegionRatio:Math.max(0,...results.map(r=>r.maxRegionRatio)),errors}));
  assert.equal(errors.length,0);
  assert(results.every(r=>r.ratio<=.005&&r.maxRegionRatio<=.005),'desktop pixel difference exceeds 0.5%');
} finally {await browser?.close();}
