export type MoodId = 'calm' | 'happy' | 'tired' | 'sad' | 'anxious' | 'proud';

export const moodCatalog: Array<{ id: MoodId; label: string; tone: string }> = [
  { id: 'calm', label: '차분', tone: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'happy', label: '기쁨', tone: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'tired', label: '피곤', tone: 'bg-stone-100 text-stone-700 border-stone-200' },
  { id: 'sad', label: '슬픔', tone: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'anxious', label: '불안', tone: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'proud', label: '뿌듯', tone: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];
