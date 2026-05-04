import type { ThemeId } from '@/contexts/ThemeContext';

export const themeCatalog: Array<{ id: ThemeId; label: string; swatch: string }> = [
  { id: 'warm-diary', label: 'Warm Diary', swatch: '#FAF7F2' },
  { id: 'notion-light', label: 'Notion Light', swatch: '#FFFFFF' },
  { id: 'calm-blue', label: 'Calm Blue', swatch: '#F0F4F8' },
  { id: 'soft-green', label: 'Soft Green', swatch: '#F2F7F3' },
  { id: 'dark-diary', label: 'Dark Diary', swatch: '#1A1714' },
];
