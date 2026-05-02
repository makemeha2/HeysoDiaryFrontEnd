import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Plus, Save, Tag, Trash2, X } from 'lucide-react';
import { showError } from '@/lib/confirm';
import { formatDate } from '@lib/dateFormatters.js';
import { moodCatalog, type MoodId } from '../../lib/moodCatalog';
import type { DiaryEntry } from '../../types/api.types';
import type { WorkspaceState } from '../../types/workspace.types';

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

const moodEmoji: Record<MoodId, string> = {
  calm: '☁️',
  happy: '😊',
  tired: '😴',
  sad: '😢',
  anxious: '😟',
  proud: '🌟',
};

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
const weekDayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
};

const parseYMD = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toYMD = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDisplayDate = (value: string) => {
  const date = parseYMD(value);
  const [year, month, day] = value.split('-');
  return `${year}년 ${Number(month)}월 ${Number(day)}일 ${weekDayNames[date.getDay()]}`;
};

function DatePicker({
  value,
  entryDates,
  onChange,
}: {
  value: string;
  entryDates: Set<string>;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseYMD(value));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewDate(parseYMD(value));
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const onMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = toYMD(new Date());
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const nextCells: Array<{ date: Date; outside: boolean }> = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
      nextCells.push({ date: new Date(year, month - 1, daysInPrevMonth - index), outside: true });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      nextCells.push({ date: new Date(year, month, day), outside: false });
    }
    let nextDay = 1;
    while (nextCells.length < 42) {
      nextCells.push({ date: new Date(year, month + 1, nextDay), outside: true });
      nextDay += 1;
    }
    return nextCells;
  }, [month, year]);

  const selectDate = (date: Date) => {
    onChange(toYMD(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="-mx-1.5 -my-1 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-foreground transition-colors hover:bg-muted"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="날짜 선택"
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors" />
        <span className="text-xs font-medium">{formatDisplayDate(value)}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="날짜 선택 달력"
          className="animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 absolute left-0 top-full z-50 mt-2 w-[280px] rounded-xl border border-border bg-popover p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {year}년 {month + 1}월
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="다음 달"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {dayNames.map((day, index) => (
              <div
                key={day}
                className={[
                  'py-1 text-center text-[10px] font-medium',
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-muted-foreground',
                ].join(' ')}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map(({ date, outside }, index) => {
              const dateKey = toYMD(date);
              const selected = dateKey === value;
              const currentDay = dateKey === today;
              const hasDiary = entryDates.has(dateKey);
              const sunday = date.getDay() === 0;
              const saturday = date.getDay() === 6;

              return (
                <button
                  key={`${dateKey}-${index}`}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={[
                    'relative flex h-8 w-full flex-col items-center justify-center rounded-md text-xs transition-colors',
                    outside ? 'opacity-30' : '',
                    selected
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : currentDay
                        ? 'bg-primary/10 font-semibold text-primary hover:bg-primary/20'
                        : 'hover:bg-muted',
                    !selected && sunday && !outside ? 'text-red-400' : '',
                    !selected && saturday && !outside ? 'text-blue-400' : '',
                  ].join(' ')}
                  aria-label={`${dateKey}${hasDiary ? ' (일기 있음)' : ''}`}
                  aria-pressed={selected}
                >
                  {date.getDate()}
                  {hasDiary && !selected ? (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary/60" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-center border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              className="text-xs text-primary transition-colors hover:underline"
            >
              오늘로 이동
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmotionSelector({ selected, onChange }: { selected: MoodId | null; onChange: (mood: MoodId) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="오늘의 감정">
      {moodCatalog.map((mood) => {
        const active = selected === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            onClick={() => onChange(mood.id)}
            title={mood.label}
            aria-pressed={active}
            className={[
              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all',
              active
                ? 'scale-105 border-primary/40 bg-primary/10 font-medium text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            <span className="text-sm leading-none" role="img" aria-hidden="true">
              {moodEmoji[mood.id]}
            </span>
            <span>{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={12}
      className="w-full resize-none border-none bg-transparent font-sans text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 focus:outline-none"
      style={{ minHeight: '21rem' }}
    />
  );
}

function InlineTagInput({
  tags,
  suggestions,
  onChange,
}: {
  tags: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const normalizedInput = input.trim().replace(/^#/, '');
  const filteredSuggestions = suggestions
    .filter((item) => normalizedInput && !tags.includes(item) && item.toLowerCase().includes(normalizedInput.toLowerCase()))
    .slice(0, 5);

  const addTag = (tag: string) => {
    const next = tag.trim().replace(/^#/, '');
    if (next && !tags.some((item) => item.toLowerCase() === next.toLowerCase())) {
      onChange([...tags, next]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted px-2 py-0.5 text-xs text-foreground">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="transition-colors hover:text-destructive"
              aria-label={`태그 "${tag}" 제거`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ',') && input.trim()) {
              event.preventDefault();
              addTag(input);
            } else if (event.key === 'Backspace' && !input && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => input && setShowSuggestions(true)}
          placeholder={tags.length === 0 ? '태그 추가 (Enter로 구분)' : ''}
          className="min-w-[120px] flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 ? (
        <div className="absolute left-5 top-7 z-10 min-w-[140px] rounded-md border border-border bg-popover py-1 shadow-md">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={() => addTag(suggestion)}
              className="w-full px-3 py-1 text-left text-xs text-foreground transition-colors hover:bg-muted"
            >
              #{suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
    setSaveStatus('saved');
    const timeout = window.setTimeout(() => setSaveStatus('idle'), 2000);
    return () => window.clearTimeout(timeout);
  }, [isSaving, saveStatus]);

  const isNew = !currentDiaryId;
  const selectedMood = useMemo(() => state.draftMood, [state.draftMood]);
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

      <div className="shrink-0 border-t border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-8 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAi}
              className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              AI 코멘트
            </button>
            <button
              type="button"
              onClick={() => onOpenPolish(content, setContent, currentDiaryId)}
              className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              글 다듬기
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentDiaryId && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                aria-label="일기 삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            ) : null}

            {showDeleteConfirm ? (
              <div className="animate-in slide-in-from-right-2 flex items-center gap-1.5">
                <span className="text-xs text-destructive">정말 삭제할까요?</span>
                <button
                  type="button"
                  onClick={remove}
                  className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground transition-opacity hover:opacity-90"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  취소
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={save}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className={[
                'flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all',
                saveStatus === 'saved'
                  ? 'cursor-default bg-green-500/20 text-green-600'
                  : saveStatus === 'saving'
                    ? 'cursor-wait bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]',
              ].join(' ')}
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  저장됨
                </>
              ) : saveStatus === 'saving' ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
