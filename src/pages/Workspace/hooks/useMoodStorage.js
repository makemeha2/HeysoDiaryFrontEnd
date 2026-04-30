import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'heyso-diary-moods';

const readMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeMap = (map) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Best effort local preference.
  }
};

export const useMoodStorage = () => {
  const [moods, setMoods] = useState(() => readMap());

  useEffect(() => {
    setMoods(readMap());
  }, []);

  const getMood = useCallback((diaryId) => {
    if (!diaryId) return null;
    return readMap()[diaryId] ?? null;
  }, []);

  const setMood = useCallback((diaryId, moodKey) => {
    if (!diaryId || !moodKey) return;
    setMoods((prev) => {
      const next = { ...prev, [diaryId]: moodKey };
      writeMap(next);
      return next;
    });
  }, []);

  const removeMood = useCallback((diaryId) => {
    if (!diaryId) return;
    setMoods((prev) => {
      const next = { ...prev };
      delete next[diaryId];
      writeMap(next);
      return next;
    });
  }, []);

  return { moods, getMood, setMood, removeMood };
};

