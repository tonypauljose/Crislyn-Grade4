/* ============================================================
   NUMBERS LAB — quiz banks, tiered by level
   explorer (gentle) · adventurer (Grade 5) · champion (stretch)
   answer = index into the options array (the quiz shuffles them).
   ============================================================ */
window.NLAB_QUIZ = {

  'number-detective': {
    explorer: [
      { q: 'In 372, which digit is in the tens place?', options: ['3', '7', '2', '0'], answer: 1, explain: 'Counting from the right: 2 is ones, 7 is tens, 3 is hundreds.' },
      { q: 'What is the value of the 4 in 458?', options: ['4', '40', '400', '4000'], answer: 2, explain: 'The 4 sits in the hundreds place, so it is worth 400.' },
      { q: 'Which is the expanded form of 250?', options: ['2 + 5 + 0', '200 + 50', '250 + 0', '25 + 0'], answer: 1, explain: '2 hundreds + 5 tens + 0 ones = 200 + 50.' },
      { q: 'Which number is greater?', options: ['89', '91', 'They are equal'], answer: 1, explain: '9 tens beats 8 tens, so 91 is greater.' },
      { q: 'How do we write “six hundred five”?', options: ['65', '650', '605', '6005'], answer: 2, explain: 'The 0 holds the tens place empty: 6-0-5.' }
    ],
    adventurer: [
      { q: 'In 47,830 the digit 7 is in which place?', options: ['hundreds', 'thousands', 'ten thousands', 'tens'], answer: 1, explain: '4 is ten-thousands, 7 is thousands.' },
      { q: 'What is the value of the 9 in 9,214?', options: ['9', '90', '900', '9000'], answer: 3, explain: 'The 9 is in the thousands place → 9000.' },
      { q: 'Expanded form of 6,043?', options: ['6000 + 43', '6000 + 400 + 3', '6000 + 40 + 3', '600 + 40 + 3'], answer: 2, explain: 'The 0 in hundreds contributes nothing: 6000 + 40 + 3.' },
      { q: 'Which is the largest?', options: ['12,345', '12,354', '12,435', '12,453'], answer: 3, explain: 'They share 12,4… then 5 tens-ish — compare place by place; 12,453 wins.' },
      { q: '70,000 + 200 + 50 + 1 = ?', options: ['7,251', '70,251', '72,051', '70,2510'], answer: 1, explain: 'Add the place values: 70,251.' }
    ],
    champion: [
      { q: 'In 3,06,42,000 (Indian system) the 6 is in which place?', options: ['lakhs', 'ten lakhs', 'crores', 'thousands'], answer: 0, explain: 'Reading right→left in groups: 6 sits in the lakhs place.' },
      { q: 'Which number rounds to 8,000 to the nearest thousand?', options: ['7,449', '7,501', '8,501', '8,950'], answer: 1, explain: '7,501 is past the halfway 7,500, so it rounds up to 8,000.' },
      { q: 'Standard form of “5 lakh 3 thousand 20”?', options: ['5,30,020', '5,03,020', '5,03,200', '53,020'], answer: 1, explain: '5 lakh = 5,00,000; + 3,000 + 20 = 5,03,020.' },
      { q: 'Which number has 7 in the ten-thousands place?', options: ['47,300', '74,300', '7,430', '17,000'], answer: 1, explain: 'In 74,300 the 7 is ten-thousands; in 47,300 the 7 is thousands.' },
      { q: '1 million equals how many lakhs?', options: ['1 lakh', '10 lakh', '100 lakh', '1000 lakh'], answer: 1, explain: '1,000,000 = 10,00,000 = 10 lakh.' }
    ]
  },

  'alignment-academy': {
    explorer: [
      { q: 'Adding 245 + 38, the 8 should sit under which digit of 245?', options: ['2', '4', '5', 'none'], answer: 2, explain: 'The 8 is ones, so it lines up under the 5 (the ones of 245).' },
      { q: 'We line numbers up on the…', options: ['left', 'right', 'middle', 'top'], answer: 1, explain: 'Right-align so the ones share one column.' },
      { q: 'We add the columns starting from the…', options: ['left', 'right', 'biggest', 'middle'], answer: 1, explain: 'Always start at the ones (right) and move left.' },
      { q: 'In a column sum, ones go under…', options: ['tens', 'hundreds', 'ones', 'the line'], answer: 2, explain: 'Ones under ones, tens under tens.' },
      { q: 'Lining up 60 + 5, the 5 goes under the…', options: ['6', '0', 'nothing'], answer: 1, explain: '5 is ones, and the ones of 60 is the 0.' }
    ],
    adventurer: [
      { q: 'To add 1,204 + 76, the 6 lines up under which digit?', options: ['1', '2', '0', '4'], answer: 3, explain: '6 is ones → under the 4 (ones of 1,204).' },
      { q: 'Why do we line numbers up on the right?', options: ['it looks neat', 'so each place value matches in its column', 'to save space', 'no real reason'], answer: 1, explain: 'Each column must hold the same place value.' },
      { q: 'For 35.6 + 4.25 we line up the…', options: ['first digits', 'decimal points', 'last digits', 'commas'], answer: 1, explain: 'Lining up the decimal points lines up all the places.' },
      { q: 'If a 7 ones is wrongly placed under the hundreds, the answer will be…', options: ['correct', 'too small', 'wrong', 'rounded'], answer: 2, explain: 'Mixing place values gives a wrong total.' },
      { q: 'In 503 − 27, the 7 lines up under the…', options: ['5', '0', '3', 'none'], answer: 2, explain: '7 is ones → under the 3 (ones of 503).' }
    ],
    champion: [
      { q: 'To subtract 1000 − 1, the borrowing carries across how many places?', options: ['1', '2', '3', '4'], answer: 2, explain: 'Borrow through hundreds, tens and ones → 999.' },
      { q: 'In 906 + 47, the digit 4 sits in which column?', options: ['ones', 'tens', 'hundreds', 'thousands'], answer: 1, explain: '47 = 4 tens + 7 ones, so 4 is in the tens column.' },
      { q: 'Lining up the decimal points, 12.5 + 7.25 = ?', options: ['19.30', '19.75', '19.7', '20'], answer: 1, explain: 'Treat 12.5 as 12.50; 12.50 + 7.25 = 19.75.' },
      { q: 'Right-alignment matters because the digits in each column must have the…', options: ['same colour', 'same place value', 'same shape', 'biggest value'], answer: 1, explain: 'Columns add place value to place value.' },
      { q: 'Multiplying 34 × 2 in columns, you first multiply 2 by the…', options: ['3 in the tens', '4 in the ones', 'whole 34 at once', 'decimal point'], answer: 1, explain: 'Start at the ones: 2 × 4, then 2 × 3 tens.' }
    ]
  },

  'binary-world': {
    explorer: [
      { q: 'Binary uses how many different digits?', options: ['1', '2', '8', '10'], answer: 1, explain: 'Just two: 0 and 1.' },
      { q: 'The digits of binary are…', options: ['0 and 1', '1 to 9', '0 to 9', 'A to F'], answer: 0, explain: 'Off = 0, On = 1.' },
      { q: 'The binary number 10 means which normal number?', options: ['ten', 'two', 'one', 'zero'], answer: 1, explain: 'One “2” and zero “1”s = 2.' },
      { q: 'A switch that is ON stands for…', options: ['0', '1', '2', 'off'], answer: 1, explain: 'On = 1, off = 0.' },
      { q: 'With switches worth 4, 2 and 1, turning on 4 and 1 makes…', options: ['5', '6', '7', '3'], answer: 0, explain: '4 + 1 = 5.' }
    ],
    adventurer: [
      { q: 'Binary 101 = ?', options: ['3', '5', '7', '9'], answer: 1, explain: '4 + 0 + 1 = 5.' },
      { q: 'Binary 1000 = ?', options: ['4', '8', '16', '2'], answer: 1, explain: 'The 1 sits in the “8” place.' },
      { q: 'What is 6 in binary?', options: ['110', '101', '011', '100'], answer: 0, explain: '6 = 4 + 2 = 110.' },
      { q: 'The place values in binary go…', options: ['1, 10, 100', '1, 2, 4, 8', '2, 4, 6, 8', '1, 5, 10'], answer: 1, explain: 'Each place doubles: powers of two.' },
      { q: 'With 4 switches, the biggest number you can make is…', options: ['8', '15', '16', '31'], answer: 1, explain: '8 + 4 + 2 + 1 = 15.' }
    ],
    champion: [
      { q: 'Binary 11011 = ?', options: ['27', '25', '22', '19'], answer: 0, explain: '16 + 8 + 0 + 2 + 1 = 27.' },
      { q: 'What is 21 in binary?', options: ['10101', '11001', '10011', '10110'], answer: 0, explain: '16 + 4 + 1 = 10101.' },
      { q: 'With 5 bits, the largest value is…', options: ['15', '31', '32', '63'], answer: 1, explain: '16 + 8 + 4 + 2 + 1 = 31.' },
      { q: 'The letter “A” is stored as 65 = binary 1000001. How many bits is that?', options: ['6', '7', '8', '5'], answer: 1, explain: '1000001 has seven digits.' },
      { q: 'Each extra binary switch ___ the count of numbers you can make.', options: ['doubles', 'adds one to', 'halves', 'triples'], answer: 0, explain: 'One more bit doubles the range.' }
    ]
  },

  'hex-colour-lab': {
    explorer: [
      { q: 'Hex uses how many digits?', options: ['10', '12', '16', '8'], answer: 2, explain: '0–9 and A–F makes sixteen.' },
      { q: 'After 9, hex carries on with…', options: ['letters A–F', '10', '00', 'symbols'], answer: 0, explain: 'A=10, B=11 … F=15.' },
      { q: 'In hex, the letter F means…', options: ['5', '15', '16', '50'], answer: 1, explain: 'F is the 16th digit, worth 15.' },
      { q: 'A colour code like #FF0000 looks mostly…', options: ['red', 'green', 'blue', 'black'], answer: 0, explain: 'FF red, 00 green, 00 blue → red.' },
      { q: 'In #RRGGBB, the middle pair GG controls…', options: ['red', 'green', 'blue', 'brightness'], answer: 1, explain: 'RR = red, GG = green, BB = blue.' }
    ],
    adventurer: [
      { q: 'Hex A equals…', options: ['10', '11', '12', '1'], answer: 0, explain: 'A is the digit after 9, worth 10.' },
      { q: 'What colour is #00FF00?', options: ['red', 'green', 'blue', 'yellow'], answer: 1, explain: 'No red, full green, no blue.' },
      { q: 'FF in decimal is…', options: ['15', '100', '255', '256'], answer: 2, explain: 'F×16 + F = 15×16 + 15 = 255.' },
      { q: 'One hex digit equals how many bits?', options: ['2', '3', '4', '8'], answer: 2, explain: '16 = 2⁴, so one hex digit = 4 bits.' },
      { q: '#000000 is which colour?', options: ['white', 'black', 'red', 'grey'], answer: 1, explain: 'No red, green or blue → black.' }
    ],
    champion: [
      { q: 'Why is hex so handy for computers?', options: ['16 = 2⁴, so 1 hex digit = 4 bits', 'it is colourful', 'it has letters', 'it sounds cool'], answer: 0, explain: 'Hex packs 4 binary bits into one neat digit.' },
      { q: 'Hex 1F in decimal is…', options: ['16', '31', '15', '21'], answer: 1, explain: '1×16 + 15 = 31.' },
      { q: '#FFFFFF is which colour?', options: ['black', 'white', 'red', 'blue'], answer: 1, explain: 'Full red + full green + full blue = white.' },
      { q: 'Binary 1111 1111 written in hex is…', options: ['FF', '88', 'F8', '11'], answer: 0, explain: 'Each group 1111 = F, so FF.' },
      { q: 'The colour #FFFF00 (full red + green, no blue) looks…', options: ['yellow', 'purple', 'cyan', 'orange'], answer: 0, explain: 'Red and green light mix to yellow.' }
    ]
  }
};
