import { Button } from '@/components/ui/button';

export default function SecuritySection() {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-muted-foreground">데이터 내보내기 API는 아직 제공되지 않아 지원 예정 상태로 표시합니다.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>JSON 내보내기</Button>
        <Button variant="outline" disabled>Markdown 내보내기</Button>
        <Button variant="outline" disabled>PDF 내보내기</Button>
      </div>
    </div>
  );
}
