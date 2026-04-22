/**
 * Lo-fi music player — HTMLAudioElement-based MP3 playback.
 * Public API is identical to the previous procedural engine so
 * LofiController requires no changes.
 *
 * To edit tracks: src/config/lofiTracks.ts
 */

import { LOFI_TRACK_CONFIGS, type LofiTrackConfig } from '../config/lofiTracks';

export type { LofiTrackConfig as LofiTrack };
export const LOFI_TRACKS = LOFI_TRACK_CONFIGS;

// Fade durations in ms
const FADE_IN_MS  = 800;
const FADE_OUT_MS = 600;
const FADE_STEPS  = 30;

class Mp3Player {
  private audio: HTMLAudioElement | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private _playing = false;
  private _vol     = 0.7; // 0–1 internal

  // ── Helpers ──────────────────────────────────────────────────────────────

  private clearFade() {
    if (this.fadeTimer) { clearInterval(this.fadeTimer); this.fadeTimer = null; }
  }

  private getOrCreateAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.volume = 0;
    }
    return this.audio;
  }

  /** Ramp volume 0 → target over FADE_IN_MS. */
  private fadeIn(target: number) {
    this.clearFade();
    const el = this.getOrCreateAudio();
    el.volume = 0;
    let step = 0;
    const stepVol = target / FADE_STEPS;
    this.fadeTimer = setInterval(() => {
      step++;
      el.volume = Math.min(target, step * stepVol);
      if (step >= FADE_STEPS) this.clearFade();
    }, FADE_IN_MS / FADE_STEPS);
  }

  /** Ramp current volume → 0 over FADE_OUT_MS, then call onDone. */
  private fadeOut(onDone?: () => void) {
    this.clearFade();
    const el = this.audio;
    if (!el) { onDone?.(); return; }
    const startVol = el.volume;
    let step = 0;
    const stepVol = startVol / FADE_STEPS;
    this.fadeTimer = setInterval(() => {
      step++;
      el.volume = Math.max(0, startVol - step * stepVol);
      if (step >= FADE_STEPS) {
        this.clearFade();
        el.volume = 0;
        onDone?.();
      }
    }, FADE_OUT_MS / FADE_STEPS);
  }

  private loadAndPlay(trackIdx: number) {
    const el  = this.getOrCreateAudio();
    const src = `/music/${LOFI_TRACK_CONFIGS[trackIdx].file}`;
    // Only reload if the src actually changed
    if (!el.src.endsWith(LOFI_TRACK_CONFIGS[trackIdx].file)) {
      el.src = src;
    }
    el.play().catch(() => { /* autoplay blocked — user must interact first */ });
    this.fadeIn(this._vol);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  play(trackIdx: number, volume: number) {
    this._vol = volume / 100;
    this._playing  = true;
    this.loadAndPlay(trackIdx);
  }

  stop() {
    this._playing = false;
    this.fadeOut(() => { this.audio?.pause(); });
  }

  setVolume(volume: number) {
    this._vol = volume / 100;
    this.clearFade();
    if (this.audio) this.audio.volume = this._vol;
  }

  /** Fade out current track, swap, fade in new one. */
  setTrack(trackIdx: number, volume: number) {
    this._vol = volume / 100;
    if (!this._playing) return;
    this.fadeOut(() => {
      if (!this._playing) return; // may have been stopped during fade
      this.loadAndPlay(trackIdx);
    });
  }

  /** Play audio from a blob/object URL (uploaded file). */
  playUrl(url: string, volume: number) {
    this.clearFade();
    this._vol = volume / 100;
    this._playing = true;
    const el = this.getOrCreateAudio();
    el.loop = true;
    if (!el.src.endsWith(url)) el.src = url;
    el.play().catch(() => {});
    this.fadeIn(this._vol);
  }

  isPlaying() { return this._playing; }

  /** Temporarily lower music volume, then restore after `ms` milliseconds. */
  duck(ms: number) {
    if (!this.audio || !this._playing) return;
    this.audio.volume = this._vol * 0.20;
    setTimeout(() => { if (this.audio) this.audio.volume = this._vol; }, ms);
  }
}

export const lofiPlayer = new Mp3Player();

/** Session-only store for uploaded audio blob URLs (not persisted across refresh). */
export const customAudioMap = new Map<number, string>(); // trackId → blob URL
