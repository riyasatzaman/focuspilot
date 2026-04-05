import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import PilotDuck from './PilotDuck';

const STATS = [
  { label: 'Strength',     color: '#e94560' },
  { label: 'Skills',       color: '#4ecca3' },
  { label: 'Intelligence', color: '#3b82f6' },
  { label: 'Vitality',     color: '#a855f7' },
  { label: 'Senses',       color: '#f5a623' },
];

export default function Onboarding() {
  const [phase, setPhase] = useState<'boot' | 'main'>('boot');
  const [bootDone, setBootDone] = useState(false);
  const [statsVisible, setStatsVisible] = useState<boolean[]>(Array(STATS.length).fill(false));
  const [xpFill, setXpFill] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);

  const level = useStore((s) => s.level);
  const setHasSeenOnboarding = useStore((s) => s.setHasSeenOnboarding);
  const sounds = useStore((s) => s.sounds);
  const volume = useStore((s) => s.volume);

  // Boot sequence: flicker → "ACTIVATED" → fade to main
  useEffect(() => {
    const t1 = setTimeout(() => setBootDone(true), 1300);
    const t2 = setTimeout(() => setPhase('main'), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Staggered animations once main phase starts
  useEffect(() => {
    if (phase !== 'main') return;

    STATS.forEach((_, i) => {
      setTimeout(() => {
        setStatsVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 300 + i * 300);
    });

    // XP bar fill
    setTimeout(() => {
      let pct = 0;
      const iv = setInterval(() => {
        pct += 3;
        setXpFill(Math.min(pct, 68));
        if (pct >= 68) clearInterval(iv);
      }, 20);
    }, 400);

    // Main content fade-in
    setTimeout(() => setContentVisible(true), 2000);
  }, [phase]);

  function handleBegin() {
    // Play UI click via Web Audio if sounds enabled
    if (sounds && volume) {
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(520, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.08);
        g.gain.setValueAtTime(volume / 100 * 0.07, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        o.start(); o.stop(ctx.currentTime + 0.08);
      } catch { /* ignore */ }
    }
    setHasSeenOnboarding(true);
  }

  // ── Boot screen ─────────────────────────────────────────────────────────────
  if (phase === 'boot') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Courier New', Courier, monospace",
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
        }} />

        <div style={{
          fontSize: 22, letterSpacing: 5, color: '#f5a623',
          fontWeight: 'bold', marginBottom: 20,
          animation: 'fp-flicker 0.12s infinite alternate',
        }}>
          FOCUSPILOT
        </div>

        <div style={{
          fontSize: 10, letterSpacing: 3,
          color: bootDone ? '#4ecca3' : 'rgba(78,204,163,0.6)',
          transition: 'color 0.3s',
          animation: bootDone ? 'none' : 'fp-flicker 0.25s infinite alternate',
        }}>
          {bootDone ? 'SYSTEM ACTIVATED.' : 'SYSTEM INITIALIZING...'}
        </div>

        {/* Progress dots */}
        {!bootDone && (
          <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 4, height: 4, borderRadius: '50%',
                background: '#4ecca3',
                animation: `fp-dot-blink 0.9s ${i * 0.3}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Main onboarding screen ───────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      fontFamily: "'Courier New', Courier, monospace",
    }}>
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '22px 20px 20px',
        width: '100%',
        maxWidth: 340,
        position: 'relative',
        boxShadow: '0 0 0 1px rgba(78,204,163,0.15), 0 0 30px rgba(78,204,163,0.08)',
        animation: 'fp-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* GBA-style corner brackets */}
        {(['tl','tr','bl','br'] as const).map((pos) => (
          <div key={pos} style={{
            position: 'absolute',
            top:    pos.startsWith('t') ? -1 : undefined,
            bottom: pos.startsWith('b') ? -1 : undefined,
            left:   pos.endsWith('l')   ? -1 : undefined,
            right:  pos.endsWith('r')   ? -1 : undefined,
            width: 10, height: 10,
            borderTop:    pos.startsWith('t') ? '2px solid #4ecca3' : undefined,
            borderBottom: pos.startsWith('b') ? '2px solid #4ecca3' : undefined,
            borderLeft:   pos.endsWith('l')   ? '2px solid #4ecca3' : undefined,
            borderRight:  pos.endsWith('r')   ? '2px solid #4ecca3' : undefined,
            borderRadius: pos === 'tl' ? '2px 0 0 0' : pos === 'tr' ? '0 2px 0 0' : pos === 'bl' ? '0 0 0 2px' : '0 0 2px 0',
          }} />
        ))}

        {/* System badge */}
        <div style={{
          textAlign: 'center', marginBottom: 14,
          animation: 'fp-fadein 0.4s ease',
        }}>
          <div style={{ fontSize: 8, letterSpacing: 3, color: '#4ecca3', marginBottom: 10 }}>
            ▸ SYSTEM ACTIVATED ◂
          </div>

          {/* Mascot */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 10,
            animation: 'fp-bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <PilotDuck level={level} size={52} />
          </div>

          <div style={{ fontSize: 17, fontWeight: 'bold', letterSpacing: 1, color: 'var(--text)', marginBottom: 2 }}>
            Welcome, Pilot.
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>
            YOUR TRAINING BEGINS NOW
          </div>
        </div>

        {/* Stats initializing */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 7 }}>
            STATS INITIALIZING
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 10px' }}>
            {STATS.map((stat, i) => (
              <div key={stat.label} style={{
                fontSize: 9, letterSpacing: 0.5,
                color: statsVisible[i] ? stat.color : 'transparent',
                transition: 'color 0.25s, transform 0.3s',
                transform: statsVisible[i] ? 'translateY(0)' : 'translateY(5px)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <span>{stat.label}</span>
                <span style={{ fontSize: 10, fontWeight: 'bold' }}>↑</span>
              </div>
            ))}
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 8, letterSpacing: 1, color: 'var(--text-muted)' }}>XP</div>
            <div style={{ fontSize: 8, color: '#f5a623', letterSpacing: 1 }}>LV. 1</div>
          </div>
          <div style={{
            height: 5, background: 'var(--surface-2)',
            borderRadius: 3, overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              height: '100%',
              width: `${xpFill}%`,
              background: 'linear-gradient(90deg, #4ecca3, #f5a623)',
              borderRadius: 3,
              transition: 'width 0.02s linear',
            }} />
          </div>
        </div>

        {/* Main content */}
        <div style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <div style={{
            fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.9,
            marginBottom: 12,
            borderTop: '1px solid var(--border)',
            paddingTop: 12,
          }}>
            <div>▸ Complete focus sessions to gain <span style={{ color: '#f5a623' }}>XP</span></div>
            <div>▸ Build <span style={{ color: '#4ecca3' }}>stats</span> through consistent training</div>
            <div>▸ Earn <span style={{ color: '#a855f7' }}>points</span> · redeem real-life rewards</div>
          </div>

          {/* Closing tagline */}
          <div style={{
            textAlign: 'center',
            fontSize: 9, letterSpacing: 2,
            color: 'var(--text-muted)',
            marginBottom: 16,
            fontStyle: 'italic',
          }}>
            "Train. Focus. Level up."
          </div>

          <button
            className="fp-btn fp-btn-p fp-btn-full"
            style={{ fontSize: 11, padding: '11px 0', letterSpacing: 2 }}
            onClick={handleBegin}
          >
            ▶ BEGIN TRAINING
          </button>
        </div>

        {/* Subtle scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 10, overflow: 'hidden',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 3px)',
        }} />
      </div>
    </div>
  );
}
