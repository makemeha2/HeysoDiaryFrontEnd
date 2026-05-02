export type DiaryEntry = {
  diaryId?: number;
  id?: number;
  title?: string;
  contentMd?: string;
  diaryDate?: string;
  tags?: string[] | string;
  createdAt?: string;
  updatedAt?: string;
};
