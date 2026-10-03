(function(){
function S(k,title,help,ph,o){o=o||{};return {k:k,title:title,help:help,ph:ph||"",area:o.area!==false,bank:o.bank||null,tool:o.tool||null};}
CTG.BUILDERS=[
{id:"premise",name:"Premise Lab",icon:"flask",tool:"premise",desc:"Build a comic premise step by step: real reality, comic reality, conflict, truth and pain, exaggeration, title.",
 steps:[
 S("seed","Seed","Pick a character, situation or world to start with. Use the dice for a random seed.","e.g. a retired spy in a retirement village",{bank:["people","place","sit"],area:false}),
 S("real","Real reality","What would normally be expected here? Write the ordinary version.","In a retirement village, people play bridge and nap.",{tool:"premise"}),
 S("comic","Comic reality","Insert the opposite or a skewed version. This is the gap.","He treats the bridge club as a spy ring.",{tool:"premise"}),
 S("conflict","Conflict type","Is it global (vs world), local (vs another), inner (vs self), or all three? Write the lines of conflict.","Global: world doesn't take him seriously. Local: vs the bridge champion. Inner: he misses relevance.",{tool:"conflict3"}),
 S("truth","Truth and pain","What truth and what pain does the premise express? (General, not private.)","Truth: we all want to still matter. Pain: fear of being irrelevant.",{tool:"truth_pain"}),
 S("exag","Exaggerate","Take it to the end of the line. Too much is never enough.","He fakes a 'mission' every day, recruiting nurses as agents.",{tool:"exaggeration"}),
 S("line","The premise in one line","If you cannot say it in one line, you don't yet understand it.","A retired spy turns his retirement village into a secret mission.",{area:false,tool:"premise"}),
 S("title","Title (promise)","What does the title promise? Write three and star one.","Operation Shuffleboard",{area:false,tool:"promise_title"}),
 S("worst","Worst opposite","Who gives your hero the worst possible time?","A new neighbour who is a real retired spy.",{tool:"opposites"}),
 S("check","Check yourself","Is there a gap? Truth and pain? Strong perspective? Written in one line? Note what to improve.","",{})
 ]},
{id:"character",name:"Character Builder",icon:"user",tool:"char_build",desc:"The comic character assembly line: name, perspective, exaggeration, flaws, humanity, inner premise, key.",
 steps:[
 S("name","Name","A name that sounds like the person. Try several.","Bernard 'Bunny' Fensterman",{area:false,bank:["people"]}),
 S("perspective","Strong comic perspective","One clear unusual way of seeing everything.","Everything is a competition he's about to lose.",{tool:"perspective",bank:["perspective"]}),
 S("exag","Exaggeration","Take the perspective to the end of the line.","He keeps score of conversations.",{tool:"exaggeration"}),
 S("flaws","Flaws","At least five. Mix some that reinforce the perspective and some that fight it.","petty, boastful, jealous, forgetful, lazy",{tool:"flaws"}),
 S("humanity","Humanity","An equal and opposite humanity for each flaw.","fiercely loyal, secretly generous",{tool:"humanity"}),
 S("inner","Inner comic premise","Fantasy self-image versus reality.","He thinks he's a champion; he's actually just persistent.",{tool:"char_build"}),
 S("conflict","Conflict","What does he want and what keeps getting in the way?","He wants respect; the world gives him parking tickets.",{tool:"conflict3"}),
 S("key","Character key","One small action that shows who he is on first appearance.","He shakes hands and squeezes a bit too hard.",{tool:"charkeys"}),
 S("foil","A foil or opposite","Someone who gives him the worst possible time.","His calm, effortless neighbour.",{tool:"opposites"})
 ]},
{id:"throughline",name:"Throughline Builder",icon:"route",tool:"tl_gets",desc:"The book's 10-step comic throughline from hero to ending.",
 steps:[
 S("hero","1 The hero","Hero in one sentence: a strong comic character.","A timid accountant who lies about his past.",{tool:"tl_hero",bank:["tlhero"],area:false}),
 S("outer","2 Outer need","What he thinks he wants.","A promotion.",{tool:"tl_hero",area:false}),
 S("inner","3 Inner need","What he really wants (love, in the broad sense, if stuck).","To be respected as himself.",{tool:"tl_hero",area:false}),
 S("door","4 The door opens","The event that kicks the story into gear.","A new boss arrives who knew him in college.",{tool:"tl_door"}),
 S("control","5 Hero takes control","Early, surface-level success.","He bluffs well and is promoted to supervisor.",{tool:"tl_door"}),
 S("wrench","6 Monkey wrench","Displaced loyalty or new thing that conflicts with his goal.","He falls for the person he's competing against.",{tool:"tl_wrench"}),
 S("falls","7 Things fall apart","Bad news piles up, a trap of his own making.","His lies multiply and everyone's coming to the party.",{tool:"tl_wrench"}),
 S("bottom","8 Hits bottom","The moment of truth: choice between old and new loyalty.","Keep the promotion or tell the truth.",{tool:"tl_bottom"}),
 S("risk","9 Risks all","He sacrifices for the displaced loyalty with no guarantee.","He confesses publicly.",{tool:"tl_bottom"}),
 S("gets","10 What he gets","A double win that serves both loyalties.","He keeps his job honestly and gets the girl.",{tool:"tl_gets"})
 ]},
{id:"sitcom",name:"Sitcom Story Shortcut",icon:"tv",tool:"sit_iccr",desc:"Arc of stability, I-C-C-R, theme, A/B stories, fireworks scene.",
 steps:[
 S("show","Show and characters","Choose the show premise and its main characters (or a spec show you know).","A family-run funeral home with three kids.",{bank:["show"],area:false}),
 S("old","Old stability","How things are at the start.","Dad controls everything.",{tool:"sit_stability"}),
 S("inst","Instability","What disturbs it.","The eldest wants to change the business.",{tool:"sit_stability"}),
 S("new","New stability","The subtle change at the end.","Dad lets him run one funeral.",{tool:"sit_stability"}),
 S("i","Introduction","Introduce the story.","",{tool:"sit_iccr"}),
 S("c","Complication","What complicates it.","",{tool:"sit_iccr"}),
 S("cc","Consequence","What happens as a result.","",{tool:"sit_iccr"}),
 S("r","Relevance","Why it matters (the theme).","",{tool:"sit_iccr"}),
 S("theme","Theme as an imperative","Express the theme as an instruction.","Let go to move on.",{tool:"sit_ab",area:false}),
 S("b","B-story","A smaller, lighter story that comments on the A-story.","",{tool:"sit_ab"}),
 S("fire","Implied fireworks scene","The scene this story promises.","",{tool:"sit_iccr"}),
 S("break","Act break","Moment of maximum dread.","",{tool:"sit_acts"})
 ]},
{id:"sketch",name:"Sketch Builder",icon:"film",tool:"sketch_esc",desc:"The nine-point sketch method as a beat outline.",
 steps:[
 S("seed","Seed","Pick a sketch seed.","",{bank:["sketchseed"],area:false}),
 S("char","1 Strong comic character","Who is the lead and what is their perspective?","",{tool:"sketch_setup"}),
 S("opp","2 Force of opposition","Who or what opposes them?","",{tool:"sketch_setup"}),
 S("glue","3 Forced union (set glue)","Why can't they leave?","",{tool:"sketch_setup"}),
 S("esc","4 Escalate","Raise the conflict.","",{tool:"sketch_esc"}),
 S("stakes","5 Raise the stakes","What is lost or won?","",{tool:"sketch_esc"}),
 S("limits","6 Push the limits","Go further than is comfortable.","",{tool:"sketch_esc"}),
 S("peak","7 Emotional peak","The most intense moment.","",{tool:"sketch_esc"}),
 S("winner","8 Find a winner","Who wins, loses, or both?","",{tool:"sketch_esc"}),
 S("frame","9 Change the frame","A last twist that reframes.","",{tool:"sketch_esc"})
 ]}
];
})();
