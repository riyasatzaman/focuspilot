/**
 * Invisible component — syncs store state to the audio engines.
 * Handles three sources:
 *   1. Built-in MP3 tracks  (lofiPlayer)
 *   2. Custom uploaded files (lofiPlayer.playUrl via customAudioMap)
 *   3. Custom YouTube links  (ytPlayer)
 * Mount once in App.tsx.
 */
import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { lofiPlayer, customAudioMap } from '../utils/lofi';
import { ytPlayer } from '../utils/youtubePlayer';

export default function LofiController() {
  const lofiEnabled   = useStore((s) => s.lofiEnabled);
  const lofiTrack     = useStore((s) => s.lofiTrack);
  const lofiCustomId  = useStore((s) => s.lofiCustomId);
  const customTracks  = useStore((s) => s.customTracks);
  const volume        = useStore((s) => s.volume);

  const prevEnabled  = useRef(lofiEnabled);
  const prevTrack    = useRef(lofiTrack);
  const prevCustomId = useRef(lofiCustomId);

  // ── Play / stop logic ──────────────────────────────────────────────────────
  useEffect(() => {
    const enabledChanged  = lofiEnabled  !== prevEnabled.current;
    const trackChanged    = lofiTrack    !== prevTrack.current;
    const customIdChanged = lofiCustomId !== prevCustomId.current;

    prevEnabled.current  = lofiEnabled;
    prevTrack.current    = lofiTrack;
    prevCustomId.current = lofiCustomId;

    if (!lofiEnabled) {
      lofiPlayer.stop();
      ytPlayer.stop();
      return;
    }

    if (lofiCustomId !== null) {
      // ── Custom track ───────────────────────────────────────────────────
      const ct = customTracks.find((t) => t.id === lofiCustomId);
      if (!ct) return;

      if (ct.type === 'youtube' && ct.youtubeId) {
        lofiPlayer.stop();
        if (customIdChanged || enabledChanged) {
          ytPlayer.play(ct.youtubeId, volume);
        }
      } else if (ct.type === 'file') {
        ytPlayer.stop();
        const url = customAudioMap.get(ct.id);
        if (url && (customIdChanged || enabledChanged)) {
          lofiPlayer.playUrl(url, volume);
        }
      }
    } else {
      // ── Built-in track ─────────────────────────────────────────────────
      ytPlayer.stop();
      if (!lofiPlayer.isPlaying() || enabledChanged || trackChanged) {
        if (trackChanged && lofiPlayer.isPlaying()) {
          lofiPlayer.setTrack(lofiTrack, volume);
        } else {
          lofiPlayer.play(lofiTrack, volume);
        }
      }
    }
  }, [lofiEnabled, lofiTrack, lofiCustomId, customTracks, volume]);

  // ── Volume-only changes ────────────────────────────────────────────────────
  useEffect(() => {
    if (!lofiEnabled) return;
    if (lofiCustomId !== null) {
      ytPlayer.setVolume(volume);
      if (lofiPlayer.isPlaying()) lofiPlayer.setVolume(volume);
    } else {
      if (lofiPlayer.isPlaying()) lofiPlayer.setVolume(volume);
    }
  }, [volume]); // intentionally omits others to avoid double-firing

  // ── Stop everything on unmount ─────────────────────────────────────────────
  useEffect(() => () => {
    lofiPlayer.stop();
    ytPlayer.stop();
  }, []);

  return null;
}
