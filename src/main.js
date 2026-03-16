import { SEED_CATALOG, getSeed, getRandomSeed, buildLandmarkDefs } from "./seeds.js";

// ── Character Definitions ─────────────────────────────────────────────────
const CHARACTER_DEFS = [
  {
    id: "tycoon", name: "Mr. Tycoon", title: "Real Estate Mogul", icon: "🏛",
    portrait: "assets/characters/tycoon.png", mini: "assets/characters/tycoon-mini.png",
    passive: { id: "land-discount", name: "Land Discount", desc: "Buy landmarks at 10% off", params: { discount: 0.10 } }
  },
  {
    id: "broker", name: "Ms. Broker", title: "Stock Broker", icon: "📈",
    portrait: "assets/characters/broker.png", mini: "assets/characters/broker-mini.png",
    passive: { id: "rent-boost", name: "Rent Boost", desc: "Collect 15% extra rent", params: { boost: 0.15 } }
  },
  {
    id: "architect", name: "Dr. Architect", title: "Master Builder", icon: "📐",
    portrait: "assets/characters/architect.png", mini: "assets/characters/architect-mini.png",
    passive: { id: "upgrade-discount", name: "Upgrade Discount", desc: "Upgrade costs 15% less", params: { discount: 0.15 } }
  },
  {
    id: "explorer", name: "Cpt. Explorer", title: "World Adventurer", icon: "🧭",
    portrait: "assets/characters/explorer.png", mini: "assets/characters/explorer-mini.png",
    passive: { id: "extra-move", name: "Extra Move", desc: "+1 extra space per roll", params: { extra: 1 } }
  },
  {
    id: "banker", name: "Lady Banker", title: "Finance Queen", icon: "🏦",
    portrait: "assets/characters/banker.png", mini: "assets/characters/banker-mini.png",
    passive: { id: "interest", name: "Interest", desc: "Earn 3% interest on cash each round", params: { rate: 0.03 } }
  },
  {
    id: "gambler", name: "Lucky Gambler", title: "Fortune Chaser", icon: "🎰",
    portrait: "assets/characters/gambler.png", mini: "assets/characters/gambler-mini.png",
    passive: { id: "double-or-nothing", name: "Double or Nothing", desc: "50% chance for 2x START bonus", params: { chance: 0.5 } }
  },
  {
    id: "diplomat", name: "Ambassador", title: "Peace Negotiator", icon: "🤝",
    portrait: "assets/characters/diplomat.png", mini: "assets/characters/diplomat-mini.png",
    passive: { id: "tax-shield", name: "Tax Shield", desc: "Pay 30% less tax", params: { reduction: 0.30 } }
  },
  {
    id: "engineer", name: "Chief Engineer", title: "Tech Innovator", icon: "⚙",
    portrait: "assets/characters/engineer.png", mini: "assets/characters/engineer-mini.png",
    passive: { id: "fast-build", name: "Fast Build", desc: "Free auto-upgrade on purchase", params: {} }
  },
  {
    id: "spy", name: "Shadow Agent", title: "Covert Operative", icon: "🕵",
    portrait: "assets/characters/spy.png", mini: "assets/characters/spy-mini.png",
    passive: { id: "intel", name: "Intel", desc: "Get 15% cashback on rent paid", params: { cashback: 0.15 } }
  },
  {
    id: "merchant", name: "Grand Merchant", title: "Trade Master", icon: "💰",
    portrait: "assets/characters/merchant.png", mini: "assets/characters/merchant-mini.png",
    passive: { id: "trade-bonus", name: "Trade Bonus", desc: "Buy items at 20% off", params: { discount: 0.20 } }
  },
  {
    id: "oracle", name: "The Oracle", title: "Mystic Seer", icon: "🔮",
    portrait: "assets/characters/oracle.png", mini: "assets/characters/oracle-mini.png",
    passive: { id: "foresight", name: "Foresight", desc: "2x chance for bonus events", params: { multiplier: 2 } }
  },
  {
    id: "commander", name: "Commander", title: "Strategic Leader", icon: "⚔",
    portrait: "assets/characters/commander.png", mini: "assets/characters/commander-mini.png",
    passive: { id: "rally", name: "Rally", desc: "+10% rent with 3+ buildings", params: { threshold: 3, boost: 0.10 } }
  },
];

function getCharacter(id) { return CHARACTER_DEFS.find(c => c.id === id) || CHARACTER_DEFS[0]; }

let _diceInitialized = false;

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

// ── Active seed state (rebuilt on each game start) ────────────────────────
let activeSeed = getSeed("world-landmarks");
let activeSeedId = localStorage.getItem("bgame_seedId") || "world-landmarks";
let LANDMARK_DEFS = buildLandmarkDefs(activeSeed);

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
  whoosh(ctx) {
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(800, t + 0.25);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.35);
    _noise(ctx, t, 0.3, 0.1, 3000);
  },
  sparkle(ctx) {
    const t = ctx.currentTime;
    [1568, 2093, 2637, 3136].forEach((f, i) =>
      _osc(ctx, f, "sine", t + i * 0.06, 0.18, 0.12));
  },
  swoosh(ctx) {
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(900, t);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.4);
    _noise(ctx, t + 0.05, 0.25, 0.08, 2000);
  },
  cash_fly(ctx) {
    const t = ctx.currentTime;
    _noise(ctx, t, 0.3, 0.12, 2400);
    [1200, 1400, 1600].forEach((f, i) => _osc(ctx, f, "sine", t + i * 0.06, 0.08, 0.06));
  },
  cash_in(ctx) {
    const t = ctx.currentTime;
    _osc(ctx, 1568, "sine", t, 0.12, 0.22);
    _osc(ctx, 2093, "sine", t + 0.06, 0.14, 0.18);
    _noise(ctx, t + 0.04, 0.08, 0.08, 4000);
  },
  cash_out(ctx) {
    const t = ctx.currentTime;
    _osc(ctx, 880, "sine", t, 0.15, 0.18);
    _osc(ctx, 660, "sine", t + 0.08, 0.12, 0.14);
    _noise(ctx, t, 0.12, 0.06, 1800);
  },
  cash_drain(ctx) {
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sawtooth"; o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.4);
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.start(t); o.stop(t + 0.42);
    _noise(ctx, t, 0.35, 0.08, 800);
  },
  coins_shower(ctx) {
    const t = ctx.currentTime;
    for (let i = 0; i < 8; i++) {
      const f = 2000 + Math.random() * 2000;
      _osc(ctx, f, "sine", t + i * 0.04, 0.06, 0.08);
    }
    _noise(ctx, t, 0.3, 0.06, 5000);
  },
  sparkle_high(ctx) {
    const t = ctx.currentTime;
    [2637, 3136, 3520, 4186].forEach((f, i) => _osc(ctx, f, "sine", t + i * 0.05, 0.12, 0.1));
  },
  impact(ctx) {
    const t = ctx.currentTime;
    _osc(ctx, 80, "sine", t, 0.18, 0.3);
    _noise(ctx, t, 0.12, 0.2, 600);
  },
  celebrate_early(ctx) {
    const t = ctx.currentTime;
    [523, 659, 784].forEach((f, i) => _osc(ctx, f, "sine", t + i * 0.08, 0.25, 0.16));
    _noise(ctx, t + 0.1, 0.15, 0.06, 3000);
  },
  celebrate_mid(ctx) {
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => _osc(ctx, f, "triangle", t + i * 0.07, 0.3, 0.2));
    [262, 330, 392].forEach((f, i) => _osc(ctx, f, "sine", t + i * 0.07, 0.4, 0.08));
    _noise(ctx, t + 0.08, 0.2, 0.1, 3500);
  },
  celebrate_late(ctx) {
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1319].forEach((f, i) => _osc(ctx, f, "triangle", t + i * 0.06, 0.35, 0.22));
    [262, 330, 392, 523].forEach((f, i) => _osc(ctx, f, "sine", t + i * 0.06, 0.5, 0.1));
    _noise(ctx, t, 0.3, 0.15, 4000);
    _noise(ctx, t + 0.15, 0.2, 0.1, 1200);
  },
  fanfare(ctx) {
    const t = ctx.currentTime;
    [784, 988, 1175, 1319, 1568].forEach((f, i) => _osc(ctx, f, "triangle", t + i * 0.1, 0.4, 0.2));
    [392, 494, 587].forEach((f, i) => _osc(ctx, f, "sine", t + i * 0.1, 0.6, 0.12));
    _noise(ctx, t + 0.2, 0.35, 0.12, 2000);
  },
  grand_fanfare(ctx) {
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => _osc(ctx, f, "triangle", t + i * 0.08, 0.45, 0.22));
    [262, 330, 392, 523, 659].forEach((f, i) => _osc(ctx, f, "sine", t + i * 0.08, 0.6, 0.14));
    _noise(ctx, t, 0.15, 0.18, 1400);
    _noise(ctx, t + 0.2, 0.4, 0.14, 3000);
    _osc(ctx, 65, "sine", t, 0.3, 0.25);
  },
};

const BOARD_POSITIONS = buildBoardPositions(BOARD_SIZE);
let SPACE_DEFS = buildSpaceDefs();

// ── Seed loading (rebuilds LANDMARK_DEFS + SPACE_DEFS + board center) ────
function loadSeed(seedId, shuffle = true) {
  activeSeed = getSeed(seedId);
  activeSeedId = seedId;
  localStorage.setItem("bgame_seedId", seedId);
  LANDMARK_DEFS = buildLandmarkDefs(activeSeed, shuffle);
  SPACE_DEFS = buildSpaceDefs();
  // Update board center background
  const bc = document.querySelector(".board-center");
  if (bc) {
    const img = activeSeed.boardCenter || "assets/ui/world-landmark-main-board.png";
    bc.style.backgroundImage = `url('${img}'), linear-gradient(145deg, #0e2535, #081520)`;
  }
  // Update sidebar seed label
  const seedLabel = document.getElementById("sidebarSeedLabel");
  if (seedLabel) seedLabel.textContent = `${activeSeed.icon} ${activeSeed.name}`;
  // Update mode label
  const modeLabel = document.getElementById("sidebarModeLabel");
  if (modeLabel) modeLabel.textContent = gameMode === "network" ? "Online Play" : "Local Play";
}

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
  // Cancel AI turn timer
  _cancelAITurn();
  // Force stop game state
  if (state) state.gameOver = true;
  // Remove any flying character cards
  document.querySelectorAll(".flying-char-card").forEach(el => el.remove());
  // Remove screen shake
  document.body.classList.remove("screen-shake");
  // Clear any money particles
  document.querySelectorAll(".money-particle, .confetti-particle, .celebrate-ring").forEach(el => el.remove());
  // Stop fireworks canvas
  const fc = document.getElementById("fireworksCanvas");
  if (fc) { fc.classList.add("hidden"); fc.style.display = ""; }
}

