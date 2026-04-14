// Runtime Profile
export type AiRuntimeProfile = {
  runtimeProfileId: number;
  profileKey: string;
  profileName: string;
  domainType: string;
  provider: string | null;
  model: string;
  modelName: string;
  temperature: number | null;
  topP: number | null;
  maxTokens: number | null;
  description: string | null;
  revisionNo: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type AiRuntimeProfileCreateRequest = {
  profileKey: string;
  profileName: string;
  domainType: string;
  provider?: string;
  model: string;
  temperature?: number | null;
  topP?: number | null;
  maxTokens?: number | null;
  description?: string;
};

export type AiRuntimeProfileUpdateRequest = Omit<AiRuntimeProfileCreateRequest, 'profileKey'> & {
  isActive?: number;
};

// Prompt Template
export type AiPromptTemplateListItem = {
  templateId: number;
  templateKey: string;
  templateName: string;
  domainType: string;
  featureKey: string | null;
  templateRole: string; // SYSTEM | USER | COMPONENT
  templateType: string; // ROOT | FRAGMENT
  revisionNo: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type AiPromptTemplateRelItem = {
  relId: number;
  parentTemplateId: number;
  childTemplateId: number;
  childTemplateKey: string;
  childTemplateName: string;
  mergeType: string; // APPEND | PREPEND
  sortSeq: number;
  isActive: number;
};

export type AiPromptTemplateDetail = AiPromptTemplateListItem & {
  content: string;
  variablesSchemaJson: string | null;
  description: string | null;
  relations: AiPromptTemplateRelItem[];
};

export type AiPromptTemplateCreateRequest = {
  templateKey: string;
  templateName: string;
  domainType: string;
  featureKey?: string;
  templateRole: string;
  templateType: string;
  content: string;
  description?: string;
};

export type AiPromptTemplateUpdateRequest = Omit<AiPromptTemplateCreateRequest, 'templateKey'> & {
  isActive?: number;
};

export type AiPromptTemplateRelCreateRequest = {
  childTemplateId: number;
  mergeType: string;
  sortSeq?: number;
};

// Binding
export type AiPromptBindingListItem = {
  bindingId: number;
  bindingName: string;
  domainType: string;
  featureKey: string;
  systemTemplateId: number;
  userTemplateId: number;
  runtimeProfileId: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type AiPromptBindingDetail = AiPromptBindingListItem & {
  systemTemplateName: string;
  userTemplateName: string;
  profileName: string;
  description: string | null;
};

export type AiPromptBindingCreateRequest = {
  bindingName: string;
  domainType: string;
  featureKey: string;
  systemTemplateId: number;
  userTemplateId: number;
  runtimeProfileId: number;
  description?: string;
};

export type AiPromptBindingUpdateRequest = Omit<AiPromptBindingCreateRequest, 'featureKey'> & {
  isActive?: number;
};

// Preview
export type AiTemplatePreviewRequest = {
  variables?: Record<string, string>;
};

export type AiTemplatePreviewResponse = {
  templateId: number;
  templateKey: string;
  renderedContent: string;
};
