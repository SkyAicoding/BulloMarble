// ── Constants (mirrored from src/main.js) ─────────────────────────────────
const BOARD_SPACES      = 40;
const STARTING_CASH     = 1500;
const PASS_START_BONUS  = 200;
const EXACT_START_BONUS = 150;
const MAX_UPGRADE_LEVEL = 3;
const MAJOR_VICTORY_GLOBALS = 4;
const LIQUIDATION_RATE  = 0.7;
const RENT_MULTIPLIERS  = [1, 1.85, 3.05, 4.55];
const UPGRADE_LEVELS    = ["Owned", "Developed", "Major Attraction", "Global Landmark"];
const EVENT_POSITIONS   = [0, 3, 7, 10, 13, 17, 20, 23, 27, 30, 33, 37];

const COLOR_PALETTE = [
  { color: "#efc77b", glow: "rgba(239,199,123,0.55)", label: "Gold"   },
  { color: "#63a8ff", glow: "rgba(99,168,255,0.55)",  label: "Blue"   },
  { color: "#ef6a5f", glow: "rgba(239,106,95,0.55)",  label: "Red"    },
  { color: "#7ad977", glow: "rgba(122,217,119,0.55)", label: "Green"  },
  { color: "#b487ff", glow: "rgba(180,135,255,0.55)", label: "Purple" },
  { color: "#ffad63", glow: "rgba(255,173,99,0.55)",  label: "Orange" },
  { color: "#4dd9d0", glow: "rgba(77,217,208,0.55)",  label: "Cyan"   },
  { color: "#ff87b4", glow: "rgba(255,135,180,0.55)", label: "Pink"   },
  { color: "#b5e85a", glow: "rgba(181,232,90,0.55)",  label: "Lime"   },
  { color: "#8b7df8", glow: "rgba(139,125,248,0.55)", label: "Indigo" },
  { color: "#f5c842", glow: "rgba(245,200,66,0.55)",  label: "Amber"  },
  { color: "#42c4a0", glow: "rgba(66,196,160,0.55)",  label: "Teal"   },
];

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

const LANDMARK_SEEDS = [
  { id: "central-park",       name: "Central Park",           city: "New York, USA",            phase: "Early", flavor: "An opening-route park with stable foot traffic and low-friction returns." },
  { id: "ueno-park",          name: "Ueno Park",              city: "Tokyo, Japan",             phase: "Early", flavor: "Low-cost green-space traffic makes this a clean early-game pickup." },
  { id: "tivoli-gardens",     name: "Tivoli Gardens",         city: "Copenhagen, Denmark",      phase: "Early", flavor: "A compact amusement park with steady income and gentle upgrade pressure." },
  { id: "disneyland",         name: "Disneyland",             city: "Anaheim, USA",             phase: "Early", flavor: "A famous park attraction that still plays like an early-route income engine." },
  { id: "tokyo-tower",        name: "Tokyo Tower",            city: "Tokyo, Japan",             phase: "Early", flavor: "A nimble observation tower that scales cleanly once the first upgrades land." },
  { id: "tower-bridge",       name: "Tower Bridge",           city: "London, UK",               phase: "Early", flavor: "Compact entry pricing with dependable sightseeing income on the first side." },
  { id: "big-ben",            name: "Big Ben",                city: "London, UK",               phase: "Early", flavor: "A small but steady city-center attraction that stays relevant deep into the game." },
  { id: "gardens-by-the-bay", name: "Gardens by the Bay",     city: "Singapore",                phase: "Early", flavor: "A polished garden attraction that closes the early route with higher upside." },
  { id: "luna-park",          name: "Luna Park",              city: "Sydney, Australia",        phase: "Early", flavor: "A classic waterfront attraction with approachable pricing and solid visitor flow." },
  { id: "colosseum",          name: "Colosseum",              city: "Rome, Italy",              phase: "Mid",   flavor: "Historic prestige converted into reliable tourism income once the board matures." },
  { id: "sagrada-familia",    name: "Sagrada Familia",        city: "Barcelona, Spain",         phase: "Mid",   flavor: "A famous cultural landmark with a strong development curve." },
  { id: "eiffel-tower",       name: "Eiffel Tower",           city: "Paris, France",            phase: "Mid",   flavor: "Prestige icon status with elegant rent scaling from the first upgrade onward." },
  { id: "statue-of-liberty",  name: "Statue of Liberty",      city: "New York, USA",            phase: "Mid",   flavor: "Steady transatlantic demand keeps this harbor landmark in constant play." },
  { id: "louvre-museum",      name: "Louvre Museum",          city: "Paris, France",            phase: "Mid",   flavor: "Dense foot traffic and global brand power make this a stable compounder." },
  { id: "sydney-opera-house", name: "Sydney Opera House",     city: "Sydney, Australia",        phase: "Mid",   flavor: "A destination asset with premium rent growth and strong board presence." },
  { id: "great-wall",         name: "Great Wall",             city: "Beijing, China",           phase: "Mid",   flavor: "Global recognition and broad appeal translate into resilient mid-board cash flow." },
  { id: "acropolis",          name: "Acropolis",              city: "Athens, Greece",           phase: "Mid",   flavor: "A history-first holding that converts upgrades directly into prestige pricing." },
  { id: "taj-mahal",          name: "Taj Mahal",              city: "Agra, India",              phase: "Mid",   flavor: "World-famous destination appeal gives this site strong value even before upgrades." },
  { id: "buckingham-palace",  name: "Buckingham Palace",      city: "London, UK",               phase: "Mid",   flavor: "A ceremonial icon that monetizes global attention exceptionally well." },
  { id: "cn-tower",           name: "CN Tower",               city: "Toronto, Canada",          phase: "Late",  flavor: "A skyline-heavy tower asset that marks the turn into the expensive late route." },
  { id: "petronas-towers",    name: "Petronas Towers",        city: "Kuala Lumpur, Malaysia",   phase: "Late",  flavor: "Twin-tower status and prestige branding create sharp late-game upside." },
  { id: "one-world-trade",    name: "One World Trade Center", city: "New York, USA",            phase: "Late",  flavor: "A high-value skyscraper holding with strong rent scaling." },
  { id: "marina-bay-sands",   name: "Marina Bay Sands",       city: "Singapore",                phase: "Late",  flavor: "A skyline-defining mega complex with one of the cleanest late-board ceilings." },
  { id: "shanghai-tower",     name: "Shanghai Tower",         city: "Shanghai, China",          phase: "Late",  flavor: "Premium vertical real estate keeps this site punishing once improved." },
  { id: "chichen-itza",       name: "Chichen Itza",           city: "Yucatan, Mexico",          phase: "Late",  flavor: "A mega landmark with massive draw and heavyweight balance-sheet value." },
  { id: "machu-picchu",       name: "Machu Picchu",           city: "Cusco Region, Peru",       phase: "Late",  flavor: "Remote mystique commands top-tier income once capital reaches the final side." },
  { id: "angkor-wat",         name: "Angkor Wat",             city: "Siem Reap, Cambodia",      phase: "Late",  flavor: "Monumental cultural gravity converts directly into top-end portfolio strength." },
  { id: "burj-khalifa",       name: "Burj Khalifa",           city: "Dubai, UAE",               phase: "Late",  flavor: "The final skyscraper on the loop with the most dominant upgrade ceiling on the board." },
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
    baseRent:    Math.round(cost * 0.18),
    upgradeCost: Math.round(cost * 0.58),
    tone:        TONE_PALETTE[index % TONE_PALETTE.length],
  };
});

