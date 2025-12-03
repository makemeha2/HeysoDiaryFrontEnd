import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authFetch } from '../../../lib/apiClient.js'
import * as Dialog from '@radix-ui/react-dialog'

function NewEntryDialog({ onAddEntry }) {
  const [open, setOpen] = useState(false)
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
    onSuccess: (diaryId, variables) => {
      const now = new Date()
      const entry = {
        id: diaryId || crypto.randomUUID(),
        title: variables.title,
        content: variables.contentMd,
        date: now.toISOString(),
      }
      onAddEntry(entry)
      setTitle('')
      setContent('')
      setOpen(false)
    },
    onError: (err) => {
      console.error(err)
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    const now = new Date()
    const payload = {
      userId: 2,
      title: title.trim() || 'Untitled',
      contentMd: content.trim(),
      diaryDate: now.toISOString().slice(0, 10),
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="rounded-full bg-amber text-white px-4 py-2 text-sm font-medium hover:opacity-95 active:opacity-90">
          New
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(90vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/50 bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-scaleIn">
          <div className="flex items-start justify-between">
            <Dialog.Title className="text-lg font-semibold text-clay">Write a new entry</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-clay/60 hover:text-clay/80" aria-label="Close">
                x
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-clay/60">
            Draft your thoughts. Everything stays in your browser.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-clay/60">Stored locally in your browser</span>
              <button
                type="submit"
                className="rounded-full bg-amber text-white px-5 py-2.5 hover:opacity-95 active:opacity-90 disabled:opacity-60"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default NewEntryDialog
