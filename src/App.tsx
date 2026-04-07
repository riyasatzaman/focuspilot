import { useEffect, useState, useRef } from 'react';
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
import { LOFI_TRACKS } from './utils/lofi';

// ── Theme toggle button ───────────────────────────────────────────────────────
function ThemeButton({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  const isDark = theme === 'dark';
  return (
    <div data-no-click-sound style={{ position: 'absolute', bottom: 18, left: 18, width: 44, height: 44, zIndex: 10 }}>
      <button
        onClick={onToggle}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{ background: 'none', border: 'none', padding: 3, cursor: 'pointer', display: 'flex' }}
      >
        {isDark ? (
          <svg width={38} height={38} viewBox="0 0 38 38"
            style={{ display: 'block', filter: 'drop-shadow(0 0 6px rgba(245,166,35,0.55))', transition: 'filter 0.3s', overflow: 'visible' }}
          >
            <g className="fp-sun-spin">
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                const r = deg * Math.PI / 180;
                return (
                  <line key={deg}
                    x1={19 + Math.cos(r) * 12} y1={19 + Math.sin(r) * 12}
                    x2={19 + Math.cos(r) * 17} y2={19 + Math.sin(r) * 17}
                    stroke="#f5a623" strokeWidth={2.2} strokeLinecap="round"
                  />
                );
              })}
            </g>
            <circle cx={19} cy={19} r={8.5} fill="#f5a623" />
            <circle cx={19} cy={19} r={5.5} fill="#ffd166" />
          </svg>
        ) : (
          <svg width={38} height={38} viewBox="0 0 38 38"
            className="fp-moon-breathe"
            style={{ display: 'block', filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.55))', transition: 'filter 0.3s' }}
          >
            <circle cx={19} cy={19} r={12} fill="#a855f7" />
            <circle cx={25} cy={15} r={10} fill="var(--bg)" />
            <circle cx={30} cy={10} r={1.4} fill="#a855f7" opacity={0.85} />
            <circle cx={28} cy={28} r={1.0} fill="#a855f7" opacity={0.65} />
            <circle cx={11} cy={9}  r={0.9} fill="#a855f7" opacity={0.55} />
            <circle cx={8}  cy={22} r={0.7} fill="#a855f7" opacity={0.45} />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Record player button ──────────────────────────────────────────────────────
function RecordButton({ enabled, trackName, onToggle }: { enabled: boolean; trackName: string; onToggle: () => void }) {
  const [showLabel, setShowLabel] = useState(false);
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    onToggle();
    if (!enabled) {
      setShowLabel(true);
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
      labelTimerRef.current = setTimeout(() => setShowLabel(false), 3000);
    } else {
      setShowLabel(false);
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
    }
  };

  return (
    <div data-no-click-sound style={{ position: 'absolute', bottom: 18, right: 18, width: 44, height: 44, zIndex: 10 }}>
      {showLabel && (
        <div style={{
          position: 'absolute',
          right: 50, bottom: 6,
          fontSize: 8, color: '#a855f7', letterSpacing: 1,
          background: 'var(--bg-panel)', border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 3, padding: '3px 7px', whiteSpace: 'nowrap',
          animation: 'fp-fadein 0.18s ease forwards',
          pointerEvents: 'none',
        }}>
          {trackName}
        </div>
      )}
      <button
        onClick={handleClick}
        title={enabled ? 'Stop music' : 'Play lo-fi music'}
        style={{ background: 'none', border: 'none', padding: 3, cursor: 'pointer', display: 'flex' }}
      >
        <svg
          width={38} height={38} viewBox="0 0 38 38"
          className={enabled ? 'fp-record-spin' : ''}
          style={{ display: 'block', filter: enabled ? 'drop-shadow(0 0 5px rgba(168,85,247,0.55))' : 'none', transition: 'filter 0.3s' }}
        >
          <circle cx={19} cy={19} r={18} fill="#1a1a1a" />
          {[14, 11, 8].map(r => (
            <circle key={r} cx={19} cy={19} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          ))}
          <circle cx={19} cy={19} r={6.5} fill={enabled ? '#a855f7' : '#333'} style={{ transition: 'fill 0.3s' }} />
          <circle cx={19} cy={19} r={2} fill="#111" />
          <path d="M 8 14 A 12 12 0 0 1 30 14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

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
  const screen              = useStore((s) => s.screen);
  const theme               = useStore((s) => s.theme);
  const hasSeenOnboarding   = useStore((s) => s.hasSeenOnboarding);
  const toggleTheme         = useStore((s) => s.toggleTheme);
  const lofiEnabled         = useStore((s) => s.lofiEnabled);
  const setLofiEnabled      = useStore((s) => s.setLofiEnabled);
  const lofiTrack           = useStore((s) => s.lofiTrack);
  const Screen = SCREENS[screen] ?? HomeScreen;

  // Seed starter content exactly once on first launch.
  // Read the flag directly from getState() — avoids the React StrictMode
  // double-invoke race where the reactive value hasn't updated yet.
  useEffect(() => {
    if (useStore.getState().hasInitializedContent) return;

    // Mark first so a second invocation (StrictMode) is a no-op
    useStore.getState().setHasInitializedContent(true);

    const now = Date.now();
    const timeStr = new Date().toLocaleString();

    // Default tasks
    const t1: import('./types').Task = {
      id: now - 2, label: 'Start Focus Session',
      notes: 'Start a 25 min focus session and fully concentrate. Earn XP, level up your stats, and take a 5 min break after completion.',
      catIds: [], stats: [], done: false, timeSpent: 0, created: now - 2,
    };
    const t2: import('./types').Task = {
      id: now - 1, label: 'Level Up An Attribute',
      notes: 'Choose the attribute/s this task strengthens. Every completed session builds your stats and moves you closer to leveling up.',
      catIds: ['strength', 'skills', 'intellect'], stats: ['str', 'skl', 'int'],
      done: false, timeSpent: 0, created: now - 1,
    };

    // Default rewards
    const r1: import('./types').Reward = { id: now - 6, label: 'Have a snack!',      cost: 25 };
    const r2: import('./types').Reward = { id: now - 5, label: 'Take a nap (25 min)', cost: 50 };

    // Default countdown events
    const past5  = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const future5 = new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const e1: import('./types').CountdownEvent = { id: now - 4, name: 'Class Test',       date: past5,   color: '#e94560', created: now - 4 };
    const e2: import('./types').CountdownEvent = { id: now - 3, name: 'Important Event',  date: future5, color: '#f5a623', created: now - 3 };

    // Default notes — higher editedAt = higher in "Last Edited" sort
    // Order top→bottom: Leveling System, Your Focus Companion, Earn Rewards
    useStore.setState((s) => ({
      tasks: [t1, t2, ...s.tasks],
      taskOrder: s.taskOrder.length > 0 ? [t1.id, t2.id, ...s.taskOrder] : [],
      events: [e1, e2, ...s.events],
      rewards: [r1, r2, ...s.rewards],
      notes: [
        { id: now + 1, title: 'Earn Rewards',         body: 'Complete focus sessions to earn points. Redeem them for real-life rewards like snacks, breaks, or anything you enjoy.', color: '#4ecca3', time: timeStr, createdAt: now + 1, editedAt: now + 1 },
        { id: now + 2, title: 'Your Focus Companion', body: 'Your companion grows with you. Stay consistent, build habits, and watch your progress come to life.',                    color: '#e94560', time: timeStr, createdAt: now + 2, editedAt: now + 2 },
        { id: now + 3, title: 'Leveling System',      body: 'Every focus session earns you XP. Build your stats — Strength, Intelligence, Skills, and Vitality — and level up over time.', color: '#f5a623', time: timeStr, createdAt: now + 3, editedAt: now + 3 },
        ...s.notes,
      ],
    }));
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
          position: 'relative',
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
        <ThemeButton theme={theme} onToggle={toggleTheme} />
        <RecordButton
          enabled={lofiEnabled}
          trackName={LOFI_TRACKS[lofiTrack]?.name ?? ''}
          onToggle={() => setLofiEnabled(!lofiEnabled)}
        />
        <Screen />
      </div>
    </>
  );
}
