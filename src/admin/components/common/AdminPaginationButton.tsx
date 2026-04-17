import type { ReactNode } from 'react';

type AdminPaginationButtonProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

const AdminPaginationButton = ({
  active = false,
  disabled = false,
  onClick,
  children,
}: AdminPaginationButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded border px-2 py-1 text-xs sm:text-sm ${
      active ? 'border-clay bg-clay text-white' : 'border-sand text-clay'
    } ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-amber/10'}`}
  >
    {children}
  </button>
);

export default AdminPaginationButton;
