/* Comic Toolbox Gym - core: helpers, state, SRS, mastery */
(function(){
var G = window.G = {views:{}, cleanups:[]};
var CTG = window.CTG;

/* ---------- DOM helpers ---------- */
G.$ = function(s,el){return (el||document).querySelector(s);};
G.$$ = function(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s));};
G.h = function(tag,attrs){
  var el = document.createElement(tag);
  if(attrs) for(var k in attrs){
    var v = attrs[k];
    if(v===null||v===undefined||v===false) continue;
    if(k==='class') el.className=v;
    else if(k==='text') el.textContent=v;
    else if(k.slice(0,2)==='on' && typeof v==='function') el.addEventListener(k.slice(2),v);
    else if(k==='dataset'){for(var d in v) el.dataset[d]=v[d];}
    else if(k==='value') el.value=v;
    else if(k==='checked'||k==='disabled'||k==='selected'||k==='hidden') el[k]=!!v;
    else el.setAttribute(k, v===true?'':v);
  }
  for(var i=2;i<arguments.length;i++) G._add(el, arguments[i]);
  return el;
};
G._add = function(el,c){
  if(c===null||c===undefined||c===false) return;
  if(Array.isArray(c)) c.forEach(function(x){G._add(el,x);});
  else if(c.nodeType) el.appendChild(c);
  else el.appendChild(document.createTextNode(String(c)));
};
G.clear = function(el){while(el.firstChild) el.removeChild(el.firstChild); return el;};
G.shuffle = function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;};
G.pick = function(a){return a[Math.floor(Math.random()*a.length)];};
G.uid = function(p){return (p||'x')+Date.now().toString(36)+Math.random().toString(36).slice(2,7);};
G.clamp = function(n,a,b){return Math.max(a,Math.min(b,n));};
G.pad = function(n){return n<10?'0'+n:''+n;};
G.fmtTime = function(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+G.pad(s%60);};
G.dateKey = function(d){d=d||new Date();return d.getFullYear()+'-'+G.pad(d.getMonth()+1)+'-'+G.pad(d.getDate());};
G.today = function(){return G.dateKey();};
G.dayNum = function(d){d=d||new Date();return Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/864e5+0.5);};
G.fmtDate = function(ts){var d=new Date(ts);return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})+' '+G.pad(d.getHours())+':'+G.pad(d.getMinutes());};
G.wordCount = function(s){var m=(s||'').trim().match(/\S+/g);return m?m.length:0;};
G.lineCount = function(s){return (s||'').split('\n').filter(function(l){return l.trim().length>0;}).length;};

/* ---------- Icons (inline SVG, stroke) ---------- */
var ICONS = {
 home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
 map:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15',
 bolt:'M13 2L4 14h7l-1 8 9-12h-7z',
 quiz:'M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 1.7M12 17h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
 cards:'M3 7h14v12H3zM7 7V4h14v12h-4',
 pen:'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
 wrench:'M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 1-2-2z',
 flask:'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8',
 user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
 route:'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6',
 tv:'M3 6h18v12H3zM8 21h8M9 3l3 3 3-3',
 film:'M4 4h16v16H4zM8 4v16M16 4v16M4 9h4M4 15h4M16 9h4M16 15h4',
 book:'M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6M20 4v14h-8',
 chart:'M4 20V10M10 20V4M16 20v-8M22 20H2',
 gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-1V5H9v2l-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1v2h4v-2l2-1 2 1 2-4-2-1z',
 sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
 moon:'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
 flame:'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z',
 check:'M4 12l5 5 11-11',
 x:'M6 6l12 12M18 6L6 18',
 dice:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01',
 clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
 star:'M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z',
 download:'M12 3v12M7 10l5 5 5-5M4 21h16',
 upload:'M12 21V9M7 14l5-5 5 5M4 3h16',
 search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
 trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
 arrow:'M5 12h14M13 6l6 6-6 6',
 back:'M19 12H5M11 6l-6 6 6 6',
 help:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.7M12 17h.01',
 lock:'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
 grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
 spark:'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z'
};
G.icon = function(name,size){
  var ns='http://www.w3.org/2000/svg';
  var s=document.createElementNS(ns,'svg');
  s.setAttribute('viewBox','0 0 24 24'); s.setAttribute('width',size||18); s.setAttribute('height',size||18);
  s.setAttribute('fill','none'); s.setAttribute('stroke','currentColor'); s.setAttribute('stroke-width','2');
  s.setAttribute('stroke-linecap','round'); s.setAttribute('stroke-linejoin','round'); s.setAttribute('aria-hidden','true'); s.setAttribute('class','ico');
  var p=document.createElementNS(ns,'path'); p.setAttribute('d',ICONS[name]||ICONS.spark); s.appendChild(p); return s;
};

