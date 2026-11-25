// Ember Kitchen — all the pictures: kitchen, food, customers, tickets.
// Every picture is drawn with canvas vector shapes and gradients: no photos,
// no emoji, no downloaded art. One file, one job: make the game look like a
// warm little bistro at sunset.

export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

export function shade(ctx, x, y, w, h, c1, c2, vertical = true) {
  const g = vertical
    ? ctx.createLinearGradient(x, y, x, y + h)
    : ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function radial(ctx, x, y, r0, r1, c1, c2) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
}

// ---- the kitchen room -------------------------------------------------------

export function drawKitchen(ctx, W, H, t) {
  // plaster wall
  shade(ctx, 0, 0, W, 470, '#f7e3c2', '#eecfa4');
  drawWindow(ctx, 1050, 150, 190, 210, t);
  drawShelf(ctx, 420, 190);
  drawPots(ctx, 700, 190);
  drawCounter(ctx, 0, 470, W, H - 470);
  drawFrontDecor(ctx, W, H);
}

function drawWindow(ctx, x, y, w, h, t) {
  ctx.save();
  // frame
  ctx.fillStyle = '#6b3a24';
  rr(ctx, x - 12, y - 12, w + 24, h + 24, 18);
  ctx.fill();
  // sunset sky
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#ff9d5c');
  sky.addColorStop(0.55, '#ff7e6b');
  sky.addColorStop(1, '#c65d7b');
  ctx.fillStyle = sky;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.save();
  rr(ctx, x, y, w, h, 10);
  ctx.clip();
  // sun, low and slow
  const sunY = y + h * 0.62 + Math.sin(t * 0.00008) * 6;
  radial(ctx, x + w * 0.68, sunY, 8, 90, 'rgba(255,236,170,.95)', 'rgba(255,236,170,0)');
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, x + w * 0.68, sunY, 34);
  ctx.fill();
  // rooftops
  ctx.fillStyle = '#7c3f56';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * 0.78);
  ctx.lineTo(x + 70, y + h * 0.66);
  ctx.lineTo(x + 150, y + h * 0.78);
  ctx.lineTo(x + 210, y + h * 0.62);
  ctx.lineTo(x + w, y + h * 0.76);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  // lit windows on the rooftops
  ctx.fillStyle = 'rgba(255,214,130,.9)';
  [[38, 236], [118, 252], [196, 228], [258, 248]].forEach(([wx, wy]) => {
    ctx.fillRect(x + wx, y + wy, 12, 16);
  });
  // string lights across the window
  ctx.strokeStyle = 'rgba(60,25,15,.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 26);
  ctx.quadraticCurveTo(x + w / 2, y + 58, x + w - 8, y + 22);
  ctx.stroke();
  for (let i = 0; i <= 8; i++) {
    const px = x + 10 + (i / 8) * (w - 20);
    const py = y + 26 + Math.sin((i / 8) * Math.PI) * 26;
    ctx.fillStyle = ['#ffd166', '#ff8fa3', '#9be7c4'][i % 3];
    circle(ctx, px, py + 7, 5);
    ctx.fill();
  }
  ctx.restore();
  // mullions
  ctx.fillStyle = '#6b3a24';
  ctx.fillRect(x + w / 2 - 4, y, 8, h);
  ctx.fillRect(x, y + h / 2 - 4, w, 8);
  ctx.restore();
}

