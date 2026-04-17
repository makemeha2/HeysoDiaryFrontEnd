import { useState } from 'react';
import { previewTemplate } from '../api/aiTemplateApi';

type UseTemplatePreviewStateOptions = {
  selectedId: number | null;
};

export const useTemplatePreviewState = ({ selectedId }: UseTemplatePreviewStateOptions) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVars, setPreviewVars] = useState('{}');
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handlePreview = async () => {
    if (selectedId == null) return;
    setPreviewError(null);
    setPreviewResult(null);

    let variables: Record<string, string> = {};
    try {
      variables = JSON.parse(previewVars);
    } catch {
      setPreviewError('변수 JSON 형식이 올바르지 않습니다.');
      return;
    }

    const result = await previewTemplate(selectedId, { variables });
    if (!result.ok) {
      setPreviewError(result.errorMessage ?? '미리보기에 실패했습니다.');
      return;
    }
    setPreviewResult(result.data?.renderedContent ?? '');
  };

  return {
    previewDialog: {
      isPreviewOpen,
      setIsPreviewOpen,
      previewVars,
      setPreviewVars,
      previewResult,
      previewError,
      handlePreview,
    },
  };
};
