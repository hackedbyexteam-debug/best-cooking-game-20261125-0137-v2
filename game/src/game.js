// Ember Kitchen — the game itself: dishes, orders, cooking, scoring.
// One file, one job: the rules. Drawing lives in art.js, the loop in main.js.

export const INGREDIENTS = [
  { kind: 'bun', name: 'Bun', key: '1', price: 1 },
  { kind: 'patty', name: 'Patty', key: '2', price: 2 },
  { kind: 'lettuce', name: 'Lettuce', key: '3', price: 1 },
  { kind: 'tomato', name: 'Tomato', key: '4', price: 1 },
  { kind: 'cheese', name: 'Cheese', key: '5', price: 1 },
  { kind: 'pasta', name: 'Pasta', key: '6', price: 2 },
];

export const DISHES = [
  { name: 'Ember Burger', recipe: ['bun', 'patty', 'lettuce', 'cheese'], price: 14, color: '#e07856' },
  { name: 'Sunset Pasta', recipe: ['pasta', 'tomato', 'cheese'], price: 12, color: '#e9b44c' },
  { name: 'Garden Bowl', recipe: ['lettuce', 'tomato', 'cheese'], price: 9, color: '#7fb069' },
  { name: 'Bistro Melt', recipe: ['bun', 'cheese', 'tomato'], price: 10, color: '#c65d7b' },
];

const CUSTOMERS = [
  { skin: '#f2c09a', hair: 'bun', hairColor: '#4a2c17', shirt: '#c65d7b' },
  { skin: '#8a5a34', hair: 'curly', hairColor: '#241a12', shirt: '#4e7fa5' },
  { skin: '#f7d7b0', hair: 'side', hairColor: '#b5542f', shirt: '#7fb069' },
  { skin: '#e8b48a', hair: 'side', hairColor: '#2e2e2e', shirt: '#e9b44c' },
];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newGame(seed = 1) {
  const rng = mulberry32(seed);
  return {
    rng,
    seed,
    mode: 'title', // title | play | over
    time: 0,
    shiftLength: 150,
    timeLeft: 150,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    hearts: 3,
    day: 1,
    plate: [], // ingredient kinds on the plate being built
    plateShake: 0,
    plateGlow: 0,
    grill: [null, null], // { kind:'patty', progress:0..1, done } x2 slots
    chop: 0, // chopping animation timer 0..1
    chopKind: null,
    orders: [],
    nextOrderId: 1,
    orderTimer: 2.5,
    particles: [],
    floaters: [], // {x,y,text,color,life}
    customers: [],
    message: null,
    messageLife: 0,
    servedFlash: 0,
  };
}

export function spawnOrder(g, forcedDish = null) {
  const dish = forcedDish ?? DISHES[Math.floor(g.rng() * DISHES.length)];
  const cust = { ...CUSTOMERS[Math.floor(g.rng() * CUSTOMERS.length)], phase: g.rng() * 6, mood: 0.8 };
  const order = {
    id: g.nextOrderId++,
    dish,
    recipe: [...dish.recipe],
    name: dish.name,
    price: dish.price,
    patience: 1,
    maxPatience: 42 + g.rng() * 10,
    cust,
    born: g.time,
  };
  g.orders.push(order);
  g.customers.push(cust);
  return order;
}

export function plateMatches(g, recipe) {
  if (g.plate.length !== recipe.length) return false;
  const a = [...g.plate].sort();
  const b = [...recipe].sort();
  return a.every((v, i) => v === b[i]);
}

export function addIngredient(g, kind) {
  if (g.mode !== 'play') return false;
  if (g.plate.length >= 4) return false;
  if (kind === 'patty') {
    // raw patty goes on the grill, never straight on the plate
    const slot = g.grill.findIndex((s) => s === null);
    if (slot === -1) return false;
    g.grill[slot] = { kind: 'patty', progress: 0, done: false };
    burst(g, 430 + slot * 130, 520, '#ff9d5c', 6);
    return true;
  }
  if (kind === 'tomato' || kind === 'lettuce') {
    g.chop = 1;
    g.chopKind = kind;
  }
  g.plate.push(kind);
  g.plateGlow = 1;
  return true;
}

export function takePatty(g, slot) {
  const s = g.grill[slot];
  if (!s || !s.done) return false;
  if (g.plate.length >= 4) return false;
  g.grill[slot] = null;
  g.plate.push('patty');
  g.plateGlow = 1;
  return true;
}

export function clearPlate(g) {
  g.plate = [];
}

