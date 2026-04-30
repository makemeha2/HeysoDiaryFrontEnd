import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import ConfirmModal from './ConfirmModal.jsx';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setRequest({ ...options, resolve });
    });
  }, []);

  const close = useCallback(
    (result) => {
      request?.resolve(result);
      setRequest(null);
    },
    [request],
  );

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmModal
        open={!!request}
        variant={request?.variant}
        title={request?.title}
        message={request?.message}
        confirmLabel={request?.confirmLabel}
        cancelLabel={request?.cancelLabel}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    </ConfirmContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => {
  const value = useContext(ConfirmContext);
  if (!value) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }
  return value;
};
