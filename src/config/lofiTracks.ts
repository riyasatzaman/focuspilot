/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║           FOCUSPILOT MUSIC TRACK DEFINITIONS             ║
 * ║                                                          ║
 * ║  Edit THIS file to add, remove, or rename tracks.       ║
 * ║  Drop new MP3s into /public/music/ and add an entry.    ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Each track needs:
 *   name  — display name shown in Settings
 *   desc  — short vibe tags shown below the name
 *   file  — filename inside /public/music/ (e.g. 'Cozy-Lofi.mp3')
 *   bpm   — shown as metadata in the UI (optional, cosmetic only)
 */

export interface LofiTrackConfig {
  name: string;
  desc: string;
  file: string;
  bpm: number;
}

// ── Edit the 5 tracks below ───────────────────────────────────────────────────

export const LOFI_TRACK_CONFIGS: LofiTrackConfig[] = [

  {
    name: 'Cozy Lofi',
    desc: 'warm · relaxed · chill',
    file: 'Cozy-Lofi.mp3',
    bpm:  80,
  },

  {
    name: 'Night Dream Piano',
    desc: 'cinematic · gentle · sleepy',
    file: 'Night-Dream-Piano.mp3',
    bpm:  70,
  },

  {
    name: 'Lofi Jazz',
    desc: 'jazzy · smooth · laid-back',
    file: 'Lofi-Jazz.mp3',
    bpm:  85,
  },

  {
    name: 'Retro Arcade',
    desc: 'retro · punchy · focused',
    file: 'Retro-Arcade.mp3',
    bpm:  95,
  },

  {
    name: 'Chill Study',
    desc: 'minimal · clean · focused',
    file: 'Chill-Study.mp3',
    bpm:  75,
  },

];