export function serveOrder(g, orderId) {
  const order = g.orders.find((o) => o.id === orderId);
  if (!order || g.mode !== 'play') return false;
  if (!plateMatches(g, order.recipe)) {
    g.plateShake = 1;
    g.combo = 0;
    addFloater(g, 640, 640, 'Wrong dish!', '#d64533');
    return false;
  }
  const tip = Math.round(order.price * 0.5 * order.patience);
  const mult = 1 + Math.min(g.combo, 8) * 0.25;
  const earned = Math.round((order.price + tip) * mult);
  g.coins += earned;
  g.score += earned * 10;
  g.combo += 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  g.served += 1;
  g.servedFlash = 1;
  order.cust.mood = 1;
  addFloater(g, 640, 600, `+$${earned}  ${g.combo > 1 ? 'COMBO x' + (1 + Math.min(g.combo, 8) * 0.25).toFixed(2).replace(/\.?0+$/, '') : 'Served!'}`, '#2f7d32');
  burst(g, 1180, 620, '#ffd166', 16);
  burst(g, 1180, 620, '#ff8fa3', 10);
  g.orders = g.orders.filter((o) => o.id !== orderId);
  g.customers = g.customers.filter((c) => c !== order.cust);
  g.plate = [];
  return true;
}

export function serveFirstMatch(g) {
  const match = g.orders.find((o) => plateMatches(g, o.recipe));
  if (match) return serveOrder(g, match.id);
  g.plateShake = 1;
  return false;
}

export function burst(g, x, y, color, n) {
  for (let i = 0; i < n; i++) {
    g.particles.push({
      x, y,
      vx: (g.rng() - 0.5) * 160,
      vy: -40 - g.rng() * 120,
      life: 0.6 + g.rng() * 0.5,
      age: 0,
      size: 2 + g.rng() * 4,
      color,
      kind: 'spark',
    });
  }
}

export function steam(g, x, y) {
  g.particles.push({
    x: x + (g.rng() - 0.5) * 30, y,
    vx: (g.rng() - 0.5) * 12, vy: -28 - g.rng() * 20,
    life: 1.1 + g.rng() * 0.6, age: 0,
    size: 5 + g.rng() * 7, color: 'rgba(255,255,255,.5)', kind: 'steam',
  });
}

export function addFloater(g, x, y, text, color) {
  g.floaters.push({ x, y, text, color, life: 1.4, age: 0 });
}

export function update(g, dt) {
  if (g.mode !== 'play') {
    // idle animation on the title screen
    g.time += dt;
    g.particles = g.particles.filter((p) => (p.age += dt) < p.life);
    return;
  }
  g.time += dt;
  g.timeLeft = Math.max(0, g.timeLeft - dt);
  g.plateShake = Math.max(0, g.plateShake - dt * 3);
  g.plateGlow = Math.max(0, g.plateGlow - dt * 2);
  g.servedFlash = Math.max(0, g.servedFlash - dt * 2);
  g.chop = Math.max(0, g.chop - dt * 2.4);
  g.messageLife = Math.max(0, g.messageLife - dt);

  // grill cooks
  g.grill.forEach((s, i) => {
    if (s && !s.done) {
      s.progress += dt / 4;
      if (g.rng() < 0.25) burst(g, 659 + i * 130, 505, '#ffb347', 1);
      if (s.progress >= 1) {
        s.done = true;
        s.progress = 1;
        addFloater(g, 659 + i * 130, 470, 'Ready!', '#2f7d32');
      }
    }
    if (s && s.done && g.rng() < 0.06) steam(g, 659 + i * 130, 500);
  });

  // orders arrive, faster as the shift goes on
  g.orderTimer -= dt;
  const rush = 1 + (1 - g.timeLeft / g.shiftLength) * 0.8;
  if (g.orderTimer <= 0 && g.orders.length < 4) {
    spawnOrder(g);
    g.orderTimer = (9 + g.rng() * 5) / rush;
  }

  // patience drains
  for (const o of g.orders) {
    o.patience -= dt / o.maxPatience;
    o.cust.mood = Math.min(o.cust.mood, 0.35 + o.patience * 0.65);
  }
  const expired = g.orders.filter((o) => o.patience <= 0);
  for (const o of expired) {
    g.orders = g.orders.filter((x) => x.id !== o.id);
    g.customers = g.customers.filter((c) => c !== o.cust);
    g.lost += 1;
    g.hearts -= 1;
    g.combo = 0;
    addFloater(g, 640, 640, 'Order walked out!', '#d64533');
    if (g.hearts <= 0) {
      endShift(g);
      return;
    }
  }

  // particles + floaters
  g.particles = g.particles.filter((p) => (p.age += dt) < p.life);
  for (const p of g.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.kind === 'steam' ? -12 * dt : 160 * dt;
  }
  g.floaters = g.floaters.filter((f) => (f.age += dt) < f.life);
  for (const f of g.floaters) f.y -= 34 * dt;

  // ambient steam from the grill
  if (g.rng() < 0.12) steam(g, 659 + g.rng() * 260, 505);

  if (g.timeLeft <= 0) endShift(g);
}

export function startShift(g) {
  const fresh = newGame(g.seed);
  Object.assign(g, fresh, { mode: 'play' });
  spawnOrder(g, DISHES[0]);
  spawnOrder(g, DISHES[1]);
  g.orderTimer = 8;
}

export function endShift(g) {
  g.mode = 'over';
  g.timeLeft = 0;
}
