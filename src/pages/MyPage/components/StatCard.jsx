const StatCard = ({ title, value, description }) => {
  return (
    <div className="rounded-2xl border border-sand/40 bg-white/70 p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-clay/40">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-clay">{value}</p>
      {description ? <p className="mt-2 text-xs text-clay/60">{description}</p> : null}
    </div>
  );
};

export default StatCard;
