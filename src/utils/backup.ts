import type { AppState, PomoPhase } from '../types';

const STORAGE_KEY = 'fpv4';

const VALID_PHASES: PomoPhase[] = ['focus', 'break', 'longBreak'];
const STAT_KEYS = ['str', 'skl', 'int', 'vit', 'sns'];

function isArr(v: unknown): v is unknown[] { return Array.isArray(v); }
function isNum(v: unknown): v is number { return typeof v === 'number' && isFinite(v); }
function isBool(v: unknown): v is boolean { return typeof v === 'boolean'; }
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function validateBackup(raw: unknown): AppState {
  if (!isObj(raw)) throw new Error('Invalid backup file');

  const wrapper = raw as Record<string, unknown>;
  if (!isObj(wrapper.state)) throw new Error('Missing state object in backup');

  const s = wrapper.state as Record<string, unknown>;

  // Arrays
  for (const key of ['tasks', 'events', 'notes', 'nlog', 'customCats', 'rewards', 'focusLog', 'taskOrder']) {
    if (!isArr(s[key])) throw new Error(`Invalid field: ${key} must be an array`);
  }

  // Numbers
  for (const key of ['xp', 'level', 'points', 'pomosToday', 'cyclePomos', 'pomoSecs', 'focusDur', 'breakDur', 'focusInt', 'longBreakDur', 'volume', 'lofiTrack']) {
    if (!isNum(s[key])) throw new Error(`Invalid field: ${key} must be a number`);
  }

  // Booleans
  for (const key of ['pomoRunning', 'sounds', 'notifs', 'sndFocus', 'sndBreak', 'sndLevelUp', 'sndXp', 'sndTask', 'lofiEnabled']) {
    if (!isBool(s[key])) throw new Error(`Invalid field: ${key} must be a boolean`);
  }

  // Enums
  if (s.theme !== 'dark' && s.theme !== 'light') throw new Error('Invalid theme value');
  if (!VALID_PHASES.includes(s.pomoPhase as PomoPhase)) throw new Error('Invalid pomoPhase value');

  // activeTaskId: null or number
  if (s.activeTaskId !== null && !isNum(s.activeTaskId)) throw new Error('Invalid activeTaskId');

  // activeNoteId: null or number
  if (s.activeNoteId !== null && !isNum(s.activeNoteId)) throw new Error('Invalid activeNoteId');

  // stats: object with numeric stat keys
  if (!isObj(s.stats)) throw new Error('Invalid stats object');
  const stats = s.stats as Record<string, unknown>;
  for (const k of STAT_KEYS) {
    if (!isNum(stats[k])) throw new Error(`Invalid stats.${k}`);
  }

  return s as unknown as AppState;
}

export function exportBackup(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('No data found to export');

  const date = new Date().toISOString().split('T')[0];
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focuspilot-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