const EVENT_DEFS = [
  { id: "start-square",    title: "START",            subtitle: "Launch Pad",          icon: "S", badge: "START", eventType: "start",                copy: "Pass for $200. Land exactly for a $150 launch bonus." },
  { id: "park-festival",   title: "Park Festival",    subtitle: "Neighborhood Boost",  icon: "✿", badge: "BONUS", eventType: "tourism-boom",         copy: "Gain $120 plus $25 per landmark you own." },
  { id: "city-tram",       title: "City Tram",        subtitle: "Shortcut Ride",       icon: "↷", badge: "MOVE",  eventType: "skybridge-charter",    copy: "Move to the next landmark and resolve it immediately." },
  { id: "tax-square",      title: "TAX",              subtitle: "City Collection",     icon: "$", badge: "TAX",   eventType: "corner-tax",           copy: "Pay a flat $150 city tax." },
  { id: "heritage-grant",  title: "Heritage Grant",   subtitle: "Restoration Fund",    icon: "⬆", badge: "BONUS", eventType: "heritage-grant",       copy: "Gain $80 plus $45 per Developed-or-better landmark." },
  { id: "permit-office",   title: "Permit Office",    subtitle: "Inspection Delay",    icon: "⧗", badge: "HOLD",  eventType: "customs-delay",        copy: "Lose your next turn while permits clear." },
  { id: "free-parking",    title: "FREE PARKING",     subtitle: "Rest Stop",           icon: "P", badge: "FREE",  eventType: "free-parking",         copy: "Safe corner. Collect a $50 parking rebate." },
  { id: "tourism-boom",    title: "Tourism Boom",     subtitle: "Crowd Surge",         icon: "◎", badge: "BONUS", eventType: "media-spotlight",      copy: "Gain $100 plus 75% of your highest current rent." },
  { id: "landmark-shuttle",title: "Landmark Shuttle", subtitle: "Acquisition Route",   icon: "⇢", badge: "MOVE",  eventType: "continental-connector",copy: "Advance to the next open landmark. If none remain, go to the next landmark." },
  { id: "world-event",     title: "WORLD EVENT",      subtitle: "Global Shockwave",    icon: "W", badge: "EVENT", eventType: "world-event",          copy: "Trigger a random global swing: bonus, tax, or a fast relocation." },
  { id: "renovation-bill", title: "Renovation Bill",  subtitle: "Maintenance Sweep",   icon: "⚒", badge: "TAX",   eventType: "restoration-bill",     copy: "Lose $70 plus 15% of your upgrade asset value." },
  { id: "charter-flight",  title: "Charter Flight",   subtitle: "Late-Board Express",  icon: "✈", badge: "MOVE",  eventType: "acquisition-flight",   copy: "Advance to the next landmark, collect a $60 route bonus, and resolve it immediately." },
];

// ── Board layout ───────────────────────────────────────────────────────────
function buildSpaceDefs() {
  const eventByPos = new Map(EVENT_POSITIONS.map((pos, i) => [pos, EVENT_DEFS[i]]));
  const spaces = [];
  let lmIndex = 0;
  for (let i = 0; i < BOARD_SPACES; i++) {
    if (eventByPos.has(i)) {
      const ev = eventByPos.get(i);
      spaces.push({ id: ev.id, type: "event", ...ev });
    } else {
      const lm = LANDMARK_DEFS[lmIndex++];
      spaces.push({ id: `${lm.id}-space`, type: "landmark", landmarkId: lm.id });
    }
  }
  return spaces;
}

const SPACE_DEFS      = buildSpaceDefs();

// ── Character passives ────────────────────────────────────────────────────
const CHAR_PASSIVES = {
  "tycoon":    { id: "land-discount",     params: { discount: 0.10 } },
  "broker":    { id: "rent-boost",        params: { boost: 0.15 } },
  "architect": { id: "upgrade-discount",  params: { discount: 0.15 } },
  "explorer":  { id: "extra-move",        params: { extra: 1 } },
  "banker":    { id: "interest",          params: { rate: 0.03 } },
  "gambler":   { id: "double-or-nothing", params: { chance: 0.5 } },
  "diplomat":  { id: "tax-shield",        params: { reduction: 0.30 } },
  "engineer":  { id: "fast-build",        params: {} },
  "spy":       { id: "intel",             params: { cashback: 0.15 } },
  "merchant":  { id: "trade-bonus",       params: { discount: 0.20 } },
  "oracle":    { id: "foresight",         params: { multiplier: 2 } },
  "commander": { id: "rally",            params: { threshold: 3, boost: 0.10 } },
};
function getPassive(charId) { return CHAR_PASSIVES[charId] || null; }

