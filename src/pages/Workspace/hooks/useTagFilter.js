import { useMemo } from 'react';

export const useTagFilter = (diaries = []) => {
  return useMemo(() => {
    const counts = new Map();
    diaries.forEach((diary) => {
      (diary?.tags ?? []).forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });

    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [diaries]);
};

