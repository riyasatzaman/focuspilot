import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import PilotDuck from './PilotDuck';

const STATS = [
  { label: 'Strength',     color: '#e94560' },
  { label: 'Skills',       color: '#4ecca3' },
  { label: 'Intelligence', color: '#3b82f6' },
  { label: 'Vitality',     color: '#a855f7' },
];

const SLIDES = [
  { icon: '▶', iconColor: '#e94560', title: 'Focus Mode',    desc: 'Stay locked in with Pomodoro sessions'         },
  { icon: '◎', iconColor: '#f5a623', title: 'Countdowns',    desc: 'Track important events and deadlines'           },
  { icon: '✎', iconColor: '#a855f7', title: 'Notes',         desc: 'Capture thoughts quickly'                       },
  { icon: '♪', iconColor: '#4ecca3', title: 'Lo-fi Player',  desc: 'Stay in the zone with built-in music'          },
];

export default function Onboarding() {
  const [phase, setPhase]           = useState<'boot' | 'main'>('boot');
  const [bootVis, setBootVis]       = useState(false);
  const [taglineVis, setTaglineVis] = useState(false);
  const [statsVis, setStatsVis]     = useState<boolean[]>(Array(STATS.length).fill(false));
  const [xpFill, setXpFill]         = useState(0);
  const [contentVis, setContentVis] = useState(false);
  const [slideIdx, setSlideIdx]     = useState(0);
  const [sliding, setSliding]       = useState(false);
  const [slideDir, setSlideDir]     = useState<'left' | 'right'>('right');

  const level               = useStore((s) => s.level);
  const setHasSeenOnboarding = useStore((s) => s.setHasSeenOnboarding);

  // Boot: fade in logo → tagline → transition to main
  useEffect(() => {
    const t0 = setTimeout(() => setBootVis(true),    120);
    const t1 = setTimeout(() => setTaglineVis(true), 800);
    const t2 = setTimeout(() => setPhase('main'),    2400);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Main: stagger stats → fill XP → fade content
  useEffect(() => {
    if (phase !== 'main') return;

    STATS.forEach((_, i) => {
      setTimeout(() => {
        setStatsVis((prev) => { const n = [...prev]; n[i] = true; return n; });
      }, 200 + i * 280);
    });

    setTimeout(() => {
      let pct = 0;
      const iv = setInterval(() => {
        pct += 3;
        setXpFill(Math.min(pct, 65));
        if (pct >= 65) clearInterval(iv);
      }, 20);
    }, 300);

    setTimeout(() => setContentVis(true), 1800);
  }, [phase]);

  function goToSlide(i: number) {
    if (i === slideIdx || sliding) return;
    setSlideDir(i > slideIdx ? 'right' : 'left');
    setSliding(true);
    setTimeout(() => { setSlideIdx(i); setSliding(false); }, 210);
  }

  function prevSlide() { goToSlide((slideIdx - 1 + SLIDES.length) % SLIDES.length); }
  function nextSlide() { goToSlide((slideIdx + 1) % SLIDES.length); }

  // ── Boot ─────────────────────────────────────────────────────────────────────
  if (phase === 'boot') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0,
        fontFamily: "'Courier New', Courier, monospace",
        opacity: bootVis ? 1 : 0,
        transition: 'opacity 0.7s ease',
      }}>
        {/* Very light pixel shimmer */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 4px)',
        }} />

        {/* Floating mascot */}
        <div style={{ marginBottom: 22, animation: 'fp-gentle-float 3.2s ease-in-out infinite' }}>
          <PilotDuck level={level} size={62} />
        </div>

        {/* Title */}
        <div style={{
          fontSize: 20, letterSpacing: 5, fontWeight: 'bold',
          color: 'var(--text)', marginBottom: 10,
          opacity: bootVis ? 1 : 0,
          transition: 'opacity 0.7s ease 0.2s',
        }}>
          FOCUSPILOT
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 10, letterSpacing: 1,
          color: 'var(--text-muted)',
          opacity: taglineVis ? 1 : 0,
          transition: 'opacity 0.8s ease',
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
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      fontFamily: "'Courier New', Courier, monospace",
    }}>
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '22px 20px 20px',
        width: '100%', maxWidth: 340,
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        animation: 'fp-slide-up 0.38s cubic-bezier(0.34,1.3,0.64,1)',
      }}>

        {/* GBA pixel corner brackets */}
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
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 11,
            animation: 'fp-bounce-in 0.55s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <PilotDuck level={level} size={52} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5, color: 'var(--text)', marginBottom: 3 }}>
            Welcome, Pilot.
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>
            LEVEL UP YOUR LIFE
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 11 }}>
          <div style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 6 }}>STATS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px' }}>
            {STATS.map((stat, i) => (
              <div key={stat.label} style={{
                fontSize: 9,
                color: statsVis[i] ? stat.color : 'transparent',
                transition: 'color 0.3s ease, transform 0.3s ease',
                transform: statsVis[i] ? 'translateY(0)' : 'translateY(5px)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                {stat.label} <span style={{ fontWeight: 'bold' }}>↑</span>
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
            borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)',
          }}>
            <div style={{
              height: '100%', width: `${xpFill}%`,
              background: 'linear-gradient(90deg, #4ecca3, #f5a623)',
              borderRadius: 3, transition: 'width 0.02s linear',
            }} />
          </div>
        </div>

        {/* Feature slideshow */}
        <div style={{
          opacity: contentVis ? 1 : 0,
          transform: contentVis ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          {/* Slide panel */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '14px 36px', marginBottom: 10,
            minHeight: 88, overflow: 'hidden', position: 'relative',
          }}>
            {/* Slide content */}
            <div style={{
              textAlign: 'center',
              opacity: sliding ? 0 : 1,
              transform: sliding
                ? `translateX(${slideDir === 'right' ? '-18px' : '18px'})`
                : 'translateX(0)',
              transition: 'opacity 0.21s ease, transform 0.21s ease',
            }}>
              <div style={{ fontSize: 26, color: slide.iconColor, marginBottom: 8, lineHeight: 1 }}>
                {slide.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--text)', marginBottom: 4, letterSpacing: 0.3 }}>
                {slide.title}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                {slide.desc}
              </div>
            </div>

            {/* Arrow buttons */}
            <button onClick={prevSlide} style={{
              position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 11,
              padding: '4px 6px', lineHeight: 1,
            }}>◀</button>
            <button onClick={nextSlide} style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 11,
              padding: '4px 6px', lineHeight: 1,
            }}>▶</button>
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                onClick={() => goToSlide(i)}
                style={{
                  width: i === slideIdx ? 18 : 6, height: 6, borderRadius: 3,
                  background: i === slideIdx ? '#4ecca3' : 'var(--border)',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <button
            className="fp-btn fp-btn-p fp-btn-full"
            style={{ fontSize: 11, padding: '11px 0', letterSpacing: 2 }}
            onClick={() => setHasSeenOnboarding(true)}
          >
            LET'S GO ▶
          </button>
        </div>

        {/* Subtle scanline */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 12, overflow: 'hidden',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.018) 0px, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 3px)',
        }} />
      </div>
    </div>
  );
}
