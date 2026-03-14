const BOARD_SIZE = 11;
const BOARD_SPACES = 40;
const STARTING_CASH = 1500;
const PASS_START_BONUS = 200;
const EXACT_START_BONUS = 150;
const ROUND_LIMIT = 20;
let activeRoundLimit = Math.min(Math.max(Number(localStorage.getItem("bgame_roundLimit")) || ROUND_LIMIT, 10), 50);
const MAX_UPGRADE_LEVEL = 3;
const MAJOR_VICTORY_GLOBALS = 4;
const MOVE_STEP_MS = 120;
const ROLL_REVEAL_MS = 540;
const LIQUIDATION_RATE = 0.7;
const RENT_MULTIPLIERS = [1, 1.85, 3.05, 4.55];
const UPGRADE_LEVELS = ["Owned", "Developed", "Major Attraction", "Global Landmark"];
const SHORT_TIER_LABELS = ["OWN", "DEV", "MAJ", "GLB"];
const EVENT_POSITIONS = [0, 3, 7, 10, 13, 17, 20, 23, 27, 30, 33, 37];
const CORNER_INDICES = new Set([0, 10, 20, 30]);

const COLOR_PALETTE = [
  { color: "#efc77b", glow: "rgba(239,199,123,0.55)", label: "Gold" },
  { color: "#63a8ff", glow: "rgba(99,168,255,0.55)",  label: "Blue" },
  { color: "#ef6a5f", glow: "rgba(239,106,95,0.55)",  label: "Red" },
  { color: "#7ad977", glow: "rgba(122,217,119,0.55)", label: "Green" },
  { color: "#b487ff", glow: "rgba(180,135,255,0.55)", label: "Purple" },
  { color: "#ffad63", glow: "rgba(255,173,99,0.55)",  label: "Orange" },
  { color: "#4dd9d0", glow: "rgba(77,217,208,0.55)",  label: "Cyan" },
  { color: "#ff87b4", glow: "rgba(255,135,180,0.55)", label: "Pink" },
  { color: "#b5e85a", glow: "rgba(181,232,90,0.55)",  label: "Lime" },
  { color: "#8b7df8", glow: "rgba(139,125,248,0.55)", label: "Indigo" },
  { color: "#f5c842", glow: "rgba(245,200,66,0.55)",  label: "Amber" },
  { color: "#42c4a0", glow: "rgba(66,196,160,0.55)",  label: "Teal" },
];

const ITEM_GRADE = {
  common:    { color: "#8faab8", bg: "rgba(143,170,184,0.10)", label: "Common" },
  rare:      { color: "#63a8ff", bg: "rgba(99,168,255,0.10)",  label: "Rare" },
  epic:      { color: "#b487ff", bg: "rgba(180,135,255,0.10)", label: "Epic" },
  legendary: { color: "#efc77b", bg: "rgba(239,199,123,0.10)", label: "Legendary" },
};

const ITEM_DEFS = [
  { id: "lucky-compass",    name: "Lucky Compass",       icon: "🧭", grade: "rare",      price: 180, timing: "before-roll", target: "pick-number", desc: "Choose your move distance (1–6) instead of rolling." },
  { id: "speed-boots",      name: "Speed Boots",         icon: "👟", grade: "common",    price: 120, timing: "before-roll", target: "none",        desc: "Roll 3 dice this turn and use the two highest." },
  { id: "teleport-pass",    name: "Teleport Pass",       icon: "✈️",  grade: "epic",      price: 250, timing: "before-roll", target: "unowned-lm",  desc: "Move to any unowned landmark on the board." },
  { id: "shortcut-map",     name: "Shortcut Map",        icon: "🗺️",  grade: "common",    price: 90,  timing: "before-roll", target: "none",        desc: "Add +3 to your dice roll this turn." },
  { id: "cash-injection",   name: "Cash Injection",      icon: "💵", grade: "common",    price: 160, timing: "immediate",   target: "none",        desc: "Immediately gain $250." },
  { id: "market-insider",   name: "Market Insider",      icon: "📈", grade: "rare",      price: 200, timing: "immediate",   target: "none",        desc: "Collect rent from all your landmarks right now." },
  { id: "discount-deed",    name: "Discount Deed",       icon: "🏷️",  grade: "rare",      price: 150, timing: "passive",     target: "none",        desc: "Your next landmark purchase costs 30% less." },
  { id: "fast-track",       name: "Fast Track Permit",   icon: "⚡", grade: "epic",      price: 300, timing: "immediate",   target: "owned-lm",    desc: "Upgrade one of your landmarks for free." },
  { id: "insurance",        name: "Insurance Policy",    icon: "🛡️",  grade: "common",    price: 130, timing: "passive",     target: "none",        desc: "Your next rent payment is halved." },
  { id: "tax-shield",       name: "Tax Shield",          icon: "📋", grade: "common",    price: 110, timing: "passive",     target: "none",        desc: "Skip the next TAX space penalty." },
  { id: "golden-padlock",   name: "Golden Padlock",      icon: "🔐", grade: "rare",      price: 170, timing: "immediate",   target: "owned-lm",    desc: "Protect one landmark from hostile effects for 3 rounds." },
  { id: "diplomatic",       name: "Diplomatic Immunity", icon: "🕊️",  grade: "rare",      price: 200, timing: "passive",     target: "none",        desc: "Skip rent payment once when landing on opponent's landmark." },
  { id: "rent-spike",       name: "Rent Spike",          icon: "📌", grade: "rare",      price: 140, timing: "immediate",   target: "owned-lm",    desc: "Double rent on one landmark for the next opponent visit." },
  { id: "sabotage",         name: "Sabotage",            icon: "🪛", grade: "epic",      price: 220, timing: "immediate",   target: "opponent",    desc: "Force one opponent to skip their next turn." },
  { id: "market-crash",     name: "Market Crash",        icon: "📉", grade: "legendary", price: 350, timing: "immediate",   target: "none",        desc: "All opponents lose 10% of their cash to the bank." },
  { id: "hostile-takeover", name: "Hostile Takeover",    icon: "🤝", grade: "legendary", price: 400, timing: "immediate",   target: "opp-lm",      desc: "Force-buy an opponent's landmark at 70% of its value." },
  { id: "time-warp",        name: "Time Warp",           icon: "⏳", grade: "epic",      price: 280, timing: "immediate",   target: "none",        desc: "Take an extra turn immediately after this one." },
  { id: "prestige-boost",   name: "Prestige Boost",      icon: "⭐", grade: "epic",      price: 320, timing: "immediate",   target: "owned-lm",    desc: "Permanently increase one landmark's rent by +20%." },
  { id: "global-alliance",  name: "Global Alliance",     icon: "🌐", grade: "epic",      price: 260, timing: "immediate",   target: "none",        desc: "Collect all your Global Landmark rent totals immediately as a bonus." },
  { id: "landmark-swap",    name: "Landmark Swap",       icon: "🔄", grade: "legendary", price: 380, timing: "immediate",   target: "opp-lm",      desc: "Swap one of your landmarks with an opponent's of equal or lower tier." },
];

const TONE_PALETTE = [
  "rgba(89, 198, 193, 0.16)",
  "rgba(239, 199, 123, 0.16)",
  "rgba(245, 143, 127, 0.16)",
  "rgba(147, 220, 255, 0.18)",
  "rgba(155, 227, 124, 0.16)",
  "rgba(201, 170, 255, 0.16)",
  "rgba(255, 188, 134, 0.16)",
];

const LANDMARK_IMAGES = {
  "central-park": "assets/landmarks/central-park.png",
  "ueno-park": "assets/landmarks/ueno-park.png",
  "tivoli-gardens": "assets/landmarks/tivoli-gardens.png",
  "tower-bridge": "assets/landmarks/tower-bridge.png",
  "tokyo-tower": "assets/landmarks/tokyo-tower.png",
  "big-ben": "assets/landmarks/big-ben.png",
  colosseum: "assets/landmarks/colosseum.png",
  "gardens-by-the-bay": "assets/landmarks/gardens-by-the-bay.png",
  "luna-park": "assets/landmarks/luna-park.png",
  "sagrada-familia": "assets/landmarks/sagrada-familia.png",
  "eiffel-tower": "assets/landmarks/eiffel-tower.png",
  "statue-of-liberty": "assets/landmarks/statue-of-liberty.png",
  "louvre-museum": "assets/landmarks/louvre-museum.png",
  "sydney-opera-house": "assets/landmarks/sydney-opera-house.png",
  disneyland: "assets/landmarks/disneyland.png",
  "great-wall": "assets/landmarks/great-wall.png",
  acropolis: "assets/landmarks/acropolis.png",
  "taj-mahal": "assets/landmarks/taj-mahal.png",
  "buckingham-palace": "assets/landmarks/buckingham-palace.png",
  "cn-tower": "assets/landmarks/cn-tower.png",
  "petronas-towers": "assets/landmarks/petronas-towers.png",
  "one-world-trade": "assets/landmarks/one-world-trade.png",
  "marina-bay-sands": "assets/landmarks/marina-bay-sands.png",
  "shanghai-tower": "assets/landmarks/shanghai-tower.png",
  "chichen-itza": "assets/landmarks/chichen-itza.png",
  "machu-picchu": "assets/landmarks/machu-picchu.png",
  "angkor-wat": "assets/landmarks/angkor-wat.png",
  "burj-khalifa": "assets/landmarks/burj-khalifa.png",
};

const LANDMARK_MINIATURES = {
  "central-park": { profile: "garden", crest: "CP" },
  "ueno-park": { profile: "garden", crest: "UP" },
  "tivoli-gardens": { profile: "garden", crest: "TG" },
  disneyland: { profile: "garden", crest: "DL" },
  "tokyo-tower": { profile: "spire", crest: "TT" },
  "tower-bridge": { profile: "bridge", crest: "TB" },
  "big-ben": { profile: "clocktower", crest: "BB" },
  "gardens-by-the-bay": { profile: "garden", crest: "GB" },
  "luna-park": { profile: "garden", crest: "LP" },
  colosseum: { profile: "heritage", crest: "CO" },
  "sagrada-familia": { profile: "cathedral", crest: "SF" },
  "eiffel-tower": { profile: "spire", crest: "ET" },
  "statue-of-liberty": { profile: "statue", crest: "SL" },
  "louvre-museum": { profile: "palace", crest: "LM" },
  "sydney-opera-house": { profile: "opera", crest: "SO" },
  "great-wall": { profile: "heritage", crest: "GW" },
  acropolis: { profile: "heritage", crest: "AC" },
  "taj-mahal": { profile: "palace", crest: "TM" },
  "buckingham-palace": { profile: "palace", crest: "BP" },
  "cn-tower": { profile: "spire", crest: "CN" },
  "petronas-towers": { profile: "twinspire", crest: "PT" },
  "one-world-trade": { profile: "skyscraper", crest: "OW" },
  "marina-bay-sands": { profile: "skydeck", crest: "MB" },
  "shanghai-tower": { profile: "skyscraper", crest: "ST" },
  "chichen-itza": { profile: "heritage", crest: "CI" },
  "machu-picchu": { profile: "heritage", crest: "MP" },
  "angkor-wat": { profile: "heritage", crest: "AW" },
  "burj-khalifa": { profile: "spire", crest: "BK" },
};

const LANDMARK_SEEDS = [
  { id: "central-park", name: "Central Park", city: "New York, USA", phase: "Early", flavor: "An opening-route park with stable foot traffic and low-friction returns." },
  { id: "ueno-park", name: "Ueno Park", city: "Tokyo, Japan", phase: "Early", flavor: "Low-cost green-space traffic makes this a clean early-game pickup." },
  { id: "tivoli-gardens", name: "Tivoli Gardens", city: "Copenhagen, Denmark", phase: "Early", flavor: "A compact amusement park with steady income and gentle upgrade pressure." },
  { id: "disneyland", name: "Disneyland", city: "Anaheim, USA", phase: "Early", flavor: "A famous park attraction that still plays like an early-route income engine." },
  { id: "tokyo-tower", name: "Tokyo Tower", city: "Tokyo, Japan", phase: "Early", flavor: "A nimble observation tower that scales cleanly once the first upgrades land." },
  { id: "tower-bridge", name: "Tower Bridge", city: "London, UK", phase: "Early", flavor: "Compact entry pricing with dependable sightseeing income on the first side." },
  { id: "big-ben", name: "Big Ben", city: "London, UK", phase: "Early", flavor: "A small but steady city-center attraction that stays relevant deep into the game." },
  { id: "gardens-by-the-bay", name: "Gardens by the Bay", city: "Singapore", phase: "Early", flavor: "A polished garden attraction that closes the early route with higher upside." },
  { id: "luna-park", name: "Luna Park", city: "Sydney, Australia", phase: "Early", flavor: "A classic waterfront attraction with approachable pricing and solid visitor flow." },
  { id: "colosseum", name: "Colosseum", city: "Rome, Italy", phase: "Mid", flavor: "Historic prestige converted into reliable tourism income once the board matures." },
  { id: "sagrada-familia", name: "Sagrada Familia", city: "Barcelona, Spain", phase: "Mid", flavor: "A famous cultural landmark with a strong development curve." },
  { id: "eiffel-tower", name: "Eiffel Tower", city: "Paris, France", phase: "Mid", flavor: "Prestige icon status with elegant rent scaling from the first upgrade onward." },
  { id: "statue-of-liberty", name: "Statue of Liberty", city: "New York, USA", phase: "Mid", flavor: "Steady transatlantic demand keeps this harbor landmark in constant play." },
  { id: "louvre-museum", name: "Louvre Museum", city: "Paris, France", phase: "Mid", flavor: "Dense foot traffic and global brand power make this a stable compounder." },
  { id: "sydney-opera-house", name: "Sydney Opera House", city: "Sydney, Australia", phase: "Mid", flavor: "A destination asset with premium rent growth and strong board presence." },
  { id: "great-wall", name: "Great Wall", city: "Beijing, China", phase: "Mid", flavor: "Global recognition and broad appeal translate into resilient mid-board cash flow." },
  { id: "acropolis", name: "Acropolis", city: "Athens, Greece", phase: "Mid", flavor: "A history-first holding that converts upgrades directly into prestige pricing." },
  { id: "taj-mahal", name: "Taj Mahal", city: "Agra, India", phase: "Mid", flavor: "World-famous destination appeal gives this site strong value even before upgrades." },
  { id: "buckingham-palace", name: "Buckingham Palace", city: "London, UK", phase: "Mid", flavor: "A ceremonial icon that monetizes global attention exceptionally well." },
  { id: "cn-tower", name: "CN Tower", city: "Toronto, Canada", phase: "Late", flavor: "A skyline-heavy tower asset that marks the turn into the expensive late route." },
  { id: "petronas-towers", name: "Petronas Towers", city: "Kuala Lumpur, Malaysia", phase: "Late", flavor: "Twin-tower status and prestige branding create sharp late-game upside." },
  { id: "one-world-trade", name: "One World Trade Center", city: "New York, USA", phase: "Late", flavor: "A high-value skyscraper holding with strong rent scaling." },
  { id: "marina-bay-sands", name: "Marina Bay Sands", city: "Singapore", phase: "Late", flavor: "A skyline-defining mega complex with one of the cleanest late-board ceilings." },
  { id: "shanghai-tower", name: "Shanghai Tower", city: "Shanghai, China", phase: "Late", flavor: "Premium vertical real estate keeps this site punishing once improved." },
  { id: "chichen-itza", name: "Chichen Itza", city: "Yucatan, Mexico", phase: "Late", flavor: "A mega landmark with massive draw and heavyweight balance-sheet value." },
  { id: "machu-picchu", name: "Machu Picchu", city: "Cusco Region, Peru", phase: "Late", flavor: "Remote mystique commands top-tier income once capital reaches the final side." },
  { id: "angkor-wat", name: "Angkor Wat", city: "Siem Reap, Cambodia", phase: "Late", flavor: "Monumental cultural gravity converts directly into top-end portfolio strength." },
  { id: "burj-khalifa", name: "Burj Khalifa", city: "Dubai, UAE", phase: "Late", flavor: "The final skyscraper on the loop with the most dominant upgrade ceiling on the board." },
];

const LANDMARK_COSTS = [
  120, 130, 140, 150, 160, 170, 180, 190, 205, 220, 230, 240, 255, 265,
  280, 295, 310, 325, 340, 355, 370, 385, 400, 420, 440, 460, 480, 520,
];

const LANDMARK_DEFS = LANDMARK_SEEDS.map((seed, index) => {
  const cost = LANDMARK_COSTS[index];
  return {
    ...seed,
    cost,
    baseRent: Math.round(cost * 0.18),
    upgradeCost: Math.round(cost * 0.58),
    tone: TONE_PALETTE[index % TONE_PALETTE.length],
    image: LANDMARK_IMAGES[seed.id] ?? "assets/ui/world-landmark-main-board.png",
    miniProfile: LANDMARK_MINIATURES[seed.id]?.profile ?? "skyscraper",
    miniCrest: LANDMARK_MINIATURES[seed.id]?.crest ?? seed.name.slice(0, 2).toUpperCase(),
  };
});

const EVENT_DEFS = [
  { id: "start-square", title: "START", subtitle: "Launch Pad", icon: "S", badge: "START", eventType: "start", copy: "Pass for $200. Land exactly for a $150 launch bonus." },
  { id: "park-festival", title: "Park Festival", subtitle: "Neighborhood Boost", icon: "✿", badge: "BONUS", eventType: "tourism-boom", copy: "Gain $120 plus $25 per landmark you own." },
  { id: "city-tram", title: "City Tram", subtitle: "Shortcut Ride", icon: "↷", badge: "MOVE", eventType: "skybridge-charter", copy: "Move to the next landmark and resolve it immediately." },
  { id: "tax-square", title: "TAX", subtitle: "City Collection", icon: "$", badge: "TAX", eventType: "corner-tax", copy: "Pay a flat $150 city tax." },
  { id: "heritage-grant", title: "Heritage Grant", subtitle: "Restoration Fund", icon: "⬆", badge: "BONUS", eventType: "heritage-grant", copy: "Gain $80 plus $45 per Developed-or-better landmark." },
  { id: "permit-office", title: "Permit Office", subtitle: "Inspection Delay", icon: "⧗", badge: "HOLD", eventType: "customs-delay", copy: "Lose your next turn while permits clear." },
  { id: "free-parking", title: "FREE PARKING", subtitle: "Rest Stop", icon: "P", badge: "FREE", eventType: "free-parking", copy: "Safe corner. Collect a $50 parking rebate." },
  { id: "tourism-boom", title: "Tourism Boom", subtitle: "Crowd Surge", icon: "◎", badge: "BONUS", eventType: "media-spotlight", copy: "Gain $100 plus 75% of your highest current rent." },
  { id: "landmark-shuttle", title: "Landmark Shuttle", subtitle: "Acquisition Route", icon: "⇢", badge: "MOVE", eventType: "continental-connector", copy: "Advance to the next open landmark. If none remain, go to the next landmark." },
  { id: "world-event", title: "WORLD EVENT", subtitle: "Global Shockwave", icon: "W", badge: "EVENT", eventType: "world-event", copy: "Trigger a random global swing: bonus, tax, or a fast relocation." },
  { id: "renovation-bill", title: "Renovation Bill", subtitle: "Maintenance Sweep", icon: "⚒", badge: "TAX", eventType: "restoration-bill", copy: "Lose $70 plus 15% of your upgrade asset value." },
  { id: "charter-flight", title: "Charter Flight", subtitle: "Late-Board Express", icon: "✈", badge: "MOVE", eventType: "acquisition-flight", copy: "Advance to the next landmark, collect a $60 route bonus, and resolve it immediately." },
];

const AI_NAMES = ["Magnus AI", "Atlas Bot", "Oracle AI", "Apex Bot", "Profit Bot", "Wall St AI"];

