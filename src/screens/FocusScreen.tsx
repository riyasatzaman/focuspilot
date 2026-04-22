import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { BASE_CATS } from '../constants/categories';
import { STAT_COLORS } from '../constants/categories';
import type { StatKey, Task } from '../types';

const STAT_KEYS: StatKey[] = ['str', 'skl', 'int', 'vit', 'sns'];
const STAT_LABELS: Record<StatKey, string> = { str: 'Strength', skl: 'Skills', int: 'Intelligence', vit: 'Vitality', sns: 'Senses' };

function fmtMins(m: number) {
  if (m === 0) return '—';
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0 && min > 0) return `${h}h ${min}m`;
  if (h > 0) return `${h}h`;
  return `${min}m`;
}

/** Live clock — updates every second */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0 10px', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 0.5 }}>{dateStr}</div>
      <div style={{ fontSize: 10, color: '#e94560', letterSpacing: 1, fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
    </div>
  );
}

/** Expandable stats bar shown at the top of the focus screen */
function FocusMiniStats() {
  const stats = useStore(s => s.stats);
  const focusLog = useStore(s => s.focusLog ?? []);
  const [expanded, setExpanded] = useState(false);
  const [flash, setFlash] = useState<StatKey | null>(null);
  const prev = useRef({ ...stats });

  useEffect(() => {
    let changed: StatKey | null = null;
    for (const k of STAT_KEYS) {
      if (stats[k] > prev.current[k]) { changed = k; break; }
    }
    prev.current = { ...stats };
    if (changed) {
      setFlash(changed);
      const t = setTimeout(() => setFlash(null), 750);
      return () => clearTimeout(t);
    }
  }, [stats]);

  // Build last-7-days chart data
  const todayDate = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const dayLabels = days.map(dateStr => {
    const d = new Date(dateStr + 'T12:00:00');
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
  });
  const dayMins = days.map(d =>
    focusLog.filter(e => e.date === d).reduce((sum, e) => sum + e.mins, 0),
  );
  const maxMins = Math.max(...dayMins, 1);

  const todayMins = dayMins[6];
  const weekTotal = dayMins.reduce((a, b) => a + b, 0);
  const bestDay = focusLog.length > 0
    ? Object.values(
        focusLog.reduce((acc, e) => {
          acc[e.date] = (acc[e.date] ?? 0) + e.mins;
          return acc;
        }, {} as Record<string, number>),
      ).reduce((a, b) => Math.max(a, b), 0)
    : 0;
  const totalMins = focusLog.reduce((sum, e) => sum + e.mins, 0);

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Stat bars row — click to expand */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', gap: 6, padding: '10px 16px', cursor: 'pointer', alignItems: 'center' }}
      >
        {STAT_KEYS.map(k => {
          const val = stats[k];
          const isFlashing = flash === k;
          const barPct = Math.min(100, ((val - 1) / 19) * 100);
          return (
            <div
              key={k}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'transform 0.15s',
                transform: isFlashing ? 'scale(1.12)' : 'scale(1)',
              }}
            >
              <div style={{
                fontSize: 20, fontWeight: 'bold',
                color: STAT_COLORS[k],
                transition: 'color 0.15s, text-shadow 0.15s',
                textShadow: isFlashing ? `0 0 10px ${STAT_COLORS[k]}` : 'none',
                lineHeight: 1,
              }}>
                {val}
              </div>
              <div style={{ fontSize: 8, color: isFlashing ? STAT_COLORS[k] : 'var(--text-muted)', letterSpacing: 0.5, transition: 'color 0.15s', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {STAT_LABELS[k]}
              </div>
              <div style={{ width: '100%', height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${barPct}%`,
                  background: STAT_COLORS[k], borderRadius: 2,
                  opacity: isFlashing ? 1 : 0.7,
                  transition: 'width 0.6s, opacity 0.15s',
                }} />
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 9, color: 'var(--text-muted)', paddingLeft: 4, flexShrink: 0, userSelect: 'none' }}>
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Expanded focus history panel */}
      {expanded && (
        <div style={{ padding: '4px 16px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <LiveClock />
          <div style={{ fontSize: 8, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>FOCUS HISTORY — LAST 7 DAYS</div>

          {/* Bar chart */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 44, marginBottom: 3 }}>
            {dayMins.map((mins, i) => (
              <div
                key={i}
                title={`${dayLabels[i]}: ${fmtMins(mins)}`}
                style={{
                  flex: 1,
                  height: `${Math.max(2, Math.round((mins / maxMins) * 42))}px`,
                  background: i === 6 ? '#e94560' : 'var(--border-2)',
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.4s',
                  minHeight: 2,
                  position: 'relative',
                }}
              />
            ))}
          </div>
          {/* Day labels */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {dayLabels.map((label, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center', fontSize: 7,
                color: i === 6 ? '#e94560' : 'var(--text-muted)',
                fontWeight: i === 6 ? 'bold' : 'normal',
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Summary stats — 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'TODAY', value: fmtMins(todayMins), color: '#e94560' },
              { label: 'THIS WEEK', value: fmtMins(weekTotal), color: '#f5a623' },
              { label: 'BEST DAY', value: fmtMins(bestDay), color: '#4ecca3' },
              { label: 'ALL TIME', value: fmtMins(totalMins), color: '#a855f7' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                textAlign: 'center',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4, padding: '6px 4px',
              }}>
                <div style={{ fontSize: 7, color: 'var(--text-muted)', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FocusScreen() {
  const { tasks, customCats, addTask, doneTask, deleteTask, setActiveTask, setScreen, addCustomCat, taskOrder, reorderTasks, activeTaskId, pomoRunning, pausePomo, startPomo } = useStore();
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [sortMode, setSortMode] = useState<'default' | 'name' | 'time'>('default');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customStats, setCustomStats] = useState<StatKey[]>([]);

  // Drag-and-drop state
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const allCats = [...BASE_CATS, ...customCats];

  const sorted = (() => {
    if (sortMode === 'name') return [...tasks].sort((a, b) => a.label.localeCompare(b.label));
    if (sortMode === 'time') return [...tasks].sort((a, b) => b.timeSpent - a.timeSpent);
    // default: use manual taskOrder if set, otherwise newest first
    if (taskOrder.length > 0) {
      const orderMap = new Map(taskOrder.map((id, i) => [id, i]));
      return [...tasks].sort((a, b) => {
        const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999 - a.created;
        const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999 - b.created;
        return ai - bi;
      });
    }
    return [...tasks].sort((a, b) => b.created - a.created);
  })();

  function handleAdd() {
    if (!label.trim()) return;
    addTask(label.trim(), notes.trim(), selectedCats);
    setLabel(''); setNotes(''); setSelectedCats([]); setExpanded(false);
  }

  function handleFocus(id: number) {
    // Only reset the timer if switching to a DIFFERENT task
    if (id !== activeTaskId) setActiveTask(id);
    setScreen('timer');
  }

  function handleAddCustomCat() {
    if (!customLabel.trim() || customStats.length === 0) return;
    addCustomCat(customLabel.trim(), customStats, '#64748b');
    setCustomLabel(''); setCustomStats([]); setShowCustomForm(false);
  }

  function fmt(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${secs}s`;
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: number) {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragId) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: number) {
    e.preventDefault();
    if (dragId === null || dragId === targetId) {
      setDragId(null); setDragOverId(null); return;
    }
    const ids = sorted.map(t => t.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    const newIds = [...ids];
    newIds.splice(from, 1);
    newIds.splice(to, 0, dragId);
    const reordered = newIds.map(id => sorted.find(t => t.id === id)!).filter(Boolean) as Task[];
    reorderTasks(reordered);
    setDragId(null); setDragOverId(null);
  }

  function handleDragEnd() {
    setDragId(null); setDragOverId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 600 }}>
      {/* Header */}
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('home')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color: '#e94560' }}>FOCUS</div>
        <div className="fp-hright">
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value as typeof sortMode)}
            style={{
              background: 'var(--inp-bg)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontFamily: 'inherit',
              fontSize: 9, padding: '5px 7px', borderRadius: 4, outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="default">MANUAL</option>
            <option value="name">A–Z</option>
            <option value="time">TIME SPENT</option>
          </select>
        </div>
      </div>

      {/* Expandable mini stats bar */}
      <FocusMiniStats />

      <div className="fp-body">
        {/* Add task input */}
        <div style={{ marginBottom: 14 }}>
          <input
            className="fp-inp"
            placeholder="Add a task..."
            value={label}
            onChange={e => { setLabel(e.target.value); if (!expanded) setExpanded(true); }}
            onFocus={() => setExpanded(true)}
            style={{ marginBottom: expanded ? 8 : 0 }}
          />
          {expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="fp-inp" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
              <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>CATEGORIES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {allCats.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCats(prev =>
                      prev.includes(cat.id) ? prev.filter(x => x !== cat.id) : [...prev, cat.id]
                    )}
                    style={{
                      fontSize: 9, padding: '4px 9px', borderRadius: 3, cursor: 'pointer',
                      border: `1.5px solid ${cat.color}`, background: 'transparent',
                      fontFamily: 'inherit', letterSpacing: '0.5px',
                      color: cat.color, opacity: selectedCats.includes(cat.id) ? 1 : 0.4,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomForm(v => !v)}
                  style={{
                    fontSize: 9, padding: '4px 9px', borderRadius: 3, cursor: 'pointer',
                    border: '1.5px solid var(--border)', background: 'transparent',
                    fontFamily: 'inherit', color: 'var(--text-muted)',
                  }}
                >
                  + CUSTOM
                </button>
              </div>

              {showCustomForm && (
                <div style={{
                  background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 6, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <input className="fp-inp" placeholder="Category name" value={customLabel} onChange={e => setCustomLabel(e.target.value)} />
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>STATS</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {STAT_KEYS.map(k => (
                      <button
                        key={k}
                        onClick={() => setCustomStats(prev =>
                          prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
                        )}
                        style={{
                          fontSize: 9, padding: '3px 7px', borderRadius: 3, cursor: 'pointer',
                          border: `1.5px solid ${STAT_COLORS[k]}`, background: 'transparent',
                          fontFamily: 'inherit', color: STAT_COLORS[k],
                          opacity: customStats.includes(k) ? 1 : 0.4,
                        }}
                      >
                        {k.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button className="fp-btn fp-btn-mu" onClick={handleAddCustomCat} style={{ fontSize: 9 }}>CREATE</button>
                </div>
              )}

              <button className="fp-btn fp-btn-r fp-btn-full" onClick={handleAdd}>+ ADD TASK</button>
            </div>
          )}
        </div>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 20 }}>
              No tasks yet. Add one above.
            </div>
          )}
          {sorted.map(task => (
            <div
              key={task.id}
              className={`fp-trow${task.done ? ' fp-trow-done' : ''}`}
              draggable={sortMode === 'default'}
              onDragStart={e => handleDragStart(e, task.id)}
              onDragOver={e => handleDragOver(e, task.id)}
              onDrop={e => handleDrop(e, task.id)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: dragId === task.id ? 0.4 : 1,
                borderColor: dragOverId === task.id && dragId !== task.id ? '#e94560' : undefined,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              {/* Drag handle — only shown in manual sort mode */}
              {sortMode === 'default' && (
                <div
                  style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    gap: 3, cursor: 'grab', padding: '0 6px 0 0', flexShrink: 0,
                    alignSelf: 'center', opacity: 0.3,
                  }}
                >
                  <div style={{ width: 11, height: 1.5, background: 'var(--text-muted)', borderRadius: 1 }} />
                  <div style={{ width: 11, height: 1.5, background: 'var(--text-muted)', borderRadius: 1 }} />
                  <div style={{ width: 11, height: 1.5, background: 'var(--text-muted)', borderRadius: 1 }} />
                </div>
              )}

              <div
                className={`fp-tcheck${task.done ? ' fp-tcheck-done' : ''}`}
                onClick={() => !task.done && doneTask(task.id)}
              >
                {task.done && '✓'}
              </div>
              {/* Task body — clickable to open timer if this task is active */}
              <div
                className="fp-tinfo"
                onClick={() => !task.done && task.id === activeTaskId ? setScreen('timer') : undefined}
                style={{ cursor: !task.done && task.id === activeTaskId ? 'pointer' : 'default' }}
              >
                <div className="fp-tname">{task.label}</div>
                {task.notes && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4, wordBreak: 'break-word' }}>
                    {task.notes}
                  </div>
                )}
                {task.timeSpent > 0 && (
                  <div style={{ marginTop: task.notes ? 6 : 5 }}>
                    <span className="fp-tspent">Time spent: {fmt(task.timeSpent)}</span>
                  </div>
                )}
                {task.catIds.length > 0 && (
                  <div className="fp-tmeta" style={{ marginTop: 5 }}>
                    {task.catIds.map(cid => {
                      const cat = allCats.find(c => c.id === cid);
                      if (!cat) return null;
                      return (
                        <span key={cid} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 2, border: `1px solid ${cat.color}`, color: cat.color }}>
                          {cat.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {!task.done && (() => {
                const isActive = task.id === activeTaskId;
                const isRunning = isActive && pomoRunning;
                return (
                  <button
                    onClick={() => {
                      if (isRunning) {
                        pausePomo();
                      } else if (isActive) {
                        startPomo();
                        setScreen('timer');
                      } else {
                        handleFocus(task.id);
                      }
                    }}
                    style={{
                      background: 'transparent', border: 'none',
                      color: isActive ? '#e94560' : '#e94560',
                      cursor: 'pointer', fontSize: isRunning ? 12 : 14,
                      padding: '2px 4px', flexShrink: 0,
                    }}
                  >
                    {isRunning ? '⏸' : '▶'}
                  </button>
                );
              })()}
              <button
                onClick={() => deleteTask(task.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, padding: '2px 4px', flexShrink: 0 }}
              >✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
