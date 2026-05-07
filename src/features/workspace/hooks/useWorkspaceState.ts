import { useCallback, useMemo, useState } from 'react';
import { formatDate } from '@lib/dateFormatters';
import type { WorkspaceState } from '../types/workspace.types';

export function useWorkspaceState() {
  const today = useMemo(() => formatDate(new Date()), []);
  const [state, setState] = useState<WorkspaceState>(() => ({
    selectedDate: today,
    viewMode: 'diary',
    rightPanelMode: 'hidden',
    sidebarTab: 'diary',
    sidebarOpen: false,
    selectedDiaryId: null,
    draftMood: null,
    pendingDateAutoSelect: null,
  }));

  const patchState = useCallback((patch: Partial<WorkspaceState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const selectDate = useCallback((selectedDate: string) => {
    setState((prev) => ({
      ...prev,
      selectedDate,
      selectedDiaryId: null,
      draftMood: null,
      viewMode: 'diary',
      pendingDateAutoSelect: selectedDate,
    }));
  }, []);

  return { state, patchState, selectDate, today };
}