function drawShelf(ctx, x, y) {
  ctx.fillStyle = '#5d3a24';
  rr(ctx, x, y + 118, 250, 12, 4);
  ctx.fill();
  // jars of spices and pickles
  const jars = [
    ['#e07856', 34], ['#e9b44c', 30], ['#7fb069', 36], ['#c65d7b', 28], ['#e07856', 32],
  ];
  jars.forEach(([c, jh], i) => {
    const jx = x + 12 + i * 48;
    const jy = y + 118 - jh;
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    rr(ctx, jx, jy, 38, jh, 8);
    ctx.fill();
    ctx.fillStyle = c;
    rr(ctx, jx + 3, jy + 6, 32, jh - 9, 6);
    ctx.fill();
    ctx.fillStyle = '#4a2c17';
    rr(ctx, jx + 8, jy - 6, 22, 9, 3);
    ctx.fill();
  });
  // a small potted herb
  ctx.fillStyle = '#b5542f';
  ctx.beginPath();
  ctx.moveTo(x + 216, y + 118); ctx.lineTo(x + 244, y + 118);
  ctx.lineTo(x + 239, y + 92); ctx.lineTo(x + 221, y + 92);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4e9b47';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  [[228, 88], [234, 82], [224, 80]].forEach(([lx, ly]) => {
    ctx.beginPath(); ctx.moveTo(230, 92); ctx.quadraticCurveTo(lx, ly + 4, lx, ly); ctx.stroke();
  });
}

function drawPots(ctx, x, y, t) {
  // rail
  ctx.fillStyle = '#3f2a1a';
  ctx.fillRect(x, y, 250, 8);
  [0, 1, 2].forEach((i) => {
    const px = x + 40 + i * 85;
    const sway = Math.sin(t * 0.001 + i * 2) * 2;
    // hook
    ctx.strokeStyle = '#3f2a1a';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, y + 8); ctx.lineTo(px, y + 26); ctx.stroke();
    // copper pot
    const g = ctx.createLinearGradient(px - 30, 0, px + 30, 0);
    g.addColorStop(0, '#b45a2e'); g.addColorStop(0.5, '#e08a4e'); g.addColorStop(1, '#8f3f1c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(px - 30, y + 26);
    ctx.lineTo(px + 30, y + 26);
    ctx.lineTo(px + 24, y + 78);
    ctx.quadraticCurveTo(px, y + 88, px - 24, y + 78);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ellipse(ctx, px - 12 + sway, y + 44, 8, 14);
    ctx.fill();
  });
}

function drawFrontDecor(ctx, W, H) {
  // chalkboard menu on the counter front, left
  ctx.fillStyle = '#2e2a28';
  rr(ctx, 56, 600, 230, 140, 10);
  ctx.fill();
  ctx.strokeStyle = '#8a6a42';
  ctx.lineWidth = 3;
  rr(ctx, 64, 608, 214, 124, 7);
  ctx.stroke();
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText("TODAY'S MENU", 171, 632);
  ctx.font = '14px Georgia, serif';
  ctx.fillStyle = '#f3e2c2';
  ctx.fillText('Ember Burger — $14', 171, 660);
  ctx.fillText('Sunset Pasta — $12', 171, 684);
  ctx.fillText('Garden Bowl — $9', 171, 708);
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillStyle = '#d9b98a';
  ctx.fillText('served with a smile', 171, 724);
  // stack of clean plates
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? '#efe8d8' : '#fbf7ef';
    ellipse(ctx, 360, 726 - i * 9, 52, 10);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ellipse(ctx, 364, 730, 52, 10);
  ctx.fill();
}

function drawCounter(ctx, x, y, w, h) {
  // wooden counter top
  const g = ctx.createLinearGradient(0, y, 0, y + 46);
  g.addColorStop(0, '#a9713f');
  g.addColorStop(0.5, '#8a5a2e');
  g.addColorStop(1, '#6f4522');
  ctx.fillStyle = g;
  rr(ctx, x - 10, y, w + 20, 46, 10);
  ctx.fill();
  // wood grain
  ctx.save();
  ctx.strokeStyle = 'rgba(60,32,10,.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(20, y + 8 + i * 8);
    ctx.bezierCurveTo(300, y + 4 + i * 8, 700, y + 12 + i * 8, w - 20, y + 7 + i * 8);
    ctx.stroke();
  }
  ctx.restore();
  // counter front
  shade(ctx, x, y + 46, w, h - 46, '#7c4f2c', '#5e3a1f');
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = 3;
  for (let px = 120; px < w; px += 160) {
    ctx.beginPath(); ctx.moveTo(px, y + 46); ctx.lineTo(px, y + h); ctx.stroke();
  }
  // tile strip along the top of the front
  ctx.fillStyle = '#c96f4a';
  ctx.fillRect(x, y + 46, w, 10);
  ctx.strokeStyle = 'rgba(255,235,200,.3)';
  ctx.lineWidth = 2;
  for (let tx = 32; tx < w; tx += 64) {
    ctx.beginPath(); ctx.moveTo(tx, y + 46); ctx.lineTo(tx, y + 56); ctx.stroke();
  }
  ctx.restore();
}