// ── GameRoom class ─────────────────────────────────────────────────────────
export class GameRoom {
  constructor(code, { roomName = "", maxPlayers = 4, isPublic = true, password = "", turnTimerSeconds = 0, roundLimit = 20, seedId = "world-landmarks" } = {}) {
    this.code             = code;
    this.roomName         = roomName || "";
    this.maxPlayers       = Math.min(Math.max(Number(maxPlayers) || 4, 2), 6);
    this.isPublic         = Boolean(isPublic);
    this.password         = password || "";
    this.turnTimerSeconds = Number(turnTimerSeconds) || 0;
    this.roundLimit       = Math.min(Math.max(Number(roundLimit) || 20, 10), 50);
    this.seedId           = seedId || "world-landmarks";
    this.players          = [];   // { socketId, name, colorIndex, isHost }
    this.started          = false;
    this.state            = null;
    this.createdAt        = Date.now();
  }

  // ── Player management ────────────────────────────────────────────
  addPlayer(player) { this.players.push(player); }

  removePlayer(socketId) {
    this.players = this.players.filter((p) => p.socketId !== socketId);
    if (this.state) {
      const sp = this.state.players.find((p) => p.socketId === socketId);
      if (sp) sp.disconnected = true;
    }
  }

  hasPlayer(socketId) {
    return this.players.some((p) => p.socketId === socketId) ||
      (this.state?.players ?? []).some((p) => p.socketId === socketId);
  }

  isHost(socketId) {
    return this.players.some((p) => p.socketId === socketId && p.isHost);
  }

  isCurrentPlayer(socketId) {
    if (!this.state) return false;
    return this.state.players[this.state.currentPlayerIndex]?.socketId === socketId;
  }

  activePlayers() {
    if (!this.state) return [];
    return this.state.players.filter((p) => !p.bankrupt && !p.disconnected);
  }

  // ── Game start ───────────────────────────────────────────────────
  startGame() {
    this.started = true;
    const names        = this.players.map((p) => p.name);
    const colorIndices = this.players.map((p) => p.colorIndex);
    const socketIds    = this.players.map((p) => p.socketId);
    const characterIds = this.players.map((p) => p.characterId || null);

    this.state = {
      players: names.map((name, i) => {
        const palette = COLOR_PALETTE[colorIndices[i] ?? i % COLOR_PALETTE.length];
        return {
          id:           `player-${i}`,
          socketId:     socketIds[i],
          name,
          characterId:  characterIds[i],
          color:        palette.color,
          glow:         palette.glow,
          colorName:    palette.label,
          marker:       i + 1,
          cash:         STARTING_CASH,
          position:     0,
          skipTurns:    0,
          bankrupt:     false,
          disconnected: false,
          inventory:    [],
          activeEffects:[],
        };
      }),
      seedId:              this.seedId,
      landmarks:           this._createLandmarkState(),
      currentPlayerIndex:  0,
      selectedSpaceIndex:  0,
      round:               1,
      dice:                [1, 1],
      rolling:             false,
      turnStarted:         false,
      turnBusy:            false,
      pendingAction:       null,
      log:                 [],
      gameOver:            false,
      winner:              null,
      winnerReason:        null,
      shopStock:           this._generateShopStock(),
      rankingReady:        false,
      lastAction:          null,
    };

    this._addLog(`${this._currentPlayer().name} begins on START with $${this._fmt(STARTING_CASH)}.`);
    return this.state;
  }

  // ── Game actions ─────────────────────────────────────────────────
  handleRoll() {
    const st = this.state;
    const player = this._currentPlayer();
    if (!player || st.turnBusy || st.turnStarted || st.gameOver || player.bankrupt) return null;

    st.lastAction = null;
    st.turnBusy = true;
    st.rolling  = false;

    let d1 = this._die(), d2 = this._die();
    if (this._hasEffect(player, "speed-boots")) {
      const d3  = this._die();
      const all = [d1, d2, d3].sort((a, b) => b - a);
      d1 = all[0]; d2 = all[1];
      this._consumeEffect(player, "speed-boots");
      this._addLog(`${player.name}'s Speed Boots: rolled 3 dice, using best two.`);
    }
    st.dice = [d1, d2];

    let total = d1 + d2;
    if (this._hasEffect(player, "shortcut-map")) {
      total += 3;
      this._consumeEffect(player, "shortcut-map");
      this._addLog(`${player.name}'s Shortcut Map added 3 bonus spaces.`);
    }
    const explorerPassive = getPassive(player.characterId);
    if (explorerPassive && explorerPassive.id === "extra-move") {
      total += explorerPassive.params.extra;
      this._addLog(`${player.name}'s Explorer passive: +${explorerPassive.params.extra} bonus move.`);
    }
    this._addLog(`${player.name} rolled ${d1} + ${d2} and advances ${total} spaces.`);

    // Store move metadata for client animation
    st._moveFrom = player.position;
    st._moveTo   = (player.position + total) % BOARD_SPACES;

    this._movePlayer(player, total);

    if (!player.bankrupt && !st.gameOver) {
      st.turnStarted = true;
      this._resolveCurrentSpace(player);
    }

    st.turnBusy = false;
    return st;
  }

  handleBuy() {
    const st = this.state;
    const player  = this._currentPlayer();
    const pending = st.pendingAction;
    if (!pending || pending.type !== "buy" || st.turnBusy || st.gameOver || !player) return null;

    const lm = this._getLandmark(pending.landmarkId);
    if (!lm || lm.ownerId || player.cash < lm.cost) return null;

    let cost = lm.cost;
    if (this._hasEffect(player, "discount-deed")) {
      cost = Math.round(cost * 0.7);
      this._consumeEffect(player, "discount-deed");
      this._addLog(`${player.name} used Discount Deed — 30% off!`);
    }
    const buyPassive = getPassive(player.characterId);
    if (buyPassive && buyPassive.id === "land-discount") {
      cost = Math.round(cost * (1 - buyPassive.params.discount));
      this._addLog(`${player.name}'s Tycoon passive: ${Math.round(buyPassive.params.discount * 100)}% land discount applied.`);
    }
    player.cash -= cost;
    if (player.cash < 0) player.cash = 0;
    lm.ownerId = player.id;
    lm.level   = 0;
    if (buyPassive && buyPassive.id === "fast-build") {
      if (lm.level < MAX_UPGRADE_LEVEL) {
        lm.level += 1;
        this._addLog(`${player.name}'s Engineer passive: ${lm.name} auto-upgraded to ${UPGRADE_LEVELS[lm.level]}!`);
      }
    }
    st.pendingAction = null;
    st.lastAction = { type: "buy", playerId: player.id, spaceIndex: player.position, amount: cost };
    this._addLog(`${player.name} acquired ${lm.name} for $${this._fmt(cost)}.`);
    this._checkEnd("purchase");
    return st;
  }

