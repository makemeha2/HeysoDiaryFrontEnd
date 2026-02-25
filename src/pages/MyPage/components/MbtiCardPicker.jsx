const MbtiCardPicker = ({ value, onChange, options }) => {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-clay/80">MBTI</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((option) => {
          const selected = value === option.mbtiId;
          return (
            <button
              key={option.mbtiId}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.mbtiNm} 선택`}
              onClick={() => onChange(option.mbtiId)}
              className={`group relative h-28 rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 ${
                selected ? 'ring-2 ring-amber ring-offset-2 ring-offset-linen/60' : ''
              }`}
            >
              <span className="pointer-events-none absolute inset-0 block [perspective:1200px]">
                <span className="relative block h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <span
                    className={`absolute inset-0 flex items-center justify-center rounded-xl border bg-white/90 text-lg font-semibold tracking-wide text-clay shadow-soft [backface-visibility:hidden] ${
                      selected ? 'border-amber/70' : 'border-sand/40'
                    }`}
                  >
                    {option.mbtiNm}
                  </span>
                  <span
                    className={`absolute inset-0 rounded-xl border bg-amber/10 p-3 text-xs leading-relaxed text-clay [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                      selected ? 'border-amber/70' : 'border-amber/30'
                    }`}
                  >
                    <span className="mb-1 block text-sm font-semibold text-amber">
                      {option.mbtiNm}
                    </span>
                    <span>{option.description}</span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};

export default MbtiCardPicker;
