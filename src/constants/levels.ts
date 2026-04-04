export const LEVELS = [
  { title: 'FLEDGLING', xp: 100,  color: '#8899aa' },
  { title: 'SCOUT',     xp: 200,  color: '#4ecca3' },
  { title: 'NAVIGATOR', xp: 350,  color: '#3b82f6' },
  { title: 'AVIATOR',   xp: 550,  color: '#a855f7' },
  { title: 'ACE',       xp: 800,  color: '#e94560' },
  { title: 'LEGEND',    xp: 9999, color: '#f5a623' },
];

/** Returns { level, title, xpInLevel, xpNeeded, pct } for a given cumulative XP */
export function xpInfo(totalXp: number) {
  let cumulative = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    const threshold = cumulative + LEVELS[i].xp;
    if (totalXp < threshold || i === LEVELS.length - 1) {
      const xpInLevel = totalXp - cumulative;
      const xpNeeded = LEVELS[i].xp;
      return {
        level: i,
        title: LEVELS[i].title,
        color: LEVELS[i].color,
        xpInLevel,
        xpNeeded,
        pct: Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)),
      };
    }
    cumulative = threshold;
  }
  // should never reach here
  return { level: 5, title: 'LEGEND', color: '#f5a623', xpInLevel: 0, xpNeeded: 9999, pct: 100 };
}
