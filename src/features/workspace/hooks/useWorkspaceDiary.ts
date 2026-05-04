import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  useDailyDiaries,
  useDiaryDetail,
  useDiaryMutations,
  useMyTags,
  type SaveDiaryPayload,
} from './useDiary';
import type { DiaryEntry } from '../types/api.types';
import type { WorkspaceState } from '../types/workspace.types';

export function useWorkspaceDiary(
  state: WorkspaceState,
  patchState: (patch: Partial<WorkspaceState>) => void,
) {
  const monthKey = useMemo(() => dayjs(state.selectedDate).format('YYYY-MM'), [state.selectedDate]);

  const { dailyDiaries } = useDailyDiaries(state.selectedDate);
  const { diaryDetail } = useDiaryDetail(state.selectedDiaryId);
  const { myTags } = useMyTags();
  const { saveDiaryMutation, deleteDiaryMutation } = useDiaryMutations({
    monthKey,
    diaryId: state.selectedDiaryId,
    onSaveSuccess: async (data, _variables, { refreshAfterSave }) => {
      await refreshAfterSave(data?.diaryId);
      if (data?.diaryId) patchState({ selectedDiaryId: data.diaryId });
    },
  });

  const currentDiary = useMemo<DiaryEntry | null>(() => {
    if (state.selectedDiaryId) {
      return diaryDetail;
    }
    return dailyDiaries[0] ?? null;
  }, [dailyDiaries, diaryDetail, state.selectedDiaryId]);

  const save = useCallback(
    (payload: SaveDiaryPayload) => {
      saveDiaryMutation.mutate(payload);
    },
    [saveDiaryMutation],
  );

  const remove = useCallback(
    (diaryId: number) => {
      deleteDiaryMutation.mutate({ diaryId });
    },
    [deleteDiaryMutation],
  );

  return {
    myTags,
    currentDiary,
    isSaving: Boolean(saveDiaryMutation.isPending),
    save,
    remove,
  };
}