/* ---------- Lookups ---------- */
G.tools = CTG.TOOLS; G.toolMap = {}; G.chMap = {};
CTG.TOOLS.forEach(function(t){G.toolMap[t.id]=t;});
CTG.CHAPTERS.forEach(function(c){G.chMap[c.id]=c;});
G.toolsOfChapter = function(ch){return CTG.TOOLS.filter(function(t){return t.ch===ch;});};
G.byTool = function(arr,id){return arr.filter(function(x){return x.tool===id;});};
G.quizMap = {}; CTG.QUIZ.forEach(function(q){G.quizMap[q.id]=q;});
G.cardMap = {}; CTG.CARDS.forEach(function(c){G.cardMap[c.id]=c;});
G.hue = function(toolId){var t=G.toolMap[toolId];return t?G.chMap[t.ch].color:200;};

/* ---------- State ---------- */
var KEY='ctg.v1';
function defaults(){return {v:1,settings:{theme:'auto',sound:true,goal:10,noedit:false,name:''},read:{},srs:{},quizLog:[],journal:[],activity:{},workouts:{},seen:{},drafts:{},stats:{quizN:0,quizOk:0,cards:0,ex:0,fix:0,words:0,mins:0,xp:0,workouts:0},ach:{},created:Date.now()};}
G.S = defaults();
G.load = function(){
  try{var raw=localStorage.getItem(KEY); if(raw){var o=JSON.parse(raw); G.S=G.merge(defaults(),o);}}catch(e){console.warn('load failed',e);}
};
G.merge = function(base,o){for(var k in o){if(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k])) G.merge(base[k],o[k]); else base[k]=o[k];}return base;};
var saveT=null;
G.save = function(){
  clearTimeout(saveT);
  saveT=setTimeout(G.saveNow,150);
};
G.saveNow = function(){
  try{localStorage.setItem(KEY,JSON.stringify(G.S)); G.saveError=false;}catch(e){G.saveError=true;console.warn('save failed',e);}
};
window.addEventListener('beforeunload',function(){G.saveNow();});
G.reset = function(){G.S=defaults();G.saveNow();};

/* ---------- Announce / toast ---------- */
G.announce = function(msg){var l=G.$('#live'); if(l){l.textContent=''; setTimeout(function(){l.textContent=msg;},30);}};
G.toast = function(msg,kind){
  var box=G.$('#toasts'); if(!box) return;
  var t=G.h('div',{class:'toast '+(kind||''),role:'status'},msg); box.appendChild(t);
  setTimeout(function(){t.classList.add('out');setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},300);},2800);
};
G.beep = function(){
  if(!G.S.settings.sound) return;
  try{var A=window.AudioContext||window.webkitAudioContext; var c=new A(); var o=c.createOscillator(); var g=c.createGain();
    o.type='sine'; o.frequency.value=880; g.gain.value=0.08; o.connect(g); g.connect(c.destination); o.start();
    setTimeout(function(){o.frequency.value=660;},180); setTimeout(function(){o.stop();c.close();},420);}catch(e){}
};

