import { useStore } from '../store/useStore';

export default function NoteDetailScreen() {
  const { notes, activeNoteId, deleteNote, setScreen, setActiveNoteId } = useStore();
  const note = notes.find(n => n.id === activeNoteId);

  if (!note) {
    setScreen('notes');
    return null;
  }

  function handleDelete() {
    deleteNote(note!.id);
    setScreen('notes');
    setActiveNoteId(null);
  }

  const isEmpty = !note.body || note.body.trim() === '';

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:600 }}>
      <div className="fp-hdr">
        <button className="fp-hbk" onClick={() => setScreen('notes')}>◀ BACK</button>
        <div className="fp-htitle" style={{ color: note.color }}>{note.title}</div>
        <div className="fp-hright">
          <button
            className="fp-btn fp-btn-p"
            style={{ fontSize:10, padding:'5px 10px' }}
            onClick={() => setScreen('note-edit')}
          >
            EDIT
          </button>
        </div>
      </div>

      <div className="fp-body">
        <div style={{ fontSize:8, color:'var(--text-muted)', marginBottom:14 }}>{note.time}</div>

        {isEmpty ? (
          <span style={{ color:'var(--text-muted)', fontSize:12 }}>No content.</span>
        ) : (
          <div
            className="fp-note-body"
            dangerouslySetInnerHTML={{ __html: note.body }}
          />
        )}
      </div>

      <div style={{ padding:'14px 16px', borderTop:'1px solid var(--border)' }}>
        <button className="fp-btn fp-btn-r fp-btn-full" onClick={handleDelete}>DELETE NOTE</button>
      </div>
    </div>
  );
}
