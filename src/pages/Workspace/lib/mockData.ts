import type { MoodId } from './moodCatalog';

export const mockMoodByDate: Record<string, MoodId> = {
  '2026-04-29': 'proud',
  '2026-04-30': 'calm',
  '2026-05-01': 'happy',
  '2026-05-02': 'tired',
};

export const mockTokenUsage = {
  used: 18,
  limit: 30,
};

export const mockWeather = {
  label: '맑음',
  temperature: '18°C',
  detail: '기록하기 좋은 저녁',
};
