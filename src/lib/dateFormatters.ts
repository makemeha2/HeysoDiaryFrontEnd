import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

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
