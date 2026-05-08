import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { confirm, showError } from '@/lib/confirm';
import { formatDate } from '@lib/dateFormatters';
import type { DiaryEntry } from '../../types/api.types';
import type { WorkspaceState } from '../../types/workspace.types';
import type { MoodId } from '../../constants/moodCatalog';
import AutoResizeTextarea from './AutoResizeTextarea';
import { useAiQuota } from '../../hooks/useAiQuota';
import BottomActionBar from './BottomActionBar';
import DatePicker from './DatePicker';
import EmotionSelector from './EmotionSelector';
import InlineTagInput from './InlineTagInput';

// 작성 중인 일기를 sessionStorage에 임시 저장하기 위한 키와 타입.
// 세션 만료, 새로고침, 탭 이동 등으로 입력이 사라지는 것을 막는다.
const DRAFT_STORAGE_KEY = 'diary-draft:v1';
const DRAFT_DEBOUNCE_MS = 500;

type DraftSnapshot = {
  diaryId: number | null;
  date: string;
  title: string;
  content: string;
  moodId: MoodId;
  tags: string[];
  savedAt: number;
};

const readDraft = (): DraftSnapshot | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftSnapshot) : null;
  } catch {
    return null;
  }
};

const writeDraft = (draft: DraftSnapshot): void => {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 용량 초과 등 저장 실패 시 사용자 작업을 막지 않는다.
  }
};

const clearDraft = (): void => {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // 무시
  }
};

const matchesContext = (
  draft: DraftSnapshot | null,
  diaryId: number | null,
  date: string,
): boolean => Boolean(draft && draft.diaryId === diaryId && draft.date === date);

type Props = {
  state: WorkspaceState;
  currentDiary: DiaryEntry | null;
  myTags: string[];
  isSaving: boolean;
  onPatchState: (patch: Partial<WorkspaceState>) => void;
  onSave: (payload: { diaryId: number | null; title: string; contentMd: string; diaryDate: string; moodId: MoodId; tags: string[] }) => void;
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
  const currentDateStr = formatDate(state.selectedDate);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isQuotaExhausted } = useAiQuota();
  // restore 다이얼로그가 같은 컨텍스트에서 두 번 뜨지 않도록 마지막 처리 컨텍스트 키를 기록한다.
  const handledDraftRef = useRef<string | null>(null);
  const selectedMood = useMemo<MoodId>(() => state.draftMood ?? currentDiary?.moodId ?? 'none', [currentDiary?.moodId, state.draftMood]);

  useEffect(() => {
    const baseTitle = currentDiary?.title ?? '';
    const baseContent = currentDiary?.contentMd ?? '';
    const baseMood = currentDiary?.moodId ?? 'none';
    const baseTags = normalizeTags(currentDiary?.tags);
    setTitle(baseTitle);
    setContent(baseContent);
    setTags(baseTags);
    setSaveStatus('idle');
    setShowDeleteConfirm(false);

    // 임시 저장된 draft가 현재 컨텍스트(동일 일기 ID + 날짜)와 일치하고
    // 서버 데이터와 다르면 복원 여부를 사용자에게 확인한다.
    const contextKey = `${currentDiaryId ?? 'new'}::${currentDateStr}`;
    if (handledDraftRef.current === contextKey) return;

    const draft = readDraft();
    if (!matchesContext(draft, currentDiaryId, currentDateStr)) return;
    if (!draft) return;
    const sameAsServer =
      draft.title === baseTitle &&
      draft.content === baseContent &&
      draft.moodId === baseMood &&
      JSON.stringify(draft.tags) === JSON.stringify(baseTags);
    if (sameAsServer) {
      clearDraft();
      return;
    }

    handledDraftRef.current = contextKey;
    void (async () => {
      const ok = await confirm({
        title: '임시 저장된 내용이 있습니다',
        message: '이전에 작성하던 일기를 복원하시겠어요? 취소하면 임시 저장본이 삭제됩니다.',
        confirmLabel: '복원',
        cancelLabel: '버리기',
      });
      if (ok) {
        setTitle(draft.title);
        setContent(draft.content);
        onPatchState({ draftMood: draft.moodId ?? 'none' });
        setTags(draft.tags);
      } else {
        clearDraft();
      }
    })();
  }, [
    currentDiaryId,
    currentDateStr,
    currentDiary?.title,
    currentDiary?.contentMd,
    currentDiary?.moodId,
    currentDiary?.tags,
    onPatchState,
  ]);

  // 입력이 바뀔 때마다 디바운스해서 sessionStorage에 임시 저장한다.
  // 빈 입력은 저장하지 않아 불필요한 복원 프롬프트를 막는다.
  useEffect(() => {
    if (saveStatus === 'saving') return;
    const empty = !title.trim() && !content.trim() && tags.length === 0;
    if (empty) return;
    const handle = window.setTimeout(() => {
      writeDraft({
        diaryId: currentDiaryId,
        date: currentDateStr,
        title,
        content,
        moodId: selectedMood ?? 'none',
        tags,
        savedAt: Date.now(),
      });
    }, DRAFT_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [title, content, selectedMood, tags, currentDiaryId, currentDateStr, saveStatus]);

  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
      return undefined;
    }
    if (saveStatus !== 'saving') return undefined;

    // 저장 상태 머신: idle -> saving -> saved -> idle 순서로 버튼 피드백을 정리한다.
    setSaveStatus('saved');
    // 서버 저장이 성공한 시점에 임시 저장본을 정리한다.
    clearDraft();
    handledDraftRef.current = `${currentDiaryId ?? 'new'}::${currentDateStr}`;
    const timeout = window.setTimeout(() => setSaveStatus('idle'), 2000);
    return () => window.clearTimeout(timeout);
  }, [isSaving, saveStatus, currentDiaryId, currentDateStr]);

  const isNew = !currentDiaryId;
  const entryDates = useMemo(() => {
    const next = new Set<string>();
    if (currentDiary?.diaryDate) next.add(formatDate(currentDiary.diaryDate));
    return next;
  }, [currentDiary?.diaryDate]);

  const selectDate = (selectedDate: string) => {
    onPatchState({ selectedDate, selectedDiaryId: null, viewMode: 'diary', pendingDateAutoSelect: selectedDate });
  };

  const resetForNewDiary = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setShowDeleteConfirm(false);
    onPatchState({ selectedDiaryId: null, draftMood: 'none', pendingDateAutoSelect: null });
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
      moodId: selectedMood,
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
        isQuotaExhausted={isQuotaExhausted}
      />
    </div>
  );
};

export default MainWorkspace;
