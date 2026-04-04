/**
 * RichTextEditor — contenteditable div with a retro toolbar.
 * Toolbar: font family (5 options) | size − n + | B I U
 *
 * Storage format: the emitted value is a self-contained HTML string
 *   <div data-fp-note style="font-family:X; font-size:Ypx">...content...</div>
 * so font/size round-trip correctly. Use stripNoteHtml() to get plain text.
 */
import { useRef, useEffect, useState, useCallback } from 'react';

export const EDITOR_FONTS = [
  { label: 'MONO',    value: "'Courier New', Courier, monospace" },
  { label: 'SERIF',   value: "Georgia, 'Times New Roman', serif" },
  { label: 'SANS',    value: "Arial, Helvetica, sans-serif" },
  { label: 'ROUND',   value: "Verdana, Geneva, sans-serif" },
  { label: 'ELEGANT', value: "'Palatino Linotype', Palatino, serif" },
];

const SIZE_MIN     = 10;
const SIZE_MAX     = 26;
const SIZE_DEFAULT = 13;

// ── Serialize / deserialize ───────────────────────────────────────────────────

function serialize(innerHtml: string, fontFamily: string, fontSize: number): string {
  return `<div data-fp-note style="font-family:${fontFamily};font-size:${fontSize}px">${innerHtml}</div>`;
}

function deserialize(value: string): { html: string; fontFamily: string; fontSize: number } {
  // Plain-text or legacy content — no wrapper
  if (!value.includes('data-fp-note')) {
    return { html: value, fontFamily: EDITOR_FONTS[0].value, fontSize: SIZE_DEFAULT };
  }
  // Parse the wrapper
  const tmp = document.createElement('div');
  tmp.innerHTML = value;
  const fp = tmp.querySelector('[data-fp-note]') as HTMLElement | null;
  if (!fp) return { html: value, fontFamily: EDITOR_FONTS[0].value, fontSize: SIZE_DEFAULT };
  return {
    html: fp.innerHTML,
    fontFamily: fp.style.fontFamily || EDITOR_FONTS[0].value,
    fontSize: parseInt(fp.style.fontSize) || SIZE_DEFAULT,
  };
}

