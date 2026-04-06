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
  const screen                   = useStore((s) => s.screen);
  const theme                    = useStore((s) => s.theme);
  const hasSeenOnboarding        = useStore((s) => s.hasSeenOnboarding);
  const hasInitializedContent    = useStore((s) => s.hasInitializedContent);
  const setHasInitializedContent = useStore((s) => s.setHasInitializedContent);
  const addTask                  = useStore((s) => s.addTask);
  const Screen = SCREENS[screen] ?? HomeScreen;

  // Seed starter content exactly once on first launch
  useEffect(() => {
    if (hasInitializedContent) return;
    const now = Date.now();

    // Default task
    addTask(
      'Start Focus Session',
      'Start a 25 min focus session and fully concentrate. Earn XP, level up your stats, and take a 5 min break after completion.',
      [],
    );

    // Default notes — editedAt offsets control sort order (highest = top in "Last Edited" view)
    // Order: Leveling System (1st) → Your Focus Companion (2nd) → Earn Rewards (3rd)
    const timeStr = new Date().toLocaleString();
    useStore.setState((s) => ({
      notes: [
        { id: now + 1, title: 'Earn Rewards',          body: 'Complete focus sessions to earn points. Redeem them for real-life rewards like snacks, breaks, or anything you enjoy.', color: '#a855f7', time: timeStr, createdAt: now + 1, editedAt: now + 1 },
        { id: now + 2, title: 'Your Focus Companion',  body: 'Your companion grows with you. Stay consistent, build habits, and watch your progress come to life.',                    color: '#a855f7', time: timeStr, createdAt: now + 2, editedAt: now + 2 },
        { id: now + 3, title: 'Leveling System',       body: 'Every focus session earns you XP. Build your stats — Strength, Intelligence, Skills, and Vitality — and level up over time.', color: '#a855f7', time: timeStr, createdAt: now + 3, editedAt: now + 3 },
        ...s.notes,
      ],
    }));

    setHasInitializedContent(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div
        className="fp-app-shell"
        style={{
          color: 'var(--text)',
          height: 600,
          maxWidth: 390,
          width: '100%',
          borderRadius: 0,
          overflow: 'hidden',
          fontFamily: "'Courier New', Courier, monospace",
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Screen />
      </div>
    </>
  );
}