  handleUpgrade(spaceIndex) {
    const st     = this.state;
    const player = this._currentPlayer();
    if (!player || st.turnBusy || st.gameOver || !st.turnStarted) return null;

    let lm = null;
    if (st.pendingAction?.type === "upgrade") {
      lm = this._getLandmark(st.pendingAction.landmarkId);
    } else if (spaceIndex !== undefined) {
      const space = SPACE_DEFS[spaceIndex];
      if (space?.type === "landmark") lm = this._getLandmark(space.landmarkId);
    }

    if (!lm || lm.ownerId !== player.id || lm.level >= MAX_UPGRADE_LEVEL || player.cash < lm.upgradeCost) return null;

    let upgCost = lm.upgradeCost;
    const upgPassive = getPassive(player.characterId);
    if (upgPassive && upgPassive.id === "upgrade-discount") {
      upgCost = Math.round(upgCost * (1 - upgPassive.params.discount));
      this._addLog(`${player.name}'s Architect passive: ${Math.round(upgPassive.params.discount * 100)}% upgrade discount applied.`);
    }
    player.cash -= upgCost;
    lm.level    += 1;
    if (st.pendingAction?.landmarkId === lm.id) st.pendingAction = null;
    st.lastAction = { type: "upgrade", playerId: player.id, spaceIndex: player.position, amount: upgCost };
    this._addLog(`${player.name} upgraded ${lm.name} to ${UPGRADE_LEVELS[lm.level]}, pushing income to $${this._fmt(this._getLandmarkRent(lm))}.`);
    this._checkEnd("upgrade");
    return st;
  }

  handleEndTurn() {
    const st     = this.state;
    const player = this._currentPlayer();
    if (!player || st.turnBusy || st.gameOver || !st.turnStarted) return null;

    st.lastAction = null;

    if (this._hasEffect(player, "time-warp")) {
      this._consumeEffect(player, "time-warp");
      this._addLog(`${player.name} activates Time Warp — taking an extra turn!`);
      st.pendingAction = null;
      st.turnStarted   = false;
      st.shopStock     = this._generateShopStock();
      return st;
    }

    st.pendingAction  = null;
    st.turnStarted    = false;
    st.rankingReady   = true;

    let nextIndex = st.currentPlayerIndex;
    let wrapped   = false;
    let safety    = 0;

    while (safety < st.players.length) {
      nextIndex = (nextIndex + 1) % st.players.length;
      if (nextIndex === 0) wrapped = true;

      const candidate = st.players[nextIndex];
      if (candidate.bankrupt || candidate.disconnected) { safety++; continue; }

      if (candidate.skipTurns > 0) {
        candidate.skipTurns -= 1;
        this._addLog(`${candidate.name} lost the turn to travel delays.`);
        safety++;
        continue;
      }

      st.currentPlayerIndex = nextIndex;
      st.shopStock          = this._generateShopStock();
      if (wrapped) {
        st.round += 1;
        // Apply Banker interest passive to all active players at round start
        this.activePlayers().forEach((p) => {
          const bankPassive = getPassive(p.characterId);
          if (bankPassive && bankPassive.id === "interest") {
            const interest = Math.round(p.cash * bankPassive.params.rate);
            if (interest > 0) {
              p.cash += interest;
              this._addLog(`${p.name}'s Banker passive: earned $${this._fmt(interest)} interest.`);
            }
          }
        });
      }

      if (st.round > this.roundLimit) {
        this._endGame("round-limit");
      } else {
        this._addLog(`${this._currentPlayer().name} is now at the table.`);
      }
      return st;
    }

    this._endGame("last-investor");
    return st;
  }

  handleBuyItem(itemId) {
    const st     = this.state;
    const player = this._currentPlayer();
    const item   = ITEM_DEFS.find((d) => d.id === itemId);
    if (!player || !item || player.cash < item.price || player.inventory.length >= 3) return null;
    if (st.turnStarted || st.gameOver) return null;

    st.lastAction = null;
    let price = item.price;
    const tradePassive = getPassive(player.characterId);
    if (tradePassive && tradePassive.id === "trade-bonus") {
      price = Math.round(price * (1 - tradePassive.params.discount));
      this._addLog(`${player.name}'s Merchant passive: ${Math.round(tradePassive.params.discount * 100)}% item discount applied.`);
    }
    player.cash -= price;
    player.inventory.push(item.id);
    st.turnStarted = true;
    this._addLog(`${player.name} purchased ${item.icon} ${item.name} for $${this._fmt(price)}.`);
    return st;
  }

  handleDiscardItem(itemId) {
    const st     = this.state;
    const player = this._currentPlayer();
    if (!player) return null;
    st.lastAction = null;
    const idx = player.inventory.indexOf(itemId);
    if (idx >= 0) player.inventory.splice(idx, 1);
    const item = ITEM_DEFS.find((d) => d.id === itemId);
    this._addLog(`${player.name} discarded ${item?.name ?? itemId}.`);
    return st;
  }

  handleUseItem(itemId, targetId) {
    const st     = this.state;
    const player = this._currentPlayer();
    const item   = ITEM_DEFS.find((d) => d.id === itemId);
    if (!player || !item || st.turnStarted || st.turnBusy || st.gameOver) return null;

    const idx = player.inventory.indexOf(itemId);
    if (idx < 0) return null;
    st.lastAction = null;

    player.inventory.splice(idx, 1);
    this._applyItemEffect(item, player, targetId);
    return st;
  }

  forceEndGame() {
    this._endGame("last-investor");
    return this.state;
  }