// ---- food, drawn piece by piece ---------------------------------------------

export function drawIngredient(ctx, kind, x, y, s, opts = {}) {
  ctx.save();
  ctx.translate(x, y);
  const k = opts.small ? 0.8 : 1;
  ctx.scale(s * k, s * k);
  switch (kind) {
    case 'bun': drawBun(ctx); break;
    case 'patty': drawPatty(ctx, opts.cooked); break;
    case 'lettuce': drawLettuce(ctx); break;
    case 'tomato': drawTomato(ctx); break;
    case 'cheese': drawCheese(ctx); break;
    case 'pasta': drawPasta(ctx); break;
    default: break;
  }
  ctx.restore();
}

function drawBun(ctx) {
  // bottom bun
  ctx.fillStyle = '#e8a94e';
  rr(ctx, -26, 2, 52, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#c98a2e';
  rr(ctx, -26, 10, 52, 6, 3);
  ctx.fill();
  // dome
  const g = ctx.createLinearGradient(0, -30, 0, 6);
  g.addColorStop(0, '#f6c26b');
  g.addColorStop(1, '#dd9434');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-26, 2);
  ctx.quadraticCurveTo(0, -36, 26, 2);
  ctx.closePath();
  ctx.fill();
  // sesame
  ctx.fillStyle = '#ffedbe';
  [[-14, -16], [0, -22], [13, -15], [-6, -8], [8, -7]].forEach(([sx, sy]) => {
    ellipse(ctx, sx, sy, 3, 2);
    ctx.fill();
  });
}

function drawPatty(ctx, cooked = true) {
  const g = ctx.createLinearGradient(0, -10, 0, 10);
  if (cooked) {
    g.addColorStop(0, '#8a5a34');
    g.addColorStop(1, '#5f3a1e');
  } else {
    g.addColorStop(0, '#c07a4a');
    g.addColorStop(1, '#96502e');
  }
  ctx.fillStyle = g;
  rr(ctx, -28, -11, 56, 22, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,18,6,.5)';
  ctx.lineWidth = 2;
  [-14, 0, 14].forEach((gx) => {
    ctx.beginPath(); ctx.moveTo(gx, -9); ctx.lineTo(gx, 9); ctx.stroke();
  });
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ellipse(ctx, -10, -5, 12, 3);
  ctx.fill();
}