function initialize() {
  ui.board.style.setProperty("--board-size", String(BOARD_SIZE));
  // Restore saved player count
  const savedPlayerCount = localStorage.getItem("bgame_playerCount");
  if (savedPlayerCount) {
    ui.playerCountSelect.value = savedPlayerCount;
    const radio = document.querySelector(`input[name="uiPlayerCount"][value="${savedPlayerCount}"]`);
    if (radio) radio.checked = true;
  }
  renderPlayerFields(Number(ui.playerCountSelect.value));
  ui.playerCountSelect.addEventListener("change", () => {
    renderPlayerFields(Number(ui.playerCountSelect.value));
  });
  document.querySelectorAll('input[name="uiPlayerCount"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      ui.playerCountSelect.value = radio.value;
      localStorage.setItem("bgame_playerCount", radio.value);
      ui.playerCountSelect.dispatchEvent(new Event("change"));
    });
  });
  // Restore saved round limit selection
  const savedRoundLimit = localStorage.getItem("bgame_roundLimit");
  if (savedRoundLimit) {
    const sel = document.getElementById("roundLimitSelect");
    if (sel) sel.value = savedRoundLimit;
  }
  // Restore saved turn timer
  const savedTurnTimer = localStorage.getItem("bgame_turnTimer") || "0";
  const timerRadio = document.querySelector(`input[name="uiTurnTimer"][value="${savedTurnTimer}"]`);
  if (timerRadio) timerRadio.checked = true;
  // Save turn timer on change
  document.querySelectorAll('input[name="uiTurnTimer"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      localStorage.setItem("bgame_turnTimer", radio.value);
    });
  });
  // Populate seed selection grid
  renderSeedGrid();
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

  const savedAI = JSON.parse(localStorage.getItem("bgame_aiFlags") || "[]");

  for (let index = 0; index < count; index += 1) {
    const defaultColorIndex = index % COLOR_PALETTE.length;
    const defaultCharId = CHARACTER_DEFS[index % CHARACTER_DEFS.length].id;
    const ch = getCharacter(defaultCharId);
    const isAI = savedAI[index] === "1";
    const playerName = isAI ? AI_NAMES[index % AI_NAMES.length] : `Investor ${index + 1}`;
    const wrapper = document.createElement("div");
    wrapper.className = "player-field-row";
    wrapper.dataset.selectedColor = defaultColorIndex;
    wrapper.dataset.isAi = isAI ? "1" : "0";
    wrapper.dataset.characterId = defaultCharId;
    wrapper.innerHTML = `
      <div class="player-field-left">
        <div class="player-field-header">
          <span class="player-field-num" style="background:${COLOR_PALETTE[defaultColorIndex].color}; color:#07131e;">P${index + 1}</span>
          <input
            type="text"
            name="player-${index}"
            maxlength="18"
            value="${playerName}"
            autocomplete="off"
            class="player-name-input"
            ${isAI ? "disabled" : ""}
          />
        </div>
        <div class="player-field-bottom">
          <button type="button" class="ai-toggle-btn ${isAI ? "active" : ""}" data-player-index="${index}" onclick="toggleAIPlayer(this)">🤖 AI</button>
          <div class="color-swatch-row">
            ${COLOR_PALETTE.map((c, ci) => `
              <button type="button" class="color-swatch ${ci === defaultColorIndex ? "selected" : ""}"
                data-color-index="${ci}"
                style="background:${c.color};"
                title="${c.label}"
              ></button>
            `).join("")}
          </div>
        </div>
      </div>
      <button type="button" class="char-card-btn" data-player-index="${index}" onclick="openCharSelect(${index})">
        <span class="char-card-label">${ch.icon} ${ch.name}</span>
        <img src="${ch.portrait}" class="char-card-img" alt="${ch.name}">
      </button>
    `;
    ui.playerFields.append(wrapper);
  }

  attachSwatchListeners();
}

