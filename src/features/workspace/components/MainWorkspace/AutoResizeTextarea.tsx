import { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

// 일기 본문 textarea — 입력 길이에 따라 높이 자동 조정
const AutoResizeTextarea = ({ value, onChange, placeholder }: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={12}
      className="w-full resize-none border-none bg-transparent font-sans text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 focus:outline-none"
      style={{ minHeight: '21rem' }}
    />
  );
};

export default AutoResizeTextarea;
