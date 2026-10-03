/* Comic Toolbox Gym - main views */
(function(){
var G=window.G, h=G.h, CTG=window.CTG, V=G.views;
G.go=function(p){location.hash=p;};
function head(title,sub,right){return h('div',{class:'pagehead'},h('div',{},h('h1',{},title),sub?h('p',{class:'sub'},sub):null),right||null);}
G.head=head;
function empty(msg){return h('div',{class:'empty'},msg);}

/* ---------- selection helpers ---------- */
function prio(key,isRead){var e=G.S.srs[key]; var r=Math.random()*0.5; if(!e) return (isRead?1:1.6)+r; if(G.srsDue(key)) return r*0.4; return 2+G.srsStrength(key)*2+r;}
G.pickQuiz=function(pool,n){
  return pool.map(function(q){return {q:q,p:prio('q:'+q.id,!!G.S.read[q.tool])};}).sort(function(a,b){return a.p-b.p;}).slice(0,n).map(function(x){return x.q;});
};
G.pickCards=function(pool,n){
  return pool.map(function(c){return {c:c,p:prio('c:'+c.id,!!G.S.read[c.tool])};}).sort(function(a,b){return a.p-b.p;}).slice(0,n).map(function(x){return x.c;});
};
function chapterTools(ch){return G.toolsOfChapter(+ch).map(function(t){return t.id;});}

/* ---------- DASHBOARD ---------- */
V.dashboard=function(root){
  var st=G.streak(), lv=G.level(), ov=G.overall(), dueC=G.dueCards().length, dueQ=G.dueQuiz().length;
  var todayAct=G.S.activity[G.today()]||{mins:0,xp:0,items:0};
  var doneToday=!!G.S.workouts[G.today()];
  var nm=G.S.settings.name?', '+G.S.settings.name:'';
  var next=G.nextUnread(); var weak=G.weakest(5,true);
  var read=Object.keys(G.S.read).length;
  root.appendChild(head('Welcome back'+nm,'The comic toolbox is a practice gym. Ten minutes a day beats a long cram.'));
  var hero=h('section',{class:'hero card'},
    h('div',{class:'hero-main'},
      h('div',{class:'eyebrow'},doneToday?'Workout complete':'Today\'s workout'),
      h('h2',{},doneToday?'You did your 10 minutes. Go again?':'Your 10-minute workout is ready'),
      h('p',{class:'muted'},'Built from what is due: '+(next&&!G.S.read[next.id]?'a new lesson, ':'')+Math.min(8,dueC||5)+' cards, 5 quiz questions and a 5-minute writing sprint on your weakest tool.'),
      h('div',{class:'row'},h('a',{class:'btn primary lg',href:'#/workout'},G.icon('bolt',18),doneToday?'Another workout':'Start workout'),
        next?h('a',{class:'btn lg',href:'#/tool/'+next.id},'Next lesson: '+next.name):h('a',{class:'btn lg',href:'#/map'},'Open skill map'))),
    h('div',{class:'hero-side'},
      G.ring(ov,200,92,ov+'%'),h('div',{class:'ringlab'},'overall mastery')));
  var slot=h('div',{id:'install-slot'}); var ic=G.installCard(); if(ic)slot.appendChild(ic); root.appendChild(slot);
  root.appendChild(hero);
  // stats
  var stats=h('section',{class:'stats'},
    stat('flame',st+' day'+(st===1?'':'s'),'streak',st>0?'Best '+Math.max(st,G.bestStreak()):'Practise today to start one'),
    stat('cards',dueC,'cards due',G.newCards(null,true).length+' new available'),
    stat('quiz',dueQ,'questions due',G.S.stats.quizN?Math.round(100*G.S.stats.quizOk/G.S.stats.quizN)+'% accuracy':'Not started'),
    stat('book',read+'/'+CTG.TOOLS.length,'lessons read',G.S.stats.ex+' exercises written'),
    stat('spark','Lv '+lv.level,G.S.stats.xp+' XP',(lv.need-lv.into)+' XP to next level'));
  root.appendChild(stats);
  // week strip
  var strip=h('div',{class:'week'}); var d=new Date(); d.setDate(d.getDate()-6);
  for(var i=0;i<7;i++){var k=G.dateKey(d), a=G.S.activity[k]; var on=a&&a.items>0;
    strip.appendChild(h('div',{class:'day '+(on?'on':'')+(k===G.today()?' today':''),title:k+(on?': '+a.mins+' min':'')},h('span',{},['S','M','T','W','T','F','S'][d.getDay()]),h('i',{},on?G.icon('check',14):null))); d.setDate(d.getDate()+1);}
  var cols=h('div',{class:'cols'});
  cols.appendChild(h('section',{class:'card'},h('h3',{},'This week'),strip,h('p',{class:'muted small'},'Today: '+todayAct.mins+' min, '+todayAct.xp+' XP, '+todayAct.items+' items')));
  // weakest
  var wk=h('section',{class:'card'},h('h3',{},weak.length?'Needs attention':'Start here'));
  if(!weak.length){ wk.appendChild(h('p',{class:'muted'},'Read your first lesson to unlock quizzes, cards and writing drills for that tool.')); if(next) wk.appendChild(h('a',{class:'btn primary',href:'#/tool/'+next.id},'Start: '+next.name)); }
  else wk.appendChild(h('ul',{class:'tlist'},weak.map(function(w){return h('li',{},h('a',{href:'#/tool/'+w.t.id},h('span',{class:'dot',style:'--hue:'+G.hue(w.t.id)}),w.t.name),h('span',{class:'muted small'},G.LEVELS[w.m.level]+' · '+w.m.pct+'%'));})));
  cols.appendChild(wk);
  root.appendChild(cols);
  // quick launch
  root.appendChild(h('h3',{class:'sec'},'Practice'));
  root.appendChild(h('div',{class:'tiles'},
    tile('quiz','Quiz drills','Identify the tool and spot the weak premise','#/quiz'),
    tile('cards','Flashcards','Spaced repetition for every concept','#/cards'),
    tile('pen','Timed writing','Randomised prompts, timer, self-review','#/write'),
    tile('wrench','Fix-it','Rewrite flat lines with the right tool','#/fix'),
    tile('flask','Premise Lab','Build a comic premise step by step','#/lab/premise'),
    tile('user','Character Builder','Assemble a comic character','#/lab/character'),
    tile('route','Throughline','Story in ten sentences','#/lab/throughline'),
    tile('book','Journal','Everything you have written','#/journal')));
  function stat(ic,v,l,sub){return h('div',{class:'stat card'},h('div',{class:'si'},G.icon(ic,20)),h('div',{class:'sv'},String(v)),h('div',{class:'sl'},l),h('div',{class:'ss muted small'},sub));}
  function tile(ic,t,s,href){return h('a',{class:'tile card',href:href},h('div',{class:'ti'},G.icon(ic,22)),h('b',{},t),h('span',{class:'muted small'},s));}
};

/* ---------- SKILL MAP ---------- */
V.map=function(root){
  var m=G.masteryAll();
  root.appendChild(head('Skill map','Every tool in the book, by chapter. Rings fill as you learn, quiz, review, write and fix.',h('a',{class:'btn primary',href:'#/workout'},G.icon('bolt',16),'Workout')));
  root.appendChild(h('div',{class:'legend'},G.LEVELS.map(function(l,i){return h('span',{class:'lv lv'+i},l);})));
  CTG.CHAPTERS.forEach(function(c){
    var tools=G.toolsOfChapter(c.id);
    var avg=tools.length?Math.round(tools.reduce(function(a,t){return a+m[t.id].pct;},0)/tools.length):0;
    var sec=h('section',{class:'chapter',style:'--hue:'+c.color},
      h('div',{class:'chhead'},h('div',{},h('span',{class:'chnum'},c.id===0?'Intro':'Ch '+c.id),h('h2',{},c.title),h('p',{class:'muted'},c.blurb)),tools.length?h('div',{class:'chavg'},G.ring(avg,c.color,52,avg+'%')):null));
    if(c.joke){sec.appendChild(h('div',{class:'joketile'},'No tool to practise here. Enjoy the gag in your book.'));}
    var grid=h('div',{class:'grid'});
    tools.forEach(function(t){
      var mm=m[t.id];
      grid.appendChild(h('a',{class:'skill lv'+mm.level,href:'#/tool/'+t.id,'aria-label':t.name+', '+G.LEVELS[mm.level]+', '+mm.pct+' percent'},
        G.ring(mm.pct,c.color,44,''),h('div',{class:'sk'},h('b',{},t.name),h('span',{class:'muted small'},G.LEVELS[mm.level]+(G.S.read[t.id]?'':' · not read')))));
    });
    sec.appendChild(grid); root.appendChild(sec);
  });
};

/* ---------- TOOL PAGE ---------- */
V.tool=function(root,args){
  var id=args[0], tab=args[1]||'learn', t=G.toolMap[id];
  if(!t){root.appendChild(empty('Tool not found.'));return;}
  var ch=G.chMap[t.ch], m=G.mastery(id), idx=CTG.TOOLS.indexOf(t);
  root.style.setProperty('--hue',ch.color);
  root.appendChild(h('a',{class:'back',href:'#/map'},G.icon('back',16),'Skill map'));
  root.appendChild(h('div',{class:'toolhead card'},
    G.ring(m.pct,ch.color,72,m.pct+'%'),
    h('div',{class:'th'},h('div',{class:'eyebrow'},(t.ch===0?'Introduction':'Chapter '+t.ch)+' · '+ch.title),h('h1',{},t.name),h('p',{class:'sub'},t.tag),
      h('div',{class:'row'},G.chip(G.LEVELS[m.level],ch.color,'lvchip'),G.chip(G.S.read[id]?'Lesson read':'Lesson not read',undefined,G.S.read[id]?'ok':'')))));
  var tabs=[['learn','Learn'],['quiz','Quiz'],['cards','Cards'],['write','Write'],['fix','Fix-it'],['journal','Journal']];
  var nav=h('div',{class:'tabs',role:'tablist','aria-label':'Tool sections'},tabs.map(function(x){
    var qn=x[0]==='quiz'?G.byTool(CTG.QUIZ,id).length:(x[0]==='cards'?G.byTool(CTG.CARDS,id).length:(x[0]==='write'?CTG.EXERCISES.filter(function(e){return e.tool===id;}).length:(x[0]==='fix'?G.byTool(CTG.FIX,id).length:(x[0]==='journal'?G.journalOf(id).length:null))));
    return h('a',{role:'tab',class:'tab'+(x[0]===tab?' on':''),'aria-selected':x[0]===tab?'true':'false',href:'#/tool/'+id+'/'+x[0]},x[1],qn!==null?h('span',{class:'cnt'},String(qn)):null);}));
  root.appendChild(nav);
  var body=h('div',{class:'tabbody',role:'tabpanel'}); root.appendChild(body);
  ({learn:learn,quiz:quizTab,cards:cardsTab,write:writeTab,fix:fixTab,journal:journalTab}[tab]||learn)();

  function learn(){
    body.appendChild(h('div',{class:'lesson'},
      h('section',{class:'card'},h('h3',{},'The idea'),h('p',{class:'lead'},t.sum)),
      h('section',{class:'card rules'},h('h3',{},'Key rules'),h('ol',{},t.rules.map(function(r){return h('li',{},r);}))),
      h('div',{class:'cols'},
        h('section',{class:'card'},h('h3',{},'Example'),h('p',{},t.ex)),
        h('section',{class:'card ask'},h('h3',{},'Ask yourself'),h('p',{class:'lead'},t.ask)))));
    var done=!!G.S.read[id];
    var btn=h('button',{type:'button',class:'btn '+(done?'':'primary'),onclick:function(){
      if(!G.S.read[id]){G.S.read[id]=Date.now();G.addActivity({xp:5,items:1,mins:2});G.toast('Lesson marked as read. +5 XP','ok');G.save();}
      G.go('#/tool/'+id+'/quiz');}},done?'Read. Go practise':'Mark as read and start practising',G.icon('arrow',16));
    var prev=CTG.TOOLS[idx-1], next=CTG.TOOLS[idx+1];
    body.appendChild(h('div',{class:'row between'},prev?h('a',{class:'btn ghost',href:'#/tool/'+prev.id},G.icon('back',16),prev.name):h('span'),btn,next?h('a',{class:'btn ghost',href:'#/tool/'+next.id},next.name,G.icon('arrow',16)):h('span')));
    // mastery breakdown
    var P=m.parts, rows=[['Lesson',P.lesson],['Quiz',P.quiz],['Cards',P.cards],['Writing',P.ex],['Fix-it',P.fix]].filter(function(r){return r[1]!==undefined;});
    body.appendChild(h('section',{class:'card'},h('h3',{},'Mastery breakdown'),h('div',{class:'breakdown'},rows.map(function(r){return h('div',{class:'brow'},h('span',{},r[0]),G.bar(r[1]*100,ch.color),h('span',{class:'muted small'},Math.round(r[1]*100)+'%'));})),
      h('p',{class:'muted small'},'Mastery combines recall (quiz and cards), your honest writing self-scores, and fix-it work. Reach 92% for Mastered.')));
  }
  function quizTab(){
    var qs=G.byTool(CTG.QUIZ,id), due=G.dueQuiz(id);
    var runBox=h('div',{class:'runbox'});
    function start(items){G.clear(runBox); G.quizSession(runBox,{items:items,again:function(){G.clear(runBox);}}); runBox.scrollIntoView({behavior:'smooth',block:'start'}); }
    body.appendChild(h('section',{class:'card'},h('h3',{},qs.length+' questions on this tool'),h('p',{class:'muted'},due.length+' due for review.'),
      h('div',{class:'row'},h('button',{type:'button',class:'btn primary',onclick:function(){start(G.shuffle(qs));}},'Start quiz (all)'),
        due.length?h('button',{type:'button',class:'btn',onclick:function(){start(G.shuffle(due));}},'Due only ('+due.length+')'):null,
        h('button',{type:'button',class:'btn',onclick:function(){start(G.pickQuiz(qs,5));}},'Quick 5'))));
    body.appendChild(runBox);
  }
  function cardsTab(){
    var cs=G.byTool(CTG.CARDS,id), due=G.dueCards(id), nw=G.newCards(id);
    var runBox=h('div',{class:'runbox'});
    function start(items){G.clear(runBox); G.cardSession(runBox,{items:items}); runBox.scrollIntoView({behavior:'smooth',block:'start'});}
    body.appendChild(h('section',{class:'card'},h('h3',{},cs.length+' flashcards'),h('p',{class:'muted'},due.length+' due · '+nw.length+' new'),
      h('div',{class:'row'},h('button',{type:'button',class:'btn primary',onclick:function(){var it=due.concat(nw);start(it.length?it:G.shuffle(cs));}},due.length+nw.length?'Study due and new':'Review all anyway'),
        h('button',{type:'button',class:'btn',onclick:function(){start(G.shuffle(cs));}},'Shuffle all'))));
    body.appendChild(runBox);
    body.appendChild(h('details',{class:'card'},h('summary',{},'See all cards'),h('ul',{class:'plain'},cs.map(function(c){return h('li',{},h('b',{},c.f),h('div',{class:'muted'},c.b));}))));
  }
  function writeTab(){
    var exs=CTG.EXERCISES.filter(function(e){return e.tool===id;}); var runBox=h('div',{class:'runbox'});
    var list=h('div',{class:'exlist'},exs.map(function(e){return exCard(e,function(){G.clear(list);list.hidden=true;G.clear(runBox);runBox.appendChild(h('button',{type:'button',class:'btn ghost sm',onclick:function(){G.rerender();}},G.icon('back',14),'All exercises'));G.writeSession(runBox,e);});}));
    body.appendChild(list); body.appendChild(runBox);
  }
  function fixTab(){
    var fs=G.byTool(CTG.FIX,id); if(!fs.length){body.appendChild(empty('No fix-it challenge for this tool yet. Try the Write tab or the Premise Lab.'));return;}
    var runBox=h('div',{class:'runbox'});
    body.appendChild(h('div',{class:'exlist'},fs.map(function(f){return h('div',{class:'card ex'},h('div',{},h('b',{},f.task),h('p',{class:'muted'},'"'+f.flat+'"')),h('button',{type:'button',class:'btn primary',onclick:function(){G.clear(runBox);G.fixSession(runBox,f,{again:function(){G.rerender();}});runBox.scrollIntoView({behavior:'smooth'});}},'Try it'));})));
    body.appendChild(runBox);
  }
  function journalTab(){
    var js=G.journalOf(id); if(!js.length){body.appendChild(empty('Nothing saved for this tool yet. Complete a writing exercise and it appears here.'));return;}
    body.appendChild(h('div',{class:'jlist'},js.map(function(j){return G.journalCard(j,{compact:true});})));
  }
};
function exCard(e,onstart){
  return h('div',{class:'card ex'},h('div',{},h('div',{class:'row'},h('b',{},e.title),e.book?G.chip('From the book',undefined,'ok'):null,G.chip(e.minutes+' min'),G.chip(e.target+' '+(e.mode==='list'?'ideas':(e.mode==='rows'?'fields':'words')))),h('p',{class:'muted'},e.instr)),
    h('button',{type:'button',class:'btn primary',onclick:onstart},G.icon('pen',16),'Start'));
}
G.exCard=exCard;

/* ---------- PRACTICE HUB ---------- */
V.practice=function(root){
  root.appendChild(head('Practice hub','Pick a mode. Recall builds knowledge; writing builds the skill.'));
  var dc=G.dueCards().length, dq=G.dueQuiz().length;
  root.appendChild(h('div',{class:'tiles big'},
    hub('bolt','10-minute workout','Cards, quiz, and a writing sprint in one session','#/workout','primary'),
    hub('quiz','Quiz drills',CTG.QUIZ.length+' questions · '+dq+' due','#/quiz'),
    hub('cards','Flashcards',CTG.CARDS.length+' cards · '+dc+' due','#/cards'),
    hub('pen','Timed writing',CTG.EXERCISES.length+' exercises · '+Object.keys(CTG.PROMPTS).length+' prompt banks','#/write'),
    hub('wrench','Fix-it challenges',CTG.FIX.length+' flat lines to improve','#/fix'),
    hub('flask','Labs','Premise, character, throughline, sitcom, sketch','#/lab'),
    hub('book','Comic vocabulary','Daily 5 to 10 funny things (Wade Boggs)','#/vocab'),
    hub('chart','Progress','Heatmap, mastery, achievements','#/progress')));
  function hub(ic,t,s,href,cls){return h('a',{class:'tile card '+(cls||''),href:href},h('div',{class:'ti'},G.icon(ic,24)),h('b',{},t),h('span',{class:'muted small'},s));}
};

/* ---------- QUIZ PAGE ---------- */
V.quiz=function(root){
  root.appendChild(head('Quiz drills','Four kinds: identify the tool, spot the weak one, concept checks and fix-its. Misses come back sooner.'));
  var runBox=h('div',{class:'runbox'});
  var scope=h('select',{id:'qscope','aria-label':'Scope'},[['smart','Smart mix (due first)'],['chapter','One chapter'],['kind','One question type'],['weak','My weakest tools']].map(function(o){return h('option',{value:o[0]},o[1]);}));
  var sub=h('select',{id:'qsub','aria-label':'Scope detail'});
  var num=h('select',{id:'qnum','aria-label':'Number of questions'},[5,10,15,20].map(function(n){return h('option',{value:n,selected:n===10},n+' questions');}));
  function fillSub(){G.clear(sub); sub.hidden=true;
    if(scope.value==='chapter'){sub.hidden=false; CTG.CHAPTERS.filter(function(c){return !c.joke&&G.toolsOfChapter(c.id).length;}).forEach(function(c){sub.appendChild(h('option',{value:c.id},(c.id?'Ch '+c.id+': ':'Intro: ')+c.title));});}
    if(scope.value==='kind'){sub.hidden=false; Object.keys(G.KINDS).forEach(function(k){sub.appendChild(h('option',{value:k},G.KINDS[k]));});}}
  scope.addEventListener('change',fillSub); fillSub();
  function start(){
    var pool=CTG.QUIZ;
    if(scope.value==='chapter'){var ids=chapterTools(sub.value);pool=pool.filter(function(q){return ids.indexOf(q.tool)>=0;});}
    if(scope.value==='kind') pool=pool.filter(function(q){return q.kind===sub.value;});
    if(scope.value==='weak'){var w=G.weakest(8,false).map(function(x){return x.t.id;}); pool=pool.filter(function(q){return w.indexOf(q.tool)>=0;});}
    var items=G.pickQuiz(pool,+num.value); G.clear(runBox); form.hidden=true;
    G.quizSession(runBox,{items:items,again:function(){form.hidden=false;G.clear(runBox);}});
  }
  var form=h('section',{class:'card form'},h('div',{class:'formrow'},scope,sub,num,h('button',{type:'button',class:'btn primary',onclick:start},'Start quiz')),
    h('p',{class:'muted small'},G.dueQuiz().length+' questions due · '+CTG.QUIZ.length+' in the bank. Keys 1-4 answer; Enter continues.'));
  root.appendChild(form); root.appendChild(runBox);
};

/* ---------- CARDS PAGE ---------- */
V.cards=function(root){
  var dc=G.dueCards(), nw=G.newCards(null,true);
  root.appendChild(head('Flashcards','Spaced repetition (SM-2 style). Rate honestly: Again brings it back this session, Easy pushes it far out.'));
  var runBox=h('div',{class:'runbox'});
  var scope=h('select',{'aria-label':'Deck'},[['due','Due now ('+dc.length+')'],['new','New cards from lessons I have read ('+nw.length+')'],['chapter','One chapter'],['weak','Cards I struggle with'],['all','Anything (shuffle)']].map(function(o){return h('option',{value:o[0]},o[1]);}));
  var sub=h('select',{'aria-label':'Chapter',hidden:true},CTG.CHAPTERS.filter(function(c){return G.toolsOfChapter(c.id).length;}).map(function(c){return h('option',{value:c.id},(c.id?'Ch '+c.id+': ':'Intro: ')+c.title);}));
  scope.addEventListener('change',function(){sub.hidden=scope.value!=='chapter';});
  var num=h('select',{'aria-label':'Number'},[10,20,30,50].map(function(n){return h('option',{value:n},n+' cards');}));
  function start(){
    var items; var n=+num.value;
    if(scope.value==='due') items=dc;
    else if(scope.value==='new') items=G.newCards(null,true);
    else if(scope.value==='chapter'){var ids=chapterTools(sub.value); items=CTG.CARDS.filter(function(c){return ids.indexOf(c.tool)>=0;});}
    else if(scope.value==='weak') items=CTG.CARDS.filter(function(c){var e=G.S.srs['c:'+c.id];return e&&(e.lapses>0||e.ease<2.3);});
    else items=CTG.CARDS;
    if(!items.length){G.toast('No cards in that deck right now. Try another deck.');return;}
    items=scope.value==='all'||scope.value==='chapter'?G.pickCards(items,n):G.shuffle(items).slice(0,n);
    form.hidden=true; G.clear(runBox); G.cardSession(runBox,{items:items,onDone:null});
  }
  var form=h('section',{class:'card form'},h('div',{class:'formrow'},scope,sub,num,h('button',{type:'button',class:'btn primary',onclick:start},'Start')),
    h('p',{class:'muted small'},'Space flips. 1 Again, 2 Hard, 3 Good, 4 Easy. Cards unlock a deck when you read its lesson (new deck) but you can study any chapter.'));
  root.appendChild(form); root.appendChild(runBox);
};

/* ---------- WRITE PAGE ---------- */
V.write=function(root,args){
  if(args[0]){
    var ex=CTG.EXERCISES.filter(function(e){return e.id===args[0];})[0];
    if(!ex){root.appendChild(empty('Exercise not found.'));return;}
    root.appendChild(h('a',{class:'back',href:'#/write'},G.icon('back',16),'All exercises'));
    var box=h('div',{class:'runbox'}); root.appendChild(box); G.writeSession(box,ex); return;
  }
  root.appendChild(head('Timed writing','Quantity first. Set a timer, silence the editor, then review with the rubric.',
    h('button',{type:'button',class:'btn primary',onclick:function(){var w=G.weakest(6,false).map(function(x){return x.t.id;}); var pool=CTG.EXERCISES.filter(function(e){return w.indexOf(e.tool)>=0;}); G.go('#/write/'+G.pick(pool).id);}},G.icon('dice',16),'Surprise me (weak tools)')));
  var q=h('input',{type:'search',placeholder:'Search exercises...','aria-label':'Search exercises'});
  var bookOnly=h('input',{type:'checkbox','aria-label':'Only exercises from the book'});
  var list=h('div',{});
  function render(){
    G.clear(list); var term=q.value.toLowerCase();
    CTG.CHAPTERS.forEach(function(c){
      var exs=CTG.EXERCISES.filter(function(e){var t=G.toolMap[e.tool]; return t.ch===c.id&&(!bookOnly.checked||e.book)&&(!term||(e.title+' '+e.instr+' '+t.name).toLowerCase().indexOf(term)>=0);});
      if(!exs.length)return; var sec=h('section',{class:'chapter',style:'--hue:'+c.color},h('h2',{},(c.id?'Ch '+c.id+': ':'')+c.title));
      sec.appendChild(h('div',{class:'exlist'},exs.map(function(e){return exCard(e,function(){G.go('#/write/'+e.id);});}))); list.appendChild(sec);
    });
    if(!list.firstChild) list.appendChild(empty('No exercise matches.'));
  }
  q.addEventListener('input',render); bookOnly.addEventListener('change',render);
  root.appendChild(h('div',{class:'filters'},q,h('label',{class:'chk'},bookOnly,'Book exercises only'))); root.appendChild(list); render();
};

/* ---------- FIX-IT PAGE ---------- */
V.fix=function(root,args){
  if(args[0]){
    var fx=CTG.FIX.filter(function(f){return f.id===args[0];})[0];
    if(!fx){root.appendChild(empty('Challenge not found.'));return;}
    root.appendChild(h('a',{class:'back',href:'#/fix'},G.icon('back',16),'All challenges'));
    var box=h('div',{class:'runbox'}); root.appendChild(box);
    G.fixSession(box,fx,{again:function(){var pool=CTG.FIX.filter(function(f){return f.id!==fx.id;}); G.go('#/fix/'+G.pick(pool).id);}}); return;
  }
  var done={}; G.S.journal.forEach(function(j){if(j.kind==='fixit'&&j.meta)done[j.meta.fixId]=1;});
  root.appendChild(head('Fix-it challenges','Take a flat line and apply the tool. The rewrite is the point; the model answer is just one option.',
    h('button',{type:'button',class:'btn primary',onclick:function(){var pool=CTG.FIX.filter(function(f){return !done[f.id];}); if(!pool.length)pool=CTG.FIX; G.go('#/fix/'+G.pick(pool).id);}},G.icon('dice',16),'Random challenge')));
  CTG.CHAPTERS.forEach(function(c){
    var fs=CTG.FIX.filter(function(f){return G.toolMap[f.tool].ch===c.id;}); if(!fs.length)return;
    root.appendChild(h('section',{class:'chapter',style:'--hue:'+c.color},h('h2',{},(c.id?'Ch '+c.id+': ':'')+c.title),
      h('div',{class:'exlist'},fs.map(function(f){return h('div',{class:'card ex'},h('div',{},h('div',{class:'row'},h('b',{},f.task),done[f.id]?G.chip('Done',undefined,'ok'):null),h('p',{class:'muted'},'"'+f.flat+'"'),G.toolChip(f.tool)),h('a',{class:'btn primary',href:'#/fix/'+f.id},'Try it'));}))));
  });
};

/* ---------- WORKOUT ---------- */
V.workout=function(root){
  root.appendChild(head('10-minute workout','Learn a little, recall a little, write a little.'));
  var next=G.nextUnread(); var steps=[]; var t0=Date.now(), xp0=G.S.stats.xp;
  var weakStarted=G.weakest(1,true)[0]; var focus=null;
  var lessonTool=(next&&!G.S.read[next.id]&&(Object.keys(G.S.read).length<CTG.TOOLS.length))?next:null;
  if(lessonTool) focus=lessonTool.id; else if(weakStarted) focus=weakStarted.t.id; else focus=CTG.TOOLS[0].id;
  if(lessonTool) steps.push({type:'lesson',tool:lessonTool,label:'Lesson'});
  var dc=G.dueCards(); var cardItems=dc.slice(0,8);
  if(cardItems.length<8){ var need=8-cardItems.length; var nw=G.newCards(null,true); if(!nw.length&&lessonTool) nw=G.newCards(lessonTool.id,false); cardItems=cardItems.concat(G.shuffle(nw).slice(0,Math.min(need,5))); }
  if(!cardItems.length) cardItems=G.shuffle(CTG.CARDS.filter(function(c){return c.tool===focus;})).slice(0,5);
  if(cardItems.length) steps.push({type:'cards',items:cardItems,label:'Cards'});
  var qpool=lessonTool?CTG.QUIZ.filter(function(q){return G.S.read[q.tool]||q.tool===lessonTool.id;}):CTG.QUIZ.filter(function(q){return G.S.read[q.tool];});
  if(qpool.length<5) qpool=CTG.QUIZ;
  steps.push({type:'quiz',items:G.pickQuiz(qpool,5),label:'Quiz'});
  var exs=CTG.EXERCISES.filter(function(e){return e.tool===focus;}); var sp=exs.filter(function(e){return e.sprint;}); var exSel=G.pick(sp.length?sp:exs);
  steps.push({type:'sprint',ex:exSel,label:'Writing sprint'}); steps.push({type:'wrap',label:'Wrap'});
  var bar=h('div',{class:'wsteps'}); var box=h('div',{class:'runbox'}); root.appendChild(bar); root.appendChild(box);
  var idx=0;
  function renderBar(){G.clear(bar); steps.forEach(function(s,i){bar.appendChild(h('div',{class:'ws '+(i<idx?'done':(i===idx?'cur':''))},h('i',{},i<idx?G.icon('check',12):String(i+1)),h('span',{},s.label)));});}
  function run(){
    renderBar(); G.clear(box); var s=steps[idx]; window.scrollTo(0,0);
    var cont=function(){idx++;run();};
    if(s.type==='lesson'){
      var t=s.tool; var hue=G.chMap[t.ch].color;
      box.appendChild(h('section',{class:'card lessoncard',style:'--hue:'+hue},h('div',{class:'eyebrow'},'New tool'),h('h2',{},t.name),h('p',{class:'sub'},t.tag),h('p',{class:'lead'},t.sum),
        h('h3',{},'Key rules'),h('ol',{},t.rules.map(function(r){return h('li',{},r);})),h('p',{},h('b',{},'Ask yourself: '),t.ask),
        h('div',{class:'row'},h('button',{type:'button',class:'btn primary',onclick:function(){if(!G.S.read[t.id]){G.S.read[t.id]=Date.now();G.addActivity({xp:5,items:1,mins:2});G.save();} cont();}},'Got it. Continue',G.icon('arrow',16)),
          h('a',{class:'btn ghost',href:'#/tool/'+t.id},'Open full lesson (leaves workout)'))));
    } else if(s.type==='cards'){
      box.appendChild(h('div',{class:'stephead'},h('h2',{},'Flashcards'),h('p',{class:'muted'},'Recall first, then flip.')));
      var b2=h('div',{}); box.appendChild(b2); G.cardSession(b2,{items:s.items,onDone:function(){cont();}});
    } else if(s.type==='quiz'){
      box.appendChild(h('div',{class:'stephead'},h('h2',{},'Quick quiz'),h('p',{class:'muted'},'Five questions. Keys 1-4.')));
      var b3=h('div',{}); box.appendChild(b3); G.quizSession(b3,{items:s.items,onDone:function(r){s.res=r;cont();}});
    } else if(s.type==='sprint'){
      box.appendChild(h('div',{class:'stephead'},h('h2',{},'5-minute writing sprint'),h('p',{class:'muted'},'This is the part that builds the skill. Quantity first.')));
      var b4=h('div',{}); box.appendChild(b4); G.writeSession(b4,s.ex,{minutes:5,sprint:true,onDone:function(r){s.res=r;cont();}});
    } else {
      var key=G.today(); var first=!G.S.workouts[key]; G.S.workouts[key]=(G.S.workouts[key]||0)+1; if(first)G.S.stats.workouts++; G.addActivity({xp:first?20:5,items:1,mins:0}); G.save();
      var gained=G.S.stats.xp-xp0, mins=Math.round((Date.now()-t0)/60000);
      var qs=steps.filter(function(x){return x.type==='quiz';})[0], sp2=steps.filter(function(x){return x.type==='sprint';})[0];
      box.appendChild(h('section',{class:'panel center results'},h('div',{class:'eyebrow'},'Workout complete'),h('h2',{},'Nice work. That is a rep.'),
        h('div',{class:'stats3'},h('div',{},h('b',{},mins+' min'),h('span',{},'time')),h('div',{},h('b',{},'+'+gained),h('span',{},'XP')),h('div',{},h('b',{},G.streak()+' d'),h('span',{},'streak'))),
        qs&&qs.res?h('p',{},'Quiz: '+qs.res.right+' of '+qs.res.total+' correct.'):null,
        sp2&&sp2.res?h('p',{},'Sprint: '+sp2.res.count+' items, self-score '+sp2.res.score+'.'):null,
        h('div',{class:'row center'},h('a',{class:'btn primary',href:'#/'},'Dashboard'),h('button',{type:'button',class:'btn',onclick:function(){G.rerender();}},'Another workout'),h('a',{class:'btn',href:'#/journal'},'Journal'))));
      G.announce('Workout complete.'); renderBar();
    }
  }
  run();
};

/* ---------- PROGRESS ---------- */
V.progress=function(root){
  var m=G.masteryAll(), S=G.S, lv=G.level();
  root.appendChild(head('Progress','Mastery is earned in five ways: lesson, quiz, cards, writing and fix-it.'));
  root.appendChild(h('section',{class:'stats'},
    pstat('Overall mastery',G.overall()+'%'),pstat('Level',lv.level+' ('+S.stats.xp+' XP)'),pstat('Streak',G.streak()+' / best '+G.bestStreak()),
    pstat('Quiz accuracy',S.stats.quizN?Math.round(100*S.stats.quizOk/S.stats.quizN)+'% of '+S.stats.quizN:'-'),pstat('Cards reviewed',S.stats.cards),
    pstat('Exercises',S.stats.ex),pstat('Words written',S.stats.words),pstat('Minutes practised',Math.round(S.stats.mins))));
  // heatmap
  var cells=h('div',{class:'heat','aria-label':'Practice calendar for the last 16 weeks',role:'img'}); var d=new Date(); d.setDate(d.getDate()-(16*7-1)-d.getDay()+d.getDay()); 
  var start=new Date(); start.setDate(start.getDate()-111-start.getDay());
  for(var i=0;i<16*7;i++){var k=G.dateKey(start),a=S.activity[k]; var lvl=!a||!a.items?0:(a.mins<5?1:(a.mins<10?2:(a.mins<20?3:4))); if(a&&a.items&&lvl===0)lvl=1; if(start<=new Date())cells.appendChild(h('i',{class:'hl hl'+lvl,title:k+(a?': '+a.mins+' min, '+a.items+' items':'')})); else cells.appendChild(h('i',{class:'hl hx'})); start.setDate(start.getDate()+1);}
  root.appendChild(h('section',{class:'card'},h('h3',{},'Practice calendar'),cells,h('p',{class:'muted small'},'Each square is a day. Darker means more minutes.')));
  // chapters
  var chs=h('section',{class:'card'},h('h3',{},'Mastery by chapter'));
  CTG.CHAPTERS.forEach(function(c){var tl=G.toolsOfChapter(c.id); if(!tl.length)return; var avg=Math.round(tl.reduce(function(a,t){return a+m[t.id].pct;},0)/tl.length);
    chs.appendChild(h('div',{class:'brow'},h('a',{href:'#/map'},(c.id?'Ch '+c.id+' ':'Intro ')+c.title),G.bar(avg,c.color),h('span',{class:'muted small'},avg+'%')));});
  root.appendChild(chs);
  // weakest + strongest
  var all=CTG.TOOLS.map(function(t){return {t:t,m:m[t.id]};}).sort(function(a,b){return a.m.pct-b.m.pct;});
  var lvc=[0,0,0,0,0,0]; all.forEach(function(x){lvc[x.m.level]++;});
  root.appendChild(h('section',{class:'card'},h('h3',{},'Tools by level'),h('div',{class:'legend'},G.LEVELS.map(function(l,i){return h('span',{class:'lv lv'+i},l+': '+lvc[i]);}))));
  var acc={}; S.quizLog.forEach(function(q){var a=acc[q.tool]||(acc[q.tool]={n:0,ok:0}); a.n++; if(q.ok)a.ok++;});
  var shaky=Object.keys(acc).filter(function(k){return acc[k].n>=3;}).sort(function(a,b){return acc[a].ok/acc[a].n-acc[b].ok/acc[b].n;}).slice(0,5);
  root.appendChild(h('div',{class:'cols'},
    h('section',{class:'card'},h('h3',{},'Lowest mastery'),h('ul',{class:'tlist'},all.slice(0,6).map(function(x){return h('li',{},h('a',{href:'#/tool/'+x.t.id},x.t.name),h('span',{class:'muted small'},x.m.pct+'%'));}))),
    h('section',{class:'card'},h('h3',{},'Shakiest quiz topics'),shaky.length?h('ul',{class:'tlist'},shaky.map(function(k){return h('li',{},h('a',{href:'#/tool/'+k+'/quiz'},G.toolMap[k].name),h('span',{class:'muted small'},Math.round(100*acc[k].ok/acc[k].n)+'% of '+acc[k].n));})):h('p',{class:'muted'},'Answer a few quiz questions to see this.'))));
  root.appendChild(h('section',{class:'card'},h('h3',{},'Achievements'),h('div',{class:'ach'},G.ACH.map(function(a){var got=S.ach[a.id]; return h('div',{class:'achi '+(got?'got':'')},G.icon(got?'star':'lock',18),h('div',{},h('b',{},a.name),h('span',{class:'muted small'},a.desc)));}))));
  function pstat(l,v){return h('div',{class:'stat card'},h('div',{class:'sv'},String(v)),h('div',{class:'sl'},l));}
};
})();