/* ---------- Activity, XP, streak ---------- */
G.addActivity = function(o){ // {mins, xp, items}
  var k=G.today(); var a=G.S.activity[k]||(G.S.activity[k]={mins:0,xp:0,items:0});
  a.mins=Math.round((a.mins+(o.mins||0))*10)/10; a.xp+=o.xp||0; a.items+=o.items||0;
  G.S.stats.mins=Math.round((G.S.stats.mins+(o.mins||0))*10)/10; G.S.stats.xp+=o.xp||0;
  G.save(); G.checkAch();
};
G.streak = function(){
  var n=0, d=new Date(); var k=G.dateKey(d);
  if(!G.S.activity[k]||!G.S.activity[k].items){ d.setDate(d.getDate()-1); }
  while(true){var a=G.S.activity[G.dateKey(d)]; if(a&&a.items>0){n++;d.setDate(d.getDate()-1);} else break;}
  return n;
};
G.bestStreak = function(){
  var keys=Object.keys(G.S.activity).filter(function(k){return G.S.activity[k].items>0;}).sort(); var best=0,cur=0,prev=null;
  keys.forEach(function(k){var p=k.split('-');var dn=G.dayNum(new Date(+p[0],+p[1]-1,+p[2])); if(prev!==null&&dn===prev+1)cur++; else cur=1; prev=dn; if(cur>best)best=cur;});
  return best;
};
G.level = function(){var xp=G.S.stats.xp; var l=1,need=100,rem=xp; while(rem>=need){rem-=need;l++;need=Math.round(need*1.25);} return {level:l,into:rem,need:need};};

/* ---------- SRS (SM-2 style) ---------- */
G.srsKey = function(type,id){return type+':'+id;};
G.srsGet = function(key){return G.S.srs[key]||null;};
// grade: 0 again, 1 hard, 2 good, 3 easy
G.srsCalc = function(e0,grade){
  var e=e0?JSON.parse(JSON.stringify(e0)):{ease:2.5,int:0,reps:0,due:0,lapses:0,n:0}; var t=G.dayNum();
  e.n=(e.n||0)+1;
  if(grade===0){e.reps=0;e.int=0;e.lapses++;e.ease=Math.max(1.3,e.ease-0.2);e.due=t;}
  else{
    if(grade===1){e.ease=Math.max(1.3,e.ease-0.15); e.int=e.reps===0?1:Math.max(1,Math.round(e.int*1.2));}
    else if(grade===2){ e.int=e.reps===0?1:(e.reps===1?3:Math.round(e.int*e.ease)); }
    else { e.ease=e.ease+0.15; e.int=e.reps===0?3:(e.reps===1?6:Math.round(e.int*e.ease*1.3)); }
    e.reps++; e.due=t+Math.max(1,e.int);
  }
  e.last=t; return e;
};
G.srsReview = function(key,grade){var e=G.srsCalc(G.S.srs[key],grade); G.S.srs[key]=e; G.save(); return e;};
G.srsPreview = function(key,grade){var e=G.srsCalc(G.S.srs[key],grade); return grade===0?'<1d':(e.int+'d');};
G.srsDue = function(key){var e=G.S.srs[key]; return !!e&&e.due<=G.dayNum();};
G.srsStrength = function(key){var e=G.S.srs[key]; if(!e||!e.reps) return 0; return Math.min(1,Math.log(1+e.int)/Math.log(15));};
G.dueCards = function(toolId){return CTG.CARDS.filter(function(c){return (!toolId||c.tool===toolId)&&G.srsDue('c:'+c.id);});};
G.dueQuiz = function(toolId){return CTG.QUIZ.filter(function(q){return (!toolId||q.tool===toolId)&&G.srsDue('q:'+q.id);});};
G.newCards = function(toolId,onlyRead){return CTG.CARDS.filter(function(c){return (!toolId||c.tool===toolId)&&!G.S.srs['c:'+c.id]&&(!onlyRead||G.S.read[c.tool]);});};
G.newQuiz = function(toolId,onlyRead){return CTG.QUIZ.filter(function(q){return (!toolId||q.tool===toolId)&&!G.S.srs['q:'+q.id]&&(!onlyRead||G.S.read[q.tool]);});};

