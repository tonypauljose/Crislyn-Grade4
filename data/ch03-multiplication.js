/* ============================================================
   Crislyn's World — Maths Chapter 3: Multiplication (Grade 4)
   Times tables 2–10, 2-digit × 1-digit, 3-digit × 1-digit,
   2-digit × 2-digit, multiplying by 10/100/1000, properties,
   and word problems with Indian context (₹, names, classrooms).
   ============================================================ */

window.CH03_BANK = [
  // ---------- Direct multiplication facts (tables 2–10) ----------
  { type: 'mcq', q: 'What is <strong>7 × 8</strong>?', options: ['54', '56', '64', '48'], answer: 1, explain: 'Seven eights are 56.' },
  { type: 'mcq', q: 'What is <strong>6 × 7</strong>?', options: ['36', '42', '48', '49'], answer: 1, explain: 'Six sevens are 42.' },
  { type: 'mcq', q: 'What is <strong>8 × 9</strong>?', options: ['64', '71', '72', '81'], answer: 2, explain: 'Eight nines are 72.' },
  { type: 'mcq', q: 'What is <strong>7 × 9</strong>?', options: ['56', '63', '64', '72'], answer: 1, explain: 'Seven nines are 63.' },
  { type: 'mcq', q: 'What is <strong>6 × 8</strong>?', options: ['42', '46', '48', '56'], answer: 2, explain: 'Six eights are 48.' },
  { type: 'mcq', q: 'What is <strong>6 × 9</strong>?', options: ['45', '54', '56', '63'], answer: 1, explain: 'Six nines are 54.' },
  { type: 'mcq', q: 'What is <strong>8 × 7</strong>?', options: ['54', '56', '64', '72'], answer: 1, explain: 'Eight sevens are 56 (same as 7×8).' },
  { type: 'mcq', q: 'What is <strong>9 × 8</strong>?', options: ['64', '72', '81', '89'], answer: 1, explain: 'Nine eights are 72.' },
  { type: 'mcq', q: 'What is <strong>9 × 6</strong>?', options: ['48', '54', '56', '63'], answer: 1, explain: 'Nine sixes are 54.' },
  { type: 'mcq', q: 'What is <strong>9 × 7</strong>?', options: ['56', '63', '72', '64'], answer: 1, explain: 'Nine sevens are 63.' },
  { type: 'mcq', q: 'What is <strong>7 × 7</strong>?', options: ['42', '47', '49', '56'], answer: 2, explain: 'Seven sevens are 49.' },
  { type: 'mcq', q: 'What is <strong>8 × 8</strong>?', options: ['56', '64', '72', '88'], answer: 1, explain: 'Eight eights are 64.' },
  { type: 'mcq', q: 'What is <strong>9 × 9</strong>?', options: ['72', '81', '88', '99'], answer: 1, explain: 'Nine nines are 81.' },
  { type: 'mcq', q: 'What is <strong>6 × 6</strong>?', options: ['30', '32', '36', '42'], answer: 2, explain: 'Six sixes are 36.' },
  { type: 'mcq', q: 'What is <strong>8 × 6</strong>?', options: ['42', '46', '48', '54'], answer: 2, explain: 'Eight sixes are 48.' },
  { type: 'mcq', q: 'What is <strong>5 × 9</strong>?', options: ['40', '45', '50', '54'], answer: 1, explain: 'Five nines are 45.' },
  { type: 'mcq', q: 'What is <strong>4 × 8</strong>?', options: ['28', '30', '32', '36'], answer: 2, explain: 'Four eights are 32.' },
  { type: 'mcq', q: 'What is <strong>3 × 9</strong>?', options: ['21', '24', '27', '29'], answer: 2, explain: 'Three nines are 27.' },
  { type: 'mcq', q: 'What is <strong>4 × 7</strong>?', options: ['24', '28', '32', '21'], answer: 1, explain: 'Four sevens are 28.' },
  { type: 'mcq', q: 'What is <strong>5 × 8</strong>?', options: ['35', '40', '45', '48'], answer: 1, explain: 'Five eights are 40.' },
  { type: 'mcq', q: 'What is <strong>3 × 8</strong>?', options: ['18', '21', '24', '27'], answer: 2, explain: 'Three eights are 24.' },
  { type: 'mcq', q: 'What is <strong>10 × 7</strong>?', options: ['17', '70', '700', '77'], answer: 1, explain: 'Ten sevens are 70.' },
  { type: 'mcq', q: 'What is <strong>2 × 9</strong>?', options: ['11', '18', '19', '20'], answer: 1, explain: 'Two nines are 18.' },
  { type: 'mcq', q: 'What is <strong>4 × 9</strong>?', options: ['32', '36', '45', '49'], answer: 1, explain: 'Four nines are 36.' },
  { type: 'mcq', q: 'What is <strong>5 × 7</strong>?', options: ['30', '35', '40', '42'], answer: 1, explain: 'Five sevens are 35.' },
  { type: 'mcq', q: 'What is <strong>3 × 7</strong>?', options: ['18', '21', '24', '27'], answer: 1, explain: 'Three sevens are 21.' },
  { type: 'mcq', q: 'What is <strong>2 × 8</strong>?', options: ['14', '16', '18', '20'], answer: 1, explain: 'Two eights are 16.' },
  { type: 'mcq', q: 'What is <strong>10 × 9</strong>?', options: ['19', '90', '99', '900'], answer: 1, explain: 'Ten nines are 90.' },
  { type: 'mcq', q: 'What is <strong>4 × 6</strong>?', options: ['18', '20', '24', '28'], answer: 2, explain: 'Four sixes are 24.' },
  { type: 'mcq', q: 'What is <strong>5 × 6</strong>?', options: ['25', '30', '35', '36'], answer: 1, explain: 'Five sixes are 30.' },

  // ---------- 2-digit × 1-digit ----------
  { type: 'mcq', q: '<strong>23 × 4</strong> = ?', options: ['82', '92', '102', '94'], answer: 1, explain: '20×4=80 and 3×4=12 → 80+12=92.' },
  { type: 'mcq', q: '<strong>17 × 5</strong> = ?', options: ['75', '80', '85', '95'], answer: 2, explain: '10×5=50 and 7×5=35 → 50+35=85.' },
  { type: 'mcq', q: '<strong>34 × 6</strong> = ?', options: ['184', '194', '204', '214'], answer: 2, explain: '30×6=180 and 4×6=24 → 180+24=204.' },
  { type: 'mcq', q: '<strong>48 × 3</strong> = ?', options: ['124', '134', '144', '154'], answer: 2, explain: '40×3=120 and 8×3=24 → 120+24=144.' },
  { type: 'mcq', q: '<strong>56 × 7</strong> = ?', options: ['382', '392', '402', '422'], answer: 1, explain: '50×7=350 and 6×7=42 → 350+42=392.' },
  { type: 'mcq', q: '<strong>29 × 8</strong> = ?', options: ['222', '232', '242', '252'], answer: 1, explain: '20×8=160 and 9×8=72 → 160+72=232.' },
  { type: 'mcq', q: '<strong>63 × 4</strong> = ?', options: ['232', '242', '252', '262'], answer: 2, explain: '60×4=240 and 3×4=12 → 252.' },
  { type: 'mcq', q: '<strong>75 × 6</strong> = ?', options: ['440', '450', '460', '420'], answer: 1, explain: '70×6=420 and 5×6=30 → 450.' },
  { type: 'mcq', q: '<strong>82 × 9</strong> = ?', options: ['728', '738', '748', '758'], answer: 1, explain: '80×9=720 and 2×9=18 → 738.' },
  { type: 'mcq', q: '<strong>94 × 5</strong> = ?', options: ['460', '470', '480', '490'], answer: 1, explain: '90×5=450 and 4×5=20 → 470.' },
  { type: 'mcq', q: '<strong>38 × 7</strong> = ?', options: ['256', '266', '276', '286'], answer: 1, explain: '30×7=210 and 8×7=56 → 266.' },
  { type: 'mcq', q: '<strong>45 × 8</strong> = ?', options: ['340', '350', '360', '370'], answer: 2, explain: '40×8=320 and 5×8=40 → 360.' },
  { type: 'fill', q: '<strong>67 × 3</strong> = ____ ?', answer: ['201'], explain: '60×3=180 and 7×3=21 → 201.' },
  { type: 'fill', q: '<strong>54 × 6</strong> = ____ ?', answer: ['324'], explain: '50×6=300 and 4×6=24 → 324.' },
  { type: 'fill', q: '<strong>89 × 4</strong> = ____ ?', answer: ['356'], explain: '80×4=320 and 9×4=36 → 356.' },

  // ---------- 3-digit × 1-digit ----------
  { type: 'mcq', q: '<strong>123 × 4</strong> = ?', options: ['482', '492', '502', '512'], answer: 1, explain: '100×4=400, 20×4=80, 3×4=12 → 492.' },
  { type: 'mcq', q: '<strong>234 × 3</strong> = ?', options: ['692', '702', '712', '722'], answer: 1, explain: '200×3=600, 30×3=90, 4×3=12 → 702.' },
  { type: 'mcq', q: '<strong>456 × 2</strong> = ?', options: ['812', '902', '912', '922'], answer: 2, explain: '400×2=800, 50×2=100, 6×2=12 → 912.' },
  { type: 'mcq', q: '<strong>307 × 6</strong> = ?', options: ['1,742', '1,832', '1,842', '1,852'], answer: 2, explain: '300×6=1,800 and 7×6=42 → 1,842.' },
  { type: 'mcq', q: '<strong>568 × 4</strong> = ?', options: ['2,262', '2,272', '2,282', '2,372'], answer: 1, explain: '500×4=2,000, 60×4=240, 8×4=32 → 2,272.' },
  { type: 'mcq', q: '<strong>219 × 5</strong> = ?', options: ['1,085', '1,095', '1,105', '1,195'], answer: 1, explain: '200×5=1,000, 19×5=95 → 1,095.' },
  { type: 'mcq', q: '<strong>625 × 7</strong> = ?', options: ['4,275', '4,375', '4,275', '4,475'], answer: 1, explain: '600×7=4,200, 25×7=175 → 4,375.' },
  { type: 'mcq', q: '<strong>483 × 8</strong> = ?', options: ['3,754', '3,864', '3,964', '4,064'], answer: 1, explain: '480×8=3,840 and 3×8=24 → 3,864.' },
  { type: 'fill', q: '<strong>146 × 5</strong> = ____ ?', answer: ['730'], explain: '146×5: 100×5=500, 46×5=230 → 730.' },
  { type: 'fill', q: '<strong>702 × 9</strong> = ____ ?', answer: ['6318', '6,318'], explain: '700×9=6,300 and 2×9=18 → 6,318.' },

  // ---------- 2-digit × 2-digit ----------
  { type: 'mcq', q: '<strong>12 × 13</strong> = ?', options: ['146', '156', '166', '176'], answer: 1, explain: '12×10=120 and 12×3=36 → 156.' },
  { type: 'mcq', q: '<strong>23 × 14</strong> = ?', options: ['312', '322', '332', '342'], answer: 1, explain: '23×10=230 and 23×4=92 → 322.' },
  { type: 'mcq', q: '<strong>34 × 21</strong> = ?', options: ['704', '714', '724', '734'], answer: 1, explain: '34×20=680 and 34×1=34 → 714.' },
  { type: 'mcq', q: '<strong>45 × 12</strong> = ?', options: ['530', '540', '550', '560'], answer: 1, explain: '45×10=450 and 45×2=90 → 540.' },
  { type: 'mcq', q: '<strong>56 × 17</strong> = ?', options: ['942', '952', '962', '972'], answer: 1, explain: '56×10=560 and 56×7=392 → 952.' },
  { type: 'mcq', q: '<strong>62 × 15</strong> = ?', options: ['910', '920', '930', '940'], answer: 2, explain: '62×10=620 and 62×5=310 → 930.' },
  { type: 'mcq', q: '<strong>78 × 11</strong> = ?', options: ['848', '858', '868', '878'], answer: 1, explain: '78×10=780 and 78×1=78 → 858.' },
  { type: 'mcq', q: '<strong>25 × 25</strong> = ?', options: ['525', '600', '625', '650'], answer: 2, explain: '25×25=625 (a useful square to remember).' },
  { type: 'fill', q: '<strong>36 × 24</strong> = ____ ?', answer: ['864'], explain: '36×20=720 and 36×4=144 → 864.' },
  { type: 'fill', q: '<strong>48 × 32</strong> = ____ ?', answer: ['1536', '1,536'], explain: '48×30=1,440 and 48×2=96 → 1,536.' },

  // ---------- Multiply by 10, 100, 1000 ----------
  { type: 'mcq', q: 'What is <strong>34 × 10</strong>?', options: ['34', '304', '340', '3,400'], answer: 2, explain: 'To multiply by 10, just put one zero at the end.' },
  { type: 'mcq', q: 'What is <strong>56 × 100</strong>?', options: ['560', '5,600', '56,000', '506'], answer: 1, explain: 'Multiply by 100 → add two zeros: 5,600.' },
  { type: 'mcq', q: 'What is <strong>7 × 1,000</strong>?', options: ['70', '700', '7,000', '70,000'], answer: 2, explain: 'Multiply by 1,000 → add three zeros: 7,000.' },
  { type: 'mcq', q: 'What is <strong>89 × 10</strong>?', options: ['89', '809', '890', '8,900'], answer: 2, explain: 'Add one zero at the end → 890.' },
  { type: 'mcq', q: 'What is <strong>12 × 1,000</strong>?', options: ['120', '1,200', '12,000', '1,20,000'], answer: 2, explain: 'Add three zeros → 12,000.' },
  { type: 'mcq', q: 'What is <strong>250 × 10</strong>?', options: ['250', '2,500', '25,000', '25'], answer: 1, explain: 'Add one zero → 2,500.' },
  { type: 'mcq', q: 'What is <strong>40 × 100</strong>?', options: ['400', '4,000', '40,000', '4,00,000'], answer: 1, explain: '40 with two more zeros → 4,000.' },
  { type: 'fill', q: '<strong>23 × 100</strong> = ____ ?', answer: ['2300', '2,300'], explain: 'Add two zeros to 23 → 2,300.' },
  { type: 'fill', q: '<strong>9 × 1,000</strong> = ____ ?', answer: ['9000', '9,000'], explain: 'Three zeros after 9 → 9,000.' },
  { type: 'fill', q: '<strong>72 × 10</strong> = ____ ?', answer: ['720'], explain: 'One zero after 72 → 720.' },

  // ---------- Properties ----------
  { type: 'mcq', q: 'What is <strong>437 × 0</strong>?', options: ['437', '0', '1', '4,370'], answer: 1, explain: 'Anything multiplied by 0 is 0.' },
  { type: 'mcq', q: 'What is <strong>968 × 1</strong>?', options: ['0', '1', '968', '9,680'], answer: 2, explain: 'Anything multiplied by 1 stays the same.' },
  { type: 'mcq', q: 'Which property says <strong>6 × 9 = 9 × 6</strong>?', options: ['Associative', 'Commutative', 'Distributive', 'Identity'], answer: 1, explain: 'You can swap the order — that\'s the commutative property.' },
  { type: 'mcq', q: '<strong>5 × (4 × 2)</strong> = (5 × 4) × 2. Which property is this?', options: ['Commutative', 'Associative', 'Identity', 'Zero'], answer: 1, explain: 'Grouping changes but answer stays same — associative property.' },
  { type: 'mcq', q: '<strong>7 × (10 + 3)</strong> = (7 × 10) + (7 × 3). Which idea is this?', options: ['Commutative', 'Associative', 'Distributive', 'Zero'], answer: 2, explain: 'Distribute the 7 across the addition — distributive property.' },

  // ---------- Word problems (Indian context) ----------
  { type: 'mcq', q: 'Maya buys <strong>6 packets</strong> of biscuits. Each packet has <strong>8 biscuits</strong>. How many biscuits in all?', options: ['42', '46', '48', '54'], answer: 2, explain: '6 × 8 = 48 biscuits.' },
  { type: 'mcq', q: 'A pencil costs <strong>₹7</strong>. Aarav buys <strong>9 pencils</strong>. How much does he pay?', options: ['₹56', '₹63', '₹72', '₹81'], answer: 1, explain: '9 × ₹7 = ₹63.' },
  { type: 'mcq', q: 'There are <strong>24 students</strong> in each classroom and <strong>5 classrooms</strong> in Grade 4. How many students total?', options: ['100', '110', '120', '125'], answer: 2, explain: '24 × 5 = 120 students.' },
  { type: 'mcq', q: 'Krishna fills <strong>12 baskets</strong> with <strong>15 mangoes</strong> each. How many mangoes in all?', options: ['170', '180', '190', '200'], answer: 1, explain: '12 × 15 = 180 mangoes.' },
  { type: 'mcq', q: 'A storybook costs <strong>₹125</strong>. Aisha buys <strong>4 storybooks</strong>. How much does she spend?', options: ['₹450', '₹500', '₹525', '₹550'], answer: 1, explain: '4 × ₹125 = ₹500.' },
  { type: 'mcq', q: 'Reyansh\'s school has <strong>8 buses</strong>. Each bus carries <strong>45 students</strong>. How many students travel by bus?', options: ['320', '350', '360', '400'], answer: 2, explain: '8 × 45 = 360 students.' },
  { type: 'mcq', q: 'Diya plants <strong>9 rows</strong> of saplings with <strong>16 saplings</strong> in each row. How many saplings?', options: ['134', '144', '154', '164'], answer: 1, explain: '9 × 16 = 144 saplings.' },
  { type: 'mcq', q: 'A box holds <strong>36 chocolates</strong>. Kabir buys <strong>7 boxes</strong>. How many chocolates?', options: ['232', '242', '252', '262'], answer: 2, explain: '7 × 36 = 252 chocolates.' },
  { type: 'mcq', q: 'One ticket to a fair costs <strong>₹85</strong>. Zara\'s family of <strong>6</strong> goes. How much do they pay?', options: ['₹490', '₹500', '₹510', '₹520'], answer: 2, explain: '6 × ₹85 = ₹510.' },
  { type: 'mcq', q: 'Riya saves <strong>₹250</strong> every month. How much does she save in <strong>1 year</strong> (12 months)?', options: ['₹2,500', '₹2,750', '₹3,000', '₹3,250'], answer: 2, explain: '12 × ₹250 = ₹3,000.' },

  // ---------- True / False ----------
  { type: 'tf', q: '<strong>6 × 7 = 42</strong>.', answer: 1, explain: 'True — six sevens are 42.' },
  { type: 'tf', q: '<strong>9 × 0 = 9</strong>.', answer: 0, explain: 'False — anything times 0 is 0.' },
  { type: 'tf', q: '<strong>8 × 1 = 8</strong>.', answer: 1, explain: 'True — multiplying by 1 keeps the number.' },
  { type: 'tf', q: '<strong>5 × 8 = 8 × 5</strong>.', answer: 1, explain: 'True — that\'s the commutative property.' },
  { type: 'tf', q: 'To multiply <strong>34 × 100</strong>, you write <strong>340</strong>.', answer: 0, explain: 'False — multiplying by 100 adds two zeros, so 34 × 100 = 3,400.' },

  // ---------- Fill in the blank (missing factor / product) ----------
  { type: 'fill', q: '<strong>7 × ____ = 56</strong>', answer: ['8'], explain: '7 × 8 = 56.' },
  { type: 'fill', q: '<strong>____ × 9 = 72</strong>', answer: ['8'], explain: '8 × 9 = 72.' },
  { type: 'fill', q: '<strong>6 × 7 = ____</strong>', answer: ['42'], explain: 'Six sevens are 42.' },
  { type: 'fill', q: '<strong>25 × 4 = ____</strong>', answer: ['100'], explain: 'A handy fact — 25 fours make 100.' },
  { type: 'fill', q: '<strong>____ × 100 = 5,400</strong>', answer: ['54'], explain: '54 × 100 = 5,400 (just add two zeros to 54).' }
];
