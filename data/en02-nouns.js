/* ============================================================
   Crislyn's World — English Chapter 2: Nouns
   Common, Proper, Collective, Abstract, Material nouns.
   Singular ↔ Plural rules, Possessive forms.
   ============================================================ */

window.EN02_BANK = [
  // ---------- Identify the noun ----------
  { type: 'mcq', q: 'A noun is a word that names a:', options: ['action', 'feeling only', 'person, place, thing or idea', 'description'], answer: 2, explain: 'A noun names a person, place, thing, or idea.' },
  { type: 'mcq', q: 'Which word is a <strong>noun</strong> in this sentence?<br><em>"The clever fox jumped over the fence."</em>', options: ['clever', 'jumped', 'fox', 'over'], answer: 2, explain: '"Fox" names an animal — that is a noun.' },
  { type: 'mcq', q: 'Pick the noun: <em>Crislyn, run, fast, very</em>', options: ['run', 'fast', 'very', 'Crislyn'], answer: 3, explain: 'Crislyn is a person — a proper noun.' },

  // ---------- Common vs proper ----------
  { type: 'mcq', q: 'Which is a <strong>proper noun</strong>?', options: ['city', 'country', 'Bahrain', 'school'], answer: 2, explain: 'Bahrain is the name of a particular country — a proper noun. Proper nouns always start with a capital letter.' },
  { type: 'mcq', q: 'Which is a <strong>common noun</strong>?', options: ['Mumbai', 'Tuesday', 'river', 'October'], answer: 2, explain: '"River" names rivers in general — common noun. The others are specific names.' },
  { type: 'mcq', q: 'Which sentence has a <strong>proper noun</strong>?', options: ['The dog ran fast.', 'My teacher is kind.', 'She visited Delhi.', 'I love my school.'], answer: 2, explain: '"Delhi" is the specific name of a city — a proper noun.' },
  { type: 'tf', q: 'Proper nouns always begin with a capital letter.', answer: 0, explain: 'True — proper nouns always start with a capital letter, even in the middle of a sentence.' },

  // ---------- Collective ----------
  { type: 'mcq', q: 'A <strong>collective noun</strong> names:', options: ['One person', 'A group', 'A feeling', 'A material'], answer: 1, explain: 'Collective nouns name a group of people, animals or things.' },
  { type: 'mcq', q: 'Which is a <strong>collective noun</strong>?', options: ['girl', 'team', 'apple', 'love'], answer: 1, explain: '"Team" is a group of players — a collective noun.' },
  { type: 'mcq', q: 'A ____ of birds.', options: ['herd', 'flock', 'school', 'pack'], answer: 1, explain: 'A flock of birds. (A school of fish, a herd of cows, a pack of wolves.)' },
  { type: 'mcq', q: 'A ____ of fish.', options: ['flock', 'pack', 'school', 'bunch'], answer: 2, explain: 'A school of fish.' },
  { type: 'mcq', q: 'A ____ of grapes.', options: ['herd', 'bunch', 'flock', 'crowd'], answer: 1, explain: 'A bunch of grapes.' },
  { type: 'fill', q: 'A ____ of cows. (collective noun)', answer: ['herd'], explain: 'A herd of cows or cattle.' },

  // ---------- Abstract ----------
  { type: 'mcq', q: 'An <strong>abstract noun</strong> names something we:', options: ['can touch', 'can see clearly', 'cannot see or touch — feelings, ideas', 'can hear only'], answer: 2, explain: 'Abstract nouns name feelings, ideas, qualities — like love, courage, honesty.' },
  { type: 'mcq', q: 'Which of these is an <strong>abstract noun</strong>?', options: ['chair', 'happiness', 'horse', 'apple'], answer: 1, explain: 'Happiness is a feeling — abstract.' },
  { type: 'mcq', q: 'Pick the abstract noun: <em>book, kindness, river, dog</em>', options: ['book', 'kindness', 'river', 'dog'], answer: 1, explain: 'Kindness is a quality — abstract noun.' },

  // ---------- Material ----------
  { type: 'mcq', q: 'Which is a <strong>material noun</strong>?', options: ['team', 'gold', 'pride', 'Asia'], answer: 1, explain: 'Gold is a material/substance — a material noun.' },
  { type: 'mcq', q: 'Pick the material noun: <em>silver, joy, school, queen</em>', options: ['silver', 'joy', 'school', 'queen'], answer: 0, explain: 'Silver is a substance — material noun.' },

  // ---------- Singular / Plural ----------
  { type: 'mcq', q: 'Plural of <strong>baby</strong> is:', options: ['babys', 'babies', 'babyes', 'baby\'s'], answer: 1, explain: 'Words ending in consonant + y → drop the y, add ies. baby → babies.' },
  { type: 'mcq', q: 'Plural of <strong>bus</strong> is:', options: ['buss', 'bus', 'buses', 'busies'], answer: 2, explain: 'Words ending in s, x, ch, sh → add es. bus → buses.' },
  { type: 'mcq', q: 'Plural of <strong>knife</strong> is:', options: ['knifes', 'knives', 'knifs', 'knife\'s'], answer: 1, explain: 'Words ending in f or fe → change to ves. knife → knives.' },
  { type: 'mcq', q: 'Plural of <strong>child</strong> is:', options: ['childs', 'childes', 'children', 'childrens'], answer: 2, explain: 'Irregular plural — child → children.' },
  { type: 'mcq', q: 'Plural of <strong>foot</strong> is:', options: ['foots', 'feet', 'footes', 'feets'], answer: 1, explain: 'Irregular plural — foot → feet.' },
  { type: 'mcq', q: 'Plural of <strong>tooth</strong> is:', options: ['tooths', 'toothes', 'teeth', 'teeths'], answer: 2, explain: 'Irregular — tooth → teeth.' },
  { type: 'mcq', q: 'Plural of <strong>mouse</strong> (the animal) is:', options: ['mouses', 'mices', 'mice', 'mouse'], answer: 2, explain: 'Irregular — mouse → mice.' },
  { type: 'fill', q: 'Plural of <strong>box</strong> is ____ ?', answer: ['boxes'], explain: 'Ends in x → add es. box → boxes.' },
  { type: 'fill', q: 'Plural of <strong>leaf</strong> is ____ ?', answer: ['leaves'], explain: 'Ends in f → leaves.' },
  { type: 'fill', q: 'Plural of <strong>man</strong> is ____ ?', answer: ['men'], explain: 'Irregular — man → men.' },
  { type: 'fill', q: 'Plural of <strong>boy</strong> is ____ ?', answer: ['boys'], explain: 'Vowel + y → just add s. boy → boys.' },

  // ---------- Possessive ----------
  { type: 'mcq', q: 'Choose the correct possessive: <em>The ____ tail wagged happily.</em> (singular dog)', options: ['dogs', 'dog\'s', 'dogs\'', 'dog'], answer: 1, explain: 'For a singular noun, add \'s — dog\'s.' },
  { type: 'mcq', q: 'Choose the correct possessive: <em>The ____ uniforms are blue.</em> (more than one boy)', options: ['boys', 'boy\'s', 'boys\'', 'boys\'s'], answer: 2, explain: 'For a plural noun ending in s, add only an apostrophe — boys\'.' },
  { type: 'mcq', q: 'Possessive of <strong>children</strong> is:', options: ['childrens\'', 'children\'s', 'childrens', 'childrens\'s'], answer: 1, explain: 'Children is plural but does not end in s, so add \'s — children\'s.' },

  // ---------- True / False ----------
  { type: 'tf', q: 'Every noun is either common or proper.', answer: 0, explain: 'True — every noun is either common (general) or proper (specific name).' },
  { type: 'tf', q: '"Honesty" is a common noun.', answer: 1, explain: 'False — honesty is a quality you cannot touch, so it is an abstract noun.' },
  { type: 'tf', q: '"India" should always start with a capital letter.', answer: 0, explain: 'True — India is a proper noun.' },
  { type: 'tf', q: 'Plural of "ox" is "oxes".', answer: 1, explain: 'False — the plural of ox is oxen (irregular).' },
  { type: 'tf', q: 'Material nouns name substances like gold, silver, water.', answer: 0, explain: 'True — material nouns name materials/substances.' }
];
