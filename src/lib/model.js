/* Pure domain logic: cadences, templates, date math, money. No React/JSX. */

export const CADENCES = {
  monthly:    { label: 'Monthly',     short: 'mo',   n: 12 },
  quarterly:  { label: 'Quarterly',   short: 'qtr',  n: 4  },
  semiannual: { label: 'Semi-annual', short: 'half', n: 2  },
  annual:     { label: 'Annual',      short: 'yr',   n: 1  },
  perk:       { label: 'Perk',        short: '',     n: 0  },
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const CARD_COLORS = [
  { id:'graphite', name:'Graphite', css:'linear-gradient(135deg,#23262e,#0e0f13)' },
  { id:'platinum', name:'Platinum', css:'linear-gradient(135deg,#cfd3da,#9aa0ab)' },
  { id:'gold',     name:'Gold',     css:'linear-gradient(135deg,#e9c46a,#b8860b)' },
  { id:'sapphire', name:'Sapphire', css:'linear-gradient(135deg,#274690,#0b1d51)' },
  { id:'emerald',  name:'Emerald',  css:'linear-gradient(135deg,#1f9d6b,#0c5c41)' },
  { id:'rose',     name:'Rose',     css:'linear-gradient(135deg,#e26d8a,#9d3b56)' },
  { id:'plum',     name:'Plum',     css:'linear-gradient(135deg,#6d4b9f,#3a2364)' },
  { id:'ocean',    name:'Ocean',    css:'linear-gradient(135deg,#0fb5c9,#0a5e78)' },
];
export const colorCss = (id) => (CARD_COLORS.find(c => c.id === id) || CARD_COLORS[0]).css;
export const lightColor = (id) => id === 'platinum' || id === 'gold';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// value = amount per period (per checkbox). annual potential = value * n.
const B = (name, value, cadence, note = '') => ({ id: uid(), name, value, cadence, note });

export const TEMPLATES = [
  { name:'The Platinum Card', issuer:'Amex', color:'graphite', fee:695, resetType:'anniversary', benefits:[
    B('Uber Cash', 15, 'monthly', '$15/mo in-app, $35 in December'),
    B('Digital Entertainment', 20, 'monthly', 'Disney+, NYT, WSJ, etc.'),
    B('Airline Fee Credit', 200, 'annual', 'Incidental fees on one airline'),
    B('Hotel Credit', 200, 'annual', 'FHR / The Hotel Collection'),
    B('Saks Fifth Avenue', 50, 'semiannual', '$50 Jan–Jun, $50 Jul–Dec'),
    B('CLEAR Plus', 199, 'annual', 'Membership reimbursement'),
    B('Equinox / SoulCycle', 300, 'annual', 'Fitness credit'),
    B('Global Entry / TSA PreCheck', 120, 'perk', 'Every 4 years'),
    B('Centurion Lounge access', 0, 'perk', 'Unlimited lounge entry'),
  ]},
  { name:'Gold Card', issuer:'Amex', color:'gold', fee:325, resetType:'anniversary', benefits:[
    B('Dining Credit', 10, 'monthly', 'Grubhub, Resy, Five Guys, etc.'),
    B('Uber Cash', 10, 'monthly', 'Rides & Eats'),
    B('Resy Credit', 50, 'semiannual', '$50 Jan–Jun, $50 Jul–Dec'),
    B('Dunkin Credit', 7, 'monthly', '$7/mo on $2+ purchases'),
  ]},
  { name:'Sapphire Reserve', issuer:'Chase', color:'sapphire', fee:550, resetType:'anniversary', benefits:[
    B('Travel Credit', 300, 'annual', 'Auto-applies to travel'),
    B('DoorDash Restaurant', 5, 'monthly', '$5 promo each month'),
    B('Lyft Credit', 10, 'monthly', 'In-app Lyft credit'),
    B('Global Entry / TSA PreCheck', 100, 'perk', 'Every 4 years'),
    B('Priority Pass lounges', 0, 'perk', 'Unlimited visits'),
  ]},
  { name:'Venture X', issuer:'Capital One', color:'emerald', fee:395, resetType:'anniversary', benefits:[
    B('Travel Credit', 300, 'annual', 'Through Capital One Travel'),
    B('Anniversary Miles', 10000, 'perk', '10,000 bonus miles each year'),
    B('Capital One Lounge access', 0, 'perk', 'Unlimited for you'),
  ]},
  { name:'Blue Cash Preferred', issuer:'Amex', color:'ocean', fee:95, resetType:'calendar', benefits:[
    B('Disney Bundle Credit', 7, 'monthly', '$7/mo statement credit'),
  ]},
  // UAE card — amounts are in AED (app currently renders a "$" glyph for all cards).
  { name:'Skywards Infinite', issuer:'Emirates NBD', color:'rose', fee:1575, resetType:'anniversary', benefits:[
    B('Complimentary valet parking', 120, 'monthly', '4 free valet/mo at select malls, 1 hr each (AED 30 after). AED value est.'),
    B('Complimentary golf round', 250, 'monthly', 'Up to 2 rounds/mo at top UAE courses · AED 30/booking · needs AED 5,000 spend that month. AED est.'),
    B('Airport lounge access', 0, 'perk', 'Unlimited — you + 1 guest at 1,000+ lounges via Visa Airport Companion'),
    B('Emirates Skywards Silver status', 0, 'perk', 'Complimentary while the card is active (lounge access + extra baggage)'),
    B('Multi-trip travel insurance', 0, 'perk', 'You + family, trips up to 90 days'),
    B('Airport transfers (Careem)', 0, 'perk', 'Free airport drop via concierge desk · 50% off Careem rides'),
    B('Rotana Rewards membership', 0, 'perk', 'Complimentary Exclusive Club membership'),
    B('Welcome bonus miles', 0, 'perk', 'Up to 100,000 Skywards Miles (incl. 25,000 on USD 7,500 Emirates spend in year 1)'),
  ]},
  { name:'Custom card', issuer:'', color:'plum', fee:0, resetType:'calendar', benefits:[] },
];
export const newBenefit = () => B('New benefit', 0, 'monthly', '');

/* ----------------------------- dates ----------------------------- */
export const fmtDate = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
export const fmtShortDate = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

export function annualCycle(card, now) {
  if (card.resetType === 'anniversary' && card.anniversaryDate) {
    const [, am, ad] = card.anniversaryDate.split('-').map(Number);
    let start = new Date(now.getFullYear(), am - 1, ad);
    if (start > now) start = new Date(now.getFullYear() - 1, am - 1, ad);
    const renews = new Date(start.getFullYear() + 1, am - 1, ad);
    return { key: `AN-${start.getFullYear()}-${am}-${ad}`, renews, start, label: fmtDate(renews) };
  }
  const start = new Date(now.getFullYear(), 0, 1);
  const renews = new Date(now.getFullYear() + 1, 0, 1);
  return { key: `A-${now.getFullYear()}`, renews, start, label: `Jan 1, ${now.getFullYear() + 1}` };
}

// All periods for a benefit within the current display window.
export function periodsFor(card, benefit, now) {
  const c = benefit.cadence, y = now.getFullYear();
  if (c === 'perk') return [];
  if (c === 'monthly')
    return MONTHS.map((m, i) => ({ key:`${y}-M${i}`, label:m, full:`${MONTHS_FULL[i]} ${y}`, isCurrent: i === now.getMonth() }));
  if (c === 'quarterly')
    return [0,1,2,3].map(i => ({ key:`${y}-Q${i}`, label:`Q${i+1}`, full:`Q${i+1} ${y}`, isCurrent: i === Math.floor(now.getMonth()/3) }));
  if (c === 'semiannual')
    return [0,1].map(i => ({ key:`${y}-H${i}`, label: i===0?'H1':'H2', full: i===0?`Jan–Jun ${y}`:`Jul–Dec ${y}`, isCurrent: i === (now.getMonth()<6?0:1) }));
  const cyc = annualCycle(card, now);
  return [{ key: cyc.key, label: String(cyc.start.getFullYear()), full: `Renews ${cyc.label}`, isCurrent: true, renews: cyc }];
}

export function currentPeriod(card, benefit, now) {
  return periodsFor(card, benefit, now).find(p => p.isCurrent) || null;
}

export function relTime(at, now) {
  const s = Math.max(0, (now.getTime() - at) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return fmtShortDate(new Date(at));
}

/* ----------------------------- money ----------------------------- */
export const money = (n) => {
  const v = Math.round(n * 100) / 100;
  return '$' + (Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 }));
};
export const annualPotential = (b) => b.cadence === 'perk' ? 0 : b.value * CADENCES[b.cadence].n;

// Friendly random household code, e.g. "swift-otter-4821".
const ADJ = ['swift','cozy','lucky','sunny','brave','clever','quiet','merry','jolly','spry','keen','bold'];
const ANIM = ['otter','panda','heron','lynx','koala','fox','wren','orca','ibis','moth','crane','vole'];
export const makeCode = () =>
  `${ADJ[Math.floor(Math.random()*ADJ.length)]}-${ANIM[Math.floor(Math.random()*ANIM.length)]}-${1000 + Math.floor(Math.random()*9000)}`;
export const normCode = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, '-');
