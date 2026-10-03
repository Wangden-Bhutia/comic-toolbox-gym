/* Comic Toolbox Gym - builders (Premise Lab, Character, Throughline, Sitcom, Sketch) */
(function(){
var G=window.G, h=G.h, CTG=window.CTG, V=G.views;
function projects(){return G.S.journal.filter(function(j){return j.kind==='project';});}

V.lab=function(root,args){
  if(args[0]) return builder(root,args[0],args[1]);
  root.appendChild(G.head('Labs','Guided builders that follow the book\'s methods, step by step. Finished projects are saved to your journal.'));
  root.appendChild(h('div',{class:'tiles big'},CTG.BUILDERS.map(function(b){
    var n=projects().filter(function(p){return p.meta&&p.meta.builder===b.id;}).length;
    return h('a',{class:'tile card',href:'#/lab/'+b.id},h('div',{class:'ti'},G.icon(b.icon,24)),h('b',{},b.name),h('span',{class:'muted small'},b.desc),h('span',{class:'chip'},n+' saved · '+b.steps.length+' steps'));
  })));
  var ps=projects();
  root.appendChild(h('h3',{class:'sec'},'Saved projects'));
  if(!ps.length) root.appendChild(h('div',{class:'empty'},'No projects yet. Start with the Premise Lab.'));
  else root.appendChild(h('div',{class:'jlist'},ps.map(function(p){return G.journalCard(p,{});})));
};

function builder(root,bid,pid){
  var B=CTG.BUILDERS.filter(function(b){return b.id===bid;})[0];
  if(!B){root.appendChild(h('div',{class:'empty'},'Unknown builder.'));return;}
  var tool=G.toolMap[B.tool];
  var proj=pid?G.S.journal.filter(function(j){return j.id===pid;})[0]:null;
  var dkey='lab:'+bid+(pid?':'+pid:'');
  var data=proj&&proj.fields?JSON.parse(JSON.stringify(proj.fields)):((G.S.drafts[dkey]&&G.S.drafts[dkey].vals)||{});
  var step=0, finalStage=false;
  root.appendChild(h('a',{class:'back',href:'#/lab'},G.icon('back',16),'Labs'));
  root.appendChild(G.head(B.name,B.desc));
  var layout=h('div',{class:'labwrap'}); var side=h('ol',{class:'labsteps'}); var main=h('section',{class:'card labmain'});
  layout.appendChild(side); layout.appendChild(main); root.appendChild(layout);
  function saveDraft(){G.S.drafts[dkey]={vals:data,ts:Date.now()};G.save();}
  function renderSide(){
    G.clear(side);
    B.steps.forEach(function(s,i){
      var filled=!!(data[s.k]&&data[s.k].trim());
      side.appendChild(h('li',{},h('button',{type:'button',class:'lstep'+(i===step&&!finalStage?' cur':'')+(filled?' done':''),'aria-current':i===step&&!finalStage?'step':null,onclick:function(){finalStage=false;step=i;render();}},h('i',{},filled?G.icon('check',12):String(i+1)),s.title)));
    });
    side.appendChild(h('li',{},h('button',{type:'button',class:'lstep'+(finalStage?' cur':''),onclick:function(){finalStage=true;render();}},h('i',{},G.icon('star',12)),'Review and save')));
  }
  function render(){
    renderSide(); G.clear(main);
    if(finalStage) return renderFinal();
    var s=B.steps[step]; var st=s.tool&&G.toolMap[s.tool];
    var inp=s.area?h('textarea',{rows:5,placeholder:s.ph,'aria-label':s.title,oninput:function(){data[s.k]=this.value;saveDraft();markDone();}}):h('input',{type:'text',placeholder:s.ph,'aria-label':s.title,oninput:function(){data[s.k]=this.value;saveDraft();markDone();}});
    inp.value=data[s.k]||'';
    function markDone(){var b=G.$$('.lstep',side)[step]; if(b)b.classList.toggle('done',!!(data[s.k]&&data[s.k].trim()));}
    main.appendChild(h('div',{class:'eyebrow'},'Step '+(step+1)+' of '+B.steps.length));
    main.appendChild(h('h2',{},s.title)); main.appendChild(h('p',{class:'lead'},s.help));
    if(st){ main.appendChild(h('details',{class:'tip'},h('summary',{},'Tool reminder: '+st.name),h('p',{},st.tag),h('ul',{},st.rules.slice(0,2).map(function(r){return h('li',{},r);})),h('a',{href:'#/tool/'+st.id},'Open lesson'))); }
    main.appendChild(inp);
    var row=h('div',{class:'row'});
    if(s.bank) row.appendChild(h('button',{type:'button',class:'btn',onclick:function(){var p=G.prompt(G.pick(s.bank)); if(s.area&&inp.value.trim()) inp.value+='\n'+p; else inp.value=p; data[s.k]=inp.value; saveDraft(); markDone(); inp.focus(); G.announce('Seed: '+p);}},G.icon('dice',16),'Random seed'));
    main.appendChild(row);
    if(s.ph) main.appendChild(h('p',{class:'muted small'},'Example: ',h('em',{},s.ph)));
    main.appendChild(h('div',{class:'row between'},
      h('button',{type:'button',class:'btn ghost',disabled:step===0,onclick:function(){step--;render();}},G.icon('back',16),'Back'),
      step<B.steps.length-1?h('button',{type:'button',class:'btn primary',onclick:function(){step++;render();window.scrollTo(0,0);}},'Next',G.icon('arrow',16)):h('button',{type:'button',class:'btn primary',onclick:function(){finalStage=true;render();window.scrollTo(0,0);}},'Review',G.icon('arrow',16))));
    setTimeout(function(){inp.focus({preventScroll:true});},20);
  }
  function renderFinal(){
    var rub=(tool.rub||[]); var raters=rub.map(function(r){return G.rater(r,calc,(proj&&proj.meta&&proj.meta.checks&&proj.meta.checks[rub.indexOf(r)]>=0)?proj.meta.checks[rub.indexOf(r)]:undefined);});
    var scoreEl=h('div',{class:'score'});
    function calc(){var s=0,n=0;raters.forEach(function(r){if(r.get()>=0){s+=r.get();n++;}});var sc=n?Math.round(100*s/(2*raters.length)):0;scoreEl.textContent='Self-score: '+sc;return sc;}
    var titleIn=h('input',{type:'text',placeholder:'Name this project',value:(proj&&proj.title)||(B.id==='premise'?(data.title||'').split('\n')[0]:(B.id==='character'?data.name:'')) ,'aria-label':'Project name'});
    var out=B.steps.map(function(s){return data[s.k]&&data[s.k].trim()?s.title+': '+data[s.k].trim():null;}).filter(Boolean).join('\n');
    var empty=!out;
    main.appendChild(h('div',{class:'eyebrow'},'Final step')); main.appendChild(h('h2',{},'Review and save'));
    main.appendChild(h('label',{class:'field'},h('span',{},'Project name'),titleIn));
    main.appendChild(h('pre',{class:'written'},out||'(nothing filled in yet. Go back and fill in a few steps.)'));
    main.appendChild(h('h3',{},'Self-check: '+tool.name)); main.appendChild(h('ol',{class:'rubric'},rub.map(function(r,i){return h('li',{},h('div',{class:'rt'},r),raters[i].el);})));
    main.appendChild(scoreEl); calc();
    main.appendChild(h('div',{class:'row'},
      h('button',{type:'button',class:'btn',onclick:function(){finalStage=false;step=0;render();}},'Back to steps'),
      h('button',{type:'button',class:'btn primary',disabled:empty,id:'save-proj',onclick:function(){
        var sc=calc(); var meta={builder:B.id,selfScore:sc,checks:raters.map(function(r){return r.get();}),steps:B.steps.length,filled:B.steps.filter(function(s){return data[s.k]&&data[s.k].trim();}).length};
        var title=titleIn.value.trim()||(B.name+' project');
        if(proj){proj.title=title;proj.content=out;proj.fields=JSON.parse(JSON.stringify(data));proj.meta=meta;proj.updated=Date.now();G.save();}
        else {proj=G.addJournal({kind:'project',tool:B.tool,title:title,prompt:B.name,content:out,fields:JSON.parse(JSON.stringify(data)),meta:meta}); G.S.stats.ex++; G.addActivity({mins:8,xp:25,items:1});}
        G.S.stats.words+=G.wordCount(out); delete G.S.drafts[dkey]; G.save();
        G.toast('Project saved to your journal.','ok'); G.announce('Project saved.');
        G.clear(main); main.appendChild(h('div',{class:'center results'},h('h2',{},'Saved.'),h('p',{class:'muted'},'Find it under Journal or Labs. Come back and keep refining; rewriting is where comedy gets good.'),
          h('div',{class:'row center'},h('a',{class:'btn primary',href:'#/lab'},'Labs'),h('a',{class:'btn',href:'#/journal'},'Journal'),h('a',{class:'btn',href:'#/lab/'+B.id+'/'+proj.id},'Keep editing'))));
      }},G.icon('check',16),proj?'Update project':'Save project')));
  }
  render();
}
})();
