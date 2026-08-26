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
console.log('lessons learnt: '+$('hy-taught').textContent+' · shelf says: '+$('hy-learn-count').textContent.trim());
console.log('subject cards: '+d.querySelectorAll('.hy-subject').length);
console.log('skill buttons: '+d.querySelectorAll('.hy-skill').length);
console.log('lesson buttons: '+d.querySelectorAll('.hy-lesson-btn').length);
console.log('topics on the map: '+d.querySelectorAll('#hy-map .hy-topic').length);

if(d.querySelectorAll('.hy-subject').length!==3) errors.push('expected 3 subject cards');
if(d.querySelectorAll('.hy-skill').length!==55) errors.push('expected 55 skill buttons, got '+d.querySelectorAll('.hy-skill').length);
if(d.querySelectorAll('.hy-lesson-btn').length!==55) errors.push('expected 55 lesson buttons, got '+d.querySelectorAll('.hy-lesson-btn').length);
if($('hy-days').textContent==='—') errors.push('countdown did not compute');
if(!/lesson/i.test($('hy-start').textContent)) errors.push('start button should announce the lessons: '+$('hy-start').textContent);

// filters
['maths','english','hindi','all'].forEach(sub=>{
  const b=d.querySelector('.hy-filter[data-sub="'+sub+'"]'); b.click();
  const n=d.querySelectorAll('.hy-skill').length;
  const want=sub==='all'?55:w.HY_SKILLS.forSubject(sub).length;
  if(n!==want) errors.push('filter '+sub+': '+n+' skills, expected '+want);
});
// the lesson shelf is a sequenced path, not a flat list
const units = d.querySelectorAll('.hy-unit').length;
const locked = d.querySelectorAll('.hy-unit.is-locked').length;
const lockedBtns = Array.from(d.querySelectorAll('.hy-unit.is-locked .hy-lesson-btn')).filter(b => b.disabled).length;
console.log('units: ' + units + ' · locked on a fresh start: ' + locked);
if (units !== 12) errors.push('expected 12 units, got ' + units);
if (locked < 6) errors.push('a fresh start should have most units locked, only ' + locked + ' were');
if (locked && !lockedBtns) errors.push('a locked unit still let its lessons be opened');
// the first unit of every subject must be open, or she can never start
['maths','english','hindi'].forEach(sub => {
  const first = Array.from(d.querySelectorAll('.hy-unit')).find(u =>
    u.querySelector('.hy-unit-title b').textContent.includes(w.HY_SKILLS.subjects[sub].name));
  if (first && first.classList.contains('is-locked')) errors.push(sub + ' has no open unit to start from');
});
// times tables are their own module, not a reading lesson
const tablesBtn = Array.from(d.querySelectorAll('.hy-lesson-btn')).find(b =>
  b.textContent.includes('Tables 2 to 12'));
if (!tablesBtn) errors.push('the tables skill is missing from the shelf');
else if (!/dojo/.test(tablesBtn.textContent)) errors.push('the tables skill should point at the dojo');

// lesson shelf filters
['maths','english','hindi','all'].forEach(sub=>{
  const b=d.querySelector('.hy-lfilter[data-lsub="'+sub+'"]'); b.click();
  const n=d.querySelectorAll('.hy-lesson-btn').length;
  const want=sub==='all'?55:w.HY_SKILLS.forSubject(sub).length;
  if(n!==want) errors.push('lesson filter '+sub+': '+n+' lessons, expected '+want);
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
// an UNTAUGHT skill on the map must open the lesson, never a cold quiz
const firstSkill=d.querySelector('.hy-skill');
const firstId=w.HY_SKILLS.list.filter(s=>w.HY.hasContent(s.id))[0].id;
if(w.HY.isTaught(firstId)) errors.push('fixture problem: '+firstId+' should start untaught');
firstSkill.click();
const learnRoot=d.querySelector('.hy-learn');
if(!learnRoot||learnRoot.style.display!=='flex') errors.push('an untaught skill did not open its lesson');
if(w.HYStage.root&&w.HYStage.root.style.display==='flex') errors.push('an untaught skill opened the drill');

// click all the way through that lesson: it must end marked as taught
let guard=0;
while(learnRoot.style.display==='flex'){
  if(guard++>80){errors.push('lesson never finished');break;}
  const btns=Array.from(d.querySelectorAll('.hy-learn .hy-foot .hy-btn'));
  const later=btns.find(b=>/Not just now|अभी नहीं/.test(b.textContent));
  (later||btns[btns.length-1]).click();
}
if(!w.HY.isTaught(firstId)) errors.push('finishing a lesson did not mark '+firstId+' as taught');
console.log('lesson for '+firstId+' completed in '+guard+' taps · taught: '+w.HY.isTaught(firstId));

// now that it IS taught, the same button drills it
d.querySelector('.hy-skill').click();
if(w.HYStage.queue.length!==10) errors.push('skill drill should be 10 items, got '+w.HYStage.queue.length);
w.HYStage.close();

// the shelf's own CTA opens a lesson too
$('hy-learn-next').click();
if(d.querySelector('.hy-learn').style.display!=='flex') errors.push('next-lesson CTA did not open a lesson');
w.HYLearn.close(false);
console.log('all CTAs open the stage');

if(errors.length){console.log('\n✗ '+errors.length+' problems:');[...new Set(errors)].forEach(e=>console.log('   '+e));process.exit(1);}
console.log('\n✓ hub page loads and every control works');
