interface Props {
  pct: number;
  height?: number;
}

export default function XPBar({ pct, height = 7 }: Props) {
  return (
    <div
      className="fp-xp-track"
      style={{
        height,
        background: 'rgba(0,0,0,0.35)',
        borderRadius: 3,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        className="fp-xp-fill"
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg,#a855f7,#3b82f6)',
          transition: 'width 0.5s',
          borderRadius: 3,
        }}
      />
    </div>
  );
}
