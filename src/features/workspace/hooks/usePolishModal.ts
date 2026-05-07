import { useCallback, useState } from 'react';

type ApplyFn = (content: string) => void;

type PolishState = {
  open: boolean;
  source: string;
  diaryId: number | null;
  apply: ApplyFn;
};

const emptyPolishState: PolishState = {
  open: false,
  source: '',
  diaryId: null,
  apply: () => undefined,
};

export function usePolishModal() {
  const [polishState, setPolishState] = useState<PolishState>(emptyPolishState);

  const openPolish = useCallback(
    (source: string, apply: ApplyFn, diaryId: number | null) => {
      setPolishState({ open: true, source, diaryId, apply });
    },
    [],
  );

  const closePolish = useCallback(() => {
    setPolishState((prev) => ({ ...prev, open: false }));
  }, []);

  const applyPolished = useCallback(
    (content: string) => {
      polishState.apply(content);
      setPolishState((prev) => ({ ...prev, open: false }));
    },
    [polishState],
  );

  return { polishState, openPolish, closePolish, applyPolished };
}
