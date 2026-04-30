export const MOODS = [
  { key: 'calm', emoji: '🙂', label: '차분' },
  { key: 'joy', emoji: '😊', label: '기쁨' },
  { key: 'tired', emoji: '😮‍💨', label: '피곤' },
  { key: 'sad', emoji: '😢', label: '슬픔' },
  { key: 'angry', emoji: '😠', label: '답답' },
  { key: 'hopeful', emoji: '🌱', label: '기대' },
];

export const getMood = (moodKey) => MOODS.find((mood) => mood.key === moodKey) ?? MOODS[0];

