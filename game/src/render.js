// Ember Kitchen — the scene: one frame of the whole bistro, top to bottom.
// Layout (1280x800): HUD strip, order tickets, kitchen wall + window, the
// counter with ingredient bins, grill and chopping board, the assembly plate,
// the customer pass on the right. Drawing the room lives in art.js; this file
// places everything and draws the interactive bits.

import { rr, circle, ellipse, shade, drawKitchen, drawIngredient, drawDishOnPlate, drawCustomer, drawTicket } from './art.js';
import { INGREDIENTS, DISHES } from './game.js';

const W = 1280;
const H = 800;

// clickable zones, rebuilt every frame so input.js can hit-test them
export const zones = {
  bins: [], // {kind, x, y, w, h}
  grill: [], // {slot, x, y, w, h}
  tickets: [], // {id, x, y, w, h}
  trash: null,
  serve: null,
  start: null,
  restart: null,
};

function text(ctx, s, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
}

export function render(ctx, g, t) {
  drawKitchen(ctx, W, H, t);
  drawHud(ctx, g, t);
  drawTickets(ctx, g, t);
  drawCounterStations(ctx, g, t);
  drawPlateArea(ctx, g, t);
  drawCustomers(ctx, g, t);
  drawParticles(ctx, g);
  drawFloaters(ctx, g);
  if (g.mode === 'title') drawTitle(ctx, g, t);
  if (g.mode === 'over') drawGameOver(ctx, g, t);
}