function drawLettuce(ctx) {
  ctx.fillStyle = '#69b455';
  ctx.beginPath();
  ctx.moveTo(-28, 6);
  ctx.bezierCurveTo(-30, -14, -12, -22, 0, -12);
  ctx.bezierCurveTo(12, -22, 30, -14, 28, 6);
  ctx.bezierCurveTo(14, 12, -14, 12, -28, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3f8f37';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, -4); ctx.quadraticCurveTo(0, 0, 14, -4); ctx.stroke();
}

function drawTomato(ctx) {
  const g = ctx.createRadialGradient(-6, -6, 4, 0, 0, 26);
  g.addColorStop(0, '#ff8a7a');
  g.addColorStop(0.6, '#e8402f');
  g.addColorStop(1, '#b02318');
  ctx.fillStyle = g;
  circle(ctx, 0, 0, 26);
  ctx.fill();
  ctx.fillStyle = '#ff9d8f';
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(12, -2, 14, 8);
  ctx.quadraticCurveTo(4, 14, 0, 8);
  ctx.quadraticCurveTo(-10, 12, -14, 2);
  ctx.quadraticCurveTo(-10, -6, 0, -4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd9d2';
  [[-6, -2], [6, 4], [-2, 8]].forEach(([sx, sy]) => { circle(ctx, sx, sy, 2); ctx.fill(); });
  // stem
  ctx.strokeStyle = '#3f8f37';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -18); ctx.stroke();
}

function drawCheese(ctx) {
  ctx.save();
  ctx.rotate(-0.12);
  const g = ctx.createLinearGradient(-24, -20, 24, 20);
  g.addColorStop(0, '#ffd94d');
  g.addColorStop(1, '#f0a81e');
  ctx.fillStyle = g;
  rr(ctx, -24, -18, 48, 36, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,120,10,.55)';
  [[-12, -8], [8, -4], [-2, 8], [14, 10]].forEach(([hx, hy]) => {
    circle(ctx, hx, hy, 3.4);
    ctx.fill();
  });
  ctx.restore();
}

function drawPasta(ctx) {
  // bowl
  ctx.fillStyle = '#f3ede0';
  ctx.beginPath();
  ctx.moveTo(-30, -6);
  ctx.quadraticCurveTo(0, 26, 30, -6);
  ctx.quadraticCurveTo(0, 2, -30, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8cbb2';
  ellipse(ctx, 0, -6, 30, 7);
  ctx.fill();
  // pasta swirls
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-10, -10, 10, 0.6, 4.4); ctx.stroke();
  ctx.beginPath(); ctx.arc(8, -12, 9, 2.2, 6.0); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -8, 12, 3.4, 5.6); ctx.stroke();
  // sauce drizzle
  ctx.strokeStyle = '#d64533';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-16, -14); ctx.quadraticCurveTo(0, -20, 16, -12); ctx.stroke();
  // basil
  ctx.fillStyle = '#3f8f37';
  ellipse(ctx, 12, -18, 6, 3.4);
  ctx.fill();
}

// a finished dish on a plate, drawn from its recipe parts
export function drawDishOnPlate(ctx, parts, x, y, s, glow = false) {
  ctx.save();
  ctx.translate(x, y);
  if (glow) {
    radial(ctx, 0, 0, 10, 90 * s, 'rgba(255,214,110,.55)', 'rgba(255,214,110,0)');
    circle(ctx, 0, 0, 88 * s);
    ctx.fill();
  }
  // plate
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ellipse(ctx, 3, 26 * s, 66 * s, 12 * s);
  ctx.fill();
  ctx.fillStyle = '#fbf7ef';
  ellipse(ctx, 0, 18 * s, 64 * s, 20 * s);
  ctx.fill();
  ctx.fillStyle = '#e3d9c4';
  ellipse(ctx, 0, 18 * s, 50 * s, 14 * s);
  ctx.fill();
  // stack the parts, bottom to top
  const order = ['pasta', 'bun', 'patty', 'cheese', 'lettuce', 'tomato'];
  let dy = 14 * s;
  const sorted = [...parts].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  sorted.forEach((p) => {
    ctx.save();
    ctx.translate(0, dy);
    ctx.scale(s, s);
    if (p === 'tomato') ctx.scale(0.72, 0.72); // a slice on the stack, not a ball
    if (p === 'bun') drawBun(ctx);
    else if (p === 'patty') drawPatty(ctx, true);
    else if (p === 'lettuce') drawLettuce(ctx);
    else if (p === 'tomato') drawTomato(ctx);
    else if (p === 'cheese') drawCheese(ctx);
    else if (p === 'pasta') drawPasta(ctx);
    ctx.restore();
    dy -= p === 'pasta' ? 4 * s : 13 * s;
  });
  ctx.restore();
}

// ---- customers ----------------------------------------------------------------

