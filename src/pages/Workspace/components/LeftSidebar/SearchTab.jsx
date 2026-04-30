import { useState } from 'react';

import { useSearchDiaries } from '../../hooks/useSearchDiaries.js';

const SearchTab = ({ state, diary }) => {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const results = useSearchDiaries({ diaries: diary.diaries, query, tag });

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="제목 또는 본문"
        className="w-full rounded-xl border border-sand bg-white/75 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/30"
      />
      <input
        value={tag}
        onChange={(event) => setTag(event.target.value)}
        placeholder="태그"
        className="w-full rounded-xl border border-sand bg-white/75 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/30"
      />
      <div className="space-y-2">
        {results.slice(0, 20).map((item) => (
          <button
            key={item.diaryId}
            type="button"
            className="w-full rounded-xl border border-sand/60 bg-white/65 px-3 py-2 text-left hover:bg-white"
            onClick={() => item.diaryDate && state.setSelectedDate(item.diaryDate)}
          >
            <p className="truncate text-sm font-semibold text-clay">{item.title || 'Untitled'}</p>
            <p className="mt-1 truncate text-xs text-clay/55">{item.contentMd}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchTab;

