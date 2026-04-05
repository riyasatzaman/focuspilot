import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Task, CountdownEvent, Note, StatKey, Reward } from '../types';
import { BASE_CATS } from '../constants/categories';
import { xpInfo } from '../constants/levels';
import { Sounds } from '../utils/sounds';

const STORAGE_KEY = 'fpv4';

const DEFAULT_STATS: Record<StatKey, number> = { str: 1, skl: 1, int: 1, vit: 1, sns: 1 };

interface StoreActions {
  setScreen: (screen: string) => void;
  setActiveNoteId: (id: number | null) => void;
  addTask: (label: string, notes: string, catIds: string[]) => void;
  doneTask: (id: number) => void;
  deleteTask: (id: number) => void;
  setActiveTask: (id: number | null) => void;
  tickPomo: () => void;
  startPomo: () => void;
  pausePomo: () => void;
  skipPhase: () => void;
  resetTimer: () => void;
  addEvent: (name: string, date: string, color: string) => void;
  deleteEvent: (id: number) => void;
  addNote: (title: string, body: string, color: string) => void;
  updateNote: (id: number, title: string, body: string, color: string) => void;
  deleteNote: (id: number) => void;
  redeemPoints: (reward: string) => boolean;
  reorderTasks: (tasks: Task[]) => void;
  addReward: (label: string, cost: number) => void;
  deleteReward: (id: number) => void;
  redeemReward: (id: number) => boolean;
  setSounds: (v: boolean) => void;
  setNotifs: (v: boolean) => void;
  setFocusDur: (v: number) => void;
  setBreakDur: (v: number) => void;
  setFocusInt: (v: number) => void;
  setLongBreakDur: (v: number) => void;
  setVolume: (v: number) => void;
  setSndFocus: (v: boolean) => void;
  setSndBreak: (v: boolean) => void;
  setSndLevelUp: (v: boolean) => void;
  setSndXp: (v: boolean) => void;
  setSndTask: (v: boolean) => void;
  toggleTheme: () => void;
  addCustomCat: (label: string, stats: StatKey[], color: string) => void;
  clearNlog: () => void;
  setLofiEnabled: (v: boolean) => void;
  setLofiTrack: (v: number) => void;
  replaceState: (data: AppState) => void;
  setHasSeenOnboarding: (v: boolean) => void;
}

type Store = AppState & StoreActions;

// ── Helpers ──────────────────────────────────────────────────────────────────

function gainXP(state: AppState, amount: number, statKeys: StatKey[]): Partial<AppState> {
  const newXp = state.xp + amount;
  const newPoints = state.points + Math.round(amount / 4);
  const { level: newLevel } = xpInfo(newXp);
  const leveledUp = newLevel > state.level;

  const newStats = { ...state.stats };
  for (const k of statKeys) {
    newStats[k] = (newStats[k] || 1) + 1;
  }

  const newNlog = [...state.nlog];
  if (leveledUp) {
    newNlog.unshift({
      msg: `LEVEL UP! You are now level ${newLevel}!`,
      color: '#f5a623',
      time: new Date().toLocaleTimeString(),
    });
  }

  // Side-effect sounds (safe: all calls are triggered by user interaction)
  if (state.sounds) {
    if (state.sndXp) Sounds.xpGain(state.volume);
    if (leveledUp && state.sndLevelUp) {
      Sounds.levelUp(state.volume);
      // Cute mascot quack fires after the fanfare completes (~750ms)
      setTimeout(() => Sounds.mascotQuack(state.volume), 780);
    }
  }

  return { xp: newXp, level: newLevel, points: newPoints, stats: newStats, nlog: newNlog.slice(0, 30) };
}

