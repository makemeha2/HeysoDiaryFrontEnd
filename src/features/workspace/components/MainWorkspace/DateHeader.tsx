import dayjs from 'dayjs';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
  selectedDate: string;
  isNew: boolean;
  canDelete: boolean;
  onNewDiary: () => void;
  onDelete: () => void;
};

export default function DateHeader({ selectedDate, isNew, canDelete, onNewDiary, onDelete }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{dayjs(selectedDate).format('YYYY년 M월 D일 dddd')}</h1>
          {isNew ? <Badge>새 일기</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">선택한 날짜의 기록을 편집합니다.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onNewDiary}>
          이 날 새 일기
        </Button>
        <Button variant="ghost" size="icon" aria-label="더보기">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled={!canDelete} onClick={onDelete} aria-label="삭제">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
