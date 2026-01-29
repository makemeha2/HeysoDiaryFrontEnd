import React, { useMemo, useState } from 'react';
import { useCombobox } from 'downshift';

/** ===== 초성 필터 유틸 (라이브러리 없이) ===== */
const CHO = [
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
];

function isHangulSyllable(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

function getChoseongCharFromSyllable(syllable) {
  const code = syllable.charCodeAt(0);
  const index = Math.floor((code - 0xac00) / 588);
  return CHO[index] ?? '';
}

function toChoseongString(str) {
  let out = '';
  for (const ch of str) {
    if (isHangulSyllable(ch)) out += getChoseongCharFromSyllable(ch);
  }
  return out;
}

function isChoseongQuery(q) {
  return /^[ㄱ-ㅎ]+$/.test(q);
}

function defaultFilter(items, inputValue, maxItems = 10) {
  const q = (inputValue ?? '').trim();
  if (!q) return [];
  if (isChoseongQuery(q)) {
    return items.filter((it) => toChoseongString(it).includes(q)).slice(0, maxItems);
  }
  const qLower = q.toLowerCase();
  return items.filter((it) => it.toLowerCase().includes(qLower)).slice(0, maxItems);
}

/** ===== 재사용 컴포넌트 ===== */
export default function AutocompleteCommitInput({
  items, // string[]
  onCommit, // (value: string) => void
  placeholder = '입력…',
  maxItems = 10,
  exclude = [], // string[] : 추천에서 제외할 값(이미 선택된 태그 등)
  filterFn = defaultFilter,
  clearOnCommit = true,
  allowDuplicates = false,
  disabled = false,
  className = '',
}) {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const filteredItems = useMemo(() => {
    const candidates = exclude?.length ? items.filter((t) => !exclude.includes(t)) : items;
    return filterFn(candidates, value, maxItems);
  }, [items, exclude, value, filterFn, maxItems]);

  const {
    isOpen,
    highlightedIndex,
    getMenuProps,
    getInputProps,
    getItemProps,
    selectItem,
    setInputValue,
    closeMenu,
    openMenu,
  } = useCombobox({
    items: filteredItems,
    itemToString: (item) => item ?? '',
    onInputValueChange: ({ inputValue }) => {
      setValue(inputValue ?? '');
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;
      // 선택된 항목 commit
      commit(selectedItem);
    },
  });

  const commit = (raw) => {
    const v = (raw ?? '').trim();
    if (!v) return;

    // 중복 허용 여부(보통 태그는 중복 비추라 기본 false 추천)
    if (!allowDuplicates && exclude?.includes(v)) {
      // 이미 존재하면 입력만 정리
      if (clearOnCommit) {
        setValue('');
        setInputValue('');
      }
      closeMenu();
      return;
    }

    onCommit(v);

    if (clearOnCommit) {
      setValue('');
      setInputValue('');
    }
    closeMenu();
  };

  const commitTyped = () => commit(value);

  const inputProps = getInputProps({
    disabled,
    placeholder,
    onFocus: () => {
      if (value.trim()) openMenu();
    },
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: (e) => {
      setIsComposing(false);
      setValue(e.currentTarget.value ?? '');
    },
    onKeyDown: (e) => {
      if (disabled) return;
      if (isComposing || e.nativeEvent.isComposing) return;

      // Enter = (추천 선택 가능하면 Downshift) / 아니면 입력값 commit
      if (e.key === 'Enter') {
        if (!isOpen || highlightedIndex == null || !filteredItems[highlightedIndex]) {
          e.preventDefault();
          commitTyped();
        }
        return;
      }

      // 콤마로도 commit(태그 UX에 흔함)
      if (e.key === ',') {
        e.preventDefault();
        commitTyped();
        return;
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

      {/* 힌트(선택): 목록에 없으면 “Enter로 추가” 안내 */}
      {/* {value.trim() && (!filteredItems.length || !filteredItems.includes(value.trim())) && (
        <div className="mt-2 text-sm text-gray-500">
          Enter를 누르면 <span className="font-medium">“{value.trim()}”</span> 를 추가합니다.
        </div>
      )} */}
    </div>
  );
}