// ── Synthesized sound effects (Web Audio API — no files needed) ───────────
let _audioCtx = null;
function _getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === "suspended") _audioCtx.resume().catch(() => {});
  return _audioCtx;
}
function _osc(ctx, freq, type, t, dur, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.015);
}
function _noise(ctx, t, dur, vol, fc) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass"; filt.frequency.value = fc || 1200; filt.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.buffer = buf; src.connect(filt); filt.connect(g); g.connect(ctx.destination);
  src.start(t); src.stop(t + dur + 0.015);
}
const SYNTH_SOUNDS = {
  roll(ctx) {
    const t = ctx.currentTime;
    _noise(ctx, t,       0.07, 0.28, 1600);
    _noise(ctx, t+0.08,  0.07, 0.22, 1200);
    _noise(ctx, t+0.17,  0.08, 0.18, 900);
    _noise(ctx, t+0.27,  0.12, 0.32, 700);
  },
  move(ctx) {
    _osc(ctx, 900, "sine", ctx.currentTime, 0.055, 0.1);
  },
  buy(ctx) {
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => _osc(ctx, f, "sine", t + i*0.09, 0.3, 0.2));
  },
  upgrade(ctx) {
    const t = ctx.currentTime;
    [330, 440, 554, 659, 880].forEach((f, i) => _osc(ctx, f, "triangle", t + i*0.07, 0.35, 0.18));
    _noise(ctx, t+0.1, 0.38, 0.07, 2200);
  },
  rent(ctx) {
    const t = ctx.currentTime;
    _osc(ctx, 1320, "sine", t,      0.06, 0.28);
    _osc(ctx, 1760, "sine", t+0.05, 0.07, 0.22);
    _osc(ctx, 880,  "sine", t+0.11, 0.18, 0.15);
    _noise(ctx, t, 0.1, 0.12, 3200);
  },
  tax(ctx) {
    const t = ctx.currentTime;
    [440, 370, 294].forEach((f, i) => _osc(ctx, f, "sawtooth", t + i*0.13, 0.28, 0.13));
  },
  win(ctx) {
    const t = ctx.currentTime;
    [523,659,784,659,784,1047].forEach((f,i) => _osc(ctx, f, "triangle", t+i*0.14, 0.32, 0.23));
    [261,329,392,523].forEach((f,i)          => _osc(ctx, f, "sine",     t+i*0.14, 0.5,  0.1));
  },
  turn_start(ctx) {
    const t = ctx.currentTime;
    _osc(ctx, 1174, "sine", t,    0.55, 0.28);
    _osc(ctx, 1568, "sine", t+0.1, 0.42, 0.18);
    _osc(ctx, 2093, "sine", t+0.2, 0.36, 0.12);
  },
  countdown_tick(ctx) {
    _osc(ctx, 880, "square", ctx.currentTime, 0.07, 0.07);
  },
  countdown_urgent(ctx) {
    const t = ctx.currentTime;
    _osc(ctx, 1320, "square", t,      0.08, 0.09);
    _osc(ctx, 990,  "square", t+0.05, 0.07, 0.07);
  },
  bonus(ctx) {
    const t = ctx.currentTime;
    [659, 784, 1047, 1319].forEach((f, i) => _osc(ctx, f, "sine", t + i*0.08, 0.28, 0.18));
  },
  event(ctx) {
    const t = ctx.currentTime;
    _osc(ctx, 440,  "triangle", t,     0.3, 0.2);
    _osc(ctx, 880,  "triangle", t+0.15, 0.2, 0.15);
    _noise(ctx, t, 0.25, 0.06, 600);
  },
  round_start(ctx) {
    const t = ctx.currentTime;
    _noise(ctx, t, 0.12, 0.18, 900);
    [392, 523, 659, 784, 1047].forEach((f, i) => _osc(ctx, f, "triangle", t + 0.05 + i*0.09, 0.38, 0.2));
    _osc(ctx, 1568, "sine", t + 0.55, 0.5, 0.22);
  },
  firework(ctx) {
    const t = ctx.currentTime;
    // launch whistle
    const osc = ctx.createOscillator();
    const gn  = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.18);
    gn.gain.setValueAtTime(0.25, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gn); gn.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.22);
    // explosion burst
    _noise(ctx, t + 0.18, 0.35, 0.45, 1400);
    _noise(ctx, t + 0.25, 0.28, 0.3,  800);
    // sparkle tones
    [523, 784, 1047, 1319, 1568].forEach((f, i) =>
      _osc(ctx, f, "sine", t + 0.22 + i * 0.07, 0.4, 0.15));
  },
};

const BOARD_POSITIONS = buildBoardPositions(BOARD_SIZE);
const SPACE_DEFS = buildSpaceDefs();

const ui = {
  board: document.querySelector("#board"),
  roundLabel: document.querySelector("#roundLabel"),
  eventLabel: document.querySelector("#eventLabel"),
  muteToggle: document.querySelector("#muteToggle"),
  turnCard: document.querySelector("#turnCard"),
  diceRow: document.querySelector("#diceRow"),
  rollButton: document.querySelector("#rollButton"),
  buyButton: document.querySelector("#buyButton"),
  upgradeButton: document.querySelector("#upgradeButton"),
  endTurnButton: document.querySelector("#endTurnButton"),
  hintText: document.querySelector("#hintText"),
  selectedSpaceCard: document.querySelector("#selectedSpaceCard"),
  playersStrip: document.querySelector("#playersStrip"),
  setupOverlay: document.querySelector("#setupOverlay"),
  setupForm: document.querySelector("#setupForm"),
  playerCountSelect: document.querySelector("#playerCountSelect"),
  playerFields: document.querySelector("#playerFields"),
  winnerOverlay: document.querySelector("#winnerOverlay"),
  winnerCard: document.querySelector("#winnerCard"),
  homeButton: document.querySelector("#homeButton"),
  stopGameButton: document.querySelector("#stopGameButton"),
  itemButton: document.querySelector("#itemButton"),
  itemModal: document.querySelector("#itemModal"),
  itemModalCard: document.querySelector("#itemModalCard"),
  modeOverlay: document.querySelector("#modeOverlay"),
  lobbyOverlay: document.querySelector("#lobbyOverlay"),
  lobbyCard: document.querySelector("#lobbyCard"),
};

const state = {
  players: [],
  landmarks: createLandmarkState(),
  currentPlayerIndex: 0,
  selectedSpaceIndex: 0,
  round: 1,
  dice: [1, 1],
  rolling: false,
  turnStarted: false,
  turnBusy: false,
  pendingAction: null,
  log: [],
  gameOver: false,
  winner: null,
  winnerReason: null,
  shopStock: [],
  itemModalTab: "shop",
  rankingReady: false,
  turnTimerSeconds: 0,
  soundEnabled: true,
  audioUnlocked: false,
};

let gameMode      = "single"; // "single" | "network"
let networkSocket = null;    // Socket.io socket (network mode only)

// ── Turn announce + countdown ──────────────────────────────────────────────
let _announceTimer      = null;
let _roundAnnounceTimer = null;
let _cdInterval         = null;
let _cdRemaining        = 0;

// audioCache kept for API compatibility (no-op with synth sounds)
const virtualClock = {
  now: 0,
  timers: [],
};

validateBoardLayout();
initialize();

// ── Custom confirm modal ───────────────────────────────────────────────────
function showConfirm(message, onYes) {
  const modal  = document.getElementById("confirmModal");
  const msgEl  = document.getElementById("confirmModalMessage");
  const yesBtn = document.getElementById("confirmModalYes");
  const noBtn  = document.getElementById("confirmModalNo");
  if (!modal) { onYes?.(); return; }
  msgEl.textContent = message;
  modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");
  yesBtn.onclick = () => { close(); onYes?.(); };
  noBtn.onclick  = () => { close(); };
}

// ── Hide all in-game overlays (turn/round announce) ───────────────────────
function clearAnnounceOverlays() {
  const ta = document.getElementById("turnAnnounce");
  const ra = document.getElementById("roundAnnounce");
  if (ta) ta.classList.add("hidden");
  if (ra) ra.classList.add("hidden");
  if (_announceTimer)      { clearTimeout(_announceTimer);      _announceTimer = null; }
  if (_roundAnnounceTimer) { clearTimeout(_roundAnnounceTimer); _roundAnnounceTimer = null; }
}

function initialize() {
  ui.board.style.setProperty("--board-size", String(BOARD_SIZE));
  renderPlayerFields(Number(ui.playerCountSelect.value));
  ui.playerCountSelect.addEventListener("change", () => {
    renderPlayerFields(Number(ui.playerCountSelect.value));
  });
  document.querySelectorAll('input[name="uiPlayerCount"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      ui.playerCountSelect.value = radio.value;
      ui.playerCountSelect.dispatchEvent(new Event("change"));
    });
  });
  // Restore saved round limit selection
  const savedRoundLimit = localStorage.getItem("bgame_roundLimit");
  if (savedRoundLimit) {
    const sel = document.getElementById("roundLimitSelect");
    if (sel) sel.value = savedRoundLimit;
  }
  ui.setupForm.addEventListener("submit", handleSetupSubmit);
  ui.rollButton.addEventListener("click", handleRoll);
  ui.buyButton.addEventListener("click", handleBuyAction);
  ui.upgradeButton.addEventListener("click", handleUpgradeAction);
  ui.endTurnButton.addEventListener("click", handleEndTurn);
  ui.itemButton.addEventListener("click", () => openItemModal("shop"));
  if (ui.muteToggle) {
    ui.muteToggle.addEventListener("click", toggleSound);
  }
  if (ui.homeButton) {
    ui.homeButton.addEventListener("click", () => {
      const doNav = () => {
        stopTurnTimer();
        clearAnnounceOverlays();
        if (gameMode === "network") {
          ui.lobbyOverlay.classList.remove("hidden");
          renderLobby("home");
        } else {
          ui.setupOverlay.classList.add("hidden");
          ui.modeOverlay.classList.remove("hidden");
        }
      };
      if (!state.players.length || state.gameOver) {
        doNav();
      } else {
        showConfirm("End the current game and return to Select Game Mode?", doNav);
      }
    });
  }
  if (ui.stopGameButton) {
    ui.stopGameButton.addEventListener("click", () => {
      const doEnd = () => {
        stopTurnTimer();
        clearAnnounceOverlays();
        ui.winnerOverlay.classList.add("hidden");
        if (gameMode === "network") {
          ui.lobbyOverlay.classList.remove("hidden");
          renderLobby("home");
        } else {
          ui.setupOverlay.classList.remove("hidden");
          ui.modeOverlay.classList.add("hidden");
        }
      };
      if (!state.players.length || state.gameOver) {
        doEnd();
      } else {
        showConfirm("End the current game and return to Local Play setup?", doEnd);
      }
    });
  }

  // Mode selection
  document.querySelector("#modeSingleBtn")?.addEventListener("click", () => {
    gameMode = "single";
    ui.modeOverlay.classList.add("hidden");
    ui.setupOverlay.classList.remove("hidden");
  });
  document.querySelector("#modeNetworkBtn")?.addEventListener("click", () => {
    gameMode = "network";
    ui.modeOverlay.classList.add("hidden");
    ui.lobbyOverlay.classList.remove("hidden");
    renderLobby("home");
  });
  document.addEventListener("keydown", handleHotkeys);
  primeAudio();
  exposeDebugHooks();
  render();
}

function buildBoardPositions(size) {
  const positions = [];

  for (let column = 1; column <= size; column += 1) {
    positions.push([size, column]);
  }
  for (let row = size - 1; row >= 1; row -= 1) {
    positions.push([row, size]);
  }
  for (let column = size - 1; column >= 1; column -= 1) {
    positions.push([1, column]);
  }
  for (let row = 2; row <= size - 1; row += 1) {
    positions.push([row, 1]);
  }

  return positions;
}

function buildSpaceDefs() {
  const eventByPosition = new Map(EVENT_POSITIONS.map((position, index) => [position, EVENT_DEFS[index]]));
  const spaces = [];
  let landmarkIndex = 0;

  for (let index = 0; index < BOARD_SPACES; index += 1) {
    if (eventByPosition.has(index)) {
      const event = eventByPosition.get(index);
      spaces.push({
        id: event.id,
        type: "event",
        ...event,
      });
      continue;
    }

    const landmark = LANDMARK_DEFS[landmarkIndex];
    spaces.push({
      id: `${landmark.id}-space`,
      type: "landmark",
      landmarkId: landmark.id,
    });
    landmarkIndex += 1;
  }

  return spaces;
}

function validateBoardLayout() {
  if (BOARD_POSITIONS.length !== BOARD_SPACES) {
    console.warn(`Expected ${BOARD_SPACES} board positions, got ${BOARD_POSITIONS.length}.`);
  }
  if (SPACE_DEFS.length !== BOARD_SPACES) {
    console.warn(`Expected ${BOARD_SPACES} spaces, got ${SPACE_DEFS.length}.`);
  }
  const landmarkSpaces = SPACE_DEFS.filter((space) => space.type === "landmark").length;
  const eventSpaces = SPACE_DEFS.filter((space) => space.type === "event").length;
  if (landmarkSpaces !== 28 || eventSpaces !== 12) {
    console.warn(`Expected 28 landmarks and 12 events, got ${landmarkSpaces} and ${eventSpaces}.`);
  }
}

function createLandmarkState() {
  return LANDMARK_DEFS.map((landmark) => ({
    ...landmark,
    ownerId: null,
    level: 0,
  }));
}

function handleHotkeys(event) {
  if (isTypingTarget(event.target)) {
    return;
  }

  const key = event.key.toLowerCase();
  const isSpaceKey = event.code === "Space" || key === " " || key === "space" || key === "spacebar";

  if (key === "f") {
    event.preventDefault();
    toggleFullscreen();
    return;
  }

  if (!ui.setupOverlay.classList.contains("hidden")) {
    return;
  }

  if (key === "r") {
    handleRoll();
    return;
  }

  if (key === "b") {
    handleBuyAction();
    return;
  }

  if (key === "u") {
    handleUpgradeAction();
    return;
  }

  if (key === "e") {
    handleEndTurn();
    return;
  }

  if (isSpaceKey || key === "enter") {
    event.preventDefault();
    handleContextAction();
  }
}

function isTypingTarget(target) {
  return target instanceof HTMLElement &&
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function renderPlayerFields(count) {
  ui.playerFields.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const defaultColorIndex = index % COLOR_PALETTE.length;
    const wrapper = document.createElement("div");
    wrapper.className = "player-field-row";
    wrapper.dataset.selectedColor = defaultColorIndex;
    wrapper.dataset.isAi = "0";
    wrapper.innerHTML = `
      <div class="player-field-header">
        <span class="player-field-num" style="background:${COLOR_PALETTE[defaultColorIndex].color}; color:#07131e;">P${index + 1}</span>
        <input
          type="text"
          name="player-${index}"
          maxlength="18"
          value="Investor ${index + 1}"
          autocomplete="off"
          class="player-name-input"
        />
        <button type="button" class="ai-toggle-btn" data-player-index="${index}" onclick="toggleAIPlayer(this)">🤖 AI</button>
      </div>
      <div class="color-swatch-row">
        ${COLOR_PALETTE.map((c, ci) => `
          <button type="button" class="color-swatch ${ci === defaultColorIndex ? "selected" : ""}"
            data-color-index="${ci}"
            style="background:${c.color};"
            title="${c.label}"
          ></button>
        `).join("")}
      </div>
    `;
    ui.playerFields.append(wrapper);
  }

  attachSwatchListeners();
}

function attachSwatchListeners() {
  const allRows = Array.from(ui.playerFields.querySelectorAll(".player-field-row"));

  allRows.forEach((row) => {
    row.querySelectorAll(".color-swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        if (swatch.disabled) return;
        const colorIndex = Number(swatch.dataset.colorIndex);
        row.dataset.selectedColor = colorIndex;

        row.querySelectorAll(".color-swatch").forEach((s) => {
          s.classList.toggle("selected", Number(s.dataset.colorIndex) === colorIndex);
        });

        const numChip = row.querySelector(".player-field-num");
        if (numChip) numChip.style.background = COLOR_PALETTE[colorIndex].color;

        updateSwatchTakenStates(allRows);
      });
    });
  });

  updateSwatchTakenStates(allRows);
}

function toggleAIPlayer(btn) {
  const row = btn.closest(".player-field-row");
  const nowAI = row.dataset.isAi !== "1";
  row.dataset.isAi = nowAI ? "1" : "0";
  btn.classList.toggle("active", nowAI);
  const nameInput = row.querySelector(".player-name-input");
  const idx = parseInt(btn.dataset.playerIndex, 10);
  if (nowAI) {
    nameInput.value    = AI_NAMES[idx % AI_NAMES.length];
    nameInput.disabled = true;
  } else {
    nameInput.value    = `Investor ${idx + 1}`;
    nameInput.disabled = false;
  }
}

function updateSwatchTakenStates(allRows) {
  const takenIndices = new Set(allRows.map((r) => Number(r.dataset.selectedColor)));

  allRows.forEach((row) => {
    const myIndex = Number(row.dataset.selectedColor);
    row.querySelectorAll(".color-swatch").forEach((swatch) => {
      const ci = Number(swatch.dataset.colorIndex);
      const isTaken = ci !== myIndex && takenIndices.has(ci);
      swatch.disabled = isTaken;
      swatch.classList.toggle("taken", isTaken);
    });
  });
}

function backToModeSelect() {
  ui.setupOverlay.classList.add("hidden");
  ui.modeOverlay.classList.remove("hidden");
}

function handleSetupSubmit(event) {
  event.preventDefault();
  const count = Number(ui.playerCountSelect.value);
  const rows = Array.from(ui.playerFields.querySelectorAll(".player-field-row")).slice(0, count);
  const names = rows.map((row, index) => row.querySelector("input")?.value.trim() || `Investor ${index + 1}`);
  const colorIndices = rows.map((row) => Number(row.dataset.selectedColor));

  const turnTimerSeconds = Number(document.querySelector('input[name="uiTurnTimer"]:checked')?.value ?? 0);
  const aiFlags = rows.map(row => row.dataset.isAi === "1");
  const newRoundLimit = Number(document.getElementById("roundLimitSelect")?.value) || ROUND_LIMIT;
  activeRoundLimit = newRoundLimit;
  localStorage.setItem("bgame_roundLimit", newRoundLimit);
  startGame(names, colorIndices, turnTimerSeconds, aiFlags);
}

function startGame(names, colorIndices = [], turnTimerSeconds = 0, aiFlags = []) {
  resetVirtualClock();
  state.players = names.map((name, index) => {
    const paletteIndex = colorIndices[index] ?? index % COLOR_PALETTE.length;
    const style = COLOR_PALETTE[paletteIndex];
    return {
    id: `player-${index}`,
    name,
    color: style.color,
    glow: style.glow,
    colorName: style.label,
    marker: index + 1,
    cash: STARTING_CASH,
    position: 0,
    skipTurns: 0,
    bankrupt: false,
    isAI: aiFlags[index] ?? false,
    inventory: [],
    activeEffects: [],
    };
  });
  state.landmarks = createLandmarkState();
  state.currentPlayerIndex = 0;
  state.selectedSpaceIndex = 0;
  state.round = 1;
  state.dice = [1, 1];
  state.rolling = false;
  state.turnStarted = false;
  state.turnBusy = false;
  state.pendingAction = null;
  state.log = [];
  state.gameOver = false;
  state.winner = null;
  state.winnerReason = null;
  state.shopStock = generateShopStock();
  state.rankingReady = false;
  state.turnTimerSeconds = Number(turnTimerSeconds) || 0;

  addLog(
    `${currentPlayer().name} begins on START with $${formatMoney(STARTING_CASH)} and a full 40-space board to circle.`,
  );
  addLog(
    `Corner route: START, TAX, FREE PARKING, WORLD EVENT. Final ranking is total assets, and ${MAJOR_VICTORY_GLOBALS} Global Landmarks trigger the final audit.`,
  );

  ui.setupOverlay.classList.add("hidden");
  ui.winnerOverlay.classList.add("hidden");
  primeAudio();
  render();
  // Defer one frame so .board-center is laid out before positioning
  requestAnimationFrame(() => {
    showRoundAnnounce(1);
    setTimeout(() => showTurnAnnounce(currentPlayer()), 2600);
    if (state.turnTimerSeconds > 0) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 5000);
    if (currentPlayer()?.isAI) setTimeout(runAITurn, 4400);
  });
}

function render() {
  renderTopBar();
  renderBoard();
  renderTurnPanel();
  renderDice();
  renderSelectedSpace();
  renderPlayers();
  renderControls();
}

function renderTopBar() {
  ui.roundLabel.textContent = `${Math.min(state.round, activeRoundLimit)} / ${activeRoundLimit}`;
  ui.eventLabel.textContent = getTopbarEventText();
  ui.muteToggle.textContent = state.soundEnabled ? "Sound On" : "Sound Off";
}

