import type { TemplateForm, RelForm, BindingForm, ProfileForm } from '../types/forms';

export const initialTemplateForm: TemplateForm = {
  templateKey: '',
  templateName: '',
  domainType: '',
  featureKey: '',
  templateRole: 'SYSTEM',
  templateType: 'ROOT',
  content: '',
  description: '',
  isActive: 1,
};

export const initialRelForm: RelForm = {
  childTemplateId: '',
  mergeType: 'APPEND',
  sortSeq: '0',
};

export const initialBindingForm: BindingForm = {
  bindingName: '',
  domainType: '',
  featureKey: '',
  systemTemplateId: '',
  userTemplateId: '',
  runtimeProfileId: '',
  description: '',
  isActive: 1,
};

export const initialProfileForm: ProfileForm = {
  profileKey: '',
  profileName: '',
  domainType: '',
  provider: '',
  model: '',
  modelName: '',
  temperature: '',
  topP: '',
  maxTokens: '',
  description: '',
  isActive: 1,
};

export type ModelReferenceItem = {
  provider: string;
  model: string;
  feature: string;
  usage: string;
};

export const MODEL_REFERENCE: ModelReferenceItem[] = [
  { provider: 'OpenAI', model: 'GPT-4o', feature: '자연스러운 문장 + 속도 빠름, 멀티모달 강점', usage: '일기 생성, 실시간 대화형 글쓰기' },
  { provider: '', model: 'GPT-4o-mini', feature: '저비용 + 준수한 문장 품질', usage: '대량 일기 생성, 비용 최적화' },
  { provider: '', model: 'GPT-4 Turbo', feature: '구조적 글쓰기 + 안정적인 문장', usage: '일기 다듬기/교정 (Editing)' },
  { provider: 'Anthropic', model: 'Claude 3 Opus', feature: '감정 표현 + 서사형 글쓰기 매우 강함', usage: '감성 일기, 스토리형 글' },
  { provider: '', model: 'Claude 3.5 Sonnet', feature: '긴 문맥 유지 + 논리 + 자연스러움', usage: '일기 분석 + 개선' },
  { provider: '', model: 'Claude 4 Sonnet', feature: '긴 글 처리 + 일관성 유지 최고 수준', usage: '장기 일기 분석, 회고' },
];