function drawHud(ctx, g, t) {
  // dark walnut strip
  ctx.fillStyle = '#2c1c11';
  ctx.fillRect(0, 0, W, 58);
  ctx.fillStyle = 'rgba(255,180,90,.25)';
  ctx.fillRect(0, 58, W, 3);
  // logo
  text(ctx, 'EMBER KITCHEN', 24, 38, 'bold 27px Georgia, serif', '#ffb347');
  text(ctx, 'a cozy bistro rush', 292, 38, 'italic 15px Georgia, serif', '#d9b98a');
  // coins + score
  ctx.fillStyle = '#ffd166';
  circle(ctx, 520, 30, 13); ctx.fill();
  ctx.fillStyle = '#b5542f';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('$', 520, 35);
  text(ctx, String(g.coins), 540, 38, 'bold 22px system-ui, sans-serif', '#ffe9c4');
  text(ctx, 'SCORE ' + g.score, 640, 38, 'bold 20px system-ui, sans-serif', '#fff3dc');
  // combo flame
  if (g.combo >= 2) {
    const pulse = 1 + Math.sin(t * 0.01) * 0.08;
    ctx.save();
    ctx.translate(800, 30);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#ff7e3d';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.quadraticCurveTo(12, -2, 8, 8);
    ctx.quadraticCurveTo(0, 14, -8, 8);
    ctx.quadraticCurveTo(-12, -2, 0, -14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    text(ctx, 'COMBO x' + g.combo, 818, 38, 'bold 19px system-ui, sans-serif', '#ff9d5c');
  }
  // hearts
  for (let i = 0; i < 3; i++) {
    const hx = 1010 + i * 34;
    ctx.fillStyle = i < g.hearts ? '#e8402f' : 'rgba(255,255,255,.18)';
    ctx.beginPath();
    ctx.moveTo(hx, 40);
    ctx.bezierCurveTo(hx - 13, 28, hx - 16, 40, hx, 48);
    ctx.bezierCurveTo(hx + 16, 40, hx + 13, 28, hx, 40);
    ctx.closePath();
    ctx.fill();
  }
  // shift timer
  const tw = 150;
  const tx = W - tw - 24;
  text(ctx, 'SHIFT', tx - 8, 24, 'bold 11px system-ui, sans-serif', '#d9b98a', 'right');
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  rr(ctx, tx, 30, tw, 12, 6);
  ctx.fill();
  const frac = g.timeLeft / g.shiftLength;
  ctx.fillStyle = frac > 0.5 ? '#69b455' : frac > 0.25 ? '#e9b44c' : '#d64533';
  if (frac > 0) {
    rr(ctx, tx, 30, Math.max(12, tw * frac), 12, 6);
    ctx.fill();
  }
  const mm = Math.floor(g.timeLeft / 60);
  const ss = String(Math.floor(g.timeLeft % 60)).padStart(2, '0');
  text(ctx, `${mm}:${ss}`, tx + tw / 2, 53, 'bold 12px system-ui, sans-serif', '#ffe9c4', 'center');
}

function drawTickets(ctx, g, t) {
  zones.tickets = [];
  text(ctx, 'ORDER BOARD', 24, 64, 'bold 13px system-ui, sans-serif', '#8a5a2e');
  const tw = 236;
  const gap = 14;
  g.orders.forEach((o, i) => {
    const x = 24 + i * (tw + gap);
    const y = 70;
    drawTicket(ctx, o, x, y, tw, 84, t);
    zones.tickets.push({ id: o.id, x, y, w: tw, h: 84 });
  });
  if (g.orders.length === 0 && g.mode === 'play') {
    text(ctx, 'No orders yet — the dinner rush is coming…', 24, 110, 'italic 16px Georgia, serif', '#8a5a2e');
  }
}

function drawCounterStations(ctx, g, t) {
  // section labels above the counter
  text(ctx, 'PANTRY — click to add', 24, 366, 'bold 13px system-ui, sans-serif', '#8a5a2e');
  text(ctx, 'GRILL — patties take 4s', 600, 366, 'bold 13px system-ui, sans-serif', '#8a5a2e');
  text(ctx, 'CHOPPING BOARD', 880, 366, 'bold 13px system-ui, sans-serif', '#8a5a2e');

  // ingredient bins (wooden crates on the counter)
  zones.bins = [];
  INGREDIENTS.forEach((ing, i) => {
    const bx = 24 + i * 92;
    const by = 374;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    rr(ctx, bx + 3, by + 4, 84, 96, 12);
    ctx.fill();
    ctx.fillStyle = '#fff3dc';
    rr(ctx, bx, by, 84, 96, 12);
    ctx.fill();
    ctx.fillStyle = '#e8dcc4';
    rr(ctx, bx, by + 70, 84, 26, 10);
    ctx.fill();
    drawIngredient(ctx, ing.kind, bx + 42, by + 34, 0.95, { cooked: false });
    text(ctx, ing.name, bx + 42, by + 88, 'bold 12px system-ui, sans-serif', '#5d3a24', 'center');
    text(ctx, '[' + ing.key + ']', bx + 74, by + 16, 'bold 11px system-ui, sans-serif', '#a8845c', 'center');
    zones.bins.push({ kind: ing.kind, x: bx, y: by, w: 84, h: 96 });
  });

  // grill: two iron slots with flames
  zones.grill = [];
  for (let slot = 0; slot < 2; slot++) {
    const gx = 600 + slot * 130;
    const gy = 374;
    // iron plate
    ctx.fillStyle = '#2e2a28';
    rr(ctx, gx, gy, 118, 96, 12);
    ctx.fill();
    // grate lines
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.lineWidth = 3;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(gx + 8, gy + i * 19); ctx.lineTo(gx + 110, gy + i * 19); ctx.stroke();
    }
    const s = g.grill[slot];
    if (s) {
      // glow under the patty
      const glow = ctx.createRadialGradient(gx + 59, gy + 48, 4, gx + 59, gy + 48, 60);
      glow.addColorStop(0, 'rgba(255,140,50,.55)');
      glow.addColorStop(1, 'rgba(255,140,50,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(gx, gy, 118, 96);
      drawIngredient(ctx, 'patty', gx + 59, gy + 44, 1.0, { cooked: s.done });
      // flame licks
      const fl = Math.sin(t * 0.02 + slot * 3) * 3;
      ctx.fillStyle = 'rgba(255,170,60,.85)';
      ctx.beginPath();
      ctx.moveTo(gx + 30, gy + 88);
      ctx.quadraticCurveTo(gx + 36, gy + 66 + fl, gx + 46, gy + 88);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(gx + 74, gy + 88);
      ctx.quadraticCurveTo(gx + 80, gy + 70 - fl, gx + 90, gy + 88);
      ctx.closePath();
      ctx.fill();
      // progress ring
      ctx.strokeStyle = 'rgba(255,255,255,.3)';
      ctx.lineWidth = 5;
      circle(ctx, gx + 59, gy + 44, 34);
      ctx.stroke();
      ctx.strokeStyle = s.done ? '#69b455' : '#ffb347';
      ctx.beginPath();
      ctx.arc(gx + 59, gy + 44, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.progress);
      ctx.stroke();
      if (s.done) text(ctx, 'READY', gx + 59, gy + 88, 'bold 12px system-ui, sans-serif', '#9be7c4', 'center');
    } else {
      text(ctx, 'empty', gx + 59, gy + 52, 'italic 14px Georgia, serif', 'rgba(255,255,255,.4)', 'center');
    }
    zones.grill.push({ slot, x: gx, y: gy, w: 118, h: 96 });
  }

  // chopping board with knife
  const cx = 880;
  const cy = 374;
  ctx.fillStyle = '#d9b98a';
  rr(ctx, cx, cy, 240, 96, 12);
  ctx.fill();
  ctx.fillStyle = '#c9a06a';
  rr(ctx, cx, cy + 70, 240, 26, 10);
  ctx.fill();
  // knife
  const chopAngle = g.chop > 0 ? Math.sin(g.chop * Math.PI) * -0.9 : -0.25;
  ctx.save();
  ctx.translate(cx + 180, cy + 26);
  ctx.rotate(chopAngle);
  ctx.fillStyle = '#c8ccd4';
  ctx.beginPath();
  ctx.moveTo(0, -6); ctx.lineTo(52, -6); ctx.lineTo(58, 0); ctx.lineTo(52, 6); ctx.lineTo(0, 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5d3a24';
  rr(ctx, -26, -6, 28, 12, 5);
  ctx.fill();
  ctx.restore();
  // what is being chopped
  if (g.chopKind && g.chop > 0) {
    drawIngredient(ctx, g.chopKind, cx + 70, cy + 44, 1.1);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 3; i++) {
      circle(ctx, cx + 46 + i * 22, cy + 62, 2.5);
      ctx.fill();
    }
  } else {
    text(ctx, 'chop tomato & lettuce here', cx + 120, cy + 50, 'italic 14px Georgia, serif', '#8a6a42', 'center');
  }
}

function drawPlateArea(ctx, g, t) {
  // the assembly plate, big and centre-stage
  const px = 640;
  const py = 650;
  const shake = g.plateShake > 0 ? Math.sin(t * 0.09) * 6 * g.plateShake : 0;
  ctx.save();
  ctx.translate(shake, 0);
  text(ctx, 'YOUR PLATE — build the dish, then click its ticket to serve', px, 560, 'bold 14px system-ui, sans-serif', '#f3e2c2', 'center');
  drawDishOnPlate(ctx, g.plate, px, py, 1.3, g.plateGlow > 0.3);
  // recipe hint: what the first ticket needs
  const first = g.orders[0];
  if (first && g.mode === 'play') {
    const missing = first.recipe.filter((r) => !g.plate.includes(r));
    const extra = g.plate.filter((p) => !first.recipe.includes(p));
    let hint = 'Ticket #' + first.id + ' needs: ' + first.recipe.join(' + ');
    if (extra.length) hint = 'That plate has ' + extra.join(', ') + ' — not in this dish. Trash it (T).';
    else if (missing.length) hint = 'Ticket #' + first.id + ' still needs: ' + missing.join(' + ');
    else hint = 'Perfect match — click ticket #' + first.id + ' to serve!';
    text(ctx, hint, px, 740, '15px system-ui, sans-serif', extra.length ? '#ff9d8f' : '#ffe9c4', 'center');
  }
  ctx.restore();
  // trash button
  const tx = 950;
  const ty = 600;
  ctx.fillStyle = '#5d3a24';
  rr(ctx, tx, ty, 110, 52, 10);
  ctx.fill();
  text(ctx, 'TRASH  [T]', tx + 55, ty + 32, 'bold 15px system-ui, sans-serif', '#ffe9c4', 'center');
  zones.trash = { x: tx, y: ty, w: 110, h: 52 };
  // serve button
  const sx = 950;
  const sy = 664;
  const canServe = g.orders.some((o) => {
    const a = [...g.plate].sort();
    const b = [...o.recipe].sort();
    return a.length === b.length && a.every((v, i) => v === b[i]);
  });
  ctx.fillStyle = canServe ? '#2f7d32' : '#6b4a2f';
  rr(ctx, sx, sy, 110, 52, 10);
  ctx.fill();
  text(ctx, 'SERVE  [Space]', sx + 55, sy + 32, 'bold 14px system-ui, sans-serif', '#fff3dc', 'center');
  zones.serve = { x: sx, y: sy, w: 110, h: 52 };
}

function drawCustomers(ctx, g, t) {
  // the pass window: customers wait on the right, behind the counter
  text(ctx, 'AT THE PASS', 1180, 536, 'bold 13px system-ui, sans-serif', '#f3e2c2', 'center');
  ctx.fillStyle = '#3a2415';
  rr(ctx, 1096, 548, 164, 150, 12);
  ctx.fill();
  ctx.fillStyle = '#fff3dc';
  rr(ctx, 1104, 556, 148, 134, 9);
  ctx.fill();
  const shown = g.customers.slice(0, 2);
  shown.forEach((c, i) => {
    const cx = 1148 + i * 64;
    drawCustomer(ctx, c, cx, 640, 0.82, t);
    // mood ring under each customer
    ctx.strokeStyle = 'rgba(0,0,0,.15)';
    ctx.lineWidth = 4;
    circle(ctx, cx, 684, 12);
    ctx.stroke();
    ctx.strokeStyle = c.mood > 0.55 ? '#69b455' : c.mood > 0.3 ? '#e9b44c' : '#d64533';
    ctx.beginPath();
    ctx.arc(cx, 684, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * c.mood);
    ctx.stroke();
  });
  if (shown.length === 0) {
    text(ctx, 'no one waiting', 1180, 620, 'italic 14px Georgia, serif', '#8a5a2e', 'center');
  }
  // tip jar under the pass
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  rr(ctx, 1104, 712, 148, 56, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  text(ctx, 'TIPS  $' + g.coins, 1178, 746, 'bold 18px system-ui, sans-serif', '#3a2415', 'center');
}

function drawParticles(ctx, g) {
  for (const p of g.particles) {
    const a = 1 - p.age / p.life;
    if (p.kind === 'steam') {
      ctx.fillStyle = `rgba(255,255,255,${0.45 * a})`;
      circle(ctx, p.x, p.y, p.size * (1 + p.age));
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      circle(ctx, p.x, p.y, p.size);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

function drawFloaters(ctx, g) {
  for (const f of g.floaters) {
    const a = 1 - f.age / f.life;
    ctx.globalAlpha = Math.min(1, a * 1.4);
    text(ctx, f.text, f.x, f.y, 'bold 24px system-ui, sans-serif', f.color, 'center');
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, g, t) {
  ctx.fillStyle = 'rgba(29,19,14,.62)';
  ctx.fillRect(0, 0, W, H);
  // menu card
  ctx.fillStyle = '#fff3dc';
  rr(ctx, 340, 150, 600, 450, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9b98a';
  ctx.lineWidth = 3;
  rr(ctx, 354, 164, 572, 422, 12);
  ctx.stroke();
  drawDishOnPlate(ctx, ['bun', 'patty', 'lettuce', 'cheese'], 640, 268, 1.25, true);
  text(ctx, 'EMBER KITCHEN', 640, 350, 'bold 52px Georgia, serif', '#b5542f', 'center');
  text(ctx, 'a cozy bistro rush', 640, 384, 'italic 22px Georgia, serif', '#8a5a2e', 'center');
  text(ctx, 'Orders roll in. Grill the patties, chop the veg,', 640, 428, '17px system-ui, sans-serif', '#5d3a24', 'center');
  text(ctx, 'build each plate to match its ticket — and serve', 640, 452, '17px system-ui, sans-serif', '#5d3a24', 'center');
  text(ctx, 'it before the customer walks out.', 640, 476, '17px system-ui, sans-serif', '#5d3a24', 'center');
  const pulse = 1 + Math.sin(t * 0.004) * 0.04;
  ctx.save();
  ctx.translate(640, 512);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#d64533';
  rr(ctx, -130, -26, 260, 52, 26);
  ctx.fill();
  text(ctx, 'START SHIFT', 0, 9, 'bold 22px system-ui, sans-serif', '#fff3dc', 'center');
  ctx.restore();
  zones.start = { x: 510, y: 486, w: 260, h: 52 };
  text(ctx, '150 seconds a shift · 3 strikes and the night is over', 640, 580, '13px system-ui, sans-serif', '#a8845c', 'center');
}

function drawGameOver(ctx, g, t) {
  ctx.fillStyle = 'rgba(29,19,14,.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff3dc';
  rr(ctx, 380, 190, 520, 380, 18);
  ctx.fill();
  text(ctx, 'SHIFT OVER', 640, 268, 'bold 44px Georgia, serif', '#b5542f', 'center');
  text(ctx, 'The bistro closes its doors for the night.', 640, 300, 'italic 17px Georgia, serif', '#8a5a2e', 'center');
  const rows = [
    ['Dishes served', String(g.served)],
    ['Orders lost', String(g.lost)],
    ['Best combo', 'x' + Math.max(1, g.bestCombo)],
    ['Tips earned', '$' + g.coins],
    ['Final score', String(g.score)],
  ];
  rows.forEach(([k, v], i) => {
    const y = 350 + i * 34;
    text(ctx, k, 440, y, '16px system-ui, sans-serif', '#5d3a24');
    text(ctx, v, 840, y, 'bold 17px system-ui, sans-serif', '#3a2415', 'right');
  });
  ctx.fillStyle = '#2f7d32';
  rr(ctx, 510, 512, 260, 52, 26);
  ctx.fill();
  text(ctx, 'COOK AGAIN  [R]', 640, 545, 'bold 20px system-ui, sans-serif', '#fff3dc', 'center');
  zones.restart = { x: 510, y: 512, w: 260, h: 52 };
}