function getTopbarEventText() {
  if (!state.log.length) {
    return `Collect ${MAJOR_VICTORY_GLOBALS} Global Landmarks or survive ${activeRoundLimit} rounds.`;
  }

  return shortenText(state.log[0], 78);
}

function renderBoard() {
  ui.board.innerHTML = "";

  SPACE_DEFS.forEach((space, index) => {
    const [row, column] = BOARD_POSITIONS[index];
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `space ${space.type}`;
    tile.style.gridArea = `${row} / ${column} / span 1 / span 1`;
    tile.classList.toggle("is-selected", state.selectedSpaceIndex === index);
    const isCurrent = Boolean(currentPlayer() && currentPlayer().position === index && !state.gameOver);
    tile.classList.toggle("is-current", isCurrent);
    if (isCurrent) {
      tile.style.setProperty("--current-color", currentPlayer().color);
      tile.style.setProperty("--current-glow", currentPlayer().glow);
    }
    tile.classList.toggle("corner", CORNER_INDICES.has(index));

    if (space.type === "landmark") {
      const landmark = getLandmark(space.landmarkId);
      const owner = getPlayerById(landmark.ownerId);
      tile.style.setProperty("--space-accent", landmark.tone);
      tile.style.setProperty("--owner-color", owner?.color ?? "rgba(255, 255, 255, 0.12)");
      tile.style.setProperty("--owner-glow", owner?.glow ?? "rgba(255, 255, 255, 0)");
      tile.classList.toggle("is-owned", Boolean(owner));
      tile.innerHTML = renderLandmarkTile(index, landmark, owner);
    } else {
      tile.style.setProperty("--space-accent", "rgba(89, 198, 193, 0.16)");
      tile.style.setProperty("--owner-color", "rgba(89, 198, 193, 0.42)");
      tile.style.setProperty("--owner-glow", "rgba(89, 198, 193, 0.24)");
      tile.innerHTML = renderEventTile(index, space);
    }

    tile.addEventListener("click", () => {
      state.selectedSpaceIndex = index;
      render();
    });

    ui.board.append(tile);
  });

  ui.board.append(renderBoardCenter());
}

function renderLandmarkTile(index, landmark, owner) {
  const tierChip = owner ? SHORT_TIER_LABELS[landmark.level] : "OPEN";
  return `
    <div class="space-topline ${owner ? "topline-owned" : ""}" ${owner ? `style="--owner-color:${owner.color};"` : ""}>
      ${owner
        ? `<span class="space-chip space-owner-chip" style="background:${owner.color}; color:#07131e;">P${owner.marker}</span>`
        : `<span></span>`
      }
      <span class="space-chip ${owner ? "topline-tier-chip" : "neutral"}">${tierChip}</span>
    </div>
    <div class="space-plaza">
      <div class="space-img-backdrop ${owner ? `is-owned tier-${landmark.level}` : `phase-${landmark.phase.toLowerCase()}`}"
        style="--lm-image:url('${landmark.image}'); --owner-color:${owner?.color ?? "transparent"}; --owner-glow:${owner?.glow ?? "rgba(255,255,255,0)"};"
      >
        <div class="space-corner-prices">
          <span class="space-price-tag">$${formatMoney(landmark.cost)}</span>
          <span class="space-price-tag income">$${formatMoney(getLandmarkRent(landmark))}</span>
        </div>
      </div>
      <div class="token-list">${renderTokensForSpace(index)}</div>
    </div>
  `;
}

function renderEventTile(index, space) {
  return `
    <div class="space-topline">
      <span class="space-chip neutral">${space.badge}</span>
      <span></span>
    </div>
    <div class="space-plaza event-plaza">
      <div class="event-core">
        <span class="event-glyph">${space.icon}</span>
      </div>
      <div class="token-list">${renderTokensForSpace(index)}</div>
    </div>
    <div class="space-caption">
      <span class="space-value-pill event">${shortenText(space.subtitle, 20)}</span>
    </div>
  `;
}

function renderMiniatureScene(landmark, owner) {
  if (!owner) {
    return `
      <div class="miniature-scene is-open phase-${landmark.phase.toLowerCase()}">
        <div class="miniature-ring"></div>
        <div class="miniature-plinth"></div>
        <div class="miniature-open-lot">
          <span class="miniature-open-marker">${landmark.miniCrest}</span>
        </div>
      </div>
    `;
  }

  return `
    <div
      class="miniature-scene is-owned tier-${landmark.level} profile-${landmark.miniProfile}"
      style="--owner-color:${owner.color}; --owner-glow:${owner.glow};"
    >
      <div class="miniature-ring"></div>
      <div class="miniature-plinth"></div>
      <div class="miniature-model">
        ${getMiniatureBlocks(landmark).map(renderMiniatureBlock).join("")}
      </div>
      <span class="miniature-plaque">${landmark.miniCrest}</span>
      <span class="miniature-flag">${owner.marker}</span>
    </div>
  `;
}

function renderMiniatureBlock(block) {
  return `
    <span
      class="miniature-block ${block.kind} ${block.shape ?? "slab"}"
      style="--x:${block.x}; --w:${block.w}; --h:${block.h}; --lift:${block.lift ?? 0};"
    ></span>
  `;
}

function getMiniatureBlocks(landmark) {
  const level = landmark.level;
  switch (landmark.miniProfile) {
    case "garden":
      return buildGardenMini(level);
    case "bridge":
      return buildBridgeMini(level);
    case "clocktower":
      return buildClocktowerMini(level);
    case "heritage":
      return buildHeritageMini(level);
    case "cathedral":
      return buildCathedralMini(level);
    case "statue":
      return buildStatueMini(level);
    case "palace":
      return buildPalaceMini(level);
    case "opera":
      return buildOperaMini(level);
    case "twinspire":
      return buildTwinSpireMini(level);
    case "skydeck":
      return buildSkydeckMini(level);
    case "skyscraper":
      return buildSkyscraperMini(level);
    case "spire":
    default:
      return buildSpireMini(level);
  }
}

function buildGardenMini(level) {
  const canopy = [20, 28, 34, 40][level];
  return [
    { kind: "stone", shape: "slab", x: 22, w: 56, h: 14, lift: 10 },
    { kind: "marble", shape: "roof", x: 30, w: 40, h: 16 + level * 3, lift: 18 },
    { kind: "green", shape: "round", x: 18, w: canopy, h: canopy, lift: 18 + level * 4 },
    { kind: "green", shape: "round", x: 62 - canopy / 2, w: canopy, h: canopy, lift: 18 + level * 4 },
    ...(level >= 2 ? [{ kind: "gold", shape: "crown", x: 43, w: 14, h: 12, lift: 42 }] : []),
  ];
}

function buildSpireMini(level) {
  const height = [32, 46, 62, 84][level];
  return [
    { kind: "stone", shape: "slab", x: 20, w: 60, h: 16, lift: 8 },
    { kind: "glass", shape: "spire", x: 44, w: 12, h: height, lift: 18 },
    ...(level >= 1
      ? [
          { kind: "glass", shape: "spire", x: 28, w: 10, h: Math.round(height * 0.48), lift: 18 },
          { kind: "glass", shape: "spire", x: 62, w: 10, h: Math.round(height * 0.48), lift: 18 },
        ]
      : []),
    ...(level >= 2 ? [{ kind: "gold", shape: "crown", x: 46, w: 8, h: 14, lift: 18 + height - 4 }] : []),
  ];
}

function buildBridgeMini(level) {
  const towerHeight = [28, 38, 48, 62][level];
  return [
    { kind: "stone", shape: "slab", x: 14, w: 72, h: 16, lift: 8 },
    { kind: "stone", shape: "arch", x: 20, w: 16, h: towerHeight, lift: 18 },
    { kind: "stone", shape: "arch", x: 64, w: 16, h: towerHeight, lift: 18 },
    { kind: "gold", shape: "roof", x: 28, w: 44, h: 10 + level * 2, lift: 28 + Math.round(towerHeight * 0.35) },
    ...(level >= 2 ? [{ kind: "glass", shape: "slab", x: 42, w: 16, h: 18, lift: 18 }] : []),
  ];
}

function buildClocktowerMini(level) {
  const towerHeight = [34, 46, 58, 74][level];
  return [
    { kind: "stone", shape: "slab", x: 18, w: 64, h: 16, lift: 8 },
    { kind: "stone", shape: "spire", x: 42, w: 16, h: towerHeight, lift: 18 },
    { kind: "gold", shape: "roof", x: 40, w: 20, h: 12 + level * 3, lift: 18 + towerHeight - 6 },
    ...(level >= 2 ? [{ kind: "stone", shape: "slab", x: 24, w: 18, h: 18, lift: 18 }] : []),
  ];
}

function buildHeritageMini(level) {
  const midHeight = [24, 30, 36, 42][level];
  return [
    { kind: "stone", shape: "slab", x: 16, w: 68, h: 14, lift: 8 },
    { kind: "stone", shape: "arch", x: 18, w: 64, h: 16 + level * 4, lift: 18 },
    { kind: "marble", shape: "roof", x: 28, w: 44, h: midHeight, lift: 24 },
    ...(level >= 2 ? [{ kind: "gold", shape: "dome", x: 40, w: 20, h: 16, lift: 30 + midHeight - 10 }] : []),
  ];
}

function buildCathedralMini(level) {
  const centerHeight = [28, 40, 52, 68][level];
  return [
    { kind: "stone", shape: "slab", x: 16, w: 68, h: 16, lift: 8 },
    { kind: "stone", shape: "spire", x: 42, w: 18, h: centerHeight, lift: 18 },
    { kind: "stone", shape: "spire", x: 26, w: 12, h: 18 + level * 8, lift: 18 },
    { kind: "stone", shape: "spire", x: 62, w: 12, h: 18 + level * 8, lift: 18 },
    ...(level >= 1 ? [{ kind: "gold", shape: "dome", x: 40, w: 22, h: 18, lift: 28 + Math.round(centerHeight * 0.35) }] : []),
  ];
}

function buildStatueMini(level) {
  const figureHeight = [28, 40, 54, 68][level];
  return [
    { kind: "stone", shape: "slab", x: 20, w: 60, h: 16, lift: 8 },
    { kind: "stone", shape: "slab", x: 36, w: 28, h: 20 + level * 4, lift: 18 },
    { kind: "gold", shape: "spire", x: 45, w: 10, h: figureHeight, lift: 24 + level * 3 },
    ...(level >= 2 ? [{ kind: "gold", shape: "crown", x: 42, w: 16, h: 12, lift: 24 + level * 3 + figureHeight - 4 }] : []),
  ];
}

function buildPalaceMini(level) {
  const domeHeight = [18, 24, 30, 38][level];
  return [
    { kind: "stone", shape: "slab", x: 14, w: 72, h: 16, lift: 8 },
    { kind: "marble", shape: "slab", x: 18, w: 64, h: 20 + level * 4, lift: 18 },
    { kind: "marble", shape: "dome", x: 38, w: 24, h: domeHeight, lift: 32 + level * 3 },
    ...(level >= 1
      ? [
          { kind: "marble", shape: "roof", x: 22, w: 18, h: 14, lift: 30 },
          { kind: "marble", shape: "roof", x: 60, w: 18, h: 14, lift: 30 },
        ]
      : []),
    ...(level >= 3 ? [{ kind: "gold", shape: "crown", x: 45, w: 10, h: 12, lift: 46 }] : []),
  ];
}

function buildOperaMini(level) {
  const shellHeight = [18, 24, 32, 40][level];
  return [
    { kind: "stone", shape: "slab", x: 16, w: 68, h: 16, lift: 8 },
    { kind: "marble", shape: "shell", x: 20, w: 24, h: shellHeight, lift: 18 },
    { kind: "marble", shape: "shell", x: 38, w: 24, h: shellHeight + 6, lift: 20 },
    { kind: "marble", shape: "shell", x: 56, w: 24, h: shellHeight - 2, lift: 18 },
    ...(level >= 2 ? [{ kind: "gold", shape: "slab", x: 30, w: 40, h: 10, lift: 16 }] : []),
  ];
}

function buildTwinSpireMini(level) {
  const height = [34, 46, 60, 76][level];
  return [
    { kind: "stone", shape: "slab", x: 16, w: 68, h: 16, lift: 8 },
    { kind: "glass", shape: "spire", x: 28, w: 14, h: height, lift: 18 },
    { kind: "glass", shape: "spire", x: 58, w: 14, h: height, lift: 18 },
    { kind: "gold", shape: "roof", x: 36, w: 28, h: 10 + level * 2, lift: 24 + Math.round(height * 0.45) },
    ...(level >= 3 ? [{ kind: "gold", shape: "crown", x: 31, w: 38, h: 12, lift: 18 + height - 4 }] : []),
  ];
}

function buildSkydeckMini(level) {
  const sideHeight = [26, 36, 46, 56][level];
  const centerHeight = [32, 44, 58, 72][level];
  return [
    { kind: "stone", shape: "slab", x: 14, w: 72, h: 16, lift: 8 },
    { kind: "glass", shape: "spire", x: 22, w: 14, h: sideHeight, lift: 18 },
    { kind: "glass", shape: "spire", x: 43, w: 14, h: centerHeight, lift: 18 },
    { kind: "glass", shape: "spire", x: 64, w: 14, h: sideHeight, lift: 18 },
    { kind: "marble", shape: "roof", x: 18, w: 64, h: 10 + level * 2, lift: 26 + Math.round(sideHeight * 0.85) },
  ];
}

function buildSkyscraperMini(level) {
  const mainHeight = [30, 42, 56, 70][level];
  return [
    { kind: "stone", shape: "slab", x: 16, w: 68, h: 16, lift: 8 },
    { kind: "glass", shape: "spire", x: 24, w: 16, h: Math.round(mainHeight * 0.65), lift: 18 },
    { kind: "glass", shape: "spire", x: 44, w: 14, h: mainHeight, lift: 18 },
    { kind: "glass", shape: "spire", x: 60, w: 18, h: Math.round(mainHeight * 0.82), lift: 18 },
    ...(level >= 2 ? [{ kind: "gold", shape: "crown", x: 47, w: 8, h: 12, lift: 18 + mainHeight - 4 }] : []),
  ];
}

function renderBoardCenter() {
  const center = document.createElement("section");
  center.className = "board-center";
  center.style.gridArea = "2 / 2 / 11 / 11";
  return center;
}

function getSpotlightData(space) {
  if (space.type === "landmark") {
    const landmark = getLandmark(space.landmarkId);
    const owner = getPlayerById(landmark.ownerId);
    return {
      eyebrow: owner ? `${owner.name} controls this ${landmark.phase.toLowerCase()} route site` : `${landmark.phase} route acquisition target`,
      title: landmark.name,
      body: `${landmark.city}. ${landmark.flavor}`,
      image: landmark.image,
    };
  }

  return {
    eyebrow: "Event space",
    title: space.title,
    body: `${space.subtitle}. ${space.copy}`,
    image: "assets/ui/world-landmark-main-board.png",
  };
}

function renderTokensForSpace(index) {
  return activePlayers()
    .filter((player) => player.position === index)
    .map(
      (player) => `
        <span class="token" style="background:${player.color}; box-shadow:0 0 0 1px rgba(255,255,255,0.16), 0 0 18px ${player.glow};">
          ${player.marker}
        </span>
      `,
    )
    .join("");
}

function shortenTileName(name) {
  const compact = name.replace("Center", "Ctr");
  return compact.length > 22 ? `${compact.slice(0, 21).trimEnd()}…` : compact;
}

function shortenText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function renderTurnPanel() {
  const player = currentPlayer();

  if (!player) {
    ui.turnCard.innerHTML = `
      <div class="turn-brief">
        <p class="eyebrow">Table Status</p>
        <h2>No Active Player</h2>
      </div>
    `;
    return;
  }

  const landmarkValue = getLandmarkAssetValue(player);
  const upgradeValue = getUpgradeAssetValue(player);
  const holdingsCount = ownedLandmarks(player.id).length;
  const currentSpace = getSpaceTitle(getSpace(player.position));
  const rank = rankedPlayers().findIndex((entry) => entry.id === player.id) + 1;
  const status = state.gameOver
    ? "Final audit closed"
    : state.turnBusy
      ? "Traveling"
      : state.turnStarted
        ? "Investment window open"
        : "Awaiting roll";

  const holdings = ownedLandmarks(player.id);

  const buildingsHtml = holdings.length > 0 ? `
    <div class="turn-subsection">
      <span class="turn-sub-label">🏛 Buildings</span>
      <div class="turn-buildings">
        ${holdings.map((lm) => `
          <div class="turn-bld-row">
            <img class="turn-bld-img" src="${lm.image}" alt="${lm.name}" loading="lazy">
            <div class="turn-bld-info">
              <span class="turn-bld-name">${lm.name}</span>
              <div class="turn-bld-meta">
                <span class="turn-bld-tier" style="color:${player.color};">${SHORT_TIER_LABELS[lm.level]}</span>
                <span class="turn-bld-val">$${formatMoney(getLandmarkValue(lm))}</span>
              </div>
            </div>
          </div>`).join("")}
      </div>
    </div>` : "";

  const inventoryHtml = player.inventory.length > 0 ? `
    <div class="turn-subsection">
      <span class="turn-sub-label">🎒 Inventory</span>
      <div class="turn-items">
        ${player.inventory.map((itemId) => {
          const item = ITEM_DEFS.find((d) => d.id === itemId);
          if (!item) return "";
          const g = ITEM_GRADE[item.grade];
          return `<div class="turn-item-chip" style="border-color:${g.color};">
            <span class="turn-item-icon">${item.icon}</span>
            <span class="turn-item-name" style="color:${g.color};">${item.name}</span>
          </div>`;
        }).join("")}
      </div>
    </div>` : "";

  ui.turnCard.innerHTML = `
    <div class="turn-brief">
      <div class="turn-brief-head">
        <p class="eyebrow">Current Investor</p>
        <span class="turn-pill" style="--owner-color:${player.color}; --owner-glow:${player.glow};">
          ${status}
        </span>
      </div>
      <div class="turn-hero">
        <span class="player-dot" style="background:${player.color}; box-shadow:0 0 16px ${player.glow};"></span>
        <div>
          <h2 class="current-player-name">${player.name}</h2>
          <p class="turn-subtitle">${player.colorName} investor · rank #${rank}</p>
        </div>
      </div>
      <div class="turn-brief-meta">
        <span class="turn-meta-pill">On ${currentSpace}</span>
        <span class="turn-meta-pill">${holdingsCount} landmarks</span>
        <span class="turn-meta-pill">${countGlobalLandmarks(player.id)} global</span>
      </div>
      <div class="turn-brief-grid">
        <div class="stat-block">
          <span class="stat-label">Cash</span>
          <strong class="stat-value">$${formatMoney(player.cash)}</strong>
        </div>
        <div class="stat-block">
          <span class="stat-label">Assets</span>
          <strong class="stat-value">$${formatMoney(getTotalAssets(player))}</strong>
        </div>
        <div class="stat-block">
          <span class="stat-label">Landmarks</span>
          <strong class="stat-value">$${formatMoney(landmarkValue)}</strong>
        </div>
        <div class="stat-block">
          <span class="stat-label">Upgrades</span>
          <strong class="stat-value">$${formatMoney(upgradeValue)}</strong>
        </div>
      </div>
      <div class="turn-scroll-area">
        ${buildingsHtml}
        ${inventoryHtml}
      </div>
    </div>
  `;
}

function renderDice() {
  ui.diceRow.innerHTML = state.dice
    .map((value) => createDieMarkup(value, state.rolling))
    .join("");
}

function createDieMarkup(value, rolling) {
  const rotations = {
    1: "rotateX(0deg) rotateY(0deg)",
    2: "rotateX(90deg) rotateY(0deg)",
    3: "rotateY(-90deg)",
    4: "rotateY(90deg)",
    5: "rotateX(-90deg) rotateY(0deg)",
    6: "rotateY(180deg)",
  };

  const faces = [1, 2, 3, 4, 5, 6]
    .map((n) => `<div class="die-face face-${n}">${createFacePips(n)}</div>`)
    .join("");

  return `
    <div class="die-wrapper">
      <div class="die-3d ${rolling ? "rolling" : ""}" style="--die-transform: ${rotations[value]};">
        ${faces}
      </div>
    </div>
  `;
}

