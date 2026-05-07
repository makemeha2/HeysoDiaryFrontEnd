import { useState } from 'react';
import { Tag, X } from 'lucide-react';

type Props = {
  tags: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
};

// 태그 입력 — Enter/콤마 추가와 기존 태그 자동완성을 처리
const InlineTagInput = ({ tags, suggestions, onChange }: Props) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const normalizedInput = input.trim().replace(/^#/, '');
  const filteredSuggestions = suggestions
    .filter((item) => normalizedInput && !tags.includes(item) && item.toLowerCase().includes(normalizedInput.toLowerCase()))
    .slice(0, 5);

  const addTag = (tag: string) => {
    const next = tag.trim().replace(/^#/, '');
    if (next && !tags.some((item) => item.toLowerCase() === next.toLowerCase())) {
      onChange([...tags, next]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted px-2 py-0.5 text-xs text-foreground">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="transition-colors hover:text-destructive"
              aria-label={`태그 "${tag}" 제거`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ',') && input.trim()) {
              event.preventDefault();
              addTag(input);
            } else if (event.key === 'Backspace' && !input && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => input && setShowSuggestions(true)}
          placeholder={tags.length === 0 ? '태그 추가 (Enter로 구분)' : ''}
          className="min-w-[120px] flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 ? (
        <div className="absolute left-5 top-7 z-10 min-w-[140px] rounded-md border border-border bg-popover py-1 shadow-md">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={() => addTag(suggestion)}
              className="w-full px-3 py-1 text-left text-xs text-foreground transition-colors hover:bg-muted"
            >
              #{suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default InlineTagInput;
