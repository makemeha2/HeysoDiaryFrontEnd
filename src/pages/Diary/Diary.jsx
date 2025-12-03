import { useEffect, useMemo, useState } from 'react'
import NewEntryDialog from './components/NewEntryDialog.jsx'

function loadEntries() {
  try {
    const raw = localStorage.getItem('diaryEntries')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEntries(entries) {
  localStorage.setItem('diaryEntries', JSON.stringify(entries))
}

const Diary = (() => {
  const [entries, setEntries] = useState(() => loadEntries())

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [entries],
  )

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  function handleEntryCreated(entry) {
    setEntries((prev) => [entry, ...prev])
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="bg-white/70 rounded-2xl p-6 shadow-soft border border-sand/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-clay/60">Capture a moment</p>
            <h2 className="text-xl font-semibold">New Entry</h2>
          </div>
          <NewEntryDialog onAddEntry={handleEntryCreated} />
        </div>
        <p className="mt-4 text-sm text-clay/70">
          Click "New" to open a focused editor and record today&apos;s note.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        {sorted.length === 0 && (
          <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/70">
            No entries yet. Your first note will appear here.
          </div>
        )}
        <ul className="space-y-3">
          {sorted.map((e) => (
            <li
              key={e.id}
              className="group rounded-2xl border border-sand/50 bg-white/70 p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{e.title}</h3>
                  <time className="text-sm text-clay/60">
                    {new Date(e.date).toLocaleString()}
                  </time>
                </div>
                <button
                  onClick={() => removeEntry(e.id)}
                  className="text-sm text-clay/60 hover:text-clay/90"
                  title="Delete entry"
                >
                  Delete
                </button>
              </div>
              {e.content && (
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-clay/90">
                  {e.content}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
});

export default Diary;
