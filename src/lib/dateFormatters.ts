import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

export const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
export const weekDayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/**
 * 날짜/시간을 'YYYY-MM-DD HH:mm' 형태로 표시
 * @param value 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜/시간 문자열 또는 '-'
 */
export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return '-';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : '-';
};

/**
 * 날짜를 요일 포함 'YYYY-MM-DD (ddd)' 형태로 표시
 * @param value 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜 문자열 (예: '2026-05-04 (일)')
 */
export const formatDateWithWeekday = (value: string | Date | null | undefined): string => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD (ddd)') : '';
};

/**
 * 날짜만 'YYYY-MM-DD' 형태로 표시
 * @param value 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜 문자열 (예: '2026-05-04')
 */
export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
};

/**
 * 월 키를 'YYYY-MM' 형태로 표시
 * @param value 날짜 문자열 또는 Date 객체
 * @returns 월 문자열 (예: '2026-05')
 */
export const formatMonthKey = (value: string | Date | null | undefined): string => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM') : '';
};

/**
 * DatePicker 셀 계산용 'YYYY-MM-DD' 문자열을 로컬 Date로 변환
 * @param value YYYY-MM-DD 날짜 문자열
 * @returns 로컬 Date 객체
 */
export const parseYMD = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * DatePicker 셀 계산용 로컬 Date를 'YYYY-MM-DD' 문자열로 변환
 * @param date 로컬 Date 객체
 * @returns YYYY-MM-DD 날짜 문자열
 */
export const toYMD = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * 날짜를 '2026년 5월 4일 일요일' 형태로 표시
 * @param value YYYY-MM-DD 날짜 문자열
 * @returns 한국어 표시 날짜
 */
export const formatDisplayDate = (value: string): string => {
  const date = parseYMD(value);
  const [year, month, day] = value.split('-');
  return `${year}년 ${Number(month)}월 ${Number(day)}일 ${weekDayNames[date.getDay()]}`;
};
