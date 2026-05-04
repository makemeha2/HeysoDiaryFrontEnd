import { moodCatalog, type MoodId } from '../../constants/moodCatalog';

type Props = {
  selected: MoodId | null;
  onChange: (mood: MoodId) => void;
};

// 오늘의 감정 선택 칩 — v3 작성 화면의 compact 스타일
const EmotionSelector = ({ selected, onChange }: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="오늘의 감정">
      {moodCatalog.map((mood) => {
        const active = selected === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            onClick={() => onChange(mood.id)}
            title={mood.label}
            aria-pressed={active}
            className={[
              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all',
              active
                ? 'scale-105 border-primary/40 bg-primary/10 font-medium text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            <span className="text-sm leading-none" role="img" aria-hidden="true">
              {mood.emoji}
            </span>
            <span>{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default EmotionSelector;
