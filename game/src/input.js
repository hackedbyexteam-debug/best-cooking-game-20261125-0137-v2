// Ember Kitchen — mouse and keyboard: every click and key, in one place.

import { zones } from './render.js';
import { INGREDIENTS, addIngredient, takePatty, clearPlate, serveOrder, serveFirstMatch, startShift } from './game.js';

function hit(x, y, z) {
  return z && x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
}

export function bindInput(canvas, g, audio) {
  function toGame(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 1280,
      y: ((e.clientY - r.top) / r.height) * 800,
    };
  }

  canvas.addEventListener('click', (e) => {
    const { x, y } = toGame(e);
    clickAt(g, x, y, audio);
  });

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (g.mode === 'title' && (k === 'enter' || k === ' ')) {
      startShift(g);
      audio.blip(660);
      return;
    }
    if (g.mode === 'over' && (k === 'r' || k === 'enter' || k === ' ')) {
      startShift(g);
      audio.blip(660);
      return;
    }
    if (g.mode !== 'play') return;
    const ing = INGREDIENTS.find((i) => i.key === k);
    if (ing) {
      if (addIngredient(g, ing.kind)) audio.chop(ing.kind);
      return;
    }
    if (k === 'g') {
      const slot = g.grill.findIndex((s) => s && s.done);
      if (slot !== -1 && takePatty(g, slot)) audio.blip(520);
      return;
    }
    if (k === 't') {
      clearPlate(g);
      audio.blip(220);
      return;
    }
    if (k === ' ') {
      e.preventDefault();
      if (serveFirstMatch(g)) audio.serve();
      return;
    }
  });
}

export function clickAt(g, x, y, audio) {
  if (g.mode === 'title') {
    if (hit(x, y, zones.start)) {
      startShift(g);
      audio.blip(660);
    }
    return;
  }
  if (g.mode === 'over') {
    if (hit(x, y, zones.restart)) {
      startShift(g);
      audio.blip(660);
    }
    return;
  }
  if (g.mode !== 'play') return;
  for (const b of zones.bins) {
    if (hit(x, y, b)) {
      if (addIngredient(g, b.kind)) audio.chop(b.kind);
      return;
    }
  }
  for (const gr of zones.grill) {
    if (hit(x, y, gr)) {
      if (takePatty(g, gr.slot)) audio.blip(520);
      return;
    }
  }
  for (const tk of zones.tickets) {
    if (hit(x, y, tk)) {
      if (serveOrder(g, tk.id)) audio.serve();
      else audio.blip(180);
      return;
    }
  }
  if (hit(x, y, zones.trash)) {
    clearPlate(g);
    audio.blip(220);
    return;
  }
  if (hit(x, y, zones.serve)) {
    if (serveFirstMatch(g)) audio.serve();
    return;
  }
}