function createFacePips(value) {
  const activePips = new Set(
    {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    }[value],
  );

  return Array.from(
    { length: 9 },
    (_, index) => `<span class="pip ${activePips.has(index) ? "active" : ""}"></span>`,
  ).join("");
}

function renderSelectedSpace() {
  const player = currentPlayer();
  const space = getSpace(state.selectedSpaceIndex);

  if (space.type === "landmark") {
    const landmark = getLandmark(space.landmarkId);
    const owner = getPlayerById(landmark.ownerId);
    const nextRent = landmark.level < MAX_UPGRADE_LEVEL
      ? getRentForLevel(landmark.baseRent, landmark.level + 1) : null;
    const totalInvested = landmark.cost + landmark.level * landmark.upgradeCost;
    const rentProgression = RENT_MULTIPLIERS.map((_, lv) =>
      getRentForLevel(landmark.baseRent, lv));

    if (owner) {
      ui.selectedSpaceCard.innerHTML = `
        <div class="focus-card dock-focus-card">
          <div class="focus-header">
            <div>
              <p class="eyebrow">Owned Landmark</p>
              <h2 class="selected-title">${landmark.name}</h2>
              <p>${landmark.city}</p>
            </div>
            <span class="selection-badge phase-${landmark.phase.toLowerCase()}">${landmark.phase}</span>
          </div>
          <div class="ownership-banner" style="--owner-color:${owner.color}; --owner-glow:${owner.glow};">
            <span class="ownership-dot" style="background:${owner.color}; box-shadow:0 0 8px ${owner.glow};"></span>
            <span class="ownership-name">${owner.name}</span>
            <span class="ownership-label">controls this property</span>
          </div>
          <div class="tier-track">
            ${UPGRADE_LEVELS.map((label, lv) => `
              <div class="tier-step ${lv <= landmark.level ? "reached" : ""} ${lv === landmark.level ? "current" : ""}" style="${lv <= landmark.level ? `--owner-color:${owner.color};` : ""}">
                <span class="tier-step-chip">${SHORT_TIER_LABELS[lv]}</span>
                <span class="tier-step-rent">$${formatMoney(rentProgression[lv])}</span>
              </div>
            `).join("")}
          </div>
          <div class="focus-thumbnail" style="--selected-image:url('${landmark.image}')"></div>
          <div class="focus-stats">
            <div class="stat-block">
              <span class="stat-label">Current Rent</span>
              <strong class="stat-value income">$${formatMoney(getLandmarkRent(landmark))}</strong>
            </div>
            <div class="stat-block">
              <span class="stat-label">Next Level Rent</span>
              <strong class="stat-value">${nextRent ? `$${formatMoney(nextRent)}` : "—"}</strong>
            </div>
            <div class="stat-block">
              <span class="stat-label">Upgrade Cost</span>
              <strong class="stat-value">${landmark.level < MAX_UPGRADE_LEVEL ? `$${formatMoney(landmark.upgradeCost)}` : "Maxed"}</strong>
            </div>
            <div class="stat-block">
              <span class="stat-label">Total Invested</span>
              <strong class="stat-value">$${formatMoney(totalInvested)}</strong>
            </div>
          </div>
          <p class="focus-inline-note is-owned">${getSelectedLandmarkActionText(landmark, owner, player)}</p>
        </div>
      `;
    } else {
      ui.selectedSpaceCard.innerHTML = `
        <div class="focus-card dock-focus-card">
          <div class="focus-header">
            <div>
              <p class="eyebrow">Available Landmark</p>
              <h2 class="selected-title">${landmark.name}</h2>
              <p>${landmark.city}</p>
            </div>
            <span class="selection-badge phase-${landmark.phase.toLowerCase()}">${landmark.phase}</span>
          </div>
          <div class="focus-thumbnail" style="--selected-image:url('${landmark.image}')"></div>
          <div class="focus-stats">
            <div class="stat-block">
              <span class="stat-label">Purchase</span>
              <strong class="stat-value">$${formatMoney(landmark.cost)}</strong>
            </div>
            <div class="stat-block">
              <span class="stat-label">Base Rent</span>
              <strong class="stat-value income">$${formatMoney(rentProgression[0])}</strong>
            </div>
            <div class="stat-block">
              <span class="stat-label">Upgrade Cost</span>
              <strong class="stat-value">$${formatMoney(landmark.upgradeCost)}</strong>
            </div>
            <div class="stat-block">
              <span class="stat-label">Phase</span>
              <strong class="stat-value">${landmark.phase} Route</strong>
            </div>
          </div>
          <div class="rent-progression">
            <p class="rent-progression-label">Rent by Tier</p>
            <div class="rent-progression-row">
              ${UPGRADE_LEVELS.map((label, lv) => `
                <div class="rent-prog-step">
                  <span class="rent-prog-chip">${SHORT_TIER_LABELS[lv]}</span>
                  <span class="rent-prog-value">$${formatMoney(rentProgression[lv])}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <p class="focus-inline-note is-open">${getSelectedLandmarkActionText(landmark, owner, player)}</p>
        </div>
      `;
    }
    return;
  }

  const badgeClass = space.badge.toLowerCase();
  const impact = getEventPreview(space, player);

  ui.selectedSpaceCard.innerHTML = `
    <div class="focus-card dock-focus-card event-focus-card badge-${badgeClass}">
      <div class="event-card-stripe"></div>
      <div class="event-card-hero">
        <div class="event-icon-circle">
          <span class="event-big-icon">${space.icon}</span>
        </div>
        <div class="event-hero-text">
          <p class="eyebrow event-eyebrow">${space.subtitle}</p>
          <h2 class="selected-title">${space.title}</h2>
        </div>
      </div>
      <div class="event-rule-block">
        <p class="event-block-label">Rule</p>
        <p class="event-rule-copy">${space.copy}</p>
      </div>
      ${impact ? `
      <div class="event-impact-block">
        <p class="event-block-label">Current Impact</p>
        <p class="event-impact-value">${impact}</p>
      </div>` : ""}
    </div>
  `;
}

function getSelectedLandmarkActionText(landmark, owner, player = currentPlayer()) {
  if (!owner) {
    if (!player) {
      return "Start a session to buy this lot and place its miniature on the board.";
    }

    const shortage = landmark.cost - player.cash;
    if (shortage <= 0) {
      return `${player.name} can buy this site now and place its miniature immediately.`;
    }

    return `${player.name} needs $${formatMoney(shortage)} more to buy this site and place its miniature.`;
  }

  if (player && owner.id === player.id && landmark.level < MAX_UPGRADE_LEVEL) {
    if (canUpgradeLandmarkTarget(player, landmark)) {
      return `Upgrade now for $${formatMoney(landmark.upgradeCost)} to grow the board miniature into ${UPGRADE_LEVELS[landmark.level + 1]}.`;
    }

    return `${owner.name} already placed this miniature. The next upgrade costs $${formatMoney(landmark.upgradeCost)}.`;
  }

  return `${owner.name} already placed a ${UPGRADE_LEVELS[landmark.level].toLowerCase()} miniature on this tile.`;
}

const RANK_MEDAL = [
  { gradient: "linear-gradient(135deg,#ffd700 0%,#ffb300 50%,#e6a800 100%)", glow: "rgba(255,200,0,0.55)", label: "1st", crown: "♛" },
  { gradient: "linear-gradient(135deg,#d8e0e8 0%,#b0bec5 50%,#90a4ae 100%)", glow: "rgba(176,190,197,0.45)", label: "2nd", crown: "✦" },
  { gradient: "linear-gradient(135deg,#f4a460 0%,#cd853f 50%,#a0522d 100%)", glow: "rgba(205,133,63,0.45)", label: "3rd", crown: "✦" },
  { gradient: "linear-gradient(135deg,#2a3f52 0%,#1e2f3e 100%)", glow: "rgba(99,168,255,0.20)", label: "4th", crown: "" },
  { gradient: "linear-gradient(135deg,#2a3f52 0%,#1e2f3e 100%)", glow: "rgba(99,168,255,0.20)", label: "5th", crown: "" },
  { gradient: "linear-gradient(135deg,#2a3f52 0%,#1e2f3e 100%)", glow: "rgba(99,168,255,0.20)", label: "6th", crown: "" },
];

function renderPlayers() {
  const ranking = rankedPlayers();
  const cards = state.players
    .map((player, index) => {
      const rank = ranking.findIndex((entry) => entry.id === player.id) + 1;
      const medal = RANK_MEDAL[rank - 1] ?? RANK_MEDAL[5];
      const holdings = ownedLandmarks(player.id);
      const visibleAssets = holdings.slice(0, 3);
      const assetRows = visibleAssets.map((lm) =>
        `<div class="asset-row">
          <span class="asset-name">${lm.name}</span>
          <span class="asset-val">$${formatMoney(getLandmarkValue(lm))}</span>
        </div>`
      ).join("");

      const rankBadge = state.rankingReady ? `
        <div class="rank-badge rank-badge--${rank <= 3 ? rank : "low"}"
             style="background:${medal.gradient}; box-shadow:0 0 10px 2px ${medal.glow};">
          ${medal.crown ? `<span class="rank-badge-crown">${medal.crown}</span>` : ""}
          <span class="rank-badge-num">${rank}</span>
          <span class="rank-badge-label">${medal.label}</span>
        </div>` : "";

      return `
        <article class="player-card ${index === state.currentPlayerIndex && !state.gameOver ? "current" : ""} ${player.bankrupt ? "bankrupt" : ""}"
          style="--owner-color:${player.color}; --owner-glow:${player.glow};"
          data-player-id="${player.id}">
          <div class="player-card-band" style="background:${player.color};">
            <span class="player-marker-chip" style="color:#07131e;">P${player.marker}</span>
            <strong class="player-card-name" style="color:#07131e;">${player.name}</strong>
          </div>
          <div class="player-card-metrics">
            <div class="metric-asset-row">
              <span class="metric-eyebrow">Asset</span>
              <strong>$${formatMoney(getTotalAssets(player))}</strong>
            </div>
            <span>Cash $${formatMoney(player.cash)}</span>
            <span>${player.bankrupt ? "Bankrupt" : `${countGlobalLandmarks(player.id)} Global`}</span>
          </div>
          <div class="player-card-tabs">
            <div class="card-tab-row" data-tab="buildings" data-player-id="${player.id}">
              <span class="metric-eyebrow">🏛 Buildings</span>
              ${holdings.length > 0 ? `<em class="card-tab-count">${holdings.length}</em>` : ""}
            </div>
            <div class="card-tab-row" data-tab="inventory" data-player-id="${player.id}">
              <span class="metric-eyebrow">🎒 Inventory</span>
              ${player.inventory.length > 0 ? `<em class="card-tab-count">${player.inventory.length}</em>` : ""}
            </div>
          </div>
          ${rankBadge}
        </article>
      `;
    })
    .join("");

  ui.playersStrip.innerHTML = `<p class="panel-eyebrow">Investors</p>${cards}`;
  attachPlayerTabListeners();
}

function attachPlayerTabListeners() {
  document.querySelectorAll(".card-tab-row").forEach((row) => {
    const tab = row.dataset.tab;
    const playerId = row.dataset.playerId;

    row.addEventListener("mouseenter", () => {
      document.getElementById("player-tab-popup")?.remove();

      const player = getPlayerById(playerId);
      if (!player) return;

      const popup = document.createElement("div");
      popup.id = "player-tab-popup";
      popup.className = "asset-popup-global";
      popup.style.setProperty("--popup-accent", player.color);

      if (tab === "buildings") {
        const holdings = ownedLandmarks(playerId);
        popup.innerHTML = `
          <p class="asset-popup-title" style="color:${player.color};">🏛 Buildings · ${player.name}</p>
          ${holdings.length === 0
            ? `<p class="tab-popup-empty">No landmarks owned yet.</p>`
            : holdings.map((lm) => `
              <div class="asset-popup-row">
                <span class="asset-popup-name">${lm.name}</span>
                <span class="asset-popup-tier" style="color:${player.color}; border-color:${player.color};">${SHORT_TIER_LABELS[lm.level]}</span>
                <span class="asset-popup-val" style="color:${player.color};">$${formatMoney(getLandmarkValue(lm))}</span>
              </div>`).join("")}`;
      } else {
        popup.innerHTML = `
          <p class="asset-popup-title" style="color:${player.color};">🎒 Inventory · ${player.name}</p>
          ${player.inventory.length === 0
            ? `<p class="tab-popup-empty">No items in bag.</p>`
            : player.inventory.map((itemId) => {
                const item = ITEM_DEFS.find((d) => d.id === itemId);
                if (!item) return "";
                const g = ITEM_GRADE[item.grade];
                return `
                  <div class="asset-popup-row">
                    <span class="tab-popup-item-icon">${item.icon}</span>
                    <span class="asset-popup-name">${item.name}</span>
                    <span class="asset-popup-tier" style="color:${g.color}; border-color:${g.color};">${g.label}</span>
                  </div>`;
              }).join("")}`;
      }

      document.body.appendChild(popup);
      const rect = row.getBoundingClientRect();
      const popH = popup.offsetHeight;
      const top = Math.min(rect.top, window.innerHeight - popH - 12);
      popup.style.left = `${rect.right + 10}px`;
      popup.style.top = `${Math.max(8, top)}px`;
    });

    row.addEventListener("mouseleave", () => {
      document.getElementById("player-tab-popup")?.remove();
    });
  });
}

function renderControls() {
  const player = currentPlayer();
  const pending = state.pendingAction;
  const buyPending = pending?.type === "buy" ? pending : null;
  const upgradeTarget = getActionableUpgradeLandmark(player);
  const notMyTurn = gameMode === "network" && networkSocket &&
    state.players[state.currentPlayerIndex]?.socketId !== networkSocket.id;

  ui.rollButton.disabled =
    notMyTurn || !player || state.turnBusy || state.turnStarted || state.gameOver || player.bankrupt;

  ui.buyButton.disabled =
    notMyTurn ||
    !buyPending ||
    state.turnBusy ||
    state.gameOver ||
    !player ||
    !state.turnStarted ||
    !canResolvePendingAction(player, buyPending);

  ui.buyButton.textContent = getBuyActionLabel(buyPending);
  ui.upgradeButton.disabled = notMyTurn || !canUpgradeLandmarkTarget(player, upgradeTarget);
  ui.upgradeButton.textContent = getUpgradeActionLabel(upgradeTarget);
  ui.endTurnButton.disabled =
    notMyTurn || !player || state.turnBusy || state.gameOver || !state.turnStarted || player.bankrupt;
  if (ui.itemButton) {
    ui.itemButton.disabled = notMyTurn || !player || state.turnBusy || state.turnStarted || state.gameOver || player.bankrupt;
  }
  ui.hintText.textContent = getHintText();
}

function getSelectedOwnedLandmark(player = currentPlayer()) {
  if (!player) {
    return null;
  }

  const selected = getSpace(state.selectedSpaceIndex);
  if (!selected || selected.type !== "landmark") {
    return null;
  }

  const landmark = getLandmark(selected.landmarkId);
  if (!landmark || landmark.ownerId !== player.id) {
    return null;
  }

  return landmark;
}

function getActionableUpgradeLandmark(player = currentPlayer()) {
  if (!player) {
    return null;
  }

  if (state.pendingAction?.type === "upgrade") {
    return getLandmark(state.pendingAction.landmarkId);
  }

  return getSelectedOwnedLandmark(player);
}

function canUpgradeLandmarkTarget(player = currentPlayer(), landmark = getActionableUpgradeLandmark(player)) {
  return Boolean(
    player &&
      landmark &&
      landmark.ownerId === player.id &&
      landmark.level < MAX_UPGRADE_LEVEL &&
      player.cash >= landmark.upgradeCost &&
      !player.bankrupt &&
      state.turnStarted &&
      !state.turnBusy &&
      !state.gameOver,
  );
}

function canResolvePendingAction(player = currentPlayer(), pending = state.pendingAction) {
  if (!player || !pending) {
    return false;
  }

  const landmark = getLandmark(pending.landmarkId);
  if (!landmark) {
    return false;
  }

  if (pending.type === "buy") {
    return !landmark.ownerId && player.cash >= landmark.cost;
  }

  return landmark.ownerId === player.id &&
    landmark.level < MAX_UPGRADE_LEVEL &&
    player.cash >= landmark.upgradeCost;
}

function getBuyActionLabel(pending = state.pendingAction?.type === "buy" ? state.pendingAction : null) {
  if (!pending) {
    return "Buy";
  }

  const landmark = getLandmark(pending.landmarkId);
  return `Buy $${formatMoney(landmark.cost)}`;
}

function getUpgradeActionLabel(landmark = getActionableUpgradeLandmark()) {
  if (!landmark) {
    return "Upgrade";
  }

  if (landmark.level >= MAX_UPGRADE_LEVEL) {
    return "Maxed";
  }

  return `Upgrade $${formatMoney(landmark.upgradeCost)}`;
}

function getPendingActionText(pending = state.pendingAction) {
  if (!pending) {
    return null;
  }

  const landmark = getLandmark(pending.landmarkId);
  if (!landmark) {
    return null;
  }

  if (pending.type === "buy") {
    return `Buy ${landmark.name} for $${formatMoney(landmark.cost)}`;
  }

  return `Upgrade ${landmark.name} to ${UPGRADE_LEVELS[Math.min(landmark.level + 1, MAX_UPGRADE_LEVEL)]} for $${formatMoney(landmark.upgradeCost)}`;
}

function getHintText() {
  const player = currentPlayer();

  if (!player) {
    return "Pick 2 to 6 players, then launch the tabletop board.";
  }

  if (state.gameOver) {
    return `${state.winner?.name ?? "The leader"} finished first in total assets after the final audit.`;
  }

  if (state.turnBusy) {
    return `${player.name} is moving across the board.`;
  }

  if (!state.turnStarted) {
    return `${player.name} can roll now. Click any tile to inspect its miniature lot.`;
  }

  if (!state.pendingAction) {
    return `${player.name} can buy the landed tile, upgrade a selected owned tile, or end the turn.`;
  }

  const landmark = getLandmark(state.pendingAction.landmarkId);
  if (state.pendingAction.type === "buy") {
    return `Buy ${landmark.name} for $${formatMoney(landmark.cost)} to place its miniature on the board.`;
  }

  return `Upgrade ${landmark.name} to ${UPGRADE_LEVELS[landmark.level + 1]} for $${formatMoney(landmark.upgradeCost)}.`;
}

function handleContextAction() {
  if (state.gameOver || state.turnBusy) {
    return;
  }

  if (!state.turnStarted) {
    handleRoll();
    return;
  }

  if (state.pendingAction) {
    if (canResolvePendingAction()) {
      if (state.pendingAction.type === "buy") {
        handleBuyAction();
      } else {
        handleUpgradeAction();
      }
    } else {
      handleEndTurn();
    }
    return;
  }

  handleEndTurn();
}

async function handleRoll() {
  if (gameMode === "network") {
    stopTurnTimer();
    networkSocket?.emit("roll_dice", { code: lobbyState.roomCode });
    return;
  }

  const player = currentPlayer();

  if (!player || state.turnBusy || state.turnStarted || state.gameOver || player.bankrupt) {
    return;
  }

  unlockAudio();
  state.turnBusy = true;
  state.rolling = true;
  render();

  playSound("roll");
  await delay(ROLL_REVEAL_MS);

  let dieOne = randomDie();
  let dieTwo = randomDie();
  if (hasEffect(player, "speed-boots")) {
    const dieThree = randomDie();
    const allDice = [dieOne, dieTwo, dieThree].sort((a, b) => b - a);
    dieOne = allDice[0];
    dieTwo = allDice[1];
    consumeEffect(player, "speed-boots");
    addLog(`${player.name}'s Speed Boots: rolled 3 dice, using best two.`);
  }
  state.dice = [dieOne, dieTwo];
  state.rolling = false;
  render();

  let total = dieOne + dieTwo;
  if (hasEffect(player, "shortcut-map")) {
    total += 3;
    consumeEffect(player, "shortcut-map");
    addLog(`${player.name}'s Shortcut Map added 3 bonus spaces.`);
  }
  addLog(`${player.name} rolled ${dieOne} + ${dieTwo} and advances ${total} spaces.`);

  await movePlayer(player, total);

  if (!player.bankrupt && !state.gameOver) {
    state.turnStarted = true;
    await resolveCurrentSpace(player);
  }

  state.turnBusy = false;
  render();
}

async function movePlayer(player, spaces) {
  for (let step = 0; step < spaces; step += 1) {
    player.position = (player.position + 1) % SPACE_DEFS.length;
    state.selectedSpaceIndex = player.position;

    if (player.position === 0) {
      player.cash += PASS_START_BONUS;
      addLog(`${player.name} passed START and collected $${formatMoney(PASS_START_BONUS)}.`);
    }

    render();
    playSound("move");
    await delay(MOVE_STEP_MS);
  }
}

async function resolveCurrentSpace(player) {
  const space = getSpace(player.position);
  state.selectedSpaceIndex = player.position;
  state.pendingAction = null;

  if (space.type === "event") {
    const chained = await resolveEvent(player, space);
    if (chained) {
      return;
    }
  }

  if (space.type === "landmark") {
    const landmark = getLandmark(space.landmarkId);
    const owner = getPlayerById(landmark.ownerId);

    if (!owner) {
      state.pendingAction = { type: "buy", landmarkId: landmark.id };
      addLog(`${player.name} landed on open market at ${landmark.name}.`);
    } else if (owner.id === player.id) {
      if (landmark.level < MAX_UPGRADE_LEVEL) {
        state.pendingAction = { type: "upgrade", landmarkId: landmark.id };
        addLog(`${player.name} returned to ${landmark.name} and can fund the next tier.`);
      } else {
        addLog(`${player.name} landed on ${landmark.name}, already operating as a Global Landmark.`);
      }
    } else {
      let rent = getLandmarkRent(landmark);
      if (hasEffect(player, "diplomatic")) {
        consumeEffect(player, "diplomatic");
        addLog(`${player.name}'s Diplomatic Immunity blocked rent at ${landmark.name}.`);
      } else {
        const spikeEffect = getEffectData(owner, "rent-spike", landmark.id);
        if (spikeEffect) {
          rent = rent * 2;
          removeEffect(owner, "rent-spike");
          addLog(`Rent Spike activated! Rent doubled to $${formatMoney(rent)}.`);
        }
        if (hasEffect(player, "insurance")) {
          rent = Math.round(rent / 2);
          consumeEffect(player, "insurance");
          addLog(`${player.name}'s Insurance halved the rent to $${formatMoney(rent)}.`);
        }
        transferCash(player, owner, rent, `${landmark.name} income`);
        playSound("rent");
      }
    }
  }

  checkForEndConditions("space-resolution");
}

async function resolveEvent(player, space) {
  switch (space.eventType) {
    case "start":
      player.cash += EXACT_START_BONUS;
      addLog(`${player.name} landed exactly on START and banked $${formatMoney(EXACT_START_BONUS)}.`);
      checkForEndConditions("start-bonus");
      return false;

    case "corner-tax": {
      if (hasEffect(player, "tax-shield")) {
        consumeEffect(player, "tax-shield");
        addLog(`${player.name}'s Tax Shield absorbed the city tax.`);
      } else {
        const loss = 150;
        playSound("tax");
        applyCharge(player, loss, "city tax");
      }
      checkForEndConditions("corner-tax");
      return false;
    }

    case "tourism-boom": {
      const payout = 120 + ownedLandmarks(player.id).length * 25;
      player.cash += payout;
      playSound("bonus");
      addLog(`${player.name} capitalized on a Tourism Boom for $${formatMoney(payout)}.`);
      checkForEndConditions("tourism-boom");
      return false;
    }

    case "currency-shock": {
      const loss = 90 + totalUpgradeCount(player.id) * 18;
      applyCharge(player, loss, "currency shock");
      checkForEndConditions("currency-shock");
      return false;
    }

    case "skybridge-charter": {
      const nextIndex = findNextLandmarkIndex(player.position);
      addLog(`${player.name} boarded the City Tram to the next landmark.`);
      await moveToIndexAndResolve(player, nextIndex);
      return true;
    }

    case "heritage-grant": {
      const payout = 80 + countDevelopedOrBetter(player.id) * 45;
      player.cash += payout;
      addLog(`${player.name} received a Heritage Grant worth $${formatMoney(payout)}.`);
      checkForEndConditions("heritage-grant");
      return false;
    }

    case "zoning-audit": {
      const loss = 110 + ownedLandmarks(player.id).length * 20;
      applyCharge(player, loss, "zoning audit");
      checkForEndConditions("zoning-audit");
      return false;
    }

    case "continental-connector": {
      const nextIndex = findNextOpenLandmarkIndex(player.position) ?? findNextLandmarkIndex(player.position);
      addLog(`${player.name} used the Landmark Shuttle to target the next open investment opportunity.`);
      await moveToIndexAndResolve(player, nextIndex);
      return true;
    }

    case "media-spotlight": {
      const payout = 100 + Math.round(highestOwnedRent(player.id) * 0.75);
      player.cash += payout;
      addLog(`${player.name} captured $${formatMoney(payout)} from the Tourism Boom crowd surge.`);
      checkForEndConditions("media-spotlight");
      return false;
    }

    case "customs-delay":
      player.skipTurns += 1;
      addLog(`${player.name} got stuck at the Permit Office and will miss the next turn.`);
      checkForEndConditions("customs-delay");
      return false;

    case "free-parking": {
      const payout = 50;
      player.cash += payout;
      addLog(`${player.name} pulled into Free Parking and collected $${formatMoney(payout)}.`);
      checkForEndConditions("free-parking");
      return false;
    }

    case "market-summit": {
      const payout = 140 + countGlobalLandmarks(player.id) * 80;
      player.cash += payout;
      addLog(`${player.name} raised $${formatMoney(payout)} at the Market Summit.`);
      checkForEndConditions("market-summit");
      return false;
    }

    case "world-event": {
      const roll = Math.floor(Math.random() * 3);
      if (roll === 0) {
        const payout = 140 + ownedLandmarks(player.id).length * 30;
        player.cash += payout;
        addLog(`${player.name} hit a favorable World Event and gained $${formatMoney(payout)}.`);
        checkForEndConditions("world-event-bonus");
        return false;
      }

      if (roll === 1) {
        const loss = 110 + totalUpgradeCount(player.id) * 18;
        applyCharge(player, loss, "world event shock");
        checkForEndConditions("world-event-tax");
        return false;
      }

      const nextIndex = findNextOpenLandmarkIndex(player.position) ?? findNextLandmarkIndex(player.position);
      addLog(`${player.name} triggered a World Event relocation to the next landmark.`);
      await moveToIndexAndResolve(player, nextIndex);
      return true;
    }

    case "restoration-bill": {
      const loss = 70 + Math.round(getUpgradeAssetValue(player) * 0.15);
      applyCharge(player, loss, "restoration bill");
      checkForEndConditions("restoration-bill");
      return false;
    }

    case "acquisition-flight": {
      const nextIndex = findNextLandmarkIndex(player.position);
      player.cash += 60;
      addLog(`${player.name} took the Charter Flight, earned a $60 route bonus, and is moving to the next landmark.`);
      await moveToIndexAndResolve(player, nextIndex);
      return true;
    }

    default:
      return false;
  }
}

async function moveToIndexAndResolve(player, targetIndex) {
  const steps = (targetIndex - player.position + SPACE_DEFS.length) % SPACE_DEFS.length;
  if (steps <= 0) {
    checkForEndConditions("movement-event");
    return;
  }

  await movePlayer(player, steps);
  await resolveCurrentSpace(player);
}

function handleBuyAction() {
  if (gameMode === "network") {
    networkSocket?.emit("buy", { code: lobbyState.roomCode });
    return;
  }

  const pending = state.pendingAction;
  if (!pending || pending.type !== "buy" || state.turnBusy || state.gameOver) {
    return;
  }

  buyLandmark(pending.landmarkId);
}

function handleUpgradeAction() {
  if (gameMode === "network") {
    networkSocket?.emit("upgrade", { code: lobbyState.roomCode, spaceIndex: state.selectedSpaceIndex });
    return;
  }

  if (state.turnBusy || state.gameOver) {
    return;
  }

  const landmark = getActionableUpgradeLandmark();
  if (!canUpgradeLandmarkTarget(currentPlayer(), landmark)) {
    return;
  }

  handleUpgrade(landmark.id);
}

function buyLandmark(landmarkId) {
  const player = currentPlayer();
  const landmark = getLandmark(landmarkId);

  if (!player || !landmark || landmark.ownerId || player.cash < landmark.cost) {
    return;
  }

  unlockAudio();
  let cost = landmark.cost;
  if (hasEffect(player, "discount-deed")) {
    cost = Math.round(cost * 0.7);
    consumeEffect(player, "discount-deed");
    addLog(`${player.name} used Discount Deed — 30% off!`);
  }
  player.cash -= cost;
  if (player.cash < 0) { player.cash = 0; }
  landmark.ownerId = player.id;
  landmark.level = 0;
  state.pendingAction = null;
  playSound("buy");
  addLog(`${player.name} acquired ${landmark.name} for $${formatMoney(landmark.cost)}.`);
  checkForEndConditions("purchase");
  render();
}

function handleUpgrade(landmarkId) {
  const player = currentPlayer();
  const landmark = getLandmark(landmarkId);

  if (
    !player ||
    !landmark ||
    landmark.ownerId !== player.id ||
    landmark.level >= MAX_UPGRADE_LEVEL ||
    player.cash < landmark.upgradeCost ||
    state.turnBusy ||
    state.gameOver ||
    !state.turnStarted
  ) {
    return;
  }

  unlockAudio();
  player.cash -= landmark.upgradeCost;
  landmark.level += 1;
  if (state.pendingAction?.landmarkId === landmark.id) {
    state.pendingAction = null;
  }
  playSound("upgrade");
  addLog(
    `${player.name} upgraded ${landmark.name} to ${UPGRADE_LEVELS[landmark.level]}, pushing income to $${formatMoney(getLandmarkRent(landmark))}.`,
  );
  checkForEndConditions("upgrade");
  render();
}

function handleEndTurn() {
  if (gameMode === "network") {
    stopTurnTimer();
    networkSocket?.emit("end_turn", { code: lobbyState.roomCode });
    return;
  }

  stopTurnTimer();
  if (state.turnBusy || state.gameOver || !state.turnStarted) {
    return;
  }

  const player = currentPlayer();
  if (!player) {
    return;
  }

  if (hasEffect(player, "time-warp")) {
    consumeEffect(player, "time-warp");
    addLog(`${player.name} activates Time Warp — taking an extra turn!`);
    state.pendingAction = null;
    state.turnStarted = false;
    state.shopStock = generateShopStock();
    render();
    if (player.isAI) setTimeout(runAITurn, 1200);
    return;
  }

  state.pendingAction = null;
  state.turnStarted = false;
  state.rankingReady = true;

  let nextIndex = state.currentPlayerIndex;
  let wrapped = false;
  let safety = 0;

  while (safety < state.players.length) {
    nextIndex = (nextIndex + 1) % state.players.length;
    if (nextIndex === 0) {
      wrapped = true;
    }

    const candidate = state.players[nextIndex];
    if (candidate.bankrupt) {
      safety += 1;
      continue;
    }

    if (candidate.skipTurns > 0) {
      candidate.skipTurns -= 1;
      addLog(`${candidate.name} lost the turn to travel delays.`);
      safety += 1;
      continue;
    }

    state.currentPlayerIndex = nextIndex;
    state.shopStock = generateShopStock();
    if (wrapped) {
      state.round += 1;
    }

    if (state.round > activeRoundLimit) {
      endGame("round-limit");
    } else {
      addLog(`${currentPlayer().name} is now at the table.`);
      render();
      if (wrapped) {
        showRoundAnnounce(state.round);
        setTimeout(() => showTurnAnnounce(currentPlayer()), 2600);
        if (state.turnTimerSeconds > 0) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 5000);
        if (currentPlayer().isAI) setTimeout(runAITurn, 4400);
      } else {
        showTurnAnnounce(currentPlayer());
        if (state.turnTimerSeconds > 0) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 2400);
        if (currentPlayer().isAI) setTimeout(runAITurn, 1800);
      }
    }
    return;
  }

  endGame("last-investor");
}

