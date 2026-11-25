// Ember Kitchen — staged scenes for the screenshots.
// ?shot=cover|cook|serve|rush&seed=1 builds one fixed, busy moment of the
// game and freezes the shift clock, so a screenshot always shows the same
// rich scene. The scenes use the game's own state and drawing: nothing is
// faked for the camera.

import { newGame, spawnOrder, addIngredient, serveOrder, DISHES } from './game.js';

export function applyShot(g, shot, seed) {
  const fresh = newGame(seed);
  Object.assign(g, fresh, { mode: 'play' });
  g.timeLeft = 150;
  if (shot === 'cover') {
    spawnOrder(g, DISHES[0]);
    spawnOrder(g, DISHES[1]);
    g.plate = ['bun', 'patty'];
    g.grill[0] = { kind: 'patty', progress: 0.55, done: false };
    g.mode = 'title';
    g.orders = g.orders.slice(0, 2);
    return;
  }
  if (shot === 'cook') {
    spawnOrder(g, DISHES[0]);
    spawnOrder(g, DISHES[1]);
    spawnOrder(g, DISHES[2]);
    g.grill[0] = { kind: 'patty', progress: 0.62, done: false };
    g.grill[1] = { kind: 'patty', progress: 1, done: true };
    g.chop = 0.7;
    g.chopKind = 'tomato';
    g.plate = ['bun'];
    g.timeLeft = 118;
    g.score = 1250;
    g.coins = 480;
    g.combo = 2;
    return;
  }
  if (shot === 'serve') {
    const o = spawnOrder(g, DISHES[0]);
    spawnOrder(g, DISHES[1]);
    g.plate = ['bun', 'patty', 'lettuce', 'cheese'];
    g.plateGlow = 1;
    g.timeLeft = 96;
    g.score = 2680;
    g.coins = 930;
    g.combo = 3;
    g.servedFlash = 0.9;
    g.orders[0].cust.mood = 1;
    void o;
    return;
  }
  if (shot === 'rush') {
    spawnOrder(g, DISHES[0]);
    spawnOrder(g, DISHES[1]);
    spawnOrder(g, DISHES[2]);
    spawnOrder(g, DISHES[3]);
    g.orders[0].patience = 0.16;
    g.orders[0].cust.mood = 0.2;
    g.orders[1].patience = 0.42;
    g.grill[0] = { kind: 'patty', progress: 0.8, done: false };
    g.plate = ['bun', 'patty', 'lettuce'];
    g.timeLeft = 22;
    g.score = 2680;
    g.coins = 930;
    g.combo = 4;
    g.hearts = 2;
    return;
  }
  // unknown shot: plain mid-game
  spawnOrder(g, DISHES[0]);
  spawnOrder(g, DISHES[1]);
}

export function shotList() {
  return [
    { name: '1-cover.jpg', query: '?shot=cover&seed=1' },
    { name: '2-cook.jpg', query: '?shot=cook&seed=1' },
    { name: '3-serve.jpg', query: '?shot=serve&seed=1' },
    { name: '4-rush.jpg', query: '?shot=rush&seed=1' },
  ];
}
