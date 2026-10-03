/* Comic Toolbox Gym - router, shell, shortcuts, boot */
(function(){
var G=window.G, h=G.h, CTG=window.CTG, V=G.views;
var NAV=[['','Home','home'],['map','Skills','map'],['practice','Practice','bolt','mid'],['lab','Labs','flask','extra'],['journal','Journal','book'],['progress','Progress','chart','extra'],['vocab','Vocabulary','pen','extra'],['settings','Settings','gear','extra'],['more','More','grid','moreonly']];
var TITLES={more:'More','':'Home',map:'Skill map',practice:'Practice',quiz:'Quiz',cards:'Flashcards',write:'Timed writing',fix:'Fix-it',lab:'Labs',journal:'Journal',vocab:'Vocabulary',progress:'Progress',settings:'Settings',workout:'Workout',tool:'Tool'};

G.applyTheme=function(){
  var t=G.S.settings.theme; var el=document.documentElement;
  if(t==='light'||t==='dark') el.setAttribute('data-theme',t); else el.removeAttribute('data-theme');
  var dark=t==='dark'||(t==='auto'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  var tc=G.$('#theme-color'); if(tc) tc.setAttribute('content',dark?'#12111a':'#4f35e0');
  var b=G.$('#theme-btn'); if(b){G.clear(b);b.appendChild(G.icon(dark?'sun':'moon',18));b.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');}
};
function parse(){
  var hs=location.hash.replace(/^#\/?/,'').split('?')[0]; var seg=hs.split('/').filter(Boolean).map(decodeURIComponent);
  return {name:seg[0]||'',args:seg.slice(1)};
}
function buildShell(){
  var app=G.$('#shell'); G.clear(app);
  var nav=h('nav',{class:'nav','aria-label':'Main'},h('a',{class:'brand',href:'#/'},h('span',{class:'logo','aria-hidden':'true'},'CT'),h('span',{class:'bn'},'Comic Toolbox',h('small',{},'practice gym'))),
    h('ul',{},NAV.map(function(n){return h('li',{class:n[3]||''},h('a',{href:'#/'+n[0],dataset:{r:n[0]}},G.icon(n[2],20),h('span',{},n[1])));})),
    h('a',{class:'btn primary wo',href:'#/workout'},G.icon('bolt',16),'10-min workout'));
  var top=h('header',{class:'topbar'},h('a',{class:'brand sm',href:'#/'},h('span',{class:'logo','aria-hidden':'true'},'CT'),'Comic Toolbox'),
    h('div',{class:'tb-right'},h('a',{class:'chip streak',id:'streak-chip',href:'#/progress','aria-label':'Streak'},G.icon('flame',14),h('span',{id:'streak-n'},'0')),
      h('a',{class:'iconbtn hideSm',href:'#/progress','aria-label':'Progress'},G.icon('chart',18)),
      h('a',{class:'iconbtn hideSm',href:'#/settings','aria-label':'Settings'},G.icon('gear',18)),
      h('button',{type:'button',class:'iconbtn',id:'theme-btn',onclick:function(){var dark=document.documentElement.getAttribute('data-theme')==='dark'||(!document.documentElement.getAttribute('data-theme')&&window.matchMedia('(prefers-color-scheme: dark)').matches);G.S.settings.theme=dark?'light':'dark';G.save();G.applyTheme();}},G.icon('moon',18)),
      h('button',{type:'button',class:'iconbtn hideSm',id:'help-btn','aria-label':'Keyboard shortcuts',onclick:showHelp},G.icon('help',18))));
  var main=h('main',{id:'main',tabindex:'-1'},h('div',{id:'app'}));
  app.appendChild(nav); app.appendChild(h('div',{class:'content'},top,main));
}
function render(){
  G.runCleanups();
  var p=parse(), root=G.$('#app'); G.clear(root); root.removeAttribute('style');
  var fn=V[p.name==='lab'?'lab':p.name||'dashboard']; if(p.name==='')fn=V.dashboard;
  document.title=(p.name==='tool'&&G.toolMap[p.args[0]]?G.toolMap[p.args[0]].name:(TITLES[p.name]||'Comic Toolbox'))+' · Comic Toolbox Gym';
  try{ if(!fn){G.go('#/');return;} fn(root,p.args); }
  catch(e){ console.error(e); root.appendChild(h('div',{class:'panel'},h('h2',{},'Something went wrong'),h('p',{},String(e&&e.message||e)),h('a',{class:'btn',href:'#/'},'Home'))); }
  G.$$('.nav a[data-r]').forEach(function(a){var r=a.dataset.r; var cur=(p.name===r)||(r==='practice'&&['quiz','cards','write','fix','workout'].indexOf(p.name)>=0)||(r==='map'&&p.name==='tool')||(r==='more'&&['lab','progress','vocab','settings'].indexOf(p.name)>=0); a.classList.toggle('on',cur); if(cur)a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
  var sn=G.$('#streak-n'); if(sn)sn.textContent=G.streak();
  var hd=G.$('#app h1'); if(hd){hd.setAttribute('tabindex','-1');}
  root.classList.remove('view-in'); void root.offsetWidth; root.classList.add('view-in');
  window.scrollTo(0,0);
}
G.rerender=render;
function setTbh(){var t=G.$('.topbar'); if(t) document.documentElement.style.setProperty('--tbh',t.offsetHeight+'px');}
window.addEventListener('resize',setTbh);


/* ---------- More page ---------- */
V.more=function(root){
  root.appendChild(G.head('More','Labs, progress, your comic vocabulary, settings and install options.'));
  var ic=G.installCard(true); if(ic) root.appendChild(ic);
  function item(icon,t,s,href){return h('a',{class:'moreitem card',href:href},h('div',{class:'ti'},G.icon(icon,22)),h('div',{class:'mi'},h('b',{},t),h('span',{class:'muted small'},s)),G.icon('arrow',18));}
  root.appendChild(h('div',{class:'morelist'},
    item('flask','Labs','Premise, character, throughline, sitcom and sketch builders','#/lab'),
    item('chart','Progress','Heatmap, mastery by chapter, achievements','#/progress'),
    item('pen','Comic vocabulary','Daily 5 to 10 funny things','#/vocab'),
    item('wrench','Fix-it challenges','Rewrite flat lines with the right tool','#/fix'),
    item('bolt','10-minute workout','Cards, quiz and a writing sprint','#/workout'),
    item('gear','Settings and backup','Theme, export, import, reset','#/settings')));
};

/* ---------- Install / Add to Home Screen ---------- */
var deferred=null;
function standalone(){return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;var c=G.$('#install-slot');if(c&&!c.firstChild){var n=G.installCard();if(n)c.appendChild(n);}});
window.addEventListener('appinstalled',function(){deferred=null;G.S.settings.installed=true;G.save();var c=G.$('#install-slot');if(c)G.clear(c);G.toast('Installed. Open it from your home screen.','ok');});
// forced=true: show even if previously dismissed (More page)
G.installCard=function(forced){
  if(standalone()||location.protocol==='file:') return null;
  if(!forced&&G.S.settings.installDismissed) return null;
  var body;
  if(deferred){
    body=h('div',{},h('b',{},'Install Comic Toolbox Gym'),h('p',{class:'muted small'},'Add it to your home screen for full-screen, offline practice.'),
      h('button',{type:'button',class:'btn primary',onclick:function(){deferred.prompt();deferred.userChoice.then(function(){deferred=null;G.rerender();});}},'Install app'));
  } else if(isIOS()){
    body=h('div',{},h('b',{},'Add to Home Screen'),h('p',{class:'muted small'},'In Safari, tap the Share button (square with an arrow), then choose "Add to Home Screen". It will then work offline like an app.'));
  } else if(forced){
    body=h('div',{},h('b',{},'Install as an app'),h('p',{class:'muted small'},'In your browser menu choose "Install app" or "Add to Home screen". The app already works offline once it has loaded.'));
  } else return null;
  var card=h('section',{class:'card installcard'},G.icon('download',22),body,
    forced?null:h('button',{type:'button',class:'iconbtn','aria-label':'Dismiss install hint',onclick:function(){G.S.settings.installDismissed=true;G.save();card.remove();}},G.icon('x',18)));
  return card;
};

/* ---------- service worker (http/https only; file:// is skipped silently) ---------- */
function registerSW(){
  if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      reg.addEventListener('updatefound',function(){var nw=reg.installing; if(!nw)return;
        nw.addEventListener('statechange',function(){ if(nw.state==='installed'&&navigator.serviceWorker.controller){G.toast('Update downloaded. Reload to get the latest version.','ok');} });});
    }).catch(function(e){console.info('Service worker not registered:',e&&e.message);});
  });
}

/* ---------- mobile keyboard handling ---------- */
var kbT=null;
document.addEventListener('focusin',function(e){
  var t=e.target; if(!t||!/INPUT|TEXTAREA|SELECT/.test(t.tagName)||/checkbox|radio|file/.test(t.type||'')) return;
  clearTimeout(kbT); document.body.classList.add('kb');
  if(window.matchMedia('(pointer:coarse)').matches&&/TEXTAREA|INPUT/.test(t.tagName)) setTimeout(function(){try{t.scrollIntoView({block:'center',behavior:'smooth'});}catch(_){}},300);
});
document.addEventListener('focusout',function(){clearTimeout(kbT);kbT=setTimeout(function(){document.body.classList.remove('kb');},120);});

/* ---------- help modal ---------- */
function showHelp(){
  var d=G.$('#helpdlg'); if(!d){d=h('dialog',{id:'helpdlg','aria-label':'Keyboard shortcuts'});document.body.appendChild(d);}
  G.clear(d); d.appendChild(h('div',{class:'dlg'},h('div',{class:'row between'},h('h2',{},'Keyboard shortcuts'),h('button',{type:'button',class:'iconbtn','aria-label':'Close',onclick:function(){d.close();}},G.icon('x',18))),G.shortcutsTable()));
  if(d.showModal)d.showModal(); else d.setAttribute('open','');
}
/* ---------- global shortcuts ---------- */
var gPending=false, gT=null;
document.addEventListener('keydown',function(e){
  var tg=e.target, typing=tg&&(/INPUT|TEXTAREA|SELECT/.test(tg.tagName)||tg.isContentEditable);
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){var fb=G.$('.wfoot .btn.accent'); if(fb&&!fb.disabled){e.preventDefault();fb.click();} return;}
  if(typing||e.ctrlKey||e.metaKey||e.altKey) return;
  if(e.key==='?'){e.preventDefault();showHelp();return;}
  if(e.key==='/'){var s=G.$('#jsearch'); if(s){e.preventDefault();s.focus();} return;}
  if(gPending){gPending=false;clearTimeout(gT);
    var map={d:'#/',m:'#/map',p:'#/practice',w:'#/write',q:'#/quiz',c:'#/cards',j:'#/journal',l:'#/lab',v:'#/vocab',s:'#/settings'}; var dest=map[e.key.toLowerCase()]; if(dest){e.preventDefault();G.go(dest);} return;}
  if(e.key==='g'){gPending=true;gT=setTimeout(function(){gPending=false;},1200);}
});
window.addEventListener('hashchange',render);
if(window.matchMedia) try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',G.applyTheme);}catch(e){}

/* ---------- boot ---------- */
function boot(){
  G.load(); buildShell(); G.applyTheme();
  if(G.saveError) G.toast('Warning: could not save to localStorage. Export backups regularly.','bad');
  render(); setTbh(); registerSW();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
