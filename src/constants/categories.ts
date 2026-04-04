import type { StatKey, Category } from '../types';

export const STAT_COLORS: Record<StatKey, string> = {
  str: '#e94560',
  skl: '#3b82f6',
  int: '#a855f7',
  vit: '#4ecca3',
  sns: '#f5a623',
};

export const STAT_LABELS: Record<StatKey, string> = {
  str: 'Strength',
  skl: 'Skills',
  int: 'Intelligence',
  vit: 'Vitality',
  sns: 'Senses',
};

export const BASE_CATS: Category[] = [
  { id: 'strength',  label: 'Strength',     stats: ['str'], color: '#e94560' },
  { id: 'skills',    label: 'Skills',       stats: ['skl'], color: '#3b82f6' },
  { id: 'intellect', label: 'Intelligence', stats: ['int'], color: '#a855f7' },
  { id: 'vitality',  label: 'Vitality',     stats: ['vit'], color: '#4ecca3' },
  { id: 'senses',    label: 'Senses',       stats: ['sns'], color: '#f5a623' },
];
