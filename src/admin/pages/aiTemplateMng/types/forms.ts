// UI 전용 폼 타입 — API 요청/응답 타입은 @admin/types/aiTemplate.ts 에 유지

export type TemplateForm = {
  templateKey: string;
  templateName: string;
  domainType: string;
  featureKey: string;
  templateRole: string;
  templateType: string;
  content: string;
  description: string;
  isActive: number;
};

export type RelForm = {
  childTemplateId: number | '';
  mergeType: string;
  sortSeq: string;
};

export type BindingForm = {
  bindingName: string;
  domainType: string;
  featureKey: string;
  systemTemplateId: string;
  userTemplateId: string;
  runtimeProfileId: string;
  description: string;
  isActive: number;
};

export type ProfileForm = {
  profileKey: string;
  profileName: string;
  domainType: string;
  provider: string;
  model: string;
  modelName: string;
  temperature: string;
  topP: string;
  maxTokens: string;
  description: string;
  isActive: number;
};
