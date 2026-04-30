import { useMemo } from 'react';

const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const useSearchDiaries = ({ diaries, query, tag }) => {
  return useMemo(() => {
    const keyword = normalize(query);
    const tagKeyword = normalize(tag);

    return (diaries ?? []).filter((diary) => {
      const haystack = [diary?.title, diary?.contentMd, ...(diary?.tags ?? [])]
        .map(normalize)
        .join(' ');
      const tagMatch = !tagKeyword || (diary?.tags ?? []).some((item) => normalize(item).includes(tagKeyword));
      const keywordMatch = !keyword || haystack.includes(keyword);
      return keywordMatch && tagMatch;
    });
  }, [diaries, query, tag]);
};

