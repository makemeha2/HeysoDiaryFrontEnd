const AI = () => {
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
      <p className="text-clay/70 mb-4">
        This is a placeholder for AI features (summaries, mood analysis, etc.). Hook up your backend
        or API later.
      </p>
      <textarea
        className="w-full rounded-xl border border-sand/60 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40 mb-3"
        rows={6}
        placeholder="Ask something or paste your note for analysis..."
      />
      <div className="flex gap-3">
        <button className="rounded-full bg-amber text-white px-5 py-2.5 opacity-60 cursor-not-allowed">
          Analyze (coming soon)
        </button>
        <span className="text-sm text-clay/60">No network calls yet</span>
      </div>
    </div>
  );
};

export default AI;
