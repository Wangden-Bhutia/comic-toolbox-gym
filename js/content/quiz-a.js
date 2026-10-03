(function(){CTG.QUIZ=CTG.QUIZ||[];var n=0;
function Q(tool,kind,q,ch,why){CTG.QUIZ.push({id:"q"+(CTG.QUIZ.length+1),tool:tool,kind:kind,q:q,c:ch,why:why});}
/* c[0] is the correct answer; the app shuffles. kind: id | spot | concept | fix */
Q("newthing","concept","What does the book say about 'rules' for comedy writing?",
 ["The first rule is that there are no rules; the tools are useful fictions that define the problem.","Follow the tools in order or they will not work.","Rules confine creativity and should be ignored entirely.","Only professional writers may break the rules."],
 "Vorhaus says rules do not confine, they define: use what helps, reject what doesn't.");
Q("newthing","concept","Why should you try even the exercises that seem silly or irrelevant?",
 ["You get far more out of the tools if you put them into play while fresh; and you are not graded.","They are required before the next chapter unlocks.","Silly exercises are always the funniest.","Because someone will grade them."],
 "You'll only get out of the book what you put in; the exercises aren't judged.");
Q("newthing","concept","Which habit does the introduction recommend to keep your creative process fresh?",
 ["Change how and where you work: write in bed, paint in the park, draw cartoons on walls.","Always work at the same desk at the same hour.","Only write when inspiration strikes.","Avoid new experiences so you can concentrate."],
 "Break old habits, even ones that work; doing the new thing is almost always worth doing for its newness.");

Q("truth_pain","id","'A man falls off a cliff. On the way down he mutters, \"So far, so good.\"' Which pair best names its truth and pain?",
 ["Truth: we are sometimes victims of fate. Pain: we can't stop it.","Truth: gravity is strong. Pain: cliffs exist.","Truth: optimism is good. Pain: pessimism is bad.","It has no truth and pain; it is only wordplay."],
 "Vorhaus' own reading: we're sometimes victims of fate. A joke's truth and pain are its theme.");
Q("truth_pain","concept","What is the difference between the class clown and the class nerd in the book?",
 ["The clown's jokes rest on a truth and pain everyone shares; the nerd's only he gets.","The clown is louder than the nerd.","The nerd's jokes are cleverer.","The clown tells puns; the nerd tells stories."],
 "Comedy isn't just truth and pain but universal (or at least general) truth and pain.");
Q("truth_pain","concept","You have to write a joke about studying for a big exam. Per the book, what is the most useful FIRST step?",
 ["State the situation's truth (it's important to pass) and pain (you're not prepared).","Search for a pun about exams.","Imitate a famous comedian's exam routine.","Write the punchline first and work backwards from it."],
 "Any situation has an implied truth and pain; sum them up, then write the joke.");
Q("truth_pain","spot","Which is the BEST reason a joke about 'solipsists and light bulbs' would not land with a general audience?",
 ["Its truth and pain are only recognisable to those who know what a solipsist is.","It uses a light bulb.","It is too short.","It has no punchline."],
 "A joke that needs private knowledge is class-nerd comedy; it works only for audiences who share the reference.");

Q("bogus","id","'If this joke bombs, they'll think I'm a fool, and then I'll hate myself.' This is an example of:",
 ["A faulty association","A false assumption","The rule of nine","Positive reinforcement"],
 "Faulty association: linking 'they don't like my joke' to 'they don't like me' to 'I can't like myself.'");
Q("bogus","id","'It won't work; they won't like it.' This is an example of:",
 ["A false assumption","A faulty association","A callback","Clash of context"],
 "A false assumption: you can't know until you try; sometimes jokes do work.");
Q("bogus","concept","What is wrong with the ferocious editor's thinking, according to the book?",
 ["He underestimates your chance of success and overestimates the penalty for failure.","He is always right but too slow.","He only attacks bad ideas.","He is an outside force with no connection to you."],
 "He does sometimes help (don't mouth off to a cop) but his assumptions about mistakes and penalties are inflated. He is you.");
Q("bogus","concept","When is the ferocious editor invited back to work?",
 ["During rewriting and polishing, once raw material is on the page.","Never; he should be permanently killed.","Only when someone else is reading.","At the very start, to approve every idea."],
 "Early on you silence him; in chapter 14 he becomes a hard-eyed ally for refinement.");

Q("rule9","id","'For every ten ideas, nine won't work' is called:",
 ["The rule of nine","The rule of three","The doorbell effect","Virtual humor"],"The rule of nine lowers expectations and removes the editor's power.");
Q("rule9","concept","Why does the book embrace the 'rule of nine' even though it isn't literally true?",
 ["It's a useful fiction that removes the expectation of success, which is what gives the editor power.","Because exactly 90% of jokes really fail.","It helps you count jokes.","It tells you which jokes to keep."],
 "Remove the expectation and you remove the power. It is a tool, not a truism.");
Q("rule9","spot","Which approach best uses the rule of nine for a list exercise?",
 ["Write ten fast in five minutes without stopping; judge after.","Write one perfect item, then stop.","Write slowly, deleting weak items as you go.","Ask a friend to approve each item."],
 "Quantity, not quality; short time limits convince the editor nothing is at risk.");

Q("task_hand","concept","Why does the book say you should 'lower your sights'?",
 ["Hope of success can kill comedy as surely as fear of failure.","Because you will not succeed anyway.","To make exercises easier to grade.","Because ambition is selfish."],
 "Dwelling on being a winner prevents concentrating on the work that would make you one.");
Q("task_hand","concept","A friend just got the gig you wanted and you can't write. What does the book advise?",
 ["Return to the one thing you control: the words on the page. Concentrate on the task at hand.","Congratulate them and stop writing for the day.","Compare your résumé to theirs.","Lower your standards for the friendship."],
 "Process, not product: squeeze the competitive rage out of your mind by doing the next small chunk.");

Q("pos_reinf","concept","What does 'applaud small victories' do, per the book?",
 ["It creates an environment in which a bigger victory can grow (a self-fulfilling prophecy).","It makes you humble.","It replaces the need to practise.","It proves your work is perfect."],
 "Positive reinforcement improves your self-image, reduces anxiety and improves the next performance.");
Q("pos_reinf","spot","You finished an exercise and thought 'those jokes were awful.' What would the book suggest?",
 ["'I finished' is the win; take it and move on to the next task.","Delete everything and start again.","Show it to a critic.","Stop the exercises, they are not for you."],
 "Pat yourself on the back for doing the job; judging quality comes later.");

Q("premise","id","'I haven't had a bite in a week.' So I bit him. Which tool builds the gap here?",
 ["Comic premise: the expected meaning (food) is replaced by a skewed meaning (aggression).","Rule of three","Callback","Beta testing"],
 "A word that behaves differently from the expected way creates a gap between real and comic reality.");
Q("premise","concept","How does the book define the comic premise?",
 ["The gap between comic reality and real reality.","A funny first line.","A story with a surprise ending.","A set of three jokes."],
 "Comedy lives in the gap between realities.");
Q("premise","spot","Which is the weakest comic premise?",
 ["A man goes to work.","A conservative father battles a liberal son.","A soldier and a pacifist go to war.","A teacher takes on the school board."],
 "'A man goes to work' has no gap, no conflict, no comic reality; the other three set real and skewed realities against each other.");
Q("premise","concept","The book says a premise should be boiled down to:",
 ["A single line (a sentence or less)","A full page","A scene outline","Ten sentences"],
 "If you can't boil it to a line, you probably don't have a handle on it yet.");

Q("conflict3","id","An average person fights city hall. Which type of conflict is this?",
 ["Global (person vs. world)","Local (person vs. person with a bond)","Inner (person vs. self)","None; it isn't a conflict"],
 "Global conflict pits an individual against a world or social structure.");
Q("conflict3","id","In The Odd Couple, Felix and Oscar fight each other. Which type of conflict is that?",
 ["Local, with comic characters in opposition","Global, comic character in a normal world","Inner conflict","Satire"],
 "Local conflicts are between people who care about each other, here two clashing comic realities.");
Q("conflict3","id","A man wakes up as a woman and has to cope with who he is now. The core conflict is:",
 ["Inner: a normal character becomes comic through change of state","Global only","Local only","None; it is a pun"],
 "Inner comic conflict is often a normal character turned into his opposite (man into woman, kid into adult).");
Q("conflict3","concept","Which kind of conflict does the book call the richest and most rewarding?",
 ["Inner conflict (a character at war with himself)","Global conflict","Local conflict","Microconflict"],
 "'For true dramatic drive, nothing beats seeing characters at war with themselves.'");

Q("perspective","concept","What does 'strong comic perspective' mean?",
 ["A unique, clearly defined way of looking at the world that differs substantially from the normal one.","The character's catchphrase.","A set of quirks.","The camera angle of a comedy."],
 "It's the character's own comic premise: the gap that laughs spark across.");
Q("perspective","id","Which of these is the strongest comic perspective for a character?",
 ["Everything is a conspiracy against me (perfectly paranoid)","He's a priest","She's from Ohio","He's a nice guy"],
 "'A priest' and 'nice guy' are close to common views; perfectly paranoid is a single strong skew on everything.");
Q("perspective","concept","Gracie Allen's comic perspective was:",
 ["Innocence","Leering cynicism","Tightwad","Playfulness"],"Harpo was playfulness, Groucho leering cynicism, Jack Benny a tightwad.");

Q("exaggeration","concept","'If you can't be right, be loud.' Which tool does this describe?",
 ["Exaggeration: take the perspective to the end of the line.","Realism","Callback","Positioning the payoff"],
 "Boldness is the key; comedy defies logic.");
Q("exaggeration","fix","Perspective: 'likes cats.' Which is the best exaggeration?",
 ["Owns twelve dozen cats and holds their birthdays.","Likes cats a lot.","Has a cat.","Occasionally pets cats."],
 "Exaggeration pushes to the extreme with a concrete image; the others stay near the normal.");
Q("exaggeration","concept","Why do most failed comic characters fail, per the book?",
 ["They are not exaggerated enough.","They are too exaggerated.","They have no names.","They have too many flaws."],
 "Limited exaggeration is the common failure mode; Robin Williams is totally manic, Gracie is the ultimate innocent.");

Q("flaws","concept","A flaw can also be:",
 ["A positive quality taken too far (like Charlie Brown's trust).","Only physical.","A hidden secret.","A character's job."],
 "Kindness, trust and love become flaws when exaggerated.");
Q("flaws","concept","What are the two jobs of flaws?",
 ["Create inner conflict and create emotional distance so we can laugh.","Make the character unlikeable and boring.","Make the hero lose.","Make the plot longer."],
 "Distance lets the audience laugh at someone slipping on a banana peel; conflict makes the character dynamic.");
Q("flaws","spot","Which match of flaw to character is the most surprising/promising?",
 ["Prudishness assigned to a stripper","Prudishness assigned to a schoolmarm","Greed assigned to a banker","Forgetfulness assigned to an old man"],
 "The book suggests going beyond the 'appropriate' character: prudish stripper, air-traffic controller, President.");

Q("humanity","concept","What is 'humanity' in the comic character formula?",
 ["Positive qualities that inspire sympathy/empathy and let the audience care.","Being human rather than an animal.","Kindness only.","The character's backstory."],
 "Flaws build a wedge; humanity builds a bridge.");
Q("humanity","spot","Which is the weakest use of humanity, per the book?",
 ["'He's a hit man, but he loves his mother, so he's fine' stuck on at the end.","A flawed man who will do the right thing in a pinch.","A romantic soul hidden under the thug.","An indomitable will to win."],
 "Pasted-on humanity creates a cartoon. It has to be a real part of the character.");
Q("humanity","concept","The 'equal and opposite' rule says:",
 ["For every flaw there is an equal and opposite humanity.","Every humanity needs a flaw only.","Flaws and humanity cancel out.","The hero needs no flaws."],
 "The worse you make some aspects of a character, the better you must make others.");

Q("char_build","concept","The 'inner comic premise' is the gap between:",
 ["How a character sees himself (perspective) and who he really is (flaws).","Two characters' goals.","The hero and the villain.","The setup and the punchline."],
 "Flaws reflect true nature; comic perspective is fantasy self-image.");
Q("char_build","spot","Which character package has the best built-in inner conflict?",
 ["Perspective: fearless. Flaws: phobias. Humanity: wants to serve others.","Perspective: nice. Flaws: nice. Humanity: nice.","Perspective: lazy. Flaws: lazy. Humanity: lazy.","Perspective: none."],
 "The perspective collides with flaws; humanity puts the character in a painful box.");
})();
