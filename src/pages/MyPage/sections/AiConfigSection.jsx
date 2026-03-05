import { useMemo, useState } from 'react';

import SectionCard from '@pages/MyPage/components/SectionCard';
import RadioGroup from '@pages/MyPage/components/RadioGroup';

const speechToneOptions = [
  { label: '정중하게', value: 'POLITE' },
  { label: '편하게', value: 'CASUAL' },
];

const feedbackStyleOptions = [
  { label: '공감', value: 'EMPATHY' },
  { label: '균형', value: 'BALANCED' },
  { label: '해결', value: 'SOLUTION' },
];

const intensityOptions = [
  { label: '부드럽게', value: 'SOFT' },
  { label: '보통', value: 'NORMAL' },
  { label: '직설적', value: 'DIRECT' },
];

const questionOptions = [
  { label: '없음', value: 'NONE' },
  { label: '있음', value: 'ASK' },
];

const lengthOptions = [
  { label: '짧게', value: 'SHORT' },
  { label: '보통', value: 'MEDIUM' },
  { label: '자세히', value: 'LONG' },
];

const langModeOptions = [
  { label: '일기 언어 따라가기', value: 'FOLLOW_DIARY' },
  { label: '고정 언어', value: 'FIXED' },
];

const fixedLangOptions = [
  { label: '한국어 (ko)', value: 'ko' },
  { label: '영어 (en)', value: 'en' },
  { label: '일본어 (ja)', value: 'ja' },
];

const initialConfig = {
  speech_tone_cd: 'POLITE',
  feedback_style_cd: 'BALANCED',
  intensity_cd: 'NORMAL',
  question_cd: 'ASK',
  length_cd: 'MEDIUM',
  lang_mode_cd: 'FOLLOW_DIARY',
  fixed_lang: 'ko',
  updated_at: null,
};

const labelOf = (options, value) => options.find((option) => option.value === value)?.label || '-';

const SettingSummary = ({ config }) => {
  return (
    <div className="rounded-2xl border border-amber/30 bg-amber/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber">현재 선택 요약</p>
      <div className="mt-3 grid gap-2 text-sm text-clay/80 sm:grid-cols-2">
        <p>말투: {labelOf(speechToneOptions, config.speech_tone_cd)}</p>
        <p>피드백 스타일: {labelOf(feedbackStyleOptions, config.feedback_style_cd)}</p>
        <p>강도: {labelOf(intensityOptions, config.intensity_cd)}</p>
        <p>질문: {labelOf(questionOptions, config.question_cd)}</p>
        <p>길이: {labelOf(lengthOptions, config.length_cd)}</p>
        <p>언어 모드: {labelOf(langModeOptions, config.lang_mode_cd)}</p>
        {config.lang_mode_cd === 'FIXED' ? (
          <p>고정 언어: {labelOf(fixedLangOptions, config.fixed_lang)}</p>
        ) : null}
      </div>
    </div>
  );
};

const InlineLangModeSelector = ({ value, fixedLang, onModeChange, onFixedLangChange }) => {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-clay/80">언어 모드 (lang_mode_cd)</legend>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-sand/40 bg-white/80 px-3 py-2 text-sm text-clay/80 shadow-sm transition hover:border-amber hover:bg-amber/10">
          <input
            type="radio"
            name="lang_mode_cd"
            value="FOLLOW_DIARY"
            checked={value === 'FOLLOW_DIARY'}
            onChange={() => onModeChange('FOLLOW_DIARY')}
            className="h-4 w-4 text-amber focus:ring-amber/40"
          />
          일기 언어 따라가기
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-sand/40 bg-white/80 px-3 py-2 text-sm text-clay/80 shadow-sm transition hover:border-amber hover:bg-amber/10">
            <input
              type="radio"
              name="lang_mode_cd"
              value="FIXED"
              checked={value === 'FIXED'}
              onChange={() => onModeChange('FIXED')}
              className="h-4 w-4 text-amber focus:ring-amber/40"
            />
            고정 언어
          </label>

          {value === 'FIXED' ? (
            <select
              id="fixed_lang"
              value={fixedLang}
              onChange={(event) => onFixedLangChange(event.target.value)}
              className="min-w-40 rounded-xl border border-sand/40 bg-white/90 px-3 py-2 text-sm text-clay/90 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
            >
              {fixedLangOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
};

const AiConfigSection = () => {
  const [config, setConfig] = useState(initialConfig);

  const updatedAtText = useMemo(() => {
    if (!config.updated_at) return '아직 저장되지 않았습니다.';
    return config.updated_at;
  }, [config.updated_at]);

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <SectionCard
        title="AI 피드백 설정"
        description="tb_user_ai_feedback_setting 기준으로 AI 피드백 성향을 설정합니다."
      >
        <RadioGroup
          name="speech_tone_cd"
          label="말투 (speech_tone_cd)"
          value={config.speech_tone_cd}
          onChange={(value) => updateConfig('speech_tone_cd', value)}
          options={speechToneOptions}
        />

        <RadioGroup
          name="feedback_style_cd"
          label="피드백 스타일 (feedback_style_cd)"
          value={config.feedback_style_cd}
          onChange={(value) => updateConfig('feedback_style_cd', value)}
          options={feedbackStyleOptions}
        />

        <RadioGroup
          name="intensity_cd"
          label="강도 (intensity_cd)"
          value={config.intensity_cd}
          onChange={(value) => updateConfig('intensity_cd', value)}
          options={intensityOptions}
        />

        <RadioGroup
          name="question_cd"
          label="질문 포함 여부 (question_cd)"
          value={config.question_cd}
          onChange={(value) => updateConfig('question_cd', value)}
          options={questionOptions}
        />

        <RadioGroup
          name="length_cd"
          label="응답 길이 (length_cd)"
          value={config.length_cd}
          onChange={(value) => updateConfig('length_cd', value)}
          options={lengthOptions}
        />
      </SectionCard>

      <SectionCard
        title="AI 댓글 언어"
        description="lang_mode_cd가 FIXED일 때만 fixed_lang을 저장합니다."
      >
        <InlineLangModeSelector
          value={config.lang_mode_cd}
          fixedLang={config.fixed_lang}
          onModeChange={(value) => updateConfig('lang_mode_cd', value)}
          onFixedLangChange={(value) => updateConfig('fixed_lang', value)}
        />

        {config.lang_mode_cd !== 'FIXED' ? (
          <p className="text-xs text-clay/60">
            현재는 일기 언어 따라가기 모드입니다. 저장 시 fixed_lang 값은 무시됩니다.
          </p>
        ) : null}
      </SectionCard>

      <SectionCard title="설정 상태" description="created_at은 화면에 노출하지 않습니다.">
        <SettingSummary config={config} />
        <p className="text-xs text-clay/60">최근 수정 시각 (updated_at): {updatedAtText}</p>
      </SectionCard>
    </>
  );
};

export default AiConfigSection;
