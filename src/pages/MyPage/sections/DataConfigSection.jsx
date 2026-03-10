import SectionCard from '@pages/MyPage/components/SectionCard';

const DataConfigSection = () => {
  return (
    <>
      <SectionCard
        title="내 데이터 내보내기"
        description="원하는 형식으로 데이터를 다운로드합니다. (지원예정)"
      >
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'JSON', value: 'JSON' },
            { label: 'Markdown', value: 'Markdown' },
            { label: 'PDF', value: 'PDF' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleExport(item.value)}
              className="rounded-full border border-sand/40 px-5 py-2 text-sm font-semibold text-clay/70 transition hover:border-amber hover:text-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
            >
              {item.label} 내보내기
            </button>
          ))}
        </div>
      </SectionCard>
    </>
  );
};

export default DataConfigSection;
