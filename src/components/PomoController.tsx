import { useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * Mounted once at the app root — keeps the pomodoro tick alive
 * regardless of which screen the user is on.
 */
export default function PomoController() {
  const pomoRunning = useStore(s => s.pomoRunning);
  const tickPomo    = useStore(s => s.tickPomo);

  useEffect(() => {
    if (!pomoRunning) return;
    const id = setInterval(tickPomo, 1000);
    return () => clearInterval(id);
  }, [pomoRunning, tickPomo]);

  return null;
}