// ── Character Selection Popup ──────────────────────────────────────────
function openCharSelect(playerIndex) {
  const rows = Array.from(ui.playerFields.querySelectorAll(".player-field-row"));
  const taken = rows.map((r, i) => i !== playerIndex ? r.dataset.characterId : null).filter(Boolean);
  const currentCharId = rows[playerIndex].dataset.characterId;

  let modal = document.getElementById("charSelectModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "charSelectModal";
    modal.className = "char-select-modal hidden";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="char-select-backdrop" onclick="closeCharSelect()"></div>
    <div class="char-select-panel">
      <div class="char-select-title">Select Character <span class="char-select-close" onclick="closeCharSelect()">✕</span></div>
      <div class="char-select-grid">
        ${CHARACTER_DEFS.map(ch => {
          const isTaken = taken.includes(ch.id);
          const isActive = ch.id === currentCharId;
          return `
            <button type="button" class="char-select-card ${isActive ? "active" : ""} ${isTaken ? "taken" : ""}"
              data-char-id="${ch.id}" ${isTaken ? "disabled" : ""} onclick="pickCharacter(${playerIndex}, '${ch.id}')">
              <img src="${ch.portrait}" class="char-select-portrait" alt="${ch.name}">
              <div class="char-select-info">
                <span class="char-select-name">${ch.icon} ${ch.name}</span>
                <span class="char-select-title-text">${ch.title}</span>
                <span class="char-select-passive">⚡ ${ch.passive.name}</span>
                <span class="char-select-desc">${ch.passive.desc}</span>
              </div>
            </button>`;
        }).join("")}
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}

function pickCharacter(playerIndex, charId) {
  const rows = Array.from(ui.playerFields.querySelectorAll(".player-field-row"));
  const row = rows[playerIndex];
  row.dataset.characterId = charId;
  const ch = getCharacter(charId);
  const btn = row.querySelector(".char-card-btn");
  btn.querySelector(".char-card-img").src = ch.portrait;
  btn.querySelector(".char-card-label").textContent = `${ch.icon} ${ch.name}`;
  closeCharSelect();
}

function closeCharSelect() {
  const modal = document.getElementById("charSelectModal");
  if (modal) modal.classList.add("hidden");
}
// Lobby character select — reuses the same popup
function openLobbyCharSelect() {
  let modal = document.getElementById("charSelectModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "charSelectModal";
    modal.className = "char-select-modal hidden";
    document.body.appendChild(modal);
  }
  const currentCharId = lobbyState.characterId;
  modal.innerHTML = `
    <div class="char-select-backdrop" onclick="closeCharSelect()"></div>
    <div class="char-select-panel">
      <div class="char-select-title">Select Character <span class="char-select-close" onclick="closeCharSelect()">✕</span></div>
      <div class="char-select-grid">
        ${CHARACTER_DEFS.map(ch => {
          const isActive = ch.id === currentCharId;
          return `
            <button type="button" class="char-select-card ${isActive ? "active" : ""}"
              data-char-id="${ch.id}" onclick="pickLobbyCharacter('${ch.id}')">
              <img src="${ch.portrait}" class="char-select-portrait" alt="${ch.name}">
              <div class="char-select-info">
                <span class="char-select-name">${ch.icon} ${ch.name}</span>
                <span class="char-select-title-text">${ch.title}</span>
                <span class="char-select-passive">⚡ ${ch.passive.name}</span>
                <span class="char-select-desc">${ch.passive.desc}</span>
              </div>
            </button>`;
        }).join("")}
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}

function pickLobbyCharacter(charId) {
  lobbyState.characterId = charId;
  const ch = getCharacter(charId);
  const btn = document.getElementById("lobbyCharCardBtn");
  if (btn) {
    btn.querySelector(".char-card-img").src = ch.portrait;
    btn.querySelector(".char-card-label").textContent = `${ch.icon} ${ch.name}`;
  }
  networkSocket?.emit("change_character", { characterId: charId });
  closeCharSelect();
}

window.openCharSelect = openCharSelect;
window.pickCharacter = pickCharacter;
window.closeCharSelect = closeCharSelect;
window.openLobbyCharSelect = openLobbyCharSelect;
window.pickLobbyCharacter = pickLobbyCharacter;

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
  // Save AI flags
  _saveAIFlags();
}

function _saveAIFlags() {
  const rows = Array.from(ui.playerFields.querySelectorAll(".player-field-row"));
  const flags = rows.map(r => r.dataset.isAi === "1" ? "1" : "0");
  localStorage.setItem("bgame_aiFlags", JSON.stringify(flags));
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

function renderSeedGrid() {
  const wrap = document.getElementById("seedDropdownWrap");
  if (!wrap) return;
  const saved = localStorage.getItem("bgame_seedId") || "world-landmarks";
  const trigger = document.getElementById("seedDropdownTrigger");
  const list = document.getElementById("seedDropdownList");
  const ddIcon = document.getElementById("seedDdIcon");
  const ddName = document.getElementById("seedDdName");
  const ddDesc = document.getElementById("seedDdDesc");

  // Hidden select for form value
  let seedSelect = document.getElementById("seedSelect");
  if (!seedSelect) {
    seedSelect = document.createElement("select");
    seedSelect.id = "seedSelect";
    seedSelect.className = "hidden";
    wrap.parentElement.appendChild(seedSelect);
  }
  seedSelect.innerHTML = `<option value="_random">Random</option>` +
    SEED_CATALOG.map(s => `<option value="${s.id}" ${s.id === saved ? "selected" : ""}>${s.name}</option>`).join("");
  if (saved === "_random") seedSelect.value = "_random";

  // Set initial trigger display
  function updateTrigger(id) {
    if (id === "_random") {
      ddIcon.textContent = "🎲";
      ddName.textContent = "Random Theme";
      ddDesc.textContent = "A random theme will be selected";
    } else {
      const s = SEED_CATALOG.find(x => x.id === id);
      if (s) {
        ddIcon.textContent = s.icon;
        ddName.textContent = s.name;
        ddDesc.textContent = s.description;
      }
    }
  }
  updateTrigger(saved);

  // Build dropdown items
  list.innerHTML = `
    <button type="button" class="seed-dd-item ${saved === "_random" ? "active" : ""}" data-seed-id="_random">
      <span class="seed-dd-item-num">-</span>
      <span class="seed-dd-item-icon">🎲</span>
      <span class="seed-dd-item-info">
        <span class="seed-dd-item-name">Random Theme</span>
        <span class="seed-dd-item-desc">A random theme will be selected</span>
      </span>
    </button>
    ${SEED_CATALOG.map((s, i) => `
      <button type="button" class="seed-dd-item ${s.id === saved ? "active" : ""}" data-seed-id="${s.id}">
        <span class="seed-dd-item-num">${i + 1}</span>
        <span class="seed-dd-item-icon">${s.icon}</span>
        <span class="seed-dd-item-info">
          <span class="seed-dd-item-name">${s.name}</span>
          <span class="seed-dd-item-desc">${s.description}</span>
        </span>
      </button>
    `).join("")}
  `;

  // Move list to body so no parent overflow/z-index can clip it
  document.body.appendChild(list);

  // Toggle dropdown — position relative to trigger
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasHidden = list.classList.contains("hidden");
    list.classList.toggle("hidden");
    if (wasHidden) {
      const r = trigger.getBoundingClientRect();
      list.style.left = r.left + "px";
      list.style.width = r.width + "px";
      list.style.top = (r.bottom + 4) + "px";
    }
  });

  // Select item — use mousedown to fire before any blur/click race
  list.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const item = e.target.closest("[data-seed-id]");
    if (!item) return;
    const id = item.dataset.seedId;
    list.querySelectorAll(".seed-dd-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    seedSelect.value = id;
    localStorage.setItem("bgame_seedId", id);
    activeSeedId = id;
    updateTrigger(id);
    list.classList.add("hidden");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    list.classList.add("hidden");
  });
}

function handleSetupSubmit(event) {
  event.preventDefault();
  const count = Number(ui.playerCountSelect.value);
  const rows = Array.from(ui.playerFields.querySelectorAll(".player-field-row")).slice(0, count);
  const names = rows.map((row, index) => row.querySelector("input")?.value.trim() || `Investor ${index + 1}`);
  const colorIndices = rows.map((row) => Number(row.dataset.selectedColor));

  const turnTimerSeconds = Number(document.querySelector('input[name="uiTurnTimer"]:checked')?.value ?? 0);
  const aiFlags = rows.map(row => row.dataset.isAi === "1");
  const charIds = rows.map(row => row.dataset.characterId || CHARACTER_DEFS[0].id);
  const newRoundLimit = Number(document.getElementById("roundLimitSelect")?.value) || ROUND_LIMIT;
  activeRoundLimit = newRoundLimit;
  localStorage.setItem("bgame_roundLimit", newRoundLimit);
  const seedSelect = document.getElementById("seedSelect");
  const selectedSeed = seedSelect?.value || activeSeedId;
  startGame(names, colorIndices, turnTimerSeconds, aiFlags, selectedSeed, charIds);
}

function startGame(names, colorIndices = [], turnTimerSeconds = 0, aiFlags = [], seedId = null, charIds = []) {
  _diceInitialized = false;
  // Load the selected seed (shuffle landmarks each game)
  let chosenSeed = seedId || activeSeedId;
  if (chosenSeed === "_random") chosenSeed = getRandomSeed().id;
  loadSeed(chosenSeed, true);
  state.players = names.map((name, index) => {
    const paletteIndex = colorIndices[index] ?? index % COLOR_PALETTE.length;
    const style = COLOR_PALETTE[paletteIndex];
    const charId = charIds[index] || CHARACTER_DEFS[index % CHARACTER_DEFS.length].id;
    const character = getCharacter(charId);
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
    characterId: charId,
    character,
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
  render();
  // Defer one frame so .board-center is laid out before positioning
  requestAnimationFrame(() => {
    showRoundAnnounce(1);
    setTimeout(() => showTurnAnnounce(currentPlayer()), 2600);
    if (state.turnTimerSeconds > 0) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 5000);
    if (currentPlayer()?.isAI) _scheduleAITurn(4400);
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

  return shortenText(state.log[0], 140);
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

function _hasRealImage(landmark) {
  // Check if this landmark has a real image (not a board-center fallback)
  return landmark.image && !landmark.image.includes("board-center") && !landmark.image.includes("world-landmark-main");
}

function renderLandmarkTile(index, landmark, owner) {
  const tierChip = owner ? SHORT_TIER_LABELS[landmark.level] : "OPEN";
  const hasImg = _hasRealImage(landmark);
  const fallbackName = hasImg ? "" : `<span class="lm-fallback-name">${shortenText(landmark.name, 16)}</span>`;
  const fallbackCity = hasImg ? "" : `<span class="lm-fallback-city">${shortenText(landmark.city, 14)}</span>`;
  const backdropClass = hasImg ? "" : "no-image";
  return `
    <div class="space-topline ${owner ? "topline-owned" : ""}" ${owner ? `style="--owner-color:${owner.color};"` : ""}>
      ${owner
        ? `<span class="space-chip space-owner-chip" style="background:${owner.color}; color:#07131e;">P${owner.marker}</span>`
        : `<span></span>`
      }
      <span class="space-chip ${owner ? "topline-tier-chip" : "neutral"}">${tierChip}</span>
    </div>
    <div class="space-plaza">
      <div class="space-img-backdrop ${backdropClass} ${owner ? `is-owned tier-${landmark.level}` : `phase-${landmark.phase.toLowerCase()}`}"
        style="${hasImg ? `--lm-image:url('${landmark.image}');` : ""} --space-accent:${landmark.tone}; --owner-color:${owner?.color ?? "transparent"}; --owner-glow:${owner?.glow ?? "rgba(255,255,255,0)"};"
      >
        ${fallbackName}
        ${fallbackCity}
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
  // Apply seed event overrides if available
  const ov = activeSeed.eventOverrides?.[space.id] || {};
  const badge = ov.badge || space.badge;
  const icon = ov.icon || space.icon;
  const subtitle = ov.subtitle || space.subtitle;
  return `
    <div class="space-topline">
      <span class="space-chip neutral">${badge}</span>
      <span></span>
    </div>
    <div class="space-plaza event-plaza">
      <div class="event-core">
        <span class="event-glyph">${icon}</span>
      </div>
      <div class="token-list">${renderTokensForSpace(index)}</div>
    </div>
    <div class="space-caption">
      <span class="space-value-pill event">${shortenText(subtitle, 20)}</span>
    </div>
  `;
}

function renderBoardCenter() {
  const center = document.createElement("section");
  center.className = "board-center";
  center.style.gridArea = "2 / 2 / 11 / 11";
  // Apply seed board center image
  const img = activeSeed.boardCenter || "assets/ui/world-landmark-main-board.png";
  center.style.backgroundImage = `url('${img}'), linear-gradient(145deg, #0e2535, #081520)`;
  center.style.backgroundSize = "cover";
  center.style.backgroundPosition = "center";
  // Show seed name and icon in the center
  center.innerHTML = `<div class="board-center-seed-label">${activeSeed.icon} ${activeSeed.name}</div>`;
  return center;
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
  const status = state.gameOver
    ? "Game Over"
    : state.turnBusy
      ? "Moving..."
      : state.turnStarted
        ? "Buy, Upgrade, or End Turn"
        : "Ready to Roll or Item Shop";

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

  // Status aura above dice
  const statusEl = document.getElementById("statusAura");
  if (statusEl) {
    statusEl.innerHTML = `<span class="status-aura-pill" style="--sa-color:${player.color}; --sa-glow:${player.glow};">${status}</span>`;
    statusEl.className = "status-aura-wrap";
    if (!state.gameOver) statusEl.classList.add("status-aura-active");
  }

  ui.turnCard.innerHTML = `
    <div class="turn-brief">
      <div class="turn-brief-head">
        <p class="eyebrow">Current Investor</p>
      </div>
      ${player.character ? `
      <div class="turn-char-card" style="--player-color:${player.color}; --player-glow:${player.glow};">
        <span class="turn-char-top">${player.name}</span>
        <img src="${player.character.portrait}" class="turn-char-img" alt="${player.character.name}">
        <span class="turn-char-bottom">${player.character.icon} ${player.character.name} · ⚡${player.character.passive.name}</span>
      </div>` : `
      <div class="turn-hero">
        <span class="player-dot" style="background:${player.color}; box-shadow:0 0 16px ${player.glow};"></span>
        <h2 class="current-player-name">${player.name}</h2>
      </div>`}
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

  // Initial state: show a random face with slight 3D tilt
  let transform;
  if (!_diceInitialized && !rolling) {
    const randomFace = Math.floor(Math.random() * 6) + 1;
    const tiltX = -12 + Math.random() * 24;
    const tiltZ = -10 + Math.random() * 20;
    transform = rotations[randomFace] + ` rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`;
  } else {
    transform = rotations[value];
  }

  const faces = [1, 2, 3, 4, 5, 6]
    .map((n) => `<div class="die-face face-${n}">${createFacePips(n)}</div>`)
    .join("");

  return `
    <div class="die-wrapper">
      <div class="die-3d ${rolling ? "rolling" : ""}" style="--die-transform: ${transform};">
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

      const isMe = gameMode === "network" && networkSocket && player.socketId === networkSocket.id;

      return `
        <article class="player-card ${index === state.currentPlayerIndex && !state.gameOver ? "current" : ""} ${player.bankrupt ? "bankrupt" : ""} ${isMe ? "is-me" : ""}"
          style="--owner-color:${player.color}; --owner-glow:${player.glow};"
          data-player-id="${player.id}">
          <div class="player-card-band" style="background:${player.color};">
            <span class="player-marker-chip" style="color:#07131e;">P${player.marker}</span>
            <strong class="player-card-name" style="color:#07131e;">${player.name}</strong>
          </div>
          ${isMe ? `<span class="me-badge-label">ME</span>` : ""}
          ${player.character ? `<div class="player-card-bg-portrait" style="background-image:url('${player.character.portrait}');"></div>` : ""}
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

  ui.playersStrip.innerHTML = cards;
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
    _diceInitialized = true;
    state.rolling = true;
    renderDice();
    playSound("roll");
    networkSocket?.emit("roll_dice", { code: lobbyState.roomCode });
    return;
  }

  const player = currentPlayer();

  if (!player || state.turnBusy || state.turnStarted || state.gameOver || player.bankrupt) {
    return;
  }

  unlockAudio();
  _diceInitialized = true;
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
  if (player.character?.passive?.id === "extra-move") {
    total += player.character.passive.params.extra;
    addLog(`${player.name}'s Extra Move passive added +${player.character.passive.params.extra} space.`);
  }
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
      let startBonus = PASS_START_BONUS;
      if (player.character?.passive?.id === "double-or-nothing" && Math.random() < player.character.passive.params.chance) {
        startBonus *= 2;
        addLog(`${player.name}'s Double-or-Nothing passive doubled the START bonus!`);
      }
      player.cash += startBonus;
      addLog(`${player.name} passed START and collected $${formatMoney(startBonus)}.`);
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
        if (owner.character?.passive?.id === "rent-boost") {
          const boost = Math.round(rent * owner.character.passive.params.boost);
          rent += boost;
          addLog(`${owner.name}'s Rent Boost passive added $${formatMoney(boost)} to rent.`);
        }
        if (owner.character?.passive?.id === "rally") {
          const ownerBuildings = totalUpgradeCount(owner.id);
          if (ownerBuildings >= owner.character.passive.params.threshold) {
            const boost = Math.round(rent * owner.character.passive.params.boost);
            rent += boost;
            addLog(`${owner.name}'s Rally passive added $${formatMoney(boost)} rent (${ownerBuildings} buildings).`);
          }
        }
        transferCash(player, owner, rent, `${landmark.name} income`);
        playSound("rent");
        requestAnimationFrame(() => fxRentPayment(player, owner, player.position, rent));
        if (player.character?.passive?.id === "intel") {
          const cashback = Math.round(rent * player.character.passive.params.cashback);
          player.cash += cashback;
          addLog(`${player.name}'s Intel passive returned $${formatMoney(cashback)} cashback on rent.`);
        }
      }
    }
  }

  checkForEndConditions("space-resolution");
}

