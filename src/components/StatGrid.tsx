import type { StatKey } from '../types';
import { STAT_COLORS } from '../constants/categories';

interface Props {
  stats: Record<StatKey, number>;
}

const KEYS: StatKey[] = ['str', 'skl', 'int', 'vit', 'sns'];
const LABELS: Record<StatKey, string> = { str:'STR', skl:'SKL', int:'INT', vit:'VIT', sns:'SNS' };

export default function StatGrid({ stats }: Props) {
  return (
    <div style={{ display:'flex', gap:5 }}>
      {KEYS.map(k => (
        <div key={k} style={{
          flex:1, background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:3, padding:'6px 4px', textAlign:'center',
        }}>
          <div style={{ fontSize:7, color:'var(--text-muted)', marginBottom:3 }}>{LABELS[k]}</div>
          <div style={{ fontSize:11, fontWeight:'bold', color:STAT_COLORS[k] }}>{stats[k]}</div>
        </div>
      ))}
    </div>
  );
}
