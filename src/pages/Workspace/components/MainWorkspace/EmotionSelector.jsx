import { MOODS } from '../../lib/moodCatalog.js';

const EmotionSelector = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {MOODS.map((mood) => (
      <button
        key={mood.key}
        type="button"
        aria-pressed={value === mood.key}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition ${
          value === mood.key
            ? 'border-amber bg-amber text-white'
            : 'border-sand bg-white/75 text-clay hover:bg-white'
        }`}
        onClick={() => onChange(mood.key)}
      >
        <span>{mood.emoji}</span>
        <span>{mood.label}</span>
      </button>
    ))}
  </div>
);

export default EmotionSelector;