/** Strip all HTML tags — use for plain-text previews */
export function stripNoteHtml(value: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = value;
  return tmp.textContent ?? tmp.innerText ?? '';
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Note body...',
  minHeight = 180,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const mounted   = useRef(false);

  // Deserialize once on construction to seed state
  const initial = deserialize(value);
  const [font, setFont]           = useState(initial.fontFamily);
  const [size, setSize]           = useState(initial.fontSize);
  const [bold, setBold]           = useState(false);
  const [italic, setItalic]       = useState(false);
  const [underline, setUnderline] = useState(false);

  // Populate editor with inner html only (not the outer wrapper)
  useEffect(() => {
    if (editorRef.current && !mounted.current) {
      const { html, fontFamily, fontSize } = deserialize(value);
      editorRef.current.innerHTML        = html;
      editorRef.current.style.fontFamily = fontFamily;
      editorRef.current.style.fontSize   = `${fontSize}px`;
      mounted.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
  }, []);

  // ── Selection helpers ────────────────────────────────────────────────────
  const savedRange = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    editorRef.current?.focus();
  };

  // ── Emit change: serialize inner html + current font/size ────────────────
  const emitChange = useCallback((overrideFont?: string, overrideSize?: number) => {
    if (!editorRef.current) return;
    const inner = editorRef.current.innerHTML;
    const f = overrideFont ?? font;
    const s = overrideSize ?? size;
    onChange(serialize(inner, f, s));
  }, [font, size, onChange]);

  const syncActiveStates = () => {
    setBold(document.queryCommandState('bold'));
    setItalic(document.queryCommandState('italic'));
    setUnderline(document.queryCommandState('underline'));
  };

  const exec = (cmd: string, val?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, val ?? '');
    editorRef.current?.focus();
    syncActiveStates();
    emitChange();
  };

  const applyFont = (f: string) => {
    setFont(f);
    if (editorRef.current) {
      editorRef.current.style.fontFamily = f;
      editorRef.current.focus();
    }
    // Pass new font directly since state update is async
    if (editorRef.current) {
      const inner = editorRef.current.innerHTML;
      onChange(serialize(inner, f, size));
    }
  };

  const applySize = (s: number) => {
    setSize(s);
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${s}px`;
      editorRef.current.focus();
    }
    if (editorRef.current) {
      const inner = editorRef.current.innerHTML;
      onChange(serialize(inner, font, s));
    }
  };

  // ── Toolbar button style ─────────────────────────────────────────────────
  const tbBtn = (active = false): React.CSSProperties => ({
    background: active ? 'rgba(168,85,247,0.15)' : 'transparent',
    border: `1px solid ${active ? '#a855f7' : 'var(--border)'}`,
    color: active ? '#a855f7' : 'var(--text-muted)',
    fontFamily: 'inherit',
    fontSize: 11,
    padding: '3px 7px',
    borderRadius: 3,
    cursor: 'pointer',
    transition: 'all 0.12s',
    lineHeight: 1.4,
    flexShrink: 0,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
        background: 'var(--surface)', border: '1.5px solid var(--inp-border)',
        borderBottom: 'none', borderRadius: '4px 4px 0 0',
        padding: '5px 8px',
      }}>

        {/* Font selector */}
        <select
          value={font}
          onChange={e => applyFont(e.target.value)}
          onMouseDown={saveSelection}
          style={{
            background: 'var(--inp-bg)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontFamily: 'inherit',
            fontSize: 9, padding: '3px 5px', borderRadius: 3,
            outline: 'none', cursor: 'pointer', letterSpacing: 0.5,
          }}
        >
          {EDITOR_FONTS.map(f => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>

        <div style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />

        {/* Size − n + */}
        <button
          style={{ ...tbBtn(), padding: '3px 7px', fontSize: 14 }}
          onMouseDown={e => { e.preventDefault(); saveSelection(); applySize(Math.max(SIZE_MIN, size - 1)); }}
        >−</button>
        <span style={{ fontSize: 10, color: 'var(--text)', minWidth: 18, textAlign: 'center', flexShrink: 0 }}>{size}</span>
        <button
          style={{ ...tbBtn(), padding: '3px 7px', fontSize: 14 }}
          onMouseDown={e => { e.preventDefault(); saveSelection(); applySize(Math.min(SIZE_MAX, size + 1)); }}
        >+</button>

        <div style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />

        {/* B I U */}
        <button style={{ ...tbBtn(bold), fontWeight: 'bold' }}
          onMouseDown={e => { e.preventDefault(); saveSelection(); exec('bold'); }} title="Bold">B</button>
        <button style={{ ...tbBtn(italic), fontStyle: 'italic' }}
          onMouseDown={e => { e.preventDefault(); saveSelection(); exec('italic'); }} title="Italic">I</button>
        <button style={{ ...tbBtn(underline), textDecoration: 'underline' }}
          onMouseDown={e => { e.preventDefault(); saveSelection(); exec('underline'); }} title="Underline">U</button>
      </div>

      {/* ── Editor area ──────────────────────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => emitChange()}
        onKeyUp={syncActiveStates}
        onMouseUp={syncActiveStates}
        onSelect={syncActiveStates}
        onFocus={syncActiveStates}
        style={{
          minHeight,
          fontFamily: font,
          fontSize: size,
          color: 'var(--text)',
          background: 'var(--inp-bg)',
          border: '1.5px solid var(--inp-border)',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          padding: '10px 12px',
          outline: 'none',
          lineHeight: 1.7,
          wordBreak: 'break-word',
          overflowY: 'auto',
          transition: 'border-color 0.15s',
        }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = '#a855f7')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--inp-border)')}
      />
      <style>{`[data-placeholder]:empty:before{content:attr(data-placeholder);color:var(--text-muted);pointer-events:none}`}</style>
    </div>
  );
}
