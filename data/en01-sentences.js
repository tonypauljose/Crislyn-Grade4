/* ============================================================
   Crislyn's World — English Chapter 1: Kinds of Sentences
   Declarative, Interrogative, Exclamatory, Imperative.
   Punctuation, subject vs predicate, conversions.
   ============================================================ */

window.EN01_BANK = [
  // ---------- Identify the type ----------
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"The sun rises in the east."</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 0, explain: 'It states a fact and ends with a full stop — declarative.' },
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"What time is the bus?"</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 1, explain: 'It asks a question and ends with a question mark — interrogative.' },
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"Wow, what a beautiful sunset!"</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 2, explain: 'It shows strong feeling and ends with an exclamation mark — exclamatory.' },
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"Please close the door."</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 3, explain: 'It gives a polite command/request — imperative.' },
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"Stop running in the corridor!"</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 3, explain: 'It is an order/command — imperative (even with !).' },
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"How wonderful this cake tastes!"</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 2, explain: 'Strong feeling about the cake — exclamatory.' },
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"Crislyn loves drawing."</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 0, explain: 'A simple statement — declarative.' },
  { type: 'mcq', q: 'What kind of sentence is this?<br><em>"Do you like mangoes?"</em>', options: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], answer: 1, explain: 'It asks a yes/no question — interrogative.' },

  // ---------- Punctuation ----------
  { type: 'mcq', q: 'Which mark ends a <strong>declarative</strong> sentence?', options: ['?', '.', '!', ','], answer: 1, explain: 'A declarative sentence ends with a full stop (.).' },
  { type: 'mcq', q: 'Which mark ends an <strong>interrogative</strong> sentence?', options: ['.', '!', '?', ';'], answer: 2, explain: 'A question mark (?).' },
  { type: 'mcq', q: 'Which mark ends an <strong>exclamatory</strong> sentence?', options: ['.', '?', '!', ':'], answer: 2, explain: 'An exclamation mark (!).' },
  { type: 'mcq', q: 'Choose the correct ending mark:<br><em>"Where are my shoes ___"</em>', options: ['.', '?', '!', ','], answer: 1, explain: 'It is a question, so use a question mark.' },
  { type: 'mcq', q: 'Choose the correct ending mark:<br><em>"Hurry up ___"</em>', options: ['.', '?', '!', ';'], answer: 2, explain: 'It is a strong command — exclamation mark.' },
  { type: 'mcq', q: 'Choose the correct ending mark:<br><em>"My birthday is in May ___"</em>', options: ['.', '?', '!', ','], answer: 0, explain: 'A simple statement — full stop.' },

  // ---------- Subject and predicate ----------
  { type: 'mcq', q: 'In <em>"The cat is sleeping on the sofa,"</em> what is the <strong>subject</strong>?', options: ['The cat', 'is sleeping', 'on the sofa', 'sleeping on the sofa'], answer: 0, explain: 'The subject is who/what the sentence is about — "The cat".' },
  { type: 'mcq', q: 'In <em>"My brother plays the guitar,"</em> what is the <strong>predicate</strong>?', options: ['My brother', 'plays', 'plays the guitar', 'the guitar'], answer: 2, explain: 'The predicate tells what the subject does — "plays the guitar".' },
  { type: 'mcq', q: 'In imperative sentences, the subject is usually:', options: ['"He"', '"You" (understood)', '"They"', '"It"'], answer: 1, explain: 'In commands, the subject "you" is hidden — "(You) please sit down."' },

  // ---------- Conversion ----------
  { type: 'mcq', q: 'Change to interrogative: <em>"She is your friend."</em>', options: ['Is she your friend?', 'She is friend?', 'Friend she is?', 'She is your friend!'], answer: 0, explain: 'Move the helping verb (is) to the front and add a ?.' },
  { type: 'mcq', q: 'Change to declarative: <em>"Are you ready?"</em>', options: ['You are ready.', 'Ready you are.', 'You are ready?', 'Are you ready.'], answer: 0, explain: 'Move "are" back after "you" and end with a full stop.' },
  { type: 'mcq', q: 'Change to imperative: <em>"You should sit down."</em>', options: ['Sit down.', 'You sit down?', 'Sitting down.', 'Sit down, you?'], answer: 0, explain: 'Drop "you should" — "Sit down." is the order.' },
  { type: 'mcq', q: 'Change to exclamatory: <em>"It is a very beautiful day."</em>', options: ['Is it beautiful?', 'What a beautiful day it is!', 'Day is beautiful.', 'Beautiful day, it is.'], answer: 1, explain: 'Use "What a ___" or "How ___" with an exclamation mark.' },

  // ---------- Fill-in ----------
  { type: 'fill', q: 'A sentence that asks a question is called a/an ____ sentence.', answer: ['interrogative'], explain: 'Interrogative — from "interrogate" meaning to ask.' },
  { type: 'fill', q: 'A sentence that gives a command or request is a/an ____ sentence.', answer: ['imperative'], explain: 'Imperative sentences give orders, requests or instructions.' },
  { type: 'fill', q: 'A sentence that shows strong feeling is a/an ____ sentence.', answer: ['exclamatory'], explain: 'Exclamatory — usually starts with "What" or "How" and ends with !.' },
  { type: 'fill', q: 'A sentence that simply tells something is a/an ____ sentence.', answer: ['declarative'], explain: 'Declarative — just declares or states a fact.' },
  { type: 'fill', q: 'Add the missing punctuation: <em>"How tall this tree is __"</em>', answer: ['!'], explain: 'It is exclamatory — ends with an exclamation mark.' },
  { type: 'fill', q: 'Add the missing punctuation: <em>"Did you finish your homework __"</em>', answer: ['?'], explain: 'It asks a question — use a question mark.' },

  // ---------- True / False ----------
  { type: 'tf', q: 'Every sentence must begin with a capital letter.', answer: 0, explain: 'True — every sentence starts with a capital letter.' },
  { type: 'tf', q: 'A declarative sentence ends with an exclamation mark.', answer: 1, explain: 'False — it ends with a full stop.' },
  { type: 'tf', q: 'Exclamatory sentences often begin with "What" or "How".', answer: 0, explain: 'True — "What a lovely garden!", "How fast he runs!".' },
  { type: 'tf', q: 'In an imperative sentence, the subject "you" is usually written.', answer: 1, explain: 'False — the subject "you" is understood, not written.' },
  { type: 'tf', q: 'A group of words must express a complete thought to be a sentence.', answer: 0, explain: 'True — that is the basic definition of a sentence.' },
  { type: 'tf', q: '"Please pass the salt." is an imperative sentence.', answer: 0, explain: 'True — it is a polite request, which is imperative.' },
  { type: 'tf', q: '"Wow!" by itself is a complete exclamatory sentence.', answer: 1, explain: 'False — "Wow!" is an interjection, not a complete sentence with subject and predicate.' }
];