function transferCash(fromPlayer, toPlayer, amount, label) {
  fromPlayer.cash -= amount;
  toPlayer.cash += amount;
  addLog(`${fromPlayer.name} paid $${formatMoney(amount)} to ${toPlayer.name} for ${label}.`);
  stabilizePlayer(fromPlayer);
}

function applyCharge(player, amount, label) {
  player.cash -= amount;
  addLog(`${player.name} lost $${formatMoney(amount)} to ${label}.`);
  stabilizePlayer(player);
}

function stabilizePlayer(player) {
  while (player.cash < 0) {
    const holdings = ownedLandmarks(player.id).sort(
      (left, right) => getLandmarkValue(right) - getLandmarkValue(left),
    );

    if (!holdings.length) {
      player.bankrupt = true;
      player.cash = 0;
      addLog(`${player.name} is bankrupt and leaves the board.`);
      break;
    }

    const landmark = holdings[0];
    const recovery = landmarkLiquidationValue(landmark);
    landmark.ownerId = null;
    landmark.level = 0;
    player.cash += recovery;
    addLog(`${player.name} liquidated ${landmark.name} for $${formatMoney(recovery)}.`);
  }
}

function checkForEndConditions() {
  if (state.gameOver) {
    return;
  }

  const livePlayers = activePlayers();
  if (livePlayers.length <= 1) {
    endGame("last-investor");
    return;
  }

  const triggeredPlayer = livePlayers.find(
    (player) => countGlobalLandmarks(player.id) >= MAJOR_VICTORY_GLOBALS,
  );
  if (triggeredPlayer) {
    endGame("major-trigger");
  }
}

function endGame(reason) {
  if (state.gameOver) {
    return;
  }

  state.gameOver = true;
  state.turnBusy = false;
  state.turnStarted = false;
  state.pendingAction = null;
  state.winnerReason = reason;
  state.winner = rankedPlayers()[0] ?? null;

  addLog(`${state.winner?.name ?? "No one"} finished on top after the final asset audit.`);
  render();
  stopTurnTimer();
  playSound("win");
  showFireworks(3800, () => renderWinnerOverlay());
}

function renderWinnerOverlay() {
  const ranking = rankedPlayers();
  const summary = getWinnerSummary(state.winnerReason);

  ui.winnerCard.innerHTML = `
    <div class="winner-header">
      <p class="eyebrow">Session Closed</p>
      <h2 class="winner-title">${state.winner?.name ?? "No winner"} leads BulloMarble</h2>
      <p class="winner-subtitle">${summary}</p>
    </div>
    <div class="winner-grid">
      <div class="stat-block">
        <span class="stat-label">Winning Assets</span>
        <strong class="stat-value">$${formatMoney(state.winner ? getTotalAssets(state.winner) : 0)}</strong>
      </div>
      <div class="stat-block">
        <span class="stat-label">Global Landmarks</span>
        <strong class="stat-value">${state.winner ? countGlobalLandmarks(state.winner.id) : 0}</strong>
      </div>
    </div>
    <div class="ranking-grid">
      ${ranking.map((player, index) => renderRankingRow(player, index)).join("")}
    </div>
    <p class="winner-summary">Final ranking uses total assets only: cash + landmark value + upgrade value.</p>
    <div class="winner-actions">
      <button class="primary-button" id="playAgainButton" type="button">Play Again</button>
      <button class="secondary-button" id="prevMenuButton" type="button">이전 메뉴</button>
      <button class="secondary-button" id="homeScreenButton" type="button">첫 화면</button>
    </div>
  `;

  // Play Again → same menu as before (setup for local, lobby for network)
  ui.winnerCard.querySelector("#playAgainButton").addEventListener("click", () => {
    ui.winnerOverlay.classList.add("hidden");
    if (gameMode === "network") {
      ui.lobbyOverlay.classList.remove("hidden");
      renderLobby("home");
    } else {
      ui.setupOverlay.classList.remove("hidden");
      ui.modeOverlay.classList.add("hidden");
    }
  });

  // 이전 메뉴 → setup screen (local) or lobby (network)
  ui.winnerCard.querySelector("#prevMenuButton").addEventListener("click", () => {
    ui.winnerOverlay.classList.add("hidden");
    if (gameMode === "network") {
      ui.lobbyOverlay.classList.remove("hidden");
      renderLobby("home");
    } else {
      ui.setupOverlay.classList.remove("hidden");
      ui.modeOverlay.classList.add("hidden");
    }
  });

  // 첫 화면 → mode select screen
  ui.winnerCard.querySelector("#homeScreenButton").addEventListener("click", () => {
    ui.winnerOverlay.classList.add("hidden");
    ui.setupOverlay.classList.add("hidden");
    ui.lobbyOverlay.classList.add("hidden");
    ui.modeOverlay.classList.remove("hidden");
  });

  ui.winnerOverlay.classList.remove("hidden");
}

function renderRankingRow(player, index) {
  return `
    <div class="ranking-row ${index === 0 ? "is-top" : ""}">
      <strong>${index + 1}</strong>
      <div class="ranking-main">
        <div class="ranking-name">${player.name}</div>
        <div class="ranking-detail">
          Cash $${formatMoney(player.cash)} · Landmarks $${formatMoney(getLandmarkAssetValue(player))} · Upgrades $${formatMoney(getUpgradeAssetValue(player))}
        </div>
      </div>
      <strong>$${formatMoney(getTotalAssets(player))}</strong>
    </div>
  `;
}

function getWinnerSummary(reason) {
  if (reason === "round-limit") {
    return `The ${activeRoundLimit}-round summit ended. Rankings were settled by total assets.`;
  }
  if (reason === "last-investor") {
    return "Only one investor remained solvent. Rankings were still checked by total assets.";
  }
  if (reason === "major-trigger") {
    return `${MAJOR_VICTORY_GLOBALS} Global Landmarks triggered the final audit. The richest portfolio took first place.`;
  }
  return "The final asset audit settled the board.";
}

function currentPlayer() {
  return state.players[state.currentPlayerIndex] ?? null;
}

function activePlayers() {
  return state.players.filter((player) => !player.bankrupt);
}

function rankedPlayers() {
  return [...state.players].sort((left, right) => {
    const assetDelta = getTotalAssets(right) - getTotalAssets(left);
    if (assetDelta !== 0) {
      return assetDelta;
    }
    return right.cash - left.cash;
  });
}

function ownedLandmarks(playerId) {
  return state.landmarks.filter((landmark) => landmark.ownerId === playerId);
}

function totalUpgradeCount(playerId) {
  return ownedLandmarks(playerId).reduce((sum, landmark) => sum + landmark.level, 0);
}

function countDevelopedOrBetter(playerId) {
  return ownedLandmarks(playerId).filter((landmark) => landmark.level >= 1).length;
}

function countGlobalLandmarks(playerId) {
  return ownedLandmarks(playerId).filter((landmark) => landmark.level >= MAX_UPGRADE_LEVEL).length;
}

function highestOwnedRent(playerId) {
  return ownedLandmarks(playerId).reduce(
    (highest, landmark) => Math.max(highest, getLandmarkRent(landmark)),
    0,
  );
}

function getLandmark(id) {
  const liveLandmark = state.landmarks.find((landmark) => landmark.id === id);
  if (liveLandmark) {
    return liveLandmark;
  }

  const baseLandmark = LANDMARK_DEFS.find((landmark) => landmark.id === id);
  return baseLandmark
    ? {
        ...baseLandmark,
        ownerId: null,
        level: 0,
      }
    : null;
}

function getSpace(index) {
  return SPACE_DEFS[index];
}

function getPlayerById(id) {
  return state.players.find((player) => player.id === id) ?? null;
}

function getSpaceTitle(space) {
  if (space.type === "landmark") {
    return getLandmark(space.landmarkId).name;
  }
  return space.title;
}

function getLandmarkRent(landmark) {
  let rent = getRentForLevel(landmark.baseRent, landmark.level);
  if (landmark.prestigeMultiplier) {
    rent = Math.round(rent * landmark.prestigeMultiplier);
  }
  return rent;
}

function getRentForLevel(baseRent, level) {
  return Math.round(baseRent * RENT_MULTIPLIERS[level]);
}

function getLandmarkValue(landmark) {
  return landmark.cost + landmark.level * landmark.upgradeCost;
}

