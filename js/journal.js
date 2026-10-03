/* Comic Toolbox Gym - journal, vocabulary, settings, import/export */
(function(){
var G=window.G, h=G.h, CTG=window.CTG, V=G.views;
var KIND_LABEL={exercise:'Exercise',fixit:'Fix-it',project:'Project',vocab:'Vocabulary',free:'Note'};

G.download=function(name,text,mime){
  var blob=new Blob([text],{type:mime||'text/plain'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name;
  document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
};
G.journalToMarkdown=function(list){
  var out=['# Comic Toolbox Gym: journal','','Exported '+new Date().toLocaleString()+' · '+list.length+' entries',''];
  list.forEach(function(j){
    var t=G.toolMap[j.tool];
    out.push('## '+(j.title||KIND_LABEL[j.kind]||'Entry'));
    out.push('*'+(KIND_LABEL[j.kind]||j.kind)+(t?' · '+t.name:'')+' · '+G.fmtDate(j.created)+(j.meta&&j.meta.selfScore!==undefined?' · self-score '+j.meta.selfScore:'')+'*','');
    if(j.prompt&&j.kind!=='project') out.push('**Prompt:** '+j.prompt,'');
    out.push((j.content||'').split('\n').map(function(l){return j.kind==='exercise'&&!j.fields?'- '+l:l;}).join('\n'),'');
    if(j.meta&&j.meta.win) out.push('**Win:** '+j.meta.win,'');
  });
  return out.join('\n');
};
G.exportJournalJSON=function(){G.download('comic-toolbox-journal-'+G.today()+'.json',JSON.stringify({app:'comic-toolbox-gym',type:'journal',version:1,exported:new Date().toISOString(),journal:G.S.journal},null,2),'application/json');};
G.exportAll=function(){G.download('comic-toolbox-backup-'+G.today()+'.json',JSON.stringify({app:'comic-toolbox-gym',type:'backup',version:1,exported:new Date().toISOString(),state:G.S,journal:G.S.journal},null,2),'application/json');};
G.importFile=function(file,done){
  var r=new FileReader();
  r.onload=function(){
    try{
      var o=JSON.parse(r.result); var list=Array.isArray(o)?o:(o.journal||[]);
      if(o&&o.state&&o.app==='comic-toolbox-gym'){
        if(confirm('This file is a full backup.\n\nOK = RESTORE everything (replaces your current progress).\nCancel = only merge the journal entries.')){
          G.S=G.merge(JSON.parse(JSON.stringify({v:1})),o.state); G.S=G.merge({settings:{},read:{},srs:{},quizLog:[],journal:[],activity:{},workouts:{},seen:{},drafts:{},stats:{quizN:0,quizOk:0,cards:0,ex:0,fix:0,words:0,mins:0,xp:0,workouts:0},ach:{}},o.state); G.saveNow(); G.toast('Backup restored.','ok'); if(done)done(); return;
        }
      }
      var have={}; G.S.journal.forEach(function(j){have[j.id]=1;}); var added=0;
      list.forEach(function(j){ if(j&&j.id&&j.content!==undefined&&!have[j.id]){G.S.journal.push(j);have[j.id]=1;added++;} });
      G.S.journal.sort(function(a,b){return b.created-a.created;}); G.save(); G.toast('Imported '+added+' new entries ('+(list.length-added)+' already present).','ok'); if(done)done();
    }catch(e){G.toast('Could not read that file: '+e.message,'bad');}
  };
  r.readAsText(file);
};

/* ---------- journal card ---------- */
G.journalCard=function(j,o){
  o=o||{}; var tool=G.toolMap[j.tool]; var open=!o.compact; var body=h('div',{class:'jbody'}); var card=h('article',{class:'card jcard '+j.kind,dataset:{id:j.id}});
  function paint(){
    G.clear(card); G.clear(body);
    var star=h('button',{type:'button',class:'iconbtn'+(j.star?' on':''),'aria-pressed':j.star?'true':'false','aria-label':'Star entry',title:'Star',onclick:function(){j.star=!j.star;G.save();paint();}},G.icon('star',16));
    card.appendChild(h('div',{class:'jhead'},h('div',{},h('div',{class:'row'},G.chip(KIND_LABEL[j.kind]||j.kind,tool?G.hue(j.tool):undefined,'kind'),tool?G.toolChip(j.tool):null,h('span',{class:'muted small'},G.fmtDate(j.created))),h('h3',{},j.title||'Untitled')),star));
    if(j.prompt&&j.kind!=='project') body.appendChild(h('p',{class:'jprompt'},h('b',{},j.kind==='fixit'?'Flat version: ':'Prompt: '),j.prompt));
    body.appendChild(h('pre',{class:'written'+(open?'':' clamp')},j.content||''));
    var m=j.meta||{}; var bits=[];
    if(m.selfScore!==undefined) bits.push('self-score '+m.selfScore); if(m.count!==undefined) bits.push(m.count+'/'+m.target+' '+(m.unit||'items')); if(m.words) bits.push(m.words+' words'); if(m.secs) bits.push(G.fmtTime(m.secs));
    if(bits.length) body.appendChild(h('p',{class:'muted small'},bits.join(' · ')));
    if(m.win) body.appendChild(h('p',{class:'win'},'Win: ',h('em',{},m.win)));
    if(j.kind==='fixit'&&m.model) body.appendChild(h('details',{},h('summary',{},'Model answer'),h('p',{},m.model)));
    card.appendChild(body);
    var acts=h('div',{class:'row jacts'});
    if(!open) acts.appendChild(h('button',{type:'button',class:'btn ghost sm',onclick:function(){open=true;paint();}},'Expand'));
    if(j.kind==='project'&&j.meta&&j.meta.builder) acts.appendChild(h('a',{class:'btn sm',href:'#/lab/'+j.meta.builder+'/'+j.id},'Open in lab'));
    acts.appendChild(h('button',{type:'button',class:'btn ghost sm',onclick:edit},'Edit'));
    acts.appendChild(h('button',{type:'button',class:'btn ghost sm',onclick:function(){navigator.clipboard&&navigator.clipboard.writeText((j.title||'')+'\n\n'+(j.content||'')).then(function(){G.toast('Copied.');},function(){G.toast('Copy not available here.');});}},'Copy'));
    acts.appendChild(h('button',{type:'button',class:'btn ghost sm danger',onclick:function(){ if(confirm('Delete this entry?')){G.S.journal=G.S.journal.filter(function(x){return x.id!==j.id;});G.save();card.remove();G.toast('Deleted.'); if(o.ondelete)o.ondelete();}}},'Delete'));
    card.appendChild(acts);
  }
  function edit(){
    var ti=h('input',{type:'text',value:j.title||'','aria-label':'Title'}), ta=h('textarea',{rows:8,'aria-label':'Content'}); ta.value=j.content||'';
    G.clear(card); card.appendChild(h('div',{class:'form'},ti,ta,h('div',{class:'row'},h('button',{type:'button',class:'btn primary',onclick:function(){j.title=ti.value.trim();j.content=ta.value;j.updated=Date.now();G.save();paint();G.toast('Saved.','ok');}},'Save'),h('button',{type:'button',class:'btn',onclick:paint},'Cancel'))));
    ta.focus();
  }
  paint(); return card;
};

/* ---------- journal page ---------- */
V.journal=function(root){
  root.appendChild(G.head('Journal','Everything you have written. Search it, star the good stuff, export it, mine it later.'));
  var q=h('input',{type:'search',placeholder:'Search your writing... (press /)',id:'jsearch','aria-label':'Search journal'});
  var kind=h('select',{'aria-label':'Type'},[['','All types'],['exercise','Exercises'],['fixit','Fix-its'],['project','Projects'],['vocab','Vocabulary'],['free','Notes']].map(function(o){return h('option',{value:o[0]},o[1]);}));
  var chs=h('select',{'aria-label':'Chapter'},[h('option',{value:''},'All chapters')].concat(CTG.CHAPTERS.filter(function(c){return G.toolsOfChapter(c.id).length;}).map(function(c){return h('option',{value:c.id},(c.id?'Ch '+c.id+' ':'Intro ')+c.title);})));
  var sort=h('select',{'aria-label':'Sort'},[['new','Newest'],['old','Oldest'],['score','Highest score'],['words','Longest']].map(function(o){return h('option',{value:o[0]},o[1]);}));
  var star=h('input',{type:'checkbox','aria-label':'Starred only'});
  var count=h('span',{class:'muted small','aria-live':'polite'}); var list=h('div',{class:'jlist'});
  var fileIn=h('input',{type:'file',accept:'.json,application/json',hidden:true,onchange:function(){if(this.files[0])G.importFile(this.files[0],function(){G.rerender();});}});
  function filtered(){
    var term=q.value.trim().toLowerCase();
    var a=G.S.journal.filter(function(j){
      if(kind.value&&j.kind!==kind.value) return false; if(star.checked&&!j.star) return false;
      if(chs.value!==''){var t=G.toolMap[j.tool]; if(!t||String(t.ch)!==chs.value) return false;}
      if(term){var t2=G.toolMap[j.tool]; var hay=((j.title||'')+' '+(j.content||'')+' '+(j.prompt||'')+' '+(t2?t2.name:'')+' '+((j.meta&&j.meta.win)||'')).toLowerCase(); if(hay.indexOf(term)<0) return false;}
      return true;});
    if(sort.value==='old') a.sort(function(x,y){return x.created-y.created;}); else if(sort.value==='score') a.sort(function(x,y){return ((y.meta&&y.meta.selfScore)||0)-((x.meta&&x.meta.selfScore)||0);}); else if(sort.value==='words') a.sort(function(x,y){return G.wordCount(y.content)-G.wordCount(x.content);}); else a.sort(function(x,y){return y.created-x.created;});
    return a;
  }
  function render(){
    var a=filtered(); G.clear(list); count.textContent=a.length+' of '+G.S.journal.length+' entries';
    if(!a.length){list.appendChild(h('div',{class:'empty'},G.S.journal.length?'Nothing matches your filters.':'Your journal is empty. Finish a writing exercise or add a quick note.'));return;}
    a.slice(0,100).forEach(function(j){list.appendChild(G.journalCard(j,{compact:true}));});
    if(a.length>100) list.appendChild(h('p',{class:'muted center'},'Showing the first 100. Narrow the search to see more.'));
  }
  [q,kind,chs,sort].forEach(function(el){el.addEventListener('input',render);}); star.addEventListener('change',render);
  root.appendChild(h('section',{class:'card form'},h('div',{class:'formrow'},q,kind,chs,sort,h('label',{class:'chk'},star,'Starred')),count));
  // actions
  var note=h('details',{class:'card'},h('summary',{},'Add a quick note'));
  var nt=h('input',{type:'text',placeholder:'Title (optional)','aria-label':'Note title'}), nb=h('textarea',{rows:4,placeholder:'Jot down a joke, jokoid, observation...','aria-label':'Note'});
  note.appendChild(h('div',{class:'form'},nt,nb,h('button',{type:'button',class:'btn primary',onclick:function(){if(!nb.value.trim())return;G.addJournal({kind:'free',tool:null,title:nt.value.trim()||'Note',content:nb.value.trim(),meta:{words:G.wordCount(nb.value)}});nb.value='';nt.value='';G.addActivity({xp:1,items:1,mins:0.5});render();G.toast('Note added.','ok');}},'Add note')));
  root.appendChild(note);
  root.appendChild(h('div',{class:'row'},
    h('button',{type:'button',class:'btn',onclick:G.exportJournalJSON},G.icon('download',16),'Export JSON'),
    h('button',{type:'button',class:'btn',onclick:function(){G.download('comic-toolbox-journal-'+G.today()+'.md',G.journalToMarkdown(filtered()),'text/markdown');}},G.icon('download',16),'Export Markdown'),
    h('button',{type:'button',class:'btn',onclick:G.exportAll},G.icon('download',16),'Full backup'),
    h('button',{type:'button',class:'btn',onclick:function(){fileIn.click();}},G.icon('upload',16),'Import JSON'),fileIn));
  root.appendChild(list); render();
};

/* ---------- vocabulary ---------- */
V.vocab=function(root){
  var TARGET=5;
  root.appendChild(G.head('Comic vocabulary','Add 5 to 10 funny things a day: jokes, jokoids, odd phrases, observations. Do not judge, do not structure. (The Wade Boggs paradigm: batting practice every day.)'));
  var inp=h('input',{type:'text',placeholder:'A funny thought, jokoid or phrase... press Enter','aria-label':'New comic vocabulary entry',autocomplete:'off'});
  var prog=h('div',{class:'vprog'}); var list=h('div',{class:'vlist'});
  function todays(){var k=G.today(); return G.S.journal.filter(function(j){return j.kind==='vocab'&&G.dateKey(new Date(j.created))===k;});}
  function add(){
    var v=inp.value.trim(); if(!v)return;
    G.addJournal({kind:'vocab',tool:'vocab',title:'Vocabulary',content:v,meta:{words:G.wordCount(v)}}); G.S.stats.words+=G.wordCount(v);
    G.addActivity({xp:1,items:1,mins:0.4}); inp.value=''; paint(); inp.focus();
    var n=todays().length; if(n===TARGET) {G.toast('Daily vocabulary target hit. Keep going or stop.','ok');G.announce('Daily target reached.');}
  }
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();add();}});
  function paint(){
    var n=todays().length; G.clear(prog); prog.appendChild(h('div',{class:'row'},h('b',{},n+' / '+TARGET+' today'),n>=TARGET?G.chip('Target hit','','ok'):null)); prog.appendChild(G.bar(100*Math.min(1,n/TARGET),150));
    G.clear(list); var all=G.S.journal.filter(function(j){return j.kind==='vocab';});
    if(!all.length){list.appendChild(h('div',{class:'empty'},'Nothing yet. Write the first thing that makes you smile.'));return;}
    var cur=''; all.slice(0,200).forEach(function(j){var d=G.dateKey(new Date(j.created)); if(d!==cur){cur=d;list.appendChild(h('h4',{},d===G.today()?'Today':d));}
      list.appendChild(h('div',{class:'vitem'},h('span',{},j.content),h('button',{type:'button',class:'iconbtn','aria-label':'Delete entry',onclick:function(){G.S.journal=G.S.journal.filter(function(x){return x.id!==j.id;});G.save();paint();}},G.icon('x',14))));});
  }
  root.appendChild(h('section',{class:'card form'},inp,h('button',{type:'button',class:'btn primary',onclick:add},'Add'),prog));
  root.appendChild(list); paint(); inp.focus();
};

/* ---------- settings ---------- */
V.settings=function(root){
  var S=G.S.settings;
  root.appendChild(G.head('Settings and data','Everything stays in this browser (localStorage). Back it up from time to time.'));
  var theme=h('select',{'aria-label':'Theme',onchange:function(){S.theme=this.value;G.save();G.applyTheme();}},[['auto','Match my device'],['light','Light'],['dark','Dark']].map(function(o){return h('option',{value:o[0],selected:S.theme===o[0]},o[1]);}));
  var name=h('input',{type:'text',value:S.name||'',placeholder:'Your name (for the greeting)','aria-label':'Name',oninput:function(){S.name=this.value;G.save();}});
  var sound=h('input',{type:'checkbox',checked:S.sound,onchange:function(){S.sound=this.checked;G.save();}});
  var ne=h('input',{type:'checkbox',checked:S.noedit,onchange:function(){S.noedit=this.checked;G.save();}});
  var fileIn=h('input',{type:'file',accept:'.json,application/json',hidden:true,onchange:function(){if(this.files[0])G.importFile(this.files[0],function(){G.applyTheme();G.rerender();});}});
  root.appendChild(h('section',{class:'card form'},h('h3',{},'Preferences'),
    h('label',{class:'field'},h('span',{},'Theme'),theme),h('label',{class:'field'},h('span',{},'Name'),name),
    h('label',{class:'chk'},sound,'Sound when the timer ends'),h('label',{class:'chk'},ne,'No-edit mode on by default (backspace and delete are blocked while writing, to keep the editor quiet)')));
  root.appendChild(h('section',{class:'card'},h('h3',{},'Data'),h('div',{class:'row'},
    h('button',{type:'button',class:'btn',onclick:G.exportAll},G.icon('download',16),'Full backup (JSON)'),
    h('button',{type:'button',class:'btn',onclick:G.exportJournalJSON},G.icon('download',16),'Journal JSON'),
    h('button',{type:'button',class:'btn',onclick:function(){G.download('comic-toolbox-journal-'+G.today()+'.md',G.journalToMarkdown(G.S.journal),'text/markdown');}},G.icon('download',16),'Journal Markdown'),
    h('button',{type:'button',class:'btn',onclick:function(){fileIn.click();}},G.icon('upload',16),'Import'),fileIn),
    h('p',{class:'muted small'},'Import accepts journal exports and full backups. Journal entries are merged by id, nothing is duplicated.'),
    h('div',{class:'row'},h('button',{type:'button',class:'btn danger',onclick:function(){if(prompt('This erases ALL progress and writing in this browser. Type RESET to confirm.')==='RESET'){G.reset();G.applyTheme();G.toast('Everything cleared.');G.go('#/');G.rerender();}}},G.icon('trash',16),'Reset everything'))));
  root.appendChild(h('section',{class:'card'},h('h3',{},'Keyboard shortcuts'),shortcuts()));
  root.appendChild(h('section',{class:'card'},h('h3',{},'About this app'),
    h('p',{},'A practice gym for the techniques in ',h('em',{},'The Comic Toolbox: How to Be Funny Even If You\'re Not'),' by John Vorhaus. Lessons, rules and questions are short paraphrases written for practice; they are not a substitute for the book. Buy it, read it, and use this app to make the tools stick.'),
    h('p',{class:'muted small'},CTG.TOOLS.length+' tools · '+CTG.QUIZ.length+' quiz questions · '+CTG.CARDS.length+' flashcards · '+CTG.EXERCISES.length+' exercises · '+CTG.FIX.length+' fix-it challenges · '+Object.keys(CTG.PROMPTS).length+' prompt banks.')));
};
function shortcuts(){
  var rows=[['?','Show this help'],['g d','Go to dashboard'],['g m','Skill map'],['g p','Practice hub'],['g w','Timed writing'],['g q','Quiz'],['g c','Flashcards'],['g j','Journal'],['g l','Labs'],['/','Focus search (journal)'],['1-4','Answer a quiz question or rate a card'],['Space','Flip card'],['Enter','Next question'],['Ctrl+Enter','Finish and review (while writing)']];
  return h('table',{class:'kbtable'},h('tbody',{},rows.map(function(r){return h('tr',{},h('td',{},h('kbd',{},r[0])),h('td',{},r[1]));})));
}
G.shortcutsTable=shortcuts;
})();