export function drawCustomer(ctx, cust, x, y, s, t) {
  // cust: { skin, hair, hairColor, shirt, mood } mood 0..1 (1 = happy)
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const bob = Math.sin(t * 0.002 + cust.phase) * 2;
  // body
  ctx.fillStyle = cust.shirt;
  rr(ctx, -26, 8 + bob, 52, 46, 16);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  rr(ctx, -26, 8 + bob, 52, 12, 8);
  ctx.fill();
  // head
  ctx.fillStyle = cust.skin;
  circle(ctx, 0, -14 + bob, 22);
  ctx.fill();
  // hair
  ctx.fillStyle = cust.hairColor;
  ctx.beginPath();
  if (cust.hair === 'bun') {
    ctx.arc(0, -20 + bob, 22, Math.PI, 0);
    ctx.fill();
    circle(ctx, 0, -38 + bob, 9);
    ctx.fill();
  } else if (cust.hair === 'curly') {
    [[-16, -26], [-6, -32], [6, -32], [16, -26], [0, -34]].forEach(([hx, hy]) => {
      circle(ctx, hx, hy + bob, 9);
      ctx.fill();
    });
  } else {
    ctx.arc(0, -18 + bob, 22, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
  }
  // face
  ctx.fillStyle = '#241a12';
  const eyeY = -16 + bob;
  const worried = cust.mood < 0.45;
  if (worried) {
    // impatient: flat brows, small frown
    ctx.fillRect(-11, eyeY - 8, 8, 2);
    ctx.fillRect(3, eyeY - 8, 8, 2);
  }
  circle(ctx, -8, eyeY, 2.4); ctx.fill();
  circle(ctx, 8, eyeY, 2.4); ctx.fill();
  ctx.strokeStyle = '#241a12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (cust.mood > 0.6) ctx.arc(0, eyeY + 6, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (worried) ctx.arc(0, eyeY + 14, 6, 1.15 * Math.PI, 1.85 * Math.PI);
  else ctx.moveTo(-5, eyeY + 10), ctx.lineTo(5, eyeY + 10);
  ctx.stroke();
  // blush when happy
  if (cust.mood > 0.6) {
    ctx.fillStyle = 'rgba(255,120,120,.45)';
    circle(ctx, -14, eyeY + 4, 4); ctx.fill();
    circle(ctx, 14, eyeY + 4, 4); ctx.fill();
  }
  ctx.restore();
}

// ---- order ticket ---------------------------------------------------------------

export function drawTicket(ctx, ticket, x, y, w, h, t) {
  ctx.save();
  const urgent = ticket.patience < 0.3;
  const flash = urgent && Math.sin(t * 0.012) > 0;
  // card
  ctx.fillStyle = flash ? '#ffe3de' : '#fff8ea';
  ctx.strokeStyle = urgent ? '#d64533' : '#d9b98a';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.stroke();
  // punched top edge
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(x + 8, y, w - 16, 4);
  // dish thumbnail
  drawDishOnPlate(ctx, ticket.recipe, x + 38, y + 42, 0.78);
  // name + price
  ctx.fillStyle = '#3a2415';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(ticket.name, x + 84, y + 30);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#b5542f';
  ctx.fillText('$' + ticket.price.toFixed(2), x + 84, y + 52);
  // patience bar
  const bw = w - 96;
  ctx.fillStyle = '#e8dcc4';
  rr(ctx, x + 84, y + 62, bw, 9, 4);
  ctx.fill();
  ctx.fillStyle = ticket.patience > 0.55 ? '#69b455' : ticket.patience > 0.3 ? '#e9b44c' : '#d64533';
  if (ticket.patience > 0) {
    rr(ctx, x + 84, y + 62, Math.max(10, bw * ticket.patience), 9, 4);
    ctx.fill();
  }
  // order number
  ctx.fillStyle = '#a8845c';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('#' + ticket.id, x + w - 40, y + 18);
  ctx.restore();
}
