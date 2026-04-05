import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import PilotDuck from './PilotDuck';

const SLIDES = [
  {
    icon: '▶',
    title: 'Focus Mode',
    desc: 'Stay locked in with Pomodoro sessions',
    accent: '#e94560',
    bg: 'rgba(233,69,96,0.07)',
    border: 'rgba(233,69,96,0.2)',
  },
  {
    icon: '◎',
    title: 'Countdowns',
    desc: 'Track important events and deadlines',
    accent: '#f5a623',
    bg: 'rgba(245,166,35,0.07)',
    border: 'rgba(245,166,35,0.2)',
  },
  {
    icon: '✎',
    title: 'Notes',
    desc: 'Capture your thoughts quickly',
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.07)',
    border: 'rgba(168,85,247,0.2)',
  },
  {
    icon: '♪',
    title: 'Lo-fi Player',
    desc: 'Stay in the zone with built-in music',
    accent: '#4ecca3',
    bg: 'rgba(78,204,163,0.07)',
    border: 'rgba(78,204,163,0.2)',
  },
];

export default function Onboarding() {
  const [phase, setPhase]         = useState<'boot' | 'main'>('boot');
  const [bootVis, setBootVis]     = useState(false);
  const [tagVis, setTagVis]       = useState(false);
  const [xpFill, setXpFill]       = useState(0);
  const [panelVis, setPanelVis]   = useState(false);
  const [slideIdx, setSlideIdx]   = useState(0);
  const [sliding, setSliding]     = useState(false);
  const [slideDir, setSlideDir]   = useState<'left' | 'right'>('right');

  const level                = useStore((s) => s.level);
  const setHasSeenOnboarding = useStore((s) => s.setHasSeenOnboarding);

  // Boot → main transition
  useEffect(() => {
    const t0 = setTimeout(() => setBootVis(true),   120);
    const t1 = setTimeout(() => setTagVis(true),    800);
    const t2 = setTimeout(() => setPhase('main'),   2400);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // XP bar + panel fade once main mounts
  useEffect(() => {
    if (phase !== 'main') return;
    setTimeout(() => {
      let pct = 0;
      const iv = setInterval(() => {
        pct += 3;
        setXpFill(Math.min(pct, 62));
        if (pct >= 62) clearInterval(iv);
      }, 18);
    }, 400);
    setTimeout(() => setPanelVis(true), 700);
  }, [phase]);

  function goToSlide(i: number) {
    if (i === slideIdx || sliding) return;
    setSlideDir(i > slideIdx ? 'right' : 'left');
    setSliding(true);
    setTimeout(() => { setSlideIdx(i); setSliding(false); }, 210);
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────
  if (phase === 'boot') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Courier New', Courier, monospace",
        opacity: bootVis ? 1 : 0,
        transition: 'opacity 0.7s ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 4px)',
        }} />
        <div style={{ marginBottom: 24, animation: 'fp-gentle-float 3.2s ease-in-out infinite' }}>
          <PilotDuck level={level} size={64} />
        </div>
        <div style={{ fontSize: 20, letterSpacing: 5, fontWeight: 'bold', color: 'var(--text)', marginBottom: 10 }}>
          FOCUSPILOT
        </div>
        <div style={{
          fontSize: 10, letterSpacing: 1, color: 'var(--text-muted)',
          opacity: tagVis ? 1 : 0, transition: 'opacity 0.8s ease',
        }}>
          Your productivity wingman.
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────
  const slide = SLIDES[slideIdx];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: "'Courier New', Courier, monospace",
    }}>
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '28px 24px 24px',
        width: '100%', maxWidth: 330,
        position: 'relative',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        animation: 'fp-slide-up 0.38s cubic-bezier(0.34,1.3,0.64,1)',
      }}>

        {/* GBA corner brackets */}
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
          }} />
        ))}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 14,
            animation: 'fp-bounce-in 0.55s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <PilotDuck level={level} size={56} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--text)', marginBottom: 5, letterSpacing: 0.3 }}>
            Welcome, Pilot.
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2 }}>
            LEVEL UP YOUR LIFE
          </div>
        </div>

        {/* XP bar — subtle, no labels */}
        <div style={{ marginBottom: 22 }}>
          <div style={{
            height: 3, background: 'var(--surface-2)',
            borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${xpFill}%`,
              background: 'linear-gradient(90deg, #4ecca3, #f5a623)',
              borderRadius: 2, transition: 'width 0.02s linear',
            }} />
          </div>
        </div>

        {/* Feature slideshow */}
        <div style={{
          opacity: panelVis ? 1 : 0,
          transform: panelVis ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}>

          {/* Slide card */}
          <div style={{
            borderRadius: 10,
            background: sliding ? 'var(--surface-2)' : slide.bg,
            border: `1px solid ${sliding ? 'var(--border)' : slide.border}`,
            padding: '22px 20px 20px',
            marginBottom: 14,
            minHeight: 130,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}>
            {/* Icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `rgba(${hexToRgb(slide.accent)}, 0.12)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: slide.accent,
              marginBottom: 12,
              opacity: sliding ? 0 : 1,
              transform: sliding
                ? `translateX(${slideDir === 'right' ? '-16px' : '16px'})`
                : 'translateX(0)',
              transition: 'opacity 0.21s ease, transform 0.21s ease',
            }}>
              {slide.icon}
            </div>

            {/* Text */}
            <div style={{
              opacity: sliding ? 0 : 1,
              transform: sliding
                ? `translateX(${slideDir === 'right' ? '-16px' : '16px'})`
                : 'translateX(0)',
              transition: 'opacity 0.21s ease, transform 0.21s ease',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 'bold', color: 'var(--text)',
                marginBottom: 6, letterSpacing: 0.3,
              }}>
                {slide.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {slide.desc}
              </div>
            </div>

            {/* Arrow buttons — inside, floating sides */}
            <button onClick={() => goToSlide((slideIdx - 1 + SLIDES.length) % SLIDES.length)} style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 10,
              padding: '6px', lineHeight: 1, opacity: 0.6,
            }}>◀</button>
            <button onClick={() => goToSlide((slideIdx + 1) % SLIDES.length)} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 10,
              padding: '6px', lineHeight: 1, opacity: 0.6,
            }}>▶</button>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
            {SLIDES.map((s, i) => (
              <div
                key={i}
                onClick={() => goToSlide(i)}
                style={{
                  width: i === slideIdx ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === slideIdx ? slide.accent : 'var(--border)',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <button
            className="fp-btn fp-btn-p fp-btn-full"
            style={{ fontSize: 11, padding: '12px 0', letterSpacing: 2 }}
            onClick={() => setHasSeenOnboarding(true)}
          >
            LET'S GO ▶
          </button>
        </div>

        {/* Subtle scanline */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 14, overflow: 'hidden',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 3px)',
        }} />
      </div>
    </div>
  );
}

// Helper: convert hex color to "r,g,b" string for rgba()
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
