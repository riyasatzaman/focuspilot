import { useEffect, useRef } from 'react';

const SPRITE_COLORS = [
  ['#f5a623','#c8780f','#4ecca3'],
  ['#4ecca3','#2aa882','#f5a623'],
  ['#3b82f6','#1d5fd4','#a855f7'],
  ['#a855f7','#7e28d4','#22d3ee'],
  ['#e94560','#b52c46','#f5a623'],
  ['#f5a623','#e94560','#a855f7'],
];

function drawSprite(ctx: CanvasRenderingContext2D, level: number, size: number) {
  const spriteIndex = Math.min(Math.floor(level / 2), 2);
  const colorIndex = Math.min(level, 5);
  const s = SPRITE_COLORS[colorIndex];
  const scale = size / 48;
  ctx.save();
  ctx.scale(scale, scale);

  if (spriteIndex === 0) {
    ctx.fillStyle=s[0]; ctx.fillRect(12,8,24,18);
    ctx.fillStyle=s[1]; ctx.fillRect(14,26,20,13);
    ctx.fillStyle='#fff'; ctx.fillRect(14,12,7,7); ctx.fillRect(25,12,7,7);
    ctx.fillStyle='#111'; ctx.fillRect(16,14,4,4); ctx.fillRect(27,14,4,4);
    ctx.fillStyle=s[0]; ctx.fillRect(6,16,8,10); ctx.fillRect(34,16,8,10);
    ctx.fillStyle=s[2]; ctx.fillRect(16,38,7,5); ctx.fillRect(25,38,7,5);
  } else if (spriteIndex === 1) {
    ctx.fillStyle=s[0]; ctx.fillRect(10,6,28,20);
    ctx.fillStyle=s[1]; ctx.fillRect(12,26,24,13);
    ctx.fillStyle='#fff'; ctx.fillRect(13,11,8,8); ctx.fillRect(27,11,8,8);
    ctx.fillStyle='#111'; ctx.fillRect(15,13,4,4); ctx.fillRect(29,13,4,4);
    ctx.fillStyle=s[0]; ctx.fillRect(4,14,8,12); ctx.fillRect(36,14,8,12);
    ctx.fillStyle=s[1]; ctx.fillRect(18,3,12,6);
    ctx.fillStyle=s[2]; ctx.fillRect(14,38,8,5); ctx.fillRect(26,38,8,5);
  } else {
    ctx.fillStyle=s[0]; ctx.fillRect(8,4,32,22);
    ctx.fillStyle=s[1]; ctx.fillRect(10,26,28,14);
    ctx.fillStyle='#fff'; ctx.fillRect(11,9,9,9); ctx.fillRect(28,9,9,9);
    ctx.fillStyle='#111'; ctx.fillRect(13,11,5,5); ctx.fillRect(30,11,5,5);
    ctx.fillStyle=s[0]; ctx.fillRect(2,13,8,12); ctx.fillRect(38,13,8,12);
    ctx.fillStyle=s[1]; ctx.fillRect(17,1,14,6);
    ctx.fillStyle=s[2]; ctx.fillRect(12,39,9,5); ctx.fillRect(27,39,9,5);
    ctx.fillStyle=s[0]; ctx.fillRect(20,0,8,4);
  }
  ctx.restore();
}

interface Props {
  level: number;
  size: number;
}

export default function PilotDuck({ level, size }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    drawSprite(ctx, level, size);
  }, [level, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
