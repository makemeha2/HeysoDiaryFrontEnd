import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authFetch } from '../../lib/apiClient.js'

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
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await authFetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error('Failed to create diary entry')
      }
      const data = await res.json()
      return typeof data === 'number' ? data : data?.diaryId
    },
  })

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [entries],
  )

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  async function addEntry(e) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    const now = new Date()
    const payload = {
      userId: 2,
      title: title.trim() || 'Untitled',
      contentMd: content.trim(),
      diaryDate: now.toISOString().slice(0, 10),
    }

    try {
      const diaryId = await mutation.mutateAsync(payload)
      setEntries((prev) => [
        {
          id: diaryId || crypto.randomUUID(),
          title: payload.title,
          content: payload.contentMd,
          date: now.toISOString(),
        },
        ...prev,
      ])
      setTitle('')
      setContent('')
    } catch (err) {
      console.error(err)
    }
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="bg-white/70 rounded-2xl p-6 shadow-soft border border-sand/40">
        <h2 className="text-xl font-semibold mb-4">New Entry</h2>
        <form onSubmit={addEntry} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-sand/60 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
            placeholder="Title"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-sand/60 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
            placeholder="Write your thoughts..."
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-amber text-white px-5 py-2.5 hover:opacity-95 active:opacity-90"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <span className="text-sm text-clay/60">Stored locally in your browser</span>
          </div>
        </form>
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
