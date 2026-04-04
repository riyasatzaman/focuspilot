import { useState } from 'react';
import { useStore } from '../store/useStore';
import ColorPalette from '../components/ColorPalette';
import RichTextEditor, { stripNoteHtml } from '../components/RichTextEditor';

export default function NotesScreen() {
  const { notes, addNote, setScreen, setActiveNoteId } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body,  setBody]  = useState('');
  const [color, setColor] = useState('#a855f7');
  const [sortMode, setSortMode] = useState<'created' | 'edited'>('edited');

  function handleAdd() {
    if (!title.trim()) return;
    addNote(title.trim(), body, color);
    setTitle(''); setBody(''); setColor('#a855f7'); setShowForm(false);
  }

  const sorted = [...notes].sort((a, b) =>
    sortMode === 'edited'
      ? (b.editedAt ?? b.id) - (a.editedAt ?? a.id)
      : (b.createdAt ?? b.id) - (a.createdAt ?? a.id),
  );

  function openNote(id: number) {
    setActiveNoteId(id);
    setScreen('note-detail');
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:600 }}>
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('home')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color:'#a855f7' }}>NOTES</div>
        <div className="fp-hright">
          <button className="fp-btn fp-btn-p" style={{ fontSize:10, padding:'5px 10px' }} onClick={() => setShowForm(v => !v)}>+ NEW</button>
        </div>
      </div>

      {/* Sort bar — below header, no overlap with title */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'flex-end',
        gap:6, padding:'6px 16px',
        borderBottom:'1px solid var(--border)',
      }}>
        <span style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1, marginRight:4 }}>SORT</span>
        {(['edited','created'] as const).map(m => (
          <button
            key={m}
            onClick={() => setSortMode(m)}
            style={{
              background: sortMode === m ? 'rgba(168,85,247,0.12)' : 'transparent',
              border: `1px solid ${sortMode === m ? '#a855f7' : 'var(--border)'}`,
              color: sortMode === m ? '#a855f7' : 'var(--text-muted)',
              fontFamily:'inherit', fontSize:8, padding:'3px 8px',
              borderRadius:3, cursor:'pointer', letterSpacing:0.5,
              transition:'all 0.15s',
            }}
          >
            {m === 'edited' ? 'LAST EDITED' : 'DATE CREATED'}
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
            <input className="fp-inp fp-inp-p" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <RichTextEditor value={body} onChange={setBody} minHeight={130} />
            <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>COLOR</div>
            <ColorPalette selected={color} onSelect={setColor} />
            <button className="fp-btn fp-btn-p fp-btn-full" onClick={handleAdd}>SAVE NOTE</button>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {sorted.length === 0 && (
            <div style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center', paddingTop:20 }}>No notes yet.</div>
          )}
          {sorted.map(note => (
            <div
              key={note.id}
              onClick={() => openNote(note.id)}
              style={{
                background:'var(--surface)', border:`1.5px solid ${note.color}33`,
                borderLeft:`3px solid ${note.color}`,
                borderRadius:6, padding:'12px 14px', cursor:'pointer',
                transition:'background 0.15s',
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <div style={{ fontSize:12, fontWeight:'bold', color:'var(--text)' }}>{note.title}</div>
                <div style={{ fontSize:8, color:'var(--text-muted)', flexShrink:0 }}>{note.time}</div>
              </div>
              {note.body && (
                <div style={{
                  fontSize:10, color:'var(--text-muted)', marginTop:5,
                  overflow:'hidden', display:'-webkit-box',
                  WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                }}>
                  {stripNoteHtml(note.body)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
