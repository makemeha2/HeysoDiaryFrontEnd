const SelectField = ({ id, label, value, options, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-clay/80">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-sand/40 bg-white/90 px-4 py-2 text-sm text-clay/90 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
