import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import ColorPalette from '../components/ColorPalette';

function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'PAST';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function CountdownScreen() {
  const { events, addEvent, deleteEvent, setScreen } = useStore();
  const [, setTick] = useState(0);
  const [name, setName]   = useState('');
  const [date, setDate]   = useState('');
  const [color, setColor] = useState('#f5a623');
  const [showForm, setShowForm] = useState(false);
  const [sortMode, setSortMode] = useState<'created' | 'upcoming'>('upcoming');

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function handleAdd() {
    if (!name.trim() || !date) return;
    addEvent(name.trim(), date, color);
    setName(''); setDate(''); setColor('#f5a623'); setShowForm(false);
  }

  const sorted = [...events].sort((a, b) =>
    sortMode === 'upcoming'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : b.created - a.created,
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:600 }}>
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('home')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color:'#f5a623' }}>COUNTDOWN</div>
        <div className="fp-hright">
          <button className="fp-btn fp-btn-g" style={{ fontSize:10, padding:'5px 10px' }} onClick={() => setShowForm(v => !v)}>+ ADD</button>
        </div>
      </div>

      {/* Sort bar — below header, no overlap with title */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'flex-end',
        gap:6, padding:'6px 16px',
        borderBottom:'1px solid var(--border)',
      }}>
        <span style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1, marginRight:4 }}>SORT</span>
        {(['upcoming','created'] as const).map(m => (
          <button
            key={m}
            onClick={() => setSortMode(m)}
            style={{
              background: sortMode === m ? 'rgba(245,166,35,0.12)' : 'transparent',
              border: `1px solid ${sortMode === m ? '#f5a623' : 'var(--border)'}`,
              color: sortMode === m ? '#f5a623' : 'var(--text-muted)',
              fontFamily:'inherit', fontSize:8, padding:'3px 8px',
              borderRadius:3, cursor:'pointer', letterSpacing:0.5,
              transition:'all 0.15s',
            }}
          >
            {m === 'upcoming' ? 'UPCOMING' : 'NEWEST'}
          </button>
        ))}
      </div>

      <div className="fp-body">
        {showForm && (
          <div style={{
            background:'var(--surface)', border:'1.5px solid var(--border)',
            borderRadius:6, padding:'12px 14px', marginBottom:14,
            display:'flex', flexDirection:'column', gap:10,
          }}>
            <input className="fp-inp fp-inp-g" placeholder="Event name" value={name} onChange={e => setName(e.target.value)} />
            <input className="fp-inp fp-inp-g" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={{ colorScheme:'dark' }} />
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>COLOR</div>
            <ColorPalette selected={color} onSelect={setColor} />
            <button className="fp-btn fp-btn-g fp-btn-full" onClick={handleAdd}>CREATE EVENT</button>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {sorted.length === 0 && (
            <div style={{ gridColumn:'1 / -1', fontSize:11, color:'var(--text-muted)', textAlign:'center', paddingTop:20 }}>
              No events yet. Add one above.
            </div>
          )}
          {sorted.map(ev => (
            <div key={ev.id} style={{
              background:'var(--surface)', border:`1.5px solid ${ev.color}33`,
              borderRadius:6, padding:'12px 11px', position:'relative',
            }}>
              <button
                onClick={() => deleteEvent(ev.id)}
                style={{ position:'absolute', top:6, right:8, background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:10 }}
              >✕</button>
              <div style={{ fontSize:10, fontWeight:'bold', color:ev.color, marginBottom:6, paddingRight:14, wordBreak:'break-word' }}>{ev.name}</div>
              <div style={{ fontSize:13, fontWeight:'bold', color:'var(--text)', letterSpacing:1 }}>{getCountdown(ev.date)}</div>
              <div style={{ fontSize:8, color:'var(--text-muted)', marginTop:4 }}>{new Date(ev.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
