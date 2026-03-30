import type { StatusFilter } from '../types/comCd';

type Props = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

const StatusFilterSelect = ({ value, onChange }: Props) => {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      상태
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as StatusFilter)}
        className="rounded-md border border-slate-300 px-2 py-1"
      >
        <option value="ACTIVE">활성</option>
        <option value="INACTIVE">비활성</option>
        <option value="ALL">전체</option>
      </select>
    </label>
  );
};

export default StatusFilterSelect;