function getLandmarkAssetValue(player) {
  return ownedLandmarks(player.id).reduce((sum, landmark) => sum + landmark.cost, 0);
}

function getUpgradeAssetValue(player) {
  return ownedLandmarks(player.id).reduce((sum, landmark) => sum + landmark.level * landmark.upgradeCost, 0);
}

function getTotalAssets(player) {
  return player.cash + getLandmarkAssetValue(player) + getUpgradeAssetValue(player);
}

function landmarkLiquidationValue(landmark) {
  return Math.round(getLandmarkValue(landmark) * LIQUIDATION_RATE);
}

function findNextLandmarkIndex(currentIndex) {
  for (let step = 1; step < SPACE_DEFS.length; step += 1) {
    const nextIndex = (currentIndex + step) % SPACE_DEFS.length;
    if (SPACE_DEFS[nextIndex].type === "landmark") {
      return nextIndex;
    }
  }
  return currentIndex;
}

function findNextOpenLandmarkIndex(currentIndex) {
  for (let step = 1; step < SPACE_DEFS.length; step += 1) {
    const nextIndex = (currentIndex + step) % SPACE_DEFS.length;
    const space = SPACE_DEFS[nextIndex];
    if (space.type !== "landmark") {
      continue;
    }
    if (!getLandmark(space.landmarkId).ownerId) {
      return nextIndex;
    }
  }
  return null;
}

function getEventPreview(space, player) {
  if (!player) return null;

  switch (space.eventType) {
    case "tourism-boom":
      return `Now: +$${formatMoney(120 + ownedLandmarks(player.id).length * 25)}`;
    case "currency-shock":
      return `Now: -$${formatMoney(90 + totalUpgradeCount(player.id) * 18)}`;
    case "heritage-grant":
      return `Now: +$${formatMoney(80 + countDevelopedOrBetter(player.id) * 45)}`;
    case "zoning-audit":
      return `Now: -$${formatMoney(110 + ownedLandmarks(player.id).length * 20)}`;
    case "media-spotlight":
      return `Now: +$${formatMoney(100 + Math.round(highestOwnedRent(player.id) * 0.75))}`;
    case "market-summit":
      return `Now: +$${formatMoney(140 + countGlobalLandmarks(player.id) * 80)}`;
    case "restoration-bill":
      return `Now: -$${formatMoney(70 + Math.round(getUpgradeAssetValue(player) * 0.15))}`;
    default:
      return null;
  }
}

function addLog(entry) {
  state.log.unshift(entry);
  state.log = state.log.slice(0, 10);
}

function formatMoney(value) {
  return Math.round(value).toLocaleString("en-US");
}




function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function delay(ms) {
  return new Promise((resolve) => {
    const timer = {
      due: virtualClock.now + ms,
      done: false,
      resolve,
      realId: null,
    };

    timer.realId = window.setTimeout(() => {
      completeVirtualTimer(timer);
    }, ms);

    virtualClock.timers.push(timer);
  });
}

function completeVirtualTimer(timer) {
  if (!timer || timer.done) {
    return;
  }

  timer.done = true;
  if (timer.realId !== null) {
    window.clearTimeout(timer.realId);
  }

  const index = virtualClock.timers.indexOf(timer);
  if (index >= 0) {
    virtualClock.timers.splice(index, 1);
  }

  timer.resolve();
}

async function advanceTime(ms) {
  virtualClock.now += ms;

  virtualClock.timers
    .filter((timer) => !timer.done && timer.due <= virtualClock.now)
    .sort((left, right) => left.due - right.due)
    .forEach(completeVirtualTimer);

  await Promise.resolve();
  await Promise.resolve();
  render();
}

function resetVirtualClock() {
  virtualClock.now = 0;
  virtualClock.timers.forEach((timer) => {
    if (timer.realId !== null) {
      window.clearTimeout(timer.realId);
    }
  });
  virtualClock.timers = [];
}

// ── Turn announce + countdown positioning ─────────────────────────────────
function _positionOnBoard(elId) {
  const el = document.getElementById(elId);
  const bc = document.querySelector(".board-center");
  if (!el || !bc) return;
  const r = bc.getBoundingClientRect();
  el.style.left      = `${r.left + r.width  / 2}px`;
  el.style.top       = `${r.top  + r.height / 2}px`;
  el.style.transform = "translate(-50%, -50%)";
}

// ── Turn announce ─────────────────────────────────────────────────────────
function showTurnAnnounce(player) {
  const el = document.getElementById("turnAnnounce");
  if (!el || !player) return;
  const color = player.color || "#efc77b";
  const glow  = player.glow  || "rgba(239,199,123,0.5)";
  const aiTag = player.isAI ? ` <span style="font-size:0.6em;opacity:0.7;">🤖</span>` : "";
  el.innerHTML = `
    <div class="turn-announce-inner" style="--player-color:${color};--player-glow:${glow};">
      <div class="turn-announce-aura"></div>
      <span class="turn-announce-name" style="color:${color};">${player.name}${aiTag}</span>
      <span class="turn-announce-label">Your Turn!</span>
    </div>`;
  _positionOnBoard("turnAnnounce");
  el.classList.remove("hidden", "turn-announce-exit");
  el.classList.add("turn-announce-enter");
  playSound("turn_start");
  if (_announceTimer) clearTimeout(_announceTimer);
  _announceTimer = setTimeout(() => {
    el.classList.remove("turn-announce-enter");
    el.classList.add("turn-announce-exit");
    setTimeout(() => el.classList.add("hidden"), 580);
  }, 2100);
}

// ── Round announce (gravity drop) ─────────────────────────────────────────
function showRoundAnnounce(round) {
  const el = document.getElementById("roundAnnounce");
  if (!el) return;
  el.innerHTML = `
    <div class="round-announce-inner">
      <span class="round-announce-label">Round</span>
      <span class="round-announce-number">${round}</span>
    </div>`;
  _positionOnBoard("roundAnnounce");
  el.classList.remove("hidden", "round-announce-exit");
  el.classList.add("round-announce-enter");
  playSound("round_start");
  if (_roundAnnounceTimer) clearTimeout(_roundAnnounceTimer);
  _roundAnnounceTimer = setTimeout(() => {
    el.classList.remove("round-announce-enter");
    el.classList.add("round-announce-exit");
    setTimeout(() => el.classList.add("hidden"), 520);
  }, 2200);
}

// ── Fireworks ceremony ─────────────────────────────────────────────────────
function showFireworks(duration = 3600, onComplete) {
  const canvas = document.getElementById("fireworksCanvas");
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.remove("hidden");
  canvas.style.display = "block";

  const ctx2 = canvas.getContext("2d");
  const particles = [];
  const COLORS = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#f72585","#ffbe0b","#fb5607","#2ec4b6","#c77dff"];
  let startTs  = null;
  let lastBurst = 0;
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    document.removeEventListener("keydown", skipHandler);
    document.removeEventListener("pointerdown", skipHandler);
    canvas.classList.add("hidden");
    canvas.style.display = "";
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    if (onComplete) onComplete();
  }

  function skipHandler() { finish(); }
  document.addEventListener("keydown", skipHandler);
  document.addEventListener("pointerdown", skipHandler);

  function burst() {
    const x = canvas.width  * (0.2 + Math.random() * 0.6);
    const y = canvas.height * (0.15 + Math.random() * 0.55);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const count = 96 + Math.floor(Math.random() * 48); // 2x more particles
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        alpha: 1,
        color,
        radius: 1.6 + Math.random() * 2.2,
        trail: [],
      });
    }
    playSound("firework");
  }

  function frame(ts) {
    if (done) return;
    if (!startTs) startTs = ts;
    const elapsed = ts - startTs;

    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    // Burst every ~380ms for first 2.8s, then let particles fade
    if (elapsed < 2800 && ts - lastBurst > 380) {
      burst();
      lastBurst = ts;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 15) p.trail.shift(); // 3x longer trail
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.09; // gravity
      p.vx *= 0.98; // drag
      p.alpha -= 0.010; // slower fade to show full trail
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }

      // Draw trail
      for (let t = 0; t < p.trail.length - 1; t++) {
        const a = (t / p.trail.length) * p.alpha * 0.55;
        ctx2.beginPath();
        ctx2.globalAlpha = a;
        ctx2.strokeStyle = p.color;
        ctx2.lineWidth = p.radius * 0.7;
        ctx2.moveTo(p.trail[t].x, p.trail[t].y);
        ctx2.lineTo(p.trail[t + 1].x, p.trail[t + 1].y);
        ctx2.stroke();
      }
      // Draw particle
      ctx2.globalAlpha = p.alpha;
      ctx2.fillStyle   = p.color;
      ctx2.beginPath();
      ctx2.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx2.fill();
    }
    ctx2.globalAlpha = 1;

    if (elapsed < duration || particles.length > 0) {
      requestAnimationFrame(frame);
    } else {
      finish();
    }
  }
  requestAnimationFrame(frame);
}

function startTurnTimer(seconds) {
  stopTurnTimer();
  _cdRemaining = seconds;
  _positionOnBoard("turnCountdown");
  _renderCountdown();
  const el = document.getElementById("turnCountdown");
  if (el) el.classList.remove("hidden");
  _cdInterval = setInterval(() => {
    _cdRemaining--;
    _renderCountdown();
    if (_cdRemaining <= 5 && _cdRemaining > 0) {
      playSound("countdown_urgent");
    } else if (_cdRemaining > 5) {
      playSound("countdown_tick");
    }
    if (_cdRemaining <= 0) {
      stopTurnTimer();
      autoAdvanceTurn();
    }
  }, 1000);
}

function stopTurnTimer() {
  if (_cdInterval) { clearInterval(_cdInterval); _cdInterval = null; }
  const el = document.getElementById("turnCountdown");
  if (el) el.classList.add("hidden");
}

function _renderCountdown() {
  const el = document.getElementById("turnCountdown");
  if (!el) return;
  const total = state.turnTimerSeconds || 60;
  const pct   = Math.max(0, _cdRemaining / total);
  const hue   = Math.round(pct * 120); // 120=green → 60=yellow → 0=red
  const r     = 56;
  const circ  = 2 * Math.PI * r;
  const urgent = _cdRemaining <= 5;
  el.innerHTML = `
    <div class="countdown-ring${urgent ? " countdown-urgent" : ""}" style="--countdown-color:hsl(${hue},88%,58%);">
      <svg viewBox="0 0 136 136">
        <circle cx="68" cy="68" r="${r}" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="8"/>
        <circle cx="68" cy="68" r="${r}" fill="none"
          stroke="hsl(${hue},88%,58%)" stroke-width="8"
          stroke-dasharray="${circ.toFixed(2)}"
          stroke-dashoffset="${(circ * (1 - pct)).toFixed(2)}"
          stroke-linecap="round"
          style="transform:rotate(-90deg);transform-origin:68px 68px;transition:stroke-dashoffset 0.92s linear,stroke 0.5s;"/>
      </svg>
      <span class="countdown-number" style="color:hsl(${hue},88%,58%);">${_cdRemaining}</span>
    </div>`;
}

function autoAdvanceTurn() {
  if (state.gameOver || state.turnBusy) return;
  if (gameMode === "network") {
    const me = state.players[state.currentPlayerIndex];
    if (me?.socketId !== networkSocket?.id) return;
  }
  if (!state.turnStarted) {
    handleRoll();
  } else {
    handleEndTurn();
  }
}

// ── AI turn logic ─────────────────────────────────────────────────────────
async function runAITurn() {
  const player = currentPlayer();
  if (!player?.isAI || state.gameOver || state.turnBusy || state.turnStarted) return;

  await delay(1100); // brief pause so humans can follow
  if (!currentPlayer()?.isAI || state.gameOver) return;

  await handleRoll();

  // Wait briefly then decide post-roll action
  await delay(700);
  const p = currentPlayer();
  if (!p?.isAI || state.gameOver || !state.turnStarted) return;

  const pending = state.pendingAction;
  if (pending?.type === "buy") {
    const lm = getLandmark(pending.landmarkId);
    if (p.cash >= lm.cost) {
      buyLandmark(lm.id);
      await delay(600);
    }
  } else if (pending?.type === "upgrade") {
    const lm = getLandmark(pending.landmarkId);
    if (p.cash >= lm.upgradeCost) {
      handleUpgrade(lm.id);
      await delay(600);
    }
  }

  if (!state.gameOver && state.turnStarted) {
    await delay(400);
    handleEndTurn();
  }
}

function exposeDebugHooks() {
  window.render_game_to_text = renderGameToText;
  window.advanceTime = advanceTime;
}

function renderGameToText() {
  const player = currentPlayer();
  const selected = getSpace(state.selectedSpaceIndex);
  const payload = {
    mode: ui.setupOverlay.classList.contains("hidden")
      ? state.gameOver
        ? "gameover"
        : "playing"
      : "setup",
    board: {
      coordinateSystem: "Index 0 is START at the bottom-left corner; 10 is TAX, 20 is FREE PARKING, 30 is WORLD EVENT; indexes increase clockwise.",
      spaces: SPACE_DEFS.length,
      sides: 4,
      spacesPerSide: 10,
      corners: ["START", "TAX", "FREE PARKING", "WORLD EVENT"],
      progression: {
        early: "parks and small attractions",
        mid: "famous landmarks",
        late: "skyscrapers and mega landmarks",
      },
      round: `${Math.min(state.round, activeRoundLimit)}/${activeRoundLimit}`,
      majorTrigger: `${MAJOR_VICTORY_GLOBALS} Global Landmarks`,
    },
    turn: player
      ? {
          player: player.name,
          phase: state.gameOver ? "gameover" : state.turnBusy ? "busy" : state.turnStarted ? "post-roll" : "pre-roll",
          pendingAction: getPendingActionText(),
          position: player.position,
          space: getSpaceTitle(getSpace(player.position)),
        }
      : null,
    topbarEvent: getTopbarEventText(),
    dice: state.dice,
    selected: describeSpaceForText(selected, state.selectedSpaceIndex),
    players: state.players.map((entry) => ({
      name: entry.name,
      color: entry.color,
      colorName: entry.colorName,
      marker: entry.marker,
      cash: entry.cash,
      position: entry.position,
      totalAssets: getTotalAssets(entry),
      landmarkValue: getLandmarkAssetValue(entry),
      upgradeValue: getUpgradeAssetValue(entry),
      globalLandmarks: countGlobalLandmarks(entry.id),
      skipTurns: entry.skipTurns,
      bankrupt: entry.bankrupt,
    })),
    leaderboard: rankedPlayers().map((entry) => ({
      name: entry.name,
      totalAssets: getTotalAssets(entry),
    })),
    recentLog: state.log.slice(0, 4),
  };

  return JSON.stringify(payload);
}

function describeSpaceForText(space, index) {
  if (space.type === "landmark") {
    const landmark = getLandmark(space.landmarkId);
    const owner = getPlayerById(landmark.ownerId);
    return {
      index,
      type: "landmark",
      name: landmark.name,
      city: landmark.city,
      phase: landmark.phase,
      miniProfile: landmark.miniProfile,
      owner: owner ? owner.name : null,
      ownerColor: owner ? owner.color : null,
      tier: owner ? UPGRADE_LEVELS[landmark.level] : "Open",
      cost: landmark.cost,
      income: getLandmarkRent(landmark),
    };
  }

  return {
    index,
    type: "event",
    name: space.title,
    subtitle: space.subtitle,
    effect: space.copy,
  };
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  unlockAudio();
  renderTopBar();
}

