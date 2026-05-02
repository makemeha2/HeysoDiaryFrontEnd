import type { ThemeId } from '@/contexts/ThemeContext';

export const themeCatalog: Array<{ id: ThemeId; label: string; swatch: string }> = [
  { id: 'warm-diary', label: 'Warm Diary', swatch: '#b9743f' },
  { id: 'forest-note', label: 'Forest Note', swatch: '#58724f' },
  { id: 'clear-morning', label: 'Clear Morning', swatch: '#3d7895' },
  { id: 'rose-paper', label: 'Rose Paper', swatch: '#b65f6c' },
  { id: 'ink-focus', label: 'Ink Focus', swatch: '#303030' },
  { id: 'notion-light', label: 'Notion Light', swatch: '#787774' },
];
