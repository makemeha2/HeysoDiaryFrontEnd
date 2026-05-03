import { cn } from '@/lib/utils';
import { showError } from '@/lib/confirm';
import { useAiFeedbackSettings } from '../../hooks/useAiFeedbackSettings';

type Option<T extends string> = {
  value: T;
  label: string;
};

type ToggleGroupProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <label className="w-40 flex-shrink-0 text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function ToggleGroup<T extends string>({ options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
            value === option.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-muted text-foreground hover:border-primary/40'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function DiaryPrefsSection({ active }: { active: boolean }) {
  const alert = ({ title, description }: { title: string; description?: string }) => showError({ title, message: description });
  const { aiConfig, setAiConfig, saveAiConfig, isSavingAiConfig, isLoadingAiConfig } = useAiFeedbackSettings({
    alert,
    activeSection: active ? 'diary' : '',
  }) as any;

  const updateConfig = (key: string, value: string) => {
    setAiConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <SettingRow label="AI 피드백 말투">
        <ToggleGroup
          options={[
            { value: 'POLITE', label: '정중하게' },
            { value: 'CASUAL', label: '편하게' },
          ]}
          value={aiConfig.speechToneCd}
          onChange={(value) => updateConfig('speechToneCd', value)}
        />
      </SettingRow>

      <SettingRow label="피드백 스타일">
        <ToggleGroup
          options={[
            { value: 'EMPATHY', label: '공감' },
            { value: 'BALANCED', label: '균형' },
            { value: 'SOLUTION', label: '해결' },
          ]}
          value={aiConfig.feedbackStyleCd}
          onChange={(value) => updateConfig('feedbackStyleCd', value)}
        />
      </SettingRow>

      <SettingRow label="피드백 강도">
        <ToggleGroup
          options={[
            { value: 'SOFT', label: '부드럽게' },
            { value: 'NORMAL', label: '보통' },
            { value: 'DIRECT', label: '직설적' },
          ]}
          value={aiConfig.intensityCd}
          onChange={(value) => updateConfig('intensityCd', value)}
        />
      </SettingRow>

      <SettingRow label="질문 포함 여부">
        <ToggleGroup
          options={[
            { value: 'NONE', label: '없음' },
            { value: 'ASK', label: '있음' },
          ]}
          value={aiConfig.questionCd}
          onChange={(value) => updateConfig('questionCd', value)}
        />
      </SettingRow>

      <SettingRow label="응답 길이">
        <ToggleGroup
          options={[
            { value: 'SHORT', label: '짧게' },
            { value: 'MEDIUM', label: '보통' },
            { value: 'LONG', label: '자세히' },
          ]}
          value={aiConfig.lengthCd}
          onChange={(value) => updateConfig('lengthCd', value)}
        />
      </SettingRow>

      <SettingRow label="AI 댓글 언어">
        <ToggleGroup
          options={[
            { value: 'FOLLOW_DIARY', label: '일기 언어 따라가기' },
            { value: 'FIXED', label: '고정 언어' },
          ]}
          value={aiConfig.langModeCd}
          onChange={(value) => updateConfig('langModeCd', value)}
        />
      </SettingRow>

      {aiConfig.langModeCd === 'FIXED' ? (
        <SettingRow label="고정 언어 선택">
          <select
            value={aiConfig.fixedLang}
            onChange={(event) => updateConfig('fixedLang', event.target.value)}
            className="rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none transition-colors focus:border-primary/50"
          >
            <option value="ko">한국어</option>
            <option value="en">영어</option>
            <option value="ja">일본어</option>
          </select>
        </SettingRow>
      ) : null}

      <button
        type="button"
        onClick={saveAiConfig}
        disabled={isSavingAiConfig || isLoadingAiConfig}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSavingAiConfig ? '저장 중...' : '일기 설정 저장'}
      </button>
    </div>
  );
}
