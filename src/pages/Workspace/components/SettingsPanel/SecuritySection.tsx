import { Download } from 'lucide-react';

export default function SecuritySection() {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-medium text-foreground">내 데이터 내보내기</h4>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          작성한 일기 데이터를 원하는 형식으로 내보내는 기능은 준비 중입니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {['JSON', 'Markdown', 'PDF'].map((format) => (
            <button
              key={format}
              type="button"
              disabled
              className="flex items-center gap-2 rounded-md bg-muted px-4 py-2 text-sm text-foreground opacity-50 transition-colors disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {format} 내보내기
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
