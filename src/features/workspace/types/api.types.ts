import type { MoodId } from '../constants/moodCatalog';

export type DiaryEntry = {
  diaryId?: number;
  id?: number;
  title?: string;
  contentMd?: string;
  diaryDate?: string;
  moodId?: MoodId;
  tags?: string[] | string;
  createdAt?: string;
  updatedAt?: string;
};
