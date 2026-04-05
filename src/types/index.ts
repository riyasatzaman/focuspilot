export type StatKey = 'str' | 'skl' | 'int' | 'vit' | 'sns';
export type PomoPhase = 'focus' | 'break' | 'longBreak';

export interface Task {
  id: number;
  label: string;
  notes: string;
  catIds: string[];
  stats: StatKey[];
  done: boolean;
  timeSpent: number;
  created: number;
}

export interface CountdownEvent {
  id: number;
  name: string;
  date: string;
  color: string;
  created: number;
}

export interface Note {
  id: number;
  title: string;
  body: string;
  color: string;
  time: string;       // last-edited locale string (displayed)
  createdAt: number;  // epoch ms — for "date created" sort
  editedAt: number;   // epoch ms — for "last edited" sort
}

export interface Notification {
  msg: string;
  color: string;
  time: string;
}

export interface Category {
  id: string;
  label: string;
  stats: StatKey[];
  color: string;
  custom?: boolean;
}

export interface Reward {
  id: number;
  label: string;
  cost: number;
}

export interface AppState {
  // Data
  tasks: Task[];
  events: CountdownEvent[];
  notes: Note[];
  nlog: Notification[];
  customCats: Category[];
  rewards: Reward[];
  focusLog: { date: string; mins: number }[];
  taskOrder: number[];

  // Pilot / gamification
  xp: number;
  level: number;
  points: number;
  stats: Record<StatKey, number>;

  // Pomodoro
  pomosToday: number;
  cyclePomos: number;       // sessions completed in the current cycle (0 → focusInt)
  activeTaskId: number | null;
  pomoPhase: PomoPhase;
  pomoSecs: number;
  pomoRunning: boolean;

  // Settings
  sounds: boolean;
  notifs: boolean;
  focusDur: number;
  breakDur: number;
  focusInt: number;
  volume: number;
  sndFocus: boolean;
  sndBreak: boolean;
  sndLevelUp: boolean;
  sndXp: boolean;
  sndTask: boolean;
  longBreakDur: number;    // long break duration in minutes (default 25)

  // Theme
  theme: 'dark' | 'light';

  // Lo-fi music
  lofiEnabled: boolean;
  lofiTrack: number;

  // Navigation
  screen: string;
  activeNoteId: number | null;

  // Onboarding
  hasSeenOnboarding: boolean;
}
