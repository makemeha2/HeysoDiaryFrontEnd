import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { confirm, showError } from '@/lib/confirm';
import { formatDate } from '@lib/dateFormatters.js';
import DateHeader from './DateHeader';
import EmotionSelector from './EmotionSelector';
import AutoResizeTextarea from './AutoResizeTextarea';
import BottomActionBar from './BottomActionBar';
import TagInput from '../shared/TagInput';
import type { DiaryEntry } from '../../types/api.types';
import type { WorkspaceState } from '../../types/workspace.types';
import type { MoodId } from '../../lib/moodCatalog';

type Props = {
  state: WorkspaceState;
  currentDiary: DiaryEntry | null;
  myTags: string[];
  isSaving: boolean;
  onPatchState: (patch: Partial<WorkspaceState>) => void;
  onSave: (payload: { diaryId: number | null; title: string; contentMd: string; diaryDate: string; tags: string[] }) => void;
  onDelete: (diaryId: number) => void;
  onOpenAi: () => void;
  onOpenPolish: (content: string, apply: (content: string) => void, diaryId: number | null) => void;
};

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
};

export default function MainWorkspace({
  state,
  currentDiary,
  myTags,
  isSaving,
  onPatchState,
  onSave,
  onDelete,
  onOpenAi,
  onOpenPolish,
}: Props) {
  const currentDiaryId = currentDiary?.diaryId ?? currentDiary?.id ?? null;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setTitle(currentDiary?.title ?? '');
    setContent(currentDiary?.contentMd ?? '');
    setTags(normalizeTags(currentDiary?.tags));
  }, [currentDiaryId, currentDiary?.title, currentDiary?.contentMd, currentDiary?.tags]);

  const isNew = !currentDiaryId;
  const selectedMood = useMemo(() => state.draftMood, [state.draftMood]);

  const addTag = (tag: string) => {
    const next = tag.trim();
    if (!next) return;
    setTags((prev) => (prev.some((item) => item.toLowerCase() === next.toLowerCase()) ? prev : [...prev, next]));
  };

  const save = async () => {
    if (!title.trim() && !content.trim()) {
      await showError({ title: '저장할 수 없음', message: '제목이나 본문을 입력해 주세요.' });
      return;
    }
    onSave({
      diaryId: currentDiaryId,
      title: title.trim() || 'Untitled',
      contentMd: content.trim(),
      diaryDate: formatDate(state.selectedDate),
      tags,
    });
  };

  const remove = async () => {
    if (!currentDiaryId) return;
    const ok = await confirm({
      variant: 'danger',
      title: '일기를 삭제할까요?',
      message: '삭제한 일기는 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
    });
    if (ok) onDelete(currentDiaryId);
  };

  return (
    <section className="min-w-0 flex-1 overflow-y-auto px-5 py-5">
      <div className="mx-auto max-w-4xl space-y-6">
        <DateHeader
          selectedDate={state.selectedDate}
          isNew={isNew}
          canDelete={!!currentDiaryId}
          onNewDiary={() => {
            setTitle('');
            setContent('');
            setTags([]);
            onPatchState({ selectedDiaryId: null });
          }}
          onDelete={remove}
        />

        <EmotionSelector value={selectedMood} onChange={(mood: MoodId) => onPatchState({ draftMood: mood })} />

        <div className="space-y-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            className="h-14 border-0 bg-transparent px-0 text-3xl font-semibold shadow-none focus:ring-0"
            placeholder="제목"
          />
          <AutoResizeTextarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="border-0 bg-transparent px-0 text-base leading-8 shadow-none focus:ring-0"
            placeholder="오늘 하루를 차분하게 기록해보세요."
          />
        </div>

        <div className="space-y-2">
          <TagInput items={myTags} onCommit={addTag} exclude={tags} placeholder="태그 입력" />
          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm"
                  onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
                >
                  {tag} ×
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <BottomActionBar
          isSaving={isSaving}
          onSave={save}
          onOpenAi={onOpenAi}
          onOpenPolish={() => onOpenPolish(content, setContent, currentDiaryId)}
        />
      </div>
    </section>
  );
}
