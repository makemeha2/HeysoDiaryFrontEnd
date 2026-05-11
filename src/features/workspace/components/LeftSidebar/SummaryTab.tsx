import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, BookOpen, Flame, Loader2, TrendingUp, User } from 'lucide-react';
import { useDiarySummary, type DiarySummaryTagCount } from '@features/workspace/hooks/useDiarySummary';

type Props = {
  enabled?: boolean;
};

const StatCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) => {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-muted/50 p-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
};

const StatusMessage = ({ icon, children }: { icon?: ReactNode; children: ReactNode }) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 p-3 text-xs text-muted-foreground">
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </div>
  );
};

const TagRanking = ({ title, tags }: { title: string; tags: DiarySummaryTagCount[] }) => {
  const maxCount = tags[0]?.count ?? 1;

  return (
    <div>
      {title ? <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{title}</p> : null}
      <div className="space-y-1">
        {tags.length === 0 ? (
          <p className="rounded-lg border border-border/40 bg-muted/30 p-3 text-xs text-muted-foreground">아직 태그 데이터가 없습니다.</p>
        ) : (
          tags.slice(0, 10).map((item, index) => (
            <div key={item.tag} className="flex items-center gap-2">
              <span className="w-4 text-right text-[10px] text-muted-foreground">{index + 1}</span>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted/50">
                <div className="absolute inset-y-0 left-0 rounded bg-primary/20" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                <span className="absolute inset-0 flex items-center px-2 text-[11px] text-foreground">#{item.tag}</span>
              </div>
              <span className="w-6 text-right text-[10px] text-muted-foreground">{item.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SummaryTab = ({ enabled = true }: Props) => {
  const summaryQuery = useDiarySummary({ enabled });
  const summary = summaryQuery.data;
  const yearlyRankings = summary?.tagRankings.yearly ?? [];
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    if (yearlyRankings.length === 0) {
      setSelectedYear('');
      return;
    }

    if (!yearlyRankings.some((ranking) => ranking.year === selectedYear)) {
      setSelectedYear(yearlyRankings[0]?.year ?? '');
    }
  }, [selectedYear, yearlyRankings]);

  const selectedYearTags = yearlyRankings.find((ranking) => ranking.year === selectedYear)?.tags ?? [];
  const totalDiaryCount = summary?.stats.totalDiaryCount ?? 0;
  const currentStreakDays = summary?.stats.currentStreakDays ?? 0;
  const allTimeTags = summary?.tagRankings.allTime ?? [];

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      {summaryQuery.isLoading ? (
        <StatusMessage icon={<Loader2 className="h-3.5 w-3.5 animate-spin" />}>요약을 불러오는 중입니다.</StatusMessage>
      ) : null}

      {summaryQuery.isError ? (
        <StatusMessage icon={<AlertCircle className="h-3.5 w-3.5 text-destructive" />}>요약을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</StatusMessage>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<BookOpen className="h-3.5 w-3.5 text-primary" />} label="전체 일기" value={`${totalDiaryCount}편`} />
        <StatCard icon={<Flame className="h-3.5 w-3.5 text-orange-500" />} label="연속 작성" value={`${currentStreakDays}일`} />
      </div>

      <div className="h-px bg-border/60" />
      <TagRanking title="가장 많이 쓴 태그 Top 10" tags={allTimeTags} />
      <div className="h-px bg-border/60" />

      <div>
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">연도별 태그 Top 10</span>
        </div>
        {yearlyRankings.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1">
            {yearlyRankings.map((ranking) => (
              <button
                key={ranking.year}
                type="button"
                onClick={() => setSelectedYear(ranking.year)}
                aria-pressed={selectedYear === ranking.year}
                className={[
                  'rounded-full border px-2 py-0.5 text-[10px] transition-colors',
                  selectedYear === ranking.year ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30',
                ].join(' ')}
              >
                {ranking.year}
              </button>
            ))}
          </div>
        ) : null}
        <TagRanking title="" tags={selectedYearTags} />
      </div>

      <div className="h-px bg-border/60" />

      <div>
        <div className="mb-2 flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">일기로 본 나의 성향</span>
        </div>
        <p className="rounded-lg border border-border/40 bg-muted/30 p-3 text-xs leading-relaxed text-foreground">
          차분히 하루를 돌아보고 작은 감정을 기록하는 경향이 보여요. 태그와 작성 패턴이 쌓이면 더 정확한 요약을 제공할 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default SummaryTab;
