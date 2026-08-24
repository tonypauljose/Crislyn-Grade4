/* Render each mock paper 6 times in jsdom and assert every section produced
   questions with a non-empty answer key. */
const fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const ROOT=path.resolve(__dirname,'../..');
const papers=[['worksheets/hy-maths-paper.html','Maths'],
              ['worksheets/hy-english-paper.html','English'],
              ['worksheets/hy-hindi-paper.html','Hindi']];
let bad=0;
papers.forEach(([rel,name])=>{
  for(let run=0;run<6;run++){
    const html=fs.readFileSync(path.join(ROOT,rel),'utf8');
    const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://crislyntony.com/'+rel});
    const w=dom.window,d=w.document;
    const store={};Object.defineProperty(w,'localStorage',{value:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}});
    // load the scripts this page references, in order
    Array.from(d.querySelectorAll('script[src]')).forEach(s=>{
      const p=path.join(path.dirname(path.join(ROOT,rel)),s.getAttribute('src'));
      if(fs.existsSync(p)) w.eval(fs.readFileSync(p,'utf8'));
    });
    // then the inline builder call
    Array.from(d.querySelectorAll('script:not([src])')).forEach(s=>w.eval(s.textContent));

    const secs=Array.from(d.querySelectorAll('#paper-body .pt-section'));
    const keys=Array.from(d.querySelectorAll('#key-body ol'));
    const qs  =Array.from(d.querySelectorAll('#paper-body .q'));
    const keyLis=Array.from(d.querySelectorAll('#key-body ol li'));
    const marks=d.getElementById('paper-marks').textContent;
    const qcount=d.getElementById('paper-qcount').textContent;

    const errs=[];
    if(!secs.length) errs.push('no sections');
    secs.forEach((s,i)=>{ if(!s.querySelectorAll('.q').length) errs.push('section "'+s.querySelector('h3').textContent.split('  ')[0]+'" is empty'); });
    if(qs.length!==keyLis.length) errs.push('questions '+qs.length+' != key entries '+keyLis.length);
    keyLis.forEach((li,i)=>{ if(!li.textContent.trim()) errs.push('key entry '+(i+1)+' is blank'); });
    qs.forEach((q,i)=>{ if(q.textContent.trim().length<6) errs.push('question '+(i+1)+' looks empty'); });
    if(String(Number(marks))!==marks) errs.push('marks not numeric: '+marks);

    if(run===0) console.log(`${name}: ${secs.length} sections · ${qs.length} questions · ${marks} marks`);
    if(errs.length){ bad++; console.log('  ✗ run '+run+': '+[...new Set(errs)].join(' | ')); }
  }
});
console.log(bad? '\n✗ '+bad+' failing renders' : '\n✓ all three papers render with complete answer keys, 6 runs each');
process.exit(bad?1:0);
