import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { showError } from '@/lib/confirm';
import { useAiFeedbackSettings } from '../../hooks/useAiFeedbackSettings';

const groups = [
  { key: 'speechToneCd', label: '말투', options: [['POLITE', '정중'], ['CASUAL', '편안']] },
  { key: 'feedbackStyleCd', label: '피드백', options: [['EMPATHY', '공감'], ['BALANCED', '균형'], ['SOLUTION', '해결']] },
  { key: 'intensityCd', label: '강도', options: [['SOFT', '부드럽게'], ['NORMAL', '보통'], ['DIRECT', '직접']] },
  { key: 'questionCd', label: '질문', options: [['NONE', '없음'], ['ASK', '질문 포함']] },
  { key: 'lengthCd', label: '길이', options: [['SHORT', '짧게'], ['MEDIUM', '보통'], ['LONG', '길게']] },
  { key: 'langModeCd', label: '언어', options: [['FOLLOW_DIARY', '일기 언어'], ['FIXED', '고정']] },
] as const;

export default function DiaryPrefsSection({ active }: { active: boolean }) {
  const alert = ({ title, description }: { title: string; description?: string }) => showError({ title, message: description });
  const { aiConfig, setAiConfig, saveAiConfig, isSavingAiConfig, isLoadingAiConfig } = useAiFeedbackSettings({
    alert,
    activeSection: active ? 'diary' : '',
  }) as any;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key} className="grid gap-2">
          <Label>{group.label}</Label>
          <select
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
            value={aiConfig[group.key]}
            onChange={(event) => setAiConfig((prev: any) => ({ ...prev, [group.key]: event.target.value }))}
          >
            {group.options.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {aiConfig.langModeCd === 'FIXED' ? (
        <div className="grid gap-2">
          <Label>고정 언어</Label>
          <select
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
            value={aiConfig.fixedLang}
            onChange={(event) => setAiConfig((prev: any) => ({ ...prev, fixedLang: event.target.value }))}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      ) : null}
      <Button onClick={saveAiConfig} disabled={isSavingAiConfig || isLoadingAiConfig}>
        {isSavingAiConfig ? '저장 중' : '일기 설정 저장'}
      </Button>
    </div>
  );
}
