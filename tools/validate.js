// Run: node tools/validate.js   (checks content integrity)
const path=require('path'),vm=require('vm'),fs=require('fs');
const dir=path.join(__dirname,'..','js','content');const ctx={};ctx.window=ctx;vm.createContext(ctx);
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const files=[...html.matchAll(/src="js\/content\/([^"]+)"/g)].map(m=>m[1]);
files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f}));
const C=ctx.CTG;let bad=0;const err=m=>{console.log('ERROR',m);bad++;};
const tools=new Set(C.TOOLS.map(t=>t.id));if(tools.size!==C.TOOLS.length)err('dup tool ids');
for(const [name,arr] of [['QUIZ',C.QUIZ],['CARDS',C.CARDS],['EXERCISES',C.EXERCISES],['FIX',C.FIX]]){
  const ids=new Set();arr.forEach(x=>{if(ids.has(x.id))err(name+' dup id '+x.id);ids.add(x.id);if(!tools.has(x.tool))err(name+' bad tool '+x.tool);});}
C.QUIZ.forEach(q=>{if(q.c.length!==4||new Set(q.c).size!==4)err('quiz choices '+q.id);});
C.TOOLS.forEach(t=>{if(!t.rub||t.rub.length<3)err('rubric '+t.id);});
C.EXERCISES.forEach(e=>[].concat(e.bank||[]).forEach(b=>{if(!C.PROMPTS[b])err('missing bank '+b+' in '+e.id);}));
Object.entries(C.PROMPTS).forEach(([k,v])=>{if(v.length<15)err('bank too small '+k);});
C.BUILDERS.forEach(b=>b.steps.forEach(s=>(s.bank||[]).forEach(x=>{if(!C.PROMPTS[x])err('builder bank '+x);})));
const need=['index.html'];
console.log({tools:C.TOOLS.length,chapters:C.CHAPTERS.length,quiz:C.QUIZ.length,cards:C.CARDS.length,exercises:C.EXERCISES.length,fixit:C.FIX.length,promptBanks:Object.keys(C.PROMPTS).length,prompts:Object.values(C.PROMPTS).reduce((a,v)=>a+v.length,0),builders:C.BUILDERS.length});
const unlisted=fs.readdirSync(dir).filter(f=>!files.includes(f));if(unlisted.length)err('content files not in index.html: '+unlisted);
console.log(bad?bad+' problems':'OK');process.exit(bad?1:0);
