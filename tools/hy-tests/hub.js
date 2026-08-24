/* Load the real hub page in jsdom, run its inline script, exercise the buttons. */
const fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const ROOT=path.resolve(__dirname,'../..');
const errors=[];
const html=fs.readFileSync(path.join(ROOT,'half-yearly.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://crislyntony.com/half-yearly.html'});
const w=dom.window,d=w.document;
w.speechSynthesis={speak(){},cancel(){},getVoices(){return[]},set onvoiceschanged(v){}};
w.SpeechSynthesisUtterance=function(){};w.State={addStars(){},addSticker(){}};
w.alert=m=>errors.push('alert: '+m);w.confirm=()=>true;w.scrollTo=()=>{};
w.HTMLElement.prototype.scrollIntoView=function(){};
const store={};Object.defineProperty(w,'localStorage',{value:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}});
Array.from(d.querySelectorAll('script[src]')).forEach(s=>{
  const p=path.join(ROOT,s.getAttribute('src'));
  if(!fs.existsSync(p)){ if(!/analytics|state\.js/.test(p)) errors.push('missing script '+s.getAttribute('src')); return; }
  try{ w.eval(fs.readFileSync(p,'utf8')); }catch(e){ errors.push(s.getAttribute('src')+': '+e.message); }
});
try{ Array.from(d.querySelectorAll('script:not([src])')).forEach(s=>w.eval(s.textContent)); }
catch(e){ errors.push('inline hub script: '+e.message); }

const $=id=>d.getElementById(id);
console.log('days to exam: '+$('hy-days').textContent);
console.log('portion ready: '+$('hy-overall').textContent+' · mastered '+$('hy-mastered').textContent);
console.log('start button: "'+$('hy-start').textContent+'"');
console.log('subject cards: '+d.querySelectorAll('.hy-subject').length);
console.log('skill buttons: '+d.querySelectorAll('.hy-skill').length);
console.log('topics: '+d.querySelectorAll('.hy-topic').length);

if(d.querySelectorAll('.hy-subject').length!==3) errors.push('expected 3 subject cards');
if(d.querySelectorAll('.hy-skill').length!==55) errors.push('expected 55 skill buttons, got '+d.querySelectorAll('.hy-skill').length);
if($('hy-days').textContent==='—') errors.push('countdown did not compute');

// filters
['maths','english','hindi','all'].forEach(sub=>{
  const b=d.querySelector('.hy-filter[data-sub="'+sub+'"]'); b.click();
  const n=d.querySelectorAll('.hy-skill').length;
  const want=sub==='all'?55:w.HY_SKILLS.forSubject(sub).length;
  if(n!==want) errors.push('filter '+sub+': '+n+' skills, expected '+want);
});
console.log('filters ok');

// every CTA opens the stage
[['hy-start','daily'],['hy-quick','quick'],['hy-weak','weak'],['hy-mock','mock']].forEach(([id,name])=>{
  $(id).click();
  const stage=d.querySelector('.hy-stage');
  if(!stage||stage.style.display!=='flex') errors.push(name+' did not open the stage');
  const n=w.HYStage.queue.length;
  if(!n) errors.push(name+' produced an empty queue');
  if(name==='daily') console.log('daily queue: '+n+' items across '+new Set(w.HYStage.queue.map(i=>i.subject)).size+' subjects');
  w.HYStage.close();
});
// drilling a single skill from the map
d.querySelector('.hy-skill').click();
if(w.HYStage.queue.length!==10) errors.push('skill drill should be 10 items, got '+w.HYStage.queue.length);
w.HYStage.close();
console.log('all CTAs open the stage');

if(errors.length){console.log('\n✗ '+errors.length+' problems:');[...new Set(errors)].forEach(e=>console.log('   '+e));process.exit(1);}
console.log('\n✓ hub page loads and every control works');
