/* ==========================================================================
   HALF-YEARLY 2026 — SKILL MAP
   --------------------------------------------------------------------------
   The spine of the revision system. Every skill in the Half-Yearly portion
   gets one entry here. Item content lives in hy-maths.js / hy-english.js /
   hy-hindi.js, keyed by these skill ids.

   Sources: "HY portion GR 4.pdf" + Crislyn's own class notebooks, textbooks
   and workbooks (Half Yearly Proportion/). Definitions are copied from her
   notebook so the wording she practises MATCHES what her teacher expects.

   weight  = rough share of exam marks (used to prioritise the daily mix)
   teach   = the "Show me" card: what to re-read before practising
   watch   = a mistake actually seen in her notebook (targeted correction)
   ========================================================================== */

(function () {
  'use strict';

  const SUBJECTS = {
    maths: {
      id: 'maths', name: 'Maths', icon: '🔢', short: 'Ma',
      colour: '#6B21A8', tint: '#F3E8FF',
      chapters: 'Ch 1 Numbers · Ch 2 Addition & Subtraction · Ch 3 Multiplication · Geometry · Perimeter & Area'
    },
    english: {
      id: 'english', name: 'English', icon: '📖', short: 'En',
      colour: '#0D9488', tint: '#CCFBF1',
      chapters: 'Together We Can · Be Smart, Be Safe · Grammar · Composition'
    },
    hindi: {
      id: 'hindi', name: 'हिंदी', icon: '🪷', short: 'हि',
      colour: '#EA580C', tint: '#FFEDD5',
      chapters: 'पाठ ६ बीरबल की खिचड़ी · कविता सीखो · व्याकरण · रचना'
    }
  };

  /* ---------------------------------------------------------------- MATHS */
  const MATHS = [
    {
      id: 'M1', name: 'Number names → figures', topic: 'Numbers', weight: 3,
      teach: `<p>Write the periods first, then fill the digits.</p>
        <p class="hy-eg">Five lakh twenty-one thousand eight hundred eighty-five<br>
        → <b>5,21,885</b></p>
        <p>Indian commas: first comma after <b>3</b> digits from the right, then every <b>2</b> digits.</p>`,
      watch: 'If a period is missing, put <b>0</b> there. "Nine lakh three" = 9,00,003 — not 9,00,300.'
    },
    {
      id: 'M2', name: 'Figures → number names', topic: 'Numbers', weight: 3,
      teach: `<p>Read the number in periods: <b>lakh · thousand · hundred · tens & ones</b>.</p>
        <p class="hy-eg">9,42,003 → Nine lakh forty-two thousand <b>three</b></p>
        <p>Spellings to get right: <b>forty</b> (not fourty), <b>ninety</b> (not ninty), <b>seventy</b>.</p>`,
      watch: 'You wrote "three hundred" for the last part of 9,42,003. 003 is just <b>three</b>.'
    },
    {
      id: 'M3', name: 'Place value & face value', topic: 'Numbers', weight: 3,
      teach: `<p><b>Face value</b> = the digit itself. It never changes.</p>
        <p><b>Place value</b> = digit × the value of its place.</p>
        <p class="hy-eg">In 4,58,201 the digit 5 → face value <b>5</b>, place value <b>50,000</b>.</p>`
    },
    {
      id: 'M4', name: 'Expanded & standard form', topic: 'Numbers', weight: 2,
      teach: `<p><b>Expanded form</b> breaks a number into place values.</p>
        <p class="hy-eg">6,03,542 = 6,00,000 + 0 + 3,000 + 500 + 40 + 2</p>
        <p><b>Standard form</b> joins them back into one number.</p>`
    },
    {
      id: 'M5', name: 'Compare & order numbers', topic: 'Numbers', weight: 4,
      teach: `<p>1. More digits = bigger number.</p>
        <p>2. Same digits? Compare from the <b>left</b> until they differ.</p>
        <p class="hy-eg">2,45,621 vs 2,45,612 → 2,4,5,6 same … then <b>2</b> vs <b>1</b> → 2,45,621 is bigger.</p>
        <p><b>Ascending</b> = smallest first ⬆ &nbsp;·&nbsp; <b>Descending</b> = biggest first ⬇</p>`,
      watch: 'Descending question: you swapped 2,45,612 and 2,45,621. Compare the LAST digits when everything else matches.'
    },
    {
      id: 'M6', name: 'Successor & predecessor', topic: 'Numbers', weight: 2,
      teach: `<p><b>Successor</b> = the number that comes just after → add 1.</p>
        <p><b>Predecessor</b> = the number that comes just before → subtract 1.</p>
        <p class="hy-eg">73,74,521 → successor 73,74,522 · predecessor 73,74,520</p>`
    },
    {
      id: 'M7', name: 'Greatest & smallest from digits', topic: 'Numbers', weight: 2,
      teach: `<p><b>Greatest</b>: arrange the digits from biggest to smallest.</p>
        <p><b>Smallest</b>: arrange from smallest to biggest — but if <b>0</b> is there, it cannot go first;
        put the next smallest digit first, then 0.</p>
        <p class="hy-eg">Digits 4, 0, 7, 2 → greatest <b>7420</b>, smallest <b>2047</b></p>`
    },
    {
      id: 'M8', name: 'Roman numerals', topic: 'Numbers', weight: 4, flag: 'weak',
      teach: `<p><b>I</b>=1 &nbsp; <b>V</b>=5 &nbsp; <b>X</b>=10 &nbsp; <b>L</b>=50</p>
        <p>Rule 1 — repeat a symbol (max 3 times) to add: XXX = 30.</p>
        <p>Rule 2 — a smaller symbol <b>after</b> a bigger one is added: XI = 11.</p>
        <p>Rule 3 — a smaller symbol <b>before</b> a bigger one is subtracted: IX = 9, XL = 40.</p>
        <p>Rule 4 — V and L are <b>never</b> repeated and never subtracted. So VX is wrong.</p>
        <p class="hy-eg">26 = 20 + 6 = XX + VI = <b>XXVI</b></p>`,
      watch: 'This page had blanks and a "please complete" in your book — it is worth marks, so we drill it every day.'
    },
    {
      id: 'M9', name: 'Addition with carrying', topic: 'Add & Subtract', weight: 5,
      teach: `<p>Write the numbers so the <b>ones sit under ones</b>. Add right to left and carry the tens.</p>
        <p class="hy-eg">
        &nbsp;&nbsp;<sup>1</sup>4<sup>1</sup>5<sup>1</sup>5,783<br>
        + &nbsp;&nbsp;75,723<br>
        <span class="hy-rule"></span>
        &nbsp;&nbsp;5,31,506</p>
        <p>With three numbers, add the first two, then add the third — or add the whole column at once.</p>`,
      watch: 'Most of your slips were lining-up slips, not adding slips. Always check the columns before you start.'
    },
    {
      id: 'M10', name: 'Subtraction with borrowing', topic: 'Add & Subtract', weight: 5,
      teach: `<p>Borrow from the next column when the top digit is smaller.</p>
        <p>Across a <b>0</b>: keep moving left until you find a digit to borrow from — every 0 you pass becomes 9.</p>
        <p class="hy-eg">7,00,000 − 2,45,318 = <b>4,54,682</b></p>`
    },
    {
      id: 'M11', name: 'Add / subtract properties', topic: 'Add & Subtract', weight: 3,
      teach: `<p><b>Zero property:</b> a + 0 = a &nbsp;·&nbsp; a − 0 = a</p>
        <p><b>Order (commutative):</b> a + b = b + a. Subtraction does NOT work like this.</p>
        <p><b>Grouping (associative):</b> (a + b) + c = a + (b + c)</p>
        <p><b>Same number:</b> a − a = 0</p>`
    },
    {
      id: 'M12', name: 'Missing number problems', topic: 'Add & Subtract', weight: 3,
      teach: `<p>"What must be added to <b>a</b> to make <b>b</b>?" → <b>b − a</b></p>
        <p>"The sum of two numbers is <b>s</b>, one is <b>a</b>. Find the other." → <b>s − a</b></p>
        <p>"The difference is <b>d</b>, the bigger number is <b>b</b>." → <b>b − d</b></p>`
    },
    {
      id: 'M13', name: 'Check subtraction by adding', topic: 'Add & Subtract', weight: 2,
      teach: `<p>Minuend − Subtrahend = <b>Difference</b></p>
        <p>Check: <b>Difference + Subtrahend = Minuend</b>. If it matches, your answer is right.</p>
        <p class="hy-eg">8,412 − 3,187 = 5,225 → 5,225 + 3,187 = 8,412 ✓</p>`
    },
    {
      id: 'M14', name: 'Add / subtract word problems', topic: 'Add & Subtract', weight: 5,
      teach: `<p>1. Read twice. 2. Underline the numbers. 3. Ask: <b>joining</b> (+) or <b>taking away / comparing</b> (−)?</p>
        <p>4. Two-step problems: find the middle answer first, then finish.</p>
        <p>5. Always write the unit in the answer.</p>`
    },
    {
      id: 'M15', name: 'Tables 2 to 12 (speed)', topic: 'Multiplication', weight: 5,
      teach: `<p>These have to be <b>fast</b>, not just correct — the exam has no time for counting.</p>
        <p>Target: answer in under 3 seconds.</p>
        <p class="hy-eg">Tricky ones people forget: 7×8=56, 6×7=42, 8×9=72, 12×7=84, 11×12=132</p>`
    },
    {
      id: 'M16', name: 'Multiply by 10, 100, 1000', topic: 'Multiplication', weight: 3,
      teach: `<p>Multiply the non-zero parts, then add <b>all</b> the zeros at the end.</p>
        <p class="hy-eg">32 × 400 → 32 × 4 = 128, then add 2 zeros → <b>12,800</b></p>`
    },
    {
      id: 'M17', name: 'Multiplication properties', topic: 'Multiplication', weight: 3,
      teach: `<p><b>× 0</b> → always 0 &nbsp;·&nbsp; <b>× 1</b> → the number itself</p>
        <p><b>Order:</b> a × b = b × a &nbsp;·&nbsp; <b>Grouping:</b> (a × b) × c = a × (b × c)</p>
        <p><b>Distributive:</b> a × (b + c) = a × b + a × c</p>`
    },
    {
      id: 'M18', name: 'Multiply by a 1-digit number', topic: 'Multiplication', weight: 5,
      teach: `<p>Multiply each digit from the right, carrying as you go.</p>
        <p class="hy-eg">
        &nbsp;&nbsp;<sup>2</sup>4<sup>2</sup>6<sup>1</sup>7 2<br>
        × &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4<br>
        <span class="hy-rule"></span>
        &nbsp;&nbsp;18,688</p>
        <p>The carry is <b>added after</b> multiplying the next digit — never before.</p>`
    },
    {
      id: 'M19', name: 'Multiplication word problems', topic: 'Multiplication', weight: 3,
      teach: `<p>Look for "each", "every", "per", "in one box" — those signal multiplying.</p>
        <p class="hy-eg">One carton holds 144 pens. How many in 6 cartons? → 144 × 6 = <b>864 pens</b></p>`
    },
    {
      id: 'M20', name: 'Point, line, ray, segment', topic: 'Geometry', weight: 4,
      teach: `<p><b>Point</b> — an exact location, shown by a dot, named with a capital letter.</p>
        <p><b>Line segment</b> — part of a line with <b>two</b> end points. It has a definite length.</p>
        <p><b>Ray</b> — has <b>one</b> end point and goes on endlessly in one direction.</p>
        <p><b>Line</b> — goes on endlessly in <b>both</b> directions. No end points.</p>
        <p><b>Curve</b> — open curve does not join up; closed curve starts and ends at the same point.</p>`
    },
    {
      id: 'M21', name: 'Angles & their types', topic: 'Geometry', weight: 5,
      teach: `<p>An <b>angle</b> is formed when two rays meet at a common end point.
        The two rays are the <b>arms</b>; the common point is the <b>vertex</b>.</p>
        <p><b>Acute</b> — less than 90° &nbsp;·&nbsp; <b>Right</b> — exactly 90°</p>
        <p><b>Obtuse</b> — more than 90° but less than 180° &nbsp;·&nbsp; <b>Straight</b> — exactly 180°</p>
        <p><b>Reflex</b> — more than 180° but less than 360° &nbsp;·&nbsp; <b>Complete</b> — exactly 360°</p>`
    },
    {
      id: 'M22', name: 'Polygons: sides & vertices', topic: 'Geometry', weight: 4,
      teach: `<p>A <b>polygon</b> is a closed figure made only of line segments.</p>
        <p>Triangle <b>3</b> · Quadrilateral <b>4</b> · Pentagon <b>5</b> · Hexagon <b>6</b> · Heptagon <b>7</b> · Octagon <b>8</b></p>
        <p>In every polygon, <b>number of sides = number of vertices</b>.</p>
        <p>A <b>regular</b> polygon has all sides equal and all angles equal.</p>`
    },
    {
      id: 'M23', name: 'Parts of a circle', topic: 'Geometry', weight: 4,
      teach: `<p><b>Centre</b> — the middle point.</p>
        <p><b>Radius</b> — centre to any point on the circle.</p>
        <p><b>Diameter</b> — a chord through the centre. <b>Diameter = 2 × radius</b></p>
        <p><b>Chord</b> — a line segment joining any two points on the circle.</p>
        <p><b>Circumference</b> — the distance all the way around the circle.</p>
        <p><b>Arc</b> — any part of the circumference.</p>`
    },
    {
      id: 'M24', name: 'Perimeter of a polygon', topic: 'Perimeter & Area', weight: 5,
      teach: `<p><b>Perimeter of a polygon = sum of the lengths of all its sides.</b></p>
        <p>Write it out the way your teacher does:</p>
        <p class="hy-eg">Perimeter of the polygon<br>
        = sum of the lengths of the sides<br>
        = 5 + 8 + 6 + 4 cm<br>
        = <b>23 cm</b></p>`
    },
    {
      id: 'M25', name: 'Perimeter of a rectangle', topic: 'Perimeter & Area', weight: 5,
      teach: `<p><b>Perimeter of a rectangle = 2 × (length + breadth)</b></p>
        <p class="hy-eg">l = 9 cm, b = 4 cm<br>
        P = 2 × (9 + 4) = 2 × 13 = <b>26 cm</b></p>
        <p>To find a missing side: length = (P ÷ 2) − breadth</p>`
    },
    {
      id: 'M26', name: 'Perimeter of a square', topic: 'Perimeter & Area', weight: 4,
      teach: `<p><b>Perimeter of a square = 4 × side</b></p>
        <p class="hy-eg">side = 7 cm → P = 4 × 7 = <b>28 cm</b></p>
        <p>Backwards: side = perimeter ÷ 4</p>`
    },
    {
      id: 'M27', name: 'Area of square & rectangle', topic: 'Perimeter & Area', weight: 4,
      teach: `<p><b>Area of a rectangle = length × breadth</b></p>
        <p><b>Area of a square = side × side</b></p>
        <p>Area is measured in <b>square</b> units: cm², m².</p>
        <p class="hy-eg">l = 8 cm, b = 5 cm → Area = 8 × 5 = <b>40 cm²</b></p>`,
      watch: 'Perimeter is the border (cm). Area is the surface inside (cm²). Do not mix the two.'
    },
    {
      id: 'M28', name: 'Perimeter & area word problems', topic: 'Perimeter & Area', weight: 4,
      teach: `<p>Fencing, running around, ribbon around a photo → <b>perimeter</b>.</p>
        <p>Carpet, tiles, painting a wall, grass in a field → <b>area</b>.</p>
        <p>Read the last line of the question again before choosing.</p>`
    }
  ];

  /* -------------------------------------------------------------- ENGLISH */
  const ENGLISH = [
    {
      id: 'E1', name: 'Kinds of sentences', topic: 'Grammar', weight: 4,
      teach: `<p><b>Declarative</b> — tells something. Ends with a full stop.</p>
        <p><b>Interrogative</b> — asks something. Ends with a question mark.</p>
        <p><b>Imperative</b> — orders or requests. Ends with a full stop.</p>
        <p><b>Exclamatory</b> — shows sudden strong feeling. Ends with an exclamation mark.</p>
        <p class="hy-eg">What a beautiful garden! → exclamatory</p>`
    },
    {
      id: 'E2', name: 'Kinds of nouns', topic: 'Grammar', weight: 5,
      teach: `<p><b>Common</b> — a general name: girl, city, river.</p>
        <p><b>Proper</b> — a particular name, always capital: Crislyn, Bahrain, Ganga.</p>
        <p><b>Collective</b> — a name for a group: a <i>herd</i> of cattle, a <i>bunch</i> of keys.</p>
        <p><b>Material</b> — what a thing is made of: gold, cotton, wood.</p>
        <p><b>Abstract</b> — something you cannot touch: honesty, love, childhood.</p>`
    },
    {
      id: 'E3', name: 'Countable & uncountable nouns', topic: 'Grammar', weight: 4,
      teach: `<p><b>Countable</b> — you can count them and they have a plural: apples, buses, chairs.</p>
        <p><b>Uncountable</b> — you cannot count them one by one and they usually have no plural:
        water, rice, air, milk, sugar.</p>
        <p>But the <b>container</b> is countable: rice is uncountable, <i>bowls of rice</i> is countable.</p>`
    },
    {
      id: 'E4', name: 'Singular & plural', topic: 'Grammar', weight: 3,
      teach: `<p>Most nouns: add <b>-s</b>. After s, sh, ch, x: add <b>-es</b> (bus → buses).</p>
        <p>Consonant + y → <b>-ies</b> (baby → babies). Vowel + y → just -s (boy → boys).</p>
        <p>f / fe → <b>-ves</b> (leaf → leaves, knife → knives).</p>
        <p>Odd ones: child → children, man → men, tooth → teeth, mouse → mice, foot → feet.</p>`
    },
    {
      id: 'E5', name: 'Gender', topic: 'Grammar', weight: 2,
      teach: `<p><b>Masculine</b> — male: king, lion, uncle.</p>
        <p><b>Feminine</b> — female: queen, lioness, aunt.</p>
        <p><b>Common</b> — either: teacher, doctor, cousin.</p>
        <p><b>Neuter</b> — things without life: table, book, stone.</p>`
    },
    {
      id: 'E6', name: 'Kinds of adjectives', topic: 'Grammar', weight: 5, flag: 'weak',
      teach: `<p><b>Quality</b> — what kind? brave, red, tall, beautiful.</p>
        <p><b>Quantity</b> — how much? some, little, enough, whole, much.</p>
        <p><b>Number</b> — how many? five, many, few, several, first.</p>
        <p><b>Demonstrative</b> — which one? <b>this, that, these, those</b>.</p>
        <p><b>Possessive</b> — whose? my, your, his, her, our, their.</p>
        <p><b>Interrogative</b> — asking: which, what, whose.</p>`,
      watch: 'In your book "those" was marked possessive — it is <b>demonstrative</b>. And "enough" is <b>quantity</b>, not quality.'
    },
    {
      id: 'E7', name: 'Degrees of comparison', topic: 'Grammar', weight: 3,
      teach: `<p><b>Positive</b> tall · <b>Comparative</b> taller (comparing 2) · <b>Superlative</b> tallest (3 or more)</p>
        <p>Long words use <b>more</b> / <b>most</b>: beautiful → more beautiful → most beautiful.</p>
        <p>Odd ones: good → better → best · bad → worse → worst · many → more → most</p>`
    },
    {
      id: 'E8', name: 'Conjunctions', topic: 'Grammar', weight: 4,
      teach: `<p>A conjunction joins words or sentences.</p>
        <p><b>and</b> adds · <b>but</b> shows contrast · <b>or</b> gives a choice</p>
        <p><b>because</b> / <b>so</b> give a reason and a result · <b>although</b> shows contrast</p>
        <p class="hy-eg">She was tired, <b>but</b> she finished her work.</p>`
    },
    {
      id: 'E9', name: '"Together We Can" — the poem', topic: 'Literature', weight: 5,
      teach: `<p>A poem about <b>teamwork</b>: small hands, joined together, can do big things.</p>
        <p>Learn the answers the way you wrote them in class — the exam wants full sentences,
        starting with words from the question.</p>`
    },
    {
      id: 'E10', name: '"Be Smart, Be Safe"', topic: 'Literature', weight: 5,
      teach: `<p>A lesson on <b>road safety</b>: footpaths, zebra crossings, traffic lights, helmets,
        seat belts and signs.</p>
        <p>Remember the three light colours and the safe way to cross: <b>stop, look right–left–right, then walk</b>.</p>`
    },
    {
      id: 'E11', name: 'Chapter words & meanings', topic: 'Literature', weight: 4,
      teach: `<p>Word work from both chapters: meanings, opposites and synonyms.</p>
        <p>If you are unsure, put the word back into the sentence from the story — the story gives the clue.</p>`
    },
    {
      id: 'E12', name: 'Unseen comprehension', topic: 'Composition', weight: 5,
      teach: `<p>1. Read the passage <b>once</b> quickly, then read the questions.</p>
        <p>2. Read again and underline where each answer hides.</p>
        <p>3. Answer in a <b>full sentence</b>, borrowing words from the question.</p>
        <p class="hy-eg">Q: Where did the children go? → <b>The children went to</b> the park.</p>`
    },
    {
      id: 'E13', name: 'Informal letter', topic: 'Composition', weight: 4,
      teach: `<p>Order of the parts, top to bottom:</p>
        <p>1. <b>Address</b> (top left) · 2. <b>Date</b> · 3. <b>Salutation</b> — Dear Grandma,</p>
        <p>4. <b>Body</b> — 2 short paragraphs · 5. <b>Closing</b> — With love, / Yours lovingly,</p>
        <p>6. <b>Your name</b></p>`
    }
  ];

  /* ---------------------------------------------------------------- HINDI */
  const HINDI = [
    {
      id: 'H1', name: 'बीरबल की खिचड़ी — प्रश्न-उत्तर', topic: 'पाठ ६', weight: 5, lang: 'hi',
      teach: `<p>कहानी: अकबर के दरबार में बीरबल अपनी <b>चतुराई</b> के लिए प्रसिद्ध थे।
        एक व्यक्ति ने सारी रात यमुना के ठंडे जल में खड़े रहकर शर्त पूरी की, पर बादशाह ने
        कहा कि वह <b>दीपक की गरमी</b> से बच गया, इसलिए इनाम नहीं दिया।</p>
        <p>बीरबल ने ऊँचे बाँस पर हाँडी लटकाकर नीचे थोड़ी-सी आग जलाई और बादशाह को
        उनकी अपनी बात समझा दी। तब अकबर ने उस व्यक्ति को <b>मोहरों की थैली</b> भेंट की।</p>
        <p><b>शिक्षा:</b> बुद्धि और चतुराई से किसी भी मुश्किल काम को आसान बनाया जा सकता है।</p>`
    },
    {
      id: 'H2', name: 'शब्दार्थ (बीरबल)', topic: 'पाठ ६', weight: 4, lang: 'hi',
      teach: `<p>आश्चर्य – हैरानी &nbsp;·&nbsp; उपस्थित – हाज़िर होना</p>
        <p>प्रसिद्ध – मशहूर &nbsp;·&nbsp; सम्मान – आदर &nbsp;·&nbsp; मोहरें – सिक्के</p>
        <p>चतुराई – होशियारी &nbsp;·&nbsp; विद्वान – ज्ञानी &nbsp;·&nbsp; सहायता – मदद</p>`
    },
    {
      id: 'H3', name: 'विलोम शब्द', topic: 'व्याकरण', weight: 4, lang: 'hi',
      teach: `<p>विलोम = उल्टा अर्थ वाला शब्द।</p>
        <p>गाँव × शहर &nbsp;·&nbsp; प्रकाश × अँधेरा &nbsp;·&nbsp; गरमी × सरदी &nbsp;·&nbsp; रात × दिन</p>
        <p>लंबा × छोटा &nbsp;·&nbsp; ऊपर × नीचे &nbsp;·&nbsp; बहुत × कम &nbsp;·&nbsp; दूर × पास</p>`
    },
    {
      id: 'H4', name: 'पर्यायवाची शब्द', topic: 'व्याकरण', weight: 3, lang: 'hi',
      teach: `<p>पर्यायवाची = एक ही अर्थ वाले शब्द।</p>
        <p>रात – निशा, रात्रि &nbsp;·&nbsp; भेंट – तोहफ़ा, उपहार</p>
        <p>प्रकाश – उजाला, रोशनी &nbsp;·&nbsp; पेड़ – तरु, वृक्ष &nbsp;·&nbsp; पृथ्वी – धरती, भूमि</p>`
    },
    {
      id: 'H5', name: 'किसने किससे कहा', topic: 'पाठ ६', weight: 3, lang: 'hi',
      teach: `<p>पूरा वाक्य लिखिए: <b>यह वाक्य ___ ने ___ से कहा।</b></p>
        <p class="hy-eg">“हाँडी तो आग से बहुत दूर है।” → यह वाक्य <b>बादशाह</b> ने <b>बीरबल</b> से कहा।</p>`
    },
    {
      id: 'H6', name: 'शब्द शुद्ध करो व वाक्य बनाओ', topic: 'व्याकरण', weight: 3, lang: 'hi',
      teach: `<p>अशुद्ध → शुद्ध: चतूराई → <b>चतुराई</b> · सममान → <b>सम्मान</b> ·
        उपस्थिथ → <b>उपस्थित</b> · प्रकास → <b>प्रकाश</b></p>
        <p>वाक्य बनाते समय शब्द को वैसे ही रखिए जैसे वह दिया गया है।</p>`
    },
    {
      id: 'H7', name: 'कविता “सीखो” — पंक्तियाँ', topic: 'कविता', weight: 5, lang: 'hi',
      teach: `<p>कवि — <b>श्रीनाथ सिंह</b></p>
        <p class="hy-eg">फूलों से नित हँसना सीखो, भौंरों से नित गाना।<br>
        तरु की झुकी डालियों से नित, सीखो शीश झुकाना।<br>
        सीख हवा के झोंकों से लो, कोमल भाव बहाना।<br>
        दूध तथा पानी से सीखो, मिलना और मिलाना।</p>`
    },
    {
      id: 'H8', name: 'किससे क्या सीखें', topic: 'कविता', weight: 4, lang: 'hi',
      teach: `<p>फूल → हँसना &nbsp;·&nbsp; भौंरा → गीत गाना &nbsp;·&nbsp; पेड़ → शीश झुकाना</p>
        <p>सूरज → जगना और जगाना &nbsp;·&nbsp; दीपक → अँधेरा दूर करना</p>
        <p>जलधारा → जीवन में सदैव आगे बढ़ना &nbsp;·&nbsp; धुआँ → ऊँचे चढ़ना</p>`
    },
    {
      id: 'H9', name: 'कविता के शब्दार्थ', topic: 'कविता', weight: 3, lang: 'hi',
      teach: `<p>तरु – पेड़ &nbsp;·&nbsp; शीश – सिर &nbsp;·&nbsp; पृथ्वी – धरती</p>
        <p>हरना – दूर करना &nbsp;·&nbsp; पथ – रास्ता / मार्ग &nbsp;·&nbsp; नित – हर दिन</p>`
    },
    {
      id: 'H10', name: 'संज्ञा', topic: 'व्याकरण', weight: 5, lang: 'hi',
      teach: `<p><b>किसी व्यक्ति, वस्तु, स्थान या प्राणी के नाम को संज्ञा कहते हैं।</b></p>
        <p>व्यक्ति – माँ, भाई, रमन &nbsp;·&nbsp; प्राणी – मक्खी, घोड़ा, हाथी</p>
        <p>स्थान – स्कूल, आगरा, दिल्ली &nbsp;·&nbsp; वस्तु – गिलास, कुर्सी, फूल</p>`
    },
    {
      id: 'H11', name: 'अनेक शब्दों के लिए एक शब्द', topic: 'व्याकरण', weight: 5, lang: 'hi',
      teach: `<p>जो डरता न हो – <b>निडर</b> &nbsp;·&nbsp; जो सबसे झगड़ा करे – <b>झगड़ालू</b></p>
        <p>अनेक रंगों वाला – <b>रंग-बिरंगा</b> &nbsp;·&nbsp; जो बहुत शरमाता हो – <b>शर्मीला</b></p>
        <p>जो हर समय आलस दिखाए – <b>आलसी</b> &nbsp;·&nbsp; जो कभी न मरे – <b>अमर</b></p>
        <p>जो सत्य बोले – <b>सत्यवादी</b> &nbsp;·&nbsp; पक्षियों का घर – <b>घोंसला</b></p>`
    },
    {
      id: 'H12', name: 'लिंग', topic: 'व्याकरण', weight: 5, lang: 'hi',
      teach: `<p><b>पुरुष तथा स्त्री जाति का बोध कराने वाले शब्द को लिंग कहा जाता है।</b>
        लिंग के दो प्रकार हैं — <b>पुल्लिंग</b> और <b>स्त्रीलिंग</b>।</p>
        <p>पुल्लिंग – लड़का, राजा, शेर, मोर, घोड़ा</p>
        <p>स्त्रीलिंग – लड़की, रानी, शेरनी, मोरनी, घोड़ी</p>
        <p>वाक्य में क्रिया भी बदलती है: गायक गाना <b>गाता</b> है / गायिका गाना <b>गाती</b> है।</p>`
    },
    {
      id: 'H13', name: 'रचना — मेरा देश', topic: 'रचना', weight: 4, lang: 'hi',
      teach: `<p class="hy-eg">भारत मेरा देश है। यहाँ सबसे ऊँचा पर्वत हिमालय है। यहाँ गंगा, यमुना जैसी
        पवित्र नदियाँ बहती हैं। यहाँ अलग-अलग धर्मों के लोग मिलजुलकर रहते हैं।
        भारत का राष्ट्रीय झंडा तिरंगा है। भारत में अलग-अलग त्योहार जैसे दिवाली, ईद,
        क्रिसमस धूमधाम से मनाए जाते हैं। यहाँ ताजमहल, लालकिला, कुतुबमीनार जैसी देखने की
        जगह हैं। भारत अपनी एकता के लिए पूरे संसार में प्रसिद्ध है। हमें अपने देश पर गर्व है।</p>`
    },
    {
      id: 'H14', name: 'अपठित गद्यांश', topic: 'रचना', weight: 4, lang: 'hi',
      teach: `<p>1. गद्यांश को दो बार पढ़िए।</p>
        <p>2. प्रश्न पढ़कर उत्तर वाली पंक्ति ढूँढ़िए।</p>
        <p>3. उत्तर <b>पूरे वाक्य</b> में लिखिए और प्रश्न के शब्दों से ही शुरू कीजिए।</p>
        <p class="hy-eg">प्र० चिड़िया क्या लेकर आ गई? → उ० <b>चिड़िया दाना लेकर आ गई।</b></p>`
    }
  ];

  /* --------------------------------------------------------------- ASSEMBLE */
  const ALL = [];
  MATHS.forEach(s => ALL.push(Object.assign({ subject: 'maths' }, s)));
  ENGLISH.forEach(s => ALL.push(Object.assign({ subject: 'english' }, s)));
  HINDI.forEach(s => ALL.push(Object.assign({ subject: 'hindi' }, s)));

  const BY_ID = {};
  ALL.forEach(s => { BY_ID[s.id] = s; });

  // Topic groupings, in teaching order, for the map view
  const TOPICS = [];
  ALL.forEach(s => {
    let t = TOPICS.find(x => x.subject === s.subject && x.name === s.topic);
    if (!t) { t = { subject: s.subject, name: s.topic, skills: [] }; TOPICS.push(t); }
    t.skills.push(s.id);
  });

  window.HY_SKILLS = {
    subjects: SUBJECTS,
    list: ALL,
    byId: BY_ID,
    topics: TOPICS,
    /** Exam date — Half-Yearly, mid September 2026 */
    examDate: '2026-09-14',
    get(id) { return BY_ID[id] || null; },
    forSubject(sub) { return ALL.filter(s => s.subject === sub); }
  };
})();
