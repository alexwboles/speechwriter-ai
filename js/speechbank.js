/* SpeechWriter AI — occasion data bank: openings, story-beat prompts,
   closings, toast lines, and delivery tips per occasion and tone.
   Placeholders: {name} = honoree, {rel} = speaker's relationship. */"use strict";

const TONES = {
  heartfelt:"Heartfelt",
  funny:"Funny",
  formal:"Formal"
};

const RELATIONSHIPS = ["friend","best friend","sibling","brother","sister","parent","mother","father","child","son","daughter","partner","spouse","colleague","mentor","cousin"
];

const OCCASIONS = {
  wedding: {
    label:"Wedding",
    tones: ["heartfelt","funny","formal"],
    openings: {
      heartfelt: ["For those who don't know me, I'm {name}'s {rel}, and I've been waiting for this day almost as long as they have.","They say you know it's real when you can't picture your future without someone in it. {name} hasn't pictured a future without {partner} in years."
      ],
      funny: ["Hi everyone, I'm {name}'s {rel}. I was told to keep this short, sweet, and only mildly embarrassing — so let's see how that goes.","When {name} asked me to speak today, I asked if there was a word limit. There wasn't. You've been warned."
      ],
      formal: ["Good evening. As {name}'s {rel}, it is my honor to say a few words on this wonderful occasion.","We are gathered to celebrate two remarkable people, and I am privileged to speak on behalf of all who love {name}."
      ]
    },
    beats: [
      { prompt:"How you met / your earliest memory of them", hint:"One specific moment beats a whole biography. Where were you? What did they do?" },
      { prompt:"The moment you knew this relationship was different", hint:"What changed in them? What did they tell you — or what did you notice?" },
      { prompt:"What you admire most about them as a partner", hint:"Pick one quality and one tiny example that proves it." }
    ],
    closings: {
      heartfelt: ["So here's to a lifetime of exactly this — laughter at the dinner table, and someone who always saves you the last bite.","May your love keep doing what it's always done: making everyone around you want to be a little kinder."
      ],
      funny: ["Marriage is basically a group project where you actually like your partner. You're both getting an A.","They say marriage takes work. Good news: you're both allergic to quitting."
      ],
      formal: ["Please join me in wishing the happy couple a lifetime of health, happiness, and devotion.","May the years ahead be as joyful as this day, and may your union be a blessing to all who know you."
      ]
    },
    toasts: ["To {name} and {partner} — may your love story never need an editor!","To the happy couple!","To love, laughter, and happily ever after!"
    ],
    tips: ["Aim for 3–5 minutes. That's roughly 400–650 words — shorter than you think.","Rehearse out loud at least 3 times. Speeches that only exist in your head run long.","Make eye contact with the couple, not your notes, for the toast line.","If you cry, pause and breathe — the room will wait for you. It's a wedding; tears are currency.","Skip inside jokes that need more than one sentence of explanation."
    ]
  },
  birthday: {
    label:"Birthday",
    tones: ["heartfelt","funny","formal"],
    openings: {
      heartfelt: ["I've known {name} for years, and if there's one thing I've learned, it's that birthdays don't make people special — people like {name} make birthdays special.","As {name}'s {rel}, I get a front-row seat to who they really are. Tonight I want to tell you what I see."
      ],
      funny: ["I'm {name}'s {rel}, and I was asked to say a few words. I asked which words. They said 'nice ones.' Challenge accepted.","They say age is just a number. In {name}'s case, it's a number we're contractually not allowed to say out loud."
      ],
      formal: ["Good evening, everyone. As {name}'s {rel}, I'm delighted to mark this milestone with you all.","It is a pleasure to gather in honor of {name} on this special day."
      ]
    },
    beats: [
      { prompt:"Your favorite memory together this past year", hint:"Something small and specific — the trip, the Tuesday, the text thread." },
      { prompt:"A quality of theirs you're grateful for", hint:"What do they do for people that nobody else does quite the same way?" },
      { prompt:"Your wish for their year ahead", hint:"Make it concrete: the trip, the goal, the thing they've been talking about." }
    ],
    closings: {
      heartfelt: ["So here's to you, {name} — may this year give back even a fraction of what you give everyone else.","The world is unmistakably better with you in it. Happy birthday."
      ],
      funny: ["Growing older is mandatory; growing up remains, in your case, entirely optional. Happy birthday!","Another year, another excuse to eat cake for dinner. You've earned it."
      ],
      formal: ["Please join me in wishing {name} health and happiness in the year ahead.","Happy birthday, {name} — may the coming year exceed every expectation."
      ]
    },
    toasts: ["To {name} — happy birthday!","To another year of you being you!","Happy birthday, {name}!"
    ],
    tips: ["2–4 minutes is the sweet spot for a birthday toast.","One great story beats three okay ones. Cut ruthlessly.","End by looking at the birthday person, not the crowd.","If roasting, punch up, never down — and keep it to things they'd laugh at too.","Have water nearby. Nerves dry out every throat."
    ]
  },
  retirement: {
    label:"Retirement",
    tones: ["heartfelt","funny","formal"],
    openings: {
      heartfelt: ["I've had the privilege of knowing {name} as {relNoun}, and I can tell you the measure of a career isn't the title — it's the people. Just look around this room.","Some people do a job. {name} built something — a team, a standard, a way of doing things that will outlast any org chart."
      ],
      funny: ["I'm {name}'s {rel}, and I've been asked to roast — I mean, honor — them on their retirement. HR is present, so I'll keep it clean.","After all these years, {name} is finally getting what they've always wanted: Mondays off. And Tuesdays. You get the idea."
      ],
      formal: ["Colleagues and friends, we gather to honor {name} on the occasion of their retirement after a distinguished career.","It is my privilege, as {name}'s {rel}, to reflect on a career marked by dedication and excellence."
      ]
    },
    beats: [
      { prompt:"What they'll be remembered for at work", hint:"The project, the mentorship, the standard they set — be specific." },
      { prompt:"A story that shows who they are", hint:"The 2 a.m. save, the kindness nobody saw, the legendary meeting moment." },
      { prompt:"What you're excited for them to do next", hint:"Travel, grandkids, the hobby they've postponed for a decade." }
    ],
    closings: {
      heartfelt: ["Retirement isn't an ending — it's the first day of a schedule you finally get to write yourself.","Thank you, {name}, for showing us how it's done. Enjoy every single morning with nowhere to be."
      ],
      funny: ["You're not retiring from work — you're being promoted to full-time boss of your own calendar.","Every day is Saturday now. Try not to let the power go to your head."
      ],
      formal: ["We wish {name} a retirement as rewarding as the career that preceded it.","Congratulations, {name} — your legacy here is secure, and your future is bright."
      ]
    },
    toasts: ["To {name} — to the next chapter!","To retirement done right!","Congratulations, {name}!"
    ],
    tips: ["3–5 minutes; mix one sincere beat with one light one.","Name specific contributions — generic praise sounds like a greeting card.","If colleagues are present, one shared work story bonds the whole room.","Avoid dwelling on company politics or 'finally escaping' framing.","End looking at the retiree — this moment is theirs."
    ]
  },
  graduation: {
    label:"Graduation",
    tones: ["heartfelt","funny","formal"],
    openings: {
      heartfelt: ["Watching {name} walk across that stage, all I could think was: I remember when this felt impossibly far away. And look at them now.","As {name}'s {rel}, I've watched the late nights, the doubts, the comebacks. Today is the receipt for all of it."
      ],
      funny: ["I'm {name}'s {rel}. They graduated, which means my job as a human alarm clock / essay editor / crisis counselor is officially over. You're welcome.","Four years, countless all-nighters, and one very expensive piece of paper. Worth it."
      ],
      formal: ["Family and friends, we celebrate {name}'s graduation — the culmination of years of dedication and hard work.","It is my honor, as {name}'s {rel}, to congratulate them on this significant achievement."
      ]
    },
    beats: [
      { prompt:"The struggle they pushed through", hint:"The semester, the subject, the setback — and what got them through it." },
      { prompt:"How they've grown", hint:"Who were they on day one versus today? Name the change." },
      { prompt:"What you see in their future", hint:"Not a prediction — a belief. What are they built for?" }
    ],
    closings: {
      heartfelt: ["Diplomas fade. What doesn't fade is what it took to earn one. I'm so proud of you, {name}.","This is just the first of many stages you'll walk across. I'll be cheering at all of them."
      ],
      funny: ["You're now officially qualified to be confused at a higher pay grade. Congratulations!","Remember: the tassel was worth the hassle. Mostly."
      ],
      formal: ["Congratulations, {name} — may your future be as bright as your achievements suggest.","We look forward to all that you will accomplish in the years ahead."
      ]
    },
    toasts: ["To {name} — the future is yours!","To the graduate!","Congratulations, {name}!"
    ],
    tips: ["Keep it under 3 minutes — graduation events run long already.","Speak to the graduate's effort, not just the outcome.","One piece of genuine advice is plenty; this isn't a TED talk.","Avoid 'the real world is scary' framing — celebrate, don't warn.","Finish with their name. It lands every time."
    ]
  },
  eulogy: {
    label:"Eulogy / Memorial",
    tones: ["heartfelt","formal"],
    openings: {
      heartfelt: ["Thank you all for being here. I'm {name}'s {rel}, and I've been thinking about what {name} would want said today. I think they'd want honesty — and love. So here goes.","When I try to sum up {name}, I don't think of dates or milestones. I think of ordinary days that felt special just because they were in them."
      ],
      formal: ["We gather to remember and honor the life of {name}. As their {rel}, I am grateful for the opportunity to share a few reflections.","{name}'s life touched so many of us. Today I want to speak to what made that life remarkable."
      ]
    },
    beats: [
      { prompt:"Who they were day to day", hint:"The rituals, the habits, the small things — morning coffee, the garden, the phone calls." },
      { prompt:"What they taught you", hint:"A lesson, a value, a sentence of theirs you still hear in your head." },
      { prompt:"A memory that captures them", hint:"One story where they are unmistakably themselves. Sensory details help." }
    ],
    closings: {
      heartfelt: ["Grief is the price of love, and {name} was worth every bit of it. We'll carry them with us — in how we love, how we laugh, how we show up.","They're gone from our sight, but never from our stories. Tell them often."
      ],
      formal: ["{name}'s legacy lives on in all of us who were shaped by their life. May they rest in peace.","We honor {name} best by living the values they embodied. Thank you."
      ]
    },
    toasts: ["To {name} — always remembered, deeply missed.","In loving memory of {name}.","To a life well lived."
    ],
    tips: ["5–7 minutes is typical; it's okay to be brief. Presence matters more than polish.","Write it out fully — grief makes improvisation unreliable.","Bring tissues and water. Pausing to compose yourself is completely fine.","It's okay to smile or laugh at a happy memory — eulogies can hold joy too.","Ask someone to stand nearby in case you need support finishing."
    ]
  }
};

if (typeof module !=="undefined" && module.exports) {
  module.exports = { TONES, RELATIONSHIPS, OCCASIONS };
}
