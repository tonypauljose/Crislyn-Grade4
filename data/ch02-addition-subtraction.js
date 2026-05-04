/* ============================================================
   Crislyn's World — Maths Chapter 2: Addition & Subtraction (Grade 4)
   2-, 3-, and 4-digit addition and subtraction with and without
   regrouping, properties, word problems, missing numbers.
   ============================================================ */

window.CH02_BANK = [
  // ---------- Simple addition (no regrouping) ----------
  { type: 'mcq', q: '<strong>23 + 45</strong> = ?', options: ['58', '68', '78', '88'], answer: 1, explain: 'Add ones: 3+5=8. Add tens: 2+4=6. Answer: 68.' },
  { type: 'mcq', q: '<strong>52 + 36</strong> = ?', options: ['78', '88', '98', '86'], answer: 1, explain: '2+6=8 ones, 5+3=8 tens → 88.' },
  { type: 'mcq', q: '<strong>14 + 25</strong> = ?', options: ['29', '39', '49', '35'], answer: 1, explain: '4+5=9, 1+2=3 → 39.' },
  { type: 'mcq', q: '<strong>61 + 27</strong> = ?', options: ['78', '88', '87', '98'], answer: 1, explain: '1+7=8, 6+2=8 → 88.' },
  { type: 'mcq', q: '<strong>43 + 31</strong> = ?', options: ['64', '74', '73', '84'], answer: 1, explain: '3+1=4, 4+3=7 → 74.' },
  { type: 'mcq', q: '<strong>72 + 16</strong> = ?', options: ['78', '88', '98', '86'], answer: 1, explain: '2+6=8, 7+1=8 → 88.' },
  { type: 'mcq', q: '<strong>35 + 24</strong> = ?', options: ['49', '59', '69', '58'], answer: 1, explain: '5+4=9, 3+2=5 → 59.' },
  { type: 'mcq', q: '<strong>80 + 17</strong> = ?', options: ['97', '87', '107', '77'], answer: 0, explain: '0+7=7, 8+1=9 → 97.' },
  { type: 'mcq', q: '<strong>54 + 12</strong> = ?', options: ['56', '66', '76', '64'], answer: 1, explain: '4+2=6, 5+1=6 → 66.' },
  { type: 'mcq', q: '<strong>21 + 68</strong> = ?', options: ['79', '89', '99', '87'], answer: 1, explain: '1+8=9, 2+6=8 → 89.' },

  // ---------- Addition with carry (2-digit) ----------
  { type: 'mcq', q: '<strong>47 + 38</strong> = ?', options: ['75', '85', '95', '83'], answer: 1, explain: '7+8=15 (carry 1). 4+3+1=8 → 85.' },
  { type: 'mcq', q: '<strong>56 + 29</strong> = ?', options: ['75', '85', '95', '79'], answer: 1, explain: '6+9=15 (carry 1). 5+2+1=8 → 85.' },
  { type: 'mcq', q: '<strong>78 + 14</strong> = ?', options: ['82', '92', '102', '88'], answer: 1, explain: '8+4=12 (carry 1). 7+1+1=9 → 92.' },
  { type: 'mcq', q: '<strong>69 + 25</strong> = ?', options: ['84', '94', '104', '89'], answer: 1, explain: '9+5=14 (carry 1). 6+2+1=9 → 94.' },
  { type: 'mcq', q: '<strong>48 + 36</strong> = ?', options: ['74', '84', '94', '78'], answer: 1, explain: '8+6=14 (carry 1). 4+3+1=8 → 84.' },

  // ---------- Addition with carry (3-digit) ----------
  { type: 'mcq', q: '<strong>247 + 158</strong> = ?', options: ['395', '405', '415', '305'], answer: 1, explain: '7+8=15 (carry). 4+5+1=10 (carry). 2+1+1=4 → 405.' },
  { type: 'mcq', q: '<strong>376 + 289</strong> = ?', options: ['565', '655', '665', '675'], answer: 2, explain: '6+9=15 (carry). 7+8+1=16 (carry). 3+2+1=6 → 665.' },
  { type: 'mcq', q: '<strong>425 + 367</strong> = ?', options: ['782', '792', '892', '802'], answer: 1, explain: '5+7=12 (carry). 2+6+1=9. 4+3=7 → 792.' },
  { type: 'mcq', q: '<strong>518 + 294</strong> = ?', options: ['712', '802', '812', '822'], answer: 2, explain: '8+4=12 (carry). 1+9+1=11 (carry). 5+2+1=8 → 812.' },
  { type: 'mcq', q: '<strong>649 + 173</strong> = ?', options: ['812', '822', '912', '722'], answer: 1, explain: '9+3=12 (carry). 4+7+1=12 (carry). 6+1+1=8 → 822.' },
  { type: 'mcq', q: '<strong>308 + 495</strong> = ?', options: ['793', '803', '813', '893'], answer: 1, explain: '8+5=13 (carry). 0+9+1=10 (carry). 3+4+1=8 → 803.' },
  { type: 'mcq', q: '<strong>567 + 234</strong> = ?', options: ['791', '801', '811', '781'], answer: 1, explain: '7+4=11 (carry). 6+3+1=10 (carry). 5+2+1=8 → 801.' },
  { type: 'mcq', q: '<strong>189 + 256</strong> = ?', options: ['335', '435', '445', '445'], answer: 2, explain: '9+6=15 (carry). 8+5+1=14 (carry). 1+2+1=4 → 445.' },
  { type: 'mcq', q: '<strong>734 + 168</strong> = ?', options: ['802', '892', '902', '912'], answer: 2, explain: '4+8=12 (carry). 3+6+1=10 (carry). 7+1+1=9 → 902.' },
  { type: 'mcq', q: '<strong>456 + 378</strong> = ?', options: ['724', '824', '834', '844'], answer: 2, explain: '6+8=14 (carry). 5+7+1=13 (carry). 4+3+1=8 → 834.' },
  { type: 'mcq', q: '<strong>289 + 415</strong> = ?', options: ['604', '694', '704', '714'], answer: 2, explain: '9+5=14 (carry). 8+1+1=10 (carry). 2+4+1=7 → 704.' },
  { type: 'mcq', q: '<strong>637 + 285</strong> = ?', options: ['912', '922', '812', '932'], answer: 1, explain: '7+5=12 (carry). 3+8+1=12 (carry). 6+2+1=9 → 922.' },
  { type: 'mcq', q: '<strong>148 + 367</strong> = ?', options: ['405', '505', '515', '525'], answer: 2, explain: '8+7=15 (carry). 4+6+1=11 (carry). 1+3+1=5 → 515.' },
  { type: 'mcq', q: '<strong>752 + 169</strong> = ?', options: ['821', '911', '921', '931'], answer: 2, explain: '2+9=11 (carry). 5+6+1=12 (carry). 7+1+1=9 → 921.' },
  { type: 'mcq', q: '<strong>396 + 248</strong> = ?', options: ['534', '634', '644', '654'], answer: 2, explain: '6+8=14 (carry). 9+4+1=14 (carry). 3+2+1=6 → 644.' },
  { type: 'mcq', q: '<strong>219 + 587</strong> = ?', options: ['706', '796', '806', '816'], answer: 2, explain: '9+7=16 (carry). 1+8+1=10 (carry). 2+5+1=8 → 806.' },
  { type: 'mcq', q: '<strong>468 + 273</strong> = ?', options: ['641', '731', '741', '751'], answer: 2, explain: '8+3=11 (carry). 6+7+1=14 (carry). 4+2+1=7 → 741.' },
  { type: 'mcq', q: '<strong>825 + 196</strong> = ?', options: ['911', '1,011', '1,021', '1,031'], answer: 2, explain: '5+6=11 (carry). 2+9+1=12 (carry). 8+1+1=10 → 1,021.' },
  { type: 'mcq', q: '<strong>347 + 654</strong> = ?', options: ['901', '991', '1,001', '1,011'], answer: 2, explain: '7+4=11 (carry). 4+5+1=10 (carry). 3+6+1=10 → 1,001.' },
  { type: 'mcq', q: '<strong>578 + 423</strong> = ?', options: ['901', '991', '1,001', '1,011'], answer: 2, explain: '8+3=11 (carry). 7+2+1=10 (carry). 5+4+1=10 → 1,001.' },
  { type: 'mcq', q: '<strong>199 + 199</strong> = ?', options: ['388', '398', '408', '498'], answer: 1, explain: '9+9=18 (carry). 9+9+1=19 (carry). 1+1+1=3 → 398.' },
  { type: 'mcq', q: '<strong>456 + 189</strong> = ?', options: ['635', '645', '655', '545'], answer: 1, explain: '6+9=15 (carry). 5+8+1=14 (carry). 4+1+1=6 → 645.' },
  { type: 'mcq', q: '<strong>267 + 538</strong> = ?', options: ['705', '795', '805', '815'], answer: 2, explain: '7+8=15 (carry). 6+3+1=10 (carry). 2+5+1=8 → 805.' },
  { type: 'mcq', q: '<strong>483 + 219</strong> = ?', options: ['602', '692', '702', '712'], answer: 2, explain: '3+9=12 (carry). 8+1+1=10 (carry). 4+2+1=7 → 702.' },

  // ---------- Larger addition (4-digit) ----------
  { type: 'mcq', q: '<strong>2,347 + 1,568</strong> = ?', options: ['3,815', '3,915', '3,905', '4,015'], answer: 1, explain: '7+8=15. 4+6+1=11. 3+5+1=9. 2+1=3 → 3,915.' },
  { type: 'mcq', q: '<strong>4,629 + 3,184</strong> = ?', options: ['7,713', '7,803', '7,813', '7,913'], answer: 2, explain: '9+4=13. 2+8+1=11. 6+1+1=8. 4+3=7 → 7,813.' },
  { type: 'mcq', q: '<strong>5,478 + 2,369</strong> = ?', options: ['7,837', '7,847', '7,757', '7,947'], answer: 1, explain: '8+9=17. 7+6+1=14. 4+3+1=8. 5+2=7 → 7,847.' },
  { type: 'mcq', q: '<strong>6,253 + 1,789</strong> = ?', options: ['7,942', '8,042', '8,032', '8,142'], answer: 1, explain: '3+9=12. 5+8+1=14. 2+7+1=10. 6+1+1=8 → 8,042.' },
  { type: 'mcq', q: '<strong>3,896 + 4,275</strong> = ?', options: ['8,061', '8,161', '8,171', '8,071'], answer: 2, explain: '6+5=11. 9+7+1=17. 8+2+1=11. 3+4+1=8 → 8,171.' },
  { type: 'mcq', q: '<strong>7,148 + 2,956</strong> = ?', options: ['9,994', '10,004', '10,104', '10,114'], answer: 2, explain: '8+6=14. 4+5+1=10. 1+9+1=11. 7+2+1=10 → 10,104.' },
  { type: 'mcq', q: '<strong>1,876 + 5,439</strong> = ?', options: ['7,205', '7,315', '7,215', '7,305'], answer: 1, explain: '6+9=15. 7+3+1=11. 8+4+1=13. 1+5+1=7 → 7,315.' },
  { type: 'mcq', q: '<strong>4,567 + 3,892</strong> = ?', options: ['8,359', '8,459', '8,449', '8,469'], answer: 1, explain: '7+2=9. 6+9=15. 5+8+1=14. 4+3+1=8 → 8,459.' },
  { type: 'mcq', q: '<strong>2,938 + 6,154</strong> = ?', options: ['8,082', '8,992', '9,082', '9,092'], answer: 2, explain: '8+4=12. 3+5+1=9. 9+1=10. 2+6+1=9 → 9,092… recheck: 9,092.' },
  { type: 'mcq', q: '<strong>5,609 + 3,478</strong> = ?', options: ['8,977', '9,087', '9,077', '9,187'], answer: 2, explain: '9+8=17. 0+7+1=8. 6+4=10. 5+3+1=9 → 9,087.' },

  // ---------- Simple subtraction (no borrowing) ----------
  { type: 'mcq', q: '<strong>78 − 45</strong> = ?', options: ['23', '33', '43', '34'], answer: 1, explain: '8−5=3, 7−4=3 → 33.' },
  { type: 'mcq', q: '<strong>96 − 32</strong> = ?', options: ['54', '64', '74', '62'], answer: 1, explain: '6−2=4, 9−3=6 → 64.' },
  { type: 'mcq', q: '<strong>87 − 25</strong> = ?', options: ['52', '62', '72', '63'], answer: 1, explain: '7−5=2, 8−2=6 → 62.' },
  { type: 'mcq', q: '<strong>569 − 234</strong> = ?', options: ['325', '335', '345', '235'], answer: 1, explain: '9−4=5, 6−3=3, 5−2=3 → 335.' },
  { type: 'mcq', q: '<strong>847 − 526</strong> = ?', options: ['311', '321', '331', '221'], answer: 1, explain: '7−6=1, 4−2=2, 8−5=3 → 321.' },
  { type: 'mcq', q: '<strong>698 − 374</strong> = ?', options: ['314', '324', '334', '224'], answer: 1, explain: '8−4=4, 9−7=2, 6−3=3 → 324.' },
  { type: 'mcq', q: '<strong>987 − 654</strong> = ?', options: ['323', '333', '343', '233'], answer: 1, explain: '7−4=3, 8−5=3, 9−6=3 → 333.' },
  { type: 'mcq', q: '<strong>758 − 423</strong> = ?', options: ['325', '335', '235', '345'], answer: 1, explain: '8−3=5, 5−2=3, 7−4=3 → 335.' },
  { type: 'mcq', q: '<strong>4,679 − 2,345</strong> = ?', options: ['2,234', '2,334', '2,344', '2,434'], answer: 1, explain: 'Subtract place by place: 9−5=4, 7−4=3, 6−3=3, 4−2=2 → 2,334.' },
  { type: 'mcq', q: '<strong>8,956 − 3,624</strong> = ?', options: ['5,232', '5,332', '5,322', '5,232'], answer: 1, explain: '6−4=2, 5−2=3, 9−6=3, 8−3=5 → 5,332.' },

  // ---------- Subtraction with borrowing (2-digit) ----------
  { type: 'mcq', q: '<strong>72 − 38</strong> = ?', options: ['24', '34', '44', '36'], answer: 1, explain: 'Borrow: 12−8=4, 6−3=3 → 34.' },
  { type: 'mcq', q: '<strong>85 − 47</strong> = ?', options: ['38', '48', '28', '42'], answer: 0, explain: 'Borrow: 15−7=8, 7−4=3 → 38.' },
  { type: 'mcq', q: '<strong>63 − 29</strong> = ?', options: ['24', '34', '44', '32'], answer: 1, explain: 'Borrow: 13−9=4, 5−2=3 → 34.' },
  { type: 'mcq', q: '<strong>91 − 56</strong> = ?', options: ['25', '35', '45', '37'], answer: 1, explain: 'Borrow: 11−6=5, 8−5=3 → 35.' },
  { type: 'mcq', q: '<strong>54 − 27</strong> = ?', options: ['17', '27', '37', '23'], answer: 1, explain: 'Borrow: 14−7=7, 4−2=2 → 27.' },

  // ---------- Subtraction with borrowing (3-digit) ----------
  { type: 'mcq', q: '<strong>523 − 187</strong> = ?', options: ['326', '336', '346', '436'], answer: 1, explain: 'Borrow twice: 13−7=6, 11−8=3, 4−1=3 → 336.' },
  { type: 'mcq', q: '<strong>614 − 258</strong> = ?', options: ['346', '356', '366', '456'], answer: 1, explain: 'Borrow: 14−8=6, 10−5=5, 5−2=3 → 356.' },
  { type: 'mcq', q: '<strong>702 − 345</strong> = ?', options: ['347', '357', '367', '457'], answer: 1, explain: 'Borrow across the 0: 12−5=7, 9−4=5, 6−3=3 → 357.' },
  { type: 'mcq', q: '<strong>831 − 467</strong> = ?', options: ['354', '364', '374', '464'], answer: 1, explain: 'Borrow: 11−7=4, 12−6=6, 7−4=3 → 364.' },
  { type: 'mcq', q: '<strong>945 − 278</strong> = ?', options: ['657', '667', '677', '767'], answer: 1, explain: 'Borrow: 15−8=7, 13−7=6, 8−2=6 → 667.' },
  { type: 'mcq', q: '<strong>500 − 246</strong> = ?', options: ['244', '254', '264', '354'], answer: 1, explain: 'Borrow across two zeros: 10−6=4, 9−4=5, 4−2=2 → 254.' },
  { type: 'mcq', q: '<strong>403 − 158</strong> = ?', options: ['235', '245', '255', '345'], answer: 1, explain: 'Borrow across 0: 13−8=5, 9−5=4, 3−1=2 → 245.' },
  { type: 'mcq', q: '<strong>726 − 489</strong> = ?', options: ['227', '237', '247', '337'], answer: 1, explain: 'Borrow: 16−9=7, 11−8=3, 6−4=2 → 237.' },
  { type: 'mcq', q: '<strong>815 − 367</strong> = ?', options: ['438', '448', '458', '548'], answer: 1, explain: 'Borrow: 15−7=8, 10−6=4, 7−3=4 → 448.' },
  { type: 'mcq', q: '<strong>912 − 458</strong> = ?', options: ['444', '454', '464', '554'], answer: 1, explain: 'Borrow: 12−8=4, 10−5=5, 8−4=4 → 454.' },
  { type: 'mcq', q: '<strong>608 − 279</strong> = ?', options: ['319', '329', '339', '429'], answer: 1, explain: 'Borrow across 0: 18−9=9, 9−7=2, 5−2=3 → 329.' },
  { type: 'mcq', q: '<strong>734 − 568</strong> = ?', options: ['156', '166', '176', '266'], answer: 1, explain: 'Borrow: 14−8=6, 12−6=6, 6−5=1 → 166.' },

  // ---------- Subtraction with borrowing (4-digit) ----------
  { type: 'mcq', q: '<strong>5,234 − 2,768</strong> = ?', options: ['2,366', '2,466', '2,476', '2,566'], answer: 1, explain: 'Borrow through each place: 14−8=6, 12−6=6, 11−7=4, 4−2=2 → 2,466.' },
  { type: 'mcq', q: '<strong>7,142 − 3,587</strong> = ?', options: ['3,455', '3,555', '3,565', '3,655'], answer: 1, explain: 'Borrow each step: 12−7=5, 13−8=5, 10−5=5, 6−3=3 → 3,555.' },
  { type: 'mcq', q: '<strong>6,005 − 2,378</strong> = ?', options: ['3,527', '3,617', '3,627', '3,727'], answer: 2, explain: 'Borrow across zeros: 15−8=7, 9−7=2, 9−3=6, 5−2=3 → 3,627.' },
  { type: 'mcq', q: '<strong>8,326 − 4,759</strong> = ?', options: ['3,467', '3,567', '3,577', '3,667'], answer: 1, explain: 'Borrow each step: 16−9=7, 11−5=6, 12−7=5, 7−4=3 → 3,567.' },
  { type: 'mcq', q: '<strong>4,000 − 1,567</strong> = ?', options: ['2,333', '2,423', '2,433', '2,533'], answer: 2, explain: 'Borrow across all zeros: 10−7=3, 9−6=3, 9−5=4, 3−1=2 → 2,433.' },
  { type: 'mcq', q: '<strong>9,124 − 3,876</strong> = ?', options: ['5,148', '5,248', '5,258', '5,348'], answer: 1, explain: 'Borrow each step: 14−6=8, 11−7=4, 10−8=2, 8−3=5 → 5,248.' },
  { type: 'mcq', q: '<strong>3,508 − 1,679</strong> = ?', options: ['1,729', '1,819', '1,829', '1,929'], answer: 2, explain: 'Borrow: 18−9=9, 9−7=2, 4−6 (borrow) → 14−6=8, 2−1=1 → 1,829.' },
  { type: 'mcq', q: '<strong>5,600 − 2,475</strong> = ?', options: ['3,025', '3,115', '3,125', '3,225'], answer: 2, explain: 'Borrow across zeros: 10−5=5, 9−7=2, 5−4=1, 5−2=3 → 3,125.' },

  // ---------- Word problems ----------
  { type: 'mcq', q: 'Maya bought a school bag for <strong>₹485</strong> and a water bottle for <strong>₹276</strong>. How much did she spend in all?', options: ['₹661', '₹761', '₹771', '₹751'], answer: 1, explain: '485 + 276 = 761. So Maya spent ₹761.' },
  { type: 'mcq', q: 'The library at Aarav\'s school had <strong>3,256</strong> books. They added <strong>1,478</strong> new ones. How many books are there now?', options: ['4,634', '4,734', '4,724', '4,834'], answer: 1, explain: '3,256 + 1,478 = 4,734 books in total.' },
  { type: 'mcq', q: 'Krishna had <strong>250</strong> marbles. He gave <strong>87</strong> to his friend. How many are left?', options: ['153', '163', '173', '183'], answer: 1, explain: '250 − 87 = 163 marbles left.' },
  { type: 'mcq', q: 'Aisha\'s classroom has <strong>42</strong> girls and <strong>38</strong> boys. How many students in all?', options: ['70', '80', '90', '78'], answer: 1, explain: '42 + 38 = 80 students.' },
  { type: 'mcq', q: 'The train from Mumbai to Delhi covers <strong>1,384 km</strong>. After travelling <strong>789 km</strong>, how far is left?', options: ['495 km', '585 km', '595 km', '685 km'], answer: 2, explain: '1,384 − 789 = 595 km still to go.' },
  { type: 'mcq', q: 'Reyansh\'s mother bought groceries for <strong>₹1,250</strong> and gave a <strong>₹2,000</strong> note. How much change did she get?', options: ['₹650', '₹750', '₹850', '₹950'], answer: 1, explain: '2,000 − 1,250 = ₹750 change.' },
  { type: 'mcq', q: 'A garden has <strong>368</strong> rose plants and <strong>247</strong> jasmine plants. How many plants altogether?', options: ['515', '605', '615', '625'], answer: 2, explain: '368 + 247 = 615 plants.' },
  { type: 'mcq', q: 'Diya saved <strong>₹3,475</strong> last year and <strong>₹2,860</strong> this year. How much in total?', options: ['₹6,235', '₹6,335', '₹6,325', '₹6,435'], answer: 1, explain: '3,475 + 2,860 = ₹6,335 saved.' },
  { type: 'mcq', q: 'Kabir\'s school has <strong>1,250</strong> students. <strong>478</strong> are in the primary section. How many are NOT in primary?', options: ['672', '772', '782', '872'], answer: 1, explain: '1,250 − 478 = 772 students not in primary.' },
  { type: 'mcq', q: 'At the market, Zara\'s father bought vegetables for <strong>₹148</strong>, fruits for <strong>₹235</strong>, and rice for <strong>₹420</strong>. Total bill?', options: ['₹693', '₹793', '₹803', '₹813'], answer: 2, explain: '148 + 235 + 420 = ₹803 total.' },

  // ---------- True / False ----------
  { type: 'tf', q: 'When you add 0 to any number, the number stays the same.', answer: 1, explain: 'True — 0 is the additive identity. e.g. 47 + 0 = 47.' },
  { type: 'tf', q: '<strong>234 + 567 = 567 + 234</strong> (changing order doesn\'t change the sum).', answer: 1, explain: 'True — this is the commutative property of addition.' },
  { type: 'tf', q: 'Subtraction is also commutative: <strong>50 − 20 = 20 − 50</strong>.', answer: 0, explain: 'False — order matters in subtraction. 50 − 20 = 30, but 20 − 50 ≠ 30.' },
  { type: 'tf', q: 'Addition is the inverse of subtraction (they undo each other).', answer: 1, explain: 'True — if 8 + 5 = 13, then 13 − 5 = 8.' },
  { type: 'tf', q: 'When subtracting, the answer is always smaller than the larger number.', answer: 1, explain: 'True — e.g. 100 − 30 = 70, which is smaller than 100.' },

  // ---------- Fill in the blank (missing numbers) ----------
  { type: 'fill', q: 'Riya solved: <strong>456 + ____ = 789</strong>. The missing number is?', answer: ['333'], explain: '789 − 456 = 333.' },
  { type: 'fill', q: '<strong>____ − 248 = 175</strong>. Find the missing number.', answer: ['423'], explain: '175 + 248 = 423.' },
  { type: 'fill', q: 'Ishaan added: <strong>2,345 + 1,678 = ____</strong>', answer: ['4023', '4,023'], explain: '2,345 + 1,678 = 4,023.' },
  { type: 'fill', q: '<strong>9,000 − ____ = 4,567</strong>. Missing number?', answer: ['4433', '4,433'], explain: '9,000 − 4,567 = 4,433.' },
  { type: 'fill', q: 'Sum of <strong>378 + 219</strong> = ____ ?', answer: ['597'], explain: '378 + 219 = 597.' }
];