async function resolveEvent(player, space) {
  switch (space.eventType) {
    case "start": {
      let exactBonus = EXACT_START_BONUS;
      if (player.character?.passive?.id === "double-or-nothing" && Math.random() < player.character.passive.params.chance) {
        exactBonus *= 2;
        addLog(`${player.name}'s Double-or-Nothing passive doubled the START landing bonus!`);
      }
      player.cash += exactBonus;
      addLog(`${player.name} landed exactly on START and banked $${formatMoney(exactBonus)}.`);
      checkForEndConditions("start-bonus");
      requestAnimationFrame(() => fxBonusGain(player, player.position, exactBonus));
      return false;
    }

    case "corner-tax": {
      if (hasEffect(player, "tax-shield")) {
        consumeEffect(player, "tax-shield");
        addLog(`${player.name}'s Tax Shield absorbed the city tax.`);
      } else {
        let loss = 150;
        if (player.character?.passive?.id === "tax-shield") {
          const reduction = Math.round(loss * player.character.passive.params.reduction);
          loss -= reduction;
          addLog(`${player.name}'s Tax Shield passive reduced tax by $${formatMoney(reduction)}.`);
        }
        playSound("tax");
        applyCharge(player, loss, "city tax");
        requestAnimationFrame(() => fxTaxCharge(player, player.position, loss));
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
      requestAnimationFrame(() => fxBonusGain(player, player.position, payout));
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
      requestAnimationFrame(() => fxBonusGain(player, player.position, payout));
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
      requestAnimationFrame(() => fxBonusGain(player, player.position, payout));
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
      requestAnimationFrame(() => fxBonusGain(player, player.position, payout));
      return false;
    }

    case "world-event": {
      let roll = Math.floor(Math.random() * 3);
      if (player.character?.passive?.id === "foresight" && roll !== 0) {
        const reroll = Math.floor(Math.random() * 3);
        if (reroll === 0) {
          roll = 0;
          addLog(`${player.name}'s Foresight passive shifted the World Event to a bonus outcome!`);
        }
      }
      if (roll === 0) {
        const payout = 140 + ownedLandmarks(player.id).length * 30;
        player.cash += payout;
        addLog(`${player.name} hit a favorable World Event and gained $${formatMoney(payout)}.`);
        checkForEndConditions("world-event-bonus");
        requestAnimationFrame(() => fxBonusGain(player, player.position, payout));
        return false;
      }

      if (roll === 1) {
        const loss = 110 + totalUpgradeCount(player.id) * 18;
        applyCharge(player, loss, "world event shock");
        checkForEndConditions("world-event-tax");
        requestAnimationFrame(() => fxTaxCharge(player, player.position, loss));
        return false;
      }

      const nextIndex = findNextOpenLandmarkIndex(player.position) ?? findNextLandmarkIndex(player.position);
      addLog(`${player.name} triggered a World Event relocation to the next landmark.`);
      await moveToIndexAndResolve(player, nextIndex);
      return true;
    }

    case "restoration-bill": {
      let loss = 70 + Math.round(getUpgradeAssetValue(player) * 0.15);
      if (player.character?.passive?.id === "tax-shield") {
        const reduction = Math.round(loss * player.character.passive.params.reduction);
        loss -= reduction;
        addLog(`${player.name}'s Tax Shield passive reduced restoration bill by $${formatMoney(reduction)}.`);
      }
      applyCharge(player, loss, "restoration bill");
      checkForEndConditions("restoration-bill");
      requestAnimationFrame(() => fxTaxCharge(player, player.position, loss));
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
  if (player.character?.passive?.id === "land-discount") {
    cost = Math.round(cost * (1 - player.character.passive.params.discount));
    addLog(`${player.name}'s Land Discount passive saved 10% on purchase.`);
  }
  if (hasEffect(player, "discount-deed")) {
    cost = Math.round(cost * 0.7);
    consumeEffect(player, "discount-deed");
    addLog(`${player.name} used Discount Deed — 30% off!`);
  }
  player.cash -= cost;
  if (player.cash < 0) { player.cash = 0; }
  landmark.ownerId = player.id;
  landmark.level = 0;
  if (player.character?.passive?.id === "fast-build" && landmark.level === 0) {
    landmark.level = 1;
    addLog(`${player.name}'s Fast Build passive auto-upgraded ${landmark.name} to ${UPGRADE_LEVELS[1]} for free!`);
  }
  state.pendingAction = null;
  playSound("buy");
  addLog(`${player.name} acquired ${landmark.name} for $${formatMoney(landmark.cost)}.`);
  checkForEndConditions("purchase");
  render();
  requestAnimationFrame(() => fxBuyLandmark(player, player.position, cost));
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
  let upgCost = landmark.upgradeCost;
  if (player.character?.passive?.id === "upgrade-discount") {
    upgCost = Math.round(upgCost * (1 - player.character.passive.params.discount));
    addLog(`${player.name}'s Upgrade Discount passive saved 15% on the upgrade.`);
  }
  player.cash -= upgCost;
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
  requestAnimationFrame(() => fxUpgradeLandmark(player, player.position, landmark.upgradeCost));
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
    if (player.isAI) _scheduleAITurn(1200);
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
      state.players.forEach((p) => {
        if (!p.bankrupt && p.character?.passive?.id === "interest") {
          const interest = Math.round(p.cash * p.character.passive.params.rate);
          if (interest > 0) {
            p.cash += interest;
            addLog(`${p.name}'s Interest passive earned $${formatMoney(interest)} at round start.`);
          }
        }
      });
    }

    if (state.round > activeRoundLimit) {
      endGame("round-limit");
    } else {
      addLog(`${currentPlayer().name} is now at the table.`);
      // Delay render so right panel switches with the turn announce
      if (wrapped) {
        setTimeout(() => showRoundAnnounce(state.round), 1500);
        setTimeout(() => { render(); showTurnAnnounce(currentPlayer()); }, 4500);
        if (state.turnTimerSeconds > 0) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 7000);
        if (currentPlayer().isAI) _scheduleAITurn(6000);
      } else {
        setTimeout(() => { render(); showTurnAnnounce(currentPlayer()); }, 1800);
        if (state.turnTimerSeconds > 0) setTimeout(() => startTurnTimer(state.turnTimerSeconds), 4200);
        if (currentPlayer().isAI) _scheduleAITurn(3500);
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
      <button class="secondary-button" id="prevMenuButton" type="button">Back to Setup</button>
      <button class="secondary-button" id="homeScreenButton" type="button">Game Mode Select</button>
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
      ${player.character?.portrait ? `<img src="${player.character.portrait}" class="winner-portrait" alt="">` : ""}
      <div class="ranking-main">
        <div class="ranking-name">${player.name}${player.character ? ` <small style="opacity:0.7;">${player.character.name}</small>` : ""}</div>
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
    case "heritage-grant":
      return `Now: +$${formatMoney(80 + countDevelopedOrBetter(player.id) * 45)}`;
    case "media-spotlight":
      return `Now: +$${formatMoney(100 + Math.round(highestOwnedRent(player.id) * 0.75))}`;
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
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      ${player.character?.portrait ? `<img src="${player.character.portrait}" class="turn-announce-portrait" alt="">` : ""}
      <span class="turn-announce-name" style="color:${color};">${player.name}${aiTag}</span>
      ${player.character ? `<span style="font-size:0.7em;opacity:0.8;color:${color};">${player.character.name}</span>` : ""}
      <span class="turn-announce-label">Your Turn!</span>
    </div>`;

  // Get player panel position as start point
  const panelEl = _getPlayerPanelEl(player.id);
  const boardCenter = document.querySelector(".board-center");

  el.classList.remove("hidden", "turn-announce-exit", "turn-announce-enter");
  el.style.position = "fixed";
  el.style.zIndex = "9000";
  el.style.transition = "none";
  el.style.pointerEvents = "none";

  if (panelEl && boardCenter) {
    const from = panelEl.getBoundingClientRect();
    const to = boardCenter.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const endX = to.left + to.width / 2;
    const endY = to.top + to.height / 2;

    // Animate: fly from player panel to board center
    el.style.left = startX + "px";
    el.style.top = startY + "px";
    el.style.transform = "translate(-50%,-50%) scale(0.3)";
    el.style.opacity = "0";

    requestAnimationFrame(() => {
      el.style.transition = "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.left = endX + "px";
      el.style.top = endY + "px";
      el.style.transform = "translate(-50%,-50%) scale(1)";
      el.style.opacity = "1";
    });
  } else {
    _positionOnBoard("turnAnnounce");
    el.style.opacity = "1";
  }

  el.classList.add("turn-announce-enter");
  playSound("turn_start");
  if (_announceTimer) clearTimeout(_announceTimer);
  _announceTimer = setTimeout(() => {
    el.classList.remove("turn-announce-enter");
    el.classList.add("turn-announce-exit");
    // Fly to right panel (turnCard)
    const turnCard = document.getElementById("turnCard");
    if (turnCard) {
      const dest = turnCard.getBoundingClientRect();
      el.style.transition = "left 1s ease-in, top 1s ease-in, transform 1s ease-in, opacity 0.3s ease-in 0.7s";
      el.style.left = (dest.left + dest.width / 2) + "px";
      el.style.top = (dest.top + dest.height / 2) + "px";
      el.style.transform = "translate(-50%,-50%) scale(0.15)";
      el.style.opacity = "0";
    } else {
      el.style.transition = "opacity 0.5s ease-out";
      el.style.opacity = "0";
    }
    setTimeout(() => {
      el.classList.add("hidden");
      el.style.transition = "";
      el.style.opacity = "";
    }, 1100);
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

// ── Money particle effects system ─────────────────────────────────────────
function _getElCenter(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function _getPlayerPanelEl(playerId) {
  return document.querySelector(`.player-card[data-player-id="${playerId}"]`);
}

function _getBoardTileEl(spaceIndex) {
  const tiles = document.querySelectorAll("#board .space");
  return tiles[spaceIndex] ?? null;
}

const MONEY_SYMBOLS = ["$", "💵", "💰", "🪙", "💲"];

function spawnMoneyParticles(fromEl, toEl, count, color, opts = {}) {
  const from = _getElCenter(fromEl);
  const to   = _getElCenter(toEl);
  if (!from || !to) { opts.onComplete?.(); return; }

  const container = document.createElement("div");
  container.className = "money-fx-container";
  document.body.appendChild(container);

  const duration = opts.duration || 1000;
  let completed = 0;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "money-particle";
    // Randomize between $ and emoji symbols for variety
    p.textContent = opts.symbol || MONEY_SYMBOLS[Math.floor(Math.random() * MONEY_SYMBOLS.length)];
    p.style.color = color;

    // Random spawn offset from center (spread the origin)
    const spawnSpreadX = (Math.random() - 0.5) * 40;
    const spawnSpreadY = (Math.random() - 0.5) * 30;
    p.style.left = `${from.x + spawnSpreadX}px`;
    p.style.top  = `${from.y + spawnSpreadY}px`;

    // Random size variation: 1.0x to 2.2x
    const scale = 1 + Math.random() * 1.2;
    p.style.setProperty("--fx-scale", scale.toFixed(2));

    // Staggered delay with some randomness
    const delay = i * (duration / count / 2) + Math.random() * 60;
    p.style.animationDuration = `${duration + Math.random() * 200}ms`;
    p.style.animationDelay = `${delay}ms`;

    // Wide curved bezier path with big random arcs
    const cpxOff = (Math.random() - 0.5) * 240;
    const cpyOff = -60 - Math.random() * 140;
    const dx = to.x - from.x - spawnSpreadX;
    const dy = to.y - from.y - spawnSpreadY;

    p.style.setProperty("--fx-dx", `${dx}px`);
    p.style.setProperty("--fx-dy", `${dy}px`);
    p.style.setProperty("--fx-cpx", `${dx * 0.4 + cpxOff}px`);
    p.style.setProperty("--fx-cpy", `${dy * 0.4 + cpyOff}px`);

    // Random rotation
    p.style.setProperty("--fx-rot", `${(Math.random() - 0.5) * 360}deg`);

    container.appendChild(p);

    const totalDelay = delay + duration + 200;
    setTimeout(() => {
      p.remove();
      completed++;
      if (completed >= count) {
        container.remove();
        opts.onComplete?.();
      }
    }, totalDelay + 50);
  }
}

// ── Phase / Level celebration config ──────────────────────────────────────
const PHASE_FX = {
  early: {
    colors: ["#6bcb77", "#b5e85a", "#4dd9d0", "#2ec4b6", "#7ad977", "#a8e06c"],
    shapes: ["✦", "●", "◆", "★", "♠"],
    ringColor: "rgba(107,203,119,0.5)",
    sound: "celebrate_early",
  },
  mid: {
    colors: ["#ffd93d", "#ffbe0b", "#ffad63", "#f5c842", "#efc77b", "#fb5607"],
    shapes: ["★", "◆", "■", "●", "✦", "♦", "▲"],
    ringColor: "rgba(255,217,61,0.5)",
    sound: "celebrate_mid",
  },
  late: {
    colors: ["#b487ff", "#f72585", "#4d96ff", "#ffd93d", "#c77dff", "#ff6b6b", "#2ec4b6"],
    shapes: ["★", "◆", "✦", "♦", "●", "■", "▲", "♠", "♥"],
    ringColor: "rgba(180,135,255,0.5)",
    sound: "celebrate_late",
  },
};

// Level multipliers: 0=2x, 1=3x, 2=4.5x, 3=6.75x
const LEVEL_MULTIPLIERS = [2, 3, 4.5, 6.75];

function showConfettiShower(spaceIndex, playerColor, phase, level) {
  const tile = _getBoardTileEl(spaceIndex);
  if (!tile) return;
  const tileRect = tile.getBoundingClientRect();
  const cx = tileRect.left + tileRect.width / 2;
  const cy = tileRect.top;

  const container = document.createElement("div");
  container.className = "money-fx-container";
  document.body.appendChild(container);

  const phaseKey = (phase || "early").toLowerCase();
  const fx = PHASE_FX[phaseKey] || PHASE_FX.early;
  const mult = LEVEL_MULTIPLIERS[level ?? 0] || 2;
  const allColors = [playerColor, ...fx.colors];

  // Confetti count scales with multiplier: base 50 × mult
  const confettiCount = Math.round(50 * mult);
  // Spread range scales too
  const spreadX = 120 + mult * 30;
  const spreadY = 140 + mult * 30;

  for (let i = 0; i < confettiCount; i++) {
    const c = document.createElement("div");
    c.className = "confetti-piece";
    c.textContent = fx.shapes[Math.floor(Math.random() * fx.shapes.length)];
    c.style.color = allColors[Math.floor(Math.random() * allColors.length)];
    c.style.left = `${cx + (Math.random() - 0.5) * spreadX}px`;
    c.style.top  = `${cy - 20 - Math.random() * 50}px`;
    c.style.setProperty("--confetti-dx", `${(Math.random() - 0.5) * spreadX * 1.5}px`);
    c.style.setProperty("--confetti-dy", `${60 + Math.random() * spreadY}px`);
    c.style.setProperty("--confetti-rot", `${Math.random() * 720 - 360}deg`);
    const baseScale = 0.5 + Math.random() * 0.7 + (level ?? 0) * 0.15;
    c.style.setProperty("--confetti-scale", baseScale.toFixed(2));
    c.style.animationDelay = `${Math.random() * 500}ms`;
    c.style.animationDuration = `${1800 + Math.random() * 600 + (level ?? 0) * 200}ms`;
    container.appendChild(c);
  }

  // Ring burst for Mid/Late phases
  if (phaseKey === "mid" || phaseKey === "late") {
    const ring = document.createElement("div");
    ring.className = `celebrate-ring celebrate-ring-${phaseKey}`;
    ring.style.left = `${cx}px`;
    ring.style.top  = `${tileRect.top + tileRect.height / 2}px`;
    ring.style.setProperty("--ring-size", `${60 + mult * 20}px`);
    ring.style.setProperty("--ring-color", fx.ringColor);
    container.appendChild(ring);
  }

  // Screen flash for Late phase at level 2+
  if (phaseKey === "late" && (level ?? 0) >= 2) {
    const flash = document.createElement("div");
    flash.className = "screen-flash";
    container.appendChild(flash);
  }

  setTimeout(() => container.remove(), 3000 + (level ?? 0) * 300);
}

// Phase-aware celebration with sounds
function showPhaseCelebration(spaceIndex, playerColor, phase, level) {
  const phaseKey = (phase || "early").toLowerCase();
  const fx = PHASE_FX[phaseKey] || PHASE_FX.early;
  const lvl = level ?? 0;

  // Phase-specific base sound
  playSound(fx.sound);

  // Additional sounds for higher levels
  if (lvl >= 1) playSound("coins_shower");
  if (lvl >= 2) playSound("fanfare");
  if (lvl >= 3) {
    playSound("grand_fanfare");
    playSound("impact");
  }

  // Tile celebration glow
  showTileCelebration(spaceIndex, fx.colors[0]);

  // Confetti shower
  showConfettiShower(spaceIndex, playerColor, phase, lvl);
}

function showTileCelebration(spaceIndex, color) {
  const tile = _getBoardTileEl(spaceIndex);
  if (!tile) return;
  tile.classList.add("tile-celebrate");
  tile.style.setProperty("--celebrate-color", color);
  playSound("sparkle");
  setTimeout(() => tile.classList.remove("tile-celebrate"), 1800);
}

function showCashPopup(el, amount, positive) {
  if (!el) return;
  const popup = document.createElement("div");
  popup.className = `cash-popup ${positive ? "cash-popup-plus" : "cash-popup-minus"}`;
  popup.textContent = `${positive ? "+" : "-"}$${formatMoney(Math.abs(amount))}`;
  const r = el.getBoundingClientRect();
  popup.style.left = `${r.left + r.width / 2}px`;
  popup.style.top  = `${r.top}px`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1600);
}

function flashPanel(playerId, color, type) {
  const panel = _getPlayerPanelEl(playerId);
  if (!panel) return;
  panel.classList.add(`panel-flash-${type}`);
  panel.style.setProperty("--flash-color", color);
  setTimeout(() => panel.classList.remove(`panel-flash-${type}`), 1000);
}

// ── Orchestrated money effects ────────────────────────────────────────────

// ── Player-left notification ───────────────────────────────────────────────
// gameOver=true  → modal with "Back to Menu" button (last player standing)
// gameOver=false → auto-dismiss toast (game continues)
function _showPlayerLeftModal(name, gameOver) {
  if (gameOver) {
    const el = document.createElement("div");
    el.id = "abandonNotice";
    el.style.cssText = [
      "position:fixed", "inset:0", "background:rgba(0,0,0,0.78)",
      "display:flex", "align-items:center", "justify-content:center",
      "z-index:99999", "font-family:inherit",
    ].join(";");
    el.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.13);border-radius:18px;
                  padding:2.5rem 3rem;text-align:center;max-width:360px;box-shadow:0 8px 40px rgba(0,0,0,0.6);">
        <div style="font-size:2.8rem;margin-bottom:0.8rem;">🚪</div>
        <h2 style="color:#fff;margin:0 0 0.5rem;font-size:1.25rem;font-weight:700;">
          ${name} has left the game
        </h2>
        <p style="color:rgba(255,255,255,0.5);margin:0 0 1.8rem;font-size:0.9rem;line-height:1.5;">
          You are the only player remaining.<br>The game has ended.
        </p>
        <button
          style="background:#5b8dee;color:#fff;border:none;border-radius:9px;
                 padding:0.7rem 2.2rem;font-size:1rem;cursor:pointer;font-weight:600;"
          onclick="document.getElementById('abandonNotice').remove(); lobbyExit();">
          Back to Menu
        </button>
      </div>`;
    document.body.appendChild(el);
  } else {
    const toast = document.createElement("div");
    toast.style.cssText = [
      "position:fixed", "top:1.4rem", "left:50%", "transform:translateX(-50%)",
      "background:rgba(20,20,35,0.92)", "color:#fff",
      "padding:0.65rem 1.4rem", "border-radius:10px",
      "z-index:99999", "font-size:0.9rem", "font-weight:500",
      "border:1px solid rgba(255,255,255,0.12)",
      "box-shadow:0 4px 20px rgba(0,0,0,0.4)",
      "pointer-events:none",
    ].join(";");
    toast.textContent = `🚪 ${name} has left the game`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

function _triggerActionFx(act) {
  if (act.type === "buy") {
    const p = state.players.find(pl => pl.id === act.playerId);
    if (p) fxBuyLandmark(p, act.spaceIndex, act.amount);
  } else if (act.type === "rent") {
    const from = state.players.find(pl => pl.id === act.fromId);
    const to   = state.players.find(pl => pl.id === act.toId);
    if (from && to) fxRentPayment(from, to, act.spaceIndex, act.amount);
  } else if (act.type === "bonus") {
    const p = state.players.find(pl => pl.id === act.playerId);
    if (p) fxBonusGain(p, act.spaceIndex, act.amount);
  } else if (act.type === "tax") {
    const p = state.players.find(pl => pl.id === act.playerId);
    if (p) fxTaxCharge(p, act.spaceIndex, act.amount);
  } else if (act.type === "upgrade") {
    const p = state.players.find(pl => pl.id === act.playerId);
    if (p) fxUpgradeLandmark(p, act.spaceIndex, act.amount);
  }
}

function fxBuyLandmark(player, spaceIndex, cost) {
  const panelEl = _getPlayerPanelEl(player.id);
  const tileEl  = _getBoardTileEl(spaceIndex);
  const space = SPACE_DEFS[spaceIndex];
  const landmark = space?.type === "landmark" ? getLandmark(space.landmarkId) : null;
  const phase = landmark?.phase || "Early";

  playSound("cash_fly");
  flashPanel(player.id, "#ff6b6b", "out");
  showCashPopup(panelEl, cost, false);
  spawnMoneyParticles(panelEl, tileEl, 18, "#ffd93d", {
    duration: 1000,
    onComplete() {
      if (player.character) {
        _flyCharCard(player, panelEl, tileEl, () => {
          showPhaseCelebration(spaceIndex, player.color, phase, 0);
        });
      } else {
        showPhaseCelebration(spaceIndex, player.color, phase, 0);
      }
    }
  });
}

function _flyCharCard(player, fromEl, toEl, onDone) {
  const fromR = fromEl.getBoundingClientRect();
  const toR = toEl.getBoundingClientRect();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  const card = document.createElement("div");
  card.className = "flying-char-card";
  card.innerHTML = `
    <img src="${player.character.portrait}" class="flying-char-img">
    <span class="flying-char-name">${player.character.icon} ${player.character.name}</span>
  `;
  document.body.appendChild(card);

  const startX = fromR.right - 20;
  const startY = fromR.top + fromR.height / 2;
  const endX = toR.left + toR.width / 2;
  const endY = toR.top + toR.height / 2;
  const tileW = toR.width;
  const tileH = toR.height;

  // Max size = right panel character card width
  const rightCharImg = document.querySelector(".turn-char-img");
  const maxSize = rightCharImg ? rightCharImg.getBoundingClientRect().width : 160;
  const startSize = 40;

  card.style.cssText = `
    --player-color: ${player.color};
    --player-glow: ${player.glow};
    position: fixed;
    left: ${startX}px;
    top: ${startY}px;
    width: ${startSize}px;
    height: ${startSize}px;
    opacity: 0;
    z-index: 50000;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(1);
  `;

  playSound("whoosh");

  // Phase 1: Appear + grow to center (700ms)
  const anim1 = card.animate([
    { left: startX + "px", top: startY + "px", width: startSize + "px", height: startSize + "px", opacity: 0, transform: "translate(-50%,-50%) scale(0.3) rotate(0deg)" },
    { left: cx + "px", top: cy + "px", width: maxSize + "px", height: maxSize + "px", opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-5deg)", offset: 0.7 },
    { left: cx + "px", top: cy + "px", width: maxSize + "px", height: maxSize + "px", opacity: 1, transform: "translate(-50%,-50%) scale(1.08) rotate(3deg)" }
  ], { duration: 700, easing: "ease-out", fill: "forwards" });

  anim1.onfinish = () => {
    playSound("sparkle");

    // Phase 2: Pose — "이거 내땅이다!" (600ms)
    const anim2 = card.animate([
      { transform: "translate(-50%,-50%) scale(1.08) rotate(3deg)" },
      { transform: "translate(-50%,-50%) scale(1.12) rotate(-3deg)", offset: 0.25 },
      { transform: "translate(-50%,-50%) scale(1.05) rotate(2deg)", offset: 0.5 },
      { transform: "translate(-50%,-50%) scale(1.1) rotate(-1deg)", offset: 0.75 },
      { transform: "translate(-50%,-50%) scale(1) rotate(0deg)" }
    ], { duration: 600, easing: "ease-in-out", fill: "forwards" });

    anim2.onfinish = () => {
      playSound("swoosh");

      // Phase 3: Rise up then bomb-drop onto tile (600ms)
      const anim3 = card.animate([
        { left: cx + "px", top: cy + "px", width: maxSize + "px", height: maxSize + "px", opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(0deg)" },
        { left: endX + "px", top: (endY - 200) + "px", width: (maxSize * 0.5) + "px", height: (maxSize * 0.5) + "px", opacity: 1, transform: "translate(-50%,-50%) scale(0.6) rotate(180deg)", offset: 0.45 },
        { left: endX + "px", top: endY + "px", width: tileW + "px", height: tileH + "px", opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(360deg)" }
      ], { duration: 600, easing: "cubic-bezier(0.3, 0, 0.9, 0.4)", fill: "forwards" });

      anim3.onfinish = () => {
        card.remove();
        playSound("firework");
        // Screen shake
        document.body.classList.add("screen-shake");
        setTimeout(() => document.body.classList.remove("screen-shake"), 500);
        if (onDone) onDone();
      };
    };
  };
}

function fxRentPayment(fromPlayer, toPlayer, spaceIndex, amount) {
  const fromEl = _getPlayerPanelEl(fromPlayer.id);
  const tileEl = _getBoardTileEl(spaceIndex);
  const toEl   = _getPlayerPanelEl(toPlayer.id);

  playSound("cash_out");
  flashPanel(fromPlayer.id, "#ff4444", "out");
  showCashPopup(fromEl, amount, false);

  // Both waves launch simultaneously — red to tile, green to owner
  spawnMoneyParticles(fromEl, tileEl, 14, "#ff6b6b", { duration: 900 });
  setTimeout(() => {
    playSound("cash_fly");
    spawnMoneyParticles(tileEl, toEl, 14, "#6bcb77", {
      duration: 900,
      onComplete() {
        flashPanel(toPlayer.id, "#44ff66", "in");
        showCashPopup(toEl, amount, true);
        playSound("cash_in");
      }
    });
  }, 400);
}

function fxBonusGain(player, spaceIndex, amount) {
  const tileEl  = _getBoardTileEl(spaceIndex);
  const panelEl = _getPlayerPanelEl(player.id);

  showTileCelebration(spaceIndex, "#ffd93d");
  playSound("coins_shower");

  setTimeout(() => {
    spawnMoneyParticles(tileEl, panelEl, 20, "#ffd93d", {
      duration: 1100,
      onComplete() {
        flashPanel(player.id, "#44ff66", "in");
        showCashPopup(panelEl, amount, true);
        playSound("cash_in");
      }
    });
  }, 250);
}

function fxTaxCharge(player, spaceIndex, amount) {
  const panelEl = _getPlayerPanelEl(player.id);

  playSound("cash_drain");
  flashPanel(player.id, "#ff4444", "out");
  showCashPopup(panelEl, amount, false);

  const boardCenter = document.querySelector(".board-center");
  spawnMoneyParticles(panelEl, boardCenter || _getBoardTileEl(spaceIndex), 14, "#888888", {
    symbol: "💸",
    duration: 1100,
  });
}

function fxUpgradeLandmark(player, spaceIndex, cost) {
  const panelEl = _getPlayerPanelEl(player.id);
  const tileEl  = _getBoardTileEl(spaceIndex);
  const space = SPACE_DEFS[spaceIndex];
  const landmark = space?.type === "landmark" ? getLandmark(space.landmarkId) : null;
  const phase = landmark?.phase || "Early";
  const level = landmark?.level ?? 1;

  // Scale particle count by level: 12 base × level multiplier ratio
  const particleCount = Math.round(12 * LEVEL_MULTIPLIERS[level] / 2);

  playSound("cash_fly");
  flashPanel(player.id, "#ff6b6b", "out");
  showCashPopup(panelEl, cost, false);

  spawnMoneyParticles(panelEl, tileEl, particleCount, "#b487ff", {
    duration: 900,
    onComplete() {
      showPhaseCelebration(spaceIndex, player.color, phase, level);
    }
  });
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
let _aiTurnTimer = null;

function _scheduleAITurn(ms = 1200) {
  if (_aiTurnTimer) clearTimeout(_aiTurnTimer);
  _aiTurnTimer = setTimeout(() => { _aiTurnTimer = null; runAITurn(); }, ms);
}

function _cancelAITurn() {
  if (_aiTurnTimer) { clearTimeout(_aiTurnTimer); _aiTurnTimer = null; }
}

async function runAITurn() {
  const player = currentPlayer();
  if (!player?.isAI || state.gameOver || state.turnBusy || state.turnStarted) return;

  await delay(1200);
  if (!currentPlayer()?.isAI || state.gameOver) return;

  await handleRoll();

  // Wait for move animation to finish
  await delay(1500);
  const p = currentPlayer();
  if (!p?.isAI || state.gameOver || !state.turnStarted) return;

  const pending = state.pendingAction;
  if (pending?.type === "buy") {
    const lm = getLandmark(pending.landmarkId);
    if (p.cash >= lm.cost) {
      buyLandmark(lm.id);
      // Wait for full buy animation (money fly + card fly + celebration)
      await delay(3200);
    }
  } else if (pending?.type === "upgrade") {
    const lm = getLandmark(pending.landmarkId);
    if (p.cash >= lm.upgradeCost) {
      handleUpgrade(lm.id);
      await delay(1500);
    }
  }

  if (!state.gameOver && state.turnStarted) {
    await delay(500);
    handleEndTurn();
  }
}

function exposeDebugHooks() {
  window.render_game_to_text = renderGameToText;
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
  let itemCost = item ? item.price : 0;
  if (player?.character?.passive?.id === "trade-bonus" && item) {
    itemCost = Math.round(itemCost * (1 - player.character.passive.params.discount));
  }
  if (!player || !item || player.cash < itemCost || player.inventory.length >= 3) return;
  if (state.turnStarted || state.gameOver) return;

  player.cash -= itemCost;
  player.inventory.push(item.id);
  if (itemCost < item.price) {
    addLog(`${player.name}'s Trade Bonus passive saved 20% on ${item.name}.`);
  }
  addLog(`${player.name} purchased ${item.icon} ${item.name} for $${formatMoney(itemCost)}.`);
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
  maxPlayers:      Math.min(Math.max(Number(localStorage.getItem("bgame_playerCount")) || 4, 2), 6),
  isPublic:           true,
  suggestedRoomName:  "",
  turnTimerEnabled:   (Number(localStorage.getItem("bgame_turnTimer")) || 0) > 0,
  turnTimerSeconds:   Number(localStorage.getItem("bgame_turnTimer")) || 60,
  roundLimit:         Math.min(Math.max(Number(localStorage.getItem("bgame_roundLimit")) || 20, 10), 50),
  characterId:        CHARACTER_DEFS[0].id,
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
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">BulloMarble</h2>
        <p class="setup-hero-desc">Roll, invest, and build the richest landmark empire on a 40-space board.</p>
      </header>
      <div class="lobby-profile-row">
        <div class="lobby-profile-left">
          <div class="lobby-name-row">
            <label class="lobby-label">My Name</label>
            <input class="lobby-input lobby-input-plain" id="lobbyPlayerName" type="text"
              maxlength="18" placeholder="Player" autocomplete="off"
              value="${lobbyState.playerName}" />
          </div>
          <div class="lobby-color-row">
            <label class="lobby-label">My Color</label>
            <div class="lobby-color-swatches" id="lobbyColorSwatches">
              ${_lobbyColorSwatches(lobbyState.colorIndex)}
            </div>
          </div>
        </div>
        <button type="button" class="char-card-btn" id="lobbyCharCardBtn" onclick="openLobbyCharSelect()">
          <span class="char-card-label">${(() => { const ch = getCharacter(lobbyState.characterId); return ch.icon + " " + ch.name; })()}</span>
          <img src="${getCharacter(lobbyState.characterId).portrait}" class="char-card-img" alt="">
        </button>
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
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">Create Room</h2>
      </header>
      <div class="lobby-form">
        <label class="lobby-label">Seed</label>
        <div class="seed-dropdown-wrap" id="lobbySeedDropdownWrap">
          <button type="button" class="seed-dropdown-trigger" id="lobbySeedTrigger">
            <span class="seed-dd-icon" id="lobbySeedIcon">${(() => { const s = SEED_CATALOG.find(x => x.id === activeSeedId); return s ? s.icon : "🎲"; })()}</span>
            <span class="seed-dd-info">
              <span class="seed-dd-name" id="lobbySeedName">${(() => { if (activeSeedId === "_random") return "Random Theme"; const s = SEED_CATALOG.find(x => x.id === activeSeedId); return s ? s.name : "Random Theme"; })()}</span>
              <span class="seed-dd-desc" id="lobbySeedDesc">${(() => { if (activeSeedId === "_random") return "A random theme will be selected"; const s = SEED_CATALOG.find(x => x.id === activeSeedId); return s ? s.description : ""; })()}</span>
            </span>
            <span class="seed-dd-arrow">▾</span>
          </button>
        </div>

        <div class="lobby-row-inline" style="margin-top:0.9rem; gap:0.6rem; align-items:flex-start;">
          <div style="flex:5 1 0;">
            <label class="lobby-label">Players</label>
            <div class="lobby-radio-group">${maxOpts}</div>
          </div>
          <div style="flex:2 1 0; min-width:60px;">
            <label class="lobby-label">Rounds</label>
            <select class="round-limit-select" onchange="lobbySetRoundLimit(Number(this.value))">
              ${[10,15,20,25,30,35,40,45,50].map(n => `<option value="${n}" ${lobbyState.roundLimit === n ? "selected" : ""}>${n}</option>`).join("")}
            </select>
          </div>
          <div style="flex:4 1 0;">
            <label class="lobby-label">Turn Timer</label>
            <div class="lobby-radio-group">
              <label class="lobby-radio-label"><input type="radio" name="lobbyTimer" value="0" ${!lobbyState.turnTimerEnabled ? "checked" : ""} onchange="lobbySetTurnTimer(false)"><span>Off</span></label>
              <label class="lobby-radio-label"><input type="radio" name="lobbyTimer" value="30" ${lobbyState.turnTimerEnabled && lobbyState.turnTimerSeconds === 30 ? "checked" : ""} onchange="lobbySetTurnTimer(true);lobbySetTurnTimerSeconds(30)"><span>30s</span></label>
              <label class="lobby-radio-label"><input type="radio" name="lobbyTimer" value="60" ${lobbyState.turnTimerEnabled && lobbyState.turnTimerSeconds === 60 ? "checked" : ""} onchange="lobbySetTurnTimer(true);lobbySetTurnTimerSeconds(60)"><span>60s</span></label>
              <label class="lobby-radio-label"><input type="radio" name="lobbyTimer" value="90" ${lobbyState.turnTimerEnabled && lobbyState.turnTimerSeconds === 90 ? "checked" : ""} onchange="lobbySetTurnTimer(true);lobbySetTurnTimerSeconds(90)"><span>90s</span></label>
            </div>
          </div>
        </div>

        <label class="lobby-label" style="margin-top:0.9rem;">Room Name (optional)</label>
        <input class="lobby-input lobby-input-plain" id="lobbyRoomName" type="text"
          maxlength="24" placeholder="${lobbyState.suggestedRoomName}" autocomplete="off"
          value="${lobbyState.suggestedRoomName}" />

        <label class="lobby-label" style="margin-top:0.9rem;">Visibility</label>
        <div class="lobby-toggle-row">
          <button class="lobby-toggle-btn ${lobbyState.isPublic ? "active" : ""}" onclick="lobbySetPublic(true)">🌐 Public</button>
          <button class="lobby-toggle-btn ${!lobbyState.isPublic ? "active" : ""}" onclick="lobbySetPublic(false)">🔒 Private (code required)</button>
        </div>
        <p class="lobby-private-note lobby-visibility-note">${lobbyState.isPublic
          ? "🌐 Anyone can see and join this room<br>directly from the public room list."
          : "🔒 Room is visible in the list, but a 6-digit<br>code is required. Share with invited players only."}</p>
      </div>
      <div class="lobby-row" style="margin-top:1.2rem;">
        ${backBtn}
        <button class="primary-button" onclick="lobbyConfirmCreate()">Create Room</button>
      </div>
    `;
    // Wire up lobby seed dropdown
    _initLobbySeedDropdown();
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
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">Browse Rooms</h2>
        <button class="lobby-refresh-btn" onclick="lobbyRefreshBrowse()" title="Refresh">↺</button>
      </header>
      <div class="lobby-room-list">${listHtml}</div>
      <div class="lobby-status-msg" style="font-size:0.78rem;">Live updates active...</div>
      ${backBtn}
    `;
    return;
  }

  // ── Join by code ─────────────────────────────────────────────────────────
  if (lobbyState.screen === "join-code") {
    card.innerHTML = `
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">Join by Code</h2>
      </header>
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
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">Server Unavailable</h2>
      </header>
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
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">Waiting for Players</h2>
      </header>
      <div class="lobby-room-code">${lobbyState.roomCode}</div>
      <p class="lobby-room-code-label">Share this code with other players</p>
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
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">Joined Room</h2>
      </header>
      <div class="lobby-room-code">${lobbyState.roomCode}</div>
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
      <header class="setup-hero">
        <p class="eyebrow">BulloMarble · Online Play</p>
        <h2 class="setup-title">Error</h2>
      </header>
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

function lobbySetCharacter(charId) {
  lobbyState.characterId = charId;
  networkSocket?.emit("change_character", { code: lobbyState.roomCode, characterId: charId });
}
window.lobbySetCharacter = lobbySetCharacter;

function lobbySetMaxPlayers(n) {
  lobbyState.maxPlayers = n;
  localStorage.setItem("bgame_playerCount", String(n));
}

function lobbySetPublic(isPublic) {
  lobbyState.isPublic = isPublic;
  renderLobby();
}

function lobbySetTurnTimer(enabled) {
  lobbyState.turnTimerEnabled = enabled;
  if (!enabled) localStorage.setItem("bgame_turnTimer", "0");
  renderLobby();
}

function lobbySetTurnTimerSeconds(s) {
  lobbyState.turnTimerSeconds = s;
  localStorage.setItem("bgame_turnTimer", String(s));
}

function lobbySetRoundLimit(n) {
  lobbyState.roundLimit = n;
  localStorage.setItem("bgame_roundLimit", n);
  activeRoundLimit = n;
}

function _initLobbySeedDropdown() {
  const trigger = document.getElementById("lobbySeedTrigger");
  if (!trigger) return;
  const iconEl = document.getElementById("lobbySeedIcon");
  const nameEl = document.getElementById("lobbySeedName");
  const descEl = document.getElementById("lobbySeedDesc");

  // Clean up any previous lobby seed list from body
  const old = document.getElementById("lobbySeedListBody");
  if (old) old.remove();

  function updateDisplay(id) {
    if (id === "_random") {
      iconEl.textContent = "🎲"; nameEl.textContent = "Random Theme"; descEl.textContent = "A random theme will be selected";
    } else {
      const s = SEED_CATALOG.find(x => x.id === id);
      if (s) { iconEl.textContent = s.icon; nameEl.textContent = s.name; descEl.textContent = s.description; }
    }
  }

  // Create list element directly on body
  const list = document.createElement("div");
  list.id = "lobbySeedListBody";
  list.className = "seed-dropdown-list seed-dropdown-list--short hidden";
  list.innerHTML = `
    <button type="button" class="seed-dd-item ${activeSeedId === "_random" ? "active" : ""}" data-seed-id="_random">
      <span class="seed-dd-item-num">-</span><span class="seed-dd-item-icon">🎲</span>
      <span class="seed-dd-item-info"><span class="seed-dd-item-name">Random Theme</span><span class="seed-dd-item-desc">A random theme will be selected</span></span>
    </button>
    ${SEED_CATALOG.map((s, i) => `
      <button type="button" class="seed-dd-item ${s.id === activeSeedId ? "active" : ""}" data-seed-id="${s.id}">
        <span class="seed-dd-item-num">${i + 1}</span><span class="seed-dd-item-icon">${s.icon}</span>
        <span class="seed-dd-item-info"><span class="seed-dd-item-name">${s.name}</span><span class="seed-dd-item-desc">${s.description}</span></span>
      </button>
    `).join("")}
  `;
  document.body.appendChild(list);

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasHidden = list.classList.contains("hidden");
    if (wasHidden) {
      list.classList.remove("hidden");
      const r = trigger.getBoundingClientRect();
      list.style.left = r.left + "px";
      list.style.width = r.width + "px";
      list.style.top = (r.bottom + 4) + "px";
    } else {
      list.classList.add("hidden");
    }
  });

  list.addEventListener("mousedown", (e) => {
    e.preventDefault(); e.stopPropagation();
    const item = e.target.closest("[data-seed-id]");
    if (!item) return;
    const id = item.dataset.seedId;
    list.querySelectorAll(".seed-dd-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    localStorage.setItem("bgame_seedId", id);
    activeSeedId = id;
    updateDisplay(id);
    list.classList.add("hidden");
  });

  // Use a named handler to avoid stacking
  if (_initLobbySeedDropdown._docHandler) {
    document.removeEventListener("click", _initLobbySeedDropdown._docHandler);
  }
  _initLobbySeedDropdown._docHandler = () => list.classList.add("hidden");
  document.addEventListener("click", _initLobbySeedDropdown._docHandler);
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
    // If the user is on the browse screen, request the room list now
    if (lobbyState.screen === "browse") {
      socket.emit("watch_rooms");
    }
  });

  socket.on("disconnect", (reason) => {
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

  socket.on("character_changed", ({ players }) => {
    lobbyState.players = players;
    renderLobby();
  });

  socket.on("player_left", ({ players, duringGame, leavingName, remainingActive }) => {
    lobbyState.players = players;
    if (duringGame && gameMode === "network") {
      if (remainingActive <= 1) {
        // I'm the only one left — show exit modal
        stopTurnTimer();
        _showPlayerLeftModal(leavingName, true);
      } else {
        // Game continues — show toast and re-render player panels
        _showPlayerLeftModal(leavingName, false);
        render();
      }
    } else {
      renderLobby();
    }
  });

  socket.on("rooms_updated", (rooms) => {
    lobbyState.browseRooms = rooms;
    if (lobbyState.screen === "browse") renderLobby();
  });

  socket.on("lobby_error", ({ message }) => {
    lobbyState.errorMsg = message;
    renderLobby("error");
  });

  // ── Game events ──────────────────────────────────
  socket.on("game_started", (serverState) => {
    _diceInitialized = false;
    if (serverState.roundLimit) {
      activeRoundLimit = serverState.roundLimit;
      localStorage.setItem("bgame_roundLimit", serverState.roundLimit);
    }
    // Load the seed used by the server
    if (serverState.seedId) {
      loadSeed(serverState.seedId, false); // Don't shuffle — server already did
    }
    // Enrich each player with their character data
    if (serverState.players) {
      serverState.players.forEach(p => {
        if (p.characterId) {
          p.character = getCharacter(p.characterId);
        }
      });
    }
    applyServerState(serverState);
    ui.lobbyOverlay.classList.add("hidden");
    ui.winnerOverlay.classList.add("hidden");
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
    const wasRolling = state.rolling;
    // If rolling, delay applying state so dice animation plays
    if (wasRolling) {
      const savedAction = serverState.lastAction;
      state.rolling = true; // keep rolling
      setTimeout(() => {
        applyServerState(serverState);
        state.rolling = false;
        render();
        if (savedAction) {
          requestAnimationFrame(() => _triggerActionFx(savedAction));
        }
      }, 600);
      return;
    }
    applyServerState(serverState);

    // Trigger money effects based on lastAction from server
    if (serverState.lastAction) {
      requestAnimationFrame(() => _triggerActionFx(serverState.lastAction));
    }

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
  // Server uses World Landmarks IDs; client uses seed-specific IDs.
  // Match by index position (cost order is identical).
  if (serverState.landmarks) {
    serverState.landmarks = serverState.landmarks.map((lm, idx) => {
      const def = LANDMARK_DEFS[idx];
      if (def) {
        // Preserve server game state (ownerId, level) but use client visual data
        return { ...def, ownerId: lm.ownerId, level: lm.level };
      }
      return lm;
    });
  }
  // Enrich players with character data (server doesn't send character objects)
  if (serverState.players) {
    serverState.players.forEach(p => {
      if (p.characterId && !p.character) {
        p.character = getCharacter(p.characterId);
      }
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

  // Remap pendingAction.landmarkId from server's World Landmarks ID to client seed's ID.
  // Server always uses World Landmarks IDs; client may use a different seed.
  // Use the current player's board position to look up the correct client-side landmark ID.
  if (state.pendingAction?.type === "buy" || state.pendingAction?.type === "upgrade") {
    const player = state.players[state.currentPlayerIndex];
    if (player) {
      const space = SPACE_DEFS[player.position];
      if (space?.type === "landmark") {
        state.pendingAction.landmarkId = space.landmarkId;
      }
    }
  }
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
    characterId:     lobbyState.characterId,
    roomName,
    maxPlayers:      lobbyState.maxPlayers,
    isPublic:        lobbyState.isPublic,
    password:        "",
    turnTimerSeconds: lobbyState.turnTimerEnabled ? lobbyState.turnTimerSeconds : 0,
    roundLimit:      lobbyState.roundLimit,
    seedId:          activeSeedId === "_random" ? getRandomSeed().id : activeSeedId,
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
  socket.emit("join_room", { code, name, colorIndex: lobbyState.colorIndex, characterId: lobbyState.characterId, password });
}

function lobbyStartGame() {
  networkSocket?.emit("start_game", { code: lobbyState.roomCode });
}

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
window.lobbyStartGame        = lobbyStartGame;
window.toggleAIPlayer          = toggleAIPlayer;
window.lobbyWaitingChangeColor = lobbyWaitingChangeColor;
window.backToModeSelect        = backToModeSelect;
