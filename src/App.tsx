import { useEffect } from 'react';
import { useStore } from './store/useStore';
import HomeScreen from './screens/HomeScreen';
import FocusScreen from './screens/FocusScreen';
import TimerScreen from './screens/TimerScreen';
import CountdownScreen from './screens/CountdownScreen';
import NotesScreen from './screens/NotesScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import NoteEditScreen from './screens/NoteEditScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LofiController from './components/LofiController';
import PomoController from './components/PomoController';
import Onboarding from './components/Onboarding';
import { Sounds } from './utils/sounds';

const SCREENS: Record<string, React.ComponentType> = {
  home:          HomeScreen,
  focus:         FocusScreen,
  timer:         TimerScreen,
  countdown:     CountdownScreen,
  notes:         NotesScreen,
  'note-detail': NoteDetailScreen,
  'note-edit':   NoteEditScreen,
  notifs:        NotificationsScreen,
  settings:      SettingsScreen,
};

export default function App() {
  const screen             = useStore((s) => s.screen);
  const theme              = useStore((s) => s.theme);
  const hasSeenOnboarding  = useStore((s) => s.hasSeenOnboarding);
  const Screen = SCREENS[screen] ?? HomeScreen;

  const sounds = useStore((s) => s.sounds);
  const volume = useStore((s) => s.volume);

  // Apply theme to <html> so CSS vars cascade everywhere (including body bg)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global UI click — fires only on interactive elements, not empty space
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!sounds) return;
      const target = e.target as HTMLElement;
      // Walk up the DOM to find the real interactive element
      const el = target.closest('button, a, input, select, textarea, [role="button"], label');
      if (!el) return;
      // Respect opt-out: mascot, record player, theme button carry this attr
      if (el.closest('[data-no-click-sound]')) return;
      Sounds.uiClick(volume);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [sounds, volume]);

  return (
    <>
      <LofiController />
      <PomoController />
      {!hasSeenOnboarding && <Onboarding />}
      <div style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        height: 600,
        maxWidth: 390,
        width: '100%',
        borderRadius: 0,
        overflow: 'hidden',
        fontFamily: "'Courier New', Courier, monospace",
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.3s',
      }}>
        <Screen />
      </div>
    </>
  );
}
