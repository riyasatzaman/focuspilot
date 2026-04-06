import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Sounds } from '../utils/sounds';
import { LOFI_TRACKS } from '../utils/lofi';
import { exportBackup, validateBackup } from '../utils/backup';
import Toast from '../components/Toast';
import PilotDuck from '../components/PilotDuck';
import type { AppState } from '../types';

// ── Feedback config — replace with real URLs before launch ───────────────────
const FEEDBACK_FORM_URL = 'https://forms.gle/bJ2hrfd16Zhu7nQF8';
const SUPPORT_EMAIL     = 'axiommindofficial@gmail.com';
const SUPPORT_SUBJECT   = 'Focus Pilot Support';
const SUPPORT_BODY      = 'Hi Focus Pilot team,\n\n';

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
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    sounds, notifs, volume, focusDur, breakDur, focusInt, longBreakDur,
    sndFocus, sndBreak, sndLevelUp, sndXp, sndTask,
    theme, lofiEnabled, lofiTrack, level,
    setSounds, setNotifs, setVolume, setFocusDur, setBreakDur, setFocusInt, setLongBreakDur,
    setSndFocus, setSndBreak, setSndLevelUp, setSndXp, setSndTask,
    toggleTheme, setScreen, setLofiEnabled, setLofiTrack, replaceState,
  } = useStore();

  function handleExport() {
    try {
      exportBackup();
      setToast({ msg: 'Backup exported', ok: true });
    } catch {
      setToast({ msg: 'Export failed', ok: false });
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset so same file can be re-selected
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const validated = validateBackup(raw);
        setPendingImport(validated);
        setConfirmOpen(true);
      } catch (err) {
        setToast({ msg: err instanceof Error ? err.message : 'Invalid backup file', ok: false });
      }
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!pendingImport) return;
    replaceState(pendingImport);
    setPendingImport(null);
    setConfirmOpen(false);
    setToast({ msg: 'Data imported successfully', ok: true });
  }

  function handleCancelImport() {
    setPendingImport(null);
    setConfirmOpen(false);
  }

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display:'none' }}
        onChange={handleFileChange}
      />

      {/* Toast */}
      {toast && (
        <Toast
          msg={toast.msg}
          color={toast.ok ? '#4ecca3' : '#e94560'}
          onDone={() => setToast(null)}
        />
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.65)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:200,
        }}>
          <div style={{
            background:'var(--bg)', border:'1px solid var(--border)',
            borderRadius:10, padding:24, maxWidth:280, width:'90%',
          }}>
            <div style={{ fontSize:12, color:'var(--text)', marginBottom:10, fontWeight:'bold', letterSpacing:0.5 }}>
              REPLACE ALL DATA?
            </div>
            <div style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.6, marginBottom:18 }}>
              This will overwrite all your current tasks, notes, events, XP, and settings with the backup. This cannot be undone.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button
                className="fp-btn fp-btn-mu"
                style={{ flex:1, padding:'8px 0', fontSize:10 }}
                onClick={handleCancelImport}
              >
                CANCEL
              </button>
              <button
                className="fp-btn fp-btn-p"
                style={{ flex:1, padding:'8px 0', fontSize:10 }}
                onClick={handleConfirmImport}
              >
                IMPORT
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div className="fp-body" style={{ display:'flex', flexDirection:'column', gap:16, flex:1 }}>

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

            <div style={{ height:1, background:'var(--border)', marginTop:4 }} />
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>DATA</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button
                className="fp-btn fp-btn-g fp-btn-full"
                style={{ fontSize:10, padding:'9px 0' }}
                onClick={handleExport}
              >
                ↓ EXPORT DATA
              </button>
              <button
                className="fp-btn fp-btn-mu fp-btn-full"
                style={{ fontSize:10, padding:'9px 0' }}
                onClick={handleImportClick}
              >
                ↑ IMPORT DATA
              </button>
            </div>
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
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>LO-FI BACKGROUND MUSIC</div>

            {/* Transport controls */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:8, padding:'10px 14px',
            }}>
              {/* Track info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:10, color:'var(--text)', fontWeight:'bold', letterSpacing:0.5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {LOFI_TRACKS[lofiTrack].name}
                </div>
                <div style={{ fontSize:8, color:'var(--text-muted)', marginTop:2 }}>
                  {lofiEnabled ? '▶ PLAYING' : '◼ STOPPED'} · {LOFI_TRACKS[lofiTrack].bpm} BPM
                </div>
              </div>
              {/* Buttons */}
              <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                {/* Prev */}
                <button
                  onClick={() => { const i = (lofiTrack - 1 + LOFI_TRACKS.length) % LOFI_TRACKS.length; setLofiTrack(i); if (!lofiEnabled) setLofiEnabled(true); }}
                  style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:5, color:'var(--text-muted)', fontFamily:'inherit', fontSize:12, padding:'5px 9px', cursor:'pointer', lineHeight:1 }}
                  title="Previous track"
                >◀</button>
                {/* Play / Pause */}
                <button
                  onClick={() => setLofiEnabled(!lofiEnabled)}
                  style={{
                    background: lofiEnabled ? 'rgba(168,85,247,0.15)' : 'transparent',
                    border:`1.5px solid ${lofiEnabled ? '#a855f7' : 'var(--border)'}`,
                    borderRadius:5, color: lofiEnabled ? '#a855f7' : 'var(--text-muted)',
                    fontFamily:'inherit', fontSize:13, padding:'5px 11px', cursor:'pointer', lineHeight:1,
                    transition:'all 0.15s',
                  }}
                  title={lofiEnabled ? 'Pause' : 'Play'}
                >{lofiEnabled ? '⏸' : '▶'}</button>
                {/* Next */}
                <button
                  onClick={() => { const i = (lofiTrack + 1) % LOFI_TRACKS.length; setLofiTrack(i); if (!lofiEnabled) setLofiEnabled(true); }}
                  style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:5, color:'var(--text-muted)', fontFamily:'inherit', fontSize:12, padding:'5px 9px', cursor:'pointer', lineHeight:1 }}
                  title="Next track"
                >▶▶</button>
              </div>
            </div>

            {/* Track list */}
            <div style={{ display:'flex', flexDirection:'column', gap:5, opacity: lofiEnabled ? 1 : 0.5, transition:'opacity 0.2s' }}>
              {LOFI_TRACKS.map((track, i) => (
                <button
                  key={i}
                  onClick={() => { setLofiTrack(i); if (!lofiEnabled) setLofiEnabled(true); }}
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

            <div style={{ height:1, background:'var(--border)' }} />
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>INDIVIDUAL SOUNDS</div>

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
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, minHeight:420, gap:0 }}>

            {/* Mascot */}
            <div style={{ marginBottom:18, animation:'fp-gentle-float 2.8s ease-in-out infinite' }}>
              <PilotDuck level={level} size={76} />
            </div>

            {/* Heartfelt message */}
            <div style={{ textAlign:'center', marginBottom:22, padding:'0 8px' }}>
              <div style={{ fontSize:13, fontWeight:'bold', color:'var(--text)', marginBottom:7, letterSpacing:0.3 }}>
                Thanks for using Focus Pilot.
              </div>
              <div style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.75 }}>
                Every session you complete helps this little app grow.{'\n'}
                Your feedback means the world — it shapes everything we build next.
              </div>
            </div>

            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:10 }}>
              {/* Submit Feedback */}
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration:'none' }}
              >
                <button className="fp-btn fp-btn-p fp-btn-full" style={{ fontSize:10, padding:'11px 0', letterSpacing:1.5 }}>
                  ✦ SUBMIT FEEDBACK
                </button>
              </a>

              {/* Support Email */}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}&body=${encodeURIComponent(SUPPORT_BODY)}`}
                style={{ textDecoration:'none' }}
              >
                <button className="fp-btn fp-btn-mu fp-btn-full" style={{ fontSize:10, padding:'11px 0', letterSpacing:1.5 }}>
                  ✉ SUPPORT EMAIL
                </button>
              </a>
            </div>

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
