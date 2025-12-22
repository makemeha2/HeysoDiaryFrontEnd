import { useCallback, useRef, useState } from 'react';
import AlertDialog from './AlertDialog.jsx';

export const useAlertDialog = () => {
  const resolverRef = useRef(null);

  const [alertState, setAlertState] = useState({
    open: false,
    title: '알림',
    description: '',
    actionLabel: '확인',
  });

  const alert = useCallback(({ title = '알림', description = '', actionLabel = '확인' } = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setAlertState({ open: true, title, description, actionLabel });
    });
  }, []);

  const close = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(); // ✅ 여기서 “재개”
  }, []);

  const Alert = useCallback(() => {
    return (
      <AlertDialog
        open={alertState.open}
        onOpenChange={(nextOpen) => {
          // 유저가 Close/ESC 등으로 닫을 때도 resolve 되게
          if (!nextOpen) close();
        }}
        title={alertState.title}
        description={alertState.description}
        actionLabel={alertState.actionLabel}
        onAction={close} // 확인 버튼/엔터로 닫힐 때도 resolve
      />
    );
  }, [alertState, close]);

  return { alert, Alert };
};
