import { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  getDiaryId,
  useDailyDiaries,
  useDiaryDetail,
  useDiaryMutations,
  useMyTags,
  type SaveDiaryPayload,
} from './useDiary';
import type { DiaryEntry } from '../types/api.types';
import type { WorkspaceState } from '../types/workspace.types';

const getCreatedTime = (diary: DiaryEntry): number => {
  const parsed = dayjs(diary.createdAt);
  return parsed.isValid() ? parsed.valueOf() : Number.POSITIVE_INFINITY;
};

const getSortableDiaryId = (diary: DiaryEntry): number => getDiaryId(diary) ?? Number.POSITIVE_INFINITY;

const getFirstCreatedDiary = (diaries: DiaryEntry[]): DiaryEntry | null => {
  return [...diaries].sort((left, right) => {
    const createdDiff = getCreatedTime(left) - getCreatedTime(right);
    if (createdDiff !== 0) return createdDiff;
    return getSortableDiaryId(left) - getSortableDiaryId(right);
  })[0] ?? null;
};

export function useWorkspaceDiary(
  state: WorkspaceState,
  patchState: (patch: Partial<WorkspaceState>) => void,
) {
  const monthKey = useMemo(() => dayjs(state.selectedDate).format('YYYY-MM'), [state.selectedDate]);

  const { dailyDiaries, dailyDiariesQuery } = useDailyDiaries(state.selectedDate);
  const { diaryDetail } = useDiaryDetail(state.selectedDiaryId);
  const { myTags } = useMyTags();
  const { saveDiaryMutation, deleteDiaryMutation } = useDiaryMutations({
    monthKey,
    diaryId: state.selectedDiaryId,
    onSaveSuccess: async (data, _variables, { refreshAfterSave }) => {
      await refreshAfterSave(data?.diaryId);
      if (data?.diaryId) patchState({ selectedDiaryId: data.diaryId, pendingDateAutoSelect: null });
    },
  });

  useEffect(() => {
    if (state.pendingDateAutoSelect !== state.selectedDate || state.selectedDiaryId !== null) return;
    if (!dailyDiariesQuery.isSuccess) return;

    const firstDiary = getFirstCreatedDiary(dailyDiaries);
    const firstDiaryId = getDiaryId(firstDiary);

    patchState({
      selectedDiaryId: firstDiaryId,
      draftMood: firstDiary?.moodId ?? null,
      pendingDateAutoSelect: null,
    });
  }, [
    dailyDiaries,
    dailyDiariesQuery.isSuccess,
    patchState,
    state.pendingDateAutoSelect,
    state.selectedDate,
    state.selectedDiaryId,
  ]);

  const currentDiary = useMemo(() => {
    if (state.selectedDiaryId) {
      return diaryDetail;
    }
    return null;
  }, [diaryDetail, state.selectedDiaryId]);

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