function pushNotif(state: AppState, msg: string, color: string): Partial<AppState> {
  if (!state.notifs) return {};
  const newNlog = [
    { msg, color, time: new Date().toLocaleTimeString() },
    ...state.nlog,
  ].slice(0, 30);
  return { nlog: newNlog };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Record actual elapsed focus time when a session is interrupted (pause / reset / task-switch).
 *  Only logs if the phase is 'focus', running, and at least 1 minute has elapsed. */
function logPartialFocus(state: AppState): AppState['focusLog'] {
  if (
    state.pomoPhase === 'focus' &&
    state.pomoRunning &&
    state.phaseStartedAt !== null
  ) {
    const elapsedMins = Math.round((Date.now() - state.phaseStartedAt) / 60000);
    if (elapsedMins >= 1) {
      const today = new Date().toISOString().split('T')[0];
      return [...state.focusLog, { date: today, mins: elapsedMins }].slice(-500);
    }
  }
  return state.focusLog;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ── Initial state ─────────────────────────────────────────────────
      tasks: [],
      events: [],
      notes: [],
      nlog: [],
      customCats: [],
      rewards: [],
      focusLog: [],
      taskOrder: [],
      xp: 0,
      level: 0,
      points: 0,
      stats: { ...DEFAULT_STATS },
      pomosToday: 0,
      cyclePomos: 0,
      activeTaskId: null,
      pomoPhase: 'focus',
      pomoSecs: 25 * 60,
      pomoRunning: false,
      phaseStartedAt: null,
      sounds: true,
      notifs: true,
      focusDur: 25,
      breakDur: 5,
      focusInt: 4,
      longBreakDur: 25,
      volume: 70,
      sndFocus: true,
      sndBreak: true,
      sndLevelUp: true,
      sndXp: true,
      sndTask: true,
      theme: 'dark',
      lofiEnabled: false,
      lofiTrack: 0,
      screen: 'home',
      activeNoteId: null,
      hasSeenOnboarding: false,

      // ── Navigation ────────────────────────────────────────────────────
      setScreen: (screen) => set({ screen }),
      setActiveNoteId: (id) => set({ activeNoteId: id }),

      // ── Tasks ─────────────────────────────────────────────────────────
      addTask: (label, notes, catIds) => {
        const state = get();
        const allCats = [...BASE_CATS, ...state.customCats];
        const stats = [
          ...new Set(
            catIds.flatMap((id) => allCats.find((c) => c.id === id)?.stats ?? []),
          ),
        ] as StatKey[];
        const task: Task = {
          id: Date.now(), label, notes, catIds, stats,
          done: false, timeSpent: 0, created: Date.now(),
        };
        // prepend to manual order so new tasks appear at top in default sort
        const newOrder = state.taskOrder.length > 0 ? [task.id, ...state.taskOrder] : [];
        set({ tasks: [...state.tasks, task], taskOrder: newOrder });
      },

      doneTask: (id) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task || task.done) return;
        if (state.sounds && state.sndTask) Sounds.taskComplete(state.volume);
        const updates = gainXP(state, 20, task.stats);
        const notifUpdates = pushNotif(
          { ...state, ...updates } as AppState,
          `Task complete: ${task.label}`,
          '#4ecca3',
        );
        set({
          tasks: state.tasks.map((t) => t.id === id ? { ...t, done: true } : t),
          points: ((updates.points ?? state.points) + 5),
          ...updates,
          ...notifUpdates,
        });
      },

      deleteTask: (id) => set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
        taskOrder: s.taskOrder.filter((oid) => oid !== id),
      })),

      setActiveTask: (id) => {
        const state = get();
        // Log any partial focus time before switching tasks
        const focusLog = logPartialFocus(state);
        set({ activeTaskId: id, pomoPhase: 'focus', pomoSecs: state.focusDur * 60, pomoRunning: false, cyclePomos: 0, phaseStartedAt: null, focusLog });
      },

      // ── Pomodoro ──────────────────────────────────────────────────────
      tickPomo: () => {
        const state = get();
        if (!state.pomoRunning) return;

        // Wall-clock sync: use phaseStartedAt to stay accurate even in background tabs
        let remainingSecs: number;
        let deltaTaskSecs = 1;

        if (state.phaseStartedAt !== null) {
          const phaseDurSecs = state.pomoPhase === 'focus' ? state.focusDur * 60
            : state.pomoPhase === 'break' ? state.breakDur * 60
            : state.longBreakDur * 60;
          const elapsed = Math.floor((Date.now() - state.phaseStartedAt) / 1000);
          remainingSecs = phaseDurSecs - elapsed;
          // How many real seconds passed since the last stored pomoSecs value
          deltaTaskSecs = Math.max(1, state.pomoSecs - remainingSecs);
        } else {
          remainingSecs = state.pomoSecs - 1;
        }

        if (remainingSecs > 0) {
          // Only accumulate timeSpent during focus phase
          const tasks = state.activeTaskId && state.pomoPhase === 'focus'
            ? state.tasks.map((t) =>
                t.id === state.activeTaskId ? { ...t, timeSpent: t.timeSpent + deltaTaskSecs } : t,
              )
            : state.tasks;
          set({ pomoSecs: remainingSecs, tasks });
          return;
        }

        // ── Phase expired ───────────────────────────────────────────────
        if (state.pomoPhase === 'focus') {
          if (state.sounds && state.sndFocus) Sounds.focusComplete(state.volume);

          const activeTask = state.tasks.find((t) => t.id === state.activeTaskId);
          const statKeys = activeTask?.stats ?? [];
          const sessionXP = (state.cyclePomos + 1) * 25;
          const updates = gainXP(state, sessionXP, statKeys);

          const newCyclePomos = state.cyclePomos + 1;
          const isLongBreak = newCyclePomos >= state.focusInt;

          const notifMsg = isLongBreak
            ? `Cycle complete! Enjoy your long break 🎉`
            : `Focus session complete! Take a short break.`;

          const notifUpdates = pushNotif(
            { ...state, ...updates } as AppState, notifMsg, '#4ecca3',
          );

          // Use real elapsed time for accurate logging
          const today = new Date().toISOString().split('T')[0];
          const actualMins = state.phaseStartedAt
            ? Math.max(1, Math.round((Date.now() - state.phaseStartedAt) / 60000))
            : state.focusDur;
          const newFocusLog = [...state.focusLog, { date: today, mins: actualMins }].slice(-500);

          set({
            pomoPhase: isLongBreak ? 'longBreak' : 'break',
            pomoSecs: isLongBreak ? state.longBreakDur * 60 : state.breakDur * 60,
            pomoRunning: false,
            pomosToday: state.pomosToday + 1,
            cyclePomos: isLongBreak ? 0 : newCyclePomos,
            focusLog: newFocusLog,
            phaseStartedAt: null,
            ...updates,
            ...notifUpdates,
          });

        } else if (state.pomoPhase === 'break') {
          if (state.sounds && state.sndBreak) Sounds.breakEnd(state.volume);
          const notifUpdates = pushNotif(state, 'Break over! Time to focus.', '#e94560');
          set({ pomoPhase: 'focus', pomoSecs: state.focusDur * 60, pomoRunning: false, phaseStartedAt: null, ...notifUpdates });

        } else {
          if (state.sounds && state.sndBreak) Sounds.longBreakEnd(state.volume);
          const notifUpdates = pushNotif(state, 'Long break over! Start a new cycle.', '#e94560');
          set({ pomoPhase: 'focus', pomoSecs: state.focusDur * 60, pomoRunning: false, phaseStartedAt: null, ...notifUpdates });
        }
      },

      startPomo: () => set({ pomoRunning: true, phaseStartedAt: Date.now() }),

      pausePomo: () => {
        const state = get();
        const focusLog = logPartialFocus(state);
        set({ pomoRunning: false, phaseStartedAt: null, focusLog });
      },

      skipPhase: () => {
        const state = get();
        if (state.pomoPhase === 'focus') {
          // Log any partial focus time before skipping
          const focusLog = logPartialFocus(state);
          const updates = gainXP(state, 25, []);
          const newCyclePomos = state.cyclePomos + 1;
          const isLongBreak = newCyclePomos >= state.focusInt;
          set({
            pomoPhase: isLongBreak ? 'longBreak' : 'break',
            pomoSecs: isLongBreak ? state.longBreakDur * 60 : state.breakDur * 60,
            cyclePomos: isLongBreak ? 0 : newCyclePomos,
            pomosToday: state.pomosToday + 1,
            pomoRunning: false,
            phaseStartedAt: null,
            focusLog,
            points: ((updates.points ?? state.points) + 8),
            ...updates,
          });
        } else {
          set({ pomoPhase: 'focus', pomoSecs: state.focusDur * 60, pomoRunning: false, phaseStartedAt: null });
        }
      },

      resetTimer: () => {
        const state = get();
        const focusLog = logPartialFocus(state);
        set({ pomoPhase: 'focus', pomoSecs: state.focusDur * 60, pomoRunning: false, phaseStartedAt: null, focusLog });
      },

      // ── Countdown events ──────────────────────────────────────────────
      addEvent: (name, date, color) => {
        const event: CountdownEvent = { id: Date.now(), name, date, color, created: Date.now() };
        set((s) => ({ events: [...s.events, event] }));
      },
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      // ── Notes ─────────────────────────────────────────────────────────
      addNote: (title, body, color) => {
        const now = Date.now();
        const note: Note = { id: now, title, body, color, time: new Date().toLocaleString(), createdAt: now, editedAt: now };
        set((s) => ({ notes: [note, ...s.notes] }));
      },
      updateNote: (id, title, body, color) => {
        const now = Date.now();
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, title, body, color, time: new Date().toLocaleString(), editedAt: now } : n,
          ),
        }));
      },
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // ── Tasks reorder ─────────────────────────────────────────────────
      reorderTasks: (newTasks) => {
        set({ tasks: newTasks, taskOrder: newTasks.map(t => t.id) });
      },

      // ── Rewards ───────────────────────────────────────────────────────
      redeemPoints: (reward) => {
        const state = get();
        if (state.points < 50) return false;
        const notifUpdates = pushNotif(state, `Reward redeemed: ${reward}`, '#f5a623');
        set({ points: state.points - 50, ...notifUpdates });
        return true;
      },

      addReward: (label, cost) => {
        const reward: Reward = { id: Date.now(), label, cost };
        set((s) => ({ rewards: [...s.rewards, reward] }));
      },

      deleteReward: (id) => set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) })),

      redeemReward: (id) => {
        const state = get();
        const reward = state.rewards.find((r) => r.id === id);
        if (!reward || state.points < reward.cost) return false;
        const notifUpdates = pushNotif(state, `Reward redeemed: ${reward.label}`, '#f5a623');
        set({ points: state.points - reward.cost, ...notifUpdates });
        return true;
      },

      // ── Settings ──────────────────────────────────────────────────────
      setSounds:      (v) => set({ sounds: v }),
      setNotifs:      (v) => set({ notifs: v }),
      setFocusDur:    (v) => set((s) => ({
        focusDur: v,
        pomoSecs: s.pomoPhase === 'focus' && !s.pomoRunning ? v * 60 : s.pomoSecs,
      })),
      setBreakDur:    (v) => set({ breakDur: v }),
      setFocusInt:    (v) => set({ focusInt: v }),
      setLongBreakDur:(v) => set({ longBreakDur: v }),
      setVolume:      (v) => set({ volume: v }),
      setSndFocus:    (v) => set({ sndFocus: v }),
      setSndBreak:    (v) => set({ sndBreak: v }),
      setSndLevelUp:  (v) => set({ sndLevelUp: v }),
      setSndXp:       (v) => set({ sndXp: v }),
      setSndTask:     (v) => set({ sndTask: v }),

      // ── Theme ─────────────────────────────────────────────────────────
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // ── Custom categories ─────────────────────────────────────────────
      addCustomCat: (label, stats, color) => {
        const cat = { id: `custom_${Date.now()}`, label, stats, color, custom: true };
        set((s) => ({ customCats: [...s.customCats, cat] }));
      },

      // ── Notifications ─────────────────────────────────────────────────
      clearNlog: () => set({ nlog: [] }),

      // ── Lo-fi music ───────────────────────────────────────────────────
      setLofiEnabled: (v) => set({ lofiEnabled: v }),
      setLofiTrack:   (v) => set({ lofiTrack: v }),

      // ── Backup / restore ──────────────────────────────────────────────
      replaceState: (data) => set({
        tasks: data.tasks,
        events: data.events,
        notes: data.notes,
        nlog: data.nlog,
        customCats: data.customCats,
        rewards: data.rewards,
        focusLog: data.focusLog,
        taskOrder: data.taskOrder,
        xp: data.xp,
        level: data.level,
        points: data.points,
        stats: data.stats,
        pomosToday: data.pomosToday,
        cyclePomos: data.cyclePomos,
        activeTaskId: data.activeTaskId,
        pomoPhase: data.pomoPhase,
        pomoSecs: data.pomoSecs,
        sounds: data.sounds,
        notifs: data.notifs,
        focusDur: data.focusDur,
        breakDur: data.breakDur,
        focusInt: data.focusInt,
        longBreakDur: data.longBreakDur,
        volume: data.volume,
        sndFocus: data.sndFocus,
        sndBreak: data.sndBreak,
        sndLevelUp: data.sndLevelUp,
        sndXp: data.sndXp,
        sndTask: data.sndTask,
        theme: data.theme,
        lofiEnabled: false,
        lofiTrack: data.lofiTrack,
        pomoRunning: false,
        phaseStartedAt: null,
        activeNoteId: null,
        hasSeenOnboarding: true,
      }),

      // ── Onboarding ────────────────────────────────────────────────────
      setHasSeenOnboarding: (v) => set({ hasSeenOnboarding: v }),
    }),
    { name: STORAGE_KEY },
  ),
);