/* ---------- Journal helpers ---------- */
G.addJournal = function(entry){
  entry.id=entry.id||G.uid('j'); entry.created=entry.created||Date.now(); entry.star=!!entry.star;
  G.S.journal.unshift(entry); G.save(); return entry;
};
G.journalOf = function(toolId,kind){return G.S.journal.filter(function(j){return j.tool===toolId&&(!kind||j.kind===kind);});};

/* ---------- Mastery ---------- */
G.LEVELS = ['Unseen','Seen','Practising','Capable','Sharp','Mastered'];
G.levelOf = function(pct,any){ if(pct>=92)return 5; if(pct>=75)return 4; if(pct>=50)return 3; if(pct>=25)return 2; if(pct>=8||any)return 1; return 0; };
G.mastery = function(toolId){
  var parts={}, earn=0, avail=0, W={lesson:8,quiz:24,cards:24,ex:28,fix:16};
  var qs=G.byTool(CTG.QUIZ,toolId), cs=G.byTool(CTG.CARDS,toolId), fs=G.byTool(CTG.FIX,toolId);
  // lesson
  parts.lesson = G.S.read[toolId]?1:0; avail+=W.lesson; earn+=W.lesson*parts.lesson;
  if(qs.length){var s=0;qs.forEach(function(q){s+=G.srsStrength('q:'+q.id);}); parts.quiz=s/qs.length; avail+=W.quiz; earn+=W.quiz*parts.quiz;}
  if(cs.length){var s2=0;cs.forEach(function(c){s2+=G.srsStrength('c:'+c.id);}); parts.cards=s2/cs.length; avail+=W.cards; earn+=W.cards*parts.cards;}
  var ex=G.journalOf(toolId,'exercise').slice(0,3);
  var avg=ex.length?ex.reduce(function(a,j){return a+((j.meta&&j.meta.selfScore)||50);},0)/ex.length/100:0;
  parts.ex=Math.min(1,ex.length/3)*avg; avail+=W.ex; earn+=W.ex*parts.ex;
  if(fs.length){
    var done={},sc={}; G.journalOf(toolId,'fixit').forEach(function(j){var id=j.meta&&j.meta.fixId; if(id&&!done[id]){done[id]=1;sc[id]=(j.meta.selfScore||50)/100;}});
    var tot=0,n=0; for(var id in sc){tot+=sc[id];n++;}
    parts.fix=Math.min(1,n/Math.min(2,fs.length))*(n?tot/n:0); avail+=W.fix; earn+=W.fix*parts.fix;
  }
  var pct=Math.round(100*earn/avail);
  var any=parts.lesson>0||G.journalOf(toolId).length>0||qs.some(function(q){return G.S.srs['q:'+q.id];})||cs.some(function(c){return G.S.srs['c:'+c.id];});
  return {pct:pct,level:G.levelOf(pct,any),parts:parts};
};
G.masteryAll = function(){var m={};CTG.TOOLS.forEach(function(t){m[t.id]=G.mastery(t.id);});return m;};
G.overall = function(){var m=G.masteryAll(),s=0;CTG.TOOLS.forEach(function(t){s+=m[t.id].pct;});return Math.round(s/CTG.TOOLS.length);};
G.weakest = function(n,onlyStarted){
  var m=G.masteryAll(); var arr=CTG.TOOLS.filter(function(t){return !onlyStarted||m[t.id].level>0;}).map(function(t){return {t:t,m:m[t.id]};});
  arr.sort(function(a,b){return a.m.pct-b.m.pct;}); return arr.slice(0,n||5);
};
G.nextUnread = function(){return CTG.TOOLS.filter(function(t){return !G.S.read[t.id];})[0]||null;};

