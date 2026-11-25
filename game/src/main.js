// Ember Kitchen — boot and frame loop.
// One file, one job: run the game. State lives in game.js, pictures in
// art.js and render.js, input in input.js, sounds in audio.js, staged
// screenshot scenes in shots.js.

import { newGame, update, startShift } from './game.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { makeAudio } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const audio = makeAudio();

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || '1') || 1;
const g = newGame(seed);
bindInput(canvas, g, audio);

const shot = params.get('shot');
if (shot) {
  applyShot(g, shot, seed);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  // staged shots freeze the clock: the scene stays exactly as built
  if (!shot) update(g, dt);
  else {
    g.time += dt;
    g.particles = g.particles.filter((p) => (p.age += dt) < p.life);
    for (const p of g.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }
  render(ctx, g, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// The title screen is the front door: a click on START begins the shift.
// (The button zone is drawn by render.js; input.js handles the click.)
window.__ember = { game: g, startShift: () => startShift(g) };
