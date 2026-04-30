const DiaryPrefsSection = () => (
  <section className="rounded-2xl border border-sand/60 bg-white/55 p-5 opacity-70">
    <h2 className="text-lg font-bold text-clay">일기 설정</h2>
    <div className="mt-4 space-y-3 text-sm text-clay/65">
      <label className="flex items-center justify-between rounded-xl bg-linen/70 px-3 py-2">
        자동 저장
        <input type="checkbox" disabled />
      </label>
      <label className="flex items-center justify-between rounded-xl bg-linen/70 px-3 py-2">
        매일 작성 알림
        <input type="checkbox" disabled />
      </label>
    </div>
  </section>
);

export default DiaryPrefsSection;

