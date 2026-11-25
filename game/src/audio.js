// Ember Kitchen — tiny kitchen sounds, synthesized with WebAudio.
// No audio files: every sound is an oscillator, so the game stays offline
// and self-contained. Sounds are best-effort; silence never breaks play.

export function makeAudio() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function tone(freq, dur, type = 'sine', vol = 0.08, slide = 0) {
    const ac = ensure();
    if (!ac) return;
    try {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ac.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ac.currentTime + dur);
      g.gain.setValueAtTime(vol, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g).connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + dur);
    } catch {
      // sound is garnish; never let it break the game
    }
  }
  return {
    blip(freq = 440) {
      tone(freq, 0.09, 'triangle', 0.07);
    },
    chop(kind) {
      if (kind === 'tomato' || kind === 'lettuce') {
        tone(190, 0.07, 'square', 0.05, -60);
        setTimeout(() => tone(150, 0.06, 'square', 0.04, -40), 70);
      } else {
        tone(320, 0.08, 'triangle', 0.06);
      }
    },
    serve() {
      tone(523, 0.1, 'triangle', 0.08);
      setTimeout(() => tone(659, 0.1, 'triangle', 0.08), 90);
      setTimeout(() => tone(784, 0.16, 'triangle', 0.09), 180);
    },
  };
}
