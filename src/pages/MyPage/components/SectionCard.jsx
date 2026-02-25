const SectionCard = ({ title, description, children }) => {
  return (
    <section className="rounded-2xl border border-sand/40 bg-white/70 p-6 shadow-soft backdrop-blur">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-clay">{title}</h3>
        {description ? <p className="mt-1 text-sm text-clay/60">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
};

export default SectionCard;
