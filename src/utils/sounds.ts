let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    _ctx = new AC();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function note(
  freq: number,
  startOffset: number,
  dur: number,
  vol: number,
  type: OscillatorType = 'sine',
) {
  try {
    const c = ctx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + startOffset);
    gain.gain.linearRampToValueAtTime(vol, now + startOffset + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + dur);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + dur + 0.05);
  } catch {
    // Silently swallow audio errors
  }
}

/** Focus session complete — ascending triumphant chime */
function focusComplete(vol: number) {
  const v = (vol / 100) * 0.28;
  note(523.25, 0.00, 0.18, v);
  note(659.25, 0.14, 0.18, v);
  note(783.99, 0.28, 0.20, v);
  note(1046.50, 0.44, 0.55, v);
  note(1318.51, 0.60, 0.65, v * 0.65);
}

/** Break over — warm descending nudge */
function breakEnd(vol: number) {
  const v = (vol / 100) * 0.28;
  note(783.99, 0.00, 0.15, v);
  note(659.25, 0.18, 0.15, v);
  note(523.25, 0.36, 0.42, v);
}

/** Long break ended — gentle ascending wake-up */
function longBreakEnd(vol: number) {
  const v = (vol / 100) * 0.28;
  note(392.00, 0.00, 0.14, v);
  note(523.25, 0.15, 0.14, v);
  note(659.25, 0.30, 0.14, v);
  note(783.99, 0.45, 0.40, v);
}

/** Level up — fast ascending fanfare */
function levelUp(vol: number) {
  const v = (vol / 100) * 0.32;
  const seq = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
  seq.forEach((f, i) =>
    note(f, i * 0.09, 0.14 + i * 0.018, v, 'triangle'),
  );
}

/**
 * Mascot level-up quack — two cute duck-like chirps played
 * after the fanfare (call with a ~750ms delay).
 * Uses a bandpass-filtered sawtooth with a fast frequency
 * drop to mimic a cartoony "QUACK QUACK" squeak.
 */
function mascotQuack(vol: number) {
  const v = (vol / 100) * 0.38;

  function quack(startOffset: number) {
    try {
      const c = ctx();
      const now = c.currentTime;
      const osc = c.createOscillator();
      const bpf = c.createBiquadFilter();
      const gain = c.createGain();

      bpf.type = 'bandpass';
      bpf.frequency.value = 420;
      bpf.Q.value = 2.5;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now + startOffset);
      osc.frequency.exponentialRampToValueAtTime(240, now + startOffset + 0.13);

      osc.connect(bpf);
      bpf.connect(gain);
      gain.connect(c.destination);

      gain.gain.setValueAtTime(0, now + startOffset);
      gain.gain.linearRampToValueAtTime(v, now + startOffset + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + 0.16);

      osc.start(now + startOffset);
      osc.stop(now + startOffset + 0.20);
    } catch { /* ignore */ }
  }

  quack(0);       // first quack
  quack(0.23);    // second quack (echoed)
}

/**
 * Mascot poke — satisfying spring "boing" when you tap the duck.
 * Sine wave sweeps low → high → settles, like a compressed spring releasing.
 */
function mascotPoke(vol: number) {
  const v = (vol / 100) * 0.22;
  try {
    const c = ctx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    // spring: initial thud → shoots up → bounces to rest
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.23);
    osc.frequency.exponentialRampToValueAtTime(510, now + 0.30);
    gain.gain.setValueAtTime(v, now);
    gain.gain.exponentialRampToValueAtTime(v * 0.35, now + 0.20);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.start(now);
    osc.stop(now + 0.42);
  } catch { /* ignore */ }
}

/** XP gained — short upward blip */
function xpGain(vol: number) {
  const v = (vol / 100) * 0.15;
  note(880.00,   0.00, 0.07, v);
  note(1108.73,  0.08, 0.12, v);
}

/** Task complete — bright triple ping */
function taskComplete(vol: number) {
  const v = (vol / 100) * 0.22;
  note(659.25,  0.00, 0.10, v);
  note(783.99,  0.10, 0.10, v);
  note(1046.50, 0.22, 0.30, v);
}

/**
 * Reward redeemed — coin-register jingle: quick shimmer of ascending notes
 * followed by a warm, satisfied "ding".
 */
function rewardRedeem(vol: number) {
  const v = (vol / 100) * 0.26;
  // fast ascending shimmer
  note(523.25,  0.00, 0.08, v, 'triangle');
  note(659.25,  0.07, 0.08, v, 'triangle');
  note(783.99,  0.14, 0.08, v, 'triangle');
  note(1046.50, 0.21, 0.08, v, 'triangle');
  // warm landing "ding"
  note(1318.51, 0.30, 0.55, v * 0.85, 'sine');
  note(1567.98, 0.35, 0.45, v * 0.45, 'sine');
}

/**
 * UI click — soft retro key-press.
 * Triangle wave with a gentle pitch drop: warm and satisfying,
 * not harsh. Kept very quiet so it blends into the background.
 */
function uiClick(vol: number) {
  const v = (vol / 100) * 0.07;
  try {
    const c = ctx();
    const now = c.currentTime;

    // Warm body — triangle drops from mid to low
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.055);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(v, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    osc.start(now);
    osc.stop(now + 0.08);

    // Subtle high tick for definition — sine, barely audible
    const osc2 = c.createOscillator();
    const gain2 = c.createGain();
    osc2.connect(gain2);
    gain2.connect(c.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(900, now);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(v * 0.35, now + 0.004);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.030);
    osc2.start(now);
    osc2.stop(now + 0.035);
  } catch { /* ignore */ }
}

export const Sounds = {
  focusComplete,
  breakEnd,
  longBreakEnd,
  levelUp,
  mascotQuack,
  mascotPoke,
  xpGain,
  taskComplete,
  rewardRedeem,
  uiClick,
};
