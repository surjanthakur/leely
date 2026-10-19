export const EASE = [0.22, 1, 0.36, 1];
export const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`;
export const CARD = 'relative rounded-2xl border-2 border-black';
export const SHADOW = 'shadow-[5px_6px_0_#000]';
export const MOBILE_CARD = 'mx-auto w-full max-w-[360px] sm:max-w-none';

export const NAV = [{ label: 'Features', href: '#features' }];

export const TOPICS = [
  'General knowledge resources',
  'Computer Science resources',
  'finance resources',
  'research blogs',
  'devops resources',
  'database resources',
  'design design resources',
  'crypto knowledge',
  'more....',
];

export const STEPS = [
  {
    n: '01',
    color: 'bg-[#ffd55d]',
    title: 'Describe what you want to learn',
    body: 'Plain language. No keywords, no Boolean gymnastics, no “best blog for X 2025” guesswork.',
  },
  {
    n: '02',
    color: 'bg-lime-300',
    title: 'Leely splits it into sub-queries',
    body: 'Your prompt gets decomposed into focused angles so the topic is covered from every side.',
  },
  {
    n: '03',
    color: 'bg-[#a5c8ff]',
    title: 'We scan the whole web of writing',
    body: 'Long-form blogs, docs, engineering journals — not just the first ten SEO-optimised pages.',
  },
  {
    n: '04',
    color: 'bg-[#f2a9dd]',
    title: 'You get a ranked reading shelf',
    body: 'Scored, deduped and grouped into a path you can actually finish before you lose interest.',
  },
];

export const WHY = [
  {
    icon: '🗂️',
    bg: 'bg-[#ffd55d]',
    title: 'No more tab hoarding',
    body: 'One clean, ordered list instead of forty half-read tabs you will never reopen.',
  },
  {
    icon: '🎯',
    bg: 'bg-lime-300',
    title: 'Ranked, not random',
    body: 'Relevance scoring pushes the genuinely good writing to the top of your shelf.',
  },
  {
    icon: '🫧',
    bg: 'bg-[#a5c8ff]',
    title: 'Free while in beta',
    body: 'Every feature unlocked. No paywall, no credit card, no “pro” upsell mid-scroll.',
  },
];
