import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Sounds } from '../utils/sounds';
import { LOFI_TRACKS } from '../utils/lofi';

type Tab = 'general' | 'sounds' | 'focus' | 'feedback';

const SOUND_ENTRIES = [
  { key: 'sndFocus',   label: 'Focus complete', fn: (v: number) => Sounds.focusComplete(v) },
  { key: 'sndBreak',   label: 'Break ended',    fn: (v: number) => Sounds.breakEnd(v) },
  { key: 'sndLevelUp', label: 'Level up',        fn: (v: number) => Sounds.levelUp(v) },
  { key: 'sndXp',      label: 'XP gained',       fn: (v: number) => Sounds.xpGain(v) },
  { key: 'sndTask',    label: 'Task complete',   fn: (v: number) => Sounds.taskComplete(v) },
] as const;

type SndKey = typeof SOUND_ENTRIES[number]['key'];

export default function SettingsScreen() {
  const [tab, setTab] = useState<Tab>('general');
  const {
    sounds, notifs, volume, focusDur, breakDur, focusInt, longBreakDur,
    sndFocus, sndBreak, sndLevelUp, sndXp, sndTask,
    theme, lofiEnabled, lofiTrack,
    setSounds, setNotifs, setVolume, setFocusDur, setBreakDur, setFocusInt, setLongBreakDur,
    setSndFocus, setSndBreak, setSndLevelUp, setSndXp, setSndTask,
    toggleTheme, setScreen, setLofiEnabled, setLofiTrack,
  } = useStore();

  const sndValues: Record<SndKey, boolean> = { sndFocus, sndBreak, sndLevelUp, sndXp, sndTask };
  const sndSetters: Record<SndKey, (v: boolean) => void> = {
    sndFocus: setSndFocus,
    sndBreak: setSndBreak,
    sndLevelUp: setSndLevelUp,
    sndXp: setSndXp,
    sndTask: setSndTask,
  };

  const tabs: Tab[] = ['general', 'sounds', 'focus', 'feedback'];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:600 }}>
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('home')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color:'var(--text)' }}>SETTINGS</div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 16px' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background:'transparent', border:'none',
              borderBottom:`2px solid ${tab === t ? 'var(--text)' : 'transparent'}`,
              color: tab === t ? 'var(--text)' : 'var(--text-muted)',
              fontFamily:'inherit', fontSize:9,
              padding:'10px 10px 8px', cursor:'pointer', letterSpacing:1,
              transition:'color 0.15s',
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="fp-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* ── GENERAL ─────────────────────────────────────────────────── */}
        {tab === 'general' && (
          <>
            {/* Theme toggle */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 0' }}>
              <span style={{ fontSize:11, color:'var(--text)' }}>
                {theme === 'dark' ? '☾ Dark Mode' : '☀ Light Mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="fp-btn fp-btn-mu"
                style={{ fontSize:10, padding:'6px 12px' }}
              >
                SWITCH
              </button>
            </div>
            <div style={{ height:1, background:'var(--border)' }} />
            <ToggleRow label="Sound Effects" value={sounds} onChange={setSounds} />
            <ToggleRow label="Notifications"  value={notifs}  onChange={setNotifs} />
          </>
        )}

        {/* ── SOUNDS ──────────────────────────────────────────────────── */}
        {tab === 'sounds' && (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>MASTER VOLUME</div>
              <div style={{ fontSize:11, color:'var(--text)', minWidth:28, textAlign:'right' }}>{volume}%</div>
            </div>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              style={{ width:'100%', accentColor:'#4ecca3' }}
            />

            <div style={{ height:1, background:'var(--border)' }} />

            {/* Lo-fi music section */}
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1, marginBottom:8 }}>LO-FI BACKGROUND MUSIC</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:11, color:'var(--text)' }}>Enable lo-fi music</span>
              <Toggle value={lofiEnabled} onChange={setLofiEnabled} />
            </div>
            {/* Track selector */}
            <div style={{ display:'flex', flexDirection:'column', gap:5, opacity: lofiEnabled ? 1 : 0.4, transition:'opacity 0.2s' }}>
              {LOFI_TRACKS.map((track, i) => (
                <button
                  key={i}
                  onClick={() => { setLofiTrack(i); if (!lofiEnabled) setLofiEnabled(true); }}
                  disabled={!lofiEnabled && lofiTrack !== i}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    background: lofiTrack === i ? 'rgba(168,85,247,0.10)' : 'transparent',
                    border: `1.5px solid ${lofiTrack === i ? '#a855f7' : 'var(--border)'}`,
                    borderRadius:5, padding:'8px 11px', cursor:'pointer',
                    fontFamily:'inherit', textAlign:'left', transition:'all 0.15s',
                  }}
                >
                  <div style={{
                    width:8, height:8, borderRadius:'50%', flexShrink:0,
                    background: lofiTrack === i ? '#a855f7' : 'var(--border-2)',
                    transition:'background 0.15s',
                  }} />
                  <div>
                    <div style={{ fontSize:10, color: lofiTrack === i ? '#a855f7' : 'var(--text)', letterSpacing:0.5 }}>{track.name}</div>
                    <div style={{ fontSize:8, color:'var(--text-muted)', marginTop:1 }}>{track.desc} · {track.bpm} BPM</div>
                  </div>
                  {lofiTrack === i && lofiEnabled && (
                    <div style={{ marginLeft:'auto', fontSize:8, color:'#a855f7', letterSpacing:1 }}>PLAYING</div>
                  )}
                </button>
              ))}
            </div>

            <div style={{ height:1, background:'var(--border)', marginTop:4 }} />
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1, marginBottom:2 }}>INDIVIDUAL SOUNDS</div>

            {SOUND_ENTRIES.map(entry => (
              <div key={entry.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span style={{ fontSize:11, color:'var(--text)', flex:1 }}>{entry.label}</span>
                <button
                  onClick={() => sounds && entry.fn(volume)}
                  style={{
                    background:'transparent', border:'1px solid var(--border)',
                    color:'var(--text-muted)', fontFamily:'inherit',
                    fontSize:9, padding:'4px 8px', borderRadius:3, cursor:'pointer',
                  }}
                  title="Preview"
                >♪</button>
                <SoundToggle
                  value={sndValues[entry.key]}
                  onChange={sndSetters[entry.key]}
                  disabled={!sounds}
                />
              </div>
            ))}
          </>
        )}

        {/* ── FOCUS ───────────────────────────────────────────────────── */}
        {tab === 'focus' && (
          <>
            <NumberRow label="FOCUS DURATION (min)"      value={focusDur}      onChange={setFocusDur}      min={1}  max={120} />
            <NumberRow label="SHORT BREAK (min)"         value={breakDur}      onChange={setBreakDur}      min={1}  max={60}  />
            <NumberRow label="SESSIONS PER CYCLE"        value={focusInt}      onChange={setFocusInt}      min={1}  max={10}  />
            <div style={{ height:1, background:'var(--border)' }} />
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>LONG BREAK</div>
            <NumberRow label="LONG BREAK DURATION (min)" value={longBreakDur}  onChange={setLongBreakDur}  min={5}  max={60}  />
            <div style={{ fontSize:9, color:'var(--text-muted)', lineHeight:1.5 }}>
              A long break is given after every {focusInt} focus session{focusInt !== 1 ? 's' : ''}.
            </div>
          </>
        )}

        {/* ── FEEDBACK ────────────────────────────────────────────────── */}
        {tab === 'feedback' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>Help us improve Focus Pilot!</div>
            <button className="fp-btn fp-btn-p fp-btn-full">SUBMIT FEEDBACK</button>
            <button className="fp-btn fp-btn-g fp-btn-full">★ WRITE A REVIEW</button>
            <button className="fp-btn fp-btn-mu fp-btn-full">✉ SUPPORT EMAIL</button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function ToggleRow({ label, value, onChange }: { label:string; value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0' }}>
      <span style={{ fontSize:11, color:'var(--text)' }}>{label}</span>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function SoundToggle({ value, onChange, disabled }: { value:boolean; onChange:(v:boolean)=>void; disabled?:boolean }) {
  return (
    <div
      onClick={() => !disabled && onChange(!value)}
      style={{
        width:32, height:18, borderRadius:9, position:'relative',
        cursor: disabled ? 'not-allowed' : 'pointer', flexShrink:0,
        background: value && !disabled ? 'rgba(78,204,163,0.3)' : 'rgba(0,0,0,0.3)',
        border:`1px solid ${value && !disabled ? '#4ecca3' : 'var(--border)'}`,
        opacity: disabled ? 0.4 : 1,
        transition:'background 0.2s, border 0.2s',
      }}
    >
      <div style={{
        position:'absolute', top:2, left: value ? 16 : 2,
        width:12, height:12, borderRadius:'50%',
        background: value && !disabled ? '#4ecca3' : 'var(--text-muted)',
        transition:'left 0.2s, background 0.2s',
      }} />
    </div>
  );
}

function Toggle({ value, onChange }: { value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width:36, height:20, borderRadius:10, position:'relative', cursor:'pointer', flexShrink:0,
        background: value ? 'rgba(78,204,163,0.3)' : 'var(--surface-2)',
        border:`1px solid ${value ? '#4ecca3' : 'var(--border)'}`,
        transition:'background 0.2s, border 0.2s',
      }}
    >
      <div style={{
        position:'absolute', top:3, left: value ? 19 : 3,
        width:12, height:12, borderRadius:'50%',
        background: value ? '#4ecca3' : 'var(--text-muted)',
        transition:'left 0.2s, background 0.2s',
      }} />
    </div>
  );
}

function NumberRow({ label, value, onChange, min, max }: { label:string; value:number; onChange:(v:number)=>void; min:number; max:number }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button className="fp-btn fp-btn-mu" style={{ padding:'5px 12px', fontSize:14 }} onClick={() => onChange(Math.max(min, value-1))}>−</button>
        <span style={{ fontSize:16, fontWeight:'bold', color:'var(--text)', minWidth:30, textAlign:'center' }}>{value}</span>
        <button className="fp-btn fp-btn-mu" style={{ padding:'5px 12px', fontSize:14 }} onClick={() => onChange(Math.min(max, value+1))}>+</button>
      </div>
    </div>
  );
}
