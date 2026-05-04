import { moodCatalog, type MoodId } from '../../constants/moodCatalog';

type Props = {
  value: MoodId | null;
  onChange: (mood: MoodId) => void;
};

const EmotionSelector = ({ value, onChange }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {moodCatalog.map((mood) => (
        <button
          key={mood.id}
          type="button"
          onClick={() => onChange(mood.id)}
          className={[
            'rounded-full border px-3 py-1 text-sm transition',
            value === mood.id ? mood.tone : 'border-border bg-card text-muted-foreground hover:bg-muted',
          ].join(' ')}
        >
          {mood.label}
        </button>
      ))}
    </div>
  );
};

export default EmotionSelector;
