/**
 * YouTube IFrame API wrapper — loads the YT script on first use,
 * then provides a simple play/stop/volume interface.
 * The player is rendered in a 1×1 off-screen div so no video is visible.
 */

/* Minimal types for the parts of the YT IFrame API we use */
interface YTPlayerInstance {
  playVideo(): void;
  stopVideo(): void;
  setVolume(v: number): void;
  destroy(): void;
}

interface YTPlayerOptions {
  width: string | number;
  height: string | number;
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (e: { target: YTPlayerInstance }) => void;
    onError?: (e: unknown) => void;
  };
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayerInstance };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoaded = false;
let apiReady  = false;
const readyQueue: Array<() => void> = [];

function ensureApi() {
  if (apiLoaded) return;
  apiLoaded = true;

  // Preserve any existing callback (unlikely, but safe)
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    prev?.();
    readyQueue.splice(0).forEach((fn) => fn());
  };

  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}

function whenReady(fn: () => void) {
  if (apiReady && window.YT) { fn(); return; }
  ensureApi();
  readyQueue.push(fn);
}

class YouTubeAudioPlayer {
  private player: YTPlayerInstance | null = null;
  private container: HTMLDivElement | null = null;
  private _playing  = false;
  private _videoId: string | null = null;

  play(videoId: string, volume: number) {
    // If same video is already playing just update volume
    if (this._playing && this._videoId === videoId) {
      this.setVolume(volume);
      return;
    }
    this._videoId = videoId;
    this._playing = true;
    whenReady(() => this._init(videoId, volume));
  }

  private _init(videoId: string, volume: number) {
    if (!window.YT) return;

    // Reuse off-screen container
    if (!this.container) {
      this.container = document.createElement('div');
      Object.assign(this.container.style, {
        position: 'fixed', top: '-9999px', left: '-9999px',
        width: '1px', height: '1px', overflow: 'hidden', pointerEvents: 'none',
      });
      document.body.appendChild(this.container);
    }

    // Tear down any previous player
    try { this.player?.destroy(); } catch { /* ignore */ }
    this.player = null;
    this.container.innerHTML = '';

    const div = document.createElement('div');
    this.container.appendChild(div);

    this.player = new window.YT.Player(div, {
      width: '1',
      height: '1',
      videoId,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: videoId, // required for loop to work
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (e) => {
          e.target.setVolume(volume);
          e.target.playVideo();
        },
      },
    });
  }

  stop() {
    this._playing = false;
    try { this.player?.stopVideo(); } catch { /* ignore */ }
  }

  setVolume(volume: number) {
    try { this.player?.setVolume(volume); } catch { /* ignore */ }
  }

  currentVideoId() { return this._videoId; }
  isPlaying()      { return this._playing; }
}

export const ytPlayer = new YouTubeAudioPlayer();

/** Extract an 11-character YouTube video ID from various URL formats. */
export function extractYoutubeId(input: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,       // youtube.com/watch?v=ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,   // youtu.be/ID
    /embed\/([a-zA-Z0-9_-]{11})/,        // youtube.com/embed/ID
    /shorts\/([a-zA-Z0-9_-]{11})/,       // youtube.com/shorts/ID
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  // Bare video ID (11 chars, no slashes)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

/** YouTube thumbnail URL (medium quality, always available). */
export function youtubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
