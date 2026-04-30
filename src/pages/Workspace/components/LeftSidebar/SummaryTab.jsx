import { SUMMARY_MOCK } from '../../lib/mockData.js';
import { useTagFilter } from '../../hooks/useTagFilter.js';

const SummaryTab = ({ diary }) => {
  const tags = useTagFilter(diary.diaries ?? []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-sand/60 bg-white/65 p-4">
          <p className="text-xs text-clay/55">총 일기</p>
          <p className="mt-1 text-2xl font-bold">{diary.diaries?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-sand/60 bg-white/65 p-4">
          <p className="text-xs text-clay/55">연속일</p>
          <p className="mt-1 text-2xl font-bold">{SUMMARY_MOCK.streakDays}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-sand/60 bg-white/65 p-4">
        <p className="text-xs text-clay/55">성향</p>
        <p className="mt-1 font-semibold text-clay">{SUMMARY_MOCK.tendency}</p>
      </div>
      <section>
        <h2 className="mb-3 text-sm font-bold text-clay">태그 Top 10</h2>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 10).map((item) => (
            <span key={item.tag} className="rounded-full bg-white/75 px-3 py-1 text-xs text-clay">
              #{item.tag} {item.count}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SummaryTab;

