const Notice = (() => {
  const notices = [
    { id: 1, title: 'Welcome to Heyso Diary', date: '2025-01-01' },
    { id: 2, title: 'Your notes are stored locally', date: '2025-01-10' },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notice</h2>
      <ul className="space-y-3">
        {notices.map((n) => (
          <li
            key={n.id}
            className="rounded-2xl border border-sand/50 bg-white/70 p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{n.title}</span>
              <time className="text-sm text-clay/60">{n.date}</time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
});

export default Notice;
