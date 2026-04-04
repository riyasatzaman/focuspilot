import { useStore } from '../store/useStore';

export default function NotificationsScreen() {
  const { nlog, clearNlog, setScreen } = useStore();

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:600 }}>
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('home')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color:'var(--text)' }}>NOTIFICATIONS</div>
        {nlog.length > 0 && (
          <div className="fp-hright">
            <button className="fp-btn fp-btn-mu" style={{ fontSize:10, padding:'5px 10px' }} onClick={clearNlog}>CLEAR</button>
          </div>
        )}
      </div>

      <div className="fp-body">
        {nlog.length === 0 && (
          <div style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', paddingTop:20 }}>
            No notifications yet.
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {nlog.map((n, i) => (
            <div key={i} style={{
              background:'var(--surface)', border:`1.5px solid ${n.color}33`,
              borderLeft:`3px solid ${n.color}`,
              borderRadius:6, padding:'10px 12px',
            }}>
              <div style={{ fontSize:10, color:'var(--text)' }}>{n.msg}</div>
              <div style={{ fontSize:8, color:'var(--text-muted)', marginTop:4 }}>{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
