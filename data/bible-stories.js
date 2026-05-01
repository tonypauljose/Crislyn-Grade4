/* ============================================================
   Crislyn's World — Bible Stories (Storybook reader)

   Two pools:
   - friday[]   : Catholic catechism stories shown on Fridays
   - weekday[]  : Bible narrative + Psalms shown the other 6 days

   Each entry is a tiny picture-book of 3-6 pages. Page `bg` tokens
   are styled in css/components.css under .storybook-panel[data-bg="..."].

   Add more stories anytime by appending to either array — the
   rotation in js/bible-of-day.js cycles through whatever's there.

   First batch (May 2026): 8 Friday Beatitudes + 30 weekday stories.
   ============================================================ */

window.BIBLE_STORIES = {

  /* ======================================================
     WEEKDAY POOL — Old Testament, Gospels, Parables, Psalms
     ====================================================== */
  weekday: [

    // ---- Old Testament narrative ----

    { book: 'Genesis', ref: '1:1–5', title: 'God Makes the Light', theme: 'wisdom', friday: false,
      pages: [
        { scene: 'In the beginning', emoji: '🌌', bg: 'night',
          text: 'In the very, very beginning — before there were stars, or trees, or even one tiny ant — there was God. The whole world was empty and dark.' },
        { scene: 'God speaks', emoji: '✨', bg: 'dawn',
          text: 'Then God said three little words: "Let there be light!" And whoosh! — bright, beautiful light filled the dark.' },
        { scene: 'Day and night', emoji: '🌅', bg: 'sky',
          text: 'God looked at the light and said, "This is good." He called the light "Day," and the darkness He called "Night."' },
        { scene: 'The first day', emoji: '☀️', bg: 'gold',
          text: 'And that was the very first day — the day God made everything brighter just by saying so. His words are powerful!' }
      ],
      anchorVerse: 'God said, "Let there be light," and there was light.',
      anchorRef: 'Genesis 1:3',
      reflection: 'God made light just by speaking. Even a small "yes" to Him can make our day brighter.'
    },

    { book: 'Genesis', ref: '2:8–25', title: 'The Garden of Eden', theme: 'gratitude', friday: false,
      pages: [
        { scene: 'A perfect garden', emoji: '🌳', bg: 'garden',
          text: 'God made a beautiful garden called Eden. It had every tree you can imagine — apple trees, fig trees, trees with sweet fruit hanging low.' },
        { scene: 'God makes Adam', emoji: '🧍', bg: 'meadow',
          text: 'Then God scooped up some earth and made a man named Adam. He breathed life into him — and Adam stood up, alive and smiling.' },
        { scene: 'A friend for Adam', emoji: '👫', bg: 'garden',
          text: 'Adam was lonely, so God made a woman named Eve. Now they had each other! They walked through the garden, talking with God in the cool of the day.' },
        { scene: 'Everything was good', emoji: '🌷', bg: 'meadow',
          text: 'There was no sadness, no fighting, no fear. Just God, the people He loved, and a garden full of His goodness.' }
      ],
      anchorVerse: 'God saw all that He had made, and it was very good.',
      anchorRef: 'Genesis 1:31',
      reflection: 'God made the world full of good things — for us to enjoy and to take care of.'
    },

    { book: 'Genesis', ref: '6:9–9:17', title: 'Noah Builds the Big Boat', theme: 'trust', friday: false,
      pages: [
        { scene: 'A world full of trouble', emoji: '🌍', bg: 'dusk',
          text: 'Long, long ago, the world was full of people doing bad things. But there was one good man named Noah. Noah loved God with his whole heart.' },
        { scene: 'God speaks to Noah', emoji: '☁️', bg: 'sky',
          text: 'God said, "Noah, build a great big boat. A flood is coming, and I want to keep you safe." Noah listened.' },
        { scene: 'Building the ark', emoji: '🪵', bg: 'wood',
          text: 'Noah worked hard for many years. He cut wood. He hammered nails. Slowly, the giant boat — the ark — took shape.' },
        { scene: 'Two by two', emoji: '🦁', bg: 'meadow',
          text: 'Then the animals came — two of every kind! Lions, elephants, rabbits, butterflies, even tiny ants. They all walked into the ark together.' },
        { scene: 'Forty days of rain', emoji: '🌧️', bg: 'rain',
          text: 'It rained for forty days and forty nights. But Noah, his family, and all the animals were safe inside. God was taking care of them.' },
        { scene: 'A rainbow promise', emoji: '🌈', bg: 'rainbow',
          text: 'When the rain stopped, God put a beautiful rainbow in the sky. It was His promise: "I will always take care of you."' }
      ],
      anchorVerse: 'I will set my rainbow in the clouds, and it will be a sign of my promise.',
      anchorRef: 'Genesis 9:13',
      reflection: 'When we listen to God, He keeps us safe — even when things look scary.'
    },

    { book: 'Genesis', ref: '15:1–6', title: 'Abraham Looks at the Stars', theme: 'trust', friday: false,
      pages: [
        { scene: 'A sad wish', emoji: '🏜️', bg: 'desert',
          text: 'Abraham was an old man. He and his wife Sarah had no children, and that made them very sad. They wanted a big family more than anything.' },
        { scene: 'God leads Abraham outside', emoji: '🌌', bg: 'night',
          text: 'One night, God said, "Abraham, come outside." Abraham looked up at the dark sky, and oh — there were SO many stars!' },
        { scene: 'A huge promise', emoji: '⭐', bg: 'night',
          text: '"Count the stars," said God. "Try to! Your family will be that big — more than you can count."' },
        { scene: 'Abraham believes', emoji: '🤝', bg: 'sky',
          text: 'Abraham looked at God. He believed. And God smiled, because Abraham trusted Him even when it seemed impossible.' }
      ],
      anchorVerse: 'Look up at the sky and count the stars — so shall your family be.',
      anchorRef: 'Genesis 15:5',
      reflection: 'God can do bigger things than we can imagine. Trust Him, even when it feels too good to be true.'
    },

    { book: 'Genesis', ref: '37:1–11', title: 'Joseph\'s Beautiful Coat', theme: 'wisdom', friday: false,
      pages: [
        { scene: 'A father\'s favourite', emoji: '👦', bg: 'wood',
          text: 'Joseph was the youngest son in his family. His dad Jacob loved him very much, and gave him a beautiful coat with bright colours — like a rainbow.' },
        { scene: 'His brothers feel jealous', emoji: '😠', bg: 'dusk',
          text: 'Joseph\'s brothers saw the coat and grumbled. "Why does Dad love HIM more?" they whispered. They began to feel jealous and angry.' },
        { scene: 'A strange dream', emoji: '🌟', bg: 'night',
          text: 'One night Joseph had a dream: "I saw the sun, the moon, and eleven stars bowing down to me!" His brothers grumbled even more.' },
        { scene: 'A plan in God\'s heart', emoji: '🌅', bg: 'dawn',
          text: 'They didn\'t know it yet, but God had big plans for Joseph. Even when life looked hard, God was at work — quietly, lovingly.' }
      ],
      anchorVerse: 'You meant evil against me, but God meant it for good.',
      anchorRef: 'Genesis 50:20',
      reflection: 'Even when other people don\'t understand us, God always does — and He has good plans.'
    },

    { book: 'Exodus', ref: '3:1–10', title: 'Moses and the Burning Bush', theme: 'courage', friday: false,
      pages: [
        { scene: 'Moses keeps sheep', emoji: '🐑', bg: 'meadow',
          text: 'Moses was looking after sheep on a quiet mountain. The wind blew softly. The sheep nibbled the grass.' },
        { scene: 'A bush on fire!', emoji: '🔥', bg: 'fire',
          text: 'Suddenly, Moses saw a bush full of bright fire — but the bush was not burning up! He stepped closer. "What a strange sight," he whispered.' },
        { scene: 'God calls his name', emoji: '👂', bg: 'fire',
          text: '"Moses! Moses!" said a voice from the flames. It was God! Moses took off his sandals — this was holy ground.' },
        { scene: 'A big mission', emoji: '🌅', bg: 'dawn',
          text: '"Moses, I see my people are sad and stuck in Egypt. I want you to go and lead them to freedom." Moses was scared, but God said, "I will be with you."' }
      ],
      anchorVerse: 'I will be with you.',
      anchorRef: 'Exodus 3:12',
      reflection: 'God doesn\'t need us to be brave or strong on our own — He goes with us.'
    },

    { book: 'Exodus', ref: '14:10–31', title: 'Crossing the Red Sea', theme: 'courage', friday: false,
      pages: [
        { scene: 'Stuck at the sea', emoji: '🌊', bg: 'water',
          text: 'God\'s people were running away from Pharaoh\'s army. But suddenly — they hit the Red Sea! No way forward. No way back. They were trapped!' },
        { scene: 'Moses lifts his stick', emoji: '🪄', bg: 'water',
          text: 'Moses said, "Don\'t be afraid! Watch what God will do." He raised his walking stick over the sea.' },
        { scene: 'The sea splits open', emoji: '〰️', bg: 'water',
          text: 'A strong wind blew all night. The water — splash! — split into two huge walls, and a dry path opened down the middle of the sea!' },
        { scene: 'Walking through', emoji: '🚶', bg: 'sky',
          text: 'God\'s people walked safely across, between the walls of water. On the other side, they sang and danced. God had made a way where there was no way.' }
      ],
      anchorVerse: 'Do not be afraid. The Lord will fight for you.',
      anchorRef: 'Exodus 14:13–14',
      reflection: 'When you feel stuck, remember: God can make a path even where there isn\'t one.'
    },

    { book: '1 Samuel', ref: '17:1–50', title: 'David and Goliath', theme: 'courage', friday: false,
      pages: [
        { scene: 'A scary giant', emoji: '🗡️', bg: 'desert',
          text: 'A huge giant named Goliath was scaring everyone. He was nine feet tall! All the soldiers were too afraid to fight him.' },
        { scene: 'A boy with a sling', emoji: '🐑', bg: 'meadow',
          text: 'A young shepherd boy named David came to the camp. He was small, but he wasn\'t afraid. "I will fight Goliath!" he said. "God is with me."' },
        { scene: 'Five smooth stones', emoji: '🪨', bg: 'water',
          text: 'David picked up five smooth stones from a stream. He put one in his sling. Goliath laughed at him: "You\'re just a kid!"' },
        { scene: 'The giant falls', emoji: '💥', bg: 'gold',
          text: 'David ran toward the giant and — whoosh! — flung a stone. It hit Goliath right on the forehead. The giant fell. God had used a small boy to win a big battle!' }
      ],
      anchorVerse: 'The battle is the Lord\'s.',
      anchorRef: '1 Samuel 17:47',
      reflection: 'You don\'t have to be the biggest or strongest. With God on your side, you are enough.'
    },

    { book: 'Daniel', ref: '6:1–24', title: 'Daniel in the Lions\' Den', theme: 'courage', friday: false,
      pages: [
        { scene: 'Daniel loves to pray', emoji: '🙏', bg: 'dawn',
          text: 'Daniel was a good man who loved God. Three times every day he went to his window and prayed.' },
        { scene: 'A bad rule', emoji: '📜', bg: 'dusk',
          text: 'Some jealous men made a new rule: "No one can pray to anyone except the king for thirty days!" But Daniel kept praying to God anyway.' },
        { scene: 'Into the lions\' den', emoji: '🦁', bg: 'desert',
          text: 'They threw Daniel into a deep den full of hungry lions. The king was sad — but Daniel wasn\'t afraid. He trusted God.' },
        { scene: 'Lions like kittens', emoji: '😴', bg: 'night',
          text: 'All night long, the lions didn\'t even open their mouths! In the morning, the king found Daniel safe. God had sent an angel to keep him safe!' }
      ],
      anchorVerse: 'My God sent his angel and shut the lions\' mouths.',
      anchorRef: 'Daniel 6:22',
      reflection: 'Keep doing what\'s right, even when it\'s hard. God protects those who love Him.'
    },

    { book: 'Jonah', ref: '1:1–3:10', title: 'Jonah and the Big Fish', theme: 'wisdom', friday: false,
      pages: [
        { scene: 'Jonah runs away', emoji: '⛵', bg: 'water',
          text: 'God told Jonah, "Go warn the city of Nineveh!" But Jonah didn\'t want to. He got on a boat heading the OTHER way!' },
        { scene: 'A wild storm', emoji: '🌊', bg: 'rain',
          text: 'A huge storm rocked the boat. The sailors were terrified! Jonah said, "It\'s my fault — I\'m running from God. Throw me into the sea!"' },
        { scene: 'Swallowed by a fish', emoji: '🐳', bg: 'water',
          text: 'They threw Jonah in — and a HUGE fish swallowed him whole! For three days and three nights, Jonah sat inside the fish, praying and saying sorry to God.' },
        { scene: 'A second chance', emoji: '🌅', bg: 'dawn',
          text: 'The fish spit Jonah out on the beach. Jonah got up and went to Nineveh — this time! He told them about God, and the city listened.' }
      ],
      anchorVerse: 'You are a gracious and merciful God.',
      anchorRef: 'Jonah 4:2',
      reflection: 'It\'s never too late to say sorry to God. He always gives second chances.'
    },

    // ---- Christmas / Gospels ----

    { book: 'Luke', ref: '1:26–38', title: 'Mary Says Yes to God', theme: 'love', friday: false,
      pages: [
        { scene: 'A young girl named Mary', emoji: '👧', bg: 'garden',
          text: 'Mary was a young Jewish girl who loved God. One day, she was alone in her room when something amazing happened.' },
        { scene: 'An angel appears', emoji: '👼', bg: 'gold',
          text: 'The angel Gabriel stood before her! "Hail Mary, full of grace!" he said. Mary was shocked. "Don\'t be afraid," the angel told her gently.' },
        { scene: 'A surprising message', emoji: '✨', bg: 'sky',
          text: '"You will have a baby — God\'s own Son. You will name Him Jesus." Mary asked, "How can this be?" The angel smiled: "Nothing is impossible with God."' },
        { scene: 'Mary\'s big yes', emoji: '🤍', bg: 'dawn',
          text: 'Mary thought for a moment. Then she said, "I am God\'s servant. Let it be done as you have said." With that little YES, the world began to change.' }
      ],
      anchorVerse: 'I am the Lord\'s servant. May it be to me as you have said.',
      anchorRef: 'Luke 1:38',
      reflection: 'Even a small "yes" to God, said with love, can change the whole world.'
    },

    { book: 'Luke', ref: '2:1–7', title: 'Baby Jesus is Born', theme: 'love', friday: false,
      pages: [
        { scene: 'A long journey', emoji: '🐴', bg: 'dusk',
          text: 'Mary and Joseph had to travel to a town called Bethlehem. Mary was very tired — the baby was almost ready to come.' },
        { scene: 'No room at the inn', emoji: '🚪', bg: 'night',
          text: 'They knocked on every door, but every house was full. "No room! No room!" Finally, a kind innkeeper said, "You can sleep in the stable with the animals."' },
        { scene: 'Born in a stable', emoji: '👶', bg: 'gold',
          text: 'That night, Baby Jesus was born! Mary wrapped Him in soft cloths and laid Him in a manger — the wooden box where the animals ate their food.' },
        { scene: 'The Saviour has come', emoji: '⭐', bg: 'night',
          text: 'God\'s own Son came into our world — not in a palace, but in a stable. Quietly. Humbly. Full of love. The greatest gift the world has ever known.' }
      ],
      anchorVerse: 'Today in the town of David a Saviour has been born to you; He is Christ the Lord.',
      anchorRef: 'Luke 2:11',
      reflection: 'God came to us in the smallest, gentlest way — to show us how much He loves us.'
    },

    { book: 'Luke', ref: '2:8–20', title: 'The Shepherds Find Jesus', theme: 'gratitude', friday: false,
      pages: [
        { scene: 'Quiet shepherds', emoji: '🐑', bg: 'meadow',
          text: 'In the fields outside Bethlehem, shepherds were watching their sheep at night. The stars twinkled. The sheep were sleepy.' },
        { scene: 'A bright angel', emoji: '👼', bg: 'gold',
          text: 'Suddenly, a bright angel appeared! The shepherds were terrified. "Don\'t be afraid! I bring you good news of great joy — a Saviour has been born!"' },
        { scene: 'A choir in the sky', emoji: '🎶', bg: 'sky',
          text: 'Then the whole sky filled with angels singing: "Glory to God in the highest!" The shepherds had never seen anything so beautiful.' },
        { scene: 'They run to the stable', emoji: '✨', bg: 'gold',
          text: 'The shepherds ran to Bethlehem and found Mary, Joseph, and Baby Jesus in the manger. They bowed down — these simple shepherds were the first visitors of the King of Kings!' }
      ],
      anchorVerse: 'Glory to God in the highest, and on earth peace to all people.',
      anchorRef: 'Luke 2:14',
      reflection: 'God invites everyone — even the simplest people — to come close to Jesus.'
    },

    { book: 'Luke', ref: '2:41–52', title: 'Boy Jesus in the Temple', theme: 'wisdom', friday: false,
      pages: [
        { scene: 'A trip to Jerusalem', emoji: '🚶', bg: 'desert',
          text: 'When Jesus was 12 years old, He went with Mary and Joseph to Jerusalem for a big festival. They walked together with many other families.' },
        { scene: 'Lost!', emoji: '😟', bg: 'dusk',
          text: 'On the way home, Mary and Joseph realized — Jesus wasn\'t with them! They searched for three whole days. Mary\'s heart was so worried.' },
        { scene: 'Found in the temple', emoji: '🏛️', bg: 'gold',
          text: 'They found Jesus in the temple, sitting with the wise teachers, asking questions and giving answers. Everyone was amazed at how much He understood.' },
        { scene: 'Going home together', emoji: '🏡', bg: 'dawn',
          text: '"Why were you looking for me? I had to be in my Father\'s house." Then Jesus went home with them and obeyed His parents, growing in wisdom and grace.' }
      ],
      anchorVerse: 'Jesus grew in wisdom and stature, and in favour with God and people.',
      anchorRef: 'Luke 2:52',
      reflection: 'Even Jesus learned and grew. Asking good questions is part of getting wiser.'
    },

    { book: 'Mark', ref: '4:35–41', title: 'Jesus Calms the Storm', theme: 'peace', friday: false,
      pages: [
        { scene: 'A boat on the lake', emoji: '⛵', bg: 'water',
          text: 'Jesus and His disciples were sailing across a big lake. Jesus was tired, so He fell fast asleep on a cushion in the back of the boat.' },
        { scene: 'A scary storm', emoji: '🌊', bg: 'rain',
          text: 'Suddenly, a wild storm whipped up! Huge waves crashed over the boat. The disciples were terrified — but Jesus was still asleep!' },
        { scene: '"Don\'t you care?"', emoji: '😱', bg: 'rain',
          text: 'They shook Him awake. "Master! Don\'t you care that we\'re drowning?!" Jesus stood up calmly, looked at the storm, and said, "Peace! Be still!"' },
        { scene: 'The storm obeys', emoji: '🌅', bg: 'dawn',
          text: 'And just like that — the wind stopped. The waves smoothed out. Everything was quiet. The disciples whispered, "Even the wind and waves listen to Him!"' }
      ],
      anchorVerse: 'Peace, be still!',
      anchorRef: 'Mark 4:39',
      reflection: 'When life feels stormy, Jesus is right there. He can bring peace to anything.'
    },

    { book: 'John', ref: '6:1–14', title: 'Jesus Feeds 5,000 People', theme: 'gratitude', friday: false,
      pages: [
        { scene: 'A big, hungry crowd', emoji: '👥', bg: 'meadow',
          text: 'Five thousand people had come to listen to Jesus. They listened all day! By evening, everyone was very, very hungry.' },
        { scene: 'A small lunch', emoji: '🥖', bg: 'bread',
          text: 'A little boy stepped forward shyly. He had five small loaves of bread and two little fish — his lunch. "You can have it," he said.' },
        { scene: 'Jesus says thank you', emoji: '🙏', bg: 'gold',
          text: 'Jesus took the small lunch, looked up to heaven, and gave thanks to God. Then He started breaking the bread into pieces.' },
        { scene: 'Plenty for everyone!', emoji: '🍞', bg: 'gold',
          text: 'The bread and fish kept coming! Every single person ate until they were full. There were even twelve baskets of leftovers! A little, given to Jesus, became a lot.' }
      ],
      anchorVerse: 'They all ate and were satisfied.',
      anchorRef: 'John 6:12',
      reflection: 'When we give the little we have to Jesus, He makes it more than enough.'
    },

    { book: 'Matthew', ref: '14:22–33', title: 'Jesus Walks on Water', theme: 'trust', friday: false,
      pages: [
        { scene: 'A boat at night', emoji: '⛵', bg: 'night',
          text: 'The disciples were rowing across the lake at night. The waves were rough. The wind was strong. They were tired and a little scared.' },
        { scene: 'Someone on the water!', emoji: '👤', bg: 'water',
          text: 'Then they saw something amazing — Jesus was walking on the water! "It\'s a ghost!" they cried. But Jesus called, "Don\'t be afraid. It\'s me!"' },
        { scene: 'Peter steps out', emoji: '🦶', bg: 'water',
          text: 'Peter said, "If it\'s really you, let me come too!" Jesus said, "Come!" Peter stepped out of the boat — and he walked on the water!' },
        { scene: 'A helping hand', emoji: '🤝', bg: 'water',
          text: 'But Peter looked at the waves and started to sink. "Help, Lord!" he cried. Jesus reached out and caught him. "Why did you doubt? I\'m right here."' }
      ],
      anchorVerse: 'Take courage. It is I. Don\'t be afraid.',
      anchorRef: 'Matthew 14:27',
      reflection: 'Keep your eyes on Jesus, not on the waves. He is always there to catch you.'
    },

    { book: 'Luke', ref: '10:25–37', title: 'The Good Samaritan', theme: 'love', friday: false,
      pages: [
        { scene: 'A traveller in trouble', emoji: '🛤️', bg: 'desert',
          text: 'A man was walking down a long, lonely road when robbers jumped out and hurt him. They left him by the side of the road, all alone.' },
        { scene: 'Two people walk by', emoji: '🚶', bg: 'desert',
          text: 'A priest came walking by. He saw the hurt man — and walked past on the other side. Then a temple helper came. He looked, and walked past too!' },
        { scene: 'A kind stranger', emoji: '💚', bg: 'meadow',
          text: 'Then a Samaritan man came along. (Samaritans and Jews didn\'t usually get along.) But this Samaritan stopped. He cleaned the man\'s wounds and helped him up.' },
        { scene: 'Loving like that', emoji: '🏨', bg: 'dawn',
          text: 'He took the man to an inn, paid for everything, and made sure he got better. Jesus said, "Go and love like that." A neighbour is anyone who needs your help.' }
      ],
      anchorVerse: 'Love your neighbour as yourself.',
      anchorRef: 'Luke 10:27',
      reflection: 'Anyone who needs your help is your neighbour. Be kind, even when it\'s not easy.'
    },

    { book: 'Luke', ref: '15:11–32', title: 'The Boy Who Came Home', theme: 'love', friday: false,
      pages: [
        { scene: 'A son leaves home', emoji: '🎒', bg: 'dawn',
          text: 'A young man asked his father for his share of the family money. He took it, packed his bags, and left for a faraway country.' },
        { scene: 'Money all gone', emoji: '🐷', bg: 'wood',
          text: 'He spent everything on silly things. Soon he had nothing left! He had to feed pigs to earn food. He sat among the pigs, hungry and lonely.' },
        { scene: 'Going home', emoji: '🚶', bg: 'desert',
          text: '"My father\'s servants have plenty to eat," he thought. "I\'ll go home and say I\'m sorry. Maybe I can be a servant." So he started the long walk home.' },
        { scene: 'A father\'s big hug', emoji: '🤗', bg: 'gold',
          text: 'But while he was still far away, his father saw him! The father RAN to him, hugged him, and threw a big party. "My son was lost — but now he\'s found!"' }
      ],
      anchorVerse: 'This son of mine was lost and is found!',
      anchorRef: 'Luke 15:24',
      reflection: 'God is like that father. No matter what we\'ve done, He runs to welcome us home.'
    },

    { book: 'Luke', ref: '15:1–7', title: 'The Lost Sheep', theme: 'love', friday: false,
      pages: [
        { scene: 'Counting the sheep', emoji: '🐑', bg: 'meadow',
          text: 'A shepherd had one hundred sheep. Every evening he counted them: one, two, three… ninety-eight, ninety-nine. Wait — only ninety-nine!' },
        { scene: 'One is missing', emoji: '🌙', bg: 'dusk',
          text: 'One little sheep had wandered off! The shepherd left the ninety-nine safe in the field and went out to look for the lost one.' },
        { scene: 'Searching everywhere', emoji: '🔦', bg: 'night',
          text: 'He searched up the rocky hills and down through dark valleys. "Little sheep! Little sheep!" he called.' },
        { scene: 'Carried home with joy', emoji: '😊', bg: 'gold',
          text: 'At last, he found the lost sheep stuck in some bushes. He gently lifted it onto his shoulders and carried it home, smiling all the way. "I found my sheep!"' }
      ],
      anchorVerse: 'Rejoice with me; I have found my lost sheep!',
      anchorRef: 'Luke 15:6',
      reflection: 'God loves every single one of us. If we ever wander off, He comes looking.'
    },

    { book: 'Matthew', ref: '13:31–32', title: 'The Tiny Mustard Seed', theme: 'hope', friday: false,
      pages: [
        { scene: 'A teeny tiny seed', emoji: '🌱', bg: 'meadow',
          text: 'Jesus held up a mustard seed — the smallest seed you can imagine, no bigger than a grain of sand. "What can a seed this small do?" people wondered.' },
        { scene: 'Plant it in the ground', emoji: '🌾', bg: 'meadow',
          text: 'A farmer plants the seed in the dirt. He waters it. He waits. From the outside, nothing seems to be happening. But underneath, life is starting!' },
        { scene: 'Growing tall', emoji: '🌳', bg: 'sky',
          text: 'Slowly, the seed grows. Days pass. Weeks pass. Soon the little seed is a strong, tall tree — bigger than all the other plants in the garden!' },
        { scene: 'A home for birds', emoji: '🐦', bg: 'sky',
          text: 'Birds come and build nests in its branches. From the tiniest seed comes the biggest blessing. That\'s how God\'s love works in our hearts too.' }
      ],
      anchorVerse: 'The kingdom of heaven is like a mustard seed.',
      anchorRef: 'Matthew 13:31',
      reflection: 'A small kindness, a small prayer, a small "yes" to God can grow into something amazing.'
    },

    { book: 'Mark', ref: '10:13–16', title: 'Jesus Loves the Children', theme: 'love', friday: false,
      pages: [
        { scene: 'Mums and dads bring kids', emoji: '👨‍👩‍👧', bg: 'meadow',
          text: 'Some parents brought their children to Jesus, hoping He would bless them. But the disciples grumbled. "Don\'t bother Him! He\'s busy with grown-up things!"' },
        { scene: 'Jesus is upset with them', emoji: '🙅', bg: 'dawn',
          text: 'Jesus heard them and frowned. "Don\'t stop them! Let the little children come to me — for the kingdom of God belongs to ones like these."' },
        { scene: 'In Jesus\'s arms', emoji: '🤗', bg: 'gold',
          text: 'He picked up the little children, hugged them, and put His hands on them to bless them. They giggled. They felt warm and safe.' },
        { scene: 'A heart like a child\'s', emoji: '💛', bg: 'sky',
          text: 'Then Jesus turned to the grown-ups: "Anyone who doesn\'t welcome God\'s kingdom like a little child won\'t enter it." Children show us how to love God!' }
      ],
      anchorVerse: 'Let the little children come to me.',
      anchorRef: 'Mark 10:14',
      reflection: 'You don\'t need to wait until you\'re grown up to be close to Jesus. He loves you, just as you are right now.'
    },

    { book: 'John', ref: '20:1–18', title: 'Jesus is Alive!', theme: 'hope', friday: false,
      pages: [
        { scene: 'Sad Sunday morning', emoji: '🥀', bg: 'dawn',
          text: 'Mary Magdalene walked to the tomb very early. The sky was just turning pink. Her heart was so sad — Jesus had died on Friday.' },
        { scene: 'The stone is rolled away!', emoji: '🪨', bg: 'gold',
          text: 'But the big stone in front of the tomb was rolled away! Mary peeked inside — empty! Where was Jesus? She started to cry.' },
        { scene: 'Two angels and a stranger', emoji: '👼', bg: 'gold',
          text: 'Two shining angels asked, "Why are you crying?" Then a man said, "Mary." When she heard her name, she gasped — it was JESUS! He was alive!' },
        { scene: 'Run and tell!', emoji: '🏃', bg: 'sky',
          text: 'Mary ran to tell the others. "I have seen the Lord!" she shouted. The very best news the world has ever heard: Jesus rose from the dead!' }
      ],
      anchorVerse: 'He is not here; He has risen!',
      anchorRef: 'Luke 24:6',
      reflection: 'No sadness, no darkness, not even death is stronger than God\'s love.'
    },

    // ---- Psalms / Wisdom ----

    { book: 'Psalm', ref: '23', title: 'The Lord is My Shepherd', theme: 'peace', friday: false,
      pages: [
        { scene: 'My shepherd', emoji: '🐑', bg: 'meadow',
          text: 'The Lord is my shepherd. Just like a shepherd takes care of sheep, God takes care of me. I have everything I need.' },
        { scene: 'Green grass and quiet streams', emoji: '🌿', bg: 'water',
          text: 'He leads me to green pastures where I can rest. He brings me beside calm streams where I can drink. My heart feels peaceful with Him.' },
        { scene: 'Through the dark valley', emoji: '🕯️', bg: 'night',
          text: 'Even when I walk through dark and scary valleys, I won\'t be afraid — because You are right beside me, God. Your love comforts me.' },
        { scene: 'God\'s house forever', emoji: '🏡', bg: 'gold',
          text: 'Goodness and mercy will follow me every day of my life. And one day I\'ll live in God\'s house forever and ever.' }
      ],
      anchorVerse: 'The Lord is my shepherd; I shall not want.',
      anchorRef: 'Psalm 23:1',
      reflection: 'You are never alone. The Good Shepherd is always with you.'
    },

    { book: 'Psalm', ref: '100', title: 'Make a Joyful Noise!', theme: 'gratitude', friday: false,
      pages: [
        { scene: 'Sing to God', emoji: '🎶', bg: 'sky',
          text: 'Make a joyful noise to the Lord, all the earth! Sing! Clap! Dance! Show God how happy you are.' },
        { scene: 'God made us', emoji: '🌷', bg: 'meadow',
          text: 'Know that the Lord is God. He made us — every single one of us — and we belong to Him, like sheep in His green meadow.' },
        { scene: 'Say thank you', emoji: '🙌', bg: 'gold',
          text: 'Come into His house with thanks! Walk through His gates singing songs of praise. There\'s so much to thank Him for!' },
        { scene: 'God\'s love forever', emoji: '💛', bg: 'rainbow',
          text: 'For the Lord is good. His love lasts forever. His promises stay true for every family, and every kid, and every grown-up — for all time.' }
      ],
      anchorVerse: 'Make a joyful noise to the Lord, all the earth!',
      anchorRef: 'Psalm 100:1',
      reflection: 'Praise doesn\'t have to be quiet — sing, dance, smile! God loves a joyful heart.'
    },

    { book: 'Psalm', ref: '121', title: 'Help Comes from God', theme: 'trust', friday: false,
      pages: [
        { scene: 'Looking up at the hills', emoji: '⛰️', bg: 'dawn',
          text: 'I lift my eyes up to the mountains — where does my help come from? My help comes from the Lord, who made heaven and earth!' },
        { scene: 'God doesn\'t sleep', emoji: '🌙', bg: 'night',
          text: 'God will not let your foot slip. He who watches over you never sleeps. Even when you\'re tucked in bed, God is awake, watching over you.' },
        { scene: 'A shade by your side', emoji: '🌳', bg: 'meadow',
          text: 'The Lord is your shade — the sun won\'t hurt you by day, the moon won\'t scare you by night. He keeps you safe from harm.' },
        { scene: 'Always with you', emoji: '🤝', bg: 'sky',
          text: 'The Lord watches over your coming and your going — both now and forever. Wherever you go, God is already there.' }
      ],
      anchorVerse: 'My help comes from the Lord.',
      anchorRef: 'Psalm 121:2',
      reflection: 'God never falls asleep. He\'s watching over you tonight, tomorrow, and always.'
    },

    { book: 'Proverbs', ref: '3:5–6', title: 'Trust with Your Whole Heart', theme: 'trust', friday: false,
      pages: [
        { scene: 'Wise old words', emoji: '📜', bg: 'gold',
          text: 'Long ago, a very wise king named Solomon wrote down some of the best advice ever — for his children, and for us.' },
        { scene: 'Trust God all the way', emoji: '💛', bg: 'sky',
          text: '"Trust in the Lord with all your heart." Not just a little bit — all the way! Even when you don\'t understand what\'s going on.' },
        { scene: 'Don\'t trust just yourself', emoji: '🤔', bg: 'cloud',
          text: '"Don\'t lean on your own understanding." Sometimes our brains are too small to see the whole picture. But God sees everything.' },
        { scene: 'God shows the path', emoji: '🛤️', bg: 'meadow',
          text: '"Listen for God in everything you do, and He will make your paths straight." When you ask God, He helps you find the right way.' }
      ],
      anchorVerse: 'Trust in the Lord with all your heart.',
      anchorRef: 'Proverbs 3:5',
      reflection: 'When you don\'t know what to do, ask God. He\'ll show you the way.'
    },

    { book: '1 Corinthians', ref: '13:4–7', title: 'What Real Love Looks Like', theme: 'love', friday: false,
      pages: [
        { scene: 'Love is patient', emoji: '⏳', bg: 'sky',
          text: 'Love is patient — it waits without complaining. Love is kind — it does little nice things even when no one is looking.' },
        { scene: 'Love isn\'t rude', emoji: '🤍', bg: 'dawn',
          text: 'Love is not jealous. It doesn\'t brag. It doesn\'t push or shove. It doesn\'t say mean things just to hurt people.' },
        { scene: 'Love forgives', emoji: '🤝', bg: 'meadow',
          text: 'Love doesn\'t keep a list of every wrong thing someone did. Love is glad about good things, and sad when things aren\'t fair.' },
        { scene: 'Love never gives up', emoji: '💛', bg: 'rainbow',
          text: 'Love trusts. Love hopes. Love keeps going, no matter what. Love NEVER gives up. That\'s the kind of love God has for you.' }
      ],
      anchorVerse: 'Love is patient, love is kind.',
      anchorRef: '1 Corinthians 13:4',
      reflection: 'God loves you like this — patient, kind, never giving up. Show that love to others too.'
    },

    { book: 'Philippians', ref: '4:4–8', title: 'Be Joyful Always', theme: 'gratitude', friday: false,
      pages: [
        { scene: 'A letter from prison', emoji: '✉️', bg: 'gold',
          text: 'Saint Paul was sitting in a prison when he wrote a letter to his friends — and his letter was full of joy! How could that be?' },
        { scene: 'Rejoice!', emoji: '😊', bg: 'sky',
          text: '"Rejoice in the Lord always! I will say it again — rejoice!" Paul wanted his friends to know: joy in God doesn\'t depend on what\'s happening around us.' },
        { scene: 'Don\'t worry — pray', emoji: '🙏', bg: 'meadow',
          text: '"Don\'t be anxious about anything. In every situation, by prayer, tell God what you need — with thanksgiving."' },
        { scene: 'Peace in your heart', emoji: '🕊️', bg: 'dove',
          text: '"And the peace of God, which is bigger than we can understand, will guard your heart and your mind in Christ Jesus." Now THAT\'S real peace!' }
      ],
      anchorVerse: 'Rejoice in the Lord always!',
      anchorRef: 'Philippians 4:4',
      reflection: 'When you\'re worried, talk to God about it. His peace is bigger than any worry.'
    },

    { book: 'John', ref: '14:1–6', title: 'Jesus Goes to Prepare a Place', theme: 'hope', friday: false,
      pages: [
        { scene: 'Sad disciples', emoji: '😟', bg: 'dusk',
          text: 'Jesus was about to go away, and His friends were very sad. So He sat them down and said, "Don\'t let your hearts be troubled."' },
        { scene: 'Trust God, trust me', emoji: '🤝', bg: 'sky',
          text: '"Trust in God; trust also in me. In my Father\'s house there are many rooms — and I\'m going to get one ready for each of you."' },
        { scene: 'I\'m coming back', emoji: '✨', bg: 'gold',
          text: '"And after I\'ve made it ready, I will come back and take you to be with me, so that you can be where I am."' },
        { scene: 'I am the way', emoji: '🛤️', bg: 'meadow',
          text: '"I am the way, the truth, and the life." When we follow Jesus, we always end up in the right place — with Him forever.' }
      ],
      anchorVerse: 'I am the way, the truth, and the life.',
      anchorRef: 'John 14:6',
      reflection: 'Jesus is getting heaven ready for you. He hasn\'t forgotten — and He\'s never far away.'
    },

    { book: 'Isaiah', ref: '40:28–31', title: 'Wings Like Eagles', theme: 'hope', friday: false,
      pages: [
        { scene: 'God never gets tired', emoji: '☀️', bg: 'sky',
          text: 'The Lord is the everlasting God. He made the whole earth, and He NEVER gets tired or weary. He never even needs a nap!' },
        { scene: 'Strength for the tired', emoji: '💪', bg: 'dawn',
          text: 'He gives strength to the tired. He gives power to the weak. Even strong young people get tired and stumble — but God doesn\'t.' },
        { scene: 'Wait on the Lord', emoji: '🤲', bg: 'meadow',
          text: 'Those who wait on the Lord will get fresh strength. They will rise up on wings — like eagles soaring high in the sky!' },
        { scene: 'Run and not get tired', emoji: '🦅', bg: 'sky',
          text: 'They will run and not grow weary. They will walk and not faint. When you trust God, He gives you exactly what you need to keep going.' }
      ],
      anchorVerse: 'Those who hope in the Lord will renew their strength.',
      anchorRef: 'Isaiah 40:31',
      reflection: 'When you feel tired, ask God for help. He\'ll give you wings.'
    },

    { book: 'Matthew', ref: '6:25–34', title: 'Don\'t Worry About Tomorrow', theme: 'peace', friday: false,
      pages: [
        { scene: 'Look at the birds', emoji: '🐦', bg: 'sky',
          text: 'Jesus pointed at the birds in the sky. "Look at them — they don\'t plant gardens or store food in barns. But God feeds every one of them. Aren\'t you more precious than birds?"' },
        { scene: 'Look at the flowers', emoji: '🌷', bg: 'meadow',
          text: '"And see the wild flowers in the field? They don\'t work or sew their own clothes. Yet even King Solomon, with all his treasure, wasn\'t dressed as beautifully as one little lily."' },
        { scene: 'God knows what you need', emoji: '💛', bg: 'gold',
          text: '"Your Father in heaven knows everything you need. So don\'t worry about clothes, or food, or what\'s coming next. Worry doesn\'t help anyway!"' },
        { scene: 'Today is enough', emoji: '☀️', bg: 'dawn',
          text: '"Look for God\'s kingdom first, and everything else will fall into place. Don\'t worry about tomorrow — tomorrow can wait. Today is enough."' }
      ],
      anchorVerse: 'Look at the birds of the air; your heavenly Father feeds them.',
      anchorRef: 'Matthew 6:26',
      reflection: 'God takes care of birds and flowers — He cares about you even more!'
    },

    { book: 'Acts', ref: '2:1–13', title: 'Pentecost — A Mighty Wind', theme: 'courage', friday: false,
      pages: [
        { scene: 'All together in a room', emoji: '🚪', bg: 'wood',
          text: 'After Jesus went back to heaven, His friends gathered in a room together — Mary, the apostles, all of them — praying and waiting.' },
        { scene: 'A sudden wind', emoji: '💨', bg: 'sky',
          text: 'Suddenly — WHOOSH! — a sound like a mighty wind filled the whole house. They could hardly believe their ears.' },
        { scene: 'Tongues of fire', emoji: '🔥', bg: 'fire',
          text: 'Little flames of fire appeared above each of their heads — and the Holy Spirit filled their hearts! They were so full of joy and courage they couldn\'t sit still.' },
        { scene: 'Speaking many languages', emoji: '🗣️', bg: 'gold',
          text: 'They ran outside and started telling people about Jesus — and they could speak in every language! People from many countries heard about God\'s love that day.' }
      ],
      anchorVerse: 'They were all filled with the Holy Spirit.',
      anchorRef: 'Acts 2:4',
      reflection: 'The Holy Spirit gives us courage to share God\'s love — in our words and in our actions.'
    }

  ],

  /* ======================================================
     FRIDAY POOL — Catholic Catechism (Beatitudes)
     One Beatitude per Friday for the first 8 Fridays.
     ====================================================== */
  friday: [

    { book: 'Matthew', ref: '5:3', title: 'Beatitude 1: The Humble Heart', theme: 'catechism', friday: true,
      pages: [
        { scene: 'Jesus on the mountain', emoji: '⛰️', bg: 'dawn',
          text: 'Big crowds followed Jesus up a hill. He sat down and looked at all the people. He had something important to teach them — and us.' },
        { scene: 'Real happiness', emoji: '😊', bg: 'sky',
          text: 'Jesus said, "I want to tell you who is REALLY happy. It\'s not who you think." The crowd leaned in to listen.' },
        { scene: 'Blessed are the poor in spirit', emoji: '🙏', bg: 'gold',
          text: '"Blessed are the poor in spirit," Jesus said. He meant: blessed are those who know they need God — who don\'t pretend to have it all figured out.' },
        { scene: 'Theirs is the kingdom', emoji: '👑', bg: 'rainbow',
          text: '"Theirs is the kingdom of heaven." When we say to God, "I need You," He gives us EVERYTHING. The whole kingdom is ours!' }
      ],
      anchorVerse: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.',
      anchorRef: 'Matthew 5:3',
      reflection: 'You don\'t need to know everything. Just know you need God — that\'s the secret of true happiness.'
    },

    { book: 'Matthew', ref: '5:4', title: 'Beatitude 2: God Comforts the Sad', theme: 'catechism', friday: true,
      pages: [
        { scene: 'Sometimes we cry', emoji: '😢', bg: 'rain',
          text: 'Jesus knew that life can be very hard. People get sick. Friends move away. Sometimes we cry, and our hearts feel heavy.' },
        { scene: 'Jesus sees', emoji: '👀', bg: 'dusk',
          text: 'Jesus didn\'t pretend that sad things don\'t happen. He looked at the crowd and said, "I see you. I see your tears. You are not alone."' },
        { scene: 'Blessed are those who mourn', emoji: '🤍', bg: 'cloud',
          text: '"Blessed are those who mourn — for they will be comforted." When we are sad, God doesn\'t leave us. He sits beside us in our tears.' },
        { scene: 'A hug from heaven', emoji: '🤗', bg: 'gold',
          text: 'God promises to wipe away every tear one day. Until then, He gives us hugs through the people who love us — and through prayer.' }
      ],
      anchorVerse: 'Blessed are those who mourn, for they will be comforted.',
      anchorRef: 'Matthew 5:4',
      reflection: 'It\'s okay to be sad. God meets us in our tears and stays close.'
    },

    { book: 'Matthew', ref: '5:5', title: 'Beatitude 3: Gentle Hearts Win', theme: 'catechism', friday: true,
      pages: [
        { scene: 'A bossy world', emoji: '😤', bg: 'dusk',
          text: 'In Jesus\'s time, big strong armies took whatever they wanted. People thought you had to be loud and tough to be important.' },
        { scene: 'Jesus says the opposite', emoji: '🤲', bg: 'meadow',
          text: 'But Jesus said, "Blessed are the meek." Meek means gentle. It means strong, but not pushy. Like a horse that listens to its rider.' },
        { scene: 'Gentle people inherit the earth', emoji: '🌍', bg: 'rainbow',
          text: '"They will inherit the earth," Jesus said. The whole earth! Not by grabbing it, but by being kind, patient, and trusting God.' },
        { scene: 'Like Jesus Himself', emoji: '🐑', bg: 'meadow',
          text: 'Jesus Himself was meek. He never bullied anyone. Yet He has all the power in heaven and earth. Gentleness isn\'t weakness — it\'s strength under control.' }
      ],
      anchorVerse: 'Blessed are the meek, for they will inherit the earth.',
      anchorRef: 'Matthew 5:5',
      reflection: 'You don\'t need to be loud or pushy to be important. Gentle hearts make the world a better place.'
    },

    { book: 'Matthew', ref: '5:6', title: 'Beatitude 4: Hungry for What\'s Right', theme: 'catechism', friday: true,
      pages: [
        { scene: 'A different kind of hunger', emoji: '🍞', bg: 'bread',
          text: 'Jesus said, "Blessed are those who hunger and thirst for righteousness." Righteousness means doing what\'s right — being good, fair, and true.' },
        { scene: 'Wanting the right thing', emoji: '💛', bg: 'gold',
          text: 'Some kids wish for new toys. Some wish for sweets. But Jesus said: how about wishing — really WANTING — to be a good, kind, fair person?' },
        { scene: 'God will fill you up', emoji: '🥤', bg: 'water',
          text: '"They will be filled," Jesus said. When you really want to do what\'s right, God Himself helps you — He fills you up like a tall, cold drink on a hot day.' },
        { scene: 'A satisfied heart', emoji: '😊', bg: 'meadow',
          text: 'A heart that does what\'s right feels SO good. Better than any treat. That\'s the happiness Jesus is talking about — and God promises it to you.' }
      ],
      anchorVerse: 'Blessed are those who hunger and thirst for righteousness, for they will be filled.',
      anchorRef: 'Matthew 5:6',
      reflection: 'Want to do good more than you want anything else. God will help you and fill your heart with joy.'
    },

    { book: 'Matthew', ref: '5:7', title: 'Beatitude 5: Show Mercy', theme: 'catechism', friday: true,
      pages: [
        { scene: 'What is mercy?', emoji: '🤲', bg: 'dawn',
          text: 'Mercy is when someone deserves a punishment — but you give them love instead. Like when your sister breaks your toy, and instead of getting angry, you forgive her.' },
        { scene: 'Jesus shows us mercy', emoji: '🤍', bg: 'gold',
          text: 'Jesus shows us mercy every single day. When we mess up, He doesn\'t shout. He says, "I forgive you. Try again." That\'s mercy.' },
        { scene: 'Pass it on', emoji: '🤝', bg: 'meadow',
          text: '"Blessed are the merciful," Jesus said, "for they will be shown mercy." When we forgive others, God forgives us. It\'s a beautiful circle!' },
        { scene: 'A merciful family', emoji: '💛', bg: 'rainbow',
          text: 'Imagine a home where everyone forgives each other quickly. No grudges. No silent treatment. Just love that keeps starting fresh. That\'s a merciful family — that\'s heaven on earth!' }
      ],
      anchorVerse: 'Blessed are the merciful, for they will be shown mercy.',
      anchorRef: 'Matthew 5:7',
      reflection: 'When someone hurts you, choose mercy. God will keep showing mercy to you in return.'
    },

    { book: 'Matthew', ref: '5:8', title: 'Beatitude 6: A Pure Heart', theme: 'catechism', friday: true,
      pages: [
        { scene: 'A clean inside', emoji: '💎', bg: 'water',
          text: 'Jesus said, "Blessed are the pure in heart." A pure heart is a CLEAN heart — clean of meanness, jealousy, lies, or selfish wants.' },
        { scene: 'Like clear water', emoji: '💧', bg: 'water',
          text: 'Imagine a glass of muddy water. You can\'t see through it. But a pure heart is like clear water — you can see all the way to the bottom. Honest. Open.' },
        { scene: 'They will see God', emoji: '👁️', bg: 'gold',
          text: '"They will see God," Jesus said. Not just one day in heaven — but here, now! In a flower, in a friend\'s smile, in answered prayers. Pure hearts see God everywhere.' },
        { scene: 'God washes us clean', emoji: '🤍', bg: 'dove',
          text: 'When our hearts get muddy, we tell God we\'re sorry. He washes us clean again, like fresh rain on a window. Clean and clear and ready to see.' }
      ],
      anchorVerse: 'Blessed are the pure in heart, for they will see God.',
      anchorRef: 'Matthew 5:8',
      reflection: 'Keep your heart honest and clean — and you\'ll see God\'s love in everyday things.'
    },

    { book: 'Matthew', ref: '5:9', title: 'Beatitude 7: Make Peace', theme: 'catechism', friday: true,
      pages: [
        { scene: 'When friends fight', emoji: '⚔️', bg: 'dusk',
          text: 'Sometimes friends argue. Brothers and sisters fight. Even grown-ups can\'t agree. The world is full of small wars and big ones.' },
        { scene: 'A peacemaker steps in', emoji: '🕊️', bg: 'dove',
          text: 'A peacemaker is someone who helps people stop fighting. Not by yelling, "STOP!" — but by listening, understanding, and helping everyone get along.' },
        { scene: 'Children of God', emoji: '👨‍👩‍👧', bg: 'gold',
          text: '"Blessed are the peacemakers," Jesus said, "for they will be called children of God." That\'s a beautiful name! It means we look like our Father in heaven.' },
        { scene: 'Peace at home, peace in the world', emoji: '🌍', bg: 'rainbow',
          text: 'Peace begins at home — between brothers and sisters, parents and kids. Then it spreads. Every kind word. Every "I\'m sorry." Every hug. Peace, growing.' }
      ],
      anchorVerse: 'Blessed are the peacemakers, for they will be called children of God.',
      anchorRef: 'Matthew 5:9',
      reflection: 'Be the one who calms things down, not the one who stirs them up. God is proud of peacemakers.'
    },

    { book: 'Matthew', ref: '5:10–12', title: 'Beatitude 8: Brave for What\'s Right', theme: 'catechism', friday: true,
      pages: [
        { scene: 'Doing the right thing', emoji: '💪', bg: 'sky',
          text: 'Sometimes when you do the right thing, people make fun of you. They call you names. They say, "Why are you so good? Just join in!"' },
        { scene: 'Stand up anyway', emoji: '🛡️', bg: 'gold',
          text: 'Jesus said, "Blessed are those who are persecuted because of righteousness." That\'s a long word! It means: if people are mean to you for doing right, KEEP doing right.' },
        { scene: 'You\'re in good company', emoji: '👥', bg: 'meadow',
          text: '"Blessed are you when people insult you and lie about you because of me," Jesus said. "All the prophets before you faced the same thing — and they were brave too."' },
        { scene: 'A great reward', emoji: '🎁', bg: 'rainbow',
          text: '"Be glad and rejoice — your reward in heaven is great!" Heaven sees every brave thing you do. Every "no" to wrong. Every "yes" to Jesus. It all counts.' }
      ],
      anchorVerse: 'Blessed are you when people insult you because of me. Rejoice — your reward in heaven is great.',
      anchorRef: 'Matthew 5:11–12',
      reflection: 'Doing right isn\'t always easy. But you\'re never alone — Jesus stood up for what was right too, and He\'s with you.'
    }

  ]
};
