import type { MoodId } from '../constants/moodCatalog';

export type WorkspaceState = {
  selectedDate: string;
  viewMode: 'diary' | 'settings';
  rightPanelMode: 'hidden' | 'ai-comment';
  sidebarTab: 'diary' | 'summary' | 'search';
  sidebarOpen: boolean;
  selectedDiaryId: number | null;
  draftMood: MoodId | null;
  pendingDateAutoSelect: string | null;
};
