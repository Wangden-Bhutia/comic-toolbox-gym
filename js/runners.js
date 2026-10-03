/* Comic Toolbox Gym - practice runners: quiz, cards, writing, fix-it */
(function(){
var G=window.G, h=G.h, CTG=window.CTG;
G.onLeave = function(fn){G.cleanups.push(fn);};
G.runCleanups = function(){var c=G.cleanups.splice(0);c.forEach(function(f){try{f();}catch(e){}});};

/* small UI parts */
G.chip = function(text,hue,cls){var c=h('span',{class:'chip '+(cls||'')},text); if(hue!==undefined) c.style.setProperty('--hue',hue); return c;};
G.toolChip = function(toolId){var t=G.toolMap[toolId]; if(!t) return null; return h('a',{class:'chip toolchip',href:'#/tool/'+toolId,style:'--hue:'+G.hue(toolId)},t.name);};
G.bar = function(pct,hue){var b=h('div',{class:'bar',role:'progressbar','aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':Math.round(pct)},h('i',{style:'width:'+G.clamp(pct,0,100)+'%'})); if(hue!==undefined)b.style.setProperty('--hue',hue); return b;};
G.ring = function(pct,hue,size,label){
  var ns='http://www.w3.org/2000/svg',r=18,c=2*Math.PI*r; var s=document.createElementNS(ns,'svg');
  s.setAttribute('viewBox','0 0 44 44'); s.setAttribute('width',size||44); s.setAttribute('height',size||44); s.setAttribute('class','ring'); s.setAttribute('aria-hidden','true'); s.style.setProperty('--hue',hue);
  var a=document.createElementNS(ns,'circle'); a.setAttribute('cx',22);a.setAttribute('cy',22);a.setAttribute('r',r);a.setAttribute('class','ring-bg'); s.appendChild(a);
  var b=document.createElementNS(ns,'circle'); b.setAttribute('cx',22);b.setAttribute('cy',22);b.setAttribute('r',r);b.setAttribute('class','ring-fg');
  b.setAttribute('stroke-dasharray',c); b.setAttribute('stroke-dashoffset',c*(1-G.clamp(pct,0,100)/100)); b.setAttribute('transform','rotate(-90 22 22)'); s.appendChild(b);
  var t=document.createElementNS(ns,'text'); t.setAttribute('x',22);t.setAttribute('y',26);t.setAttribute('text-anchor','middle');t.setAttribute('class','ring-t'); t.textContent=label!==undefined?label:Math.round(pct); s.appendChild(t);
  return s;
};
// three-state rater: returns {el,get,set}
G.rater = function(label,onchange,value){
  var val=value===undefined?-1:value, btns=[]; var names=['No','Partly','Yes'];
  var el=h('div',{class:'rater',role:'radiogroup','aria-label':label});
  names.forEach(function(n,i){
    var b=h('button',{type:'button',class:'seg',role:'radio','aria-checked':'false',onclick:function(){set(i);}},n); btns.push(b); el.appendChild(b);
  });
  function set(v){val=v;btns.forEach(function(b,i){var on=i===v;b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false');}); if(onchange)onchange(v);}
  if(val>=0)set(val);
  return {el:el,get:function(){return val;},set:set};
};
G.stepper = function(items,idx){ // simple progress dots
  return h('div',{class:'dots','aria-hidden':'true'},items.map(function(_,i){return h('i',{class:i<idx?'done':(i===idx?'cur':'')});}));
};

/* ================= QUIZ ================= */
var KINDS={id:'Identify the tool',spot:'Spot the weak one',concept:'Concept check',fix:'Fix it'};
G.KINDS=KINDS;
G.quizSession = function(box,opts){
  var items=opts.items.slice(), total=items.length, idx=0, right=0, missed=[], answered=false, queue=items.slice(), requeued={}, firstSeen={}, startT=Date.now(), cur=null, choices=[];
  function keyh(e){
    if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    if(!answered && /^[1-4]$/.test(e.key)){var b=choices[+e.key-1]; if(b){e.preventDefault(); b.click();}}
    else if(answered && (e.key==='Enter'||e.key==='ArrowRight')){var nb=G.$('#quiz-next',box); if(nb){e.preventDefault(); nb.click();}}
  }
  document.addEventListener('keydown',keyh); var destroy=function(){document.removeEventListener('keydown',keyh);}; G.onLeave(destroy);
  function show(){
    G.clear(box);
    if(!queue.length) return finish();
    cur=queue.shift(); answered=false;
    var order=G.shuffle(cur.c.map(function(t,i){return {t:t,ok:i===0};})); choices=[];
    var tool=G.toolMap[cur.tool];
    var fb=h('div',{class:'feedback',id:'quiz-fb','aria-live':'polite'});
    var list=h('div',{class:'choices',role:'group','aria-label':'Answer choices'});
    order.forEach(function(o,i){
      var b=h('button',{type:'button',class:'choice',onclick:function(){answer(o,b);}},h('span',{class:'k'},String(i+1)),h('span',{class:'t'},o.t)); b.dataset.ok=o.ok?'1':'0'; choices.push(b); list.appendChild(b);
    });
    box.appendChild(h('div',{class:'qwrap'},
      h('div',{class:'qhead'},h('span',{class:'muted'},firstSeen[cur.id]?'Retry (missed earlier)':('Question '+(Math.min(idx+1,total))+' of '+total)),G.chip(KINDS[cur.kind]||'Question',G.hue(cur.tool),'kind')),
      G.bar(100*idx/total,G.hue(cur.tool)),
      h('h2',{class:'qtext'},cur.q),
      list, fb));
    var first=choices[0]; if(first&&opts.focus!==false) first.focus({preventScroll:true});
    function answer(o,btn){
      if(answered) return; answered=true; var ok=o.ok;
      choices.forEach(function(c){c.disabled=true; if(c.dataset.ok==='1')c.classList.add('right');}); if(!ok)btn.classList.add('wrong');
      G.S.quizLog.push({id:cur.id,tool:cur.tool,ok:ok,t:Date.now()}); if(G.S.quizLog.length>500)G.S.quizLog.shift();
      G.S.stats.quizN++; if(ok)G.S.stats.quizOk++;
      if(opts.srs!==false) G.srsReview('q:'+cur.id,ok?2:0);
      var first=!firstSeen[cur.id]; if(first){firstSeen[cur.id]=1; idx++; if(ok)right++; else {missed.push(cur); queue.splice(Math.min(queue.length,3),0,cur);}}
      G.addActivity({xp:ok?2:0,items:1,mins:0.3});
      G.announce(ok?'Correct. '+cur.why:'Not quite. '+cur.why);
      G.clear(fb);
      fb.appendChild(h('div',{class:'fb '+(ok?'good':'bad')},h('strong',{},ok?'Correct. ':'Not quite. '),'The right answer is: ',h('em',{},cur.c[0]),'. ',cur.why));
      fb.appendChild(h('div',{class:'row'},tool?h('a',{class:'btn ghost sm',href:'#/tool/'+tool.id},'Review: '+tool.name):null,
        h('button',{type:'button',class:'btn primary',id:'quiz-next',onclick:function(){show();}},queue.length?'Next':'See results',h('span',{class:'kbd'},'Enter'))));
      var nb=G.$('#quiz-next',box); if(nb)nb.focus({preventScroll:true});
    }
  }
  function finish(){
    destroy();
    var mins=(Date.now()-startT)/60000;
    var pct=Math.round(100*right/total);
    var res={total:total,right:right,missed:missed,pct:pct};
    G.addActivity({xp:Math.round(pct/10),mins:0});
    if(opts.onDone){return opts.onDone(res);}
    G.clear(box);
    var uniq=[],seen={}; missed.forEach(function(m){if(!seen[m.id]){seen[m.id]=1;uniq.push(m);}});
    box.appendChild(h('div',{class:'panel center results'},
      h('h2',{},pct>=80?'Strong round.':(pct>=50?'Solid work. Review the misses.':'Good practice. Those misses will come back.')),
      h('div',{class:'bigstat'},right+' / '+total),h('p',{class:'muted'},pct+'% correct on the first reveal.'),
      uniq.length?h('div',{class:'missed'},h('h3',{},'To review'),h('ul',{},uniq.map(function(m){return h('li',{},h('strong',{},m.q),' ',h('span',{class:'muted'},m.why),' ',G.toolChip(m.tool));}))):h('p',{},'No misses. Nice.'),
      h('div',{class:'row center'},h('button',{class:'btn primary',type:'button',onclick:function(){if(opts.again)opts.again();}},'Another round'),h('a',{class:'btn',href:'#/practice'},'Practice hub'))));
    G.announce('Quiz finished. '+right+' of '+total+' correct.');
  }
  show();
  return {destroy:destroy};
};

/* ================= FLASHCARDS ================= */
G.cardSession = function(box,opts){
  var queue=opts.items.slice(), total=queue.length, done=0, flipped=false, cur=null, ratings=[0,0,0,0], startT=Date.now();
  function keyh(e){
    if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    if(e.key===' '||e.key==='Enter'){ if(!flipped){e.preventDefault();flip();} }
    else if(flipped&&/^[1-4]$/.test(e.key)){e.preventDefault();rate(+e.key-1);}
  }
  document.addEventListener('keydown',keyh); var destroy=function(){document.removeEventListener('keydown',keyh);}; G.onLeave(destroy);
  function flip(){ if(flipped||!cur) return; flipped=true; render(); }
  function rate(g){
    if(!flipped||!cur) return; var key='c:'+cur.id; G.srsReview(key,g); ratings[g]++; G.S.stats.cards++;
    G.addActivity({xp:g>0?1:0,items:1,mins:0.2});
    if(g===0){queue.splice(Math.min(queue.length,4),0,cur);} else done++;
    flipped=false; render();
  }
  function render(){
    G.clear(box);
    if(!cur||!flipped){ if(!flipped) cur=queue.shift(); }
    if(!cur) return finish();
    var tool=G.toolMap[cur.tool];
    var card=h('div',{class:'flip '+(flipped?'on':''),tabindex:0,role:'button','aria-label':flipped?'Card answer shown':'Show answer',onclick:function(){if(!flipped)flip();}},
      h('div',{class:'face front'},h('div',{class:'lab'},tool?tool.name:''),h('div',{class:'ftext'},cur.f)),
      flipped?h('div',{class:'face ans'},h('div',{class:'lab'},'Answer'),h('div',{class:'ftext'},cur.b)):null);
    box.appendChild(h('div',{class:'qwrap'},
      h('div',{class:'qhead'},h('span',{class:'muted'},done+' of '+total+' done'),G.chip(G.S.srs['c:'+cur.id]?'Review':'New',G.hue(cur.tool),'kind')),
      G.bar(100*done/total,G.hue(cur.tool)), card,
      flipped?h('div',{class:'rates','aria-label':'How well did you recall it?'},
        [['Again','No idea',0],['Hard','Slow',1],['Good','Got it',2],['Easy','Instant',3]].map(function(r){
          return h('button',{type:'button',class:'btn rate r'+r[2],onclick:function(){rate(r[2]);}},h('b',{},r[0]),h('small',{},G.srsPreview('c:'+cur.id,r[2])),h('span',{class:'kbd'},String(r[2]+1)));}))
        :h('div',{class:'row center'},h('button',{type:'button',class:'btn primary lg',onclick:flip},'Show answer',h('span',{class:'kbd'},'Space'))),
      h('p',{class:'swipehint muted small'},flipped?'Swipe right = Good, left = Again':'Tap the card or swipe to flip')));
    var nf=G.$('.flip',box); if(nf&&!flipped)nf.focus({preventScroll:true});
    swipe(G.$('.flip',box));
    G.announce(flipped?'Answer: '+cur.b:'Card: '+cur.f);
  }
  // swipe (touch): unflipped -> swipe flips; flipped -> right = Good, left = Again
  function swipe(el){
    if(!el) return; var sx=0,sy=0,dx=0,dy=0,on=false;
    el.addEventListener('touchstart',function(e){var t=e.touches[0];on=true;sx=t.clientX;sy=t.clientY;dx=dy=0;el.style.transition='none';},{passive:true});
    el.addEventListener('touchmove',function(e){if(!on)return;var t=e.touches[0];dx=t.clientX-sx;dy=t.clientY-sy;if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){el.style.transform='translateX('+dx+'px) rotate('+dx/30+'deg)';}},{passive:true});
    function end(){ if(!on)return; on=false; el.style.transition='transform .2s'; el.style.transform='';
      if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)){ if(!flipped)flip(); else rate(dx>0?2:0); } }
    el.addEventListener('touchend',end); el.addEventListener('touchcancel',function(){on=false;el.style.transform='';});
  }
  function finish(){
    destroy(); var res={total:total,ratings:ratings}; if(opts.onDone)return opts.onDone(res);
    G.clear(box);
    box.appendChild(h('div',{class:'panel center results'},h('h2',{},'Deck done.'),h('div',{class:'bigstat'},total+' cards'),
      h('p',{class:'muted'},'Again '+ratings[0]+' | Hard '+ratings[1]+' | Good '+ratings[2]+' | Easy '+ratings[3]),
      h('div',{class:'row center'},h('a',{class:'btn primary',href:'#/cards'},'More cards'),h('a',{class:'btn',href:'#/practice'},'Practice hub'))));
  }
  if(!queue.length) finish(); else render();
  return {destroy:destroy};
};

/* ================= WRITING ================= */
var PROCESS=['I finished the task (or hit the target) within the time.','I kept my inner editor quiet while generating, and judged only afterwards.','I can name something in this piece that I like.'];
G.writeSession = function(box,ex,opts){
  opts=opts||{}; var tool=G.toolMap[ex.tool];
  var draft=G.S.drafts[ex.id]; var restored=false;
  var pr=(draft&&Date.now()-draft.ts<12*36e5)?{text:draft.prompt,vals:[]}:G.fillTpl(ex); if(draft&&Date.now()-draft.ts<12*36e5)restored=true;
  var mins=opts.minutes||ex.minutes, total=mins*60, started=false, t0=0, elapsed=0, tick=null, ended=false, fields=[], ta=null;
  var noedit=ex.noedit||G.S.settings.noedit;
  var promptEl=h('div',{class:'prompt',id:'wprompt'},pr.text||'Free choice: pick any topic you like.');
  var timerEl=h('div',{class:'timer',role:'timer','aria-live':'off'},G.fmtTime(total));
  var tbar=G.bar(0,G.hue(ex.tool)); var countEl=h('div',{class:'count','aria-live':'polite'}); var banner=h('div',{class:'banner',hidden:true});
  var startBtn=h('button',{type:'button',class:'btn primary',onclick:function(){start();}},G.icon('clock',16),'Start timer');
  var finBtn=h('button',{type:'button',class:'btn accent',onclick:function(){review();}},'Finish and review');
  function vals(){
    if(ex.mode==='rows'){var o={};ex.fields.forEach(function(f,i){o[f.k]=fields[i].value;});return o;}
    return ta.value;
  }
  function textOf(){
    if(ex.mode==='rows'){return ex.fields.map(function(f,i){return fields[i].value.trim()?f.label+': '+fields[i].value.trim():'';}).filter(Boolean).join('\n');}
    return ta.value.trim();
  }
  function counts(){
    if(ex.mode==='list') return G.lineCount(ta.value);
    if(ex.mode==='rows') return fields.filter(function(f){return f.value.trim();}).length;
    return G.wordCount(ta.value);
  }
  function words(){return G.wordCount(textOf());}
  function unit(){return ex.mode==='list'?'ideas':(ex.mode==='rows'?'fields':'words');}
  function upd(){var c=counts(); G.clear(countEl); countEl.appendChild(h('span',{},h('b',{},String(c)),' / '+ex.target+' '+unit()+' | '+words()+' words')); finBtn.disabled=(c===0);
    G.clear(countEl); countEl.appendChild(h('span',{},h('b',{},String(c)),' / '+ex.target+' '+unit()+'  ·  '+words()+' words'));}
  var saveDT=null;
  function onInput(){
    if(!started&&!ended) start(); upd();
    clearTimeout(saveDT); saveDT=setTimeout(function(){G.S.drafts[ex.id]={vals:vals(),prompt:pr.text,ts:Date.now()};G.save();},400);
  }
  function guard(el){
    el.addEventListener('keydown',function(e){ if(noedit&&(e.key==='Backspace'||e.key==='Delete'||((e.ctrlKey||e.metaKey)&&/^[zxy]$/i.test(e.key)))) e.preventDefault(); });
    el.addEventListener('beforeinput',function(e){ if(noedit&&e.inputType&&/^delete|historyUndo|historyRedo/.test(e.inputType)) e.preventDefault(); });
    el.addEventListener('cut',function(e){if(noedit)e.preventDefault();});
  }
  function mk(rows,ph,label){var t=h('textarea',{rows:rows,placeholder:ph||'',spellcheck:'true','aria-label':label,oninput:onInput}); guard(t); return t;}
  var editor;
  if(ex.mode==='rows'){
    editor=h('div',{class:'rows-editor'}, ex.fields.map(function(f,i){var t=mk(2,f.ph,f.label); fields[i]=t; return h('label',{class:'field'},h('span',{},f.label),t);}));
  } else {
    ta=mk(ex.mode==='list'?14:12, ex.mode==='list'?'One idea per line. Keep going. Do not judge yet.':'Write here. Keep your hands moving.', ex.title); editor=ta;
  }
  if(draft&&restored){ if(ex.mode==='rows'){ex.fields.forEach(function(f,i){fields[i].value=(draft.vals&&draft.vals[f.k])||'';});} else ta.value=draft.vals||''; }
  function start(){
    if(started) return; started=true; t0=Date.now(); startBtn.disabled=true; startBtn.textContent='Timer running';
    tick=setInterval(function(){
      elapsed=(Date.now()-t0)/1000; var rem=total-elapsed;
      timerEl.textContent=rem>=0?G.fmtTime(rem):'+'+G.fmtTime(-rem); timerEl.classList.toggle('low',rem<=30&&rem>0); timerEl.classList.toggle('over',rem<=0);
      G.clear(tbar); tbar.appendChild(h('i',{style:'width:'+G.clamp(100*elapsed/total,0,100)+'%'}));
      if(rem<=0&&!ended){ended=true;banner.hidden=false;banner.textContent='Time! Finish your thought, then press Finish and review.';G.beep();G.announce('Time is up.');}
    },250);
    G.announce('Timer started.');
  }
  G.onLeave(function(){clearInterval(tick);});
  function newPrompt(){
    if(started&&counts()>0&&!confirm('New prompt? Your current text stays, but the prompt changes.')) return;
    pr=G.fillTpl(ex); promptEl.textContent=pr.text; G.announce('New prompt: '+pr.text);
  }
  var ctrl=h('div',{class:'wctrl'},
    ex.bank?h('button',{type:'button',class:'btn',onclick:newPrompt},G.icon('dice',16),'New prompt'):null,
    h('label',{class:'sel'},'Minutes ',h('select',{disabled:false,'aria-label':'Minutes',onchange:function(){if(started)return;total=+this.value*60;timerEl.textContent=G.fmtTime(total);mins=+this.value;}},
      [3,5,8,10,15,20].concat(ex.minutes&&[3,5,8,10,15,20].indexOf(ex.minutes)<0?[ex.minutes]:[]).sort(function(a,b){return a-b;}).map(function(m){return h('option',{value:m,selected:m===mins},m+' min');}))),
    h('label',{class:'chk'},h('input',{type:'checkbox',checked:noedit,onchange:function(){noedit=this.checked;G.toast(noedit?'No-edit mode on: backspace and delete are blocked.':'No-edit mode off.');}}),'No-edit mode'),
    startBtn);
  box.appendChild(h('div',{class:'write'},
    h('div',{class:'wtop'},h('div',{class:'whead'},h('div',{class:'wtitle'},h('div',{class:'muted small'},(tool?tool.name:'')+(ex.book?'  ·  from the book':'')),h('h2',{},ex.title)),timerEl),tbar,countEl),
    h('p',{class:'instr'},ex.instr),
    pr.text||ex.bank?h('div',{class:'promptbox'},h('span',{class:'lab'},'Prompt'),promptEl):null,
    restored?h('div',{class:'note'},'Restored your unsaved draft. ',h('button',{type:'button',class:'link',onclick:function(){delete G.S.drafts[ex.id];G.save();location.reload();}},'Discard')):null,
    ctrl, editor, banner,
    h('div',{class:'wfoot'},finBtn)));
  upd();
  setTimeout(function(){var f=ex.mode==='rows'?fields[0]:ta; if(f&&opts.focus!==false)f.focus({preventScroll:true});},30);

  /* ---- review stage ---- */
  function review(){
    clearInterval(tick); if(started) elapsed=(Date.now()-t0)/1000;
    var content=textOf(), c=counts(), w=words(), fv=ex.mode==='rows'?vals():null;
    var rub=(tool&&tool.rub||[]).map(function(t){return {t:t,tool:true};}).concat(PROCESS.map(function(t){return {t:t};}));
    var raters=rub.map(function(r,i){return G.rater(r.t,calc);});
    var scoreEl=h('div',{class:'score'}); var win=h('textarea',{rows:2,placeholder:'e.g. I like the line about ...',oninput:function(){}, 'aria-label':'One small win'});
    function calc(){var s=0,n=0; raters.forEach(function(r){if(r.get()>=0){s+=r.get();n++;}}); var sc=n?Math.round(100*s/(2*raters.length)):0; scoreEl.textContent='Self-score: '+sc+(n<raters.length?'  ('+(raters.length-n)+' unrated)':''); return sc;}
    G.clear(box);
    box.appendChild(h('div',{class:'write review'},
      h('div',{class:'whead'},h('div',{},h('div',{class:'muted small'},'Self-review'),h('h2',{},ex.title))),
      h('div',{class:'stats3'},h('div',{},h('b',{},String(c)),h('span',{},unit()+' (target '+ex.target+')')),h('div',{},h('b',{},String(w)),h('span',{},'words')),h('div',{},h('b',{},G.fmtTime(elapsed)),h('span',{},'time used'))),
      pr.text?h('div',{class:'promptbox'},h('span',{class:'lab'},'Prompt'),h('div',{class:'prompt'},pr.text)):null,
      h('pre',{class:'written'},content||'(nothing written)'),
      h('h3',{},'Rate yourself honestly'),
      h('p',{class:'muted small'},'Be fair, not harsh. A "Partly" is a good answer. This is your own private rubric from the tool.'),
      h('ol',{class:'rubric'},rub.map(function(r,i){return h('li',{},h('div',{class:'rt'},r.t,r.tool?null:h('span',{class:'tag'},'process')),raters[i].el);})),
      scoreEl,
      h('label',{class:'field'},h('span',{},'Take the win: one thing you did well'),win),
      h('div',{class:'row'},
        h('button',{type:'button',class:'btn',onclick:function(){box.innerHTML='';G.writeSession(box,ex,opts);}},'Back to editing'),
        h('button',{type:'button',class:'btn primary',id:'save-ex',onclick:save},G.icon('check',16),'Save to journal'))));
    calc();
    function save(){
      var sc=calc(); var btn=G.$('#save-ex',box); btn.disabled=true;
      var entry=G.addJournal({kind:'exercise',tool:ex.tool,exId:ex.id,title:ex.title,prompt:pr.text,content:content,fields:fv,
        meta:{secs:Math.round(elapsed),count:c,target:ex.target,unit:unit(),words:w,selfScore:sc,checks:raters.map(function(r){return r.get();}),win:win.value.trim(),sprint:!!opts.sprint}});
      var before=G.S.stats.ex; G.S.stats.ex++; G.S.stats.words+=w; delete G.S.drafts[ex.id];
      var xp=10+Math.min(c,20)+Math.round(sc/10);
      G.addActivity({mins:Math.max(1,elapsed/60),xp:xp,items:1});
      if(opts.onDone) return opts.onDone({entry:entry,score:sc,count:c,xp:xp});
      var m=G.mastery(ex.tool);
      G.clear(box);
      box.appendChild(h('div',{class:'panel center results'},
        h('h2',{},'Saved to your journal.'),h('div',{class:'bigstat'},sc+'/100'),
        h('p',{class:'muted'},c+' '+unit()+' · '+w+' words · +'+xp+' XP'),
        tool?h('p',{},G.toolChip(ex.tool),' is now at ',h('strong',{},G.LEVELS[m.level]),' ('+m.pct+'%)'):null,
        win.value.trim()?h('p',{class:'win'},'Your win: ',h('em',{},win.value.trim())):h('p',{class:'muted'},'Tip: name a win next time. Small victories build momentum.'),
        h('div',{class:'row center'},
          h('button',{type:'button',class:'btn primary',onclick:function(){G.clear(box);G.writeSession(box,ex,opts);}},'Another prompt'),
          h('a',{class:'btn',href:'#/journal'},'Open journal'),
          h('a',{class:'btn',href:tool?'#/tool/'+tool.id:'#/practice'},tool?'Back to tool':'Practice hub'))));
      G.announce('Saved. Self-score '+sc);
      window.scrollTo(0,0);
    }
    window.scrollTo(0,0);
  }
};

/* ================= FIX-IT ================= */
G.fixSession = function(box,fx,opts){
  opts=opts||{}; var tool=G.toolMap[fx.tool]; var revealed=false;
  var ta=h('textarea',{rows:5,placeholder:'Write your improved version here...','aria-label':'Your rewrite',oninput:function(){rb.disabled=!ta.value.trim();}});
  var hint=h('div',{class:'note',hidden:true},fx.hint);
  var model=h('div',{class:'modelbox',hidden:true},h('span',{class:'lab'},'One possible answer (yours may be better)'),h('p',{},fx.model));
  var rbox=h('div',{class:'review-inline',hidden:true});
  var rb=h('button',{type:'button',class:'btn accent',disabled:true,onclick:reveal},'Compare with a model and self-check');
  function reveal(){
    if(revealed)return; revealed=true; model.hidden=false; rb.hidden=true;
    var checks=fx.checks.concat(['My version is clearer or funnier than the flat original.']);
    var raters=checks.map(function(c){return G.rater(c,calc);}); var sc=h('div',{class:'score'});
    function calc(){var s=0,n=0;raters.forEach(function(r){if(r.get()>=0){s+=r.get();n++;}});var v=n?Math.round(100*s/(2*raters.length)):0;sc.textContent='Self-score: '+v;return v;}
    var save=h('button',{type:'button',class:'btn primary',onclick:function(){
      var v=calc(); save.disabled=true;
      G.addJournal({kind:'fixit',tool:fx.tool,title:'Fix-it: '+(tool?tool.name:''),prompt:fx.flat,content:ta.value.trim(),meta:{fixId:fx.id,selfScore:v,checks:raters.map(function(r){return r.get();}),model:fx.model}});
      G.S.stats.fix++; G.S.stats.words+=G.wordCount(ta.value); var xp=8+Math.round(v/10); G.addActivity({mins:2,xp:xp,items:1});
      if(opts.onDone) return opts.onDone({score:v,xp:xp});
      G.clear(rbox); rbox.appendChild(h('div',{class:'panel center'},h('h3',{},'Saved. +'+xp+' XP'),h('div',{class:'row center'},h('button',{type:'button',class:'btn primary',onclick:function(){if(opts.again)opts.again();}},'Another challenge'),h('a',{class:'btn',href:'#/journal'},'Journal'))));
    }},G.icon('check',16),'Save to journal');
    G.clear(rbox); rbox.hidden=false;
    rbox.appendChild(h('h3',{},'Self-check your rewrite')); rbox.appendChild(h('ol',{class:'rubric'},checks.map(function(c,i){return h('li',{},h('div',{class:'rt'},c),raters[i].el);})));
    rbox.appendChild(sc); rbox.appendChild(save); calc();
  }
  box.appendChild(h('div',{class:'write'},
    h('div',{class:'whead'},h('div',{},h('div',{class:'muted small'},'Fix-it challenge'+(tool?'  ·  '+tool.name:'')),h('h2',{},fx.task))),
    h('div',{class:'flatbox'},h('span',{class:'lab'},'The flat version'),h('p',{class:'flat'},fx.flat)),
    h('div',{class:'row'},h('button',{type:'button',class:'btn ghost sm',onclick:function(){hint.hidden=!hint.hidden;}},'Hint')),hint,
    ta, h('div',{class:'row'},rb), model, rbox));
  setTimeout(function(){ta.focus({preventScroll:true});},30);
};
})();
