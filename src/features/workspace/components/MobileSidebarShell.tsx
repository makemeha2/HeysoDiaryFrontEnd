import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

const MobileSidebarShell = ({ open, onClose, children }: Props) => {
  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={[
          'fixed z-50 h-full transition-transform duration-300 ease-in-out md:relative md:z-auto md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {open ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="사이드바 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        {children}
      </div>
    </>
  );
};

export default MobileSidebarShell;
