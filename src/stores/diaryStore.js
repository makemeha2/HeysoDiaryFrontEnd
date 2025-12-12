import { create } from 'zustand';
import { authFetch } from '../../lib/apiClient.js';

export const useDiaryStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async (page, size) => {
    try {
      set({ loading: true, error: null });

      const safePage = Math.max(1, page || 1);
      const safeSize = Math.min(100, Math.max(1, size || 20));

      const response = await authFetch('/api/diary', {
        params: {
          page: safePage,
          size: safeSize,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to load diary entries');
      }

      const payload = response.data;

      set({
        items: Array.isArray(payload?.diaries) ? payload.diaries : [],
      });
    } catch (err) {
      set({
        error: err.message,
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  addItem: async (payload = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await authFetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error('Failed to create diary entry');
      }

      const data = res.data;
      const diaryId = typeof data === 'number' ? data : data?.diaryId;
      const now = new Date();
      const entry = {
        id: diaryId || crypto.randomUUID(),
        diaryId,
        title: payload.title,
        content: payload.contentMd,
        contentMd: payload.contentMd,
        date: payload.diaryDate || now.toISOString(),
        tags: payload.tags || [],
        diaryDate: payload.diaryDate,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      set((state) => ({
        items: [entry, ...(state.items || [])],
      }));

      return entry;
    } catch (err) {
      set({
        error: err.message,
      });
      throw err;
    } finally {
      set({
        loading: false,
      });
    }
  },
}));
