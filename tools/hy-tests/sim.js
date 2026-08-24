// 21-day simulation: does a realistic learner actually reach mastery in time?
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'../..');
const store={};
let CLOCK = new Date(2026,7,24,17,0,0);           // 24 Aug 2026, local
class FakeDate extends Date {
  constructor(...a){ if(!a.length) super(CLOCK.getTime()); else super(...a); }
  static now(){ return CLOCK.getTime(); }
}
const sandbox={console,Math,JSON,Set,Map,Array,Object,String,Number,Boolean,RegExp,Error,
  Date:FakeDate,
  localStorage:{getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}};
sandbox.window=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox);
['data/hy-skills.js','js/hy-engine.js','data/hy-maths.js','data/hy-english.js','data/hy-hindi.js']
  .forEach(f=>vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),sandbox,{filename:f}));
const HY=sandbox.HY,SK=sandbox.HY_SKILLS;

// Simulated learner: each skill has a hidden true ability that improves with
// exposure. Hindi starts weaker (as she does). Level-3 items are harder.
const ability={};
SK.list.forEach(s=>{ ability[s.id]= s.subject==='hindi'?0.34:(s.flag==='weak'?0.30:0.52); });

let totalQ=0, sessions=0;
const DAYS=21;
for(let d=0; d<DAYS; d++){
  const T=HY.recommendedTarget(); const items=HY.buildSession({mode:'daily',target:T});
  if(!items.length){ console.log('day '+d+': EMPTY SESSION'); break; }
  let right=0;
  items.forEach(it=>{
    const lvlPenalty={1:0,2:0.10,3:0.20}[it.level||1];
    const guess = it.type==='mcq'? 1/((it.options||[1,2,3,4]).length) : 0.02;
    const p = Math.max(guess, Math.min(0.97, ability[it.skill]-lvlPenalty));
    const ok = Math.random()<p;
    HY.record(it.skill, ok);
    if(ok){ right++; ability[it.skill]=Math.min(0.97, ability[it.skill]+0.035); }
    else   { ability[it.skill]=Math.min(0.97, ability[it.skill]+0.075); }  // learns more from a miss
    totalQ++;
  });
  HY.finishSession({total:items.length,right,mode:'daily',secs:1400});
  sessions++;
  const pct=HY.overallPct();
  const mast=SK.list.filter(s=>HY.hasContent(s.id)&&HY.isMastered(s.id)).length;
  const due=HY.dueSkills().length, fresh=HY.newSkills().length;
  console.log(`day ${String(d+1).padStart(2)} | ${String(Math.round(right/items.length*100)).padStart(3)}% correct | ready ${String(pct).padStart(3)}% | mastered ${String(mast).padStart(2)}/55 | rec ${String(T).padStart(2)} | due ${String(due).padStart(2)} | unmet ${fresh}`);
  CLOCK = new Date(CLOCK.getTime()+86400000);
}

console.log('\n--- after '+sessions+' days, '+totalQ+' questions ---');
['maths','english','hindi'].forEach(s=>{
  const r=HY.subjectReport(s);
  console.log(`${s.padEnd(8)} ${String(r.pct).padStart(3)}%  mastered ${r.mastered}  solid ${r.solid}  getting ${r.getting}  met ${r.met}  unmet ${r.untouched}`);
});
const notMastered=SK.list.filter(s=>HY.hasContent(s.id)&&!HY.isMastered(s.id));
console.log('\nnot yet mastered ('+notMastered.length+'): '+notMastered.map(s=>s.id).join(' '));
console.log('streak days: '+HY.streakDays());
console.log('trouble spots: '+HY.troubleSpots(5).map(t=>t.id+' '+t.acc+'%').join(', '));