async function toggleFullscreen() {
  unlockAudio();

  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

function primeAudio() {
  // Sounds are synthesized — no preloading needed
}

function unlockAudio() {
  state.audioUnlocked = true;
  try { _getAudioCtx(); } catch (_) {}
}

function playSound(key) {
  if (!state.soundEnabled) return;
  try {
    const ctx = _getAudioCtx();
    SYNTH_SOUNDS[key]?.(ctx);
  } catch (_) {}
}

// ── Item system ───────────────────────────────────────────────────────────

function generateShopStock() {
  const weights = { common: 8, rare: 5, epic: 3, legendary: 1 };
  const byGrade = {};
  ITEM_DEFS.forEach((item) => {
    if (!byGrade[item.grade]) byGrade[item.grade] = [];
    byGrade[item.grade].push(item.id);
  });

  const pool = [];
  Object.entries(weights).forEach(([grade, w]) => {
    for (let i = 0; i < w; i += 1) pool.push(grade);
  });

  const stock = [];
  const used = new Set();
  let tries = 0;
  while (stock.length < 4 && tries < 40) {
    const grade = pool[Math.floor(Math.random() * pool.length)];
    const candidates = (byGrade[grade] || []).filter((id) => !used.has(id));
    if (candidates.length === 0) { tries += 1; continue; }
    const id = candidates[Math.floor(Math.random() * candidates.length)];
    stock.push(id);
    used.add(id);
    tries += 1;
  }
  return stock;
}

function hasEffect(player, effectId) {
  return player?.activeEffects?.some((e) => e.id === effectId) ?? false;
}

function consumeEffect(player, effectId) {
  if (!player?.activeEffects) return;
  const idx = player.activeEffects.findIndex((e) => e.id === effectId);
  if (idx >= 0) player.activeEffects.splice(idx, 1);
}

function removeEffect(player, effectId) {
  consumeEffect(player, effectId);
}

function getEffectData(player, effectId, landmarkId) {
  if (!player?.activeEffects) return null;
  const effect = player.activeEffects.find((e) => e.id === effectId);
  if (!effect) return null;
  if (landmarkId && effect.data?.landmarkId !== landmarkId) return null;
  return effect;
}

function openItemModal(tab = "shop") {
  state.itemModalTab = tab;
  renderItemModal();
  ui.itemModal.classList.remove("hidden");
  // Hide turn countdown so it doesn't overlap the modal
  document.getElementById("turnCountdown")?.classList.add("hidden");
}

function closeItemModal() {
  ui.itemModal.classList.add("hidden");
  document.getElementById("item-target-step")?.remove();
  // Restore countdown if timer is still running
  if (_cdInterval) document.getElementById("turnCountdown")?.classList.remove("hidden");
}

function renderItemModal() {
  const player = currentPlayer();
  if (!player) return;

  const tab = state.itemModalTab;
  const grade = ITEM_GRADE;

  const tabBtn = (id, label, active) =>
    `<button type="button" class="item-tab-btn ${active ? "active" : ""}" onclick="switchItemTab('${id}')">${label}</button>`;

  const renderShopCard = (itemId) => {
    const item = ITEM_DEFS.find((d) => d.id === itemId);
    if (!item) return "";
    const g = grade[item.grade];
    const canAfford = player.cash >= item.price;
    const inventoryFull = player.inventory.length >= 3;
    const alreadyOwns = player.inventory.includes(item.id);
    const disabled = !canAfford || inventoryFull || alreadyOwns || state.turnStarted || state.gameOver;
    return `
      <div class="item-card" style="border-left-color:${g.color}; background: color-mix(in srgb, ${g.color} 6%, #0b1c2b);">
        <div class="item-card-head">
          <span class="item-icon">${item.icon}</span>
          <div class="item-card-title-area">
            <p class="item-name">${item.name}</p>
            <span class="item-grade-badge" style="color:${g.color}; border-color:${g.color};">${g.label}</span>
          </div>
          <span class="item-price" style="color:${g.color};">$${formatMoney(item.price)}</span>
        </div>
        <p class="item-desc">${item.desc}</p>
        <button type="button" class="item-action-btn" style="border-color:${g.color}; color:${g.color};"
          ${disabled ? "disabled" : ""}
          onclick="handleItemBuy('${item.id}')">
          ${alreadyOwns ? "Owned" : inventoryFull ? "Inv Full" : !canAfford ? "No Funds" : state.turnStarted ? "Pre-Turn Only" : "Buy"}
        </button>
      </div>`;
  };

  const renderInventoryCard = (itemId) => {
    const item = ITEM_DEFS.find((d) => d.id === itemId);
    if (!item) return "";
    const g = grade[item.grade];
    const canUse = !state.turnStarted && !state.turnBusy && !state.gameOver;
    return `
      <div class="item-card" style="border-left-color:${g.color}; background: color-mix(in srgb, ${g.color} 6%, #0b1c2b);">
        <div class="item-card-head">
          <span class="item-icon">${item.icon}</span>
          <div class="item-card-title-area">
            <p class="item-name">${item.name}</p>
            <span class="item-grade-badge" style="color:${g.color}; border-color:${g.color};">${g.label}</span>
          </div>
        </div>
        <p class="item-desc">${item.desc}</p>
        <div class="item-btn-row">
          <button type="button" class="item-action-btn" style="border-color:${g.color}; color:${g.color};"
            ${!canUse ? "disabled" : ""}
            onclick="handleItemUse('${item.id}', null)">Use</button>
          <button type="button" class="item-discard-btn"
            onclick="handleItemDiscard('${item.id}')">Discard</button>
        </div>
      </div>`;
  };

  const shopContent = state.shopStock.length === 0
    ? `<p class="item-empty">Shop is empty this turn.</p>`
    : state.shopStock.map(renderShopCard).join("");

  const invContent = player.inventory.length === 0
    ? `<p class="item-empty">Inventory is empty.</p>`
    : player.inventory.map(renderInventoryCard).join("");

  ui.itemModalCard.innerHTML = `
    <div class="item-modal-header">
      <div class="item-modal-title-row">
        <span class="item-modal-player-chip" style="background:${player.color}; color:#07131e;">P${player.marker}</span>
        <h2 class="item-modal-title">${player.name} · Item Shop</h2>
        <span class="item-cash-display">💰 $${formatMoney(player.cash)}</span>
        <button type="button" class="item-close-btn" onclick="closeItemModal()">Close</button>
      </div>
    </div>
    <div class="item-modal-panels">
      <div class="item-panel item-panel--shop">
        <p class="item-panel-label">🛍️ Shop <em class="item-panel-count">${state.shopStock.length} items</em></p>
        <div class="item-grid">${shopContent}</div>
      </div>
      <div class="item-panel item-panel--inventory">
        <p class="item-panel-label">🎒 Inventory <em class="item-panel-count">${player.inventory.length}/3</em></p>
        <div class="item-inv-list">${invContent}</div>
      </div>
    </div>
  `;
}

function switchItemTab(tab) {
  state.itemModalTab = tab;
  renderItemModal();
}

function handleItemBuy(itemId) {
  if (gameMode === "network") {
    networkSocket?.emit("buy_item", { code: lobbyState.roomCode, itemId });
    return;
  }

  const player = currentPlayer();
  const item = ITEM_DEFS.find((d) => d.id === itemId);
  if (!player || !item || player.cash < item.price || player.inventory.length >= 3) return;
  if (state.turnStarted || state.gameOver) return;

  player.cash -= item.price;
  player.inventory.push(item.id);
  addLog(`${player.name} purchased ${item.icon} ${item.name} for $${formatMoney(item.price)}.`);
  playSound("buy");
  state.turnStarted = true;
  renderItemModal();
  render();
}

function handleItemDiscard(itemId) {
  if (gameMode === "network") {
    networkSocket?.emit("discard_item", { code: lobbyState.roomCode, itemId });
    return;
  }

  const player = currentPlayer();
  if (!player) return;
  const idx = player.inventory.indexOf(itemId);
  if (idx >= 0) player.inventory.splice(idx, 1);
  const item = ITEM_DEFS.find((d) => d.id === itemId);
  addLog(`${player.name} discarded ${item?.name ?? itemId}.`);
  renderItemModal();
}

function handleItemUse(itemId, targetData) {
  if (gameMode === "network") {
    networkSocket?.emit("use_item", { code: lobbyState.roomCode, itemId, targetId: targetData });
    return;
  }

  const player = currentPlayer();
  const item = ITEM_DEFS.find((d) => d.id === itemId);
  if (!player || !item || state.turnStarted || state.turnBusy || state.gameOver) return;

  const idx = player.inventory.indexOf(itemId);
  if (idx < 0) return;

  // Items that need a target — show target picker first
  if (!targetData && item.target !== "none" && item.target !== "pick-number") {
    showItemTargetPicker(item, player);
    return;
  }

  // Apply effect
  player.inventory.splice(idx, 1);
  applyItemEffect(item, player, targetData);
}

function showItemTargetPicker(item, player) {
  let targets = [];
  let label = "";

  if (item.target === "pick-number") {
    targets = [1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: `Move ${n} spaces` }));
    label = "Choose distance:";
  } else if (item.target === "owned-lm") {
    const eligible = ownedLandmarks(player.id).filter((lm) => {
      if (item.id === "fast-track") return lm.level < MAX_UPGRADE_LEVEL;
      if (item.id === "rent-spike") return true;
      if (item.id === "prestige-boost") return true;
      if (item.id === "golden-padlock") return true;
      return true;
    });
    targets = eligible.map((lm) => ({ id: lm.id, label: `${lm.name} (${SHORT_TIER_LABELS[lm.level]}) — $${formatMoney(getLandmarkRent(lm))}/rent` }));
    label = "Select your landmark:";
  } else if (item.target === "unowned-lm") {
    const unowned = state.landmarks.filter((lm) => !lm.ownerId);
    targets = unowned.map((lm) => ({ id: lm.id, label: `${lm.name} — $${formatMoney(lm.cost)}` }));
    label = "Select destination:";
  } else if (item.target === "opponent") {
    const opponents = activePlayers().filter((p) => p.id !== player.id && !p.bankrupt);
    targets = opponents.map((p) => ({ id: p.id, label: `P${p.marker} ${p.name}` }));
    label = "Select opponent:";
  } else if (item.target === "opp-lm") {
    const opponentLandmarks = [];
    activePlayers().filter((p) => p.id !== player.id).forEach((opp) => {
      ownedLandmarks(opp.id).forEach((lm) => {
        const isLocked = opp.activeEffects?.some((e) => e.id === "golden-padlock" && e.data?.landmarkId === lm.id);
        if (!isLocked) {
          opponentLandmarks.push({ id: `${opp.id}|${lm.id}`, label: `P${opp.marker} ${opp.name}: ${lm.name} (${SHORT_TIER_LABELS[lm.level]})` });
        }
      });
    });
    targets = opponentLandmarks;
    label = "Select landmark:";
  }

  if (targets.length === 0) {
    addLog(`No valid targets for ${item.name}.`);
    return;
  }

  const old = document.getElementById("item-target-step");
  if (old) old.remove();

  const picker = document.createElement("div");
  picker.id = "item-target-step";
  picker.className = "item-target-picker";
  picker.innerHTML = `
    <div class="item-target-card">
      <p class="item-target-label">${item.icon} ${item.name} — ${label}</p>
      <div class="item-target-list">
        ${targets.map((t) => `
          <button type="button" class="item-target-option" onclick="confirmItemUse('${item.id}', '${t.id}')">
            ${t.label}
          </button>`).join("")}
      </div>
      <button type="button" class="item-close-btn" onclick="document.getElementById('item-target-step').remove()">Cancel</button>
    </div>
  `;
  document.getElementById("itemModal").appendChild(picker);
}

function confirmItemUse(itemId, targetId) {
  document.getElementById("item-target-step")?.remove();
  handleItemUse(itemId, targetId);
}

function applyItemEffect(item, player, targetId) {
  addLog(`${player.name} used ${item.icon} ${item.name}!`);

  switch (item.id) {
    case "cash-injection":
      player.cash += 250;
      addLog(`${player.name} gained $250 from Cash Injection.`);
      break;

    case "market-insider": {
      let total = 0;
      ownedLandmarks(player.id).forEach((lm) => { total += getLandmarkRent(lm); });
      player.cash += total;
      addLog(`Market Insider: ${player.name} collected $${formatMoney(total)} from all holdings.`);
      break;
    }

    case "discount-deed":
      player.activeEffects.push({ id: "discount-deed", data: {} });
      addLog(`${player.name}'s next purchase is 30% off.`);
      break;

    case "insurance":
      player.activeEffects.push({ id: "insurance", data: {} });
      addLog(`${player.name} is insured — next rent halved.`);
      break;

    case "tax-shield":
      player.activeEffects.push({ id: "tax-shield", data: {} });
      addLog(`${player.name} has a Tax Shield for the next TAX.`);
      break;

    case "diplomatic":
      player.activeEffects.push({ id: "diplomatic", data: {} });
      addLog(`${player.name} has Diplomatic Immunity — next rent blocked.`);
      break;

    case "time-warp":
      player.activeEffects.push({ id: "time-warp", data: {} });
      addLog(`${player.name} winds back time — extra turn incoming!`);
      break;

    case "market-crash": {
      activePlayers().filter((p) => p.id !== player.id).forEach((opp) => {
        const loss = Math.round(opp.cash * 0.10);
        opp.cash -= loss;
        addLog(`Market Crash: ${opp.name} lost $${formatMoney(loss)}.`);
      });
      break;
    }

    case "global-alliance": {
      let bonus = 0;
      ownedLandmarks(player.id).filter((lm) => lm.level >= MAX_UPGRADE_LEVEL).forEach((lm) => {
        bonus += getLandmarkRent(lm);
      });
      player.cash += bonus;
      addLog(`Global Alliance: ${player.name} collected $${formatMoney(bonus)} from Global Landmarks.`);
      break;
    }

    case "fast-track": {
      const lm = state.landmarks.find((l) => l.id === targetId && l.ownerId === player.id && l.level < MAX_UPGRADE_LEVEL);
      if (lm) {
        lm.level += 1;
        addLog(`Fast Track: ${player.name} upgraded ${lm.name} to ${UPGRADE_LEVELS[lm.level]} for free!`);
      }
      break;
    }

    case "prestige-boost": {
      const lm = state.landmarks.find((l) => l.id === targetId && l.ownerId === player.id);
      if (lm) {
        lm.prestigeMultiplier = Math.round(((lm.prestigeMultiplier || 1) * 1.2) * 100) / 100;
        addLog(`Prestige Boost: ${lm.name} rent permanently +20%!`);
      }
      break;
    }

    case "golden-padlock": {
      const lm = state.landmarks.find((l) => l.id === targetId && l.ownerId === player.id);
      if (lm) {
        player.activeEffects.push({ id: "golden-padlock", data: { landmarkId: targetId }, turnsLeft: 3 });
        addLog(`${lm.name} is now protected by a Golden Padlock for 3 rounds.`);
      }
      break;
    }

    case "rent-spike": {
      const lm = state.landmarks.find((l) => l.id === targetId && l.ownerId === player.id);
      if (lm) {
        player.activeEffects.push({ id: "rent-spike", data: { landmarkId: targetId } });
        addLog(`Rent Spike placed on ${lm.name} — next visitor pays double!`);
      }
      break;
    }

    case "sabotage": {
      const target = getPlayerById(targetId);
      if (target) {
        target.skipTurns += 1;
        addLog(`${player.name} sabotaged ${target.name} — they skip their next turn!`);
      }
      break;
    }

    case "hostile-takeover": {
      const [oppId, lmId] = targetId.split("|");
      const opp = getPlayerById(oppId);
      const lm = state.landmarks.find((l) => l.id === lmId);
      if (opp && lm) {
        const price = Math.round(getLandmarkValue(lm) * 0.7);
        if (player.cash >= price) {
          player.cash -= price;
          opp.cash += price;
          lm.ownerId = player.id;
          addLog(`Hostile Takeover: ${player.name} seized ${lm.name} from ${opp.name} for $${formatMoney(price)}!`);
        } else {
          addLog(`Hostile Takeover failed — insufficient funds.`);
          player.inventory.push(item.id);
        }
      }
      break;
    }

    case "landmark-swap": {
      const [oppId, lmId] = targetId.split("|");
      const opp = getPlayerById(oppId);
      const oppLm = state.landmarks.find((l) => l.id === lmId);
      const myLm = ownedLandmarks(player.id).find((l) => l.level <= (oppLm?.level ?? 0));
      if (opp && oppLm && myLm) {
        oppLm.ownerId = player.id;
        myLm.ownerId = opp.id;
        addLog(`Landmark Swap: ${player.name} swapped ${myLm.name} for ${opp.name}'s ${oppLm.name}!`);
      }
      break;
    }

    case "speed-boots":
      player.activeEffects.push({ id: "speed-boots", data: {} });
      addLog(`${player.name}'s Speed Boots are ready — roll for 3 dice!`);
      closeItemModal();
      state.turnStarted = false;
      render();
      return;

    case "shortcut-map":
      player.activeEffects.push({ id: "shortcut-map", data: {} });
      addLog(`${player.name}'s Shortcut Map is ready — +3 to next roll!`);
      closeItemModal();
      state.turnStarted = false;
      render();
      return;

    case "lucky-compass": {
      const chosen = Number(targetId);
      closeItemModal();
      (async () => {
        state.turnBusy = true;
        state.rolling = true;
        render();
        await delay(300);
        state.dice = [chosen, 0];
        state.rolling = false;
        render();
        addLog(`${player.name} used Lucky Compass — moving exactly ${chosen} spaces.`);
        await movePlayer(player, chosen);
        if (!player.bankrupt && !state.gameOver) {
          state.turnStarted = true;
          await resolveCurrentSpace(player);
        }
        state.turnBusy = false;
        render();
      })();
      return;
    }

    case "teleport-pass": {
      const destLm = state.landmarks.find((l) => l.id === targetId && !l.ownerId);
      if (destLm) {
        const destSpace = SPACE_DEFS.findIndex((s) => s.type === "landmark" && s.landmarkId === destLm.id);
        if (destSpace >= 0) {
          closeItemModal();
          (async () => {
            state.turnBusy = true;
            addLog(`${player.name} teleported to ${destLm.name}!`);
            const steps = (destSpace - player.position + SPACE_DEFS.length) % SPACE_DEFS.length;
            if (steps > 0) await movePlayer(player, steps);
            else player.position = destSpace;
            if (!player.bankrupt && !state.gameOver) {
              state.turnStarted = true;
              await resolveCurrentSpace(player);
            }
            state.turnBusy = false;
            render();
          })();
          return;
        }
      }
      break;
    }
  }

  closeItemModal();
  state.turnStarted = true;
  render();
}

window.switchItemTab = switchItemTab;
window.handleItemBuy = handleItemBuy;
window.handleItemUse = handleItemUse;
window.handleItemDiscard = handleItemDiscard;
window.confirmItemUse = confirmItemUse;
window.closeItemModal = closeItemModal;

// ── Network Lobby ─────────────────────────────────────────────────────────

// Color swatches available for lobby selection (first 6 from palette)
const LOBBY_COLORS = COLOR_PALETTE.slice(0, 6);

// Random player name pool (used when no saved name exists)
const PLAYER_NAME_POOL = [
  "GoldHand", "BullKing", "Landlord", "RealtyAce", "MarketPro",
  "LandmarkKing", "RentHunter", "Capitalist", "WealthMaker", "YieldKing",
  "EstateLord", "BuildingBoss", "DevMaster", "ProfitKing", "DividendAce",
];
function _randomPlayerName() {
  const base = PLAYER_NAME_POOL[Math.floor(Math.random() * PLAYER_NAME_POOL.length)];
  const num  = Math.floor(Math.random() * 900) + 100;
  return `${base}${num}`;
}

// Random room name pool
const ROOM_NAME_POOL = [
  "Investment Club", "Realty Kings", "Landmark Hunters", "Golden Key", "Landlord Gang",
  "Money Makers", "Tycoon Club", "Land Grab", "Boardroom", "Rent Bomb",
  "Get Rich", "Dice Roll", "Building Forest", "Rent Collectors", "Estate Game",
  "Lucky Dice", "Landmark Race", "Bull Market", "Land Developers", "Capitalists",
];
function _randomRoomName() {
  return ROOM_NAME_POOL[Math.floor(Math.random() * ROOM_NAME_POOL.length)];
}

const lobbyState = {
  screen:          "home",
  roomCode:        "",
  playerName:      localStorage.getItem("ll_playerName") || _randomPlayerName(),
  colorIndex:      0,
  players:         [],
  isHost:          false,
  errorMsg:        "",
  browseRooms:     [],
  maxPlayers:      4,
  isPublic:           true,
  suggestedRoomName:  "",
  turnTimerEnabled:   false,
  turnTimerSeconds:   60,
  roundLimit:         Math.min(Math.max(Number(localStorage.getItem("bgame_roundLimit")) || 20, 10), 50),
};

function _lobbyColorSwatches(selectedIndex, takenSet = new Set()) {
  return LOBBY_COLORS.map((c, i) => {
    const isTaken = takenSet.has(i) && i !== selectedIndex;
    return `
    <button class="lobby-color-swatch ${i === selectedIndex ? "selected" : ""} ${isTaken ? "taken" : ""}"
      style="background:${c.color};" title="${c.label}"
      ${isTaken ? "disabled" : ""}
      onclick="lobbyPickColor(${i})"></button>`;
  }).join("");
}

function _waitingColorSwatches(players, myColorIndex) {
  const takenSet = new Set(players.filter(p => p.colorIndex !== myColorIndex).map(p => p.colorIndex));
  return LOBBY_COLORS.map((c, i) => {
    const isTaken = takenSet.has(i);
    return `
    <button class="lobby-color-swatch ${i === myColorIndex ? "selected" : ""} ${isTaken ? "taken" : ""}"
      style="background:${c.color};" title="${c.label}"
      ${isTaken ? "disabled" : ""}
      onclick="lobbyWaitingChangeColor(${i})"></button>`;
  }).join("");
}