  // ── Private helpers ──────────────────────────────────────────────
  _createLandmarkState() {
    // Shuffle landmarks within each phase for variety
    const byPhase = { Early: [], Mid: [], Late: [] };
    LANDMARK_DEFS.forEach(lm => byPhase[lm.phase].push({ ...lm }));
    Object.values(byPhase).forEach(arr => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    });
    const shuffled = [...byPhase.Early, ...byPhase.Mid, ...byPhase.Late];
    return shuffled.map((lm, idx) => ({
      ...lm,
      cost: LANDMARK_COSTS[idx],
      baseRent: Math.round(LANDMARK_COSTS[idx] * 0.18),
      upgradeCost: Math.round(LANDMARK_COSTS[idx] * 0.58),
      ownerId: null,
      level: 0,
    }));
  }

  _generateShopStock() {
    const weights = { common: 8, rare: 5, epic: 3, legendary: 1 };
    const byGrade = {};
    ITEM_DEFS.forEach((item) => {
      if (!byGrade[item.grade]) byGrade[item.grade] = [];
      byGrade[item.grade].push(item.id);
    });
    const pool = [];
    Object.entries(weights).forEach(([grade, w]) => {
      for (let i = 0; i < w; i++) pool.push(grade);
    });
    const stock = [], used = new Set();
    let tries = 0;
    while (stock.length < 4 && tries < 40) {
      const grade = pool[Math.floor(Math.random() * pool.length)];
      const candidates = (byGrade[grade] || []).filter((id) => !used.has(id));
      if (!candidates.length) { tries++; continue; }
      const id = candidates[Math.floor(Math.random() * candidates.length)];
      stock.push(id);
      used.add(id);
      tries++;
    }
    return stock;
  }

  _currentPlayer() {
    return this.state?.players[this.state.currentPlayerIndex] ?? null;
  }

  _getLandmark(id) {
    return this.state.landmarks.find((lm) => lm.id === id) ?? null;
  }

  _ownedLandmarks(playerId) {
    return this.state.landmarks.filter((lm) => lm.ownerId === playerId);
  }

  _countGlobalLandmarks(playerId) {
    return this._ownedLandmarks(playerId).filter((lm) => lm.level >= MAX_UPGRADE_LEVEL).length;
  }

  _countDevelopedOrBetter(playerId) {
    return this._ownedLandmarks(playerId).filter((lm) => lm.level >= 1).length;
  }

  _totalUpgradeCount(playerId) {
    return this._ownedLandmarks(playerId).reduce((s, lm) => s + lm.level, 0);
  }

  _highestOwnedRent(playerId) {
    return this._ownedLandmarks(playerId).reduce((h, lm) => Math.max(h, this._getLandmarkRent(lm)), 0);
  }

  _getLandmarkRent(lm) {
    let rent = Math.round(lm.baseRent * RENT_MULTIPLIERS[lm.level]);
    if (lm.prestigeMultiplier) rent = Math.round(rent * lm.prestigeMultiplier);
    return rent;
  }

  _getLandmarkValue(lm) {
    return lm.cost + lm.level * lm.upgradeCost;
  }

  _getLandmarkAssetValue(player) {
    return this._ownedLandmarks(player.id).reduce((s, lm) => s + lm.cost, 0);
  }

  _getUpgradeAssetValue(player) {
    return this._ownedLandmarks(player.id).reduce((s, lm) => s + lm.level * lm.upgradeCost, 0);
  }

  _getTotalAssets(player) {
    return player.cash + this._getLandmarkAssetValue(player) + this._getUpgradeAssetValue(player);
  }

  _getPlayerById(id) {
    return this.state.players.find((p) => p.id === id) ?? null;
  }

  _rankedPlayers() {
    return [...this.state.players].sort((a, b) => {
      const d = this._getTotalAssets(b) - this._getTotalAssets(a);
      return d !== 0 ? d : b.cash - a.cash;
    });
  }

  _findNextLandmarkIndex(from) {
    for (let s = 1; s < SPACE_DEFS.length; s++) {
      const idx = (from + s) % SPACE_DEFS.length;
      if (SPACE_DEFS[idx].type === "landmark") return idx;
    }
    return from;
  }

  _findNextOpenLandmarkIndex(from) {
    for (let s = 1; s < SPACE_DEFS.length; s++) {
      const idx = (from + s) % SPACE_DEFS.length;
      const sp  = SPACE_DEFS[idx];
      if (sp.type === "landmark" && !this._getLandmark(sp.landmarkId).ownerId) return idx;
    }
    return null;
  }

  _hasEffect(player, id) {
    return player?.activeEffects?.some((e) => e.id === id) ?? false;
  }

  _consumeEffect(player, id) {
    if (!player?.activeEffects) return;
    const i = player.activeEffects.findIndex((e) => e.id === id);
    if (i >= 0) player.activeEffects.splice(i, 1);
  }

  _getEffectData(player, id, landmarkId) {
    if (!player?.activeEffects) return null;
    const e = player.activeEffects.find((ef) => ef.id === id);
    if (!e) return null;
    if (landmarkId && e.data?.landmarkId !== landmarkId) return null;
    return e;
  }

  _addLog(entry) {
    this.state.log.unshift(entry);
    this.state.log = this.state.log.slice(0, 10);
  }

  _fmt(v) {
    return Math.round(v).toLocaleString("en-US");
  }

  _die() {
    return Math.floor(Math.random() * 6) + 1;
  }

  // ── Movement ─────────────────────────────────────────────────────
  _movePlayer(player, spaces) {
    for (let i = 0; i < spaces; i++) {
      player.position = (player.position + 1) % SPACE_DEFS.length;
      if (player.position === 0) {
        let passBonus = PASS_START_BONUS;
        const passPassive = getPassive(player.characterId);
        if (passPassive && passPassive.id === "double-or-nothing") {
          if (Math.random() < passPassive.params.chance) {
            passBonus *= 2;
            this._addLog(`${player.name}'s Gambler passive: doubled the START bonus to $${this._fmt(passBonus)}!`);
          } else {
            passBonus = 0;
            this._addLog(`${player.name}'s Gambler passive: lost the START bonus!`);
          }
        }
        player.cash += passBonus;
        this._addLog(`${player.name} passed START and collected $${this._fmt(passBonus)}.`);
      }
    }
    this.state.selectedSpaceIndex = player.position;
  }

  _moveToIndexAndResolve(player, targetIndex) {
    const steps = (targetIndex - player.position + SPACE_DEFS.length) % SPACE_DEFS.length;
    if (steps <= 0) { this._checkEnd("movement-event"); return; }
    this._movePlayer(player, steps);
    this._resolveCurrentSpace(player);
  }

  // ── Space resolution ─────────────────────────────────────────────
  _resolveCurrentSpace(player) {
    const st    = this.state;
    const space = SPACE_DEFS[player.position];
    st.selectedSpaceIndex = player.position;
    st.pendingAction      = null;

    if (space.type === "event") {
      const chained = this._resolveEvent(player, space);
      if (chained) return;
    }

    if (space.type === "landmark") {
      const lm    = this._getLandmark(space.landmarkId);
      const owner = this._getPlayerById(lm.ownerId);

      if (!owner) {
        st.pendingAction = { type: "buy", landmarkId: lm.id };
        this._addLog(`${player.name} landed on open market at ${lm.name}.`);
      } else if (owner.id === player.id) {
        if (lm.level < MAX_UPGRADE_LEVEL) {
          st.pendingAction = { type: "upgrade", landmarkId: lm.id };
          this._addLog(`${player.name} returned to ${lm.name} and can fund the next tier.`);
        } else {
          this._addLog(`${player.name} landed on ${lm.name}, already a Global Landmark.`);
        }
      } else {
        let rent = this._getLandmarkRent(lm);
        // Broker passive: owner gets rent boost
        const ownerPassive = getPassive(owner.characterId);
        if (ownerPassive && ownerPassive.id === "rent-boost") {
          const boost = Math.round(rent * ownerPassive.params.boost);
          rent += boost;
          this._addLog(`${owner.name}'s Broker passive: rent boosted by $${this._fmt(boost)}.`);
        }
        // Commander passive: rally — if owner has threshold+ landmarks, boost rent
        if (ownerPassive && ownerPassive.id === "rally") {
          const owned = this._ownedLandmarks(owner.id).length;
          if (owned >= ownerPassive.params.threshold) {
            const boost = Math.round(rent * ownerPassive.params.boost);
            rent += boost;
            this._addLog(`${owner.name}'s Commander passive: rally boost +$${this._fmt(boost)} (${owned} landmarks).`);
          }
        }
        if (this._hasEffect(player, "diplomatic")) {
          this._consumeEffect(player, "diplomatic");
          this._addLog(`${player.name}'s Diplomatic Immunity blocked rent at ${lm.name}.`);
        } else {
          const spike = this._getEffectData(owner, "rent-spike", lm.id);
          if (spike) { rent *= 2; this._consumeEffect(owner, "rent-spike"); this._addLog(`Rent Spike! Rent doubled to $${this._fmt(rent)}.`); }
          if (this._hasEffect(player, "insurance")) {
            rent = Math.round(rent / 2);
            this._consumeEffect(player, "insurance");
            this._addLog(`${player.name}'s Insurance halved rent to $${this._fmt(rent)}.`);
          }
          this._transferCash(player, owner, rent, `${lm.name} income`);
          // Spy passive: intel cashback — payer gets a percentage back after paying rent
          const payerPassive = getPassive(player.characterId);
          if (payerPassive && payerPassive.id === "intel") {
            const cashback = Math.round(rent * payerPassive.params.cashback);
            if (cashback > 0) {
              player.cash += cashback;
              this._addLog(`${player.name}'s Spy passive: intel gathered, $${this._fmt(cashback)} cashback.`);
            }
          }
        }
      }
    }
    this._checkEnd("space-resolution");
  }

  _resolveEvent(player, space) {
    switch (space.eventType) {
      case "start": {
        let startBonus = EXACT_START_BONUS;
        const gamblerPassive = getPassive(player.characterId);
        if (gamblerPassive && gamblerPassive.id === "double-or-nothing") {
          if (Math.random() < gamblerPassive.params.chance) {
            startBonus *= 2;
            this._addLog(`${player.name}'s Gambler passive: double or nothing — DOUBLED to $${this._fmt(startBonus)}!`);
          } else {
            startBonus = 0;
            this._addLog(`${player.name}'s Gambler passive: double or nothing — lost it all!`);
          }
        }
        player.cash += startBonus;
        this.state.lastAction = { type: "bonus", playerId: player.id, spaceIndex: player.position, amount: startBonus };
        this._addLog(`${player.name} landed exactly on START and banked $${this._fmt(startBonus)}.`);
        this._checkEnd("start-bonus");
        return false;
      }

      case "corner-tax":
        if (this._hasEffect(player, "tax-shield")) {
          this._consumeEffect(player, "tax-shield");
          this._addLog(`${player.name}'s Tax Shield absorbed the city tax.`);
        } else {
          let taxAmount = 150;
          const taxPassive = getPassive(player.characterId);
          if (taxPassive && taxPassive.id === "tax-shield") {
            const reduction = Math.round(taxAmount * taxPassive.params.reduction);
            taxAmount -= reduction;
            this._addLog(`${player.name}'s Diplomat passive: tax reduced by $${this._fmt(reduction)}.`);
          }
          this._applyCharge(player, taxAmount, "city tax");
        }
        this._checkEnd("corner-tax");
        return false;

      case "tourism-boom": {
        const p = 120 + this._ownedLandmarks(player.id).length * 25;
        player.cash += p;
        this.state.lastAction = { type: "bonus", playerId: player.id, spaceIndex: player.position, amount: p };
        this._addLog(`${player.name} capitalized on a Tourism Boom for $${this._fmt(p)}.`);
        this._checkEnd("tourism-boom");
        return false;
      }

      case "heritage-grant": {
        const p = 80 + this._countDevelopedOrBetter(player.id) * 45;
        player.cash += p;
        this.state.lastAction = { type: "bonus", playerId: player.id, spaceIndex: player.position, amount: p };
        this._addLog(`${player.name} received a Heritage Grant worth $${this._fmt(p)}.`);
        this._checkEnd("heritage-grant");
        return false;
      }

      case "media-spotlight": {
        const p = 100 + Math.round(this._highestOwnedRent(player.id) * 0.75);
        player.cash += p;
        this.state.lastAction = { type: "bonus", playerId: player.id, spaceIndex: player.position, amount: p };
        this._addLog(`${player.name} captured $${this._fmt(p)} from the Tourism Boom crowd surge.`);
        this._checkEnd("media-spotlight");
        return false;
      }

      case "skybridge-charter": {
        const idx = this._findNextLandmarkIndex(player.position);
        this._addLog(`${player.name} boarded the City Tram to the next landmark.`);
        this._moveToIndexAndResolve(player, idx);
        return true;
      }

      case "continental-connector": {
        const idx = this._findNextOpenLandmarkIndex(player.position) ?? this._findNextLandmarkIndex(player.position);
        this._addLog(`${player.name} used the Landmark Shuttle.`);
        this._moveToIndexAndResolve(player, idx);
        return true;
      }

      case "acquisition-flight": {
        const idx = this._findNextLandmarkIndex(player.position);
        player.cash += 60;
        this.state.lastAction = { type: "bonus", playerId: player.id, spaceIndex: player.position, amount: 60 };
        this._addLog(`${player.name} took the Charter Flight, earned $60, and is moving.`);
        this._moveToIndexAndResolve(player, idx);
        return true;
      }

      case "customs-delay":
        player.skipTurns += 1;
        this._addLog(`${player.name} got stuck at the Permit Office and will miss the next turn.`);
        this._checkEnd("customs-delay");
        return false;

      case "free-parking":
        player.cash += 50;
        this.state.lastAction = { type: "bonus", playerId: player.id, spaceIndex: player.position, amount: 50 };
        this._addLog(`${player.name} pulled into Free Parking and collected $50.`);
        this._checkEnd("free-parking");
        return false;

      case "restoration-bill": {
        let loss = 70 + Math.round(this._getUpgradeAssetValue(player) * 0.15);
        const restTaxPassive = getPassive(player.characterId);
        if (restTaxPassive && restTaxPassive.id === "tax-shield") {
          const reduction = Math.round(loss * restTaxPassive.params.reduction);
          loss -= reduction;
          this._addLog(`${player.name}'s Diplomat passive: restoration bill reduced by $${this._fmt(reduction)}.`);
        }
        this._applyCharge(player, loss, "restoration bill");
        this._checkEnd("restoration-bill");
        return false;
      }

      case "world-event": {
        const oraclePassive = getPassive(player.characterId);
        const roll = Math.floor(Math.random() * 3);
        if (roll === 0) {
          let p = 140 + this._ownedLandmarks(player.id).length * 30;
          if (oraclePassive && oraclePassive.id === "foresight") {
            p = Math.round(p * oraclePassive.params.multiplier);
            this._addLog(`${player.name}'s Oracle passive: foresight doubled the world event bonus!`);
          }
          player.cash += p;
          this.state.lastAction = { type: "bonus", playerId: player.id, spaceIndex: player.position, amount: p };
          this._addLog(`${player.name} hit a favorable World Event and gained $${this._fmt(p)}.`);
          this._checkEnd("world-event-bonus");
          return false;
        }
        if (roll === 1) {
          let loss = 110 + this._totalUpgradeCount(player.id) * 18;
          if (oraclePassive && oraclePassive.id === "foresight") {
            loss = Math.round(loss / oraclePassive.params.multiplier);
            this._addLog(`${player.name}'s Oracle passive: foresight halved the world event penalty!`);
          }
          this._applyCharge(player, loss, "world event shock");
          this._checkEnd("world-event-tax");
          return false;
        }
        const idx = this._findNextOpenLandmarkIndex(player.position) ?? this._findNextLandmarkIndex(player.position);
        this._addLog(`${player.name} triggered a World Event relocation.`);
        this._moveToIndexAndResolve(player, idx);
        return true;
      }

      default:
        return false;
    }
  }

  // ── Cash operations ───────────────────────────────────────────────
  _transferCash(from, to, amount, label) {
    from.cash -= amount;
    to.cash   += amount;
    this.state.lastAction = { type: "rent", fromId: from.id, toId: to.id, spaceIndex: from.position, amount };
    this._addLog(`${from.name} paid $${this._fmt(amount)} to ${to.name} for ${label}.`);
    this._stabilize(from);
  }

  _applyCharge(player, amount, label) {
    player.cash -= amount;
    this.state.lastAction = { type: "tax", playerId: player.id, spaceIndex: player.position, amount };
    this._addLog(`${player.name} lost $${this._fmt(amount)} to ${label}.`);
    this._stabilize(player);
  }

  _stabilize(player) {
    while (player.cash < 0) {
      const holdings = this._ownedLandmarks(player.id)
        .sort((a, b) => this._getLandmarkValue(b) - this._getLandmarkValue(a));
      if (!holdings.length) {
        player.bankrupt = true;
        player.cash     = 0;
        this._addLog(`${player.name} is bankrupt and leaves the board.`);
        break;
      }
      const lm       = holdings[0];
      const recovery = Math.round(this._getLandmarkValue(lm) * LIQUIDATION_RATE);
      lm.ownerId = null;
      lm.level   = 0;
      player.cash += recovery;
      this._addLog(`${player.name} liquidated ${lm.name} for $${this._fmt(recovery)}.`);
    }
  }

  // ── End conditions ────────────────────────────────────────────────
  _checkEnd() {
    const st = this.state;
    if (st.gameOver) return;
    const live = st.players.filter((p) => !p.bankrupt);
    if (live.length <= 1) { this._endGame("last-investor"); return; }
    const trigger = live.find((p) => this._countGlobalLandmarks(p.id) >= MAJOR_VICTORY_GLOBALS);
    if (trigger) this._endGame("major-trigger");
  }

  _endGame(reason) {
    const st = this.state;
    if (st.gameOver) return;
    st.gameOver      = true;
    st.turnBusy      = false;
    st.turnStarted   = false;
    st.pendingAction = null;
    st.winnerReason  = reason;
    st.winner        = this._rankedPlayers()[0] ?? null;
    this._addLog(`${st.winner?.name ?? "No one"} finished on top after the final asset audit.`);
  }

  // ── Item effects ──────────────────────────────────────────────────
  _applyItemEffect(item, player, targetId) {
    this._addLog(`${player.name} used ${item.icon} ${item.name}!`);
    const st = this.state;

    switch (item.id) {
      case "cash-injection":
        player.cash += 250;
        this._addLog(`${player.name} gained $250 from Cash Injection.`);
        break;

      case "market-insider": {
        let total = 0;
        this._ownedLandmarks(player.id).forEach((lm) => { total += this._getLandmarkRent(lm); });
        player.cash += total;
        this._addLog(`Market Insider: ${player.name} collected $${this._fmt(total)} from all holdings.`);
        break;
      }

      case "discount-deed":
        player.activeEffects.push({ id: "discount-deed", data: {} });
        this._addLog(`${player.name}'s next purchase is 30% off.`);
        break;

      case "insurance":
        player.activeEffects.push({ id: "insurance", data: {} });
        this._addLog(`${player.name} is insured — next rent halved.`);
        break;

      case "tax-shield":
        player.activeEffects.push({ id: "tax-shield", data: {} });
        this._addLog(`${player.name} has a Tax Shield for the next TAX.`);
        break;

      case "diplomatic":
        player.activeEffects.push({ id: "diplomatic", data: {} });
        this._addLog(`${player.name} has Diplomatic Immunity — next rent blocked.`);
        break;

      case "time-warp":
        player.activeEffects.push({ id: "time-warp", data: {} });
        this._addLog(`${player.name} winds back time — extra turn incoming!`);
        break;

      case "market-crash":
        this.activePlayers().filter((p) => p.id !== player.id).forEach((opp) => {
          const loss = Math.round(opp.cash * 0.10);
          opp.cash -= loss;
          this._addLog(`Market Crash: ${opp.name} lost $${this._fmt(loss)}.`);
        });
        break;

      case "global-alliance": {
        let bonus = 0;
        this._ownedLandmarks(player.id).filter((lm) => lm.level >= MAX_UPGRADE_LEVEL)
          .forEach((lm) => { bonus += this._getLandmarkRent(lm); });
        player.cash += bonus;
        this._addLog(`Global Alliance: ${player.name} collected $${this._fmt(bonus)} from Global Landmarks.`);
        break;
      }

      case "fast-track": {
        const lm = st.landmarks.find((l) => l.id === targetId && l.ownerId === player.id && l.level < MAX_UPGRADE_LEVEL);
        if (lm) { lm.level += 1; this._addLog(`Fast Track: ${player.name} upgraded ${lm.name} to ${UPGRADE_LEVELS[lm.level]} for free!`); }
        break;
      }

      case "prestige-boost": {
        const lm = st.landmarks.find((l) => l.id === targetId && l.ownerId === player.id);
        if (lm) {
          lm.prestigeMultiplier = Math.round(((lm.prestigeMultiplier || 1) * 1.2) * 100) / 100;
          this._addLog(`Prestige Boost: ${lm.name} rent permanently +20%!`);
        }
        break;
      }

      case "golden-padlock": {
        const lm = st.landmarks.find((l) => l.id === targetId && l.ownerId === player.id);
        if (lm) {
          player.activeEffects.push({ id: "golden-padlock", data: { landmarkId: targetId }, turnsLeft: 3 });
          this._addLog(`${lm.name} is now protected by a Golden Padlock for 3 rounds.`);
        }
        break;
      }

      case "rent-spike": {
        const lm = st.landmarks.find((l) => l.id === targetId && l.ownerId === player.id);
        if (lm) {
          player.activeEffects.push({ id: "rent-spike", data: { landmarkId: targetId } });
          this._addLog(`Rent Spike placed on ${lm.name} — next visitor pays double!`);
        }
        break;
      }

      case "sabotage": {
        const target = this._getPlayerById(targetId);
        if (target) { target.skipTurns += 1; this._addLog(`${player.name} sabotaged ${target.name} — they skip their next turn!`); }
        break;
      }

      case "hostile-takeover": {
        const [oppId, lmId] = targetId.split("|");
        const opp = this._getPlayerById(oppId);
        const lm  = st.landmarks.find((l) => l.id === lmId);
        if (opp && lm) {
          const price = Math.round(this._getLandmarkValue(lm) * 0.7);
          if (player.cash >= price) {
            player.cash -= price; opp.cash += price; lm.ownerId = player.id;
            this._addLog(`Hostile Takeover: ${player.name} seized ${lm.name} from ${opp.name} for $${this._fmt(price)}!`);
          } else {
            this._addLog(`Hostile Takeover failed — insufficient funds.`);
            player.inventory.push(item.id);
          }
        }
        break;
      }

      case "landmark-swap": {
        const [oppId, lmId] = targetId.split("|");
        const opp   = this._getPlayerById(oppId);
        const oppLm = st.landmarks.find((l) => l.id === lmId);
        const myLm  = this._ownedLandmarks(player.id).find((l) => l.level <= (oppLm?.level ?? 0));
        if (opp && oppLm && myLm) {
          oppLm.ownerId = player.id; myLm.ownerId = opp.id;
          this._addLog(`Landmark Swap: ${player.name} swapped ${myLm.name} for ${opp.name}'s ${oppLm.name}!`);
        }
        break;
      }

      case "speed-boots":
        player.activeEffects.push({ id: "speed-boots", data: {} });
        this._addLog(`${player.name}'s Speed Boots are ready — roll for 3 dice!`);
        st.turnStarted = false;
        break;

      case "shortcut-map":
        player.activeEffects.push({ id: "shortcut-map", data: {} });
        this._addLog(`${player.name}'s Shortcut Map is ready — +3 to next roll!`);
        st.turnStarted = false;
        break;

      case "lucky-compass": {
        const chosen = Number(targetId);
        this._addLog(`${player.name} used Lucky Compass — moving exactly ${chosen} spaces.`);
        st._moveFrom = player.position;
        this._movePlayer(player, chosen);
        st._moveTo = player.position;
        if (!player.bankrupt && !st.gameOver) {
          st.turnStarted = true;
          this._resolveCurrentSpace(player);
        }
        break;
      }

      case "teleport-pass": {
        const destLm = st.landmarks.find((l) => l.id === targetId && !l.ownerId);
        if (destLm) {
          const destSpace = SPACE_DEFS.findIndex((s) => s.type === "landmark" && s.landmarkId === destLm.id);
          if (destSpace >= 0) {
            this._addLog(`${player.name} teleported to ${destLm.name}!`);
            st._moveFrom = player.position;
            const steps  = (destSpace - player.position + SPACE_DEFS.length) % SPACE_DEFS.length;
            if (steps > 0) this._movePlayer(player, steps);
            else player.position = destSpace;
            st._moveTo = player.position;
            if (!player.bankrupt && !st.gameOver) {
              st.turnStarted = true;
              this._resolveCurrentSpace(player);
            }
          }
        }
        break;
      }

      default:
        break;
    }

    this._checkEnd("item-use");
  }
}
