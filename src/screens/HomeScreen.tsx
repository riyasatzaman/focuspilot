import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import PilotDuck from '../components/PilotDuck';
import XPBar from '../components/XPBar';
import StatGrid from '../components/StatGrid';
import { xpInfo } from '../constants/levels';
import { Sounds } from '../utils/sounds';
import { LOFI_TRACKS } from '../utils/lofi';
import { youtubeThumbnail } from '../utils/youtubePlayer';

function pad(n: number) { return String(n).padStart(2, '0'); }

// Short, punchy lines — no emoji, retro vibe
const DIALOGS = [
  "back to work.",
  "stop that.",
  "focus!",
  "not now.",
  "seriously?",
  "go away.",
  "quit it.",
  "i'm busy.",
  "focus up.",
  "really?",
  "not helpful.",
  "leave me alone.",
  "get to work.",
  "hey!",
];

// ── Theme toggle button (bottom-left, mirrors record player) ─────────────────
function ThemeButton({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  const isDark = theme === 'dark';

  return (
    /* Outer anchor — fixed size, never moves, mirrors record player on the left */
    <div data-no-click-sound style={{ position: 'absolute', bottom: 18, left: 18, width: 44, height: 44, zIndex: 10 }}>
      <button
        onClick={onToggle}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{ background: 'none', border: 'none', padding: 3, cursor: 'pointer', display: 'flex' }}
      >
        {isDark ? (
          /* ── Sun SVG: rays spin slowly around centre ── */
          <svg width={38} height={38} viewBox="0 0 38 38"
            style={{ display: 'block', filter: 'drop-shadow(0 0 6px rgba(245,166,35,0.55))', transition: 'filter 0.3s', overflow: 'visible' }}
          >
            {/* Spinning rays */}
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
            {/* Static core */}
            <circle cx={19} cy={19} r={8.5} fill="#f5a623" />
            <circle cx={19} cy={19} r={5.5} fill="#ffd166" />
          </svg>
        ) : (
          /* ── Moon SVG: crescent + stars, gently breathes ── */
          <svg width={38} height={38} viewBox="0 0 38 38"
            className="fp-moon-breathe"
            style={{ display: 'block', filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.55))', transition: 'filter 0.3s' }}
          >
            {/* Crescent */}
            <circle cx={19} cy={19} r={12} fill="#a855f7" />
            <circle cx={25} cy={15} r={10} fill="var(--bg)" />
            {/* Stars */}
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
function RecordButton({ enabled, trackName, onToggle, ytThumbUrl }: {
  enabled: boolean;
  trackName: string;
  onToggle: () => void;
  ytThumbUrl?: string;
}) {
  const [showLabel, setShowLabel] = useState(false);
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    onToggle();
    // Show track name label for 3s on play, hide on stop (only for non-YouTube tracks)
    if (!enabled && !ytThumbUrl) {
      setShowLabel(true);
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
      labelTimerRef.current = setTimeout(() => setShowLabel(false), 3000);
    } else {
      setShowLabel(false);
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
    }
  };

  return (
    /* Outer anchor — fixed size, never moves */
    <div data-no-click-sound style={{ position: 'absolute', bottom: 18, right: 18, width: 44, height: 44, zIndex: 10 }}>

      {/* YouTube thumbnail — persistent, shown left of disc when a YouTube custom track is playing */}
      {ytThumbUrl && enabled && (
        <div style={{
          position: 'absolute',
          right: 52,
          bottom: 3,
          pointerEvents: 'none',
          animation: 'fp-thumb-fadein 0.25s ease forwards',
        }}>
          <img
            src={ytThumbUrl}
            alt="Now playing"
            style={{
              width: 62,
              height: 42,
              objectFit: 'cover',
              borderRadius: 5,
              border: '1.5px solid #a855f7',
              boxShadow: '0 0 10px rgba(168,85,247,0.45), 0 2px 10px rgba(0,0,0,0.6)',
              display: 'block',
            }}
          />
          {/* ▶ PLAYING badge */}
          <div style={{
            position: 'absolute', bottom: 4, left: 4,
            fontSize: 6, color: '#fff', letterSpacing: 0.5,
            background: 'rgba(168,85,247,0.88)',
            borderRadius: 2, padding: '1px 4px',
            fontFamily: 'inherit',
          }}>▶ PLAYING</div>
        </div>
      )}

      {/* Track name label — shown for built-in / file tracks (not YouTube) */}
      {showLabel && !ytThumbUrl && (
        <div style={{
          position: 'absolute',
          right: 50,   /* sits just left of the 44px disc */
          bottom: 6,   /* vertically centred with disc */
          fontSize: 8, color: '#a855f7', letterSpacing: 1,
          background: 'var(--bg-panel)', border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 3, padding: '3px 7px', whiteSpace: 'nowrap',
          animation: 'fp-fadein 0.18s ease forwards',
          pointerEvents: 'none',
        }}>
          {trackName}
        </div>
      )}

      {/* The record disc — always at the same position */}
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

// ── Confetti burst ────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#f5a623', '#e94560', '#4ecca3', '#a855f7', '#3b82f6', '#ffffff'];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  color: string;
  w: number; h: number;
  life: number;
}

function ConfettiBurst({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = canvas.getContext('2d')!;

    // Spawn ~80 particles from the centre
    const particles: Particle[] = Array.from({ length: 80 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      return {
        x: W / 2, y: H / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.22,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        w: 6 + Math.random() * 7,
        h: 3 + Math.random() * 4,
        life: 1,
      };
    });

    let raf: number;
    function draw() {
      cx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;          // gravity
        p.vx *= 0.98;          // air drag
        p.rot += p.rotV;
        p.life -= 0.018;
        if (p.life <= 0) continue;
        alive++;
        cx.save();
        cx.globalAlpha = Math.min(1, p.life * 2);
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        cx.fillStyle = p.color;
        cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cx.restore();
      }
      if (alive > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 200,
      }}
    />
  );
}

export default function HomeScreen() {
  const [expanded, setExpanded] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wobbling, setWobbling] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);
  const [newRewardLabel, setNewRewardLabel] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('50');
  const [addingReward, setAddingReward] = useState(false);
  const clickCountRef = useRef(0);
  // Random threshold between 3 and 5 inclusive
  const nextThresholdRef = useRef(Math.floor(Math.random() * 3) + 3);
  const dialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duckDivRef = useRef<HTMLDivElement>(null);

  const { xp, level, points, stats, setScreen, toggleTheme, theme, sounds, volume, rewards, addReward, deleteReward, redeemReward, lofiEnabled, setLofiEnabled, lofiTrack, pomoRunning, pomoSecs, pomoPhase, customTracks, lofiCustomId } = useStore();
  const info = xpInfo(xp);

  // Determine active custom track info for the record button
  const activeCustomTrack = customTracks.find(t => t.id === lofiCustomId);
  const ytThumbUrl = activeCustomTrack?.type === 'youtube' && activeCustomTrack.youtubeId
    ? youtubeThumbnail(activeCustomTrack.youtubeId)
    : undefined;
  const activeTrackName = lofiCustomId !== null
    ? (activeCustomTrack?.name ?? '')
    : (LOFI_TRACKS[lofiTrack]?.name ?? '');

  const handleMascotClick = useCallback(() => {
    // Play satisfying boing sound
    if (sounds) Sounds.mascotPoke(volume);

    // Re-trigger wobble: remove class, force reflow, re-add
    if (duckDivRef.current) {
      duckDivRef.current.classList.remove('fp-wobble');
      void duckDivRef.current.offsetWidth; // force reflow
      duckDivRef.current.classList.add('fp-wobble');
    }
    setWobbling(true);

    // Dialogue fires randomly every 3-5 clicks then resets with a new threshold
    clickCountRef.current += 1;
    if (clickCountRef.current >= nextThresholdRef.current) {
      const msg = DIALOGS[Math.floor(Math.random() * DIALOGS.length)];
      setDialog(msg);
      clickCountRef.current = 0;
      nextThresholdRef.current = Math.floor(Math.random() * 3) + 3; // next trigger: 3, 4, or 5
      if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
      dialogTimerRef.current = setTimeout(() => setDialog(null), 2200);
    }
  }, [sounds, volume]);

  function handleAddReward() {
    const label = newRewardLabel.trim();
    const cost = parseInt(newRewardCost, 10);
    if (!label || isNaN(cost) || cost < 1) return;
    addReward(label, cost);
    setNewRewardLabel(''); setNewRewardCost('50'); setAddingReward(false);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, padding:'32px 24px', gap:14 }}>

      {/* Theme toggle — bottom-left, mirrors record player */}
      <ThemeButton theme={theme} onToggle={toggleTheme} />

      {/* Record player — bottom-right */}
      <RecordButton
        enabled={lofiEnabled}
        trackName={activeTrackName}
        onToggle={() => setLofiEnabled(!lofiEnabled)}
        ytThumbUrl={ytThumbUrl}
      />

      {/* ── Mascot + timer bubble ─────────────────────────────────────── */}
      <div style={{ position:'relative', display:'inline-block', width: 80 }}>

        {/* Timer bubble — floats above mascot, navigates to timer on click */}
        {pomoRunning && (
          <div
            className={`fp-timer-bubble${pomoPhase === 'break' ? ' fp-timer-bubble-break' : pomoPhase === 'longBreak' ? ' fp-timer-bubble-longbreak' : ''}`}
            style={{ bottom: 'calc(100% + 10px)' }}
            onClick={() => setScreen('timer')}
            title="Go to focus timer"
          >
            {pad(Math.floor(pomoSecs / 60))}:{pad(pomoSecs % 60)}
          </div>
        )}

        {/* Clickable mascot */}
        <div
          data-no-click-sound
          style={{ cursor:'pointer', userSelect:'none', display:'inline-block', animation:'fp-gentle-float 2.8s ease-in-out infinite' }}
          onClick={handleMascotClick}
          title="Click me!"
        >
          {/* Wobble wrapper — manipulated via ref to re-trigger the animation */}
          <div
            ref={duckDivRef}
            onAnimationEnd={() => setWobbling(false)}
            style={{ display:'inline-block' }}
          >
            <PilotDuck level={level} size={80} />
          </div>
        </div>

        {/* Retro side bubble — appears to the right of the duck */}
        {dialog && <div className="fp-retro-bubble">{dialog}</div>}
      </div>

      <div className="fp-logo" style={{ fontSize:21, fontWeight:'bold', letterSpacing:2 }}>
        <span style={{ color:'#e94560' }}>FOCUS</span>
        <span style={{ color:'#f5a623' }}>PILOT</span>
      </div>
      <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:2 }}>LEVEL UP YOUR LIFE</div>

      {/* XP bar row */}
      <div
        className="fp-xp-container"
        onClick={() => setExpanded(e => !e)}
        style={{
          width:'100%', maxWidth:280,
          display:'flex', alignItems:'center', gap:9,
          background:'var(--surface)', border:'1.5px solid var(--border)',
          borderRadius:5, padding:'8px 12px', cursor:'pointer',
        }}
      >
        <div style={{ fontSize:10, color:'#f5a623', whiteSpace:'nowrap' }}>LV.{level}</div>
        <div style={{ flex:1 }}><XPBar pct={info.pct} /></div>
        <div style={{ fontSize:10, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{points} pts</div>
        <div style={{ fontSize:10, color:'var(--text-muted)', transition:'transform 0.2s', transform: expanded ? 'rotate(180deg)' : undefined }}>▼</div>
      </div>

      {/* Expanded pilot card */}
      {expanded && (
        <div className="fp-pilot-card" style={{ width:'100%', maxWidth:280, background:'var(--bg-panel)', border:'1.5px solid var(--border)', borderRadius:6, padding:'13px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:10 }}>
            <PilotDuck level={level} size={44} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, color:'#f5a623', fontWeight:'bold' }}>PILOT</div>
              <div style={{ fontSize:9, color:'var(--text-muted)', margin:'3px 0' }}>LV.{level} · {info.title}</div>
              <XPBar pct={info.pct} height={5} />
              <div style={{ fontSize:8, color:'var(--text-muted)', marginTop:3 }}>{info.xpInLevel} / {info.xpNeeded} XP</div>
            </div>
          </div>
          <StatGrid stats={stats} />
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display:'flex', flexDirection:'column', gap:9, width:'100%', maxWidth:280 }}>
        <button className="fp-btn fp-btn-r fp-btn-full" onClick={() => setScreen('focus')}>▶ FOCUS</button>
        <button className="fp-btn fp-btn-g fp-btn-full" onClick={() => setScreen('countdown')}>◎ COUNTDOWN</button>
        <button className="fp-btn fp-btn-p fp-btn-full" onClick={() => setScreen('notes')}>✎ NOTES</button>
      </div>

      {/* Bottom utility row — small & understated */}
      <div style={{ display:'flex', gap:6, marginTop:2 }}>
        {[
          { label:'NOTIFS',   action: () => setScreen('notifs'),   cls: '',               style: {} },
          { label:'★ REDEEM', action: () => setRewardOpen(true),   cls: 'fp-btn-redeem',  style: { borderColor:'rgba(245,166,35,0.35)', color:'rgba(245,166,35,0.7)' } },
          { label:'SETTINGS', action: () => setScreen('settings'), cls: '',               style: {} },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={`fp-btn-utility${btn.cls ? ' ' + btn.cls : ''}`}
            style={{
              background:'transparent', border:'1px solid var(--border)',
              color:'var(--text-muted)', fontFamily:'inherit',
              fontSize:9, padding:'5px 9px', borderRadius:4, cursor:'pointer',
              letterSpacing:'0.5px',
              ...btn.style,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Reward shop modal */}
      {rewardOpen && (
        <div style={{
          position:'fixed', inset:0, background:'var(--overlay)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
        }}>
          <div className="fp-modal-panel" style={{ background:'var(--bg-panel)', border:'1.5px solid var(--border)', borderRadius:8, padding:20, width:300, maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', marginBottom:4 }}>
              <div style={{ fontSize:12, color:'#f5a623', fontWeight:'bold', flex:1 }}>★ REWARD SHOP</div>
              <button className="fp-btn fp-btn-mu" style={{ fontSize:9, padding:'3px 8px' }} onClick={() => { setRewardOpen(false); setAddingReward(false); }}>✕</button>
            </div>
            <div style={{ fontSize:9, color:'var(--text-muted)', marginBottom:14 }}>You have <span style={{ color:'#f5a623', fontWeight:'bold' }}>{points} pts</span></div>

            {/* Reward list */}
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
              {rewards.length === 0 && (
                <div style={{ fontSize:10, color:'var(--text-muted)', textAlign:'center', padding:'16px 0' }}>
                  No rewards yet.<br />Add one below!
                </div>
              )}
              {rewards.map(r => {
                const canAfford = points >= r.cost;
                return (
                  <div key={r.id} style={{
                    display:'flex', alignItems:'center', gap:9,
                    background:'var(--surface)', border:'1.5px solid var(--border)',
                    borderRadius:6, padding:'9px 11px',
                  }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, color:'var(--text)', marginBottom:2 }}>{r.label}</div>
                      <div style={{ fontSize:9, color:'#f5a623' }}>{r.cost} pts</div>
                    </div>
                    <button
                      className="fp-btn fp-btn-g"
                      style={{ fontSize:9, padding:'4px 9px', opacity: canAfford ? 1 : 0.4 }}
                      disabled={!canAfford}
                      onClick={() => {
                        const ok = redeemReward(r.id);
                        if (ok) {
                          if (sounds) Sounds.rewardRedeem(volume);
                          setShowConfetti(true);
                        }
                      }}
                    >
                      REDEEM
                    </button>
                    <button
                      onClick={() => deleteReward(r.id)}
                      style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:11, padding:'2px 4px' }}
                    >✕</button>
                  </div>
                );
              })}
            </div>

            {/* Add reward form */}
            {addingReward ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8, borderTop:'1px solid var(--border)', paddingTop:12 }}>
                <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>NEW REWARD</div>
                <input
                  className="fp-inp"
                  placeholder="Reward name (e.g. Coffee break)"
                  value={newRewardLabel}
                  onChange={e => setNewRewardLabel(e.target.value)}
                  autoFocus
                />
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input
                    className="fp-inp"
                    type="number"
                    placeholder="Cost in pts"
                    value={newRewardCost}
                    min={1}
                    onChange={e => setNewRewardCost(e.target.value)}
                    style={{ flex:1 }}
                  />
                  <span style={{ fontSize:9, color:'var(--text-muted)', whiteSpace:'nowrap' }}>pts</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="fp-btn fp-btn-g" style={{ flex:1 }} onClick={handleAddReward} disabled={!newRewardLabel.trim()}>ADD</button>
                  <button className="fp-btn fp-btn-mu" onClick={() => setAddingReward(false)}>CANCEL</button>
                </div>
              </div>
            ) : (
              <button
                className="fp-btn fp-btn-mu"
                style={{ width:'100%', fontSize:10, borderStyle:'dashed' }}
                onClick={() => setAddingReward(true)}
              >
                + ADD REWARD
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confetti burst on reward redeem */}
      {showConfetti && <ConfettiBurst onDone={() => setShowConfetti(false)} />}

      {/* Suppress unused wobbling warning */}
      {wobbling && null}
    </div>
  );
}
