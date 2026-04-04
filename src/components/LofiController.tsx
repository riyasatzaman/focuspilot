/**
 * Invisible component — sits in the component tree and keeps the lofi engine
 * in sync with store state. Mount once in App.tsx.
 */
import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { lofiPlayer } from '../utils/lofi';

export default function LofiController() {
  const lofiEnabled = useStore(s => s.lofiEnabled);
  const lofiTrack   = useStore(s => s.lofiTrack);
  const volume      = useStore(s => s.volume);

  // Track previous values so we can distinguish enable/disable vs. track change
  const prevEnabled = useRef(lofiEnabled);
  const prevTrack   = useRef(lofiTrack);

  // React to enabled / track changes
  useEffect(() => {
    const trackChanged   = lofiTrack   !== prevTrack.current;
    const enabledChanged = lofiEnabled !== prevEnabled.current;
    prevEnabled.current  = lofiEnabled;
    prevTrack.current    = lofiTrack;

    if (lofiEnabled) {
      if (!lofiPlayer.isPlaying() || enabledChanged) {
        lofiPlayer.play(lofiTrack, volume);
      } else if (trackChanged) {
        lofiPlayer.setTrack(lofiTrack, volume);
      }
    } else {
      if (lofiPlayer.isPlaying()) lofiPlayer.stop();
    }
  }, [lofiEnabled, lofiTrack, volume]);

  // Volume-only changes — just adjust gain without restarting
  useEffect(() => {
    if (lofiEnabled && lofiPlayer.isPlaying()) {
      lofiPlayer.setVolume(volume);
    }
  }, [volume]);  // intentionally omits lofiEnabled to avoid double-firing

  // Stop on unmount
  useEffect(() => () => { lofiPlayer.stop(); }, []);

  return null;
}
