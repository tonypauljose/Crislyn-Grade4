const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'../..');const store={};
const sandbox={console,Math,Date,JSON,Set,Map,Array,Object,String,Number,Boolean,RegExp,Error,
 localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}};
sandbox.window=sandbox;sandbox.globalThis=sandbox;vm.createContext(sandbox);
['data/hy-skills.js','js/hy-engine.js','data/hy-maths.js','data/hy-english.js','data/hy-hindi.js']
 .forEach(f=>vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),sandbox,{filename:f}));
const HY=sandbox.HY,SK=sandbox.HY_SKILLS;
const clean=h=>String(h==null?'':h).replace(/<br\s*\/?>/gi,' / ').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const want=process.argv[2]?process.argv[2].split(','):null;
SK.list.filter(s=>HY.hasContent(s.id)).filter(s=>!want||want.includes(s.id)).forEach(s=>{
  console.log('\n\x1b[35m'+s.id+' · '+s.name+'\x1b[0m');
  [1,2,3].forEach(lvl=>{
    const it=HY.makeItem(s.id,lvl,HY.rngFrom(HY.hashStr(s.id+lvl+'seed7')),new Set());
    if(!it)return;
    let a='';
    if(it.type==='mcq')a=clean(it.options[it.answer]);
    else if(it.type==='tf')a=String(it.answer);
    else if(it.type==='fill')a=clean(it.answer);
    else if(it.type==='order'||it.type==='build')a=it.answer.map(clean).join(' | ');
    else if(it.type==='match')a=it.pairs.map(p=>clean(p[0])+'→'+clean(p[1])).join(' · ');
    else if(it.type==='sort')a=it.buckets.map(b=>b.name+':'+b.items.join(',')).join(' · ');
    else if(it.type==='steps')a=it.steps.map(x=>clean(x.answer)).join(' → ');
    else if(it.type==='write')a=clean(it.model).slice(0,80)+'…';
    else if(it.type==='passage')a=it.questions.map(q=>clean(q.answer)).join(' | ');
    console.log('  L'+lvl+' ['+it.type+'] '+clean(it.q).slice(0,120));
    if(it.type==='mcq')console.log('       options: '+it.options.map(clean).join('  ·  '));
    console.log('       \x1b[32m→ '+a.slice(0,150)+'\x1b[0m');
  });
});
