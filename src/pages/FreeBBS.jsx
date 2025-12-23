import { useEffect, useState } from 'react'
import { formatDateTime } from '../lib/dateFormatters.js'

function loadPosts() {
  try {
    const raw = localStorage.getItem('bbsPosts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePosts(posts) {
  localStorage.setItem('bbsPosts', JSON.stringify(posts))
}

const FreeBBS = (() => {
  const [posts, setPosts] = useState(() => loadPosts())
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    savePosts(posts)
  }, [posts])

  function addPost(e) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    setPosts((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim() || 'Untitled',
        content: content.trim(),
        date: new Date().toISOString(),
      },
      ...prev,
    ])
    setTitle('')
    setContent('')
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="bg-white/70 rounded-2xl p-6 shadow-soft border border-sand/40">
        <h2 className="text-xl font-semibold mb-4">New Post</h2>
        <form onSubmit={addPost} className="space-y-4">
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
            placeholder="Share something with others..."
          />
          <button
            type="submit"
            className="rounded-full bg-amber text-white px-5 py-2.5 hover:opacity-95 active:opacity-90"
          >
            Post
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Posts</h2>
        <ul className="space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-sand/50 bg-white/70 p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <time className="text-sm text-clay/60">
                    {formatDateTime(p.date)}
                  </time>
                </div>
              </div>
              {p.content && (
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-clay/90">
                  {p.content}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
});

export default FreeBBS;
