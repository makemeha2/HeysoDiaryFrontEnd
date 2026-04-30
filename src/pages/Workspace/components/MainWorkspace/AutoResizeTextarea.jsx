import { useEffect, useRef } from 'react';

const AutoResizeTextarea = ({ value, className = '', ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 280)}px`;
  }, [value]);

  return <textarea ref={ref} value={value} className={className} {...props} />;
};

export default AutoResizeTextarea;

