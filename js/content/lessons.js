/* Comic Toolbox Gym - chapters & tools (lessons).
   Built from John Vorhaus, "The Comic Toolbox" (Silman-James Press). Paraphrased summaries; read the book for the full text. */
window.CTG = window.CTG || {};
CTG.CHAPTERS = [
  {id:0, title:"Introduction", blurb:"The first rule is that there are no rules, only useful tools. Try every exercise, and break your creative habits.", color:200},
  {id:1, title:"Comedy Is Truth and Pain", blurb:"Why anything is funny: it expresses a truth and a pain that your audience shares.", color:12},
  {id:2, title:"The Will to Risk", blurb:"Funny starts with a willingness to fail. Weapons against fear and the ferocious editor.", color:350},
  {id:3, title:"The Comic Premise", blurb:"The gap between real reality and comic reality, and three levels of conflict.", color:28},
  {id:4, title:"Comic Characters", blurb:"An assembly line for characters: perspective, exaggeration, flaws, humanity.", color:42},
  {id:5, title:"Some Tools from the Toolbox", blurb:"Clash of context, inappropriate response, comic opposites, tension and release, truth/lie.", color:95},
  {id:6, title:"Types of Comic Stories", blurb:"Center & eccentrics, fish out of water, character comedy, powers, ensemble, slapstick, satire & parody.", color:150},
  {id:7, title:"The Comic Throughline", blurb:"A story in ten sentences: hero, needs, door, control, monkey wrench, bottom, risk, reward.", color:175},
  {id:8, title:"More Tools from the Toolbox", blurb:"Rule of three, jokoids, doorbell effect, cliches, running gag, callback.", color:195},
  {id:9, title:"Practical Jokes", blurb:"A one-sentence joke chapter (the rest of the page is blank). Nothing to practise; enjoy the gag.", color:215, joke:true},
  {id:10, title:"Comedy and Jeopardy", blurb:"The greater the jeopardy, the better the comedy. Raise the stakes.", color:235},
  {id:11, title:"Still More Tools from the Toolbox", blurb:"Micro/macro conflict, ear tickles, details, eyebrow effect, virtual humor, audience allegiance.", color:255},
  {id:12, title:"Situation Comedy", blurb:"Spec scripts, act breaks, the arc of stability, A/B stories, outlines.", color:275},
  {id:13, title:"Sketch Comedy", blurb:"A nine-point method for building a sketch.", color:295},
  {id:14, title:"Toward Polish and Perfection", blurb:"Bring the editor back: mine, refine, cut, test, trust.", color:315},
  {id:15, title:"Scrapmetal and Doughnuts", blurb:"Wince factor, fraud police, character keys, frames of reference, comic vocabulary, problem sets.", color:335},
  {id:16, title:"Homilies and Exhortations", blurb:"Talent + drive + time. Keep revelation alive and keep practising.", color:5}
];
CTG.TOOLS = [];
CTG.T = function(id,ch,name,tag,sum,rules,ex,ask,rub){CTG.TOOLS.push({id:id,ch:ch,name:name,tag:tag,sum:sum,rules:rules,ex:ex,ask:ask,rub:rub});};
