/**
 * ColorPalette — 5 quick-pick presets + a full color-wheel picker.
 * The native <input type="color"> opens the OS color-wheel on click.
 */

// The 5 main colours shown as swatches
const PRESETS = ['#e94560', '#f5a623', '#a855f7', '#4ecca3', '#3b82f6'];

interface Props {
  selected: string;
  onSelect: (color: string) => void;
}

export default function ColorPalette({ selected, onSelect }: Props) {
  const isCustom = !PRESETS.includes(selected);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {/* 5 preset swatches */}
      {PRESETS.map(c => (
        <div
          key={c}
          onClick={() => onSelect(c)}
          style={{
            width: 22, height: 22,
            borderRadius: 4,
            background: c,
            cursor: 'pointer',
            border: selected === c ? '2.5px solid #fff' : '2px solid transparent',
            transform: selected === c ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.12s, border 0.12s',
            flexShrink: 0,
          }}
        />
      ))}

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />

      {/* Custom color-wheel picker */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <label
          title="Pick any colour"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 4,
            cursor: 'pointer',
            border: isCustom ? '2.5px solid #fff' : '1.5px solid var(--border-2)',
            background: isCustom ? selected : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            transform: isCustom ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.12s, border 0.12s',
            overflow: 'hidden',
          }}
        >
          <input
            type="color"
            value={isCustom ? selected : '#ffffff'}
            onChange={e => onSelect(e.target.value)}
            style={{
              position: 'absolute', opacity: 0,
              width: '100%', height: '100%',
              cursor: 'pointer', border: 'none', padding: 0,
            }}
          />
        </label>
      </div>
    </div>
  );
}
