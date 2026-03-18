import SectionCard from '@pages/MyPage/components/SectionCard';
import StatCard from '@pages/MyPage/components/StatCard';

const StatsSection = () => {
  const mockStats = {
    totalEntries: 148,
    streakDays: 21,
    topTags: ['감사', '성장', '루틴', '여행', '관계'],
    personalityInsight:
      '최근 기록에서 감정 표현은 차분하지만, 목표에 대한 집요함이 강하게 드러납니다. 새로운 도전을 즐기며, 성찰형 피드백이 잘 맞는 편입니다.',
  };

  return (
    <>
      <SectionCard title="기록 통계" description="내 기록의 패턴을 한눈에 확인하세요.">
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="총 일기 개수"
            value={`${mockStats.totalEntries}개`}
            description="이번 달 기준 누적 기록"
          />
          <StatCard
            title="연속 작성 일수"
            value={`${mockStats.streakDays}일`}
            description="연속 작성이 이어지는 중"
          />
        </div>
      </SectionCard>

      <SectionCard title="가장 많이 쓴 태그 TOP 5" description="최근 3개월 사용 빈도 기준">
        <ul className="grid gap-3 sm:grid-cols-2">
          {mockStats.topTags.map((tag, index) => (
            <li
              key={tag}
              className="flex items-center justify-between rounded-2xl border border-sand/40 bg-white/80 px-4 py-3 text-sm text-clay/70 shadow-soft"
            >
              <span className="font-medium text-clay">#{tag}</span>
              <span className="text-xs text-clay/40">TOP {index + 1}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="일기로 본 나의 성격 분석" description="AI가 요약한 성향 분석입니다.">
        <div className="rounded-2xl border border-amber/30 bg-amber/10 px-5 py-4 text-sm text-clay/90">
          {mockStats.personalityInsight}
        </div>
        <button
          type="button"
          className="w-fit rounded-full border border-amber px-4 py-2 text-sm font-semibold text-amber transition hover:bg-amber/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
        >
          더보기
        </button>
      </SectionCard>
    </>
  );
};

export default StatsSection;
