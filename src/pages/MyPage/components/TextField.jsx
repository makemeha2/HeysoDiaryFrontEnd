const TextField = ({ id, label, value, onChange, placeholder }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-clay/80">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-sand/40 bg-white/90 px-4 py-2 text-sm text-clay/90 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
      />
    </div>
  );
};

export default TextField;
