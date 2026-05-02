import { useEffect, useRef } from 'react';
import { Textarea, type TextareaProps } from '@/components/ui/textarea';

export default function AutoResizeTextarea(props: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = `${Math.max(420, ref.current.scrollHeight)}px`;
  }, [props.value]);

  return <Textarea ref={ref} {...props} />;
}
