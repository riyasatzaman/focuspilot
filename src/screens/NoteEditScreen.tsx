import { useState } from 'react';
import { useStore } from '../store/useStore';
import ColorPalette from '../components/ColorPalette';
import RichTextEditor from '../components/RichTextEditor';

export default function NoteEditScreen() {
  const { notes, activeNoteId, updateNote, setScreen } = useStore();
  const note = notes.find(n => n.id === activeNoteId);

  const [title, setTitle] = useState(note?.title ?? '');
  const [body,  setBody]  = useState(note?.body  ?? '');
  const [color, setColor] = useState(note?.color ?? '#a855f7');

  if (!note) {
    setScreen('notes');
    return null;
  }

  function handleSave() {
    if (!title.trim()) return;
    updateNote(note!.id, title.trim(), body, color);
    setScreen('note-detail');
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:600 }}>
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('note-detail')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color:'#a855f7' }}>EDIT NOTE</div>
      </div>

      <div className="fp-body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <input className="fp-inp fp-inp-p" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <RichTextEditor value={body} onChange={setBody} minHeight={220} />
        <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1 }}>COLOR</div>
        <ColorPalette selected={color} onSelect={setColor} />
        <button className="fp-btn fp-btn-p fp-btn-full" onClick={handleSave}>SAVE</button>
      </div>
    </div>
  );
}