/* ---------- Prompt banks ---------- */
G.prompt = function(bank,keyId){
  var banks=[].concat(bank||[]); if(!banks.length) return '';
  var b=G.pick(banks); var arr=CTG.PROMPTS[b]; if(!arr||!arr.length) return '';
  var seen=G.S.seen[b]||(G.S.seen[b]=[]); var idx=[];
  for(var i=0;i<arr.length;i++) if(seen.indexOf(i)<0) idx.push(i);
  if(!idx.length){seen.length=0; for(var j=0;j<arr.length;j++) idx.push(j);}
  var pick=G.pick(idx); seen.push(pick); G.save(); return arr[pick];
};
G.fillTpl = function(ex){
  var b=[].concat(ex.bank||[]);
  if(!b.length) return {text:'',vals:[]};
  var p=G.prompt(b[0]), q=b.length>1?G.prompt(b[1]):'';
  return {text:(ex.tpl||'{p}').replace('{p}',p).replace('{q}',q),vals:[p,q]};
};

/* ---------- Achievements ---------- */
G.ACH = [
 {id:'first',name:'First Tool',desc:'Read your first lesson.',test:function(){return Object.keys(G.S.read).length>=1;}},
 {id:'ten',name:'Ten Tools',desc:'Read 10 lessons.',test:function(){return Object.keys(G.S.read).length>=10;}},
 {id:'all',name:'Full Toolbox',desc:'Read every lesson.',test:function(){return Object.keys(G.S.read).length>=CTG.TOOLS.length;}},
 {id:'q50',name:'Quizzed',desc:'Answer 50 quiz questions.',test:function(){return G.S.stats.quizN>=50;}},
 {id:'q250',name:'Quiz Machine',desc:'Answer 250 quiz questions.',test:function(){return G.S.stats.quizN>=250;}},
 {id:'c100',name:'Card Shark',desc:'Review 100 flashcards.',test:function(){return G.S.stats.cards>=100;}},
 {id:'ex10',name:'Ten Reps',desc:'Complete 10 writing exercises.',test:function(){return G.S.stats.ex>=10;}},
 {id:'ex50',name:'Wade Boggs',desc:'Complete 50 writing exercises.',test:function(){return G.S.stats.ex>=50;}},
 {id:'fix10',name:'Fixer',desc:'Complete 10 fix-it challenges.',test:function(){return G.S.stats.fix>=10;}},
 {id:'w5k',name:'5,000 Words',desc:'Write 5,000 words in exercises.',test:function(){return G.S.stats.words>=5000;}},
 {id:'s3',name:'3-Day Streak',desc:'Practise 3 days in a row.',test:function(){return G.bestStreak()>=3;}},
 {id:'s7',name:'Week Warrior',desc:'Practise 7 days in a row.',test:function(){return G.bestStreak()>=7;}},
 {id:'s30',name:'Drive',desc:'Practise 30 days in a row.',test:function(){return G.bestStreak()>=30;}},
 {id:'wo7',name:'Daily Habit',desc:'Finish 7 daily workouts.',test:function(){return G.S.stats.workouts>=7;}},
 {id:'sharp',name:'Sharp Tool',desc:'Reach Sharp level in any tool.',test:function(){return CTG.TOOLS.some(function(t){return G.mastery(t.id).level>=4;});}},
 {id:'master',name:'Mastery',desc:'Reach Mastered in any tool.',test:function(){return CTG.TOOLS.some(function(t){return G.mastery(t.id).level>=5;});}}
];
G.checkAch = function(){
  G.ACH.forEach(function(a){ if(!G.S.ach[a.id]&&a.test()){G.S.ach[a.id]=Date.now(); G.toast('Achievement unlocked: '+a.name,'ach'); G.save();} });
};
})();
