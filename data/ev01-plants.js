/* ============================================================
   Crislyn's World — EVS Chapter 1: Roots, Flowers and Trees
   Plant parts, roots (tap/fibrous), stems, leaves, flowers,
   trees, photosynthesis basics, how plants help us.
   ============================================================ */

window.EV01_BANK = [
  // ---------- What plants need ----------
  { type: 'mcq', q: 'Which of these do plants <strong>NOT</strong> need to grow?', options: ['Sunlight', 'Water', 'Air', 'Plastic'], answer: 3, explain: 'Plants need sunlight, water, air, soil, and warmth — not plastic.' },
  { type: 'mcq', q: 'The food-making process in plants is called:', options: ['Digestion', 'Respiration', 'Photosynthesis', 'Germination'], answer: 2, explain: 'Photosynthesis — plants use sunlight, water and CO₂ to make food.' },
  { type: 'mcq', q: 'Plants take in ____ and give out ____.', options: ['oxygen … carbon dioxide', 'carbon dioxide … oxygen', 'water … sugar', 'soil … sunlight'], answer: 1, explain: 'During photosynthesis, plants absorb carbon dioxide and release oxygen.' },

  // ---------- Plant parts ----------
  { type: 'mcq', q: 'Which part of the plant is usually <strong>underground</strong>?', options: ['Stem', 'Leaf', 'Root', 'Flower'], answer: 2, explain: 'Roots grow underground and hold the plant in place.' },
  { type: 'mcq', q: 'The job of <strong>roots</strong> is to:', options: ['Make food', 'Give the plant colour', 'Hold the plant and absorb water', 'Help bees'], answer: 2, explain: 'Roots anchor the plant and absorb water and minerals from the soil.' },
  { type: 'mcq', q: 'The job of <strong>leaves</strong> is mainly to:', options: ['Hold the plant up', 'Make food using sunlight', 'Carry water down', 'Give nectar'], answer: 1, explain: 'Leaves are the food factories — they make food by photosynthesis.' },
  { type: 'mcq', q: 'The job of the <strong>stem</strong> is to:', options: ['Absorb sunlight', 'Make seeds', 'Hold the plant up and carry water/food', 'Attract butterflies'], answer: 2, explain: 'Stems support the plant and carry water and food between roots and leaves.' },
  { type: 'mcq', q: 'The part that becomes a fruit is the:', options: ['Root', 'Leaf', 'Flower', 'Stem'], answer: 2, explain: 'Flowers turn into fruits, which carry seeds.' },

  // ---------- Roots: tap vs fibrous ----------
  { type: 'mcq', q: 'A plant with one main long root and small branches is said to have a:', options: ['Fibrous root', 'Tap root', 'Climber root', 'Floating root'], answer: 1, explain: 'Tap root — one main thick root, like in mango or carrot.' },
  { type: 'mcq', q: 'A plant with many thin roots all from the base has a:', options: ['Tap root', 'Fibrous root', 'Single root', 'Air root'], answer: 1, explain: 'Fibrous roots — many thin roots, like in grass and wheat.' },
  { type: 'mcq', q: 'Which plant has a <strong>tap root</strong>?', options: ['Grass', 'Wheat', 'Carrot', 'Onion'], answer: 2, explain: 'Carrot is itself a tap root — one main thick root.' },
  { type: 'mcq', q: 'Which plant has <strong>fibrous roots</strong>?', options: ['Mango', 'Radish', 'Grass', 'Beetroot'], answer: 2, explain: 'Grass has fibrous (many thin) roots.' },
  { type: 'tf', q: 'A carrot is actually a kind of root we eat.', answer: 0, explain: 'True — carrot is a tap root that stores food.' },

  // ---------- Stems and leaves ----------
  { type: 'mcq', q: 'The tiny holes on a leaf that take in air are called:', options: ['Pores', 'Stomata', 'Veins', 'Petals'], answer: 1, explain: 'Stomata — small openings on leaves that let gases in and out.' },
  { type: 'mcq', q: 'Why are most leaves green?', options: ['Because of paint', 'Because of chlorophyll', 'Because of water', 'Because of soil'], answer: 1, explain: 'Leaves contain a green substance called chlorophyll, which helps make food.' },
  { type: 'tf', q: 'A weak stem that climbs up other plants is called a creeper.', answer: 1, explain: 'False — a weak stem that climbs is a climber. A creeper grows along the ground.' },

  // ---------- Flowers ----------
  { type: 'mcq', q: 'Which is <strong>NOT</strong> a part of a flower?', options: ['Petal', 'Sepal', 'Stamen', 'Root'], answer: 3, explain: 'Roots are not part of the flower — they are part of the plant.' },
  { type: 'mcq', q: 'The colourful part of a flower that attracts insects is the:', options: ['Sepal', 'Petal', 'Stem', 'Stamen'], answer: 1, explain: 'Petals are the colourful, attractive parts of a flower.' },
  { type: 'mcq', q: 'The green leaf-like part that protects the flower bud is the:', options: ['Stamen', 'Petal', 'Sepal', 'Pistil'], answer: 2, explain: 'Sepals protect the bud before it opens.' },

  // ---------- Trees ----------
  { type: 'mcq', q: 'Which of these is a tree?', options: ['Tomato plant', 'Banyan', 'Wheat', 'Rose'], answer: 1, explain: 'Banyan is a large tree. Rose is a shrub; wheat is a grass-like plant; tomato is a small plant.' },
  { type: 'mcq', q: 'Plants with weak woody stems shorter than trees are called:', options: ['Herbs', 'Shrubs', 'Climbers', 'Creepers'], answer: 1, explain: 'Shrubs are bushy plants with woody stems, smaller than trees.' },
  { type: 'mcq', q: 'A small green plant with a soft stem is called a:', options: ['Tree', 'Shrub', 'Herb', 'Climber'], answer: 2, explain: 'Herbs are small plants with soft (non-woody) stems — like mint and coriander.' },

  // ---------- How plants help us ----------
  { type: 'mcq', q: 'Which of these do we get from plants?', options: ['Wood', 'Cotton for clothes', 'Medicines', 'All of these'], answer: 3, explain: 'Plants give us food, wood, cotton, paper, medicines, and oxygen — and so much more!' },
  { type: 'mcq', q: 'Which gas do plants release that we breathe in?', options: ['Carbon dioxide', 'Hydrogen', 'Oxygen', 'Nitrogen'], answer: 2, explain: 'Plants release oxygen — the gas we need to breathe.' },
  { type: 'tf', q: 'Cutting down too many trees can harm the environment.', answer: 0, explain: 'True — fewer trees means less oxygen, more pollution, and less rainfall.' },

  // ---------- Fill in ----------
  { type: 'fill', q: 'The food-making process in green plants is called ____ .', answer: ['photosynthesis'], explain: 'Photosynthesis — light + water + CO₂ → food.' },
  { type: 'fill', q: 'The green colouring matter in leaves is called ____ .', answer: ['chlorophyll'], explain: 'Chlorophyll absorbs sunlight to make food.' },
  { type: 'fill', q: 'A plant with one main thick root has a ____ root.', answer: ['tap'], explain: 'Tap root — one main thick root with smaller branches.' },
  { type: 'fill', q: 'A flower\'s green protective covering is called the ____ .', answer: ['sepal', 'sepals'], explain: 'Sepals protect the flower bud.' },

  // ---------- True / False ----------
  { type: 'tf', q: 'All plants have flowers.', answer: 1, explain: 'False — some plants like ferns and mosses do not have flowers.' },
  { type: 'tf', q: 'Roots can sometimes store food, like in carrot or radish.', answer: 0, explain: 'True — these are food-storing tap roots.' },
  { type: 'tf', q: 'Plants make their own food.', answer: 0, explain: 'True — green plants make food during photosynthesis.' },
  { type: 'tf', q: 'A banyan tree is a herb.', answer: 1, explain: 'False — banyan is a large tree, not a herb.' },
  { type: 'tf', q: 'Bees help in pollination by carrying pollen from one flower to another.', answer: 0, explain: 'True — bees, butterflies and other insects help pollinate flowers.' }
];
