/* ==========================================================================
   HALF-YEARLY 2026 — ENGLISH LESSONS
   --------------------------------------------------------------------------
   Grammar lessons follow her notebook definitions. The two literature lessons
   teach the chapter the way the exam asks about it — full-sentence answers
   that start with words borrowed from the question.
   ========================================================================== */

(function () {
  'use strict';
  const L = (id, lesson) => window.HY_LESSONS.add(id, lesson);

  /* ============================================================== GRAMMAR */

  L('E1', {
    goal: 'Name the four kinds of sentence and give each one the right end mark.',
    cards: [
      { t: 'The four kinds', h:
        `<p><b>Declarative</b> — tells you something. Ends with a full stop.<br>
         <i>The bus leaves at eight.</i></p>
         <p><b>Interrogative</b> — asks something. Ends with a question mark.<br>
         <i>When does the bus leave?</i></p>
         <p><b>Imperative</b> — orders or requests. Ends with a full stop.<br>
         <i>Please close the door.</i></p>
         <p><b>Exclamatory</b> — sudden strong feeling. Ends with an exclamation mark.<br>
         <i>What a beautiful garden!</i></p>` },
      { t: 'The end mark is the giveaway', h:
        `<p>If the sentence already has its punctuation, the mark tells you the answer
         before you have finished reading.</p>
         <p class="hy-eg">? → interrogative &nbsp;·&nbsp; ! → exclamatory</p>
         <p>A full stop leaves two choices — so ask: is it <b>telling</b> me something
         (declarative) or <b>asking me to do</b> something (imperative)?</p>` },
      { t: 'How to spot an imperative', h:
        `<p>It usually begins with the verb, and the person being spoken to is not named:
         <i>Sit down. Bring your book. Please wait here.</i></p>
         <p>"Please" at the front is almost always an imperative.</p>` }
    ],
    worked: {
      q: 'Name the kind of sentence: <b>What a beautiful garden!</b>',
      steps: [
        { t: 'Look at the end mark', h: '<p>It ends with an <b>exclamation mark</b>.</p>' },
        { t: 'What does that mark mean?', h: '<p>It shows sudden, strong feeling — surprise, delight, shock.</p>' },
        { t: 'Check the opening words', h: '<p>"What a …!" and "How …!" are the usual openings of an exclamatory sentence.</p>' },
        { t: 'Answer', h: '<p class="hy-eg">It is an <b>exclamatory</b> sentence.</p>' }
      ],
      ans: 'Exclamatory'
    },
    recall: 'Read the last mark first — it names the sentence.'
  });

  L('E2', {
    goal: 'Sort any noun into common, proper, collective, material or abstract.',
    cards: [
      { t: 'The five kinds', h:
        `<p><b>Common</b> — a general name: girl, city, river.</p>
         <p><b>Proper</b> — one particular name, always a capital letter: Crislyn, Bahrain, Ganga.</p>
         <p><b>Collective</b> — a name for a whole group: a <i>herd</i> of cattle, a <i>bunch</i> of keys.</p>
         <p><b>Material</b> — what a thing is made of: gold, cotton, wood.</p>
         <p><b>Abstract</b> — something you cannot touch: honesty, love, childhood.</p>` },
      { t: 'Two questions that sort almost everything', h:
        `<ol class="hy-l-steps">
           <li>Can I <b>touch</b> it? If not, it is <b>abstract</b>.</li>
           <li>Does it have a <b>capital letter</b> because it names one particular
               person or place? Then it is <b>proper</b>.</li>
         </ol>
         <p>What is left is common, collective or material — and those you can tell apart
         by asking "is it a group?" or "is it a stuff?"</p>` },
      { t: 'The pair people mix up', h:
        `<div class="hy-vs">
           <div><b>Collective</b><p>Names a <b>group</b>: team, herd, bunch, crowd, flock.</p></div>
           <div><b>Material</b><p>Names a <b>substance</b>: gold, cotton, wood, glass.</p></div>
         </div>` }
    ],
    worked: {
      q: 'Name the kind of noun: <b>honesty</b>, <b>Bahrain</b>, <b>a flock of birds</b>.',
      steps: [
        { t: 'honesty — can you touch it?', h: '<p>No. You cannot hold honesty in your hand → <b>abstract noun</b>.</p>' },
        { t: 'Bahrain — capital letter, one particular place', h: '<p>It names one country and nothing else → <b>proper noun</b>.</p>' },
        { t: 'flock — which word is the noun being tested?', h: '<p>"Flock" is the name given to a whole group of birds.</p>' },
        { t: 'So', h: '<p class="hy-eg"><b>flock</b> is a <b>collective noun</b>.</p>' }
      ],
      ans: 'honesty = abstract · Bahrain = proper · flock = collective'
    },
    recall: 'Cannot touch it? Abstract. Capital letter? Proper.'
  });

  L('E3', {
    goal: 'Decide whether a noun is countable or uncountable, and use the container trick.',
    cards: [
      { t: 'The test', h:
        `<p>Can you put a number in front of it and add -s?</p>
         <div class="hy-vs">
           <div><b>Countable</b><p>three apples · two buses · five chairs</p></div>
           <div><b>Uncountable</b><p>water · rice · air · milk · sugar</p></div>
         </div>` },
      { t: 'Uncountable nouns have no plural', h:
        `<p>You never say "three waters" or "five rices". They stay as they are.</p>
         <p>That is the quickest check in the exam: try to make it plural. If it sounds
         wrong, it is uncountable.</p>` },
      { t: 'The container trick', h:
        `<p>You cannot count rice — but you <b>can</b> count what it comes in.</p>
         <p class="hy-eg">rice → two <b>bowls</b> of rice<br>
         water → three <b>glasses</b> of water<br>
         sugar → a <b>spoon</b> of sugar</p>
         <p>The container is countable; the stuff inside is not.</p>` }
    ],
    worked: {
      q: 'Is <b>milk</b> countable or uncountable? How would you count it?',
      steps: [
        { t: 'Try the plural', h: '<p>"Two milks" — that does not sound right in English.</p>' },
        { t: 'So it fails the test', h: '<p><b>Milk</b> is an <b>uncountable</b> noun.</p>' },
        { t: 'Now find a container', h: '<p>Milk comes in glasses, bottles, cartons, litres.</p>' },
        { t: 'Count the container instead', h: '<p class="hy-eg">two <b>glasses</b> of milk ✓</p>' }
      ],
      ans: 'Uncountable — count the container: two glasses of milk'
    },
    recall: 'If the plural sounds wrong, count the container instead.'
  });

  L('E4', {
    goal: 'Make the plural of any noun, including the irregular ones.',
    cards: [
      { t: 'The ordinary rules', h:
        `<p>Most nouns: add <b>-s</b> → book, books.</p>
         <p>After <b>s, sh, ch, x</b>: add <b>-es</b> → bus → bus<b>es</b>, box → box<b>es</b>,
         brush → brush<b>es</b>, watch → watch<b>es</b>.</p>` },
      { t: 'Words ending in y', h:
        `<p>Look at the letter <b>before</b> the y.</p>
         <div class="hy-vs">
           <div><b>Consonant + y</b><p>Change y to <b>-ies</b><br>baby → bab<b>ies</b><br>city → cit<b>ies</b></p></div>
           <div><b>Vowel + y</b><p>Just add <b>-s</b><br>boy → boy<b>s</b><br>key → key<b>s</b></p></div>
         </div>` },
      { t: 'f and fe, and the odd ones', h:
        `<p><b>f / fe → -ves</b>: leaf → lea<b>ves</b>, knife → kni<b>ves</b>, wolf → wol<b>ves</b>.</p>
         <p>These change completely and must simply be known:</p>
         <p class="hy-eg">child → children &nbsp;·&nbsp; man → men &nbsp;·&nbsp; woman → women<br>
         tooth → teeth &nbsp;·&nbsp; foot → feet &nbsp;·&nbsp; mouse → mice</p>` }
    ],
    worked: {
      q: 'Write the plural of <b>city</b>, <b>boy</b> and <b>knife</b>.',
      steps: [
        { t: 'city — look at the letter before the y', h: '<p>It is <b>t</b>, a consonant. So the y changes.</p><p class="hy-eg">city → cit<b>ies</b></p>' },
        { t: 'boy — same check', h: '<p>It is <b>o</b>, a vowel. So the y stays and you just add -s.</p><p class="hy-eg">boy → boy<b>s</b></p>' },
        { t: 'knife — ends in fe', h: '<p>f and fe turn into <b>-ves</b>.</p><p class="hy-eg">knife → kni<b>ves</b></p>' }
      ],
      ans: 'cities · boys · knives'
    },
    recall: 'Before the y: consonant changes it, vowel keeps it.'
  });

  L('E5', {
    goal: 'Sort nouns into masculine, feminine, common and neuter gender.',
    cards: [
      { t: 'The four genders', h:
        `<p><b>Masculine</b> — male: king, lion, uncle, boy.</p>
         <p><b>Feminine</b> — female: queen, lioness, aunt, girl.</p>
         <p><b>Common</b> — could be either: teacher, doctor, cousin, friend, student.</p>
         <p><b>Neuter</b> — things with no life: table, book, stone, chair.</p>` },
      { t: 'Common vs neuter — the one that trips people', h:
        `<div class="hy-vs">
           <div><b>Common</b><p>Alive, but you are not told which. A <i>teacher</i> could be a man or a woman.</p></div>
           <div><b>Neuter</b><p>Not alive at all. A <i>table</i> is neither.</p></div>
         </div>` },
      { t: 'Pairs worth learning', h:
        `<p class="hy-eg">king → queen &nbsp;·&nbsp; lion → lioness &nbsp;·&nbsp; uncle → aunt<br>
         nephew → niece &nbsp;·&nbsp; son → daughter &nbsp;·&nbsp; horse → mare</p>` }
    ],
    worked: {
      q: 'Give the gender of <b>doctor</b> and of <b>chair</b>.',
      steps: [
        { t: 'doctor — is it alive?', h: '<p>Yes, a doctor is a person.</p>' },
        { t: 'Male or female?', h: '<p>The word does not tell you — a doctor can be either → <b>common gender</b>.</p>' },
        { t: 'chair — is it alive?', h: '<p>No.</p>' },
        { t: 'So', h: '<p class="hy-eg">chair is <b>neuter gender</b>.</p>' }
      ],
      ans: 'doctor = common · chair = neuter'
    },
    recall: 'Alive but unspecified is common. Not alive is neuter.'
  });

  L('E6', {
    goal: 'Name the kind of an adjective — and stop confusing demonstrative with possessive.',
    cards: [
      { t: 'Each kind answers its own question', h:
        `<p><b>Quality</b> — <i>what kind?</i> brave, red, tall, beautiful</p>
         <p><b>Quantity</b> — <i>how much?</i> some, little, enough, whole, much</p>
         <p><b>Number</b> — <i>how many?</i> five, many, few, several, first</p>
         <p><b>Demonstrative</b> — <i>which one?</i> <b>this, that, these, those</b></p>
         <p><b>Possessive</b> — <i>whose?</i> my, your, his, her, our, their</p>
         <p><b>Interrogative</b> — asking: which, what, whose</p>` },
      { t: 'The two you have been losing marks on', h:
        `<p class="hy-key">this · that · these · those are DEMONSTRATIVE</p>
         <p>They point at something — <i>those</i> books, <i>this</i> pen. They do not say
         who owns it.</p>
         <p class="hy-key">Possessive adjectives are only my, your, his, her, its, our, their</p>` },
      { t: 'Quantity or number?', h:
        `<div class="hy-vs">
           <div><b>Quantity — how much</b><p>You cannot count it: some water, <b>enough</b> food, much noise, the whole cake.</p></div>
           <div><b>Number — how many</b><p>You can count it: five books, many boys, few days.</p></div>
         </div>
         <p><b>enough</b> answers "how much", so it is <b>quantity</b> — not quality.</p>` }
    ],
    worked: {
      q: 'Name the kind of adjective: <b>Those</b> books are mine. · I have <b>enough</b> time.',
      steps: [
        { t: 'Take "those" first — ask the question it answers', h: '<p>It is not telling you what kind of books, or how many. It is telling you <b>which</b> books.</p>' },
        { t: 'Which one? → demonstrative', h: '<p class="hy-eg"><b>Those</b> = demonstrative adjective</p>' },
        { t: 'Do not be fooled by "mine"', h: '<p>The ownership is in the word <i>mine</i>, further along the sentence. "Those" is only pointing.</p>' },
        { t: 'Now "enough" — how much or how many?', h: '<p>Time cannot be counted one, two, three — so it is answering <b>how much</b>.</p>' },
        { t: 'How much? → quantity', h: '<p class="hy-eg"><b>enough</b> = adjective of quantity</p>' }
      ],
      ans: 'those = demonstrative · enough = quantity'
    },
    recall: 'This, that, these, those point — they never own.'
  });

  L('E7', {
    goal: 'Change any adjective through positive, comparative and superlative.',
    cards: [
      { t: 'The three degrees', h:
        `<p><b>Positive</b> — plain: tall</p>
         <p><b>Comparative</b> — comparing <b>two</b>: taller</p>
         <p><b>Superlative</b> — comparing <b>three or more</b>: tallest</p>
         <p class="hy-eg">Ali is <b>tall</b>. Ali is <b>taller</b> than Sara. Ali is the <b>tallest</b> in the class.</p>` },
      { t: 'Short words vs long words', h:
        `<div class="hy-vs">
           <div><b>Short words</b><p>add -er / -est<br>small, smaller, smallest</p></div>
           <div><b>Long words</b><p>use more / most<br>beautiful, more beautiful, most beautiful</p></div>
         </div>
         <p>Never both at once — "more taller" is wrong.</p>` },
      { t: 'The irregular ones', h:
        `<p class="hy-eg">good → better → best<br>
         bad → worse → worst<br>
         many → more → most<br>
         little → less → least</p>
         <p>These have to be memorised; there is no rule behind them.</p>` }
    ],
    worked: {
      q: 'Fill in: This is the <b>______</b> (good) answer in the whole class.',
      steps: [
        { t: 'How many are being compared?', h: '<p>"in the whole class" means many — so it is the <b>superlative</b>.</p>' },
        { t: 'Is "good" regular?', h: '<p>No. You cannot say "goodest".</p>' },
        { t: 'Use the irregular chain', h: '<p class="hy-eg">good → better → <b>best</b></p>' },
        { t: 'Write the sentence', h: '<p class="hy-eg">This is the <b>best</b> answer in the whole class.</p>' }
      ],
      ans: 'best'
    },
    recall: 'Two things take -er. Three or more take -est.'
  });

  L('E8', {
    goal: 'Join two sentences with the conjunction that actually fits the meaning.',
    cards: [
      { t: 'What a conjunction does', h:
        `<p>It joins words or whole sentences together so you do not have to write two
         short choppy ones.</p>
         <p class="hy-eg">She was tired. She finished her work.<br>
         → She was tired, <b>but</b> she finished her work.</p>` },
      { t: 'Which one to use', h:
        `<p><b>and</b> — adds one thing to another</p>
         <p><b>but</b> — shows a contrast, something unexpected</p>
         <p><b>or</b> — offers a choice</p>
         <p><b>because</b> — gives the <b>reason</b></p>
         <p><b>so</b> — gives the <b>result</b></p>
         <p><b>although</b> — contrast again, at the start of the sentence</p>` },
      { t: 'because vs so — which way round?', h:
        `<p class="hy-eg">I stayed at home <b>because</b> it was raining. &nbsp;(reason after)<br>
         It was raining, <b>so</b> I stayed at home. &nbsp;(result after)</p>
         <p>Same two facts, opposite order. Read your finished sentence back to check it
         still makes sense.</p>` }
    ],
    worked: {
      q: 'Join with the right conjunction: <b>She was tired. She finished her work.</b>',
      steps: [
        { t: 'What is the relationship between them?', h: '<p>Being tired would normally stop you working — but she worked anyway. That is a surprise.</p>' },
        { t: 'A surprise means contrast', h: '<p>So it is not "and", and it is not "because".</p>' },
        { t: 'Pick the contrast word', h: '<p class="hy-eg">→ <b>but</b></p>' },
        { t: 'Write it out with the comma', h: '<p class="hy-eg">She was tired, <b>but</b> she finished her work.</p>' }
      ],
      ans: 'She was tired, but she finished her work.'
    },
    recall: 'Surprise takes but. Reason takes because. Result takes so.'
  });

  /* =========================================================== LITERATURE */

  L('E9', {
    goal: 'Know what the poem "Together We Can" says, and answer about it in full sentences.',
    cards: [
      { t: 'What the poem is about', h:
        `<p>It is a poem about <b>teamwork</b>: when people stand together, help each
         other and trust each other, they can do things no one could do alone.</p>` },
      { t: 'Lines the exam asks you to complete', h:
        `<p class="hy-poem">Together we stand, strong and <b>tall</b>,<br>
         With each hand joined, <b>the goal is near</b>,<br>
         Team spirit fills the air with <b>cheer</b>.<br>
         Our bond of <b>trust</b> is always there.<br>
         Teamwork can <b>overcome</b> anything.</p>
         <p>Learn the bold words — those are the blanks.</p>` },
      { t: 'How to answer a question about it', h:
        `<p>Never answer in one word. Start with words borrowed from the question and
         finish the thought.</p>
         <p class="hy-eg">Q: What happens when you join hands with your team?<br>
         A: <b>When we join hands with our team</b>, we become stronger together and can
         achieve our goal with unity and teamwork.</p>` }
    ],
    worked: {
      q: 'Answer in a full sentence: <b>Why is helping each other important?</b>',
      steps: [
        { t: 'Borrow the opening from the question', h: '<p class="hy-eg">Helping each other …</p>' },
        { t: 'Give the reasons the poem gives', h: '<p>It builds trust, it makes work easier, and nobody is left out.</p>' },
        { t: 'Put it together', h: '<p class="hy-eg">Helping each other builds trust, makes tasks easier, and ensures no one feels left out.</p>' },
        { t: 'Add the finishing line', h: '<p class="hy-eg">It also helps the team succeed.</p>' }
      ],
      ans: 'Helping each other builds trust, makes tasks easier, and ensures no one feels left out. It also helps the team succeed.'
    },
    recall: 'Start your answer with the words of the question.'
  });

  L('E10', {
    goal: 'Know the road-safety facts from "Be Smart, Be Safe" cold.',
    cards: [
      { t: 'The traffic lights', h:
        `<p class="hy-key">Red = stop &nbsp;·&nbsp; Yellow = get ready &nbsp;·&nbsp; Green = go</p>
         <p>Three colours, three meanings. This is almost always worth a mark.</p>` },
      { t: 'Crossing a road safely', h:
        `<ol class="hy-l-steps">
           <li>Cross at a <b>zebra crossing</b>, where drivers expect people.</li>
           <li>Look <b>right</b>, then <b>left</b>, then <b>right again</b>.</li>
           <li>Cross only when it is safe — walk, do not run.</li>
         </ol>
         <p>Never cross between parked cars or at a bend: the driver cannot see you.</p>` },
      { t: 'The other rules and words', h:
        `<p>The <b>footpath</b> is for walking safely — not for playing or parking.</p>
         <p>Wear a <b>helmet</b> on a bike, and a <b>seat belt</b> in a car.</p>
         <p>A <b>pedestrian</b> is a person walking in the street rather than travelling
         in a vehicle.</p>` }
    ],
    worked: {
      q: 'You are at a zebra crossing and the light for you has just turned green. What do you do?',
      steps: [
        { t: 'Green means go — but not straight away', h: '<p>The lights control the traffic; your eyes control you.</p>' },
        { t: 'Do the looking first', h: '<p class="hy-eg">Look <b>right</b> → <b>left</b> → <b>right again</b></p>' },
        { t: 'Then decide', h: '<p>Only step out once the road is actually clear.</p>' },
        { t: 'And cross properly', h: '<p class="hy-eg">Walk across the zebra crossing — do not run.</p>' }
      ],
      ans: 'Look right, left and right again, then walk across the zebra crossing when it is safe.'
    },
    recall: 'Red stop, yellow ready, green go — and always look right, left, right.'
  });

  L('E11', {
    goal: 'Know the chapter words, their meanings and their opposites.',
    cards: [
      { t: 'Meanings from the two chapters', h:
        `<p><b>teamwork</b> — the ability of people to work together</p>
         <p><b>goal</b> — something you hope to achieve in the future</p>
         <p><b>bond</b> — a close connection between individuals</p>
         <p><b>trust</b> — believing someone is good and honest</p>
         <p><b>overcome</b> — to manage, control or defeat something</p>
         <p><b>cheer</b> — a shout of applause or encouragement</p>` },
      { t: 'Words from "Be Smart, Be Safe"', h:
        `<p><b>install</b> — to place in position, ready for use</p>
         <p><b>regulate</b> — to control the rate or speed of a machine or process</p>
         <p><b>safety</b> — the condition of being safe</p>
         <p><b>pedestrian</b> — a person walking in the street rather than travelling in a vehicle</p>` },
      { t: 'The opposites from your notebook', h:
        `<p class="hy-eg">strong × weak &nbsp;·&nbsp; tall × short &nbsp;·&nbsp; win × lose<br>
         aloud × quietly &nbsp;·&nbsp; joy × sorrow &nbsp;·&nbsp; busy × idle<br>
         simple × complicated &nbsp;·&nbsp; often × rarely &nbsp;·&nbsp; distract × concentrate</p>` }
    ],
    worked: {
      q: 'You cannot remember what <b>overcome</b> means. What do you do?',
      steps: [
        { t: 'Put it back into the line from the poem', h: '<p class="hy-eg">"Teamwork can <b>overcome</b> anything."</p>' },
        { t: 'Ask what would make sense there', h: '<p>Teamwork can <i>beat</i> anything · teamwork can <i>deal with</i> anything.</p>' },
        { t: 'That is the meaning', h: '<p class="hy-eg">to manage, control or <b>defeat</b> something</p>' },
        { t: 'Why this works', h: '<p>The story or the poem always gives the clue. Never leave a meaning blank — put the word back in its sentence first.</p>' }
      ],
      ans: 'to manage, control or defeat something'
    },
    recall: 'Forgotten a word? Put it back into its sentence in the story.'
  });

  /* ========================================================== COMPOSITION */

  L('E12', {
    goal: 'Work through an unseen passage without panicking, and answer in full sentences.',
    cards: [
      { t: 'The order to do it in', h:
        `<ol class="hy-l-steps">
           <li>Read the passage <b>once</b>, quickly. Do not stop at hard words.</li>
           <li>Read the <b>questions</b> next — now you know what to hunt for.</li>
           <li>Read the passage again and <b>underline</b> where each answer hides.</li>
           <li>Answer in a <b>full sentence</b>, borrowing words from the question.</li>
         </ol>
         <p>Reading the questions before the second read is what makes the difference.</p>` },
      { t: 'Borrowing the question', h:
        `<p class="hy-eg">Q: <b>Where did the children go?</b><br>
         ✗ the park<br>
         ✓ <b>The children went to</b> the park.</p>
         <p>Turn the question round into the beginning of your answer, then finish it with
         what the passage told you.</p>` },
      { t: 'The answer is in the passage', h:
        `<p>Unseen comprehension never asks what you already know — every answer is
         somewhere in those few lines. If you cannot find it, you have not found the
         right line yet.</p>` }
    ],
    worked: {
      q: 'The passage says: "The children ran to the park after school." Q: <b>Where did the children go?</b>',
      steps: [
        { t: 'Find the line that holds the answer', h: '<p class="hy-eg">"The children <b>ran to the park</b> after school."</p>' },
        { t: 'Turn the question into an opening', h: '<p class="hy-eg">Where did the children go? → <b>The children went to …</b></p>' },
        { t: 'Finish it from the passage', h: '<p class="hy-eg">The children went to <b>the park</b>.</p>' },
        { t: 'Check', h: '<p>Full sentence ✓ · starts with the question words ✓ · comes from the passage ✓</p>' }
      ],
      ans: 'The children went to the park.'
    },
    recall: 'Read the questions before the second read.'
  });

  L('E13', {
    goal: 'Lay out an informal letter with all six parts in the right order.',
    cards: [
      { t: 'The six parts, top to bottom', h:
        `<ol class="hy-l-steps">
           <li><b>Your address</b> — top left</li>
           <li><b>Date</b> — just under the address</li>
           <li><b>Salutation</b> — Dear Grandma<b>,</b> (always a comma)</li>
           <li><b>Body</b> — two short paragraphs</li>
           <li><b>Closing</b> — With love, / Yours lovingly,</li>
           <li><b>Your name</b></li>
         </ol>` },
      { t: 'Informal means family and friends', h:
        `<div class="hy-vs">
           <div><b>Informal ✓</b><p>Dear Grandma,<br>With love,<br>Yours lovingly,</p></div>
           <div><b>Formal ✗</b><p>Respected Sir,<br>Yours faithfully,<br>Yours sincerely,</p></div>
         </div>
         <p>Using "Yours faithfully" to your grandmother loses the mark, however neat the
         rest is.</p>` },
      { t: 'What goes in the two paragraphs', h:
        `<p><b>First:</b> ask how they are, and say your news.</p>
         <p><b>Second:</b> finish kindly — say you will write again, send love to the rest
         of the family.</p>` }
    ],
    worked: {
      q: 'Lay out a letter to your grandmother about your Half-Yearly exam.',
      steps: [
        { t: 'Address and date first', h: '<p class="hy-eg">14, Al Zahra Street, Manama, Bahrain<br>23rd August 2026</p>' },
        { t: 'Salutation — with its comma', h: '<p class="hy-eg">Dear Grandma,</p>' },
        { t: 'First paragraph — greeting and news', h: '<p class="hy-eg">I hope you are keeping well. My Half-Yearly examination starts in the middle of September. I am revising Maths, English and Hindi every day.</p>' },
        { t: 'Second paragraph — a kind finish', h: '<p class="hy-eg">Please pray for me. I will write again after my exams are over. Give my love to Grandpa.</p>' },
        { t: 'Closing and name', h: '<p class="hy-eg">With love,<br>Crislyn</p>' }
      ],
      ans: 'Address · Date · Dear Grandma, · Body · With love, · Crislyn'
    },
    recall: 'Address, date, salutation, body, closing, name — always that order.'
  });

})();
