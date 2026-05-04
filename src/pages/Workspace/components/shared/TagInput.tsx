import { useMemo, useState } from 'react';
import { useCombobox } from 'downshift';

const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
] as const;

export type TagInputFilter = (
  items: string[],
  inputValue: string,
  maxItems?: number,
) => string[];

export type TagInputProps = {
  items: string[];
  onCommit: (value: string) => void;
  placeholder?: string;
  maxItems?: number;
  exclude?: string[];
  filterFn?: TagInputFilter;
  clearOnCommit?: boolean;
  allowDuplicates?: boolean;
  disabled?: boolean;
  className?: string;
};

function isHangulSyllable(ch: string) {
  const code = ch.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

function getChoseongCharFromSyllable(syllable: string) {
  const code = syllable.charCodeAt(0);
  const index = Math.floor((code - 0xac00) / 588);
  return CHOSEONG[index] ?? '';
}

function toChoseongString(str: string) {
  let out = '';

  for (const ch of str) {
    if (isHangulSyllable(ch)) {
      out += getChoseongCharFromSyllable(ch);
    }
  }

  return out;
}

function isChoseongQuery(query: string) {
  return /^[ㄱ-ㅎ]+$/.test(query);
}

function normalizeText(str: unknown) {
  return String(str ?? '')
    .normalize('NFKC')
    .toLowerCase();
}

export const defaultTagInputFilter: TagInputFilter = (items, inputValue, maxItems = 10) => {
  const query = normalizeText(inputValue).trim();

  if (!query) {
    return [];
  }

  if (isChoseongQuery(query)) {
    return items.filter((item) => toChoseongString(item).includes(query)).slice(0, maxItems);
  }

  return items.filter((item) => normalizeText(item).includes(query)).slice(0, maxItems);
};

export default function AutocompleteCommitInput({
  items,
  onCommit,
  placeholder = '입력...',
  maxItems = 10,
  exclude = [],
  filterFn = defaultTagInputFilter,
  clearOnCommit = true,
  allowDuplicates = false,
  disabled = false,
  className = '',
}: TagInputProps) {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const filteredItems = useMemo(() => {
    const candidates = exclude.length ? items.filter((tag) => !exclude.includes(tag)) : items;
    return filterFn(candidates, value, maxItems);
  }, [items, exclude, value, filterFn, maxItems]);

  const commit = (raw: string | null | undefined) => {
    const nextValue = (raw ?? '').trim();

    if (!nextValue) {
      return;
    }

    if (!allowDuplicates && exclude.includes(nextValue)) {
      if (clearOnCommit) {
        setValue('');
        setInputValue('');
      }

      closeMenu();
      return;
    }

    onCommit(nextValue);

    if (clearOnCommit) {
      setValue('');
      setInputValue('');
    }

    closeMenu();
  };

  const {
    isOpen,
    highlightedIndex,
    getMenuProps,
    getInputProps,
    getItemProps,
    setInputValue,
    closeMenu,
    openMenu,
  } = useCombobox<string>({
    items: filteredItems,
    itemToString: (item) => item ?? '',
    onInputValueChange: ({ inputValue }) => {
      const nextValue = inputValue ?? '';
      setValue(nextValue);

      if (nextValue.trim()) {
        openMenu();
      } else {
        closeMenu();
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        commit(selectedItem);
      }
    },
  });

  const commitTyped = () => commit(value);

  const inputProps = getInputProps({
    disabled,
    placeholder,
    onFocus: () => {
      if (value.trim()) {
        openMenu();
      }
    },
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: (event) => {
      const nextValue = event.currentTarget.value ?? '';
      setIsComposing(false);
      setValue(nextValue);

      if (nextValue.trim()) {
        openMenu();
      } else {
        closeMenu();
      }
    },
    onKeyDown: (event) => {
      if (disabled) {
        return;
      }

      if (isComposing || event.nativeEvent.isComposing) {
        return;
      }

      if (event.key === 'Enter') {
        if (!isOpen || highlightedIndex == null || !filteredItems[highlightedIndex]) {
          event.preventDefault();
          commitTyped();
        }

        return;
      }

      if (event.key === ',') {
        event.preventDefault();
        commitTyped();
      }
    },
  });

  return (
    <div className={`relative ${className}`}>
      <input {...inputProps} className="w-full rounded-xl border px-3 py-2" />

      <ul
        {...getMenuProps()}
        className={`absolute z-50 mt-2 w-full rounded-xl border bg-white shadow ${
          isOpen && filteredItems.length ? '' : 'hidden'
        }`}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              key={`${item}-${index}`}
              {...getItemProps({ item, index })}
              className={`cursor-pointer px-3 py-2 ${
                highlightedIndex === index ? 'bg-gray-100' : ''
              }`}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
}
