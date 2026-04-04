import { useEffect, useRef, useState } from 'react'; // useEffect still used by PilotCard
import { useStore } from '../store/useStore';
import PilotDuck from '../components/PilotDuck';
import XPBar from '../components/XPBar';
import { xpInfo } from '../constants/levels';
import { STAT_COLORS } from '../constants/categories';
import type { StatKey } from '../types';

function pad(n: number) { return String(n).padStart(2, '0'); }

const STAT_KEYS: StatKey[] = ['str', 'skl', 'int', 'vit', 'sns'];
const STAT_LABELS: Record<StatKey, string> = { str:'STR', skl:'SKL', int:'INT', vit:'VIT', sns:'SNS' };

/** Animated pilot card shown below the timer */
function PilotCard() {
  const { xp, level, stats } = useStore();
  const info = xpInfo(xp);

  // Flash stats when they increase
  const [flashStat, setFlashStat] = useState<StatKey | null>(null);
  const prevStats = useRef({ ...stats });
  useEffect(() => {
    for (const k of STAT_KEYS) {
      if (stats[k] > prevStats.current[k]) {
        setFlashStat(k);
        const t = setTimeout(() => setFlashStat(null), 750);
        prevStats.current = { ...stats };
        return () => clearTimeout(t);
      }
    }
    prevStats.current = { ...stats };
  }, [stats]);

  // Glow XP bar when XP increases
  const [xpFlash, setXpFlash] = useState(false);
  const prevXp = useRef(xp);
  useEffect(() => {
    if (xp > prevXp.current) {
      setXpFlash(true);
      const t = setTimeout(() => setXpFlash(false), 600);
      prevXp.current = xp;
      return () => clearTimeout(t);
    }
    prevXp.current = xp;
  }, [xp]);

  return (
    <div style={{
      width: '100%',
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 8,
      padding: '12px 14px',
      marginTop: 4,
    }}>
      {/* Header row: duck + level info */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
        <PilotDuck level={level} size={46} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:'bold', color:'#f5a623', letterSpacing:1 }}>PILOT</span>
            <span style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>{info.title}</span>
            <span style={{ marginLeft:'auto', fontSize:9, color:'var(--text-muted)' }}>LV.{level}</span>
          </div>
          <div style={{
            filter: xpFlash ? 'drop-shadow(0 0 4px #a855f7)' : undefined,
            transition: 'filter 0.4s',
          }}>
            <XPBar pct={info.pct} height={6} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
            <span style={{ fontSize:8, color:'var(--text-muted)' }}>{info.xpInLevel} / {info.xpNeeded} XP</span>
            <span style={{ fontSize:8, color:'var(--text-muted)' }}>{info.pct}%</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:5 }}>
        {STAT_KEYS.map(k => {
          const val = stats[k];
          const isFlashing = flashStat === k;
          const barPct = Math.min(100, ((val - 1) / 19) * 100);
          return (
            <div
              key={k}
              style={{
                flex:1, textAlign:'center',
                background: isFlashing ? `${STAT_COLORS[k]}18` : 'var(--bg)',
                border: `1px solid ${isFlashing ? STAT_COLORS[k] : 'var(--border)'}`,
                borderRadius: 4, padding: '5px 3px',
                transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
                transform: isFlashing ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <div style={{ fontSize:7, color: isFlashing ? STAT_COLORS[k] : 'var(--text-muted)', marginBottom:2 }}>
                {STAT_LABELS[k]}
              </div>
              <div style={{ fontSize:11, fontWeight:'bold', color: STAT_COLORS[k] }}>{val}</div>
              <div style={{ height:2, background:'var(--border)', borderRadius:1, marginTop:3 }}>
                <div style={{
                  height:'100%', width:`${barPct}%`,
                  background: STAT_COLORS[k], borderRadius:1,
                  opacity: isFlashing ? 1 : 0.5,
                  transition: 'width 0.6s, opacity 0.2s',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimerScreen() {
  const {
    tasks, activeTaskId, pomoPhase, pomoSecs, pomoRunning,
    focusInt, pomosToday, cyclePomos,
    startPomo, pausePomo, skipPhase, resetTimer, doneTask, setScreen,
  } = useStore();

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const mins = Math.floor(pomoSecs / 60);
  const secs = pomoSecs % 60;

  const totalSecs = useStore(s =>
    s.pomoPhase === 'focus'     ? s.focusDur     * 60 :
    s.pomoPhase === 'longBreak' ? s.longBreakDur * 60 :
                                  s.breakDur     * 60
  );
  const pct = Math.max(0, 1 - pomoSecs / totalSecs);

  // Phase-specific colour + label
  const phaseColor =
    pomoPhase === 'focus'     ? '#e94560' :
    pomoPhase === 'longBreak' ? '#f5a623' :
                                '#4ecca3';

  const phaseLabel =
    pomoPhase === 'focus'     ? 'FOCUS'      :
    pomoPhase === 'longBreak' ? 'LONG BREAK' :
                                'BREAK';

  // SVG ring
  const r = 80;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  // Dots — show current-cycle progress; all lit on long break
  const dots = Array.from({ length: focusInt }, (_, i) =>
    pomoPhase === 'longBreak' ? true : i < cyclePomos,
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:600 }}>
      {/* Header */}
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('focus')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color: phaseColor }}>{phaseLabel}</div>
      </div>

      <div className="fp-body" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
        {/* Active task name */}
        {activeTask && (
          <div style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center' }}>
            {activeTask.label}
          </div>
        )}

        {/* SVG ring timer */}
        <div style={{ position:'relative', width:200, height:200 }}>
          <svg width={200} height={200} style={{ transform:'rotate(-90deg)' }}>
            <circle cx={100} cy={100} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
            <circle
              cx={100} cy={100} r={r} fill="none"
              stroke={phaseColor} strokeWidth={8}
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              style={{ transition:'stroke-dasharray 0.5s' }}
            />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:36, fontWeight:'bold', color: phaseColor, letterSpacing:2 }}>
              {pad(mins)}:{pad(secs)}
            </div>
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:2, marginTop:4 }}>
              {phaseLabel}
            </div>
          </div>
        </div>

        {/* Cycle dots — start empty, fill as sessions complete */}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {dots.map((filled, i) => (
            <div key={i} style={{
              width:10, height:10, borderRadius:'50%',
              background: filled ? phaseColor : 'transparent',
              border:`1.5px solid ${filled ? phaseColor : 'var(--border-2)'}`,
              transition:'background 0.3s, border-color 0.3s',
            }} />
          ))}
          {pomoPhase === 'longBreak' && (
            <span style={{ fontSize:8, color:'#f5a623', marginLeft:4, letterSpacing:1 }}>CYCLE!</span>
          )}
        </div>

        {/* ── Controls: START/PAUSE | SKIP | RESET  +  DONE full-width ── */}
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
          {/* Top row — three equal buttons */}
          <div style={{ display:'flex', gap:8 }}>
            <button
              className={`fp-btn ${pomoPhase === 'focus' ? 'fp-btn-r' : pomoPhase === 'longBreak' ? 'fp-btn-g' : 'fp-btn-gr'}`}
              style={{ flex:1 }}
              onClick={() => pomoRunning ? pausePomo() : startPomo()}
            >
              {pomoRunning ? '⏸ PAUSE' : '▶ START'}
            </button>
            <button className="fp-btn fp-btn-mu" style={{ flex:1 }} onClick={skipPhase}>▶▶ SKIP</button>
            <button className="fp-btn fp-btn-mu" style={{ flex:1 }} onClick={resetTimer}>■ RESET</button>
          </div>

          {/* DONE — full width of the controls row, taller for prominence */}
          {activeTask && !activeTask.done && (
            <button
              className="fp-btn fp-btn-gr"
              style={{ width:'100%', padding:'13px', fontSize:'13px', fontWeight:'bold', letterSpacing:1 }}
              onClick={() => { doneTask(activeTask.id); setScreen('focus'); }}
            >
              ✓ DONE
            </button>
          )}
        </div>

        {/* Sessions today */}
        {pomosToday > 0 && (
          <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>
            {pomosToday} FOCUS SESSION{pomosToday !== 1 ? 'S' : ''} TODAY
          </div>
        )}

        {/* ── Full pilot card ─────────────────────────────────────────── */}
        <PilotCard />
      </div>
    </div>
  );
}
