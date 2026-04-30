import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TagInput from '@components/TagInput.jsx';

import { getMood } from '../../lib/moodCatalog.js';
import { useConfirm } from '../modals/useConfirm.jsx';
import PolishModal from '../PolishModal/PolishModal.jsx';
import AutoResizeTextarea from './AutoResizeTextarea.jsx';
import BottomActionBar from './BottomActionBar.jsx';
import DatePickerInline from './DatePickerInline.jsx';
import EmotionSelector from './EmotionSelector.jsx';

const normalizeTags = (tags) => (Array.isArray(tags) ? tags.filter(Boolean) : []);

const MainWorkspace = ({ state, diary, moodStorage }) => {
  const confirm = useConfirm();
  const selectedDiary = diary.dailyDiaries?.[0] ?? null;
  const [title, setTitle] = useState('');
  const [contentMd, setContentMd] = useState('');
  const [tags, setTags] = useState([]);
  const [moodKey, setMoodKey] = useState('calm');
  const [polishOpen, setPolishOpen] = useState(false);

  useEffect(() => {
    setTitle(selectedDiary?.title ?? '');
    setContentMd(selectedDiary?.contentMd ?? '');
    setTags(normalizeTags(selectedDiary?.tags));
    setMoodKey(selectedDiary?.diaryId ? moodStorage.getMood(selectedDiary.diaryId) ?? 'calm' : 'calm');
  }, [moodStorage, selectedDiary]);

  useEffect(() => {
    const handler = () => setPolishOpen(true);
    window.addEventListener('workspace:open-polish', handler);
    return () => window.removeEventListener('workspace:open-polish', handler);
  }, []);

  const selectedMood = useMemo(() => getMood(moodKey), [moodKey]);

  const handleSave = () => {
    if (!title.trim() && !contentMd.trim()) {
      toast.error('제목 또는 본문을 입력해 주세요.');
      return;
    }

    diary.saveDiaryMutation.mutate(
      {
        diaryId: selectedDiary?.diaryId,
        title: title.trim() || 'Untitled',
        contentMd: contentMd.trim(),
        diaryDate: state.selectedDate,
        tags: Array.from(new Set(tags)),
      },
      {
        onSuccess: (data) => {
          const savedId = data?.diaryId ?? selectedDiary?.diaryId;
          moodStorage.setMood(savedId, moodKey);
          toast.success('일기를 저장했습니다.');
        },
        onError: () => toast.error('일기 저장에 실패했습니다.'),
      },
    );
  };

  const handleDelete = async () => {
    if (!selectedDiary?.diaryId) return;
    const ok = await confirm({
      variant: 'danger',
      title: '일기를 삭제할까요?',
      message: '삭제한 일기는 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
    });
    if (!ok) return;

    diary.deleteDiaryMutation.mutate(
      { diaryId: selectedDiary.diaryId },
      {
        onSuccess: () => {
          moodStorage.removeMood(selectedDiary.diaryId);
          setTitle('');
          setContentMd('');
          setTags([]);
          toast.success('일기를 삭제했습니다.');
        },
        onError: () => toast.error('일기 삭제에 실패했습니다.'),
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <DatePickerInline value={state.selectedDate} onChange={state.setSelectedDate} />
        <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-clay/70 shadow-sm">
          <span className="mr-2">{selectedMood.emoji}</span>
          {selectedMood.label}
        </div>
      </div>

      <article className="rounded-2xl border border-sand/60 bg-white/70 p-5 shadow-soft md:p-7">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목"
          maxLength={200}
          className="w-full bg-transparent text-3xl font-bold text-clay outline-none placeholder:text-clay/30"
        />

        <div className="mt-5">
          <EmotionSelector value={moodKey} onChange={setMoodKey} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="rounded-full bg-amber/15 px-3 py-1 text-sm text-clay"
              onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="mt-3 max-w-sm">
          <TagInput
            items={diary.myTags ?? []}
            exclude={tags}
            placeholder="태그 추가"
            onCommit={(tag) => setTags((prev) => Array.from(new Set([...prev, tag])))}
          />
        </div>

        <AutoResizeTextarea
          value={contentMd}
          onChange={(event) => setContentMd(event.target.value)}
          placeholder="오늘의 이야기를 적어보세요."
          className="mt-6 w-full resize-none bg-transparent text-base leading-8 text-clay outline-none placeholder:text-clay/35"
        />

        <BottomActionBar
          canDelete={!!selectedDiary?.diaryId}
          isSaving={diary.saveDiaryMutation.isPending}
          onSave={handleSave}
          onDelete={handleDelete}
          onOpenAiComment={() => state.setRightPanelMode('ai-comment')}
          onOpenPolish={() => setPolishOpen(true)}
        />
      </article>

      <PolishModal
        open={polishOpen}
        onOpenChange={setPolishOpen}
        diaryId={selectedDiary?.diaryId ?? null}
        content={contentMd}
        onApply={setContentMd}
      />
    </div>
  );
};

export default MainWorkspace;

