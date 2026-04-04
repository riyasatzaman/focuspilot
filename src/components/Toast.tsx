import { useEffect, useState } from 'react';

interface Props {
  msg: string;
  color: string;
  onDone: () => void;
}

export default function Toast({ msg, color, onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:'fixed',
      bottom:24,
      left:'50%',
      transform:`translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0,
      transition:'all 0.3s',
      background:'var(--bg-panel)',
      border:`1.5px solid ${color}`,
      color,
      fontFamily:"'Courier New', Courier, monospace",
      fontSize:11,
      padding:'9px 16px',
      borderRadius:6,
      letterSpacing:'0.5px',
      zIndex:1000,
      whiteSpace:'nowrap',
    }}>
      {msg}
    </div>
  );
}
