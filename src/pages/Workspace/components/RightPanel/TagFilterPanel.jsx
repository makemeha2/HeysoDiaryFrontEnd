import { useTagFilter } from '../../hooks/useTagFilter.js';

const TagFilterPanel = ({ diaries }) => {
  const tags = useTagFilter(diaries);

  return (
    <div className="space-y-2">
      {tags.map((item) => (
        <div key={item.tag} className="flex items-center justify-between rounded-xl border border-sand/60 bg-white/65 px-3 py-2">
          <span className="text-sm font-semibold text-clay">#{item.tag}</span>
          <span className="text-xs text-clay/55">{item.count}</span>
        </div>
      ))}
      {!tags.length && <p className="text-sm text-clay/60">태그가 없습니다.</p>}
    </div>
  );
};

export default TagFilterPanel;

