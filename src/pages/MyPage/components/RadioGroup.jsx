const RadioGroup = ({ name, label, options, value, onChange, direction = 'row' }) => {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-clay/80">{label}</legend>
      <div
        className={`flex flex-wrap gap-3 ${
          direction === 'column' ? 'flex-col items-start' : 'items-center'
        }`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-sand/40 bg-white/80 px-3 py-2 text-sm text-clay/80 shadow-sm transition hover:border-amber hover:bg-amber/10"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-amber focus:ring-amber/40"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
