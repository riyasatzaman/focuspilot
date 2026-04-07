import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import PilotDuck from '../components/PilotDuck';
import XPBar from '../components/XPBar';
import StatGrid from '../components/StatGrid';
import { xpInfo } from '../constants/levels';
import { Sounds } from '../utils/sounds';

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

  const { xp, level, points, stats, setScreen, sounds, volume, rewards, addReward, deleteReward, redeemReward, pomoRunning, pomoSecs, pomoPhase } = useStore();
  const info = xpInfo(xp);

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
