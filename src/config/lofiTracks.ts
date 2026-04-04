/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     LO-FI TRACK CONFIGURATION                               ║
 * ║                                                                              ║
 * ║  Edit THIS file to customise the 5 lo-fi tracks.                            ║
 * ║  The audio engine (src/utils/lofi.ts) reads from here — never touch that.   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ── QUICK-START: how to change a track ────────────────────────────────────────
 *
 *  Each track has:
 *    name    — displayed in Settings (e.g. 'LATE NIGHT')
 *    desc    — short vibe tags shown below the name (e.g. 'dark · sparse · muted')
 *    bpm     — tempo. Range: 60–110. Lower = more chill, higher = more energy.
 *    style   — picks the drum+pad personality (see STYLES below — do NOT rename)
 *    bars    — chord progression. 2 or 4 bars. Each bar needs:
 *                chord  — 4 MIDI note numbers (the pad harmony)
 *                bass   — 1 MIDI note number (the bass root)
 *
 * ── MIDI NOTE REFERENCE ───────────────────────────────────────────────────────
 *
 *  Octave 2 (low bass):
 *    C2=36  D2=38  Eb2=39  E2=40  F2=41  Gb2=42  G2=43  Ab2=44
 *    A2=45  Bb2=46  B2=47
 *
 *  Octave 3 (mid chords):
 *    C3=48  D3=50  Eb3=51  E3=52  F3=53  Gb3=54  G3=55  Ab3=56
 *    A3=57  Bb3=58  B3=59
 *
 *  Octave 4 (upper chord tones):
 *    C4=60  D4=62  Eb4=63  E4=64  F4=65  Gb4=66  G4=67  Ab4=68
 *    A4=69  Bb4=70  B4=71
 *
 * ── COMMON 7TH CHORD VOICINGS (copy & paste) ──────────────────────────────────
 *
 *  chord: root on bass, chord tones in octave 3–4:
 *
 *    Cmaj7   chord:[C3,E3,G3,B3]   bass:C2
 *    Dm7     chord:[D3,F3,A3,C4]   bass:D2
 *    Em7     chord:[E3,G3,B3,D4]   bass:E2
 *    Fmaj7   chord:[F3,A3,C4,E4]   bass:F2
 *    G7      chord:[G3,B3,D4,F4]   bass:G2
 *    Am7     chord:[A2,C3,E3,G3]   bass:A2   ← note: A2 is the lowest note
 *    Bm7b5   chord:[B2,D3,F3,A3]   bass:B2
 *    Bbmaj7  chord:[Bb2,D3,F3,A3]  bass:Bb2
 *    Gm7     chord:[G3,Bb3,D4,F4]  bass:G2
 *    Abmaj7  chord:[Ab3,C4,Eb4,G4] bass:Ab2
 *
 * ── STYLES ────────────────────────────────────────────────────────────────────
 *
 *  Each style controls the pad timbre, drum pattern, and bass rhythm:
 *
 *    'halfTime'   — sparse half-time drums, triangle pads, sub bass layer
 *                   Best for: slow, dark, introspective
 *
 *    'upbeat'     — 8th-note hats, open hats, syncopated bass, pluck melody
 *                   Best for: bright, caffeinated, productive
 *
 *    'ambient'    — no kick or hats, brush snare only, rain texture, very dark pads
 *                   Best for: ultra-chill, background, ambient/ASMR
 *
 *    'jazz'       — sawtooth "Rhodes" pads, ghost notes, chord stabs on 2 & 4
 *                   Best for: warm, jazzy, evening session
 *
 *    'driving'    — 808 kick, all-16th hats, heavy bass, arpeggio on bar start
 *                   Best for: energetic, hyperfocus, intense work sprints
 */

export type TrackStyle = 'halfTime' | 'upbeat' | 'ambient' | 'jazz' | 'driving';

export interface TrackBar {
  /** 4 MIDI note numbers for the chord pad (see voicings above) */
  chord: number[];
  /** 1 MIDI note number for the bass root (usually octave 2) */
  bass: number;
}

export interface LofiTrackConfig {
  /** Name shown in Settings UI (keep it short — fits in one line) */
  name: string;
  /** Short vibe descriptor shown below the name, e.g. 'dark · sparse · muted' */
  desc: string;
  /** Tempo in BPM. Sweet spot: 68–95 */
  bpm: number;
  /**
   * Drum + pad personality. Pick one of the 5 styles:
   * 'halfTime' | 'upbeat' | 'ambient' | 'jazz' | 'driving'
   */
  style: TrackStyle;
  /**
   * Chord progression — 2 or 4 bars.
   * The engine loops them endlessly.
   */
  bars: TrackBar[];
}

// ══════════════════════════════════════════════════════════════════════════════
//  ✏️  EDIT THE 5 TRACKS BELOW — everything above is reference / engine glue
// ══════════════════════════════════════════════════════════════════════════════

export const LOFI_TRACK_CONFIGS: LofiTrackConfig[] = [

  // ── Track 0 ───────────────────────────────────────────────────────────────
  {
    name:  'LATE NIGHT',
    desc:  'dark · sparse · muted',
    bpm:   75,
    style: 'halfTime',
    bars: [
      { chord: [50,53,57,60], bass: 38 },  // Dm7
      { chord: [45,48,52,55], bass: 45 },  // Am7
      { chord: [53,57,60,64], bass: 41 },  // Fmaj7
      { chord: [48,52,55,59], bass: 36 },  // Cmaj7
    ],
  },

  // ── Track 1 ───────────────────────────────────────────────────────────────
  {
    name:  'COFFEE SHOP',
    desc:  'bright · upbeat · plucky',
    bpm:   86,
    style: 'upbeat',
    bars: [
      { chord: [48,52,55,59], bass: 36 },  // Cmaj7
      { chord: [45,48,52,55], bass: 45 },  // Am7
      { chord: [53,57,60,64], bass: 41 },  // Fmaj7
      { chord: [43,47,50,53], bass: 43 },  // G7
    ],
  },

  // ── Track 2 ───────────────────────────────────────────────────────────────
  {
    name:  'RAINY WINDOW',
    desc:  'ambient · rain · minimal',
    bpm:   68,
    style: 'ambient',
    bars: [
      { chord: [52,55,59,62], bass: 40 },  // Em7
      { chord: [48,52,55,59], bass: 36 },  // Cmaj7
      { chord: [45,48,52,55], bass: 45 },  // Am7
      { chord: [47,50,54,57], bass: 47 },  // Bm7
    ],
  },

  // ── Track 3 ───────────────────────────────────────────────────────────────
  {
    name:  'GOLDEN HOUR',
    desc:  'warm · jazzy · rhodes',
    bpm:   80,
    style: 'jazz',
    bars: [
      { chord: [53,57,60,64], bass: 41 },  // Fmaj7
      { chord: [55,58,62,65], bass: 43 },  // Gm7
      { chord: [45,48,52,55], bass: 45 },  // Am7
      { chord: [46,50,53,57], bass: 46 },  // Bbmaj7
    ],
  },

  // ── Track 4 ───────────────────────────────────────────────────────────────
  {
    name:  'MIDNIGHT DRIVE',
    desc:  'heavy · bass · driving',
    bpm:   90,
    style: 'driving',
    bars: [
      { chord: [45,48,52,55], bass: 45 },  // Am7
      { chord: [50,53,57,60], bass: 38 },  // Dm7
      { chord: [43,47,50,53], bass: 43 },  // G7
      { chord: [48,52,55,59], bass: 36 },  // Cmaj7
    ],
  },

];
