import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { showError } from '@/lib/confirm';
import { formatDate } from '@lib/dateFormatters';
import type { DiaryEntry } from '../../types/api.types';
import type { WorkspaceState } from '../../types/workspace.types';
import type { MoodId } from '../../constants/moodCatalog';
import AutoResizeTextarea from './AutoResizeTextarea';
import BottomActionBar from './BottomActionBar';
import DatePicker from './DatePicker';
import EmotionSelector from './EmotionSelector';
import InlineTagInput from './InlineTagInput';

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

type SaveStatus = 'idle' | 'saving' | 'saved';

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
};

const MainWorkspace = ({
  state,
  currentDiary,
  myTags,
  isSaving,
  onPatchState,
  onSave,
  onDelete,
  onOpenAi,
  onOpenPolish,
}: Props) => {
  const currentDiaryId = currentDiary?.diaryId ?? currentDiary?.id ?? null;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setTitle(currentDiary?.title ?? '');
    setContent(currentDiary?.contentMd ?? '');
    setTags(normalizeTags(currentDiary?.tags));
    setSaveStatus('idle');
    setShowDeleteConfirm(false);
  }, [currentDiaryId, currentDiary?.title, currentDiary?.contentMd, currentDiary?.tags]);

  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
      return undefined;
    }
    if (saveStatus !== 'saving') return undefined;

    // 저장 상태 머신: idle -> saving -> saved -> idle 순서로 버튼 피드백을 정리한다.
    setSaveStatus('saved');
    const timeout = window.setTimeout(() => setSaveStatus('idle'), 2000);
    return () => window.clearTimeout(timeout);
  }, [isSaving, saveStatus]);

  const isNew = !currentDiaryId;
  const selectedMood = useMemo<MoodId | null>(() => state.draftMood, [state.draftMood]);
  const entryDates = useMemo(() => {
    const next = new Set<string>();
    if (currentDiary?.diaryDate) next.add(formatDate(currentDiary.diaryDate));
    return next;
  }, [currentDiary?.diaryDate]);

  const selectDate = (selectedDate: string) => {
    onPatchState({ selectedDate, selectedDiaryId: null, viewMode: 'diary' });
  };

  const resetForNewDiary = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setShowDeleteConfirm(false);
    onPatchState({ selectedDiaryId: null });
  };

  const save = async () => {
    if (!title.trim() && !content.trim()) {
      await showError({ title: '저장할 수 없음', message: '제목이나 본문을 입력해 주세요.' });
      return;
    }
    setSaveStatus('saving');
    onSave({
      diaryId: currentDiaryId,
      title: title.trim() || 'Untitled',
      contentMd: content.trim(),
      diaryDate: formatDate(state.selectedDate),
      tags,
    });
  };

  const remove = () => {
    if (!currentDiaryId) return;
    onDelete(currentDiaryId);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-8 py-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <DatePicker value={state.selectedDate} entryDates={entryDates} onChange={selectDate} />
            {isNew ? <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">새 일기</span> : null}
            <button
              type="button"
              onClick={resetForNewDiary}
              className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              title="이 날짜에 새 일기 추가"
            >
              <Plus className="h-3 w-3" />
              이 날 새 일기
            </button>
          </div>

          <div className="mb-5">
            <EmotionSelector selected={selectedMood} onChange={(mood) => onPatchState({ draftMood: mood })} />
          </div>

          <div className="mb-4 border-b border-border/60 pb-3">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              placeholder="제목을 입력하세요"
              className="w-full border-none bg-transparent font-serif text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <AutoResizeTextarea value={content} onChange={setContent} placeholder="오늘의 이야기를 자유롭게 써보세요..." />
          </div>

          <div className="mb-6 border-t border-border/40 pt-3">
            <InlineTagInput tags={tags} suggestions={myTags} onChange={setTags} />
          </div>
        </div>
      </div>

      <BottomActionBar
        saveStatus={saveStatus}
        canDelete={Boolean(currentDiaryId)}
        showDeleteConfirm={showDeleteConfirm}
        onSave={save}
        onRequestDelete={() => setShowDeleteConfirm(true)}
        onConfirmDelete={remove}
        onCancelDelete={() => setShowDeleteConfirm(false)}
        onOpenAi={onOpenAi}
        onOpenPolish={() => onOpenPolish(content, setContent, currentDiaryId)}
      />
    </div>
  );
};

export default MainWorkspace;
