/* Exhaustive: force-render one item of EVERY (skill, type) pair that the
   banks and generators can produce, and solve it both right and wrong. */
const fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const ROOT=path.resolve(__dirname,'../..');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{runScripts:'outside-only',pretendToBeVisual:true,url:'https://crislyntony.com/'});
const w=dom.window,d=w.document;
w.speechSynthesis={speak(){},cancel(){},getVoices(){return[]},set onvoiceschanged(v){}};
w.SpeechSynthesisUtterance=function(){};w.State={addStars(){},addSticker(){}};
w.alert=m=>{throw new Error('alert: '+m)};w.confirm=()=>true;w.scrollTo=()=>{};
w.HTMLElement.prototype.scrollIntoView=function(){};
const store={};Object.defineProperty(w,'localStorage',{value:{getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}});
['data/hy-skills.js','js/hy-engine.js','data/hy-maths.js','data/hy-english.js','data/hy-hindi.js','js/hy-ui.js']
  .forEach(f=>w.eval(fs.readFileSync(path.join(ROOT,f),'utf8')));
const HY=w.HY,SK=w.HY_SKILLS,Stage=w.HYStage;
const all=s=>Array.from(d.querySelectorAll(s));
const $=s=>d.querySelector(s);
const click=n=>{if(!n)throw new Error('missing node to click');n.click()};
const errors=[];

/* collect one distinct item per (skill,type) */
const catalogue=new Map();
SK.list.filter(s=>HY.hasContent(s.id)).forEach(s=>{
  for(let lvl=1;lvl<=3;lvl++) for(let n=0;n<120;n++){
    const it=HY.makeItem(s.id,lvl,HY.rngFrom(HY.hashStr(s.id+lvl+'x'+n)),new Set());
    if(!it)continue;
    const key=s.id+'|'+it.type;
    if(!catalogue.has(key)) catalogue.set(key,it);
  }
});
console.log('distinct (skill,type) combinations: '+catalogue.size);

function solve(item,forceWrong){
  const t=item.type;
  if(t==='mcq'){const o=all('.hy-opt');click(o[forceWrong?(item.answer+1)%o.length:item.answer]);}
  else if(t==='tf'){const o=all('.hy-opt');const want=item.answer?0:1;click(o[forceWrong?1-want:want]);}
  else if(t==='fill'){$('.hy-input').value=forceWrong?'@@':String(item.answer);click(all('.hy-foot .hy-btn').pop());}
  else if(t==='steps'){all('.hy-input').forEach((i,k)=>{i.value=forceWrong?'@@':String(item.steps[k].answer)});click(all('.hy-foot .hy-btn').pop());}
  else if(t==='order'||t==='build'){
    const tiles=all('.hy-tiles .hy-tile');
    (forceWrong?item.answer.slice().reverse():item.answer).forEach(v=>{
      const b=tiles.find(x=>x.textContent===v&&!x.disabled);
      if(!b)throw new Error('no tile "'+v+'"');click(b);});
    click(all('.hy-foot .hy-btn').pop());}
  else if(t==='match'){
    const L=all('.hy-match-col:first-child .hy-match-item'),R=all('.hy-match-right');
    item.pairs.forEach((p,i)=>{
      const lb=L.find(x=>x.dataset.v===p[0]); if(!lb)throw new Error('no left "'+p[0]+'"');click(lb);
      const want=forceWrong?item.pairs[(i+1)%item.pairs.length][1]:p[1];
      const rb=R.find(x=>x.dataset.v===want&&!x.disabled)||R.find(x=>!x.disabled);
      if(!rb)throw new Error('no right "'+want+'"');click(rb);});
    click(all('.hy-foot .hy-btn').pop());}
  else if(t==='sort'){
    const home={};item.buckets.forEach(b=>b.items.forEach(i=>home[i]=b.name));
    const names=item.buckets.map(b=>b.name);let g=0;
    while(all('.hy-tiles .hy-tile').length&&g++<80){
      const tile=all('.hy-tiles .hy-tile')[0],v=tile.textContent;click(tile);
      const want=forceWrong?(names.find(n=>n!==home[v])||home[v]):home[v];
      const h=all('.hy-bucket-head').find(x=>x.textContent===want);
      if(!h)throw new Error('no bucket "'+want+'"');click(h);}
    click(all('.hy-foot .hy-btn').pop());}
  else if(t==='passage'){
    const q=item.questions[item._qi||0];
    $('.hy-passage-q .hy-input').value=forceWrong?'@@':String(q.answer);
    click(all('.hy-foot .hy-btn').pop());}
  else if(t==='write'){click(all('.hy-foot .hy-btn').pop());const b=all('.hy-foot .hy-btn');click(forceWrong?b[1]:b[0]);}
  else throw new Error('no solver for '+t);
}

let checkedRight=0,checkedWrong=0;
[false,true].forEach(forceWrong=>{
  catalogue.forEach((proto,key)=>{
    const item=JSON.parse(JSON.stringify(proto));
    Stage.close();
    Stage.opts={mode:'skill',target:1};
    Stage.queue=[item];Stage.idx=0;Stage.answered=0;Stage.right=0;
    Stage.touched={};Stage.started=Date.now();Stage.locked=false;
    if(!Stage.root){Stage.root=d.createElement('div');Stage.root.className='hy-stage';d.body.appendChild(Stage.root);}
    d.body.classList.add('hy-running');Stage.root.style.display='flex';
    try{
      Stage.render();
      // the "Show me" teach card must open and close for every item
      const teach=all('.hy-help-row .hy-btn')[0];
      if(teach){click(teach);
        if(!$('.hy-modal'))errors.push(key+': Show me did not open');
        else click($('.hy-modal .hy-btn'));
        if($('.hy-modal'))errors.push(key+': Show me did not close');}
      solve(item,forceWrong);
      // passage items need every sub-question answered
      if(item.type==='passage'){
        let g=0;
        while(item._qi<item.questions.length-1&&g++<10){
          click(all('.hy-foot .hy-btn').pop());solve(item,forceWrong);}
      }
      const fb=$('.hy-fb'),model=$('.hy-model');
      if(item.type!=='write'&&item.type!=='passage'&&!fb)errors.push(key+': no feedback panel');
      if(fb){
        const ok=fb.classList.contains('hy-fb-ok');
        if(ok===forceWrong)errors.push(key+': graded '+(ok?'right':'wrong')+' but answer was '+(forceWrong?'wrong':'right'));
      }
      if(item.type==='write'&&!model)errors.push(key+': write showed no model answer');
      const next=all('.hy-foot .hy-btn').pop();
      if(!next)errors.push(key+': no continue button');
      forceWrong?checkedWrong++:checkedRight++;
    }catch(e){errors.push(key+' ('+(forceWrong?'wrong':'right')+'): '+e.message);}
  });
});
console.log('rendered+solved correctly: '+checkedRight+' · incorrectly: '+checkedWrong);
const byType={};catalogue.forEach(i=>{byType[i.type]=(byType[i.type]||0)+1});
console.log('types covered: '+JSON.stringify(byType));
if(errors.length){console.log('\n✗ '+errors.length+' problems:');[...new Set(errors)].slice(0,30).forEach(e=>console.log('   '+e));process.exit(1);}
console.log('\n✓ every (skill,type) combination renders, grades right AND wrong correctly');