function renderLobby(screen) {
  if (screen) lobbyState.screen = screen;
  const card = ui.lobbyCard;
  if (!card) return;

  const backBtn = `<button class="lobby-back-btn" onclick="lobbyGoBack()">← Back</button>`;

  // ── Home ────────────────────────────────────────────────────────────────
  if (lobbyState.screen === "home") {
    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Network Game</h2>
      </div>
      <div class="lobby-name-row">
        <label class="lobby-label">My Name</label>
        <input class="lobby-input lobby-input-plain" id="lobbyPlayerName" type="text"
          maxlength="18" placeholder="Player" autocomplete="off"
          value="${lobbyState.playerName}" />
      </div>
      <div class="lobby-color-row">
        <label class="lobby-label">Color</label>
        <div class="lobby-color-swatches" id="lobbyColorSwatches">
          ${_lobbyColorSwatches(lobbyState.colorIndex)}
        </div>
      </div>
      <div class="lobby-actions">
        <button class="lobby-action-btn" onclick="lobbyShowCreate()">
          <span class="lobby-action-icon">🏠</span>
          <span class="lobby-action-text">
            <strong>Create Room</strong>
            <small>Open a new game room</small>
          </span>
        </button>
        <button class="lobby-action-btn" onclick="lobbyShowBrowse()">
          <span class="lobby-action-icon">🔍</span>
          <span class="lobby-action-text">
            <strong>Browse Rooms</strong>
            <small>List of open waiting rooms</small>
          </span>
        </button>
        <button class="lobby-action-btn" onclick="lobbyShowJoinCode()">
          <span class="lobby-action-icon">🔑</span>
          <span class="lobby-action-text">
            <strong>Join by Code</strong>
            <small>Enter a 6-digit room code</small>
          </span>
        </button>
      </div>
      <button class="secondary-button" style="margin-top:1rem;" onclick="lobbyExit()">← Game Mode Select</button>
    `;
    return;
  }

  // ── Create room ─────────────────────────────────────────────────────────
  if (lobbyState.screen === "create") {
    const maxOpts = [2,3,4,5,6].map(n =>
      `<label class="lobby-radio-label">
        <input type="radio" name="lobbyMaxPlayers" value="${n}" ${lobbyState.maxPlayers === n ? "checked" : ""} onchange="lobbySetMaxPlayers(${n})">
        <span>${n}P</span>
      </label>`).join("");

    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Create Room</h2>
      </div>
      <div class="lobby-form">
        <label class="lobby-label">Room Name (optional)</label>
        <input class="lobby-input lobby-input-plain" id="lobbyRoomName" type="text"
          maxlength="24" placeholder="${lobbyState.suggestedRoomName}" autocomplete="off"
          value="${lobbyState.suggestedRoomName}" />

        <div class="lobby-row-inline" style="margin-top:0.9rem; gap:1.2rem; align-items:flex-end;">
          <div style="flex:1 1 auto;">
            <label class="lobby-label">Max Players</label>
            <div class="lobby-radio-group">${maxOpts}</div>
          </div>
          <div style="flex:0 0 auto; min-width:120px;">
            <label class="lobby-label">Rounds</label>
            <select class="round-limit-select" onchange="lobbySetRoundLimit(Number(this.value))">
              ${[10,15,20,25,30,35,40,45,50].map(n => `<option value="${n}" ${lobbyState.roundLimit === n ? "selected" : ""}>${n} Rounds</option>`).join("")}
            </select>
          </div>
        </div>

        <label class="lobby-label" style="margin-top:0.9rem;">Visibility</label>
        <div class="lobby-toggle-row">
          <button class="lobby-toggle-btn ${lobbyState.isPublic ? "active" : ""}" onclick="lobbySetPublic(true)">🌐 Public</button>
          <button class="lobby-toggle-btn ${!lobbyState.isPublic ? "active" : ""}" onclick="lobbySetPublic(false)">🔒 Private (code required)</button>
        </div>
        ${!lobbyState.isPublic ? `
        <p class="lobby-private-note">🔒 Room is visible in the list, but a 6-digit code is required to enter.<br>Share the code only with invited players.</p>` : ""}

        <label class="lobby-label" style="margin-top:0.9rem;">Turn Timer</label>
        <div class="lobby-toggle-row">
          <button class="lobby-toggle-btn ${!lobbyState.turnTimerEnabled ? "active" : ""}" onclick="lobbySetTurnTimer(false)">⏸ Off</button>
          <button class="lobby-toggle-btn ${lobbyState.turnTimerEnabled ? "active" : ""}" onclick="lobbySetTurnTimer(true)">⏱ On</button>
        </div>
        ${lobbyState.turnTimerEnabled ? `
        <div class="lobby-timer-opts">
          ${[30,60,90,120].map(s => `<label class="lobby-radio-label"><input type="radio" name="lobbyTimerSecs" value="${s}" ${lobbyState.turnTimerSeconds === s ? "checked" : ""} onchange="lobbySetTurnTimerSeconds(${s})"><span>${s}s</span></label>`).join("")}
        </div>
        <p class="lobby-timer-note">Auto-advance turn when time runs out.</p>` : ""}
      </div>
      <div class="lobby-row" style="margin-top:1.2rem;">
        ${backBtn}
        <button class="primary-button" onclick="lobbyConfirmCreate()">Create Room</button>
      </div>
    `;
    return;
  }

  // ── Browse rooms ─────────────────────────────────────────────────────────
  if (lobbyState.screen === "browse") {
    const rooms = lobbyState.browseRooms;
    let listHtml;
    if (rooms.length === 0) {
      listHtml = `<div class="lobby-empty-msg">No rooms available.<br>Create one to get started!</div>`;
    } else {
      listHtml = rooms.map(r => `
        <div class="lobby-room-item">
          <div class="lobby-room-item-info">
            <span class="lobby-room-item-name">${r.isPublic ? "" : "🔒 "}${r.roomName}</span>
            <span class="lobby-room-item-meta">${r.hostName} · ${r.currentPlayers}/${r.maxPlayers} players</span>
          </div>
          <div class="lobby-room-item-right">
            ${r.isPublic
              ? `<button class="lobby-join-btn" onclick="lobbyJoinFromList('${r.code}')">Join</button>`
              : `<button class="lobby-join-btn lobby-join-btn-code" onclick="lobbyJoinPrivateFromList()">Enter Code</button>`
            }
          </div>
        </div>`).join("");
    }

    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Browse Rooms</h2>
        <button class="lobby-refresh-btn" onclick="lobbyRefreshBrowse()" title="Refresh">↺</button>
      </div>
      <div class="lobby-room-list">${listHtml}</div>
      <div class="lobby-status-msg" style="font-size:0.78rem;">Live updates active...</div>
      ${backBtn}
    `;
    return;
  }

  // ── Join by code ─────────────────────────────────────────────────────────
  if (lobbyState.screen === "join-code") {
    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Join by Code</h2>
      </div>
      <div class="lobby-form">
        <label class="lobby-label">Room Code (6 digits)</label>
        <input class="lobby-input" id="lobbyRoomCode" type="text"
          maxlength="6" placeholder="XXXXXX" autocomplete="off"
          style="text-align:center;letter-spacing:0.25em;font-size:1.4rem;font-weight:700;" />
      </div>
      <div class="lobby-row" style="margin-top:1.2rem;">
        ${backBtn}
        <button class="primary-button" onclick="lobbyJoinByCode()">Join</button>
      </div>
    `;
    return;
  }

  // ── No server ─────────────────────────────────────────────────────────────
  if (lobbyState.screen === "no-server") {
    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Server Unavailable</h2>
      </div>
      <div class="lobby-error-msg">
        ⚠️ Could not connect to the game server.<br><br>
        Please check that the Railway.app server is running,<br>
        or switch to Single PC mode.
      </div>
      <div class="lobby-row">
        ${backBtn}
        <button class="secondary-button" onclick="lobbyExit()">Switch to Single PC</button>
      </div>
    `;
    return;
  }

  // ── Waiting (host) ────────────────────────────────────────────────────────
  if (lobbyState.screen === "waiting-host") {
    const playerRows = lobbyState.players.map((p) => `
      <div class="lobby-player-row">
        <span class="lobby-player-dot" style="background:${LOBBY_COLORS[p.colorIndex]?.color ?? '#efc77b'};"></span>
        <span class="lobby-player-name">${p.name}</span>
        ${p.isHost ? `<span class="lobby-player-host-badge">HOST</span>` : ""}
      </div>`).join("");

    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Waiting for Players</h2>
      </div>
      <div class="lobby-room-code">${lobbyState.roomCode}</div>
      <p class="lobby-room-code-label">Share this code with other players</p>
      <div class="lobby-color-row">
        <label class="lobby-label">My Color</label>
        <div class="lobby-color-swatches" id="waitingColorSwatches">
          ${_waitingColorSwatches(lobbyState.players, lobbyState.colorIndex)}
        </div>
      </div>
      <div class="lobby-player-list">
        <p class="lobby-player-list-label">Players ${lobbyState.players.length} / ${lobbyState.maxPlayers}</p>
        ${playerRows}
      </div>
      <div class="lobby-status-msg">Waiting for players to join...</div>
      <div class="lobby-row">
        ${backBtn}
        <button class="primary-button" ${lobbyState.players.length < 2 ? "disabled" : ""} onclick="lobbyStartGame()">Start Game</button>
      </div>
    `;
    return;
  }

  // ── Waiting (guest) ───────────────────────────────────────────────────────
  if (lobbyState.screen === "waiting-guest") {
    const playerRows = lobbyState.players.map((p) => `
      <div class="lobby-player-row">
        <span class="lobby-player-dot" style="background:${LOBBY_COLORS[p.colorIndex]?.color ?? '#efc77b'};"></span>
        <span class="lobby-player-name">${p.name}</span>
        ${p.isHost ? `<span class="lobby-player-host-badge">HOST</span>` : ""}
      </div>`).join("");

    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Joined Room</h2>
      </div>
      <div class="lobby-room-code">${lobbyState.roomCode}</div>
      <div class="lobby-color-row">
        <label class="lobby-label">My Color</label>
        <div class="lobby-color-swatches" id="waitingColorSwatches">
          ${_waitingColorSwatches(lobbyState.players, lobbyState.colorIndex)}
        </div>
      </div>
      <div class="lobby-player-list">
        <p class="lobby-player-list-label">Players ${lobbyState.players.length} / ${lobbyState.maxPlayers}</p>
        ${playerRows}
      </div>
      <div class="lobby-status-msg">⏳ Waiting for the host to start the game...</div>
      ${backBtn}
    `;
    return;
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (lobbyState.screen === "error") {
    card.innerHTML = `
      <div class="lobby-header">
        <p class="lobby-eyebrow">BulloMarble · Online Play</p>
        <h2 class="lobby-title">Error</h2>
      </div>
      <div class="lobby-error-msg">${lobbyState.errorMsg ?? "An unknown error occurred."}</div>
      <button class="secondary-button" onclick="lobbyGoBack()">← Back</button>
    `;
    return;
  }
}

// ── Lobby navigation helpers ──────────────────────────────────────────────

function lobbyGoBack() {
  // Leave browse channel when navigating away
  if (lobbyState.screen === "browse") {
    networkSocket?.emit("unwatch_rooms");
  }
  renderLobby("home");
}

function lobbyExit() {
  if (lobbyState.screen === "browse") {
    networkSocket?.emit("unwatch_rooms");
  }
  ui.lobbyOverlay.classList.add("hidden");
  gameMode = "single";
  ui.modeOverlay.classList.remove("hidden");
}

function lobbyPickColor(index) {
  // Persist name before re-render (home screen only)
  const nameEl = document.getElementById("lobbyPlayerName");
  if (nameEl) lobbyState.playerName = nameEl.value;
  lobbyState.colorIndex = index;
  // Just refresh swatches without full re-render if on home screen
  const container = document.getElementById("lobbyColorSwatches");
  if (container) {
    container.innerHTML = _lobbyColorSwatches(index);
  }
}

function lobbyWaitingChangeColor(index) {
  lobbyState.colorIndex = index;
  networkSocket?.emit("change_color", { code: lobbyState.roomCode, colorIndex: index });
  // Optimistically refresh swatches
  const container = document.getElementById("waitingColorSwatches");
  if (container) {
    container.innerHTML = _waitingColorSwatches(lobbyState.players, index);
  }
}

function lobbySetMaxPlayers(n) {
  lobbyState.maxPlayers = n;
}

function lobbySetPublic(isPublic) {
  lobbyState.isPublic = isPublic;
  renderLobby(); // re-render create screen to show/hide pw field
}

function lobbySetTurnTimer(enabled) {
  lobbyState.turnTimerEnabled = enabled;
  renderLobby();
}

function lobbySetTurnTimerSeconds(s) {
  lobbyState.turnTimerSeconds = s;
}

function lobbySetRoundLimit(n) {
  lobbyState.roundLimit = n;
  localStorage.setItem("bgame_roundLimit", n);
  activeRoundLimit = n;
}

function lobbyShowCreate() {
  const nameEl = document.getElementById("lobbyPlayerName");
  if (nameEl) {
    const entered = nameEl.value.trim();
    if (entered) {
      lobbyState.playerName = entered;
      localStorage.setItem("ll_playerName", entered);
    }
  }
  lobbyState.suggestedRoomName = _randomRoomName();
  renderLobby("create");
}

function lobbyShowBrowse() {
  const nameEl = document.getElementById("lobbyPlayerName");
  if (nameEl) {
    const entered = nameEl.value.trim();
    if (entered) {
      lobbyState.playerName = entered;
      localStorage.setItem("ll_playerName", entered);
    }
  }

  lobbyState.browseRooms = [];
  renderLobby("browse");

  // 1) HTTP fetch: immediate, reliable (no socket needed)
  fetch("/api/rooms")
    .then((r) => r.json())
    .then((rooms) => {
      console.log("[lobby] /api/rooms →", rooms.length, "rooms");
      lobbyState.browseRooms = rooms;
      if (lobbyState.screen === "browse") renderLobby();
    })
    .catch(() => {});

  // 2) Socket subscription for real-time updates
  const socket = connectSocket();
  if (!socket) return;
  if (socket.connected) {
    socket.emit("watch_rooms");
  }
  // The "connect" handler in attachSocketHandlers will emit watch_rooms if not yet connected
}

function lobbyRefreshBrowse() {
  fetch("/api/rooms")
    .then((r) => r.json())
    .then((rooms) => {
      lobbyState.browseRooms = rooms;
      if (lobbyState.screen === "browse") renderLobby();
    })
    .catch(() => {});
  networkSocket?.emit("watch_rooms");
}

function lobbyShowJoinCode() {
  const nameEl = document.getElementById("lobbyPlayerName");
  if (nameEl) {
    const entered = nameEl.value.trim();
    if (entered) {
      lobbyState.playerName = entered;
      localStorage.setItem("ll_playerName", entered);
    }
  }
  renderLobby("join-code");
}

// ── Socket connection ─────────────────────────────────────────────────────

function connectSocket() {
  if (networkSocket?.connected) return networkSocket;
  if (window._socketIOUnavailable || typeof window.io === "undefined") {
    renderLobby("no-server");
    return null;
  }
  networkSocket = window.io(window.location.origin, { transports: ["websocket", "polling"] });
  attachSocketHandlers(networkSocket);
  return networkSocket;
}

function attachSocketHandlers(socket) {
  // ── Connection events ─────────────────────────────
  socket.on("connect", () => {
    console.log("[socket] connected:", socket.id);
    // If the user is on the browse screen, request the room list now
    if (lobbyState.screen === "browse") {
      console.log("[lobby] watch_rooms emit (on connect)");
      socket.emit("watch_rooms");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
  });

  // ── Lobby events ─────────────────────────────────
  socket.on("room_created", ({ code, players, maxPlayers }) => {
    lobbyState.roomCode   = code;
    lobbyState.players    = players;
    lobbyState.maxPlayers = maxPlayers ?? lobbyState.maxPlayers;
    lobbyState.isHost     = true;
    const me = players.find(p => p.socketId === socket.id);
    if (me) lobbyState.colorIndex = me.colorIndex;
    renderLobby("waiting-host");
  });

  socket.on("room_joined", ({ code, players, maxPlayers }) => {
    lobbyState.roomCode   = code;
    lobbyState.players    = players;
    lobbyState.maxPlayers = maxPlayers ?? lobbyState.maxPlayers;
    lobbyState.isHost     = false;
    const me = players.find(p => p.socketId === socket.id);
    if (me) lobbyState.colorIndex = me.colorIndex;
    renderLobby("waiting-guest");
  });

  socket.on("room_updated", ({ players, maxPlayers }) => {
    lobbyState.players    = players;
    if (maxPlayers) lobbyState.maxPlayers = maxPlayers;
    const me = players.find(p => p.socketId === socket.id);
    if (me) lobbyState.colorIndex = me.colorIndex;
    renderLobby();
  });

  socket.on("player_left", ({ players }) => {
    lobbyState.players = players;
    renderLobby();
  });

  socket.on("rooms_updated", (rooms) => {
    console.log("[lobby] rooms_updated received:", rooms.length, "rooms, screen:", lobbyState.screen);
    lobbyState.browseRooms = rooms;
    if (lobbyState.screen === "browse") renderLobby();
  });

  socket.on("lobby_error", ({ message }) => {
    lobbyState.errorMsg = message;
    renderLobby("error");
  });

  // ── Game events ──────────────────────────────────
  socket.on("game_started", (serverState) => {
    if (serverState.roundLimit) {
      activeRoundLimit = serverState.roundLimit;
      localStorage.setItem("bgame_roundLimit", serverState.roundLimit);
    }
    applyServerState(serverState);
    ui.lobbyOverlay.classList.add("hidden");
    ui.winnerOverlay.classList.add("hidden");
    primeAudio();
    render();
    const firstPlayer = state.players[0];
    requestAnimationFrame(() => {
      showRoundAnnounce(1);
      setTimeout(() => showTurnAnnounce(firstPlayer), 2600);
      if (state.turnTimerSeconds > 0) {
        const isMyTurn = firstPlayer?.socketId === socket.id;
        if (isMyTurn) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 5000);
      }
    });
  });

  socket.on("state_update", (serverState) => {
    const prevIdx   = state.currentPlayerIndex;
    const prevRound = state.round;
    applyServerState(serverState);
    if (serverState.gameOver) {
      stopTurnTimer();
      showFireworks(3800, () => renderWinnerOverlay());
    } else if (serverState.currentPlayerIndex !== undefined && serverState.currentPlayerIndex !== prevIdx) {
      const newPlayer  = state.players[serverState.currentPlayerIndex];
      const roundBumped = state.round > prevRound;
      if (roundBumped) {
        showRoundAnnounce(state.round);
        setTimeout(() => showTurnAnnounce(newPlayer), 2600);
        if (state.turnTimerSeconds > 0) {
          const isMyTurn = newPlayer?.socketId === socket.id;
          stopTurnTimer();
          if (isMyTurn) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 5000);
        }
      } else {
        showTurnAnnounce(newPlayer);
        if (state.turnTimerSeconds > 0) {
          const isMyTurn = newPlayer?.socketId === socket.id;
          stopTurnTimer();
          if (isMyTurn) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 2400);
        }
      }
    }
    render();
  });

  socket.on("connect_error", () => {
    renderLobby("no-server");
  });
}

function applyServerState(serverState) {
  // Enrich landmarks with client visual data (images, tones, profiles)
  if (serverState.landmarks) {
    serverState.landmarks = serverState.landmarks.map((lm) => {
      const def = LANDMARK_DEFS.find((d) => d.id === lm.id);
      return def ? { ...def, ...lm } : lm;
    });
  }
  // Merge server state, preserving client-only UI fields
  const preserved = {
    soundEnabled:     state.soundEnabled,
    audioUnlocked:    state.audioUnlocked,
    itemModalTab:     state.itemModalTab,
  };
  // Preserve turnTimerSeconds if server doesn't send it
  if (serverState.turnTimerSeconds === undefined) {
    preserved.turnTimerSeconds = state.turnTimerSeconds;
  }
  Object.assign(state, serverState, preserved);
}

// ── Room actions ──────────────────────────────────────────────────────────

function lobbyConfirmCreate() {
  const roomNameEl = document.getElementById("lobbyRoomName");
  const roomName   = roomNameEl?.value.trim() || lobbyState.suggestedRoomName;
  const name       = lobbyState.playerName || "Player";

  const socket = connectSocket();
  if (!socket) return;

  socket.emit("create_room", {
    name,
    colorIndex:      lobbyState.colorIndex,
    roomName,
    maxPlayers:      lobbyState.maxPlayers,
    isPublic:        lobbyState.isPublic,
    password:        "",
    turnTimerSeconds: lobbyState.turnTimerEnabled ? lobbyState.turnTimerSeconds : 0,
    roundLimit:      lobbyState.roundLimit,
  });
}

function lobbyJoinFromList(code) {
  networkSocket?.emit("unwatch_rooms");
  _doJoin(code, "");
}

function lobbyJoinPrivateFromList() {
  networkSocket?.emit("unwatch_rooms");
  renderLobby("join-code");
}

function lobbyJoinByCode() {
  const codeEl = document.getElementById("lobbyRoomCode");
  const code = codeEl?.value.trim().toUpperCase();
  if (!code || code.length !== 6) {
    lobbyState.errorMsg = "Please enter a 6-digit room code.";
    renderLobby("error");
    return;
  }
  _doJoin(code, "");
}

function _doJoin(code, password) {
  const name = lobbyState.playerName || "Player";
  const socket = connectSocket();
  if (!socket) return;
  socket.emit("join_room", { code, name, colorIndex: lobbyState.colorIndex, password });
}

function lobbyStartGame() {
  networkSocket?.emit("start_game", { code: lobbyState.roomCode });
}

// ── Legacy alias kept for any existing onclick references ─────────────────
function lobbyCreateRoom() { lobbyShowCreate(); }
function lobbyJoinRoom()   { lobbyShowJoinCode(); }

window.renderLobby           = renderLobby;
window.lobbyGoBack           = lobbyGoBack;
window.lobbyExit             = lobbyExit;
window.lobbyPickColor        = lobbyPickColor;
window.lobbySetMaxPlayers    = lobbySetMaxPlayers;
window.lobbySetPublic        = lobbySetPublic;
window.lobbySetTurnTimer     = lobbySetTurnTimer;
window.lobbySetTurnTimerSeconds = lobbySetTurnTimerSeconds;
window.lobbySetRoundLimit    = lobbySetRoundLimit;
window.lobbyShowCreate       = lobbyShowCreate;
window.lobbyShowBrowse       = lobbyShowBrowse;
window.lobbyRefreshBrowse    = lobbyRefreshBrowse;
window.lobbyShowJoinCode     = lobbyShowJoinCode;
window.lobbyConfirmCreate    = lobbyConfirmCreate;
window.lobbyJoinFromList          = lobbyJoinFromList;
window.lobbyJoinPrivateFromList   = lobbyJoinPrivateFromList;
window.lobbyJoinByCode       = lobbyJoinByCode;
window.lobbyCreateRoom       = lobbyCreateRoom;
window.lobbyJoinRoom         = lobbyJoinRoom;
window.lobbyStartGame        = lobbyStartGame;
window.toggleAIPlayer          = toggleAIPlayer;
window.lobbyWaitingChangeColor = lobbyWaitingChangeColor;
window.backToModeSelect        = backToModeSelect;
